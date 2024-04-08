// import React from 'react';
import { useTokens } from '../../hooks/useTokens';
import githubLogoBlack from '../../static/images/github-logo.svg';
import trelloLogo from '../../static/images/trello-logo.svg';
import '../../static/css/profile.css';
import { Modal } from 'react-bootstrap';

const clientId = "72548f03fe112aedfd33";

const Profile = () => {
  const trelloToken = localStorage.getItem('trelloToken');
  const {
    isLoggedInGH,
    isLoggedInTrello,
    gitUsername,
    trelloUsername,
    showTrelloModal,
    openTrelloAuthorization,
    closeTrelloModal,
    handleTrelloTokenSubmit
  } = useTokens();

  const loginWithGithub = () => {
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user`);
  };

  return (
    <section className="profile-container">
      <div className="profile-info">
        <div className="personal-details">
          <div>
            <p>Full Name</p>
            <p>Johnatan Smith</p>
          </div>
          <hr />
          <div>
            <p>Email</p>
            <p>example@example.com</p>
          </div>
          <hr />
        </div>
      </div>

      <div className="profile-connections">
        <div>
          {isLoggedInGH ? (
            <p>Logged in GitHub as {gitUsername}</p>
          ) : (
            <button onClick={loginWithGithub}>
              Connect your GitHub account
              <img src={githubLogoBlack} alt="GitHub Logo" className="logo-img" />
            </button>
          )}
        </div>

        <div>
          {isLoggedInTrello ? (
            <p>Logged in Trello as {trelloUsername}</p>
          ) : (
            <button onClick={openTrelloAuthorization}>
              Connect your Trello account
              <img src={trelloLogo} alt="Trello Logo" className="logo-img" />
            </button>
          )}
        </div>
      </div>

      <div className="modal-content">
          <Modal onHide={closeTrelloModal} show={showTrelloModal}>
            <Modal.Header closeButton>
                <Modal.Title>Copia aquí tu token de Trello</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input
              type="text"
              placeholder="Introduce el token de Trello"
              value={trelloToken}
              onChange={(e) => localStorage.setItem("trelloToken", e.target.value)}
            />
            </Modal.Body>
            <Modal.Footer>
                <button onClick={closeTrelloModal}>Cancelar</button>
                <button onClick={() => handleTrelloTokenSubmit(localStorage.getItem('trelloToken'))}>Conectar</button>
            </Modal.Footer>
        </Modal>
      </div>
    </section>
  );
};

export default Profile;
