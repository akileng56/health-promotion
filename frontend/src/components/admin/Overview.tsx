import React, { useState, useEffect, useRef } from 'react';
import { 
    SERVER_BASE_URL,
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
    deleteArticle,
    getSubArticles,
    createSubArticle,
    updateSubArticle,
    deleteSubArticle,
    uploadImage,
    getSubCategory
} from '../../api';
// @ts-ignore
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
    subarticles?: SubArticle[];
}

interface SubArticle {
    id: number;
    article_id: number;
    title: string;
    content: string;
}

const Overview = () => {
    const [token, setToken] = useState<string>(localStorage.getItem('adminToken') || '');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Navigation and Views State
    const [activeTab, setActiveTab] = useState<'categories' | 'subcategories' | 'editor'>('categories');

    // Categories State
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);

    // SubCategories State
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [activeSubCategory, setActiveSubCategory] = useState<SubCategory | null>(null);

    // Page Builder Data
    const [pageData, setPageData] = useState<SubCategory | null>(null);
    const [pageLoading, setPageLoading] = useState(false);
    
    // Gutenberg Editor Block Selection
    const [selectedBlock, setSelectedBlock] = useState<{
        type: 'article' | 'subarticle';
        id: number; // 0 for new
        parentId?: number; // for subarticle
        data: {
            title: string;
            content: string;
        }
    } | null>(null);

    // Inspector draft form fields
    const [inspectorTitle, setInspectorTitle] = useState('');
    const [inspectorContent, setInspectorContent] = useState('');
    const [selectedSaId, setSelectedSaId] = useState<number | null>(null);

    // Document settings (Subcategory details)
    const [subCatFormName, setSubCatFormName] = useState('');
    const [subCatFormDescription, setSubCatFormDescription] = useState('');

    // Modal State for Categories and Subcategories (metadata nodes)
    const [modalType, setModalType] = useState<'category' | 'subcategory' | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [modalName, setModalName] = useState('');
    const [modalDescription, setModalDescription] = useState('');

    // Carbon Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        label?: string;
        danger?: boolean;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const quillRef = useRef<any>(null);
    const [lastRange, setLastRange] = useState<any>(null);

    // Fetch categories on login
    useEffect(() => {
        if (token) {
            fetchCategories();
        }
    }, [token]);

    // Fetch subcategories when category selection changes
    useEffect(() => {
        if (activeCategory) {
            fetchSubCategories(activeCategory.id);
        } else {
            setSubcategories([]);
        }
    }, [activeCategory]);

    // Fetch layout details when subcategory selection changes
    useEffect(() => {
        if (activeSubCategory) {
            fetchPageData(activeSubCategory.id);
            setSelectedBlock(null);
            setSelectedSaId(null);
        } else {
            setPageData(null);
            setSelectedSaId(null);
        }
    }, [activeSubCategory]);

    // Populating inspector form values
    useEffect(() => {
        if (selectedBlock) {
            setInspectorTitle(selectedBlock.data.title);
            setInspectorContent(selectedBlock.data.content);
            if (selectedBlock.type === 'subarticle' && selectedBlock.id > 0) {
                setSelectedSaId(selectedBlock.id);
            } else if (selectedBlock.type === 'article') {
                setSelectedSaId(null);
            }
        } else {
            setInspectorTitle('');
            setInspectorContent('');
            // Do not clear selectedSaId here so the view stays filtered on the sub-article after edit save/cancel
        }
    }, [selectedBlock]);

    // Populating document settings
    useEffect(() => {
        if (activeSubCategory) {
            setSubCatFormName(activeSubCategory.name);
            setSubCatFormDescription(activeSubCategory.description || '');
        } else {
            setSubCatFormName('');
            setSubCatFormDescription('');
        }
    }, [activeSubCategory]);

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

    const fetchPageData = async (subCategoryId: number) => {
        setPageLoading(true);
        setError(null);
        try {
            const data = await getSubCategory(subCategoryId);
            setPageData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setPageLoading(false);
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
        setToken('');
        localStorage.removeItem('adminToken');
        resetAllState();
    };

    const resetAllState = () => {
        setCategories([]);
        setActiveCategory(null);
        setSubcategories([]);
        setActiveSubCategory(null);
        setPageData(null);
        setSelectedBlock(null);
        setActiveTab('categories');
    };

    // Quill Image Handler
    const imageHandler = React.useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file && token) {
                try {
                    const data = await uploadImage(token, file);
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    const index = range ? range.index : quill.getLength();
                    const html = `<img class="content-image-style" src="${SERVER_BASE_URL}${data.image_url}" alt="${file.name}"/>`;
                    quill.clipboard.dangerouslyPasteHTML(index, html);
                } catch (err: any) {
                    setError('Image upload failed: ' + err.message);
                }
            }
        };
    }, [token]);

    // Quill Video Handler
    const videoHandler = React.useCallback(() => {
        const url = prompt('Enter YouTube Video URL:');
        if (url) {
            let videoId = '';
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('embed/')[1].split('?')[0];
            }

            if (videoId) {
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                const index = range ? range.index : quill.getLength();
                const html = `<iframe class="ql-video" allowfullscreen="allowfullscreen" src="${embedUrl}" width="100%" height="468"></iframe>`;
                quill.clipboard.dangerouslyPasteHTML(index, html);
            } else {
                alert('Invalid YouTube URL');
            }
        }
    }, []);

    const quillModules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link', 'blockquote', 'code-block'],
                ['image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
                video: videoHandler
            }
        }
    }), [imageHandler, videoHandler]);

    // --- Modal Handlers (Categories & Subcategories) ---
    const openCategoryModal = (category: Category | null = null) => {
        setModalType('category');
        setEditingItem(category);
        setModalName(category ? category.name : '');
        setModalDescription(category ? category.description : '');
    };

    const openSubCategoryModal = (subcategory: SubCategory | null = null) => {
        setModalType('subcategory');
        setEditingItem(subcategory);
        setModalName(subcategory ? subcategory.name : '');
        setModalDescription(subcategory ? subcategory.description : '');
    };

    const closeModals = () => {
        setModalType(null);
        setEditingItem(null);
        setModalName('');
        setModalDescription('');
    };

    const handleSaveModal = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (modalType === 'category') {
                if (editingItem) {
                    const updated = await updateCategory(token, editingItem.id, { name: modalName, description: modalDescription });
                    if (activeCategory?.id === editingItem.id) {
                        setActiveCategory(prev => prev ? { ...prev, ...updated } : updated);
                    }
                } else {
                    await createCategory(token, { name: modalName, description: modalDescription });
                }
                fetchCategories();
            } else if (modalType === 'subcategory') {
                if (editingItem) {
                    const catId = editingItem.category_id || activeCategory?.id || activeSubCategory?.category_id;
                    const updated = await updateSubCategory(token, editingItem.id, { 
                        category_id: catId, 
                        name: modalName, 
                        description: modalDescription 
                    });
                    if (activeSubCategory?.id === editingItem.id) {
                        setActiveSubCategory(prev => prev ? { ...prev, ...updated } : updated);
                        fetchPageData(editingItem.id);
                    }
                    if (catId) {
                        fetchSubCategories(catId);
                    }
                    fetchCategories();
                } else {
                    const catId = activeCategory?.id || activeSubCategory?.category_id;
                    if (catId) {
                        await createSubCategory(token, { category_id: catId, name: modalName, description: modalDescription });
                        fetchSubCategories(catId);
                    }
                    fetchCategories();
                }
            }
            closeModals();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteCategory = (id: number) => {
        const cat = categories.find(c => c.id === id);
        setConfirmModal({
            isOpen: true,
            label: 'Category Management',
            title: 'Delete Category',
            message: `Are you sure you want to delete "${cat?.name || 'this category'}" and all of its contents? This action cannot be undone.`,
            confirmText: 'Delete Category',
            cancelText: 'Cancel',
            danger: true,
            onConfirm: async () => {
                try {
                    await deleteCategory(token, id);
                    if (activeCategory?.id === id) {
                        setActiveCategory(null);
                        setActiveSubCategory(null);
                        setActiveTab('categories');
                    }
                    fetchCategories();
                } catch (err: any) {
                    setError(err.message);
                }
            }
        });
    };

    const handleDeleteSubCategory = (id: number) => {
        const sub = subcategories.find(s => s.id === id);
        setConfirmModal({
            isOpen: true,
            label: 'Subcategory Management',
            title: 'Delete Subcategory',
            message: `Are you sure you want to delete "${sub?.name || 'this subcategory'}" and its articles? This action cannot be undone.`,
            confirmText: 'Delete Subcategory',
            cancelText: 'Cancel',
            danger: true,
            onConfirm: async () => {
                try {
                    await deleteSubCategory(token, id);
                    if (activeSubCategory?.id === id) {
                        setActiveSubCategory(null);
                        setActiveTab('subcategories');
                    }
                    if (activeCategory) {
                        fetchSubCategories(activeCategory.id);
                    }
                } catch (err: any) {
                    setError(err.message);
                }
            }
        });
    };

    // --- Block Layout Editor Handlers ---

    const handleSaveInspectorBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBlock || !activeSubCategory || !token) return;
        setError(null);
        try {
            if (selectedBlock.type === 'article') {
                const articleData = {
                    subcategory_id: activeSubCategory.id,
                    title: inspectorTitle,
                    content: inspectorContent
                };
                if (selectedBlock.id > 0) {
                    await updateArticle(token, selectedBlock.id, articleData);
                } else {
                    await createArticle(token, articleData);
                }
            } else if (selectedBlock.type === 'subarticle') {
                const subArticleData = {
                    article_id: selectedBlock.parentId!,
                    title: inspectorTitle,
                    content: inspectorContent
                };
                if (selectedBlock.id > 0) {
                    await updateSubArticle(token, selectedBlock.id, subArticleData);
                } else {
                    await createSubArticle(token, subArticleData);
                }
            }
            // Refresh
            await fetchPageData(activeSubCategory.id);
            setSelectedBlock(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteArticleFromEditor = (id: number) => {
        const article = pageData?.articles?.find((art: any) => art.id === id);
        setConfirmModal({
            isOpen: true,
            label: 'Page Layout Editor',
            title: 'Delete Article Block',
            message: `Are you sure you want to delete article "${article?.title || 'this article'}" and all of its subarticles? This action cannot be undone.`,
            confirmText: 'Delete Article',
            cancelText: 'Cancel',
            danger: true,
            onConfirm: async () => {
                setError(null);
                try {
                    await deleteArticle(token, id);
                    if (selectedBlock?.type === 'article' && selectedBlock.id === id) {
                        setSelectedBlock(null);
                    }
                    if (article && selectedSaId && article.subarticles?.some((sa: any) => sa.id === selectedSaId)) {
                        setSelectedSaId(null);
                    }
                    if (activeSubCategory) {
                        fetchPageData(activeSubCategory.id);
                    }
                } catch (err: any) {
                    setError(err.message);
                }
            }
        });
    };

    const handleDeleteSubArticleFromEditor = (id: number) => {
        let subTitle = 'this subarticle';
        pageData?.articles?.forEach((art: any) => {
            const found = art.subarticles?.find((sa: any) => sa.id === id);
            if (found) subTitle = found.title;
        });
        setConfirmModal({
            isOpen: true,
            label: 'Page Layout Editor',
            title: 'Delete Sub-article',
            message: `Are you sure you want to delete "${subTitle}"? This action cannot be undone.`,
            confirmText: 'Delete Sub-article',
            cancelText: 'Cancel',
            danger: true,
            onConfirm: async () => {
                setError(null);
                try {
                    await deleteSubArticle(token, id);
                    if (selectedBlock?.type === 'subarticle' && selectedBlock.id === id) {
                        setSelectedBlock(null);
                    }
                    if (selectedSaId === id) {
                        setSelectedSaId(null);
                    }
                    if (activeSubCategory) {
                        fetchPageData(activeSubCategory.id);
                    }
                } catch (err: any) {
                    setError(err.message);
                }
            }
        });
    };

    const handleSaveSubCategoryDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeSubCategory || !activeCategory || !token) return;
        setError(null);
        try {
            const updated = await updateSubCategory(token, activeSubCategory.id, {
                category_id: activeCategory.id,
                name: subCatFormName,
                description: subCatFormDescription
            });
            setActiveSubCategory(updated);
            fetchPageData(activeSubCategory.id);
            fetchSubCategories(activeCategory.id);
            fetchCategories();
            alert("Subcategory page settings updated!");
        } catch (err: any) {
            setError(err.message);
        }
    };

    // YouTube parser helper
    const getYouTubeEmbedUrl = (url?: string) => {
        if (!url) return null;
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    // --- RENDER LOGIN IF NO TOKEN ---
    if (!token) {
        return (
            <div className="wp-login-wrapper">
                <div className="wp-login-container">
                    <div className="wp-login-logo">
                        <img src="/assets/img/logo.png" alt="logo" />
                        <h4>Health promotion portal</h4>
                    </div>
                    {error && <div className="alert alert-danger p-2 small">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Username</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 fw-bold" style={{ backgroundColor: '#2271b1', borderColor: '#2271b1' }}>
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="wp-admin-wrapper">

            {/* left sidebar dashboard nav */}
            <div className="wp-sidebar">
                <ul className="wp-sidebar-menu">
                    <li className="wp-sidebar-menu-item">
                        <button 
                            className={`wp-sidebar-menu-link ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('categories');
                                setActiveCategory(null);
                                setActiveSubCategory(null);
                            }}
                        >
                            <i className="bi bi-folder-fill"></i> Categories
                        </button>
                    </li>
                    <li className="wp-sidebar-menu-item">
                        <button 
                            className={`wp-sidebar-menu-link ${activeTab === 'subcategories' ? 'active' : ''} ${!activeCategory ? 'disabled' : ''}`}
                            onClick={() => {
                                if (activeCategory) setActiveTab('subcategories');
                            }}
                            disabled={!activeCategory}
                        >
                            <i className="bi bi-file-earmark-medical-fill"></i> Subcategories
                        </button>
                    </li>
                    <li className="wp-sidebar-menu-item">
                        <button 
                            className={`wp-sidebar-menu-link ${activeTab === 'editor' ? 'active' : ''} ${!activeSubCategory ? 'disabled' : ''}`}
                            onClick={() => {
                                if (activeSubCategory) {
                                    setActiveTab('editor');
                                    setSelectedSaId(null);
                                    setSelectedBlock(null);
                                }
                            }}
                            disabled={!activeSubCategory}
                        >
                            <i className="bi bi-layout-text-sidebar-reverse"></i> Page Layout Editor
                        </button>
                    </li>
                </ul>
                <div className="wp-sidebar-footer">
                    <div className="wp-sidebar-user">
                        <i className="bi bi-person-circle fs-5"></i>
                        <span className="text-truncate" style={{ maxWidth: '160px' }}>Administrator</span>
                    </div>
                    <button onClick={handleLogout} className="wp-logout-btn">
                        <i className="bi bi-box-arrow-left"></i> Logout
                    </button>
                </div>
            </div>

            {/* main workspace content */}
            <div className="wp-main-content">
                {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>}

                {/* BREADCRUMBS BAR */}
                <div className="wp-breadcrumbs-container">
                    <span 
                        className="wp-breadcrumb-item" 
                        onClick={() => { 
                            setActiveCategory(null); 
                            setActiveSubCategory(null); 
                            setActiveTab('categories'); 
                        }}
                    >
                        Categories
                    </span>
                    {activeCategory && (
                        <>
                            <span className="wp-breadcrumb-separator"><i className="bi bi-chevron-right"></i></span>
                            <span 
                                className="wp-breadcrumb-item" 
                                onClick={() => { 
                                    setActiveSubCategory(null); 
                                    setActiveTab('subcategories'); 
                                }}
                            >
                                {activeCategory.name}
                            </span>
                        </>
                    )}
                    {activeSubCategory && (
                        <>
                            <span className="wp-breadcrumb-separator"><i className="bi bi-chevron-right"></i></span>
                            <span className="wp-breadcrumb-current">{activeSubCategory.name}</span>
                        </>
                    )}
                </div>

                {/* --- 1. CATEGORIES VIEW --- */}
                {activeTab === 'categories' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold text-dark m-0">Disease Categories</h3>
                            <button className="wp-btn-primary" onClick={() => openCategoryModal()}>
                                <i className="bi bi-plus-lg me-1"></i> Add Category
                            </button>
                        </div>

                        <div className="wp-card-grid">
                            {categories.map((c) => (
                                <div key={c.id} className="wp-dashboard-card">
                                    <div className="wp-card-header">
                                        <h4 className="wp-card-title">{c.name}</h4>
                                        <span className="wp-card-badge">
                                            {c.subcategories?.length || 0} Subcategories
                                        </span>
                                    </div>
                                    <div className="wp-card-body">
                                        <p className="m-0 text-truncate-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {c.description || "No description provided."}
                                        </p>
                                    </div>
                                    <div className="wp-card-actions">
                                        <button 
                                            className="wp-btn-primary btn-sm flex-grow-1"
                                            onClick={() => {
                                                setActiveCategory(c);
                                                setActiveTab('subcategories');
                                            }}
                                        >
                                            Subcategories <i className="bi bi-arrow-right-short"></i>
                                        </button>
                                        <button className="wp-btn-secondary" onClick={() => openCategoryModal(c)} title="Edit">
                                            <i className="bi bi-pencil-fill"></i>
                                        </button>
                                        <button className="wp-btn-danger" onClick={() => handleDeleteCategory(c.id)} title="Delete">
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <div className="text-center w-100 py-5 text-muted bg-white rounded border">
                                    <i className="bi bi-folder2-open display-4 mb-2 text-secondary"></i>
                                    <h5>No categories found</h5>
                                    <p className="small">Click "Add Category" to create your first disease category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- 2. SUBCATEGORIES VIEW --- */}
                {activeTab === 'subcategories' && activeCategory && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold text-dark m-0">Subcategories</h3>
                                <span className="text-secondary small">Under category: <strong>{activeCategory.name}</strong></span>
                            </div>
                            <button className="wp-btn-primary" onClick={() => openSubCategoryModal()}>
                                <i className="bi bi-plus-lg me-1"></i> Add Subcategory
                            </button>
                        </div>

                        <div className="wp-card-grid">
                            {subcategories.map((sc) => (
                                <div key={sc.id} className="wp-dashboard-card">
                                    <div className="wp-card-header">
                                        <h4 className="wp-card-title">{sc.name}</h4>
                                        <span className="wp-card-badge bg-success bg-opacity-10 text-success">
                                            {sc.articles?.length || 0} Articles
                                        </span>
                                    </div>
                                    <div className="wp-card-body">
                                        <p className="m-0 text-truncate-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {sc.description || "No description provided."}
                                        </p>
                                    </div>
                                    <div className="wp-card-actions">
                                        <button 
                                            className="wp-btn-primary btn-sm flex-grow-1"
                                            style={{ backgroundColor: '#46b450', borderColor: '#46b450' }}
                                            onClick={() => {
                                                setActiveSubCategory(sc);
                                                setActiveTab('editor');
                                                setSelectedSaId(null);
                                                setSelectedBlock(null);
                                            }}
                                        >
                                            <i className="bi bi-layout-text-sidebar-reverse me-1"></i> Page Layout
                                        </button>
                                        <button className="wp-btn-secondary" onClick={() => openSubCategoryModal(sc)} title="Edit Details">
                                            <i className="bi bi-pencil-fill"></i>
                                        </button>
                                        <button className="wp-btn-danger" onClick={() => handleDeleteSubCategory(sc.id)} title="Delete">
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {subcategories.length === 0 && (
                                <div className="text-center w-100 py-5 text-muted bg-white rounded border">
                                    <i className="bi bi-file-earmark-medical display-4 mb-2 text-secondary"></i>
                                    <h5>No subcategories found</h5>
                                    <p className="small">Click "Add Subcategory" to start managing topics under {activeCategory.name}.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- 3. INLINE VISUAL LAYOUT EDITOR VIEW --- */}
                {activeTab === 'editor' && activeSubCategory && (
                    <div className="editor-layout-view">
                        
                        {/* Page Header (Matching Details.tsx style) */}
                        <div className="page-title light-background" style={{ padding: '20px 0', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
                            <div className="container d-flex justify-content-between align-items-center">
                                <div>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary me-3" 
                                        onClick={() => {
                                            setActiveTab('subcategories');
                                            setSelectedBlock(null);
                                        }}
                                        title="Back to subcategories"
                                    >
                                        <i className="bi bi-arrow-left"></i> Back
                                    </button>
                                    <span style={{ fontSize: '1.8rem', fontWeight: 600, color: '#2c4964', verticalAlign: 'middle' }}>
                                        {activeSubCategory.name}
                                    </span>
                                </div>
                                <div className="d-flex gap-2">
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => {
                                            openSubCategoryModal(activeSubCategory);
                                        }}
                                    >
                                        <i className="bi bi-gear-fill me-1"></i> Page Settings
                                    </button>
                                    {pageData?.articles && pageData.articles.length > 0 ? (
                                        <button 
                                            className="btn btn-success btn-sm"
                                            onClick={() => {
                                                setSelectedBlock({
                                                    type: 'subarticle',
                                                    id: 0,
                                                    parentId: pageData.articles[0].id,
                                                    data: {
                                                        title: 'New Sub-article Title',
                                                        content: '<p>Enter sub-article content...</p>'
                                                    }
                                                });
                                            }}
                                        >
                                            <i className="bi bi-plus-lg me-1"></i> Add Sub-article
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                setSelectedBlock({
                                                    type: 'article',
                                                    id: 0,
                                                    data: {
                                                        title: 'New Article Title',
                                                        content: '<p>Enter article content here...</p>'
                                                    }
                                                });
                                            }}
                                        >
                                            <i className="bi bi-plus-lg me-1"></i> Add Article
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Page Content Container */}
                        <div className="container py-4">
                            {pageLoading ? (
                                <div className="text-center py-5">
                                    <span className="spinner-border text-primary" role="status"></span>
                                    <p className="mt-2 text-muted small">Loading page editor canvas...</p>
                                </div>
                            ) : (
                                <div className="row">
                                    {/* Main Content Area (col-lg-8) */}
                                    <div className="col-lg-8">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            
                                            {/* Articles list */}
                                            {pageData?.articles && pageData.articles.length > 0 ? (
                                                pageData.articles.map((article: any) => {
                                                    const subsToShow = selectedSaId 
                                                        ? article.subarticles?.filter((sa: any) => sa.id === selectedSaId)
                                                        : [];
                                                    
                                                    // If a subarticle is selected but doesn't belong to this article, don't render this article
                                                    if (selectedSaId && (!subsToShow || subsToShow.length === 0)) return null;

                                                    const isArticleActive = selectedBlock?.type === 'article' && selectedBlock.id === article.id;
                                                    
                                                    return (
                                                        <div 
                                                            key={article.id} 
                                                            className={`article wp-block-wrapper ${isArticleActive ? 'is-active' : ''}`}
                                                            style={{
                                                                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                                borderRadius: '8px',
                                                                backgroundColor: '#fff',
                                                                padding: '2rem',
                                                                border: isArticleActive ? '2px solid #1977cc' : '2px solid transparent',
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            {/* Action Bar (shows on hover / active) */}
                                                            {/* Left toolbar (Article Block + Edit + Delete) */}
                                                            <div className="wp-block-toolbar" style={{ display: isArticleActive ? 'flex' : undefined }}>
                                                                <span className="me-2" style={{ opacity: 0.85 }}>Article Block</span>
                                                                <button 
                                                                    className="wp-toolbar-btn" 
                                                                    title="Edit Article"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedBlock({
                                                                            type: 'article',
                                                                            id: article.id,
                                                                            data: {
                                                                                title: article.title,
                                                                                content: article.content
                                                                            }
                                                                        });
                                                                    }}
                                                                >
                                                                    <i className="bi bi-pencil-fill"></i> Edit
                                                                </button>
                                                                <button 
                                                                    className="wp-toolbar-btn" 
                                                                    title="Delete Block"
                                                                    style={{ color: '#ff8a8a' }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteArticleFromEditor(article.id);
                                                                    }}
                                                                >
                                                                    <i className="bi bi-trash-fill"></i> Delete
                                                                </button>
                                                            </div>

                                                            {/* Right toolbar (Add Nested Sub-article) */}
                                                            <div className="wp-block-toolbar" style={{ display: isArticleActive ? 'flex' : undefined, left: 'auto', right: '12px' }}>
                                                                <button 
                                                                    className="wp-toolbar-btn" 
                                                                    title="Add Nested Sub-article"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedBlock({
                                                                            type: 'subarticle',
                                                                            id: 0,
                                                                            parentId: article.id,
                                                                            data: {
                                                                                title: 'New Sub-article Title',
                                                                                content: '<p>Enter sub-article content...</p>'
                                                                            }
                                                                        });
                                                                    }}
                                                                >
                                                                    <i className="bi bi-plus-lg"></i> Add Sub-article
                                                                </button>
                                                            </div>

                                                            {/* Inline Editor or Display */}
                                                            {isArticleActive ? (
                                                                <form onSubmit={handleSaveInspectorBlock} onClick={(e) => e.stopPropagation()} className="p-1">
                                                                    <div className="mb-3">
                                                                        <label className="form-label small fw-bold text-secondary">Article Title</label>
                                                                        <input 
                                                                            type="text" 
                                                                            className="form-control fw-bold" 
                                                                            style={{ fontSize: '1.25rem', color: '#2c4964' }}
                                                                            value={inspectorTitle} 
                                                                            onChange={(e) => setInspectorTitle(e.target.value)} 
                                                                            required 
                                                                        />
                                                                    </div>
                                                                    <div className="mb-3">
                                                                        <label className="form-label small fw-bold text-secondary">Article Content</label>
                                                                        <ReactQuill 
                                                                            ref={quillRef}
                                                                            theme="snow"
                                                                            value={inspectorContent} 
                                                                            onChange={setInspectorContent}
                                                                            onBlur={(range: any, source: any, editor: any) => setLastRange(range)}
                                                                            modules={quillModules}
                                                                            style={{ backgroundColor: 'white' }}
                                                                        />
                                                                    </div>
                                                                    <div className="d-flex gap-2">
                                                                        <button type="submit" className="btn btn-sm btn-primary">
                                                                            <i className="bi bi-check-circle me-1"></i> Save Changes
                                                                        </button>
                                                                        <button 
                                                                            type="button" 
                                                                            className="btn btn-sm btn-outline-secondary"
                                                                            onClick={() => setSelectedBlock(null)}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            ) : (
                                                                <>
                                                                    <h2 className="title" style={{ fontSize: '2rem', fontWeight: 600, color: '#2c4964', marginBottom: selectedSaId ? '0' : '1.25rem' }}>{article.title}</h2>
                                                                    {!selectedSaId && (
                                                                        <div className="content">
                                                                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* Nested Subarticles Wrapper */}
                                                            {((selectedSaId && subsToShow && subsToShow.length > 0) || 
                                                             (selectedBlock && selectedBlock.type === 'subarticle' && selectedBlock.parentId === article.id)) && (
                                                                <div className="subarticles" style={{ 
                                                                    marginTop: selectedSaId ? '0' : '2.5rem', 
                                                                    backgroundColor: '#f8f9fa',
                                                                    padding: '1.5rem',
                                                                    borderRadius: '8px'
                                                                }}>
                                                                    {!selectedSaId && (
                                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                                            <h4 style={{ fontWeight: 'bold', color: '#2c4964', margin: 0, fontSize: '1.1rem' }}>Sub-articles</h4>
                                                                            <button 
                                                                                className="btn btn-xs btn-outline-success"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedBlock({
                                                                                        type: 'subarticle',
                                                                                        id: 0,
                                                                                        parentId: article.id,
                                                                                        data: {
                                                                                            title: 'New Sub-article Title',
                                                                                            content: '<p>Enter sub-article content...</p>'
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                                                                            >
                                                                                <i className="bi bi-plus-lg"></i> Add Sub-article
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {/* Subarticles list */}
                                                                    {subsToShow && subsToShow.length > 0 && (
                                                                        subsToShow.map((sa: any) => {
                                                                            const isSubActive = selectedBlock?.type === 'subarticle' && selectedBlock.id === sa.id;
                                                                            
                                                                            return isSubActive ? (
                                                                                <div key={sa.id} className="p-3 mb-3 bg-white border rounded shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                                                    <h5 className="text-success fw-bold mb-3">Edit Sub-article</h5>
                                                                                    <form onSubmit={handleSaveInspectorBlock}>
                                                                                        <div className="mb-3">
                                                                                            <label className="form-label small fw-bold text-secondary">Sub-article Title</label>
                                                                                            <input 
                                                                                                type="text" 
                                                                                                className="form-control fw-bold" 
                                                                                                value={inspectorTitle} 
                                                                                                onChange={(e) => setInspectorTitle(e.target.value)} 
                                                                                                required 
                                                                                            />
                                                                                        </div>
                                                                                        <div className="mb-3">
                                                                                            <label className="form-label small fw-bold text-secondary">Sub-article Content</label>
                                                                                            <ReactQuill 
                                                                                                ref={quillRef}
                                                                                                theme="snow"
                                                                                                value={inspectorContent} 
                                                                                                onChange={setInspectorContent}
                                                                                                onBlur={(range: any, source: any, editor: any) => setLastRange(range)}
                                                                                                modules={quillModules}
                                                                                                style={{ backgroundColor: 'white' }}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="d-flex gap-2">
                                                                                            <button type="submit" className="btn btn-sm btn-success">
                                                                                                <i className="bi bi-check-circle me-1"></i> Save Changes
                                                                                            </button>
                                                                                            <button 
                                                                                                type="button" 
                                                                                                className="btn btn-sm btn-outline-secondary"
                                                                                                onClick={() => setSelectedBlock(null)}
                                                                                            >
                                                                                                Cancel
                                                                                            </button>
                                                                                        </div>
                                                                                    </form>
                                                                                </div>
                                                                            ) : (
                                                                                <div 
                                                                                    key={sa.id}
                                                                                    className={`wp-block-subarticle-wrapper ${isSubActive ? 'is-active' : ''}`}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedSaId(sa.id);
                                                                                        setSelectedBlock(null);
                                                                                    }}
                                                                                    style={{ 
                                                                                        cursor: 'pointer',
                                                                                        padding: '1.5rem',
                                                                                        marginBottom: '1rem',
                                                                                        borderRadius: '6px',
                                                                                        backgroundColor: '#fff',
                                                                                        border: isSubActive ? '2px solid #46b450' : '2px solid transparent',
                                                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                                                        position: 'relative'
                                                                                    }}
                                                                                >
                                                                                    {/* Actions toolbar */}
                                                                                    <div className="wp-block-toolbar" style={{ display: isSubActive ? 'flex' : undefined }}>
                                                                                        <span>Sub-article Block</span>
                                                                                        <button 
                                                                                            className="wp-toolbar-btn" 
                                                                                            title="Edit Sub-article"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setSelectedBlock({
                                                                                                    type: 'subarticle',
                                                                                                    id: sa.id,
                                                                                                    parentId: article.id,
                                                                                                    data: {
                                                                                                        title: sa.title,
                                                                                                        content: sa.content
                                                                                                    }
                                                                                                });
                                                                                            }}
                                                                                        >
                                                                                            <i className="bi bi-pencil-fill"></i> Edit
                                                                                        </button>
                                                                                        <button 
                                                                                            className="wp-toolbar-btn" 
                                                                                            title="Delete Sub-article"
                                                                                            style={{ color: '#ff8a8a' }}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleDeleteSubArticleFromEditor(sa.id);
                                                                                            }}
                                                                                        >
                                                                                            <i className="bi bi-trash-fill"></i>
                                                                                        </button>
                                                                                    </div>

                                                                                    <h4 style={{ fontWeight: 'bold', color: '#1977cc', fontSize: '1.1rem', marginBottom: '0.75rem' }}>{sa.title}</h4>
                                                                                    <div style={{ fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: sa.content }} />
                                                                                </div>
                                                                            );
                                                                        })
                                                                    )}

                                                                    {/* Add New Sub-article inline form */}
                                                                    {selectedBlock && selectedBlock.type === 'subarticle' && selectedBlock.id === 0 && selectedBlock.parentId === article.id && (
                                                                        <div className="p-3 mb-3 bg-white border rounded shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                                            <h5 className="text-success fw-bold mb-3">Add New Sub-article</h5>
                                                                            <form onSubmit={handleSaveInspectorBlock}>
                                                                                <div className="mb-3">
                                                                                    <label className="form-label small fw-bold text-secondary">Sub-article Title</label>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        className="form-control fw-bold" 
                                                                                        value={inspectorTitle} 
                                                                                        onChange={(e) => setInspectorTitle(e.target.value)} 
                                                                                        required 
                                                                                    />
                                                                                </div>
                                                                                <div className="mb-3">
                                                                                    <label className="form-label small fw-bold text-secondary">Sub-article Content</label>
                                                                                    <ReactQuill 
                                                                                        ref={quillRef}
                                                                                        theme="snow"
                                                                                        value={inspectorContent} 
                                                                                        onChange={setInspectorContent}
                                                                                        onBlur={(range: any, source: any, editor: any) => setLastRange(range)}
                                                                                        modules={quillModules}
                                                                                        style={{ backgroundColor: 'white' }}
                                                                                    />
                                                                                </div>
                                                                                <div className="d-flex gap-2">
                                                                                    <button type="submit" className="btn btn-sm btn-success">
                                                                                        <i className="bi bi-plus-circle me-1"></i> Add Sub-article
                                                                                    </button>
                                                                                    <button 
                                                                                        type="button" 
                                                                                        className="btn btn-sm btn-outline-secondary"
                                                                                        onClick={() => setSelectedBlock(null)}
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                </div>
                                                                            </form>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-5 text-center text-muted bg-white border border-dashed rounded shadow-sm">
                                                    <i className="bi bi-plus-circle display-4 mb-2 text-secondary"></i>
                                                    <h5>No article blocks created</h5>
                                                    <p className="small mb-3">Begin by inserting a structured article block into the layout.</p>
                                                    <button 
                                                        className="btn btn-primary"
                                                        onClick={() => {
                                                            setSelectedBlock({
                                                                type: 'article',
                                                                id: 0,
                                                                data: {
                                                                    title: 'New Article Title',
                                                                    content: '<p>Enter article content here...</p>'
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        Add New Article
                                                    </button>
                                                </div>
                                            )}

                                            {/* Add New Article inline form at the bottom */}
                                            {selectedBlock && selectedBlock.type === 'article' && selectedBlock.id === 0 && (
                                                <div className="article wp-block-wrapper is-active" style={{ padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: '#fff', border: '2px solid #1977cc' }}>
                                                    <h3 className="text-primary fw-bold mb-3">Add New Article</h3>
                                                    <form onSubmit={handleSaveInspectorBlock} onClick={(e) => e.stopPropagation()}>
                                                        <div className="mb-3">
                                                            <label className="form-label small fw-bold text-secondary">Article Title</label>
                                                            <input 
                                                                type="text" 
                                                                className="form-control fw-bold" 
                                                                value={inspectorTitle} 
                                                                onChange={(e) => setInspectorTitle(e.target.value)} 
                                                                required 
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label small fw-bold text-secondary">Article Content</label>
                                                            <ReactQuill 
                                                                ref={quillRef}
                                                                theme="snow"
                                                                value={inspectorContent} 
                                                                onChange={setInspectorContent}
                                                                onBlur={(range: any, source: any, editor: any) => setLastRange(range)}
                                                                modules={quillModules}
                                                                style={{ backgroundColor: 'white' }}
                                                            />
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button type="submit" className="btn btn-sm btn-primary">
                                                                <i className="bi bi-plus-circle me-1"></i> Add Article
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => setSelectedBlock(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sidebar widgets container column (col-lg-4 sidebar) (Matching Details.tsx) */}
                                    <div className="col-lg-4 sidebar">
                                        <div className="widgets-container" style={{ position: 'sticky', top: '100px' }}>
                                            <div className="recent-posts-widget widget-item" style={{ 
                                                padding: '1.5rem', 
                                                backgroundColor: '#fff', 
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                borderRadius: '8px',
                                                marginBottom: '2rem'
                                            }}>
                                                <h3 className="widget-title" style={{ fontSize: '1.25rem', borderBottom: '2px solid #1977cc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                                    {activeSubCategory.name}
                                                </h3>
                                                
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    <li style={{ marginBottom: '0.75rem' }}>
                                                        <span 
                                                            onClick={() => {
                                                                setSelectedBlock(null);
                                                                setSelectedSaId(null);
                                                            }}
                                                            style={{ 
                                                                cursor: 'pointer', 
                                                                color: selectedSaId === null ? '#1977cc' : '#2c4964',
                                                                fontWeight: selectedSaId === null ? 'bold' : 'normal',
                                                                display: 'block'
                                                            }}
                                                        >
                                                            <i className="bi bi-chevron-right" style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}></i>
                                                            Overview
                                                        </span>
                                                    </li>
                                                    {pageData?.articles?.flatMap((art: any) => 
                                                        (art.subarticles || []).map((sa: any) => ({ ...sa, article_id: sa.article_id || art.id }))
                                                    ).map((sa: any) => (
                                                        <li key={sa.id} className="sidebar-subarticle-item" style={{ marginBottom: '0.75rem', position: 'relative' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                                <span 
                                                                    onClick={() => {
                                                                        setSelectedSaId(sa.id);
                                                                        setSelectedBlock(null);
                                                                    }}
                                                                    style={{ 
                                                                        cursor: 'pointer', 
                                                                        color: selectedSaId === sa.id ? '#1977cc' : '#2c4964',
                                                                        fontWeight: selectedSaId === sa.id ? 'bold' : 'normal',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        flexGrow: 1,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    title={sa.title}
                                                                >
                                                                    <i className="bi bi-chevron-right" style={{ fontSize: '0.8rem', marginRight: '0.5rem', flexShrink: 0 }}></i>
                                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sa.title}</span>
                                                                </span>
                                                                <div className="sidebar-subarticle-actions" style={{ display: 'none', gap: '0.25rem', flexShrink: 0 }}>
                                                                    <button 
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        title="Edit Subarticle"
                                                                        style={{ padding: '0.1rem 0.35rem', fontSize: '0.75rem', lineHeight: '1.2' }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedSaId(sa.id);
                                                                            setSelectedBlock({
                                                                                type: 'subarticle',
                                                                                id: sa.id,
                                                                                parentId: sa.article_id,
                                                                                data: {
                                                                                    title: sa.title,
                                                                                    content: sa.content
                                                                                }
                                                                            });
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-pencil-fill"></i>
                                                                    </button>
                                                                    <button 
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        title="Delete Subarticle"
                                                                        style={{ padding: '0.1rem 0.35rem', fontSize: '0.75rem', lineHeight: '1.2' }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteSubArticleFromEditor(sa.id);
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-trash-fill"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* --- GENERIC STRUCTURAL MODAL (FOR METADATA CHANNELS) --- */}
            {modalType && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card shadow-lg" style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', border: 'none' }}>
                        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                            <h5 className="m-0 fw-bold text-dark">
                                {editingItem ? 'Edit' : 'Add'} {modalType === 'category' ? 'Category' : 'Subcategory'}
                            </h5>
                            <button type="button" className="btn-close" onClick={closeModals}></button>
                        </div>
                        <form onSubmit={handleSaveModal}>
                            <div className="card-body p-4">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={modalName} 
                                        onChange={(e) => setModalName(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">Description</label>
                                    <textarea 
                                        className="form-control" 
                                        value={modalDescription} 
                                        onChange={(e) => setModalDescription(e.target.value)} 
                                        rows={4} 
                                    />
                                </div>
                            </div>
                            <div className="card-footer bg-light p-3 d-flex justify-content-end gap-2 border-top">
                                <button type="button" className="wp-btn-secondary" onClick={closeModals}>Cancel</button>
                                <button type="submit" className="wp-btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* --- IBM CARBON DESIGN SYSTEM CONFIRMATION MODAL --- */}
            {confirmModal.isOpen && (
                <div className="carbon-modal-backdrop">
                    <div className={`carbon-modal-container ${confirmModal.danger ? 'danger' : 'primary'}`}>
                        <div className="carbon-modal-header">
                            <div>
                                <div className="carbon-modal-label">
                                    {confirmModal.label || 'Confirmation'}
                                </div>
                                <h4 className="carbon-modal-title">
                                    {confirmModal.title}
                                </h4>
                            </div>
                            <button 
                                type="button" 
                                className="carbon-modal-close-btn"
                                onClick={closeConfirmModal}
                                aria-label="Close modal"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <div className="carbon-modal-body">
                            {confirmModal.message}
                        </div>

                        <div className="carbon-modal-footer">
                            <button 
                                type="button" 
                                className="carbon-btn-secondary"
                                onClick={closeConfirmModal}
                            >
                                <span>{confirmModal.cancelText || 'Cancel'}</span>
                            </button>
                            <button 
                                type="button" 
                                className={confirmModal.danger ? 'carbon-btn-danger' : 'carbon-btn-primary'}
                                onClick={() => {
                                    const action = confirmModal.onConfirm;
                                    closeConfirmModal();
                                    action();
                                }}
                            >
                                <span>{confirmModal.confirmText || 'Confirm'}</span>
                                <i className={`bi ${confirmModal.danger ? 'bi-trash3-fill' : 'bi-check-lg'}`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overview;