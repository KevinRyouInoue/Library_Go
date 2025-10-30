# 📚 Technical Books Library

A modern, full-stack web application for searching, organizing, and managing your technical book collection with an intuitive and beautiful user interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go Version](https://img.shields.io/badge/go-1.25.3-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![Vite](https://img.shields.io/badge/vite-7.1.10-purple.svg)

## ✨ Features

### 🔍 Book Search
- Search technical books using the Google Books API
- Filter by technology tags (JavaScript, Python, Go, React, etc.)
- Real-time search with pagination
- Detailed book information with cover images

### ⭐ Favorites System
- Mark books as favorites with a single click
- View all favorite books in a dedicated page
- Beautiful card grid layout with book details
- Easy add/remove functionality

### 📖 Tsundoku (Reading List) Management
- Add books to your reading list ("tsundoku" - Japanese for "buying books and not reading them")
- Three status categories:
  - **Stacked**: Books waiting to be read
  - **Currently Reading**: Books you're actively reading
  - **Completed**: Finished books
- Pick books from your stack to start reading
- Mark books as done or return them to the stack

### 🎨 Modern UI/UX
- Beautiful gradient theme (purple to violet)
- Smooth animations and hover effects
- Glassmorphism design with backdrop blur
- Responsive card layouts
- Interactive elements with visual feedback
- Mobile-friendly interface

## 🚀 Tech Stack

### Backend
- **Language**: Go 1.25.3
- **Router**: chi v5.2.3
- **API**: Google Books API v1
- **Storage**: File-based JSON storage
- **Architecture**: Service layer pattern with repository interface

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 7.1.10
- **Styling**: Inline styles with CSS-in-JS approach
- **State Management**: React Hooks (useState, useMemo, useCallback)
- **HTTP Client**: Native Fetch API

## 📁 Project Structure

```
technical-books-search/
├── back/                          # Go backend
│   ├── cmd/
│   │   └── api/
│   │       └── main.go           # Application entry point
│   ├── internal/
│   │   ├── handler/              # HTTP request handlers
│   │   │   ├── favorites.go
│   │   │   ├── search.go
│   │   │   └── tsundoku.go
│   │   ├── infra/                # Infrastructure layer
│   │   │   ├── favorites/
│   │   │   │   └── filestore/   # File-based favorites storage
│   │   │   ├── googlebooks/     # Google Books API client
│   │   │   └── tsundoku/
│   │   │       └── filestore/   # File-based tsundoku storage
│   │   ├── server/               # HTTP server & routing
│   │   │   └── router.go
│   │   └── service/              # Business logic layer
│   │       ├── books/
│   │       ├── favorites/
│   │       └── tsundoku/
│   ├── data/                     # JSON data storage
│   │   ├── favorites.json
│   │   └── tsundoku.json
│   ├── go.mod
│   └── go.sum
├── front/                         # React frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Pagination.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   ├── ResultsGrid.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── TechTags.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useBooksSearch.ts
│   │   │   ├── useFavorites.ts
│   │   │   └── useTsundoku.ts
│   │   ├── pages/                # Page components
│   │   │   ├── FavoritesPage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   └── TsundokuPage.tsx
│   │   ├── api.ts                # API client functions
│   │   ├── App.tsx               # Main application component
│   │   ├── index.css             # Global styles
│   │   ├── main.tsx              # Application entry point
│   │   ├── tags.ts               # Technology tags configuration
│   │   └── types.ts              # TypeScript type definitions
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.js
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Go**: 1.25.3 or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher

### Backend Setup

1. Navigate to the backend directory:
```bash
cd back
```

2. Install Go dependencies:
```bash
go mod tidy
```

3. (Optional) Set environment variables:
```bash
# Windows PowerShell
$env:BOOKS_BASE_URL="https://www.googleapis.com/books/v1/volumes"
$env:BOOKS_API_KEY="your-api-key-here"  # Optional - Google Books API works without key

# Linux/Mac
export BOOKS_BASE_URL="https://www.googleapis.com/books/v1/volumes"
export BOOKS_API_KEY="your-api-key-here"  # Optional
```

4. Run the backend server:
```bash
go run cmd/api/main.go
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd front
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or `http://localhost:5174` if 5173 is in use)

## 🎯 Usage

### Search for Books
1. Open the application in your browser
2. Select technology tags or enter keywords in the search box
3. Browse through search results with book covers and details
4. Click on book cards to view more information on Google Books

### Add to Favorites
1. Find a book in search results
2. Click the ⭐ button in the top-right corner of the book card
3. View all favorites in the "Favorites" tab

### Manage Reading List (Tsundoku)
1. Add books to your reading list using the ＋ button
2. Click "Pick from Top" to start reading the first book in your stack
3. Update book status as you progress:
   - Mark as "Mark as Done" when finished
   - Return to "Return to Stack" if you want to read it again later

## 🔧 Configuration

### Backend Configuration

The backend can be configured using environment variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BOOKS_BASE_URL` | Google Books API base URL | `https://www.googleapis.com/books/v1/volumes` | No |
| `BOOKS_API_KEY` | Google Books API key | - | No |
| `STORAGE_BACKEND` | Storage type (`file`) | `file` | No |
| `TSUNDOKU_STORE_PATH` | Path to tsundoku JSON file | `data/tsundoku.json` | No |
| `FAVORITES_STORE_PATH` | Path to favorites JSON file | `data/favorites.json` | No |

### Frontend Configuration

The frontend proxies API requests to the backend. Update `vite.config.js` if you need to change the backend URL:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

## 📡 API Endpoints

### Books Search
- `GET /api/technical-books?q={query}&page={page}` - Search for technical books

### Tsundoku
- `GET /api/tsundoku` - Get all tsundoku items
- `POST /api/tsundoku` - Add a book to tsundoku
- `POST /api/tsundoku/pickup` - Pick up the first book from stack
- `POST /api/tsundoku/{id}/pickup` - Pick up a specific book
- `POST /api/tsundoku/{id}/status` - Update book status
- `POST /api/tsundoku/{id}/restack` - Return book to stack

### Favorites
- `GET /api/favorites` - Get all favorite items
- `POST /api/favorites` - Add a book to favorites
- `DELETE /api/favorites/{id}` - Remove a book from favorites

### Health Check
- `GET /health` - Server health check

## 🏗️ Building for Production

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

The built files will be in the `front/dist` directory.

## 🧪 Testing

### Backend
```bash
cd back
go test ./...
```

### Frontend
```bash
cd front
npm run test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Kevin Ryou Inoue**
- GitHub: [@KevinRyouInoue](https://github.com/KevinRyouInoue)
- Repository: [Library_Go](https://github.com/KevinRyouInoue/Library_Go)

## 🙏 Acknowledgments

- Google Books API for providing book data
- The Go community for excellent libraries
- React and Vite teams for amazing developer experience
- All contributors and users of this project

## 📸 Screenshots

### Search Page
Beautiful gradient interface with technology tag filters and real-time search results.

### Favorites Page
Grid layout displaying all your favorite technical books with cover images and metadata.

### Tsundoku Dashboard
Organized reading list management with three status categories for tracking your reading progress.

---

**Made with ❤️ and ☕ by Kevin Ryou Inoue**
