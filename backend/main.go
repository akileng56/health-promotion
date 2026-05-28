package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type Post struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

type PostRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

var db *sql.DB

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postsuser:postspassword@localhost:5432/postsdb?sslmode=disable"
	}

	var err error
	db, err = sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatal(err)
	}

	for i := 0; i < 10; i++ {
		err = db.Ping()
		if err == nil {
			break
		}

		log.Println("Waiting for database...")
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal(err)
	}

	createTables()
	seedPosts()

	router := mux.NewRouter()
	router.Use(corsMiddleware)

	router.PathPrefix("/").Methods(http.MethodOptions).HandlerFunc(optionsHandler)

	router.HandleFunc("/api/health", healthHandler).Methods("GET")
	router.HandleFunc("/api/posts", getPosts).Methods("GET")
	router.HandleFunc("/api/posts/{id}", getPost).Methods("GET")
	router.HandleFunc("/api/admin/login", login).Methods("POST")

	admin := router.PathPrefix("/api/admin").Subrouter()
	admin.Use(authMiddleware)
	admin.HandleFunc("/posts", createPost).Methods("POST")
	admin.HandleFunc("/posts/{id}", updatePost).Methods("PUT")
	admin.HandleFunc("/posts/{id}", deletePost).Methods("DELETE")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Backend running on port", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func createTables() {
	query := `
	CREATE TABLE IF NOT EXISTS posts (
		id SERIAL PRIMARY KEY,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	);
	`

	_, err := db.Exec(query)
	if err != nil {
		log.Fatal(err)
	}
}

func seedPosts() {
	var count int

	err := db.QueryRow("SELECT COUNT(*) FROM posts").Scan(&count)
	if err != nil {
		log.Fatal(err)
	}

	if count > 0 {
		return
	}

	_, err = db.Exec(`
		INSERT INTO posts(title, content) VALUES
		('Welcome to the blog', 'This is the first post in the application.'),
		('React and Go', 'This app uses React for the frontend and Go for the backend.'),
		('Dockerized setup', 'PostgreSQL, backend and frontend are all running with Docker Compose.');
	`)

	if err != nil {
		log.Fatal(err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func optionsHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

func getPosts(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
		SELECT id, title, content, created_at, updated_at
		FROM posts
		ORDER BY created_at DESC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch posts")
		return
	}
	defer rows.Close()

	posts := []Post{}

	for rows.Next() {
		var post Post

		err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt, &post.UpdatedAt)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan post")
			return
		}

		posts = append(posts, post)
	}

	writeJSON(w, http.StatusOK, posts)
}

func getPost(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	var post Post

	err := db.QueryRow(`
		SELECT id, title, content, created_at, updated_at
		FROM posts
		WHERE id = $1
	`, id).Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt, &post.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "post not found")
		return
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch post")
		return
	}

	writeJSON(w, http.StatusOK, post)
}

func login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	adminUsername := os.Getenv("ADMIN_USERNAME")
	adminPassword := os.Getenv("ADMIN_PASSWORD")

	if adminUsername == "" {
		adminUsername = "admin"
	}

	if adminPassword == "" {
		adminPassword = "admin123"
	}

	if req.Username != adminUsername || req.Password != adminPassword {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := generateJWT(req.Username)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	writeJSON(w, http.StatusOK, LoginResponse{Token: token})
}

func createPost(w http.ResponseWriter, r *http.Request) {
	var req PostRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if strings.TrimSpace(req.Title) == "" || strings.TrimSpace(req.Content) == "" {
		writeError(w, http.StatusBadRequest, "title and content are required")
		return
	}

	var post Post

	err := db.QueryRow(`
		INSERT INTO posts(title, content)
		VALUES($1, $2)
		RETURNING id, title, content, created_at, updated_at
	`, req.Title, req.Content).Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt, &post.UpdatedAt)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create post")
		return
	}

	writeJSON(w, http.StatusCreated, post)
}

func updatePost(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	var req PostRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if strings.TrimSpace(req.Title) == "" || strings.TrimSpace(req.Content) == "" {
		writeError(w, http.StatusBadRequest, "title and content are required")
		return
	}

	var post Post

	err := db.QueryRow(`
		UPDATE posts
		SET title = $1, content = $2, updated_at = NOW()
		WHERE id = $3
		RETURNING id, title, content, created_at, updated_at
	`, req.Title, req.Content, id).Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt, &post.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "post not found")
		return
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update post")
		return
	}

	writeJSON(w, http.StatusOK, post)
}

func deletePost(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	result, err := db.Exec("DELETE FROM posts WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete post")
		return
	}

	rowsAffected, _ := result.RowsAffected()

	if rowsAffected == 0 {
		writeError(w, http.StatusNotFound, "post not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "post deleted"})
}

func generateJWT(username string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "change-this-secret"
	}

	claims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(secret))
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			writeError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)

		if len(parts) != 2 || parts[0] != "Bearer" {
			writeError(w, http.StatusUnauthorized, "invalid authorization header")
			return
		}

		tokenString := parts[1]
		secret := os.Getenv("JWT_SECRET")

		if secret == "" {
			secret = "change-this-secret"
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			writeError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		next.ServeHTTP(w, r)
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if origin == "http://localhost:3000" || origin == "http://127.0.0.1:3000" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		}

		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
