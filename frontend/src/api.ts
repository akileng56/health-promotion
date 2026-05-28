const API_BASE_URL = "http://localhost:8080/api";

export async function getPosts() {
    const response = await fetch(`${API_BASE_URL}/posts`);

    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }

    return response.json();
}

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

export async function createPost(token, post) {
    const response = await fetch(`${API_BASE_URL}/admin/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(post)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
    }

    return data;
}

export async function updatePost(token, id, post) {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(post)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to update post");
    }

    return data;
}

export async function deletePost(token, id) {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to delete post");
    }

    return data;
}