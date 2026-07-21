export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8421/api";
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

async function handleResponse(response: Response, skipRedirect: boolean = false): Promise<any> {
    if (response.status === 401 && !skipRedirect) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
        throw new Error("Session expired. Please login again.");
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }
    return data;
}

export async function login(username: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    return handleResponse(response, true);
}

// --- Categories ---

export async function getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse(response);
}

export async function createCategory(token: string, category: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(category)
    });
    return handleResponse(response);
}

export async function updateCategory(token: string, id: number, category: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(category)
    });
    return handleResponse(response);
}

export async function deleteCategory(token: string, id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return handleResponse(response);
}

// --- SubCategories ---

export async function getSubCategories(category_id?: number | boolean) {
    const url = category_id ? `${API_BASE_URL}/subcategories?category_id=${category_id}` : `${API_BASE_URL}/subcategories`;
    const response = await fetch(url);
    return handleResponse(response);
}

export async function getSubCategory(id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`);
    return handleResponse(response);
}

export async function createSubCategory(token: string, subcategory: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subcategory)
    });
    return handleResponse(response);
}

export async function updateSubCategory(token: string, id: number, subcategory: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subcategory)
    });
    return handleResponse(response);
}

export async function deleteSubCategory(token: string, id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return handleResponse(response);
}

// --- Articles ---

export async function getArticles(subcategory_id?: number): Promise<any> {
    const url = subcategory_id ? `${API_BASE_URL}/articles?subcategory_id=${subcategory_id}` : `${API_BASE_URL}/articles`;
    const response = await fetch(url);
    return handleResponse(response);
}

export async function createArticle(token: string, article: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/articles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(article)
    });
    return handleResponse(response);
}

export async function updateArticle(token: string, id: number, article: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(article)
    });
    return handleResponse(response);
}

export async function deleteArticle(token: string, id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return handleResponse(response);
}

// --- SubArticles ---

export async function getSubArticles(article_id?: number): Promise<any> {
    const url = article_id ? `${API_BASE_URL}/subarticles?article_id=${article_id}` : `${API_BASE_URL}/subarticles`;
    const response = await fetch(url);
    return handleResponse(response);
}

export async function createSubArticle(token: string, subarticle: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/subarticles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subarticle)
    });
    return handleResponse(response);
}

export async function updateSubArticle(token: string, id: number, subarticle: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/subarticles/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subarticle)
    });
    return handleResponse(response);
}

export async function deleteSubArticle(token: string, id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/subarticles/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return handleResponse(response);
}

// --- Uploads ---

export async function uploadImage(token: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    return handleResponse(response);
}

