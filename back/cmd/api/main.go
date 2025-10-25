package main

import (
	"log"
	"net/http"
	"os"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/handler"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/infra/googlebooks"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
	"github.com/recursion-goapi-project/technical-books-search/back/internal/server"
)

func main() {
	apiKey := os.Getenv("BOOKS_API_KEY")
	baseURL := os.Getenv("BOOKS_BASE_URL")

	client := googlebooks.NewClient(baseURL, apiKey)
	bookService := books.NewService(client)
	searchHandler := handler.NewSearchBooksHandler(bookService)

	r := server.NewRouter(searchHandler)
	log.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", r)
}
