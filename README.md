# Technical Books Search

A full-stack web application for searching and managing technical books using Google Books API.

![Go Version](https://img.shields.io/badge/go-1.25.3-blue.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│                    React SPA (Vite + TypeScript)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                       Backend API (Go)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Handler Layer (HTTP Controllers)                         │  │
│  │    - SearchBooksHandler                                   │  │
│  │    - TsundokuHandler                                      │  │
│  │    - FavoritesHandler                                     │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │  Service Layer (Business Logic)                          │  │
│  │    - books.Service                                        │  │
│  │    - tsundoku.Service                                     │  │
│  │    - favorites.Service                                    │  │
│  └───┬──────────────────────────────────────────┬───────────┘  │
│      │                                           │               │
│  ┌───▼─────────────────────┐      ┌────────────▼───────────┐  │
│  │ Infrastructure Layer    │      │ Repository Interface   │  │
│  │  - GoogleBooks Client   │      │  - Favorites Repo      │  │
│  │    (External API)       │      │  - Tsundoku Repo       │  │
│  └───┬─────────────────────┘      └────────────┬───────────┘  │
└──────┼──────────────────────────────────────────┼──────────────┘
       │                                           │
       │                                           │
┌──────▼──────────────────────┐      ┌────────────▼───────────┐
│  Google Books API v1        │      │  File Storage (JSON)   │
│  (External Service)         │      │  - favorites.json      │
└─────────────────────────────┘      │  - tsundoku.json       │
                                     └────────────────────────┘
```

## Features

### Book Search
- Search technical books via Google Books API
- Technology tag filtering
- Pagination support
- Real-time search results

### Favorites Management
- Add/remove favorite books
- Persistent storage
- Dedicated favorites view

### Tsundoku (Reading List)
- Track reading progress with three statuses: Stacked, Currently Reading, Completed
- Add books to reading list
- Update reading status

## API Endpoints

### Books
- `GET /api/technical-books` - Search books with query parameters
  - `q`: search keywords
  - `genre`: additional search terms
  - `startIndex`: pagination start (default: 0)
  - `maxResults`: results per page (1-40, default: 20)
  - `orderBy`: sort order (relevance/newest)
  - `lang`: language filter (ja/en)

### Tsundoku
- `GET /api/tsundoku` - Get all reading list items
- `POST /api/tsundoku` - Add book to reading list
- `PUT /api/tsundoku/:id/status` - Update book status
- `DELETE /api/tsundoku/:id` - Remove from reading list

### Favorites
- `GET /api/favorites` - Get all favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

## Tech Stack

### Backend
- **Language**: Go 1.25.3
- **Router**: chi v5.2.3
- **External API**: Google Books API v1
- **Storage**: File-based JSON
- **Architecture**: Clean architecture with service layer pattern

### Frontend
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.7
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

## Data Flow Diagram

```
┌────────────────┐
│  User Action   │
└───────┬────────┘
        │
        ▼
┌───────────────────────────────────┐
│  React Component (SearchPage)     │
│  - Calls custom hook              │
└───────┬───────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│  Custom Hook (useBooksSearch)     │
│  - Manages state                  │
│  - Calls API client               │
└───────┬───────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│  API Client (api.ts)              │
│  - Constructs HTTP request        │
└───────┬───────────────────────────┘
        │ HTTP/REST
        ▼
┌───────────────────────────────────┐
│  Backend Handler                  │
│  - Validates request              │
│  - Calls service layer            │
└───────┬───────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│  Service Layer                    │
│  - Business logic                 │
│  - Calls repository/client        │
└───────┬───────────┬───────────────┘
        │           │
        ▼           ▼
┌─────────────┐  ┌──────────────────┐
│  Google     │  │  File Repository │
│  Books API  │  │  (JSON Storage)  │
└─────────────┘  └──────────────────┘
```

## API Integration Details

### Google Books API Integration
- **Base URL**: `https://www.googleapis.com/books/v1/volumes`
- **Authentication**: API Key (optional, passed via query parameter)
- **Request Method**: GET
- **Response Format**: JSON

### Backend API Client Pattern
```
infra/googlebooks/client.go implements:
- HTTP client configuration
- Request construction with query parameters
- Response parsing and error handling
- Rate limiting considerations
```

### Frontend API Client Pattern
```
src/api.ts implements:
- Typed API functions with TypeScript
- Error handling with custom ApiError class
- Response parsing utilities
- Base URL configuration (localhost:8080)
```

## Project Structure

```
back/
├── cmd/api/main.go              # Entry point, dependency injection
├── internal/
│   ├── handler/                 # HTTP handlers
│   ├── service/                 # Business logic
│   └── infra/                   # External integrations
│       ├── googlebooks/         # Google Books API client
│       └── {favorites,tsundoku}/filestore/  # JSON storage
└── data/                        # Data files

front/
├── src/
│   ├── components/              # UI components
│   ├── hooks/                   # Custom React hooks
│   ├── pages/                   # Page components
│   └── api.ts                   # API client
```

## Installation & Setup

### Prerequisites
- Go 1.25.3 or higher
- Node.js 18.x or higher

### Backend Setup

```bash
cd back
go mod tidy

# Optional: Set environment variables
# export BOOKS_API_KEY="your-api-key"

go run cmd/api/main.go
```

Backend runs on `http://localhost:8080`

### Frontend Setup

```bash
cd front
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `BOOKS_BASE_URL` | Google Books API URL | `https://www.googleapis.com/books/v1/volumes` |
| `BOOKS_API_KEY` | API key (optional) | - |
| `STORAGE_BACKEND` | Storage type | `file` |
| `TSUNDOKU_STORE_PATH` | Tsundoku data path | `data/tsundoku.json` |
| `FAVORITES_STORE_PATH` | Favorites data path | `data/favorites.json` |

## Usage

### Search Books
- Enter keywords or select technology tags
- Browse paginated results

### Manage Favorites
- Click star icon on book cards to add/remove favorites
- View all favorites in dedicated page

### Track Reading (Tsundoku)
- Add books to reading list
- Pick from top to start reading
- Update status: Stacked, Currently Reading, Completed

## Building for Production

### Backend
```bash
cd back
go build -o server cmd/api/main.go
./server
```

### Frontend
```bash
cd front
npm run build
```

Output in `front/dist/`

## Architecture Pattern

**Clean Architecture** with clear separation:
- Handler Layer: HTTP request/response handling
- Service Layer: Business logic
- Infrastructure Layer: External API and file storage
- Repository Pattern: Data access abstraction

**Dependency Injection** in [back/cmd/api/main.go](back/cmd/api/main.go):
- Services depend on repository interfaces
- Infrastructure implementations injected at startup

### Tsundoku Dashboard
Organized reading list management with three status categories for tracking your reading progress.

---

**Made with ❤️ and ☕ by Kevin Ryou Inoue**
