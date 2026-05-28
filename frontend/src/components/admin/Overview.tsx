import React, { useState, useEffect } from 'react';
import { 
    login, 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    getSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getArticles,
    createArticle,
    updateArticle,
    deleteArticle
} from '../../api';

interface Category {
    id: number;
    name: string;
    description: string;
    subcategories?: SubCategory[];
}

interface SubCategory {
    id: number;
    category_id: number;
    name: string;
    description: string;
    articles?: Article[];
}

interface Article {
    id: number;
    subcategory_id: number;
    title: string;
    content: string;
}

const Overview = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Categories State
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);

    // SubCategories State
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [activeSubCategory, setActiveSubCategory] = useState<SubCategory | null>(null);

    // Articles State
    const [articles, setArticles] = useState<Article[]>([]);

    // Modal State
    const [modalType, setModalType] = useState<'category' | 'subcategory' | 'article' | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');

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

    const fetchSubCategories = async (categoryId: number) => {
        try {
            const data = await getSubCategories(categoryId);
            setSubcategories(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchArticles = async (subCategoryId: number) => {
        try {
            const data = await getArticles(subCategoryId);
            setArticles(data);
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
        resetAllState();
    };

    const resetAllState = () => {
        setCategories([]);
        setActiveCategory(null);
        setSubcategories([]);
        setActiveSubCategory(null);
        setArticles([]);
    };

    // --- Modal Handlers ---

    const openCategoryModal = (category: Category | null = null) => {
        setModalType('category');
        setEditingItem(category);
        setFormName(category ? category.name : '');
        setFormDescription(category ? category.description : '');
        setFormTitle('');
        setFormContent('');
    };

    const openSubCategoryModal = (subcategory: SubCategory | null = null) => {
        setModalType('subcategory');
        setEditingItem(subcategory);
        setFormName(subcategory ? subcategory.name : '');
        setFormDescription(subcategory ? subcategory.description : '');
        setFormTitle('');
        setFormContent('');
    };

    const openArticleModal = (article: Article | null = null) => {
        setModalType('article');
        setEditingItem(article);
        setFormTitle(article ? article.title : '');
        setFormContent(article ? article.content : '');
        setFormName('');
        setFormDescription('');
    };

    const closeModals = () => {
        setModalType(null);
        setEditingItem(null);
    };

    // --- Save Handlers ---

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (modalType === 'category') {
                if (editingItem) {
                    await updateCategory(token, editingItem.id, { name: formName, description: formDescription });
                } else {
                    await createCategory(token, { name: formName, description: formDescription });
                }
                fetchCategories();
            } else if (modalType === 'subcategory') {
                if (editingItem) {
                    await updateSubCategory(token, editingItem.id, { category_id: activeCategory!.id, name: formName, description: formDescription });
                } else {
                    await createSubCategory(token, { category_id: activeCategory!.id, name: formName, description: formDescription });
                }
                fetchSubCategories(activeCategory!.id);
            } else if (modalType === 'article') {
                if (editingItem) {
                    await updateArticle(token, editingItem.id, { subcategory_id: activeSubCategory!.id, title: formTitle, content: formContent });
                } else {
                    await createArticle(token, { subcategory_id: activeSubCategory!.id, title: formTitle, content: formContent });
                }
                fetchArticles(activeSubCategory!.id);
            }
            closeModals();
        } catch (err: any) {
            setError(err.message);
        }
    };

    // --- Delete Handlers ---

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Delete category and all its contents?')) return;
        try {
            await deleteCategory(token, id);
            if (activeCategory?.id === id) setActiveCategory(null);
            fetchCategories();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteSubCategory = async (id: number) => {
        if (!window.confirm('Delete subcategory and its articles?')) return;
        try {
            await deleteSubCategory(token, id);
            if (activeSubCategory?.id === id) setActiveSubCategory(null);
            fetchSubCategories(activeCategory!.id);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteArticle = async (id: number) => {
        if (!window.confirm('Delete this article?')) return;
        try {
            await deleteArticle(token, id);
            fetchArticles(activeSubCategory!.id);
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
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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

            {/* Breadcrumbs */}
            <div style={{ marginBottom: '1rem', color: '#64748b' }}>
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setActiveCategory(null); setActiveSubCategory(null); }}>Categories</span>
                {activeCategory && (
                    <>
                        {' > '}
                        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setActiveSubCategory(null); fetchSubCategories(activeCategory.id); }}>{activeCategory.name}</span>
                    </>
                )}
                {activeSubCategory && (
                    <>
                        {' > '}
                        <span>{activeSubCategory.name}</span>
                    </>
                )}
            </div>

            {/* Main Content Area */}
            {!activeCategory ? (
                <div className="card">
                    <div className="section-header">
                        <h2>Disease Categories</h2>
                        <button onClick={() => openCategoryModal()}>Add Category</button>
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
                                    <td style={{ padding: '0.75rem' }}>
                                        <button className="link-button" onClick={() => { setActiveCategory(c); fetchSubCategories(c.id); }}>{c.name}</button>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{c.description}</td>
                                    <td style={{ padding: '0.75rem' }}>{c.subcategories?.length || 0}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div className="actions" style={{ marginTop: 0 }}>
                                            <button className="link-button" style={{ color: '#2563eb' }} onClick={() => openCategoryModal(c)}>Edit</button>
                                            <button className="link-button" style={{ color: '#dc2626' }} onClick={() => handleDeleteCategory(c.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : !activeSubCategory ? (
                <div className="card">
                    <div className="section-header">
                        <h2>Subcategories of "{activeCategory.name}"</h2>
                        <button onClick={() => openSubCategoryModal()}>Add Subcategory</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem' }}>Name</th>
                                <th style={{ padding: '0.75rem' }}>Description</th>
                                <th style={{ padding: '0.75rem' }}>Articles</th>
                                <th style={{ padding: '0.75rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcategories.map((sc) => (
                                <tr key={sc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <button className="link-button" onClick={() => { setActiveSubCategory(sc); fetchArticles(sc.id); }}>{sc.name}</button>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{sc.description}</td>
                                    <td style={{ padding: '0.75rem' }}>{sc.articles?.length || 0}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div className="actions" style={{ marginTop: 0 }}>
                                            <button className="link-button" style={{ color: '#2563eb' }} onClick={() => openSubCategoryModal(sc)}>Edit</button>
                                            <button className="link-button" style={{ color: '#dc2626' }} onClick={() => handleDeleteSubCategory(sc.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {subcategories.length === 0 && (
                                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No subcategories found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card">
                    <div className="section-header">
                        <h2>Articles in "{activeSubCategory.name}"</h2>
                        <button onClick={() => openArticleModal()}>Add Article</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem' }}>Title</th>
                                <th style={{ padding: '0.75rem' }}>Content Preview</th>
                                <th style={{ padding: '0.75rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((a) => (
                                <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '0.75rem' }}>{a.title}</td>
                                    <td style={{ padding: '0.75rem' }}>{a.content.substring(0, 100)}...</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div className="actions" style={{ marginTop: 0 }}>
                                            <button className="link-button" style={{ color: '#2563eb' }} onClick={() => openArticleModal(a)}>Edit</button>
                                            <button className="link-button" style={{ color: '#dc2626' }} onClick={() => handleDeleteArticle(a.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No articles found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Generic Modal */}
            {modalType && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
                        <h3>{editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h3>
                        <form className="form" onSubmit={handleSave}>
                            {modalType === 'article' ? (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                                        <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Content</label>
                                        <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={10} required />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                                        <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                        <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={4} />
                                    </div>
                                </>
                            )}
                            <div className="actions">
                                <button type="submit">Save</button>
                                <button type="button" className="secondary-button" onClick={closeModals}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overview;