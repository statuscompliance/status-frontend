import React from 'react';
import ReactDOM from 'react-dom';
import Catalog from './pages/catalog/Catalog';
import Mashup from './pages/mashup/Mashup';
import NewCatalog from './pages/catalog/NewCatalog';
import NewMashup from './pages/mashup/NewMashup';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    return (
        <BrowserRouter>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark"> 
                <div className="container-fluid"> 
                    <div className="navbar-logo">
                        <a className="navbar-brand" href="/">STATUS</a>
                    </div>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span> 
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto"> 
                            <li className="nav-item"> 
                                <Link to="/catalogs" className="nav-link">Catálogos</Link>
                            </li>
                            <li className="nav-item"> 
                                <Link to="/mashups" className="nav-link">Mashups</Link>
                            </li>
                        </ul>
                        <div className="navbar-auth"> 
                            <button className="navbar-button btn btn-primary me-2">Iniciar Sesión</button>
                            <button className="navbar-button btn btn-secondary">Registrarse</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container-fluid mt-4">
                <Routes>
                    <Route path="/catalogs" element={<Catalog />} />
                    <Route path="/mashups" element={<Mashup />} />
                    <Route path="/new_catalog" element={<NewCatalog />} />
                    <Route path="/new_mashup" element={<NewMashup />} />
                </Routes>      
            </div>
        </BrowserRouter>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
