package main

import (
	"log"
	"net/http"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/server"
)

func main() {
	r := server.NewRouter()
	log.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", r)
}
