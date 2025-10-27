```
back 
├── .env.template 
├── .gitignore
├── cmd
│   └── api
│       └── main.go      #APIのエントリーポイント
├── go.mod
├── internal
│   ├── handler          #各ハンドラーの定義
│   └── server           #HTTPサーバー・ルーティングの定義
└── README.md
```

# 起動
```bash
go run cmd/api/main.go
```

# health check
```bash
curl -i http://localhost:8080/health
```

# technical books search
まだ暫定です

## エンドポイント
- GET `/api/technical-books`

### クエリパラメータ（仮）
- `q`（任意）: 検索キーワード
- `genre`（任意）: 追加検索語（今は `q` とスペース連結して使用）
- `startIndex`（任意, default: 0）
- `maxResults`（任意, default: 20, 1〜40）
- `orderBy`（任意, default: `relevance`, 値: `relevance` | `newest`）
- `lang`（任意, default: なし, 例: `ja`/`en`、`all`で未指定扱い）

### リクエスト例
```bash
curl "http://localhost:8080/api/technical-books?genre=programming&q=golang&startIndex=0&maxResults=10"
```

### レスポンス例
```json
{
  "TotalItems": 1000000,
  "Items": [
    {
      "ID": "xo9NEAAAQBAJ",
      "Title": "GoLang Programming untuk Sains dan Teknik",
      "Authors": ["Fachrizal Rian Pratama"],
      "PublishedDate": "2021-10-26",
      "Description": "...",
      "Categories": ["Computers"],
      "PageCount": 150,
      "Thumbnail": "http://books.google.com/books/content?id=...",
      "InfoLink": "https://play.google.com/store/books/details?id=..."
    }
  ]
}
```