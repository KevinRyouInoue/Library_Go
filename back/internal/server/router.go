package server

import (
	"github.com/go-chi/chi/v5"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/handler"
	"net/http"
)

func NewRouter(searchBooksHandler http.HandlerFunc) *chi.Mux {
	r := chi.NewRouter()

	// Health Check
	r.Get("/health", handler.HealthCheckHandler)

	// Technical Books Search
	r.Get("/api/technical-books", searchBooksHandler)

	return r
}
