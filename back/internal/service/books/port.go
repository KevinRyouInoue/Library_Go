package books

import (
    "context"
)

// 書籍検索クライアント用インターフェース。
type ExternalClient interface {
    Search(ctx context.Context, params SearchParams) (SearchResult, error)
}


