const FooterComponent = () => {
    return (
        <footer id="footer" className="footer dark-background">
            <div className="container footer-top">
                <div className="row gy-4">
                    <div className="col-lg-4 col-md-6 footer-about">
                        <a href="/" className="logo d-flex align-items-center">
                            <span className="sitename">Health Promotions</span>
                        </a>
                        <div className="footer-contact pt-3">
                            <p>Lourdel Road</p>
                            <p>Kampala, Uganda</p>
                            <p className="mt-3"><strong>Phone:</strong> <span>+1 5589 55488 55</span></p>
                            <p><strong>Email:</strong> <span>info@example.com</span></p>
                        </div>
                        <div className="social-links d-flex mt-4">
                            <a href=""><i className="bi bi-twitter-x"></i></a>
                            <a href=""><i className="bi bi-facebook"></i></a>
                            <a href=""><i className="bi bi-instagram"></i></a>
                            <a href=""><i className="bi bi-linkedin"></i></a>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-3 footer-links">
                        <h4>Useful Links</h4>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/categories">Disease Categories</a></li>
                            <li><a href="/a-z">A-Z Index</a></li>
                            <li><a href="/admin">Admin Portal</a></li>
                        </ul>
                    </div>

                    <div className="col-lg-2 col-md-3 footer-links">
                        <h4>Health Topics</h4>
                        <ul>
                            <li><a href="/categories">Infectious Diseases</a></li>
                            <li><a href="/categories">Prevention</a></li>
                            <li><a href="/categories">Health Education</a></li>
                            <li><a href="/categories">Guidelines</a></li>
                        </ul>
                    </div>

                    <div className="col-lg-4 col-md-12 footer-newsletter">
                        <h4>Our Newsletter</h4>
                        <p>Subscribe to our newsletter and receive the latest news about our products and services!</p>
                        <form action="forms/newsletter.php" method="post" className="php-email-form">
                            <div className="newsletter-form"><input type="email" name="email"/><input type="submit"
                                                                                                      value="Subscribe"/>
                            </div>
                            <div className="loading">Loading</div>
                            <div className="error-message"></div>
                            <div className="sent-message">Your subscription request has been sent. Thank you!</div>
                        </form>
                    </div>

                </div>
            </div>

            <div className="container copyright text-center mt-4">
                <p>© <span>Ministry of Health - Uganda</span></p>
            </div>
        </footer>
    );
};

export default FooterComponent;