package filestore

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/favorites"
)

// Repository persists favorite items on the local filesystem as JSON.
type Repository struct {
	path string
	mu   sync.Mutex
}

type store struct {
	Items map[string]favorites.Item `json:"items"`
}

// New creates a file-backed repository for favorites.
func New(path string) (*Repository, error) {
	if path == "" {
		return nil, fmt.Errorf("filestore path is required")
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		if err := os.WriteFile(path, []byte(`{"items":{}}`), 0o644); err != nil {
			return nil, err
		}
	}
	return &Repository{path: path}, nil
}

func (r *Repository) Get(_ context.Context, bookID string) (favorites.Item, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	st, err := r.load()
	if err != nil {
		return favorites.Item{}, err
	}
	item, ok := st.Items[bookID]
	if !ok {
		return favorites.Item{}, favorites.ErrNotFound
	}
	return item, nil
}

func (r *Repository) Upsert(_ context.Context, item favorites.Item) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	st, err := r.load()
	if err != nil {
		return err
	}
	if st.Items == nil {
		st.Items = make(map[string]favorites.Item)
	}
	st.Items[item.ID] = item
	return r.persist(st)
}

func (r *Repository) Delete(_ context.Context, bookID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	st, err := r.load()
	if err != nil {
		return err
	}
	delete(st.Items, bookID)
	return r.persist(st)
}

func (r *Repository) List(_ context.Context) ([]favorites.Item, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	st, err := r.load()
	if err != nil {
		return nil, err
	}

	var items []favorites.Item
	for _, it := range st.Items {
		items = append(items, it)
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].AddedAt.Equal(items[j].AddedAt) {
			return items[i].ID < items[j].ID
		}
		return items[i].AddedAt.Before(items[j].AddedAt)
	})
	return items, nil
}

func (r *Repository) load() (store, error) {
	bytes, err := os.ReadFile(r.path)
	if err != nil {
		return store{}, err
	}
	if len(bytes) == 0 {
		return store{Items: make(map[string]favorites.Item)}, nil
	}
	var st store
	if err := json.Unmarshal(bytes, &st); err != nil {
		return store{}, err
	}
	if st.Items == nil {
		st.Items = make(map[string]favorites.Item)
	}
	return st, nil
}

func (r *Repository) persist(st store) error {
	tmp, err := os.CreateTemp(filepath.Dir(r.path), "favorites-*.json")
	if err != nil {
		return err
	}
	enc := json.NewEncoder(tmp)
	enc.SetIndent("", "  ")
	if err := enc.Encode(st); err != nil {
		tmp.Close()
		_ = os.Remove(tmp.Name())
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmp.Name(), r.path)
}

var _ favorites.Repository = (*Repository)(nil)
