import React, { useEffect, useState } from "react";
import { useNode } from "../../hooks/useNode";
import "../../static/css/iframe.css";
import ai from "../../static/images/ai.svg";
import NodeRedLogin from './NodeRedLogin';

export default function Editor() {
  const {
    isNodeRedDeployed,
    nodeRedToken,
    checkNodeRedDeployment,
    signIn,
    nodeRedCookie,
  } = useNode();
  const [loginModal, setLoginModal] = useState(false);

  const closeLoginModal = () => {
    setLoginModal(false);
  };

  useEffect(() => {
    if (isNodeRedDeployed) {
      nodeRedCookie();
    }
  }, [isNodeRedDeployed, nodeRedCookie]);

  const handleLogin = async (name, password) => {
    await signIn(name, password);
    checkNodeRedDeployment();
    nodeRedCookie();
    closeLoginModal();
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
            Deploy Node-RED locally to open the editor.
          </p>
          <button
            className="btnReload pt-serif-regular"
            onClick={() => setLoginModal(true)}
          >
            Listo
          </button>
        </div>
      )}

      <NodeRedLogin
        show={loginModal}
        onHide={closeLoginModal}
        onLogin={handleLogin}
      />
    </div>
  );
}
