package server

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/handler"
)

// NewRouter creates and configures the main HTTP router with all endpoints and middleware.
func NewRouter(searchBooksHandler http.HandlerFunc, tsundokuHandler *handler.TsundokuHandler, favoritesHandler *handler.FavoritesHandler) *chi.Mux {
	r := chi.NewRouter()

	// Apply middleware
	r.Use(middleware.Recoverer) // Recover from panics
	r.Use(corsMiddleware)       // Enable CORS for frontend

	// Health check endpoint
	r.Get("/health", handler.HealthCheckHandler)

	// API routes
	r.Get("/api/technical-books", searchBooksHandler)
	r.Route("/api/tsundoku", tsundokuHandler.Register)
	r.Route("/api/favorites", favoritesHandler.Register)

	return r
}

// corsMiddleware enables Cross-Origin Resource Sharing for all routes.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
