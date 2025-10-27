package books

// 書籍検索の入力パラメータ
type SearchParams struct {
	Query      string
	StartIndex int
	MaxResults int
	OrderBy    string // "relevance" | "newest"
	Lang       string
}

// 検索結果の1件分
type Book struct {
	ID            string
	Title         string
	Authors       []string
	PublishedDate string
	Description   string
	Categories    []string
	PageCount     int
	Thumbnail     string
	InfoLink      string
}

// 検索結果
type SearchResult struct {
	TotalItems int
	Items      []Book
}
