package favorites

import (
	"time"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
)

// Item represents a favorite book entry.
type Item struct {
	ID      string     `json:"ID"`
	Book    books.Book `json:"Book"`
	AddedAt time.Time  `json:"AddedAt"`
}
