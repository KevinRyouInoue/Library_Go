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

	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/tsundoku"
)

// Repository persists tsundoku items on the local filesystem as JSON.
type Repository struct {
	path string
	mu   sync.Mutex
}

type store struct {
	Items map[string]tsundoku.Item `json:"items"`
}

// New creates a file-backed repository.
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

func (r *Repository) Get(_ context.Context, id string) (tsundoku.Item, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	st, err := r.load()
	if err != nil {
		return tsundoku.Item{}, err
	}
	item, ok := st.Items[id]
	if !ok {
		return tsundoku.Item{}, tsundoku.ErrNotFound
	}
	return item, nil
}

func (r *Repository) Upsert(_ context.Context, item tsundoku.Item) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	st, err := r.load()
	if err != nil {
		return err
	}
	if st.Items == nil {
		st.Items = make(map[string]tsundoku.Item)
	}
	st.Items[item.ID] = item
	return r.persist(st)
}

func (r *Repository) List(_ context.Context, status *tsundoku.Status) ([]tsundoku.Item, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	st, err := r.load()
	if err != nil {
		return nil, err
	}

	var items []tsundoku.Item
	for _, it := range st.Items {
		if status != nil && it.Status != *status {
			continue
		}
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

func (r *Repository) FindOldestStacked(_ context.Context) (tsundoku.Item, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	st, err := r.load()
	if err != nil {
		return tsundoku.Item{}, err
	}

	var (
		found bool
		best  tsundoku.Item
	)
	for _, it := range st.Items {
		if it.Status != tsundoku.StatusStacked {
			continue
		}
		if !found || it.AddedAt.Before(best.AddedAt) || (it.AddedAt.Equal(best.AddedAt) && it.ID < best.ID) {
			best = it
			found = true
		}
	}
	if !found {
		return tsundoku.Item{}, tsundoku.ErrNoStackedItems
	}
	return best, nil
}

func (r *Repository) FindNewestStacked(_ context.Context) (tsundoku.Item, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	st, err := r.load()
	if err != nil {
		return tsundoku.Item{}, err
	}

	var (
		found  bool
		latest tsundoku.Item
	)
	for _, it := range st.Items {
		if it.Status != tsundoku.StatusStacked {
			continue
		}
		if !found || it.AddedAt.After(latest.AddedAt) || (it.AddedAt.Equal(latest.AddedAt) && it.ID > latest.ID) {
			latest = it
			found = true
		}
	}
	if !found {
		return tsundoku.Item{}, tsundoku.ErrNoStackedItems
	}
	return latest, nil
}

func (r *Repository) load() (store, error) {
	bytes, err := os.ReadFile(r.path)
	if err != nil {
		return store{}, err
	}
	if len(bytes) == 0 {
		return store{Items: make(map[string]tsundoku.Item)}, nil
	}
	var st store
	if err := json.Unmarshal(bytes, &st); err != nil {
		return store{}, err
	}
	if st.Items == nil {
		st.Items = make(map[string]tsundoku.Item)
	}
	return st, nil
}

func (r *Repository) persist(st store) error {
	tmp, err := os.CreateTemp(filepath.Dir(r.path), "tsundoku-*.json")
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

var _ tsundoku.Repository = (*Repository)(nil)
