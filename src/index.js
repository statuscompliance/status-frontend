import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Catalog from "./pages/catalog/Catalog";
import Mashup from "./pages/mashup/Mashup";
import NewCatalog from "./pages/catalog/NewCatalog";
import Profile from "./pages/profile/Profile";
import Login from "./pages/auth/Login";
import Editor from "./pages/node-red/Editor";
import Chat from "./pages/chat/Chat";
import Home from "./pages/Home";
import Admin from "./pages/admin/Admin";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import { statusApi } from "./api/statusApi";
import "bootstrap/dist/css/bootstrap.min.css";
import "./static/css/index.css";
import logoSvg from "./static/images/logo.svg";
import githubLogo from "./static/images/githubLogo.svg";
import { useCookie } from "./hooks/useCookie";
import { useAuth } from "./hooks/useAuth";
import { useAdmin } from "./hooks/useAdmin";
import { Modal } from "react-bootstrap";

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const existsCookie = useCookie("accessToken");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { handleRefresh, getAuthority, authority } = useAuth();
  const { configData, getGPTConfiguration } = useAdmin();

  useEffect(() => {
    setIsLoggedIn(existsCookie);
    if (!authority) {
      getAuthority();
    }
  }, [existsCookie, getGPTConfiguration, configData, getAuthority, authority]);

  useEffect(() => {
    if (existsCookie && !configData) {
      getGPTConfiguration();
    } else if (existsCookie) {
      getGPTConfiguration();
    }
  }, [configData, getGPTConfiguration, existsCookie]);

  const handleLogout = () => {
    statusApi
      .get("http://localhost:3001/api/user/signOut")
      .then(() => {
        document.cookie = `accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        document.cookie = `refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        document.cookie = `nodeRedAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        window.location.reload();
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleRefreshToken = (e) => {
    handleRefresh(e);
    setShowModal(false);
  };

  async function getGhToken(codeParam) {
    try {
      const response = await statusApi.get(
        `http://localhost:3001/api/ghAccessToken?code=${codeParam}`
      );
      const data = response.data;
      if (data.access_token) {
        localStorage.setItem("ghToken", data.access_token);
        window.location.href = "/profile";
      }
    } catch (error) {
      console.error("Error fetching GitHub access token:", error);
    }
  }

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");

    if (codeParam && localStorage.getItem("ghToken") === null) {
      getGhToken(codeParam);
    }

    const timer = setInterval(() => {
      setShowModal(true);
    }, 3420000); // 57 minutos en milisegundos
    return () => clearInterval(timer);
  }, []);

  return (
    <BrowserRouter>
      {showModal && isLoggedIn && (
        <div className="timeout">
          <Modal onHide={() => setShowModal(false)} show={showModal}>
            <Modal.Header closeButton>
              <Modal.Title>¿Sigues ahí?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Tu sesión está a punto de expirar. Cuenta atrás:{" "}
              <CountdownTimer onTimeout={handleLogout} />
            </Modal.Body>
            <Modal.Footer>
              <button onClick={closeLogoutModal}>Cancelar</button>
              <button onClick={handleRefreshToken}>Sí</button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
      {isLoggedIn && showLogoutModal ? (
        <div className="logout">
          <Modal onHide={closeLogoutModal} show={showLogoutModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmación</Modal.Title>
            </Modal.Header>
            <Modal.Body>¿Estás seguro que deseas cerrar sesión?</Modal.Body>
            <Modal.Footer>
              <button onClick={closeLogoutModal}>Cancelar</button>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : (
        <div></div>
      )}
      {/* Sidebar */}
      <div className="sidebar">
        <Link
          className="navbar-brand navbar-dark pt-serif-bold d-flex align-items-center"
          to="/"
        >
          <img alt="Logo" className="logo-svg" src={logoSvg} />
          <span className="ml-2">STATUS</span>
        </Link>
        <nav className="navbar navbar-dark flex-column">
          <ul className="navbar-nav align-items-start">
            {authority === "ADMIN" ? (
              <li className="nav-item">
                <Link className="nav-link pt-serif-regular" to="/admin">
                  Administración de OpenAI
                </Link>
              </li>
            ) : null}
            <li className="nav-item">
              <Link className="nav-link pt-serif-regular" to="/catalogs">
                Catálogos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link pt-serif-regular" to="/mashups">
                Mashups
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link pt-serif-regular" to="/editor">
                Node-RED
              </Link>
            </li>
            {configData &&
              configData.thread &&
              configData.assistant &&
              configData.thread.available &&
              configData.assistant.available && (
                <li className="nav-item">
                  <Link className="nav-link pt-serif-regular" to="/chat">
                    Chat
                  </Link>
                </li>
              )}
            <li className="nav-item">
              <Link className="nav-link pt-serif-regular" to="/profile">
                Profile
              </Link>
            </li>
            <li className="nav-item">
              {existsCookie ? (
                <p
                  className="nav-link pt-serif-regular"
                  onClick={openLogoutModal}
                >
                  Cerrar sesión
                </p>
              ) : (
                <Link className="nav-link pt-serif-regular" to="/login">
                  Iniciar sesión
                </Link>
              )}
            </li>
          </ul>
        </nav>
        <div className="line"></div>
        <div className="github-container">
          <a
            href="https://github.com/statuscompliance/node-red-status"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img alt="github" className="github-svg" src={githubLogo} />
          </a>
        </div>
      </div>
      {/* Routes */}
      <div className="content">
        <Routes>
          <Route exact element={<Home />} path="/" />
          <Route element={<Catalog />} path="/catalogs" />
          <Route element={<Mashup />} path="/mashups" />
          <Route element={<NewCatalog />} path="/new_catalog" />
          <Route element={<Profile />} path="/profile" />
          <Route element={<Login />} path="/login" />
          <Route element={<Editor />} path="/editor" />
          <Route element={<Chat />} path="/chat" />
          <Route element={<Admin />} path="/admin" />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const CountdownTimer = ({ onTimeout }) => {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      onTimeout();
    }
  }, [seconds, onTimeout]);

  return <span>{seconds}</span>;
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
