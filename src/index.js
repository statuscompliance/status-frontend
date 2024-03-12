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
import { statusApi } from './api/statusApi';
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

    async function getGhToken(codeParam) {
        try {
            const response = await statusApi.get(`http://localhost:3001/api/ghAccessToken?code=${codeParam}`);
            const data = response.data;
            if (data.access_token) {
                localStorage.setItem("ghToken", data.access_token);
                window.location.href = '/profile';
            }
        } catch (error) {
            console.error('Error fetching GitHub access token:', error);
        }
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
                        <Link className="navbar-brand navbar-dark pt-serif-bold d-flex align-items-center"to="/">
                            <img alt="Logo" className="logo-svg" src={logoSvg}/>
                            <span className="ml-2">STATUS</span>
                        </Link>
                    <nav className="navbar navbar-dark flex-column">
                        <ul className="navbar-nav align-items-center">
                            <li className="nav-item">
                                <Link className="nav-link pt-serif-regular" to="/catalogs">Catálogos</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link pt-serif-regular" to="/mashups">Mashups</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link pt-serif-regular" to="/editor">Node-RED</Link>
                            </li>
                            <li className="nav-item">
                                { existsCookie('accessToken')? (
                                    <Link className="nav-link pt-serif-regular" to="/logout">Cerrar sesión</Link>
                                ) : (
                                    <Link className="nav-link pt-serif-regular" to="/login">Iniciar sesión</Link>
                                )}
                            </li>
                            <li className='nav-item'>
                                <Link className="nav-link pt-serif-regular" to="/profile">Profile</Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="btn-container">
                        <button className="btn btn-light pt-serif-regular" onClick={clean}>Disconnect</button>
                    </div>
                    <div className="line"></div>
                    <div className="github-container">
                        <a href="https://github.com/statuscompliance/node-red-status" rel="noopener noreferrer" target="_blank">
                            <img alt="github" className="github-svg" src={githubLogo}/>
                        </a>
                    </div>
                </div>
                {/* Main content */}
                <div className="col-md-9">
                    <div className="container-fluid mt-4">
                        <Routes>
                            <Route element={<Catalog />} path="/catalogs"/>
                            <Route element={<Mashup />} path="/mashups"/>
                            <Route element={<NewCatalog />} path="/new_catalog"/>
                            <Route element={<NewMashup />} path="/new_mashup"/>
                            <Route element={<Profile />} path="/profile"/>
                            <Route element={<Login />} path="/login"/>
                            <Route element={<Logout />} path="/logout"/>
                            <Route element={<Editor />} path="/editor"/>
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
