package handler

import (
    "encoding/json"
    "net/http"
    "strconv"

    "github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
)

func NewSearchBooksHandler(service *books.Service) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        q := r.URL.Query()
        start, _ := strconv.Atoi(q.Get("startIndex"))
        max, _ := strconv.Atoi(q.Get("maxResults"))
        params := books.SearchParams{
            Genre:      q.Get("genre"),
            Query:      q.Get("q"),
            StartIndex: start,
            MaxResults: max,
            OrderBy:    q.Get("orderBy"),
            Lang:       q.Get("lang"),
        }

        res, err := service.Search(r.Context(), params)
        if err != nil {
            http.Error(w, "upstream error", http.StatusBadGateway)
            return
        }
        w.Header().Set("Content-Type", "application/json")
        _ = json.NewEncoder(w).Encode(res)
    }
}


