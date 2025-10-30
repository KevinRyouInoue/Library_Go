```
back 
├── .env.template 
├── .gitignore
├── cmd
│   └── api
│       └── main.go      # API entry point
├── go.mod
├── internal
│   ├── handler          # Handler definitions
│   └── server           # HTTP server & routing definitions
└── README.md
```

# Startup
```bash
go run cmd/api/main.go
```

# health check
```bash
curl -i http://localhost:8080/health
```

# technical books search
Still provisional

## Endpoints
- GET `/api/technical-books`

### Query Parameters (provisional)
- `q` (optional): Search keywords
- `genre` (optional): Additional search terms (currently concatenated with `q` using spaces)
- `startIndex` (optional, default: 0)
- `maxResults` (optional, default: 20, range: 1-40)
- `orderBy` (optional, default: `relevance`, values: `relevance` | `newest`)
- `lang` (optional, default: none, examples: `ja`/`en`, `all` for unspecified)

### Request Example
```bash
curl "http://localhost:8080/api/technical-books?genre=programming&q=golang&startIndex=0&maxResults=10"
```

### Response Example
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