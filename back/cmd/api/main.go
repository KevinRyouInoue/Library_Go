package main

import (
	"log"
	"net/http"
	"os"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/handler"
	favoritesfs "github.com/recursion-goapi-project/technical-books-search/back/internal/infra/favorites/filestore"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/infra/googlebooks"
	tsundokofs "github.com/recursion-goapi-project/technical-books-search/back/internal/infra/tsundoku/filestore"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/server"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/favorites"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/tsundoku"
)

func main() {
	apiKey := os.Getenv("BOOKS_API_KEY")
	baseURL := os.Getenv("BOOKS_BASE_URL")
	if baseURL == "" {
		baseURL = "https://www.googleapis.com/books/v1/volumes"
	}

	client := googlebooks.NewClient(baseURL, apiKey)
	bookService := books.NewService(client)
	searchHandler := handler.NewSearchBooksHandler(bookService)

	tsundokuRepo := buildTsundokuRepository()
	tsundokuService := tsundoku.NewService(tsundokuRepo)
	tsundokuHandler := handler.NewTsundokuHandler(tsundokuService)

	favoritesRepo := buildFavoritesRepository()
	favoritesService := favorites.NewService(favoritesRepo)
	favoritesHandler := handler.NewFavoritesHandler(favoritesService)

	r := server.NewRouter(searchHandler, tsundokuHandler, favoritesHandler)
	log.Println("Server is running on port 8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("server exited: %v", err)
	}
}

func buildTsundokuRepository() tsundoku.Repository {
	switch backend := os.Getenv("STORAGE_BACKEND"); backend {
	case "", "file":
		path := os.Getenv("TSUNDOKU_STORE_PATH")
		if path == "" {
			path = "data/tsundoku.json"
		}
		repo, err := tsundokofs.New(path)
		if err != nil {
			log.Fatalf("failed to initialize tsundoku file repository: %v", err)
		}
		return repo
	default:
		log.Fatalf("unsupported STORAGE_BACKEND: %s", backend)
	}
	return nil
}

func buildFavoritesRepository() favorites.Repository {
	switch backend := os.Getenv("STORAGE_BACKEND"); backend {
	case "", "file":
		path := os.Getenv("FAVORITES_STORE_PATH")
		if path == "" {
			path = "data/favorites.json"
		}
		repo, err := favoritesfs.New(path)
		if err != nil {
			log.Fatalf("failed to initialize favorites file repository: %v", err)
		}
		return repo
	default:
		log.Fatalf("unsupported STORAGE_BACKEND: %s", backend)
	}
	return nil
}
