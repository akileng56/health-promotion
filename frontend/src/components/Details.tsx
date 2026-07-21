import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SERVER_BASE_URL, getSubCategory, getSubCategories } from '../api';

interface SubArticle {
    id: number;
    title: string;
    content: string;
    image_url?: string;
    video_url?: string;
}

interface Article {
    id: number;
    title: string;
    content: string;
    image_url?: string;
    video_url?: string;
    created_at: string;
    subarticles?: SubArticle[];
}

interface SubCategory {
    id: number;
    category_id: number;
    name: string;
    description: string;
    articles?: Article[];
}

const Details = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const subCategoryId = searchParams.get('subcategory_id');
    
    const [subcategory, setSubcategory] = useState<SubCategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSaId, setSelectedSaId] = useState<number | null>(null);

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

    useEffect(() => {
        if (subCategoryId) {
            setLoading(true);
            getSubCategory(parseInt(subCategoryId, 10))
                .then(data => {
                    setSubcategory(data);
                    setLoading(false);
                    setSelectedSaId(null); // Reset selection on subcategory change
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [subCategoryId]);

    if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}><h3>Loading...</h3></div>;
    if (error) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}><div className="error text-danger">{error}</div></div>;
    if (!subcategory) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}><h3>Subcategory not found</h3></div>;

    // Flatten all subarticles for the sidebar list
    const allSubArticles = subcategory.articles?.flatMap((art: any) => art.subarticles || []) || [];

    return (
        <>
            <div className="page-title light-background">
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0">{subcategory.name}</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><a onClick={() => navigate('/categories')} style={{ cursor: 'pointer' }}>Categories</a></li>
                            <li className="current">{subcategory.name}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container py-5">
                <div className="row">
                    <div className="col-lg-8">
                        <section id="blog-details" className="blog-details section-details">
                            <div className="container">
                                {subcategory.articles && subcategory.articles.length > 0 ? (
                                    subcategory.articles.map((article: any) => {
                                        const subsToShow = selectedSaId 
                                            ? article.subarticles?.filter((sa: any) => sa.id === selectedSaId)
                                            : []; // Only show subarticles when one is specifically selected
                                        
                                        // If a subarticle is selected but doesn't belong to this article, don't render this article
                                        if (selectedSaId && (!subsToShow || subsToShow.length === 0)) return null;

                                        return (
                                            <article className="article" key={article.id} style={{
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                borderRadius: '8px',
                                                backgroundColor: '#fff',
                                                overflow: 'hidden'
                                            }}>
                                                <h2 className="title">{article.title}</h2>

                                                {/* Only show main article content if no specific subarticle is selected */}
                                                {!selectedSaId && (
                                                    <div className="content">
                                                        {article.image_url && (
                                                            <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden' }}>
                                                                <img src={`${SERVER_BASE_URL}${article.image_url}`} alt={article.title} className={`content-image-style`} />
                                                            </div>
                                                        )}
                                                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                                                        
                                                        {article.video_url && getYouTubeEmbedUrl(article.video_url) && (
                                                            <div style={{ marginTop: '1.5rem', borderRadius: '8px', overflow: 'hidden', position: 'relative', paddingTop: '56.25%' }}>
                                                                <iframe 
                                                                    src={getYouTubeEmbedUrl(article.video_url)!}
                                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                                    allowFullScreen
                                                                    title="YouTube video player"
                                                                ></iframe>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {subsToShow && subsToShow.length > 0 && (
                                                    <div className="subarticles" style={{ 
                                                        marginTop: selectedSaId ? '0' : '2.5rem', 
                                                        backgroundColor: '#f8f9fa',
                                                        padding: '1.5rem'
                                                    }}>
                                                        {subsToShow && subsToShow.length > 0 && subsToShow.map((sa: any) => (
                                                            <div key={sa.id} style={{ marginBottom: selectedSaId ? '0' : '2rem' }}>
                                                                <h4 style={{ fontWeight: 'bold', color: '#1977cc' }}>{sa.title}</h4>
                                                                
                                                                {sa.image_url && (
                                                                    <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                                                                        <img src={`${SERVER_BASE_URL}${sa.image_url}`} alt={sa.title} className={`content-image-style`} />
                                                                    </div>
                                                                )}
                                                                
                                                                <div style={{ fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: sa.content }} />
                                                                
                                                                {sa.video_url && getYouTubeEmbedUrl(sa.video_url) && (
                                                                    <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', position: 'relative', paddingTop: '56.25%' }}>
                                                                        <iframe 
                                                                            src={getYouTubeEmbedUrl(sa.video_url)!}
                                                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                                            allowFullScreen
                                                                            title="YouTube video player"
                                                                        ></iframe>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })
                                ) : (
                                    <article className="article" style={{ padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                        <h2 className="title">No detailed articles available</h2>
                                        <div className="content">
                                            <p>{subcategory.description}</p>
                                        </div>
                                    </article>
                                )}
                            </div>
                        </section>
                    </div>

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
                                    {subcategory.name}
                                </h3>
                                
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '0.75rem' }}>
                                        <a 
                                            onClick={() => setSelectedSaId(null)} 
                                            style={{ 
                                                cursor: 'pointer', 
                                                color: selectedSaId === null ? '#1977cc' : '#2c4964',
                                                fontWeight: selectedSaId === null ? 'bold' : 'normal',
                                                display: 'block',
                                                transition: '0.3s'
                                            }}
                                        >
                                            <i className="bi bi-chevron-right" style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}></i>
                                            Overview
                                        </a>
                                    </li>
                                    {allSubArticles.map((sa: any) => (
                                        <li key={sa.id} style={{ marginBottom: '0.75rem' }}>
                                            <a 
                                                onClick={() => setSelectedSaId(sa.id)} 
                                                style={{ 
                                                    cursor: 'pointer', 
                                                    color: selectedSaId === sa.id ? '#1977cc' : '#2c4964',
                                                    fontWeight: selectedSaId === sa.id ? 'bold' : 'normal',
                                                    display: 'block',
                                                    transition: '0.3s'
                                                }}
                                            >
                                                <i className="bi bi-chevron-right" style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}></i>
                                                {sa.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Details;
