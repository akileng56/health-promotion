import { useNavigate } from 'react-router-dom';
const Home = () => {
    const navigate = useNavigate();
    return (
        <>
            <section id="hero" className="hero section dark-background">

                <div id="hero-carousel" className="carousel slide carousel-fade" data-bs-ride="carousel"
                     data-bs-interval="5000">

                    <div className="carousel-item active">
                        <img src="/assets/img/hero-carousel/home-carousel-1.jpg" alt="Health Research Stories 1"/>
                        <div className="carousel-container">
                            <h2>Welcome to Uganda Health Promotions<br/></h2>
                            <p>Uganda Health Promotions presents analysed collections of interviews from health research
                                studies. Thousands of people have shared their stories to help others see, hear or read
                                what
                                it’s like to have a health condition such as bowel cancer or depression.</p>
                            <a onClick={() => navigate('/categories')} className="btn-get-started">Disease
                                Categories</a>
                        </div>
                    </div>


                    <div className="carousel-item">
                        <img src="/assets/img/hero-carousel/home-carousel.jpg" alt="Health Research Stories 2"/>
                        <div className="carousel-container">
                            <h2>Welcome to Uganda Health Promotions</h2>
                            <p>Uganda Health Promotions presents analysed collections of interviews from health research
                                studies. Thousands of people have shared their stories to help others see, hear or read
                                what
                                it’s like to have a health condition such as bowel cancer or depression.</p>
                            <a onClick={() => navigate('/categories')} className="btn-get-started">Disease
                                Categories</a>
                        </div>
                    </div>


                    <a className="carousel-control-prev" href="#hero-carousel" role="button" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon bi bi-chevron-left" aria-hidden="true"></span>
                    </a>

                    <a className="carousel-control-next" href="#hero-carousel" role="button" data-bs-slide="next">
                        <span className="carousel-control-next-icon bi bi-chevron-right" aria-hidden="true"></span>
                    </a>

                    <ol className="carousel-indicators"></ol>

                </div>

            </section>
            <section id="about" className="about section">
                <div className="container section-title">
                    <h2>About</h2>
                    <p>About Us<br/></p>
                </div>

                <div className="container">

                    <div className="row gy-4">

                        <div className="col-lg-6 content">
                            <p>
                                The Ministry of Health in Uganda drives public health through its Department of Health
                                Promotion, Education and Strategic Communication. The department focuses on preventive
                                care, community mobilization, risk communication, and health literacy to reduce disease
                                burdens and healthcare overcrowding.
                            </p>
                            <ul>
                                <li><span><strong>Community Health Workers (CHEWs):</strong> The Ministry trains and deploys Community Health Extension Workers at the parish level to monitor local health, promote hygiene, and encourage preventive care.</span>
                                </li>
                                <li><span><strong>Health Education:</strong>The department leads campaigns on public health issues like sanitation, nutrition, maternal care, and disease prevention.</span>
                                </li>
                                <li><span><strong>Strategic Communication:</strong> Collaborates with organizations like the WHO and Africa CDC to manage public health emergencies and share practical health education.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="col-lg-6">
                            <p>For more information, resources, and health guidelines, visit the official Ministry of
                                Health Uganda portal. You can also access specific health promotion bulletins and
                                guidelines via the Ministry of Health Library.</p>
                            <a href="https://health.go.ug/" target="_blank" className="read-more"><span>Read More</span><i
                                className="bi bi-arrow-right"></i></a>
                        </div>

                    </div>

                </div>

            </section>
        </>
    );
};

export default Home;