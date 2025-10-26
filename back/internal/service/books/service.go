package books

import (
	"context"
)

// 技術書検索サービス用タイプ
type Service struct {
	client ExternalClient
}

// 技術書検索サービスの生成メソッド
func NewService(client ExternalClient) *Service {
	return &Service{client: client}
}

// 技術書検索メソッド
func (s *Service) Search(ctx context.Context, params SearchParams) (SearchResult, error) {
	// ToDO: フィルタリングなどの実装
	return s.client.Search(ctx, params)
}
