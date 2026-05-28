import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api';

interface SubCategory {
    id: number;
    name: string;
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
            .catch(err => console.error("Error fetching categories:", err));
    }, []);

    return (
        <section id="features" className="features services section">
            <div className="container section-title">
                <h2>Categories</h2>
                <p>Check Our Categories<br/></p>
            </div>

            <div className="container">
                <div className="row">
                    <div className="col-lg-3">
                        <ul className="nav nav-tabs flex-column">
                            {categories.map((category) => (
                                <li className="nav-item" key={category.id}>
                                    <a 
                                        className={`nav-link ${activeTabId === category.id ? 'active show' : ''}`}
                                        onClick={(e) => { e.preventDefault(); setActiveTabId(category.id); }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {category.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-lg-9 mt-4 mt-lg-0">
                        <div className="tab-content">
                            {categories.map((category) => (
                                <div 
                                    className={`tab-pane ${activeTabId === category.id ? 'active show' : ''}`} 
                                    key={category.id}
                                >
                                    <div className="col-lg-8 details order-2 order-lg-1">
                                        <h3>{category.name}</h3>
                                    </div>
                                    <div className="row">
                                        {category.subcategories?.map((sub) => (
                                            <div className="col-md-3" key={sub.id}>
                                                <div className="service-item d-flex position-relative h-100">
                                                    <h4 className="title">
                                                        <a 
                                                            onClick={() => navigate(`/details?subcategory_id=${sub.id}`)}
                                                            className="stretched-link"
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {sub.name}
                                                        </a>
                                                    </h4>
                                                </div>
                                            </div>
                                        ))}
                                        {(!category.subcategories || category.subcategories.length === 0) && (
                                            <div className="col-12">
                                                <p className="text-muted">No subcategories found for this category.</p>
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
