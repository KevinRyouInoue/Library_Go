package main

import (
	"log"
	"net/http"
	"os"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/handler"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/infra/googlebooks"
	tsundokofs "github.com/recursion-goapi-project/technical-books-search/back/internal/infra/tsundoku/filestore"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/server"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/tsundoku"
)

func main() {
	apiKey := os.Getenv("BOOKS_API_KEY")
	baseURL := os.Getenv("BOOKS_BASE_URL")

	client := googlebooks.NewClient(baseURL, apiKey)
	bookService := books.NewService(client)
	searchHandler := handler.NewSearchBooksHandler(bookService)

	tsundokuRepo := buildTsundokuRepository()
	tsundokuService := tsundoku.NewService(tsundokuRepo)
	tsundokuHandler := handler.NewTsundokuHandler(tsundokuService)

	r := server.NewRouter(searchHandler, tsundokuHandler)
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
