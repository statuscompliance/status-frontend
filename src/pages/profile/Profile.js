import { useTokens } from "../../hooks/useTokens";
import githubLogoBlack from "../../static/images/github-logo.svg";
import trelloLogo from "../../static/images/trello-logo.svg";
import "../../static/css/profile.css";
import { Modal } from "react-bootstrap";

const clientId = "72548f03fe112aedfd33";

const Profile = () => {
  const trelloToken = localStorage.getItem("trelloToken");
  const {
    isLoggedInGH,
    isLoggedInTrello,
    showTrelloModal,
    openTrelloAuthorization,
    closeTrelloModal,
    handleTrelloTokenSubmit,
  } = useTokens();

  const loginWithGithub = () => {
    if (isLoggedInGH) {
      localStorage.removeItem("ghToken");
      window.location.reload();
    } else {
      window.location.assign(
        `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user`
      );
    }
  };
  const loginWithTrello = () => {
    if (isLoggedInTrello) {
      localStorage.removeItem("trelloToken");
      window.location.reload();
    } else {
      openTrelloAuthorization();
    }
  };

  return (
    <section className="profile-container">
      <div className="profile-connections">
        <div className="connection">
          <button disabled>
            <img src={githubLogoBlack} alt="GitHub Logo" className="logo-img" />
          </button>
          <p className="services">Github</p>
          <label className="switch">
            <input
              checked={isLoggedInGH}
              onChange={() => loginWithGithub()}
              type="checkbox"
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="connection">
          <button disabled>
            <img src={trelloLogo} alt="Trello Logo" className="logo-img" />
          </button>
          <p className="services">Trello</p>
          <label className="switch">
            <input
              checked={isLoggedInTrello}
              onChange={() => loginWithTrello()}
              type="checkbox"
            />
            <span className="slider round"></span>
          </label>
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
              onChange={(e) =>
                localStorage.setItem("trelloToken", e.target.value)
              }
            />
          </Modal.Body>
          <Modal.Footer>
            <button onClick={closeTrelloModal}>Cancelar</button>
            <button
              onClick={() =>
                handleTrelloTokenSubmit(localStorage.getItem("trelloToken"))
              }
            >
              Conectar
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </section>
  );
};

export default Profile;
