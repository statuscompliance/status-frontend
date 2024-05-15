import React, { useEffect, useState } from "react";
import { useNode } from "../../hooks/useNode";
import "../../static/css/iframe.css";
import ai from "../../static/images/ai.svg";
import { Modal } from "react-bootstrap";

export default function Editor() {
  const {
    isNodeRedDeployed,
    nodeRedToken,
    checkNodeRedDeployment,
    signIn,
    nodeRedCookie,
  } = useNode();
  const [loginModal, setLoginModal] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const closeLoginModal = () => {
    setLoginModal(false);
  };

  useEffect(() => {
    if (isNodeRedDeployed) {
      nodeRedCookie();
    }
  }, [isNodeRedDeployed, nodeRedCookie]);

  const handleLogin = async () => {
    await signIn(name, password);
    checkNodeRedDeployment();
    nodeRedCookie();
    closeLoginModal();
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="editor">
      {isNodeRedDeployed && nodeRedToken ? (
        <div className="node-red-off">
          <iframe
            className="node-red-editor"
            src="http://localhost:1880"
            title="Node-RED"
          ></iframe>
          <button
            className="chatButton"
            onClick={() => (window.location.href = "/chat")}
          >
            <img src={ai} alt="ai" className="chatImg" />
            Asistente
          </button>
        </div>
      ) : (
        <div className="node-red-off">
          <p className="disclaimer">
            Despliega Node-RED de forma local para abrir el editor.
          </p>
          <button
            className="btnReload pt-serif-regular"
            onClick={() => setLoginModal(true)}
          >
            Listo
          </button>
        </div>
      )}

      <div
        className="modal-content"
        style={isNodeRedDeployed ? {} : { display: "none" }}
      >
        <Modal onHide={closeLoginModal} show={loginModal}>
          <Modal.Header closeButton>
            <Modal.Title>Iniciar sesión en Node-RED</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="form-group">
                <label htmlFor="name">Nombre:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña:</label>
                <br></br>
                <input
                  type="password"
                  id="pswd"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <button className="decline" onClick={closeLoginModal}>
              Cancelar
            </button>
            <button className="accept" onClick={() => handleLogin()}>
              Iniciar sesión
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
