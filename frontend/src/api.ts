const API_BASE_URL = "http://localhost:8080/api";

export async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Login failed");
    }

    return data;
}

// --- Categories ---

export async function getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
}

export async function createCategory(token, category) {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(category)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create category");
    return data;
}

export async function updateCategory(token, id, category) {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(category)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update category");
    return data;
}

export async function deleteCategory(token, id) {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete category");
    return data;
}

// --- SubCategories ---

export async function getSubCategories(category_id) {
    const url = category_id ? `${API_BASE_URL}/subcategories?category_id=${category_id}` : `${API_BASE_URL}/subcategories`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch subcategories");
    return response.json();
}

export async function createSubCategory(token, subcategory) {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subcategory)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create subcategory");
    return data;
}

export async function updateSubCategory(token, id, subcategory) {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subcategory)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update subcategory");
    return data;
}

export async function deleteSubCategory(token, id) {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete subcategory");
    return data;
}

// --- Articles ---

export async function getArticles(subcategory_id) {
    const url = subcategory_id ? `${API_BASE_URL}/articles?subcategory_id=${subcategory_id}` : `${API_BASE_URL}/articles`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch articles");
    return response.json();
}

export async function createArticle(token, article) {
    const response = await fetch(`${API_BASE_URL}/admin/articles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(article)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create article");
    return data;
}

export async function updateArticle(token, id, article) {
    const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(article)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update article");
    return data;
}

export async function deleteArticle(token, id) {
    const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete article");
    return data;
}

// --- SubArticles ---

export async function getSubArticles(article_id) {
    const url = article_id ? `${API_BASE_URL}/subarticles?article_id=${article_id}` : `${API_BASE_URL}/subarticles`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch subarticles");
    return response.json();
}

export async function createSubArticle(token, subarticle) {
    const response = await fetch(`${API_BASE_URL}/admin/subarticles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subarticle)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create subarticle");
    return data;
}

export async function updateSubArticle(token, id, subarticle) {
    const response = await fetch(`${API_BASE_URL}/admin/subarticles/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subarticle)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update subarticle");
    return data;
}

export async function deleteSubArticle(token, id) {
    const response = await fetch(`${API_BASE_URL}/admin/subarticles/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete subarticle");
    return data;
}
