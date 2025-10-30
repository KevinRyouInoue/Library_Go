package server

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/handler"
)

func NewRouter(searchBooksHandler http.HandlerFunc, tsundokuHandler *handler.TsundokuHandler, favoritesHandler *handler.FavoritesHandler) *chi.Mux {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	// Health Check
	r.Get("/health", handler.HealthCheckHandler)

	// Technical Books Search
	r.Get("/api/technical-books", searchBooksHandler)

	// Tsundoku
	r.Route("/api/tsundoku", tsundokuHandler.Register)

	// Favorites
	r.Route("/api/favorites", favoritesHandler.Register)

	return r
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
