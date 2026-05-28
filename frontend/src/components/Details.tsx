import { useNavigate } from 'react-router-dom';
const Details = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="page-title light-background">
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0">Ebola In Uganda</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><a onClick={() => navigate('/')}>Home</a></li>
                            <li className="current">Ebola Details</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container">
                <div className="row">

                    <div className="col-lg-8">
                        <section id="blog-details" className="blog-details section">
                            <div className="container">

                                <article className="article">

                                    <div className="post-img">
                                        <img src="assets/img/blog/ebola.jpeg" alt="" className="img-fluid"/>
                                    </div>

                                    <h2 className="title">Uganda confirms Ebola outbreak, reassures citizens of health
                                        measures</h2>

                                    <div className="meta-top">
                                        <ul>
                                            <li className="d-flex align-items-center"><i className="bi bi-clock"></i> <a
                                                href="ebola-details.html">
                                                <time dateTime="2026-01-29">January 29, 2026</time>
                                            </a></li>
                                        </ul>
                                    </div>

                                    <div className="content">
                                        <p>
                                            The government of Uganda has assured citizens that it is in “full control”
                                            of their safety as the country battles a fresh outbreak of the Sudan strain
                                            of the Ebola virus that was confirmed on January 30.

                                            <br/> Dr. Diana Atwine, Permanent Secretary of the Uganda Ministry of
                                            Health, said in a statement that a 32-year-old male nurse died of Ebola in
                                            Kampala on Wednesday, January 29, following a laboratory confirmation from
                                            three national reference laboratories.

                                            <br/> “The Government of Uganda would like to reassure the public that the
                                            Ministry of Health is in full control of the situation and continue to safe
                                            guard the lives of all people in Uganda,” reads the statement.
                                        </p>
                                        <br/>
                                        <p>
                                            According to Dr. Atwine, this is the eighth Ebola outbreak in Uganda.
                                            <br/><br/>
                                            Narrating how the nurse died after seeking medical attention in several
                                            health facilities, Dr. Atwine said, “The patient presented with a five-day
                                            history of high fever, chest pain, and difficulty in breathing, which later
                                            progressed to unexplained bleeding from multiple body sites. The patient
                                            experienced multi-organ failure and succumbed.”
                                        </p>

                                        <blockquote>
                                            <p>
                                                Uganda’s government has warned people to avoid physical contact with
                                                individuals exhibiting Ebola symptoms, asking all citizens to maintain
                                                strict hand hygiene by washing hands regularly with soap and water or
                                                using hand sanitizers.
                                            </p>
                                        </blockquote>
                                        <iframe
                                            width="770"
                                            height="468"
                                            src="https://www.youtube.com/embed/Kh9VYpn2qak"
                                            title="Ebola Outbreak In DR Congo & Uganda"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen>
                                        </iframe>

                                        <h3>Government interventions</h3>
                                        <p>
                                            The Ministry of Health has since activated the Incident Management Team and
                                            dispatched Rapid Response Teams to both Mbale City and Saidina Abubakar
                                            Islamic Hospital in Matugga to list all the contacts and isolate them. This
                                            is to help curb the spread of the disease.
                                        </p>

                                        <p>
                                            “Facilities have been identified for isolation of all listed contacts. Any
                                            contact that develops symptoms will be transferred to a designated isolation
                                            center,” said Dr. Atwine. “Vaccination of all contacts of the deceased
                                            against Ebola Virus Disease is set to commence immediately. The available
                                            doses of the Ebola Vaccine is prioritized for contacts and health workers.”
                                        </p>

                                        <p>
                                            Additionally, Uganda’s Ministry of Health is organizing to carry out
                                            dignified burial of the deceased to prevent spread of the virus and the
                                            “epidemiological team has been dispatched to activate the Regional Emergency
                                            Operation Centers in Kampala and Mbale.”
                                        </p>

                                        <iframe
                                            width="770"
                                            height="468"
                                            src="https://www.youtube.com/embed/7iMgGxcDVo0"
                                            title="Ebola Outbreak In DR Congo & Uganda"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen>
                                        </iframe>

                                        <h3>Appeal to the Public</h3>
                                        <p>
                                            Uganda’s government has warned people to avoid physical contact with
                                            individuals exhibiting Ebola symptoms, asking all citizens to maintain
                                            strict hand hygiene by washing hands regularly with soap and water or using
                                            hand sanitizers.
                                        </p>
                                        <p>
                                            Ebola is typically spread through direct contact with bodily fluids from
                                            infected patients.
                                        </p>
                                        <p>
                                            Dr. Atwine underscored that a suspected Ebola case presents symptoms such as
                                            sudden onset fever, fatigue, chest pain, diarrhea, vomiting, unexplained
                                            bleeding, yellowing of the eyes, restlessness and headache, among others.
                                        </p>

                                    </div>

                                    <div className="meta-bottom">
                                        <i className="bi bi-folder"></i>
                                        <ul className="cats">
                                            <li><a href="#">Cases</a></li>
                                        </ul>

                                        <i className="bi bi-tags"></i>
                                        <ul className="tags">
                                            <li><a href="#">Interventions</a></li>
                                            <li><a href="#">Tips</a></li>
                                            <li><a href="#">Appeal</a></li>
                                        </ul>
                                    </div>


                                </article>
                            </div>
                        </section>

                    </div>

                    <div className="col-lg-4 sidebar">

                        <div className="widgets-container">

                            <div className="recent-posts-widget widget-item">

                                <h3 className="widget-title">Recent Posts</h3>

                                <div className="post-item">
                                    <img src="assets/img/recent/recent-1.jpg" alt="" className="flex-shrink-0"/>
                                    <div>
                                        <h4><a href="ebola-details.html">Ebola cases in Uganda rise to 9, while 265
                                            under quarantine</a></h4>
                                        <time dateTime="2020-01-01">Jan 26, 2026</time>
                                    </div>
                                </div>


                                <div className="post-item">
                                    <img src="assets/img/blog/blog-recent-2.jpg" alt="" className="flex-shrink-0"/>
                                    <div>
                                        <h4><a href="ebola-details.html">Ebola Virus Disease outbreak spills over into
                                            Uganda</a></h4>
                                        <time dateTime="2020-01-01">Jun 11, 2019</time>
                                    </div>
                                </div>


                                <div className="post-item">
                                    <img src="assets/img/blog/blog-recent-3.jpg" alt="" className="flex-shrink-0"/>
                                    <div>
                                        <h4><a href="ebola-details.html">Uganda works to contain Ebola outbreak</a></h4>
                                        <time dateTime="2020-01-01">Oct 21, 2022</time>
                                    </div>
                                </div>


                                <div className="post-item">
                                    <img src="assets/img/blog/blog-recent-4.jpg" alt="" className="flex-shrink-0"/>
                                    <div>
                                        <h4><a href="ebola-details.html">Uganda starts clinical trial of vaccine for
                                            Sudan strain of Ebola</a></h4>
                                        <time dateTime="2020-01-01">Feb 4, 2025</time>
                                    </div>
                                </div>


                                <div className="post-item">
                                    <img src="assets/img/blog/blog-recent-5.jpg" alt="" className="flex-shrink-0"/>
                                    <div>
                                        <h4><a href="ebola-details.html">Ebola outbreak spreads in Kampala</a></h4>
                                        <time dateTime="2020-01-01">Jan 1, 2020</time>
                                    </div>
                                </div>


                            </div>

                            <div className="tags-widget widget-item">

                                <h3 className="widget-title">Tags</h3>
                                <ul>
                                    <li><a href="#">Ebola</a></li>
                                    <li><a href="#">Outbreak</a></li>
                                    <li><a href="#">Tips</a></li>
                                    <li><a href="#">Cases</a></li>
                                    <li><a href="#">Confirmed</a></li>
                                    <li><a href="#">Appeal</a></li>
                                    <li><a href="#">Interventions</a></li>
                                    <li><a href="#">Reported</a></li>
                                    <li><a href="#">Suspected</a></li>
                                    <li><a href="#">Deaths</a></li>
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
