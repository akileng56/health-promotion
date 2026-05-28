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

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

type DiseaseCategory struct {
	ID            int                  `json:"id"`
	Name          string               `json:"name"`
	Description   string               `json:"description"`
	SubCategories []DiseaseSubCategory `json:"subcategories,omitempty"`
	CreatedAt     time.Time            `json:"created_at"`
	UpdatedAt     time.Time            `json:"updated_at"`
}

type DiseaseSubCategory struct {
	ID          int       `json:"id"`
	CategoryID  int       `json:"category_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Articles    []Article `json:"articles,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Article struct {
	ID            int          `json:"id"`
	SubCategoryID int          `json:"subcategory_id"`
	Title         string       `json:"title"`
	Content       string       `json:"content"`
	SubArticles   []SubArticle `json:"subarticles,omitempty"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

type SubArticle struct {
	ID        int       `json:"id"`
	ArticleID int       `json:"article_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type SubCategoryRequest struct {
	CategoryID  int    `json:"category_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type ArticleRequest struct {
	SubCategoryID int    `json:"subcategory_id"`
	Title         string `json:"title"`
	Content       string `json:"content"`
}

type SubArticleRequest struct {
	ArticleID int    `json:"article_id"`
	Title     string `json:"title"`
	Content   string `json:"content"`
}

var db *sql.DB

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://healthuser:healthpassword@localhost:5432/healthdb?sslmode=disable"
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
	seedDiseases()

	router := mux.NewRouter()
	router.Use(corsMiddleware)

	router.PathPrefix("/").Methods(http.MethodOptions).HandlerFunc(optionsHandler)

	router.HandleFunc("/api/health", healthHandler).Methods("GET")
	router.HandleFunc("/api/admin/login", login).Methods("POST")

	// Disease Routes
	router.HandleFunc("/api/categories", getCategories).Methods("GET")
	router.HandleFunc("/api/categories/{id}", getCategory).Methods("GET")
	router.HandleFunc("/api/subcategories", getSubCategories).Methods("GET")
	router.HandleFunc("/api/subcategories/{id}", getSubCategory).Methods("GET")
	router.HandleFunc("/api/articles", getArticles).Methods("GET")
	router.HandleFunc("/api/articles/{id}", getArticle).Methods("GET")
	router.HandleFunc("/api/subarticles", getSubArticles).Methods("GET")
	router.HandleFunc("/api/subarticles/{id}", getSubArticle).Methods("GET")

	admin := router.PathPrefix("/api/admin").Subrouter()
	admin.Use(authMiddleware)

	// Admin Disease Routes
	admin.HandleFunc("/categories", createCategory).Methods("POST")
	admin.HandleFunc("/categories/{id}", updateCategory).Methods("PUT")
	admin.HandleFunc("/categories/{id}", deleteCategory).Methods("DELETE")
	admin.HandleFunc("/subcategories", createSubCategory).Methods("POST")
	admin.HandleFunc("/subcategories/{id}", updateSubCategory).Methods("PUT")
	admin.HandleFunc("/subcategories/{id}", deleteSubCategory).Methods("DELETE")
	admin.HandleFunc("/articles", createArticle).Methods("POST")
	admin.HandleFunc("/articles/{id}", updateArticle).Methods("PUT")
	admin.HandleFunc("/articles/{id}", deleteArticle).Methods("DELETE")
	admin.HandleFunc("/subarticles", createSubArticle).Methods("POST")
	admin.HandleFunc("/subarticles/{id}", updateSubArticle).Methods("PUT")
	admin.HandleFunc("/subarticles/{id}", deleteSubArticle).Methods("DELETE")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Backend running on port", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func createTables() {
	query := `
	CREATE TABLE IF NOT EXISTS disease_categories (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		description TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS disease_subcategories (
		id SERIAL PRIMARY KEY,
		category_id INTEGER REFERENCES disease_categories(id) ON DELETE CASCADE,
		name TEXT NOT NULL,
		description TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS articles (
		id SERIAL PRIMARY KEY,
		subcategory_id INTEGER REFERENCES disease_subcategories(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS sub_articles (
		id SERIAL PRIMARY KEY,
		article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
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

func seedDiseases() {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM disease_categories").Scan(&count)
	if err != nil {
		log.Println("Error checking categories count:", err)
		return
	}

	if count > 0 {
		return
	}

	// Seed Categories
	var categoryID int
	err = db.QueryRow(`
		INSERT INTO disease_categories(name, description)
		VALUES('Infectious Diseases', 'Diseases caused by pathogenic microorganisms')
		RETURNING id
	`).Scan(&categoryID)
	if err != nil {
		log.Println("Error seeding categories:", err)
		return
	}

	// Seed Subcategories
	var subCategoryID int
	err = db.QueryRow(`
		INSERT INTO disease_subcategories(category_id, name, description)
		VALUES($1, 'Viral Infections', 'Diseases caused by viruses')
		RETURNING id
	`, categoryID).Scan(&subCategoryID)
	if err != nil {
		log.Println("Error seeding subcategories:", err)
		return
	}

	// Seed Articles
	var articleID int
	err = db.QueryRow(`
		INSERT INTO articles(subcategory_id, title, content)
		VALUES($1, 'Ebola Virus Disease', 'Detailed article about Ebola')
		RETURNING id
	`, subCategoryID).Scan(&articleID)
	if err != nil {
		log.Println("Error seeding articles:", err)
		return
	}

	// Seed SubArticles
	_, err = db.Exec(`
		INSERT INTO sub_articles(article_id, title, content)
		VALUES($1, 'Symptoms', 'Fever, fatigue, muscle pain, headache...'),
		($1, 'Prevention', 'Hand washing, avoiding contact with infected people...')
	`, articleID)
	if err != nil {
		log.Println("Error seeding subarticles:", err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func optionsHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
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

// --- DiseaseCategory Handlers ---

func getCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
		SELECT id, name, description, created_at, updated_at
		FROM disease_categories
		ORDER BY name ASC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch categories")
		return
	}
	defer rows.Close()

	categories := []DiseaseCategory{}
	for rows.Next() {
		var c DiseaseCategory
		err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan category")
			return
		}

		// Fetch Subcategories for each category (Hierarchical)
		subRows, err := db.Query(`
			SELECT id, category_id, name, description, created_at, updated_at
			FROM disease_subcategories
			WHERE category_id = $1
			ORDER BY name ASC
		`, c.ID)
		if err == nil {
			defer subRows.Close()
			for subRows.Next() {
				var sc DiseaseSubCategory
				if err := subRows.Scan(&sc.ID, &sc.CategoryID, &sc.Name, &sc.Description, &sc.CreatedAt, &sc.UpdatedAt); err == nil {
					c.SubCategories = append(c.SubCategories, sc)
				}
			}
		}

		categories = append(categories, c)
	}

	writeJSON(w, http.StatusOK, categories)
}

func getCategory(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	var c DiseaseCategory
	err := db.QueryRow(`
		SELECT id, name, description, created_at, updated_at
		FROM disease_categories
		WHERE id = $1
	`, id).Scan(&c.ID, &c.Name, &c.Description, &c.CreatedAt, &c.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "category not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch category")
		return
	}

	// Fetch Subcategories (Hierarchical)
	subRows, err := db.Query(`
		SELECT id, category_id, name, description, created_at, updated_at
		FROM disease_subcategories
		WHERE category_id = $1
		ORDER BY name ASC
	`, id)
	if err == nil {
		defer subRows.Close()
		for subRows.Next() {
			var sc DiseaseSubCategory
			if err := subRows.Scan(&sc.ID, &sc.CategoryID, &sc.Name, &sc.Description, &sc.CreatedAt, &sc.UpdatedAt); err == nil {
				c.SubCategories = append(c.SubCategories, sc)
			}
		}
	}

	writeJSON(w, http.StatusOK, c)
}

func createCategory(w http.ResponseWriter, r *http.Request) {
	var req CategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if strings.TrimSpace(req.Name) == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	var c DiseaseCategory
	err := db.QueryRow(`
		INSERT INTO disease_categories(name, description)
		VALUES($1, $2)
		RETURNING id, name, description, created_at, updated_at
	`, req.Name, req.Description).Scan(&c.ID, &c.Name, &c.Description, &c.CreatedAt, &c.UpdatedAt)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create category")
		return
	}

	writeJSON(w, http.StatusCreated, c)
}

func updateCategory(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req CategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if strings.TrimSpace(req.Name) == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	var c DiseaseCategory
	err := db.QueryRow(`
		UPDATE disease_categories
		SET name = $1, description = $2, updated_at = NOW()
		WHERE id = $3
		RETURNING id, name, description, created_at, updated_at
	`, req.Name, req.Description, id).Scan(&c.ID, &c.Name, &c.Description, &c.CreatedAt, &c.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "category not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update category")
		return
	}

	writeJSON(w, http.StatusOK, c)
}

func deleteCategory(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	result, err := db.Exec("DELETE FROM disease_categories WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete category")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		writeError(w, http.StatusNotFound, "category not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "category deleted"})
}

// --- DiseaseSubCategory Handlers ---

func getSubCategories(w http.ResponseWriter, r *http.Request) {
	categoryID := r.URL.Query().Get("category_id")
	var rows *sql.Rows
	var err error

	if categoryID != "" {
		rows, err = db.Query(`
			SELECT id, category_id, name, description, created_at, updated_at
			FROM disease_subcategories
			WHERE category_id = $1
			ORDER BY name ASC
		`, categoryID)
	} else {
		rows, err = db.Query(`
			SELECT id, category_id, name, description, created_at, updated_at
			FROM disease_subcategories
			ORDER BY name ASC
		`)
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch subcategories")
		return
	}
	defer rows.Close()

	subcategories := []DiseaseSubCategory{}
	for rows.Next() {
		var sc DiseaseSubCategory
		err := rows.Scan(&sc.ID, &sc.CategoryID, &sc.Name, &sc.Description, &sc.CreatedAt, &sc.UpdatedAt)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan subcategory")
			return
		}
		subcategories = append(subcategories, sc)
	}

	writeJSON(w, http.StatusOK, subcategories)
}

func getSubCategory(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	var sc DiseaseSubCategory
	err := db.QueryRow(`
		SELECT id, category_id, name, description, created_at, updated_at
		FROM disease_subcategories
		WHERE id = $1
	`, id).Scan(&sc.ID, &sc.CategoryID, &sc.Name, &sc.Description, &sc.CreatedAt, &sc.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "subcategory not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch subcategory")
		return
	}

	// Fetch Articles (Hierarchical)
	artRows, err := db.Query(`
		SELECT id, subcategory_id, title, content, created_at, updated_at
		FROM articles
		WHERE subcategory_id = $1
		ORDER BY created_at DESC
	`, id)
	if err == nil {
		defer artRows.Close()
		for artRows.Next() {
			var a Article
			if err := artRows.Scan(&a.ID, &a.SubCategoryID, &a.Title, &a.Content, &a.CreatedAt, &a.UpdatedAt); err == nil {
				sc.Articles = append(sc.Articles, a)
			}
		}
	}

	writeJSON(w, http.StatusOK, sc)
}

func createSubCategory(w http.ResponseWriter, r *http.Request) {
	var req SubCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.CategoryID == 0 || strings.TrimSpace(req.Name) == "" {
		writeError(w, http.StatusBadRequest, "category_id and name are required")
		return
	}

	var sc DiseaseSubCategory
	err := db.QueryRow(`
		INSERT INTO disease_subcategories(category_id, name, description)
		VALUES($1, $2, $3)
		RETURNING id, category_id, name, description, created_at, updated_at
	`, req.CategoryID, req.Name, req.Description).Scan(&sc.ID, &sc.CategoryID, &sc.Name, &sc.Description, &sc.CreatedAt, &sc.UpdatedAt)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create subcategory")
		return
	}

	writeJSON(w, http.StatusCreated, sc)
}

func updateSubCategory(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req SubCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.CategoryID == 0 || strings.TrimSpace(req.Name) == "" {
		writeError(w, http.StatusBadRequest, "category_id and name are required")
		return
	}

	var sc DiseaseSubCategory
	err := db.QueryRow(`
		UPDATE disease_subcategories
		SET category_id = $1, name = $2, description = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING id, category_id, name, description, created_at, updated_at
	`, req.CategoryID, req.Name, req.Description, id).Scan(&sc.ID, &sc.CategoryID, &sc.Name, &sc.Description, &sc.CreatedAt, &sc.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "subcategory not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update subcategory")
		return
	}

	writeJSON(w, http.StatusOK, sc)
}

func deleteSubCategory(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	result, err := db.Exec("DELETE FROM disease_subcategories WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete subcategory")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		writeError(w, http.StatusNotFound, "subcategory not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "subcategory deleted"})
}

// --- Article Handlers ---

func getArticles(w http.ResponseWriter, r *http.Request) {
	subCategoryID := r.URL.Query().Get("subcategory_id")
	var rows *sql.Rows
	var err error

	if subCategoryID != "" {
		rows, err = db.Query(`
			SELECT id, subcategory_id, title, content, created_at, updated_at
			FROM articles
			WHERE subcategory_id = $1
			ORDER BY created_at DESC
		`, subCategoryID)
	} else {
		rows, err = db.Query(`
			SELECT id, subcategory_id, title, content, created_at, updated_at
			FROM articles
			ORDER BY created_at DESC
		`)
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch articles")
		return
	}
	defer rows.Close()

	articles := []Article{}
	for rows.Next() {
		var a Article
		err := rows.Scan(&a.ID, &a.SubCategoryID, &a.Title, &a.Content, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan article")
			return
		}
		articles = append(articles, a)
	}

	writeJSON(w, http.StatusOK, articles)
}

func getArticle(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	var a Article
	err := db.QueryRow(`
		SELECT id, subcategory_id, title, content, created_at, updated_at
		FROM articles
		WHERE id = $1
	`, id).Scan(&a.ID, &a.SubCategoryID, &a.Title, &a.Content, &a.CreatedAt, &a.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "article not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch article")
		return
	}

	// Fetch SubArticles (Hierarchical)
	subArtRows, err := db.Query(`
		SELECT id, article_id, title, content, created_at, updated_at
		FROM sub_articles
		WHERE article_id = $1
		ORDER BY created_at ASC
	`, id)
	if err == nil {
		defer subArtRows.Close()
		for subArtRows.Next() {
			var sa SubArticle
			if err := subArtRows.Scan(&sa.ID, &sa.ArticleID, &sa.Title, &sa.Content, &sa.CreatedAt, &sa.UpdatedAt); err == nil {
				a.SubArticles = append(a.SubArticles, sa)
			}
		}
	}

	writeJSON(w, http.StatusOK, a)
}

func createArticle(w http.ResponseWriter, r *http.Request) {
	var req ArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.SubCategoryID == 0 || strings.TrimSpace(req.Title) == "" || strings.TrimSpace(req.Content) == "" {
		writeError(w, http.StatusBadRequest, "subcategory_id, title and content are required")
		return
	}

	var a Article
	err := db.QueryRow(`
		INSERT INTO articles(subcategory_id, title, content)
		VALUES($1, $2, $3)
		RETURNING id, subcategory_id, title, content, created_at, updated_at
	`, req.SubCategoryID, req.Title, req.Content).Scan(&a.ID, &a.SubCategoryID, &a.Title, &a.Content, &a.CreatedAt, &a.UpdatedAt)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create article")
		return
	}

	writeJSON(w, http.StatusCreated, a)
}

func updateArticle(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req ArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.SubCategoryID == 0 || strings.TrimSpace(req.Title) == "" || strings.TrimSpace(req.Content) == "" {
		writeError(w, http.StatusBadRequest, "subcategory_id, title and content are required")
		return
	}

	var a Article
	err := db.QueryRow(`
		UPDATE articles
		SET subcategory_id = $1, title = $2, content = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING id, subcategory_id, title, content, created_at, updated_at
	`, req.SubCategoryID, req.Title, req.Content, id).Scan(&a.ID, &a.SubCategoryID, &a.Title, &a.Content, &a.CreatedAt, &a.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "article not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update article")
		return
	}

	writeJSON(w, http.StatusOK, a)
}

func deleteArticle(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	result, err := db.Exec("DELETE FROM articles WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete article")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		writeError(w, http.StatusNotFound, "article not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "article deleted"})
}

// --- SubArticle Handlers ---

func getSubArticles(w http.ResponseWriter, r *http.Request) {
	articleID := r.URL.Query().Get("article_id")
	var rows *sql.Rows
	var err error

	if articleID != "" {
		rows, err = db.Query(`
			SELECT id, article_id, title, content, created_at, updated_at
			FROM sub_articles
			WHERE article_id = $1
			ORDER BY created_at ASC
		`, articleID)
	} else {
		rows, err = db.Query(`
			SELECT id, article_id, title, content, created_at, updated_at
			FROM sub_articles
			ORDER BY created_at ASC
		`)
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch subarticles")
		return
	}
	defer rows.Close()

	subarticles := []SubArticle{}
	for rows.Next() {
		var sa SubArticle
		err := rows.Scan(&sa.ID, &sa.ArticleID, &sa.Title, &sa.Content, &sa.CreatedAt, &sa.UpdatedAt)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan subarticle")
			return
		}
		subarticles = append(subarticles, sa)
	}

	writeJSON(w, http.StatusOK, subarticles)
}

func getSubArticle(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	var sa SubArticle
	err := db.QueryRow(`
		SELECT id, article_id, title, content, created_at, updated_at
		FROM sub_articles
		WHERE id = $1
	`, id).Scan(&sa.ID, &sa.ArticleID, &sa.Title, &sa.Content, &sa.CreatedAt, &sa.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "subarticle not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch subarticle")
		return
	}

	writeJSON(w, http.StatusOK, sa)
}

func createSubArticle(w http.ResponseWriter, r *http.Request) {
	var req SubArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.ArticleID == 0 || strings.TrimSpace(req.Title) == "" || strings.TrimSpace(req.Content) == "" {
		writeError(w, http.StatusBadRequest, "article_id, title and content are required")
		return
	}

	var sa SubArticle
	err := db.QueryRow(`
		INSERT INTO sub_articles(article_id, title, content)
		VALUES($1, $2, $3)
		RETURNING id, article_id, title, content, created_at, updated_at
	`, req.ArticleID, req.Title, req.Content).Scan(&sa.ID, &sa.ArticleID, &sa.Title, &sa.Content, &sa.CreatedAt, &sa.UpdatedAt)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create subarticle")
		return
	}

	writeJSON(w, http.StatusCreated, sa)
}

func updateSubArticle(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req SubArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.ArticleID == 0 || strings.TrimSpace(req.Title) == "" || strings.TrimSpace(req.Content) == "" {
		writeError(w, http.StatusBadRequest, "article_id, title and content are required")
		return
	}

	var sa SubArticle
	err := db.QueryRow(`
		UPDATE sub_articles
		SET article_id = $1, title = $2, content = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING id, article_id, title, content, created_at, updated_at
	`, req.ArticleID, req.Title, req.Content, id).Scan(&sa.ID, &sa.ArticleID, &sa.Title, &sa.Content, &sa.CreatedAt, &sa.UpdatedAt)

	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "subarticle not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update subarticle")
		return
	}

	writeJSON(w, http.StatusOK, sa)
}

func deleteSubArticle(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	result, err := db.Exec("DELETE FROM sub_articles WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete subarticle")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		writeError(w, http.StatusNotFound, "subarticle not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "subarticle deleted"})
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
