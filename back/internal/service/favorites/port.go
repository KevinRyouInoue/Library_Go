package favorites

import "context"

// Repository defines the data layer for favorite operations.
type Repository interface {
	// Get retrieves a favorite by book ID.
	Get(ctx context.Context, bookID string) (Item, error)

	// Upsert creates or updates a favorite item.
	Upsert(ctx context.Context, item Item) error

	// Delete removes a favorite by book ID.
	Delete(ctx context.Context, bookID string) error

	// List returns all favorite items.
	List(ctx context.Context) ([]Item, error)
}
