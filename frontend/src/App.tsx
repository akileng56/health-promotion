import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HeaderComponent from "./components/header";
import FooterComponent from "./components/footer";
import Categories from "./components/Categories.jsx";
import Home from "./components/Home";
import A_Z from "./components/A-Z";
import Overview from "./components/admin/Overview";
import Details from "./components/Details";

const App = () => {
    return (
        <>
            <Router>
                <HeaderComponent/>
                <main className="main">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/categories" element={<Categories/>}/>
                        <Route path="/details" element={<Details/>}/>
                        <Route path="/a-z" element={<A_Z/>}/>
                        <Route path="/admin" element={<Overview/>}/>
                    </Routes>
                </main>
                <FooterComponent/>
            </Router>
        </>
);
};

export default App;