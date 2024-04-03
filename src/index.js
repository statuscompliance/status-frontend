import  {useEffect, useState} from 'react';
import {createRoot } from 'react-dom/client'; 
import Catalog from './pages/catalog/Catalog';
import Mashup from './pages/mashup/Mashup';
import NewCatalog from './pages/catalog/NewCatalog';
import NewMashup from './pages/mashup/NewMashup';
import Profile from './pages/profile/Profile';
import Login from './pages/auth/Login';
import Logout from './pages/auth/Logout';
import Editor from './pages/node-red/Editor';
import Chat from './pages/chat/Chat';
import Home from './pages/Home';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import { statusApi } from './api/statusApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './static/css/index.css';
import logoSvg from './static/images/logo.svg';
import githubLogo from './static/images/githubLogo.svg';
import { useCookie } from './hooks/useCookie';
import { useAuth } from './hooks/useAuth';
import { Modal } from 'react-bootstrap';

const App = ({ Component, pageProps }) => {
    const [showModal, setShowModal] = useState(false);
    const existsCookie = useCookie('accessToken');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { handleRefresh } = useAuth();

    useEffect(() => {
        setIsLoggedIn(existsCookie);
    }, [existsCookie]);

    const handleLogout = () => {
        statusApi.get('http://localhost:3001/api/user/signOut')
            .then(() => {
                document.cookie = `accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                document.cookie = `refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                window.location.reload();
            })
            .catch((error) => {
                console.error(error.message);
            });
    };

    function clean(){
        localStorage.clear();
        window.location.href = '/';
    }

    const handleRefreshToken = (e) => {
        handleRefresh(e);
        setShowModal(false);
    };

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

    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setShowModal(true);
    //     }, 3420000); // 57 minutos en milisegundos

    //     return () => clearInterval(timer);
    // }, []);

    return (
        <BrowserRouter>
                {showModal && isLoggedIn && (
                        // <Modal onClose={() => setShowModal(false)}>
                        <div>
                            <h2>¿Sigues ahí?</h2>
                            <p>Tu sesión está a punto de expirar.</p>
                            <p>Cuenta atrás: <CountdownTimer onTimeout={handleLogout}/></p>
                            <button onClick={handleRefreshToken}>Sí</button>
                        </div>
                        // </Modal>
                )}
                {/* Sidebar */}
                <div className="sidebar">
                        <Link className="navbar-brand navbar-dark pt-serif-bold d-flex align-items-center"to="/">
                            <img alt="Logo" className="logo-svg" src={logoSvg}/>
                            <span className="ml-2">STATUS</span>
                        </Link>
                    <nav className="navbar navbar-dark flex-column">
                        <ul className="navbar-nav align-items-start">
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
                                <Link className="nav-link pt-serif-regular" to="/chat">Chat</Link>
                            </li>
                            <li className="nav-item">
                                { existsCookie? (
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
                {/* Routes */}
                <Routes>
                    <Route exact element={<Home/>}path="/" />
                    <Route element={<Catalog />} path="/catalogs"/>
                    <Route element={<Mashup />} path="/mashups"/>
                    <Route element={<NewCatalog />} path="/new_catalog"/>
                    
                    <Route element={<NewMashup />} path="/new_mashup"/>
                    <Route element={<Profile />} path="/profile"/>
                    <Route element={<Login />} path="/login"/>
                    <Route element={<Logout />} path="/logout"/>
                    <Route element={<Editor />} path="/editor"/>
                    <Route element={<Chat />} path="/chat"/>
                </Routes>
        </BrowserRouter>
    );
}

const CountdownTimer = ({ onTimeout }) => {
    const [seconds, setSeconds] = useState(60);


    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (seconds === 0) {
            onTimeout();
        }
    }, [seconds, onTimeout]);

    return <span>{seconds}</span>;
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
