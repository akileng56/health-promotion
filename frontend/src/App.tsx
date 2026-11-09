import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeaderComponent from "./components/header";
import FooterComponent from "./components/footer";
import Categories from "./components/Categories";
import Home from "./components/Home";
import A_Z from "./components/A-Z";
import Overview from "./components/admin/Overview";
import Details from "./components/Details";

const ensureTrailingSlash = (url?: string | URL | null) => {
    if (typeof url === "string") {
        return url.replace(/^(\/health-promotions)(?=[?#]|$)/, "$1/");
    }
    return url;
};

if (typeof window !== "undefined") {
    if (window.location.pathname === "/health-promotions") {
        window.history.replaceState(
            window.history.state,
            "",
            `/health-promotions/${window.location.search}${window.location.hash}`
        );
    }
    const origPushState = window.history.pushState.bind(window.history);
    const origReplaceState = window.history.replaceState.bind(window.history);
    window.history.pushState = (data: any, unused: string, url?: string | URL | null) =>
        origPushState(data, unused, ensureTrailingSlash(url));
    window.history.replaceState = (data: any, unused: string, url?: string | URL | null) =>
        origReplaceState(data, unused, ensureTrailingSlash(url));
}

const App = () => {
    return (
        <>
            <Router basename="/health-promotions">
                <HeaderComponent />
                <main className="main">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/details" element={<Details />} />
                        <Route path="/a-z" element={<A_Z />} />
                        <Route path="/admin" element={<Overview />} />
                    </Routes>
                </main>
                <FooterComponent />
            </Router>
        </>
    );
};

export default App;