import { NavLink } from 'react-router-dom';
const HeaderComponent = () => {
    return (
        <header id="header" className="header d-flex align-items-center sticky-top">
            <div className="container-fluid container-xl position-relative d-flex align-items-center">

                <a href="/" className="logo d-flex align-items-center me-auto">
                    <img src="/assets/img/logo.png" alt="logo-title"/>
                    <h1 className="sitename">Health Promotions</h1>
                </a>

                <nav id="navmenu" className="navmenu">
                    <ul>
                        <li>
                            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/categories" className={({ isActive }) => isActive ? "active" : ""}>
                                Disease Categories
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/a-z"
                                className={({ isActive }) => isActive ? "active" : ""}
                            >
                                A-Z
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin"
                                className={({ isActive }) => isActive ? "active" : ""}
                            >
                                Admin
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default HeaderComponent;