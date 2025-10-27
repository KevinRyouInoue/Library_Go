package googlebooks

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/recursion-goapi-project/technical-books-search/back/internal/service/books"
)

// Google Books API へのクライアント
type Client struct {
	baseURL string
	apiKey  string
	http    *http.Client
}

func NewClient(baseURL, apiKey string) *Client {
	if baseURL == "" {
		baseURL = "https://www.googleapis.com/books/v1/volumes"
	}
	return &Client{
		baseURL: baseURL,
		apiKey:  apiKey,
		http:    &http.Client{Timeout: 5 * time.Second},
	}
}

// Google Books を検索する
func (c *Client) Search(ctx context.Context, p books.SearchParams) (books.SearchResult, error) {
	q := buildQuery(p)
	params := url.Values{}
	params.Set("q", q)
	params.Set("printType", "books")
	if p.Lang != "" && p.Lang != "all" {
		params.Set("langRestrict", p.Lang)
	}
	if p.OrderBy == "newest" {
		params.Set("orderBy", "newest")
	} else {
		params.Set("orderBy", "relevance")
	}
	// 明示的に startIndex を常に送る（0 の場合も）
	params.Set("startIndex", fmt.Sprintf("%d", p.StartIndex))
	max := p.MaxResults
	if max <= 0 {
		max = 10
	}
	if max > 10 {
		max = 10
	}
	params.Set("maxResults", fmt.Sprintf("%d", max))
	if c.apiKey != "" {
		params.Set("key", c.apiKey)
	}
	// fields を指定すると maxResults が正しく反映されない場合があるため未指定とする

	endpoint := c.baseURL + "?" + params.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return books.SearchResult{}, err
	}

	res, err := c.http.Do(req)
	if err != nil {
		return books.SearchResult{}, err
	}
	defer res.Body.Close()

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(res.Body, 4<<10))
		return books.SearchResult{}, fmt.Errorf("googlebooks upstream status %d: %s", res.StatusCode, strings.TrimSpace(string(b)))
	}

	var gr googleResponse
	if err := json.NewDecoder(res.Body).Decode(&gr); err != nil {
		return books.SearchResult{}, err
	}

	mapped := books.SearchResult{TotalItems: gr.TotalItems}
	for _, it := range gr.Items {
		b := books.Book{
			ID:            it.ID,
			Title:         it.VolumeInfo.Title,
			Authors:       it.VolumeInfo.Authors,
			PublishedDate: it.VolumeInfo.PublishedDate,
			Description:   it.VolumeInfo.Description,
			Categories:    it.VolumeInfo.Categories,
			PageCount:     it.VolumeInfo.PageCount,
			Thumbnail:     it.VolumeInfo.ImageLinks.Thumbnail,
			InfoLink:      it.VolumeInfo.InfoLink,
		}
		mapped.Items = append(mapped.Items, b)
	}
	return mapped, nil
}

func buildQuery(p books.SearchParams) string {
	// カテゴリは廃止し、q そのものをGoogle Booksへ渡す
	return strings.TrimSpace(p.Query)
}

// Google Books API レスポンスの構造体
type googleResponse struct {
	TotalItems int          `json:"totalItems"`
	Items      []googleItem `json:"items"`
}

type googleItem struct {
	ID         string           `json:"id"`
	VolumeInfo googleVolumeInfo `json:"volumeInfo"`
}

type googleVolumeInfo struct {
	Title         string   `json:"title"`
	Authors       []string `json:"authors"`
	PublishedDate string   `json:"publishedDate"`
	Description   string   `json:"description"`
	Categories    []string `json:"categories"`
	PageCount     int      `json:"pageCount"`
	ImageLinks    struct {
		Thumbnail string `json:"thumbnail"`
	} `json:"imageLinks"`
	InfoLink string `json:"infoLink"`
}

var _ books.ExternalClient = (*Client)(nil)
