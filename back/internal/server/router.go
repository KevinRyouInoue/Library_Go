package server

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/handler"
)

func NewRouter(searchBooksHandler http.HandlerFunc, tsundokuHandler *handler.TsundokuHandler) *chi.Mux {
	r := chi.NewRouter()

	// Health Check
	r.Get("/health", handler.HealthCheckHandler)

	// Technical Books Search
	r.Get("/api/technical-books", searchBooksHandler)

	// Tsundoku
	r.Route("/api/tsundoku", tsundokuHandler.Register)

	return r
}
