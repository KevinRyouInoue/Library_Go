package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/tsundoku"
)

// TsundokuHandler exposes HTTP handlers for tsundoku features.
type TsundokuHandler struct {
	service *tsundoku.Service
}

// NewTsundokuHandler creates a handler set bound to the service.
func NewTsundokuHandler(service *tsundoku.Service) *TsundokuHandler {
	return &TsundokuHandler{service: service}
}

// Register wires the handler to the provided router.
func (h *TsundokuHandler) Register(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Add)
	r.Post("/pickup", h.Pickup)
	r.Post("/{id}/pickup", h.PickSpecific)
	r.Post("/{id}/status", h.UpdateStatus)
	r.Post("/{id}/restack", h.Restack)
}

type addRequest struct {
	Book     books.Book `json:"Book"`
	Note     string     `json:"Note"`
	Priority *int       `json:"Priority"`
}

type updateStatusRequest struct {
	Status string `json:"Status"`
}

// Add stacks a new book.
func (h *TsundokuHandler) Add(w http.ResponseWriter, r *http.Request) {
	var req addRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	item, err := h.service.Add(r.Context(), tsundoku.AddParams{
		Book:     req.Book,
		Note:     strings.TrimSpace(req.Note),
		Priority: req.Priority,
	})
	if err != nil {
		switch {
		case errors.Is(err, tsundoku.ErrInvalidInput), errors.Is(err, tsundoku.ErrInvalidStatus):
			http.Error(w, err.Error(), http.StatusBadRequest)
		case errors.Is(err, tsundoku.ErrAlreadyExists):
			http.Error(w, err.Error(), http.StatusConflict)
		default:
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

// List returns items filtered by optional status.
func (h *TsundokuHandler) List(w http.ResponseWriter, r *http.Request) {
	var statusPtr *tsundoku.Status
	if raw := strings.TrimSpace(r.URL.Query().Get("status")); raw != "" {
		status, ok := tsundoku.ParseStatus(raw)
		if !ok {
			http.Error(w, "invalid status", http.StatusBadRequest)
			return
		}
		statusPtr = &status
	}

	items, err := h.service.List(r.Context(), statusPtr)
	if err != nil {
		if errors.Is(err, tsundoku.ErrInvalidStatus) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

// Pickup dequeues the oldest stacked item and marks it reading.
func (h *TsundokuHandler) Pickup(w http.ResponseWriter, r *http.Request) {
	item, err := h.service.Pickup(r.Context())
	if err != nil {
		switch {
		case errors.Is(err, tsundoku.ErrNoStackedItems):
			http.Error(w, err.Error(), http.StatusNotFound)
		case errors.Is(err, tsundoku.ErrReadingInProgress):
			http.Error(w, err.Error(), http.StatusConflict)
		default:
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}
	writeJSON(w, http.StatusOK, item)
}

// PickSpecific promotes a chosen stacked item into reading state.
func (h *TsundokuHandler) PickSpecific(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "id required", http.StatusBadRequest)
		return
	}

	item, err := h.service.StartReading(r.Context(), id)
	if err != nil {
		switch {
		case errors.Is(err, tsundoku.ErrNotFound):
			http.Error(w, err.Error(), http.StatusNotFound)
		case errors.Is(err, tsundoku.ErrInvalidStatus):
			http.Error(w, "only stacked items can be picked", http.StatusBadRequest)
		case errors.Is(err, tsundoku.ErrReadingInProgress):
			http.Error(w, err.Error(), http.StatusConflict)
		default:
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}
	writeJSON(w, http.StatusOK, item)
}

// UpdateStatus updates the status of a specific item.
func (h *TsundokuHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "id required", http.StatusBadRequest)
		return
	}
	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	status, ok := tsundoku.ParseStatus(req.Status)
	if !ok {
		http.Error(w, "invalid status", http.StatusBadRequest)
		return
	}

	item, err := h.service.UpdateStatus(r.Context(), id, status)
	if err != nil {
		switch {
		case errors.Is(err, tsundoku.ErrNotFound):
			http.Error(w, err.Error(), http.StatusNotFound)
		case errors.Is(err, tsundoku.ErrInvalidStatus):
			http.Error(w, err.Error(), http.StatusBadRequest)
		default:
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}
	writeJSON(w, http.StatusOK, item)
}

// Restack moves a completed item back to the stacked queue.
func (h *TsundokuHandler) Restack(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "id required", http.StatusBadRequest)
		return
	}
	item, err := h.service.Restack(r.Context(), id)
	if err != nil {
		switch {
		case errors.Is(err, tsundoku.ErrNotFound):
			http.Error(w, err.Error(), http.StatusNotFound)
		case errors.Is(err, tsundoku.ErrInvalidStatus):
			http.Error(w, "only completed items can be restacked", http.StatusBadRequest)
		default:
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
