package tsundoku

import (
	"context"
	"errors"
	"time"
)

// Service contains the application logic for tsundoku operations.
type Service struct {
	repo Repository
	now  func() time.Time
}

// NewService creates a new tsundoku service.
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

// Add creates or reactivates a tsundoku item.
func (s *Service) Add(ctx context.Context, params AddParams) (Item, error) {
	if params.Book.ID == "" {
		return Item{}, ErrInvalidInput
	}
	now := s.now().UTC()

	existing, err := s.repo.Get(ctx, params.Book.ID)
	switch {
	case err == nil:
		if existing.Status != StatusDone {
			return Item{}, ErrAlreadyExists
		}
	case errors.Is(err, ErrNotFound):
		// OK
	default:
		return Item{}, err
	}

	item := Item{
		ID:        params.Book.ID,
		Book:      params.Book,
		Note:      params.Note,
		Priority:  params.Priority,
		Status:    StatusStacked,
		AddedAt:   now,
		UpdatedAt: now,
	}

	if err := s.repo.Upsert(ctx, item); err != nil {
		return Item{}, err
	}
	return item, nil
}

// List retrieves items, optionally filtered by status.
func (s *Service) List(ctx context.Context, status *Status) ([]Item, error) {
	if status != nil && !status.Valid() {
		return nil, ErrInvalidStatus
	}
	return s.repo.List(ctx, status)
}

// Pickup chooses the oldest stacked item and marks it as reading.
func (s *Service) Pickup(ctx context.Context) (Item, error) {
	readingStatus := StatusReading
	readings, err := s.repo.List(ctx, &readingStatus)
	if err != nil {
		return Item{}, err
	}
	if len(readings) > 0 {
		return Item{}, ErrReadingInProgress
	}

	item, err := s.repo.FindOldestStacked(ctx)
	if err != nil {
		return Item{}, err
	}
	now := s.now().UTC()
	item.Status = StatusReading
	item.UpdatedAt = now
	if item.StartedAt == nil {
		item.StartedAt = &now
	}
	if err := s.repo.Upsert(ctx, item); err != nil {
		return Item{}, err
	}
	return item, nil
}

// StartReading promotes a specific stacked item into reading state.
func (s *Service) StartReading(ctx context.Context, id string) (Item, error) {
	readingStatus := StatusReading
	readings, err := s.repo.List(ctx, &readingStatus)
	if err != nil {
		return Item{}, err
	}
	if len(readings) > 0 {
		return Item{}, ErrReadingInProgress
	}

	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return Item{}, err
	}
	if item.Status != StatusStacked {
		return Item{}, ErrInvalidStatus
	}

	now := s.now().UTC()
	item.Status = StatusReading
	item.UpdatedAt = now
	if item.StartedAt == nil {
		item.StartedAt = &now
	}

	if err := s.repo.Upsert(ctx, item); err != nil {
		return Item{}, err
	}
	return item, nil
}

// UpdateStatus updates the status of a specific item.
func (s *Service) UpdateStatus(ctx context.Context, id string, status Status) (Item, error) {
	if !status.Valid() {
		return Item{}, ErrInvalidStatus
	}
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return Item{}, err
	}

	now := s.now().UTC()
	item.Status = status
	item.UpdatedAt = now

	switch status {
	case StatusStacked:
		item.StartedAt = nil
		item.CompletedAt = nil
	case StatusReading:
		if item.StartedAt == nil {
			item.StartedAt = &now
		}
	case StatusDone:
		item.CompletedAt = &now
	}

	if err := s.repo.Upsert(ctx, item); err != nil {
		return Item{}, err
	}
	return item, nil
}

// Restack moves a completed item back to the stacked queue with a fresh timestamp.
func (s *Service) Restack(ctx context.Context, id string) (Item, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return Item{}, err
	}
	if item.Status != StatusDone {
		return Item{}, ErrInvalidStatus
	}

	now := s.now().UTC()
	if newest, err := s.repo.FindNewestStacked(ctx); err == nil {
		candidate := newest.AddedAt.Add(1 * time.Millisecond)
		if !now.After(candidate) {
			now = candidate
		}
	} else if !errors.Is(err, ErrNoStackedItems) {
		return Item{}, err
	}
	item.Status = StatusStacked
	item.AddedAt = now
	item.UpdatedAt = now
	item.StartedAt = nil
	item.CompletedAt = nil

	if err := s.repo.Upsert(ctx, item); err != nil {
		return Item{}, err
	}
	return item, nil
}
