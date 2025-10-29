package tsundoku

import (
	"time"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
)

// Status represents the lifecycle state of a tsundoku item.
type Status string

const (
	StatusStacked Status = "stacked"
	StatusReading Status = "reading"
	StatusDone    Status = "done"
)

// Valid reports whether the status is one of the known values.
func (s Status) Valid() bool {
	switch s {
	case StatusStacked, StatusReading, StatusDone:
		return true
	default:
		return false
	}
}

// ParseStatus converts a string into a Status value.
func ParseStatus(raw string) (Status, bool) {
	switch Status(raw) {
	case StatusStacked, StatusReading, StatusDone:
		return Status(raw), true
	default:
		return "", false
	}
}

// Item represents one tsundoku entry.
type Item struct {
	ID          string     `json:"ID"`
	Book        books.Book `json:"Book"`
	Note        string     `json:"Note,omitempty"`
	Priority    *int       `json:"Priority,omitempty"`
	Status      Status     `json:"Status"`
	AddedAt     time.Time  `json:"AddedAt"`
	UpdatedAt   time.Time  `json:"UpdatedAt"`
	StartedAt   *time.Time `json:"StartedAt,omitempty"`
	CompletedAt *time.Time `json:"CompletedAt,omitempty"`
}

// AddParams is the input for adding a new tsundoku item.
type AddParams struct {
	Book     books.Book
	Note     string
	Priority *int
}
