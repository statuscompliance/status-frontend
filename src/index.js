import {React, useEffect} from 'react';
import {createRoot } from 'react-dom/client'; 
import Catalog from './pages/catalog/Catalog';
import Mashup from './pages/mashup/Mashup';
import NewCatalog from './pages/catalog/NewCatalog';
import NewMashup from './pages/mashup/NewMashup';
import Profile from './pages/profile/Profile';
import Login from './pages/auth/Login';
import Logout from './pages/auth/Logout';
import Editor from './pages/node-red/Editor';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './static/css/index.css';
import logoSvg from './static/images/logo.svg';
import githubLogo from './static/images/githubLogo.svg';

const App = () => {

    const existsCookie = (name) => {
        const cookieString = document.cookie;
        const cookies = cookieString.split(';');
        
        for (const cookie of cookies) {
            const cookieTrimmed = cookie.trim();
            if (cookieTrimmed.startsWith(name + '=')) {
                return true;
            }
        }
        return false;
    };

    function clean(){
        localStorage.clear();
        window.location.href = '/';
    }

    async function getGhToken(codeParam, setRerender) {
        await fetch("http://localhost:3001/api/ghAccessToken?code=" + codeParam, {
            method: "GET"
        }).then((response) => {
            console.log(response);
            return response.json();
        }).then((data) => {
            if(data.access_token){
                localStorage.setItem("ghToken", data.access_token);
                window.location.href = '/profile';
            }
        });
    }
    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const codeParam = urlParams.get("code");

        if(codeParam && (localStorage.getItem("ghToken") === null)){
            getGhToken(codeParam);
        }
    }, []);


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
                        <ul className="navbar-nav align-items-center">
                            <li className="nav-item">
                                <Link to="/catalogs" className="nav-link pt-serif-regular">Catálogos</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/mashups" className="nav-link pt-serif-regular">Mashups</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/editor" className="nav-link pt-serif-regular">Node-RED</Link>
                            </li>
                            <li className="nav-item">
                                { existsCookie('accessToken')? (
                                    <Link to="/logout" className="nav-link pt-serif-regular">Cerrar sesión</Link>
                                ) : (
                                    <Link to="/login" className="nav-link pt-serif-regular">Iniciar sesión</Link>
                                )}
                            </li>
                            <li className='nav-item'>
                                <Link to="/profile" className="nav-link pt-serif-regular">Profile</Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="btn-container">
                        <button className="btn btn-light pt-serif-regular" onClick={clean}>Disconnect</button>
                    </div>
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
                            <Route path="/editor" element={<Editor />} />
                            <Route path="/login" element={<Login/>} />
                            <Route path="/logout" element={<Logout/>} />
                            <Route path="/mashups" element={<Mashup />} />
                            <Route path="/new_catalog" element={<NewCatalog />} />
                            <Route path="/new_mashup" element={<NewMashup />} />
                            <Route path="/profile" element={<Profile/>} />
                        </Routes>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
