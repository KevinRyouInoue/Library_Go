package server

import (
	"github.com/go-chi/chi/v5"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/handler"
)

func NewRouter() *chi.Mux {
	r := chi.NewRouter()

	// Health Check
	r.Get("/health", handler.HealthCheckHandler)

	return r
}
