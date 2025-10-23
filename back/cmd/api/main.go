package main

import (
	"log"
	"net/http"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/handler"
)

func main() {
	http.HandleFunc("/health", handler.HealthCheckHandler)
	log.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", nil)
}
