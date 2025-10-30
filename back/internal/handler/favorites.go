package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/favorites"
)

// FavoritesHandler exposes HTTP handlers for favorites features.
type FavoritesHandler struct {
	service *favorites.Service
}

// NewFavoritesHandler creates a handler set bound to the service.
func NewFavoritesHandler(service *favorites.Service) *FavoritesHandler {
	return &FavoritesHandler{service: service}
}

// Register wires the handler to the provided router.
func (h *FavoritesHandler) Register(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Add)
	r.Delete("/{id}", h.Delete)
}

type addFavoriteRequest struct {
	Book books.Book `json:"Book"`
}

// Add creates a new favorite item.
func (h *FavoritesHandler) Add(w http.ResponseWriter, r *http.Request) {
	var req addFavoriteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	item, err := h.service.Add(r.Context(), req.Book)
	if err != nil {
		switch {
		case errors.Is(err, favorites.ErrInvalidInput):
			http.Error(w, err.Error(), http.StatusBadRequest)
		case errors.Is(err, favorites.ErrAlreadyExists):
			http.Error(w, err.Error(), http.StatusConflict)
		default:
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

// List returns all favorite items.
func (h *FavoritesHandler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.List(r.Context())
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

// Delete removes a favorite by book ID.
func (h *FavoritesHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Book ID is required", http.StatusBadRequest)
		return
	}

	err := h.service.Delete(r.Context(), id)
	if err != nil {
		switch {
		case errors.Is(err, favorites.ErrNotFound):
			http.Error(w, err.Error(), http.StatusNotFound)
		case errors.Is(err, favorites.ErrInvalidInput):
			http.Error(w, err.Error(), http.StatusBadRequest)
		default:
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
