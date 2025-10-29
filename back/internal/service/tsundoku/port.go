package tsundoku

import "context"

// Repository abstracts the persistence layer for tsundoku items.
type Repository interface {
	Get(ctx context.Context, id string) (Item, error)
	Upsert(ctx context.Context, item Item) error
	List(ctx context.Context, status *Status) ([]Item, error)
	FindOldestStacked(ctx context.Context) (Item, error)
	FindNewestStacked(ctx context.Context) (Item, error)
}
