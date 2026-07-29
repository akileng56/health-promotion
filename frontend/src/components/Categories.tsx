import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api';

interface SubCategory {
    id: number;
    name: string;
    description?: string;
}

interface Category {
    id: number;
    name: string;
    subcategories?: SubCategory[];
}

export default function Categories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTabId, setActiveTabId] = useState<number | null>(null);

    useEffect(() => {
        getCategories()
            .then(data => {
                setCategories(data);
                if (data.length > 0) {
                    setActiveTabId(data[0].id);
                }
            })
            .catch((err: any) => console.error("Error fetching categories:", err));
    }, []);

    // Helper to get bootstrap icon dynamically based on category name
    const getCategoryIcon = (name: string): string => {
        const n = name.toLowerCase();
        if (n.includes('covid') || n.includes('virus') || n.includes('infection')) return 'bi-virus';
        if (n.includes('cancer') || n.includes('tumor')) return 'bi-ribbon';
        if (n.includes('women') || n.includes('female')) return 'bi-gender-female';
        if (n.includes('men') || n.includes('male')) return 'bi-gender-male';
        if (n.includes('young') || n.includes('children') || n.includes('child') || n.includes('youth')) return 'bi-balloon-heart';
        if (n.includes('long term') || n.includes('condition') || n.includes('chronic')) return 'bi-heart-pulse-fill';
        if (n.includes('mental') || n.includes('brain') || n.includes('psycholog')) return 'bi-brain';
        if (n.includes('bereavement') || n.includes('dying') || n.includes('grief')) return 'bi-flower1';
        if (n.includes('research') || n.includes('trial') || n.includes('study')) return 'bi-search-heart';
        if (n.includes('healthcare') || n.includes('health') || n.includes('care') || n.includes('experience')) return 'bi-hospital';
        return 'bi-journal-medical';
    };

    // Helper to get bootstrap icon dynamically based on the subcategory name
    const getSubCategoryIcon = (name: string): string => {
        const n = name.toLowerCase();
        if (n.includes('covid') || n.includes('virus') || n.includes('infection')) return 'bi-virus';
        if (n.includes('breast')) return 'bi-heart-fill';
        if (n.includes('cancer') || n.includes('tumor') || n.includes('screening') || n.includes('carcinoma') || n.includes('leukaemia') || n.includes('lymphoma')) return 'bi-ribbon';
        if (n.includes('heart') || n.includes('cardio') || n.includes('valve') || n.includes('pulse')) return 'bi-heart-pulse-fill';
        if (n.includes('brain') || n.includes('neurolog') || n.includes('mental') || n.includes('dementia') || n.includes('autism')) return 'bi-brain';
        if (n.includes('pregnan') || n.includes('birth') || n.includes('antenatal') || n.includes('baby') || n.includes('infant')) return 'bi-balloon-heart';
        if (n.includes('women')) return 'bi-gender-female';
        if (n.includes('men') || n.includes('penile') || n.includes('prostate') || n.includes('testicular')) return 'bi-gender-male';
        if (n.includes('knee') || n.includes('replacement') || n.includes('joint') || n.includes('stroke') || n.includes('parkinson')) return 'bi-person-walking';
        if (n.includes('weight') || n.includes('diet') || n.includes('lifestyle') || n.includes('diabetes') || n.includes('asthma')) return 'bi-activity';
        if (n.includes('research') || n.includes('biobank') || n.includes('trial')) return 'bi-flask';
        return 'bi-journal-medical';
    };

    return (
        <section id="features" className="features services section">


            <div className="container section-title">
                <h2>Categories</h2>
                <p>Check Our Disease & Health Categories<br/></p>
            </div>

            <div className="container">
                <div className="row">
                    {/* Left Category Navigation */}
                    <div className="col-lg-3">
                        <ul className="nav nav-tabs flex-column">
                            {categories.map((category) => (
                                <li className="nav-item w-100" key={category.id}>
                                    <a 
                                        className={`nav-link ${activeTabId === category.id ? 'active' : ''}`}
                                        onClick={(e: React.MouseEvent) => { e.preventDefault(); setActiveTabId(category.id); }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className={`bi ${getCategoryIcon(category.name)} me-2`}></i>
                                        {category.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Subcategories Display Pane */}
                    <div className="col-lg-9 mt-4 mt-lg-0">
                        <div className="tab-content">
                            {categories.map((category) => (
                                <div 
                                    className={`tab-pane fade ${activeTabId === category.id ? 'show active' : ''}`} 
                                    key={category.id}
                                >
                                    <h3 className="tab-pane-title">{category.name}</h3>
                                    
                                    <div className="subcat-grid">
                                        {category.subcategories?.map((sub) => (
                                            <div 
                                                className="subcat-card" 
                                                key={sub.id}
                                                onClick={() => navigate(`/details?subcategory_id=${sub.id}`)}
                                            >
                                                <div className="subcat-icon-wrapper">
                                                    <i className={`bi ${getSubCategoryIcon(sub.name)}`}></i>
                                                </div>
                                                <h4 className="subcat-title">{sub.name}</h4>
                                                <p className="subcat-description">
                                                    {sub.description || `Explore comprehensive articles, clinical insights, and shared patient narratives on ${sub.name}.`}
                                                </p>
                                                <div className="subcat-action">
                                                    Explore Topic <i className="bi bi-arrow-right"></i>
                                                </div>
                                            </div>
                                        ))}

                                        {(!category.subcategories || category.subcategories.length === 0) && (
                                            <div className="w-100 text-center py-5 text-muted bg-light rounded border border-dashed">
                                                <i className="bi bi-journal-x fs-1 d-block mb-2 text-secondary"></i>
                                                <p className="m-0 small">No subcategories found under this category.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
