import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSubCategory, getSubCategories } from '../api';

interface SubArticle {
    id: number;
    title: string;
    content: string;
}

interface Article {
    id: number;
    title: string;
    content: string;
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

    useEffect(() => {
        if (subCategoryId) {
            setLoading(true);
            getSubCategory(subCategoryId)
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
    const allSubArticles = subcategory.articles?.flatMap(art => art.subarticles || []) || [];

    return (
        <>
            <div className="page-title light-background">
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0">{subcategory.name}</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</a></li>
                            <li className="current">{subcategory.name} Details</li>
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
                                    subcategory.articles.map((article) => {
                                        const subsToShow = selectedSaId 
                                            ? article.subarticles?.filter(sa => sa.id === selectedSaId)
                                            : []; // Only show subarticles when one is specifically selected
                                        
                                        // If a subarticle is selected but doesn't belong to this article, don't render this article
                                        if (selectedSaId && (!subsToShow || subsToShow.length === 0)) return null;

                                        return (
                                            <article className="article" key={article.id} style={{
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                borderRadius: '8px',
                                                backgroundColor: '#fff'
                                            }}>
                                                <h2 className="title" style={{ color: '#2c4964', marginBottom: '1rem' }}>{article.title}</h2>

                                                {/* Only show main article content if no specific subarticle is selected */}
                                                {!selectedSaId && (
                                                    <div className="content" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                                                        <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
                                                    </div>
                                                )}

                                                {subsToShow && subsToShow.length > 0 && (
                                                    <div className="subarticles" style={{ 
                                                        marginTop: selectedSaId ? '0' : '2.5rem', 
                                                        paddingLeft: '1.5rem',
                                                        backgroundColor: '#f8f9fa',
                                                        padding: '1.5rem'
                                                    }}>
                                                        {subsToShow.map((sa) => (
                                                            <div key={sa.id} style={{ marginBottom: selectedSaId ? '0' : '2rem' }}>
                                                                <h4 style={{ fontWeight: 'bold', color: '#1977cc' }}>{sa.title}</h4>
                                                                <div style={{ fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: sa.content.replace(/\n/g, '<br/>') }} />
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
                                
                                {/*<h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2c4964', marginBottom: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>*/}
                                {/*    Contents*/}
                                {/*</h4>*/}
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
                                    {allSubArticles.map(sa => (
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
