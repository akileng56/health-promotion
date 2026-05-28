import React, { useState, useEffect } from 'react';
import { 
    login, 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from '../../api';

interface Category {
    id: number;
    name: string;
    description: string;
    subcategories?: any[];
}

const Overview = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');

    useEffect(() => {
        if (token) {
            fetchCategories();
        }
    }, [token]);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await login(username, password);
            setToken(data.token);
            localStorage.setItem('adminToken', data.token);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('adminToken');
        setCategories([]);
    };

    const handleOpenModal = (category: Category | null = null) => {
        setEditingCategory(category);
        setFormName(category ? category.name : '');
        setFormDescription(category ? category.description : '');
        setIsModalOpen(true);
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingCategory) {
                await updateCategory(token, editingCategory.id, { name: formName, description: formDescription });
            } else {
                await createCategory(token, { name: formName, description: formDescription });
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteCategory(token, id);
            fetchCategories();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (!token) {
        return (
            <div className="app">
                <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
                    <h2>Admin Login</h2>
                    {error && <div className="error">{error}</div>}
                    <form className="form" onSubmit={handleLogin}>
                        <input 
                            type="text" 
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <div className="section-header">
                <h1>Admin Overview</h1>
                <button onClick={handleLogout} className="secondary-button">Logout</button>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="card">
                <div className="section-header">
                    <h2>Disease Categories</h2>
                    <button onClick={() => handleOpenModal()}>Add Category</button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>Name</th>
                            <th style={{ padding: '0.75rem' }}>Description</th>
                            <th style={{ padding: '0.75rem' }}>Subcategories</th>
                            <th style={{ padding: '0.75rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c) => (
                            <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '0.75rem' }}>{c.name}</td>
                                <td style={{ padding: '0.75rem' }}>{c.description}</td>
                                <td style={{ padding: '0.75rem' }}>{c.subcategories?.length || 0}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <div className="actions" style={{ marginTop: 0 }}>
                                        <button 
                                            className="link-button" 
                                            style={{ color: '#2563eb' }}
                                            onClick={() => handleOpenModal(c)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="link-button" 
                                            style={{ color: '#dc2626' }}
                                            onClick={() => handleDeleteCategory(c.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                    No categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                        <form className="form" onSubmit={handleSaveCategory}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                                <input 
                                    type="text" 
                                    value={formName} 
                                    onChange={(e) => setFormName(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                <textarea 
                                    value={formDescription} 
                                    onChange={(e) => setFormDescription(e.target.value)} 
                                    rows={4}
                                />
                            </div>
                            <div className="actions">
                                <button type="submit">Save</button>
                                <button 
                                    type="button" 
                                    className="secondary-button" 
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overview;