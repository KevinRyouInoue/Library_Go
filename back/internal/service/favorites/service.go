package favorites

import (
	"context"
	"errors"
	"time"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
)

// Service contains the application logic for favorites operations.
type Service struct {
	repo Repository
	now  func() time.Time
}

// NewService creates a new favorites service.
func NewService(repo Repository) *Service {
	return &Service{
		repo: repo,
		now:  time.Now,
	}
}

// WithNow overrides the now function (primarily for testing).
func (s *Service) WithNow(fn func() time.Time) {
	if fn != nil {
		s.now = fn
	}
}

// Add creates a new favorite item.
func (s *Service) Add(ctx context.Context, book books.Book) (Item, error) {
	if book.ID == "" {
		return Item{}, ErrInvalidInput
	}

	// Check if already exists
	_, err := s.repo.Get(ctx, book.ID)
	if err == nil {
		return Item{}, ErrAlreadyExists
	}
	if !errors.Is(err, ErrNotFound) {
		return Item{}, err
	}

	now := s.now().UTC()
	item := Item{
		ID:      book.ID,
		Book:    book,
		AddedAt: now,
	}

	if err := s.repo.Upsert(ctx, item); err != nil {
		return Item{}, err
	}
	return item, nil
}

// List retrieves all favorite items.
func (s *Service) List(ctx context.Context) ([]Item, error) {
	return s.repo.List(ctx)
}

// Delete removes a favorite by book ID.
func (s *Service) Delete(ctx context.Context, bookID string) error {
	if bookID == "" {
		return ErrInvalidInput
	}

	// Check if exists
	_, err := s.repo.Get(ctx, bookID)
	if err != nil {
		return err
	}

	return s.repo.Delete(ctx, bookID)
}
