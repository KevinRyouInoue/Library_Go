package handler

import (
    "encoding/json"
    "net/http"
    "strconv"
    "strings"

    "github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
)

func NewSearchBooksHandler(service *books.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		// page/limit を優先し、startIndex/maxResults が明示されていればそれを尊重
		page, _ := strconv.Atoi(q.Get("page"))
		limit, _ := strconv.Atoi(q.Get("limit"))
		if page <= 0 {
			page = 0 // 未指定を示す
		}
		if limit <= 0 {
			limit = 0
		}

		start, _ := strconv.Atoi(q.Get("startIndex"))
		max, _ := strconv.Atoi(q.Get("maxResults"))
		if page > 0 && limit > 0 {
			start = (page - 1) * limit
			max = limit
		}
		if max > 40 {
			max = 40
		}
        // 最小バリデーション: q が空なら 400
        if strings.TrimSpace(q.Get("q")) == "" {
            http.Error(w, "q required", http.StatusBadRequest)
            return
        }

        params := books.SearchParams{
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
