package favorites

import "errors"

var (
	// ErrNotFound is returned when a favorite item does not exist.
	ErrNotFound = errors.New("favorite not found")

	// ErrAlreadyExists is returned when attempting to add a duplicate favorite.
	ErrAlreadyExists = errors.New("favorite already exists")

	// ErrInvalidInput is returned when required fields are missing.
	ErrInvalidInput = errors.New("invalid input")
)
