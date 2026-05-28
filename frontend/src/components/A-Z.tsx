import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubCategories } from '../api';

interface SubCategory {
    id: number;
    name: string;
    description: string;
}

const A_Z = () => {
    const navigate = useNavigate();
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getSubCategories()
            .then(data => {
                setSubcategories(data.sort((a: SubCategory, b: SubCategory) => a.name.localeCompare(b.name)));
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching subcategories:", err);
                setLoading(false);
            });
    }, []);

    const filteredSubcategories = subcategories.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedSubcategories: { [key: string]: SubCategory[] } = {};
    filteredSubcategories.forEach(sub => {
        const firstLetter = sub.name.charAt(0).toUpperCase();
        if (!groupedSubcategories[firstLetter]) {
            groupedSubcategories[firstLetter] = [];
        }
        groupedSubcategories[firstLetter].push(sub);
    });

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}><h3>Loading...</h3></div>;

    return (
        <>
            <div className="page-title light-background">
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0">A-Z Health Topics</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</a></li>
                            <li className="current">A-Z</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    <div className="row mb-5">
                        <div className="col-lg-6 mx-auto">
                            <div className="search-widget widget-item">
                                <form action="">
                                    <input 
                                        type="text" 
                                        placeholder="Search for a health topic..." 
                                        className="form-control"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ padding: '0.8rem 1.2rem', borderRadius: '30px', border: '1px solid #ddd' }}
                                    />
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                {alphabet.map(letter => (
                                    <a 
                                        key={letter} 
                                        href={`#letter-${letter}`}
                                        className={`btn btn-sm ${groupedSubcategories[letter] ? 'btn-outline-primary' : 'btn-light disabled'}`}
                                        style={{ width: '35px' }}
                                    >
                                        {letter}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-10 mx-auto">
                            {Object.keys(groupedSubcategories).sort().map(letter => (
                                <div key={letter} id={`letter-${letter}`} className="mb-5">
                                    <h2 style={{ 
                                        borderBottom: '2px solid #1977cc', 
                                        paddingBottom: '0.5rem', 
                                        color: '#1977cc',
                                        marginBottom: '1.5rem'
                                    }}>{letter}</h2>
                                    <div className="row">
                                        {groupedSubcategories[letter].map(sub => (
                                            <div key={sub.id} className="col-md-6 col-lg-4 mb-3">
                                                <a 
                                                    onClick={() => navigate(`/details?subcategory_id=${sub.id}`)}
                                                    style={{ 
                                                        cursor: 'pointer', 
                                                        display: 'block', 
                                                        padding: '1rem', 
                                                        backgroundColor: '#f8f9fa', 
                                                        borderRadius: '8px',
                                                        textDecoration: 'none',
                                                        color: '#2c4964',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#1977cc';
                                                        e.currentTarget.style.color = '#fff';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                        e.currentTarget.style.color = '#2c4964';
                                                    }}
                                                >
                                                    {sub.name}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(groupedSubcategories).length === 0 && (
                                <div className="text-center py-5">
                                    <h4>No topics found matching "{searchTerm}"</h4>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default A_Z;

