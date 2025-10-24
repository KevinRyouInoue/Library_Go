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

# health check
```bash
go run cmd/api/main.go
curl -i http://localhost:8080/health
```