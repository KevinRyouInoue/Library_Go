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
		// Google Books API は実質 10 件固定のため、maxResults は常に 10 を使用する。
		const pageSize = 10

		page := 1
		if v := q.Get("page"); v != "" {
			if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 {
				page = parsed
			}
		}

		start := 0
		if v := q.Get("startIndex"); v != "" {
			if parsed, err := strconv.Atoi(v); err == nil && parsed >= 0 {
				start = parsed
			}
		} else {
			start = (page - 1) * pageSize
		}
		// 最小バリデーション: q が空なら 400
		if strings.TrimSpace(q.Get("q")) == "" {
			http.Error(w, "q required", http.StatusBadRequest)
			return
		}

		params := books.SearchParams{
			Query:      q.Get("q"),
			StartIndex: start,
			MaxResults: pageSize,
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
