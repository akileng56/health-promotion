import { useNavigate } from 'react-router-dom';
export default function Categories() {
    const navigate = useNavigate();
    return (
        <section id="features" className="features  services section">


            <div className="container section-title">
                <h2>Categories</h2>
                <p>Check Our Categories<br/></p>
            </div>


            <div className="container">

                <div className="row">
                    <div className="col-lg-3">
                        <ul className="nav nav-tabs flex-column">
                            <li className="nav-item">
                                <a className="nav-link active show" data-bs-toggle="tab" href="#features-tab-1">
                                    Epidemics
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-bs-toggle="tab" href="#features-tab-2">Covid-19</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-bs-toggle="tab" href="#features-tab-3">Health in women</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-bs-toggle="tab" href="#features-tab-4">Health in men</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-bs-toggle="tab" href="#features-tab-5">Young people and
                                    Children</a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-lg-9 mt-4 mt-lg-0">
                        <div className="tab-content">
                            <div className="tab-pane active show" id="features-tab-1">
                                <div className="col-lg-8 details order-2 order-lg-1">
                                    <h3>Epidemics Categories</h3>
                                </div>
                                <div className="row">
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a onClick={() => navigate('/details')}
                                                                     className="stretched-link">Ebola</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Cholera</a>
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Yellow
                                                Fever</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Measles and
                                                Rubella</a></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane" id="features-tab-2">
                                <div className="col-lg-8 details order-2 order-lg-1">
                                    <h3>Covid-19 Categories</h3>
                                </div>
                                <div className="row">
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Covid-19 in the
                                                community</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Experiences of
                                                Covid-19 and Intensive Care</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Family
                                                experiences of Long Covid</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Long Covid in
                                                Adults</a></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane" id="features-tab-3">
                                <div className="col-lg-8 details order-2 order-lg-1">
                                    <h3>Health in Women</h3>
                                </div>
                                <div className="row">
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Antenatal
                                                Screening</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Breast Cancer
                                                in women</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#"
                                                                     className="stretched-link">Breastfeeding</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Feeding a baby
                                                while living with HIV</a></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane" id="features-tab-4">
                                <div className="col-lg-8 details order-2 order-lg-1">
                                    <h3>Health in Men Categories</h3>
                                </div>
                                <div className="row">
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Prostate
                                                Cancer</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Testicular
                                                Cancer</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Penile
                                                Cancer</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">PSA test for
                                                prostate cancer</a></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane" id="features-tab-5">
                                <div className="col-lg-8 details order-2 order-lg-1">
                                    <h3>Young people and Children Categories</h3>
                                </div>
                                <div className="row">
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Drugs and
                                                Alcohol (young people)</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Diabetes type 1
                                                (young people)</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Epilepsy in
                                                Young People</a></h4>
                                        </div>
                                    </div>
                                    <div className="col-md-3" >
                                        <div className="service-item d-flex position-relative h-100">
                                            <h4 className="title"><a href="#" className="stretched-link">Health and
                                                weight (young people)</a></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </section>
    );
}
