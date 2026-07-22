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

    // Document settings (Subcategory details)
    const [subCatFormName, setSubCatFormName] = useState('');
    const [subCatFormDescription, setSubCatFormDescription] = useState('');

    // Modal State for Categories and Subcategories (metadata nodes)
    const [modalType, setModalType] = useState<'category' | 'subcategory' | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [modalName, setModalName] = useState('');
    const [modalDescription, setModalDescription] = useState('');

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
        } else {
            setPageData(null);
        }
    }, [activeSubCategory]);

    // Populating inspector form values
    useEffect(() => {
        if (selectedBlock) {
            setInspectorTitle(selectedBlock.data.title);
            setInspectorContent(selectedBlock.data.content);
        } else {
            setInspectorTitle('');
            setInspectorContent('');
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
                    await updateCategory(token, editingItem.id, { name: modalName, description: modalDescription });
                } else {
                    await createCategory(token, { name: modalName, description: modalDescription });
                }
                fetchCategories();
            } else if (modalType === 'subcategory') {
                if (editingItem) {
                    await updateSubCategory(token, editingItem.id, { category_id: activeCategory!.id, name: modalName, description: modalDescription });
                } else {
                    await createSubCategory(token, { category_id: activeCategory!.id, name: modalName, description: modalDescription });
                }
                fetchSubCategories(activeCategory!.id);
            }
            closeModals();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Delete category and all its contents?')) return;
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
    };

    const handleDeleteSubCategory = async (id: number) => {
        if (!window.confirm('Delete subcategory and its articles?')) return;
        try {
            await deleteSubCategory(token, id);
            if (activeSubCategory?.id === id) {
                setActiveSubCategory(null);
                setActiveTab('subcategories');
            }
            fetchSubCategories(activeCategory!.id);
        } catch (err: any) {
            setError(err.message);
        }
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

    const handleDeleteArticleFromEditor = async (id: number) => {
        if (!window.confirm('Delete article and all its subarticles?')) return;
        setError(null);
        try {
            await deleteArticle(token, id);
            if (selectedBlock?.type === 'article' && selectedBlock.id === id) {
                setSelectedBlock(null);
            }
            if (activeSubCategory) {
                fetchPageData(activeSubCategory.id);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteSubArticleFromEditor = async (id: number) => {
        if (!window.confirm('Delete this subarticle?')) return;
        setError(null);
        try {
            await deleteSubArticle(token, id);
            if (selectedBlock?.type === 'subarticle' && selectedBlock.id === id) {
                setSelectedBlock(null);
            }
            if (activeSubCategory) {
                fetchPageData(activeSubCategory.id);
            }
        } catch (err: any) {
            setError(err.message);
        }
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
            fetchSubCategories(activeCategory.id);
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
                <style>{`
                    .wp-login-wrapper {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        background-color: #f1f1f1;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    }
                    .wp-login-container {
                        width: 340px;
                        padding: 2rem 1.5rem;
                        background: #fff;
                        border-radius: 4px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.13);
                        border: 1px solid #ccd0d4;
                    }
                    .wp-login-logo {
                        text-align: center;
                        margin-bottom: 1.5rem;
                    }
                    .wp-login-logo img {
                        height: 64px;
                        width: auto;
                    }
                    .wp-login-logo h4 {
                        margin-top: 0.5rem;
                        font-weight: 700;
                        color: #1d2327;
                    }
                `}</style>
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
            <style>{`
                /* WordPress Admin Core Styling */
                .wp-admin-wrapper {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f0f2f5;
                    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                }

                .wp-sidebar {
                    width: 260px;
                    background: #ffffff;
                    color: #1e293b;
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                    z-index: 100;
                    border-right: 1px solid #e2e8f0;
                }

                .wp-sidebar-menu {
                    list-style: none;
                    padding: 0;
                    margin: 1.5rem 0;
                    flex-grow: 1;
                }

                .wp-sidebar-menu-item {
                    margin-bottom: 0.25rem;
                }

                .wp-sidebar-menu-link {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.5rem;
                    color: #475569;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    border-left: 4px solid transparent;
                    background: transparent;
                    width: 100%;
                    text-align: left;
                    border: none;
                    border-radius: 0;
                }

                .wp-sidebar-menu-link:hover {
                    background: #f1f5f9;
                    color: #2271b1;
                }

                .wp-sidebar-menu-link.active {
                    background: #e2e8f0;
                    color: #2271b1;
                    border-left-color: #2271b1;
                }

                .wp-sidebar-menu-link.disabled {
                    color: #cbd5e1;
                    opacity: 0.6;
                    cursor: not-allowed;
                    pointer-events: none;
                }

                .wp-sidebar-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    background: #f8fafc;
                }

                .wp-sidebar-user {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    margin-bottom: 0.75rem;
                    color: #475569;
                }

                .wp-logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    padding: 0.5rem;
                    background: #d63638;
                    border: none;
                    border-radius: 4px;
                    color: #fff;
                    font-weight: bold;
                }

                .wp-logout-btn:hover {
                    background: #b32d2e;
                }

                .wp-main-content {
                    flex-grow: 1;
                    padding: 2rem;
                    overflow-y: auto;
                    height: 100vh;
                }

                /* Breadcrumb Styling */
                .wp-breadcrumbs-container {
                    background: #fff;
                    padding: 0.85rem 1.25rem;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: #64748b;
                }

                .wp-breadcrumb-item {
                    cursor: pointer;
                    color: #2271b1;
                    font-weight: 500;
                    text-decoration: none;
                }

                .wp-breadcrumb-item:hover {
                    text-decoration: underline;
                }

                .wp-breadcrumb-separator {
                    color: #94a3b8;
                }

                .wp-breadcrumb-current {
                    color: #1e293b;
                    font-weight: 600;
                }

                /* Dashboard Grid & Cards */
                .wp-card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .wp-dashboard-card {
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.04);
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .wp-dashboard-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.06);
                }

                .wp-card-header {
                    padding: 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                }

                .wp-card-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0;
                }

                .wp-card-badge {
                    background: #e0f2fe;
                    color: #0369a1;
                    padding: 0.2rem 0.5rem;
                    border-radius: 9999px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .wp-card-body {
                    padding: 1.25rem;
                    color: #64748b;
                    font-size: 0.85rem;
                    line-height: 1.5;
                    flex-grow: 1;
                }

                .wp-card-actions {
                    padding: 0.85rem 1.25rem;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    gap: 0.5rem;
                }

                /* Layout Editor Canvas & Sidebar */
                .wp-editor-workspace {
                    display: flex;
                    gap: 1.5rem;
                    align-items: flex-start;
                }

                .wp-editor-canvas {
                    flex-grow: 1;
                    background: #fff;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    overflow: hidden;
                    min-height: calc(100vh - 180px);
                }

                .wp-editor-header {
                    background: #fff;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .wp-editor-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin: 0;
                    color: #1e293b;
                }

                .wp-editor-body {
                    padding: 1.5rem;
                }

                /* Block outline / Gutenberg visual layout editor */
                .wp-block-wrapper {
                    position: relative;
                    border: 2px dashed #cbd5e1;
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    transition: all 0.2s ease;
                    background: #fff;
                }

                .wp-block-wrapper:hover {
                    border-color: #2271b1;
                    box-shadow: 0 4px 15px rgba(34, 113, 177, 0.06);
                }

                .wp-block-wrapper.is-active {
                    border-color: #2271b1;
                    border-style: solid;
                    box-shadow: 0 0 0 1px #2271b1, 0 4px 20px rgba(34, 113, 177, 0.1);
                }

                .wp-block-subarticle-wrapper {
                    position: relative;
                    border: 2px dashed #cbd5e1;
                    border-radius: 6px;
                    padding: 1rem;
                    margin-top: 1rem;
                    transition: all 0.2s ease;
                    background: #f8fafc;
                }

                .wp-block-subarticle-wrapper:hover {
                    border-color: #46b450;
                    box-shadow: 0 4px 10px rgba(70, 180, 80, 0.05);
                }

                .wp-block-subarticle-wrapper.is-active {
                    border-color: #46b450;
                    border-style: solid;
                    box-shadow: 0 0 0 1px #46b450, 0 4px 15px rgba(70, 180, 80, 0.08);
                }

                .wp-block-toolbar {
                    position: absolute;
                    top: -14px;
                    left: 12px;
                    background: #2271b1;
                    color: #fff;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    display: none;
                    align-items: center;
                    gap: 0.4rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    z-index: 10;
                }

                .wp-block-subarticle-wrapper .wp-block-toolbar {
                    background: #46b450;
                }

                .wp-block-wrapper:hover > .wp-block-toolbar,
                .wp-block-wrapper.is-active > .wp-block-toolbar,
                .wp-block-subarticle-wrapper:hover > .wp-block-toolbar,
                .wp-block-subarticle-wrapper.is-active > .wp-block-toolbar {
                    display: flex;
                }

                .wp-toolbar-btn {
                    background: transparent;
                    border: none;
                    color: #fff;
                    padding: 0.1rem 0.3rem;
                    cursor: pointer;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    transition: opacity 0.2s;
                    border-radius: 2px;
                }

                .wp-toolbar-btn:hover {
                    background: rgba(255,255,255,0.25);
                }

                /* Inspector Sidebar */
                .wp-inspector {
                    width: 380px;
                    background: #fff;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    position: sticky;
                    top: 2rem;
                    flex-shrink: 0;
                    max-height: calc(100vh - 4rem);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .wp-inspector-header {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                }

                .wp-inspector-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    margin: 0;
                    color: #1e293b;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .wp-inspector-body {
                    padding: 1.25rem;
                    overflow-y: auto;
                    flex-grow: 1;
                }

                .wp-inspector-footer {
                    padding: 0.85rem 1.25rem;
                    border-top: 1px solid #e2e8f0;
                    background: #f8fafc;
                    display: flex;
                    gap: 0.5rem;
                }

                /* Block Inspector form fields */
                .wp-form-group {
                    margin-bottom: 1.25rem;
                }

                .wp-form-label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 0.4rem;
                }

                .wp-form-input {
                    font-size: 0.85rem;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    width: 100%;
                    font-family: inherit;
                }

                .wp-form-input:focus {
                    border-color: #2271b1;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(34, 113, 177, 0.12);
                }

                .wp-image-preview-box {
                    border: 1px dashed #cbd5e1;
                    border-radius: 6px;
                    padding: 0.75rem;
                    text-align: center;
                    background: #f8fafc;
                    position: relative;
                }

                .wp-image-preview-thumbnail {
                    max-width: 100%;
                    max-height: 140px;
                    object-fit: cover;
                    border-radius: 4px;
                }

                /* Custom Premium Buttons */
                .wp-btn-primary {
                    background: #2271b1;
                    color: #fff;
                    font-weight: 600;
                    border-radius: 6px;
                    padding: 0.5rem 1.25rem;
                    font-size: 0.85rem;
                    border: 1px solid #2271b1;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .wp-btn-primary:hover {
                    background: #135e96;
                    border-color: #135e96;
                }

                .wp-btn-secondary {
                    background: #fff;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                    font-weight: 600;
                    border-radius: 6px;
                    padding: 0.5rem 1.25rem;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .wp-btn-secondary:hover {
                    background: #f8fafc;
                    color: #1e293b;
                    border-color: #94a3b8;
                }

                .wp-btn-danger {
                    background: #d63638;
                    color: #fff;
                    font-weight: 600;
                    border-radius: 6px;
                    padding: 0.5rem 1rem;
                    font-size: 0.85rem;
                    border: 1px solid #d63638;
                    cursor: pointer;
                }

                .wp-btn-danger:hover {
                    background: #b32d2e;
                    border-color: #b32d2e;
                }

                .cursor-pointer {
                    cursor: pointer;
                }

                .hover-underline:hover {
                    text-decoration: underline !important;
                }

                /* Quill toolbar styling override */
                .ql-editor {
                    min-height: 200px;
                    max-height: 350px;
                    font-size: 0.9rem;
                }
            `}</style>

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
                                if (activeSubCategory) setActiveTab('editor');
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
                                            Manage Subcategories <i className="bi bi-arrow-right-short"></i>
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
                                            }}
                                        >
                                            <i className="bi bi-layout-text-sidebar-reverse me-1"></i> Design Page Layout
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

                {/* --- 3. GUTEBURGER VISUAL LAYOUT EDITOR VIEW --- */}
                {activeTab === 'editor' && activeSubCategory && (
                    <div className="wp-editor-workspace">
                        
                        {/* LEFT PAGE WORKSPACE (Gutenberg layout builder canvas) */}
                        <div className="wp-editor-canvas">
                            <div className="wp-editor-header">
                                <div className="d-flex align-items-center gap-3">
                                    <button 
                                        className="btn btn-sm btn-outline-secondary" 
                                        onClick={() => {
                                            setActiveTab('subcategories');
                                            setSelectedBlock(null);
                                        }}
                                        title="Back to subcategories"
                                    >
                                        <i className="bi bi-arrow-left"></i> Back
                                    </button>
                                    <h4 className="wp-editor-title">{activeSubCategory.name}</h4>
                                </div>
                                <div className="d-flex gap-2">
                                    <button 
                                        className="wp-btn-secondary btn-sm"
                                        onClick={() => {
                                            setSelectedBlock(null);
                                        }}
                                    >
                                        <i className="bi bi-gear-fill me-1"></i> Document Settings
                                    </button>
                                    <button 
                                        className="wp-btn-primary btn-sm"
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
                                        <i className="bi bi-plus-lg me-1"></i> Add Article Block
                                    </button>
                                </div>
                            </div>

                            <div className="wp-editor-body bg-light">
                                {pageLoading ? (
                                    <div className="text-center py-5">
                                        <span className="spinner-border text-primary" role="status"></span>
                                        <p className="mt-2 text-muted small">Loading page editor canvas...</p>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {/* Main Preview Container */}
                                        <div className="col-lg-8">
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                
                                                {/* Page Banner Title */}
                                                <div className="p-4 bg-white border rounded shadow-sm">
                                                    <span className="text-secondary small">Disease Page Layout</span>
                                                    <h1 className="fw-bold m-0 text-dark" style={{ borderBottom: '2px solid #1977cc', paddingBottom: '0.5rem' }}>
                                                        {activeSubCategory.name}
                                                    </h1>
                                                    <p className="text-muted mt-2 small mb-0">
                                                        {pageData?.description || "Configure descriptions and page outline inside Document Settings."}
                                                    </p>
                                                </div>

                                                {/* Articles mapping */}
                                                {pageData?.articles && pageData.articles.length > 0 ? (
                                                    pageData.articles.map((article: any) => {
                                                        const isArticleActive = selectedBlock?.type === 'article' && selectedBlock.id === article.id;
                                                        
                                                        return (
                                                            <div 
                                                                key={article.id} 
                                                                className={`wp-block-wrapper ${isArticleActive ? 'is-active' : ''}`}
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
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                {/* Gutenberg Action Bar */}
                                                                <div className="wp-block-toolbar">
                                                                    <span>Article Block</span>
                                                                    <button 
                                                                        className="wp-toolbar-btn" 
                                                                        title="Edit Block Settings"
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
                                                                        <i className="bi bi-pencil-fill"></i>
                                                                    </button>
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
                                                                    <button 
                                                                        className="wp-toolbar-btn" 
                                                                        title="Delete Block"
                                                                        style={{ color: '#ff8a8a' }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteArticleFromEditor(article.id);
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-trash-fill"></i>
                                                                    </button>
                                                                </div>

                                                                {/* Visual Preview */}
                                                                <h2 className="title fw-bold mb-3 text-dark">{article.title}</h2>
                                                                
                                                                <div className="content">
                                                                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                                                                </div>

                                                                {/* Visual Nested Subarticles */}
                                                                <div className="mt-4 border-top pt-3 bg-light p-3 rounded">
                                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                                        <span className="small text-secondary fw-bold">Sub-Articles Layout</span>
                                                                        <button 
                                                                            className="btn btn-xs btn-outline-success py-0 px-2 small"
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
                                                                            style={{ fontSize: '0.75rem' }}
                                                                        >
                                                                            <i className="bi bi-plus-lg"></i> Add Sub-article
                                                                        </button>
                                                                    </div>

                                                                    {article.subarticles && article.subarticles.length > 0 ? (
                                                                        article.subarticles.map((sa: any) => {
                                                                            const isSubActive = selectedBlock?.type === 'subarticle' && selectedBlock.id === sa.id;
                                                                            
                                                                            return (
                                                                                <div 
                                                                                    key={sa.id}
                                                                                    className={`wp-block-subarticle-wrapper ${isSubActive ? 'is-active' : ''}`}
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
                                                                                    style={{ cursor: 'pointer' }}
                                                                                >
                                                                                    {/* Sub-article Actions */}
                                                                                    <div className="wp-block-toolbar">
                                                                                        <span>Sub-article Block</span>
                                                                                        <button 
                                                                                            className="wp-toolbar-btn" 
                                                                                            title="Edit Settings"
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
                                                                                            <i className="bi bi-pencil-fill"></i>
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

                                                                                    <h4 className="fw-bold mb-2 text-success" style={{ fontSize: '1rem' }}>{sa.title}</h4>
                                                                                    
                                                                                    <div className="content small">
                                                                                        <div dangerouslySetInnerHTML={{ __html: sa.content }} />
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <div className="text-center py-2 text-muted small bg-white border border-dashed rounded">
                                                                            No sub-articles. Click "Add Sub-article" above to create nested blocks.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-5 text-center text-muted bg-white border border-dashed rounded">
                                                        <i className="bi bi-plus-circle display-4 mb-2 text-secondary"></i>
                                                        <h5>No article blocks created</h5>
                                                        <p className="small mb-3">Begin by inserting a structured article block into the layout.</p>
                                                        <button 
                                                            className="wp-btn-primary"
                                                            onClick={() => {
                                                                setSelectedBlock({
                                                                    type: 'article',
                                                                    id: 0,
                                                                    data: {
                                                                        title: 'New Article Title',
                                                                        content: '<p>Enter article content here...</p>',
                                                                        image_url: '',
                                                                        video_url: ''
                                                                    }
                                                                });
                                                            }}
                                                        >
                                                            Add New Article
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Sidebar Widgets Layout (Identical structure to Details.tsx) */}
                                        <div className="col-lg-4">
                                            <div className="p-3 bg-white border rounded shadow-sm" style={{ position: 'sticky', top: '100px' }}>
                                                <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">
                                                    {activeSubCategory.name} Outline
                                                </h5>
                                                {pageData?.articles && pageData.articles.length > 0 ? (
                                                    <ul className="list-unstyled m-0">
                                                        {pageData.articles.map((art: any) => (
                                                            <li key={art.id} className="mb-2">
                                                                <span 
                                                                    className="d-flex align-items-center gap-2 text-decoration-none text-primary cursor-pointer hover-underline small fw-bold"
                                                                    onClick={() => {
                                                                        setSelectedBlock({
                                                                            type: 'article',
                                                                            id: art.id,
                                                                            data: {
                                                                                title: art.title,
                                                                                content: art.content
                                                                            }
                                                                        });
                                                                    }}
                                                                >
                                                                    <i className="bi bi-chevron-right small"></i>
                                                                    {art.title}
                                                                </span>
                                                                {art.subarticles && art.subarticles.length > 0 && (
                                                                    <ul className="list-unstyled ps-3 mt-1">
                                                                        {art.subarticles.map((sa: any) => (
                                                                            <li key={sa.id} className="mb-1">
                                                                                <span 
                                                                                    className="d-flex align-items-center gap-1 text-decoration-none text-success cursor-pointer hover-underline small"
                                                                                    onClick={() => {
                                                                                        setSelectedBlock({
                                                                                            type: 'subarticle',
                                                                                            id: sa.id,
                                                                                            parentId: art.id,
                                                                                            data: {
                                                                                                title: sa.title,
                                                                                                content: sa.content
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    <i className="bi bi-dot"></i>
                                                                                    {sa.title}
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-muted small">No structured pages outline available.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT INSPECTOR (WordPress Settings Sidebar) */}
                        <div className="wp-inspector">
                            <div className="wp-inspector-header">
                                <h5 className="wp-inspector-title">
                                    {selectedBlock ? (
                                        <>
                                            <i className="bi bi-sliders text-primary"></i> 
                                            {selectedBlock.type === 'article' ? 'Article Settings' : 'Sub-article Settings'}
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-gear-fill text-secondary"></i>
                                            Page Settings
                                        </>
                                    )}
                                </h5>
                                {selectedBlock && (
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setSelectedBlock(null)}
                                        title="Deselect block"
                                    ></button>
                                )}
                            </div>

                            <div className="wp-inspector-body">
                                {selectedBlock ? (
                                    /* 1. Selected Block Inspector (Gutenberg Element Settings) */
                                    <form onSubmit={handleSaveInspectorBlock}>
                                        <div className="wp-form-group">
                                            <label className="wp-form-label">Block Title</label>
                                            <input 
                                                type="text" 
                                                className="wp-form-input" 
                                                value={inspectorTitle} 
                                                onChange={(e) => setInspectorTitle(e.target.value)} 
                                                required 
                                            />
                                        </div>



                                        <div className="wp-form-group">
                                            <label className="wp-form-label">Block Content</label>
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

                                        <div className="wp-inspector-footer border-0 p-0 mt-4 d-flex justify-content-between">
                                            <button type="submit" className="wp-btn-primary flex-grow-1">
                                                <i className="bi bi-check-circle me-1"></i> Save Changes
                                            </button>
                                            <button 
                                                type="button" 
                                                className="wp-btn-secondary"
                                                onClick={() => setSelectedBlock(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* 2. Document Inspector (General Settings for activeSubCategory) */
                                    <form onSubmit={handleSaveSubCategoryDetails}>
                                        <div className="wp-form-group">
                                            <label className="wp-form-label">Subcategory Title</label>
                                            <input 
                                                type="text" 
                                                className="wp-form-input" 
                                                value={subCatFormName} 
                                                onChange={(e) => setSubCatFormName(e.target.value)} 
                                                required 
                                            />
                                        </div>

                                        <div className="wp-form-group">
                                            <label className="wp-form-label">Subcategory Description</label>
                                            <textarea 
                                                className="wp-form-input" 
                                                rows={4}
                                                value={subCatFormDescription} 
                                                onChange={(e) => setSubCatFormDescription(e.target.value)} 
                                            />
                                        </div>

                                        <button type="submit" className="wp-btn-primary w-100 mb-4">
                                            <i className="bi bi-cloud-arrow-up-fill me-1"></i> Save Page Settings
                                        </button>

                                        <div className="border-top pt-3">
                                            <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '0.85rem' }}>Tips & Help</h6>
                                            <ul className="text-muted ps-3 small m-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                                <li className="mb-1">Hover over any block on the left layout to edit or delete it.</li>
                                                <li className="mb-1">Click "Add Article Block" to insert a top-level section.</li>
                                                <li className="mb-1">Click "Add Sub-article" to nest subsections within any article.</li>
                                                <li className="mb-1">Videos will load directly via standard YouTube links.</li>
                                            </ul>
                                        </div>
                                    </form>
                                )}
                            </div>
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
        </div>
    );
};

export default Overview;