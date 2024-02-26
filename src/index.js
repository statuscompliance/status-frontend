import React from 'react';
import ReactDOM from 'react-dom';
import Catalog from './pages/catalog/Catalog';
import Mashup from './pages/mashup/Mashup';
import NewCatalog from './pages/catalog/NewCatalog';
import NewMashup from './pages/mashup/NewMashup';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './static/css/index.css';
import logoSvg from './static/images/logo.svg';
import githubLogo from './static/images/githubLogo.svg';

const App = () => {
    return (
        <BrowserRouter>
            <div className="app">
                {/* Sidebar */}
                <div className="sidebar">
                        <Link to="/" className="navbar-brand navbar-dark pt-serif-bold d-flex align-items-center">
                            <img src={logoSvg} alt="Logo" className="logo-svg" />
                            <span className="ml-2">STATUS</span>
                        </Link>
                    <nav className="navbar navbar-dark flex-column">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link to="/catalogs" className="nav-link pt-serif-regular">Catálogos</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/mashups" className="nav-link pt-serif-regular">Mashups</Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="line"></div>
                    <div className="github-container">
                        <a href="https://github.com/statuscompliance/node-red-status" target="_blank" rel="noopener noreferrer">
                            <img src={githubLogo} alt="github" className="github-svg" />
                        </a>
                    </div>

                </div>
                {/* Main content */}
                <div className="col-md-9">
                    <div className="container-fluid mt-4">
                        <Routes>
                            <Route path="/catalogs" element={<Catalog />} />
                            <Route path="/mashups" element={<Mashup />} />
                            <Route path="/new_catalog" element={<NewCatalog />} />
                            <Route path="/new_mashup" element={<NewMashup />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
