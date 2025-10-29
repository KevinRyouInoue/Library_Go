package tsundoku

import "errors"

var (
	ErrAlreadyExists  = errors.New("tsundoku item already exists")
	ErrNotFound       = errors.New("tsundoku item not found")
	ErrNoStackedItems = errors.New("no stacked items available")
	ErrInvalidStatus  = errors.New("invalid tsundoku status")
	ErrInvalidInput   = errors.New("invalid tsundoku input")
	ErrReadingInProgress = errors.New("reading item already in progress")
)
