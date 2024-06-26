import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCookie } from "../../hooks/useCookie";
import { useAdmin } from "../../hooks/useAdmin";
import "../../static/css/admin.css";
import { Modal } from "react-bootstrap";
import DeleteModal from "../../components/DeleteModal";
import deleteSvg from "../../static/images/delete.svg";
import { useOpenAI } from "../../hooks/useOpenAI";
import { Context } from "../../hooks/useAdmin";

export default function Admin() {
  const existsCookie = useCookie("accessToken");
  const { getAuthority, authority } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const { assistant, setAssistant, thread, setThread } = useContext(Context);
  const {
    instructions,
    assistants,
    limit,
    getLimit,
    updateLimit,
    updateConfiguration,
    getAssistantInstById,
    updateAssistantInst,
    getAssistants,
    deleteAssistant,
    deleteAllAssistants,
  } = useAdmin();
  const { createAssistant } = useOpenAI();
  const [newInstructions, setNewInstructions] = useState("");
  const [hideInstructions, setHideInstructions] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState("");
  const [newAssistantInstructions, setNewAssistantInstructions] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNewAssistantModal, setShowNewAssistantModal] = useState(false);
  const [id, setId] = useState("");
  const [editLimit, setEditLimit] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitError, setLimitError] = useState(false);

  useEffect(() => {
    setIsLoggedIn(existsCookie);
    if (!authority) {
      getAuthority();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existsCookie, authority]);

  useEffect(() => {
    if (isLoggedIn && authority === "ADMIN" && !hideInstructions) {
      getAssistants();
      getLimit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, authority, hideInstructions]);

  useEffect(() => {
    if (instructions.length > 0) {
      setNewInstructions(instructions);
    }
  }, [instructions]);

  useEffect(() => {
    if (existsCookie) {
      checkOpenAIAvailable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existsCookie]);

  useEffect(() => {
    if (limitError) {
      alert(
        "El nuevo límite debe ser mayor que 1 y mayor que el número de asistentes existentes"
      );
      setLimitError(false);
    }
  }, [limitError]);

  const updateModalClose = () => {
    setUpdateModal(false);
  };

  const handleUpdateConfig = async () => {
    await updateConfiguration("/api/thread", !thread);
    await updateConfiguration("/api/assistant", !assistant);
    setAssistant(!assistant);
    setThread(!thread);
    updateModalClose();
  };

  const showConfigModal = () => {
    setUpdateModal(true);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
  };

  const newAssistantModalClose = () => {
    setShowNewAssistantModal(false);
    setNewAssistantName("");
    setNewAssistantInstructions("");
    setLimitReached(false);
  };

  const handleCreateAssistant = async () => {
    const functionCheckbox = document.getElementById("function");
    const codeInterpreterCheckbox = document.getElementById("code_interpreter");
    const fileSearchCheckbox = document.getElementById("file_search");
    const assistantModelInput = document.getElementById("assistantModel");

    const tools = [];

    if (functionCheckbox && functionCheckbox.checked) {
      tools.push({ type: "function" });
    }
    if (codeInterpreterCheckbox && codeInterpreterCheckbox.checked) {
      tools.push({ type: "code_interpreter" });
    }
    if (fileSearchCheckbox && fileSearchCheckbox.checked) {
      tools.push({ type: "file_search" });
    }
    let model = "";
    if (assistantModelInput) {
      model = assistantModelInput.value;
    }
    if (
      newAssistantName &&
      newAssistantInstructions &&
      tools.length > 0 &&
      model
    ) {
      const status = await createAssistant(
        newAssistantName,
        newAssistantInstructions,
        tools,
        model
      );
      if (status === 429) {
        setLimitReached(true);
      } else {
        newAssistantModalClose();
        getAssistants();
      }
    } else {
      alert("Por favor, rellene todos los campos");
    }
  };

  const handleDelete = async () => {
    if (id === 0) {
      await deleteAllAssistants();
    } else {
      await deleteAssistant(id);
    }
    setShowDeleteModal(false);
    getAssistants();
  };

  const checkOpenAIAvailable = () => {
    if (thread && assistant) {
      setHideInstructions(false);
    } else {
      setHideInstructions(true);
    }
  };

  const handleUpdateLimit = async () => {
    setEditLimit(true);
    if (document.querySelector(".limitInput")) {
      const newLimit = document.querySelector(".limitInput").value;
      if (newLimit !== limit && newLimit !== "" && limit !== "") {
        const response = await updateLimit(newLimit);
        setLimitError(response);
      } else {
        alert("No se han realizado cambios");
      }
      setEditLimit(false);
    }
  };

  const updateInstructions = async (updateId, newInstructions) => {
    if (newInstructions !== instructions) {
      if (updateId !== "") {
        await updateAssistantInst(updateId, newInstructions);
        getAssistantInstById(updateId);
      }
    } else {
      alert("No se han realizado cambios");
    }
  };

  const handleDeleteClick = (id) => {
    setId(id);
    setShowDeleteModal(true);
  };

  const newAssistantModal = (
    <div className="modal-content">
      <Modal onHide={newAssistantModalClose} show={showNewAssistantModal}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo asistente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="assistantName">Nombre del Asistente:</label>
              <input
                type="text"
                id="assistantName"
                value={newAssistantName}
                onChange={(e) => setNewAssistantName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="assistantInstructions">Instrucciones:</label>
              <textarea
                id="assistantInstructions"
                value={newAssistantInstructions}
                onChange={(e) => setNewAssistantInstructions(e.target.value)}
              />
            </div>
            <div className="form-group assistantTools">
              <label htmlFor="assistantTools">Herramientas:</label>
              <div className="tools">
                <div className="tool">
                  <input type="checkbox" id="function" />
                  <label htmlFor="function">Función</label>
                </div>
                <div className="tool">
                  <input type="checkbox" id="code_interpreter" />
                  <label htmlFor="code_interpreter">Intérprete de código</label>
                </div>
                <div className="tool">
                  <input type="checkbox" id="file_search" />
                  <label htmlFor="file_search">Búsqueda de archivos</label>
                </div>
              </div>
            </div>
            <div className="form-group assistantModel">
              <label htmlFor="assistantModel">Modelo:</label>
              <select id="assistantModel" defaultValue={"gpt-3.5-turbo-0125"}>
                <option value="gpt-3.5">gpt-3.5</option>
                <option value="gpt-3.5-turbo-0125">gpt-3.5-turbo-0125</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="gpt-4">gpt-4</option>
              </select>
              {limitReached ? (
                <p className="limitError">
                  Se ha alcanzado el límite de asistentes
                </p>
              ) : null}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={newAssistantModalClose}>Cerrar</button>
          <button className="create" onClick={handleCreateAssistant}>
            Crear
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );

  return (
    <div className="adminContainer">
      {isLoggedIn && authority === "ADMIN" ? (
        <div className="cont">
          {/* <h1>Panel de Administración</h1> */}
          <div className="assistantCard">
            <div className="cardItem1">
              {instructions.length > 0 && !hideInstructions ? (
                <div className="instructionsContainer">
                  <h4 className="heading">Instrucciones del asistente</h4>
                  <div
                    className="editor"
                    style={hideInstructions ? { display: "none" } : {}}
                  >
                    <textarea
                      className="textArea"
                      value={newInstructions}
                      onChange={(e) => setNewInstructions(e.target.value)}
                    ></textarea>
                    <button
                      className="updateButton"
                      onClick={() => updateInstructions(id, newInstructions)}
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="heading">Instrucciones del asistente</h4>
                  <div className="editor"></div>
                </div>
              )}
            </div>
          </div>
          <div className="adminCard">
            <div className="endpoints">
              <div className="cardItem2">
                <ul className="endpointList">
                  <div className="endpoint">
                    <div className="endpointContent">
                      <p>Asistente de OpenAI</p>
                    </div>
                    <div className="endpointContent">
                      <label className="switch">
                        <input
                          checked={thread && assistant}
                          onChange={(e) => showConfigModal(e.target.checked)}
                          type="checkbox"
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="endpointContent">
                      <button
                        className="costButton"
                        onClick={() =>
                          window.open(
                            "https://platform.openai.com/usage",
                            "_blank"
                          )
                        }
                      >
                        Ver Costes
                      </button>
                    </div>
                  </div>
                </ul>
                <div />
              </div>
            </div>
            <div className="signUp">
              <div className="cardItem2">
                <div
                  className="assistantContainer"
                  style={hideInstructions ? { display: "none" } : {}}
                >
                  <div className="limitContainer">
                    {editLimit ? (
                      <input
                        className="limitInput"
                        type="number"
                        placeholder={limit}
                      />
                    ) : (
                      <p className="limitText">{limit}</p>
                    )}
                    <button
                      className={`limitButton ${editLimit ? "editable" : ""}`}
                      onClick={() => handleUpdateLimit()}
                    >
                      Actualizar límite
                    </button>
                  </div>
                  <div className="createContainer">
                    <button
                      className="createButton"
                      onClick={() => setShowNewAssistantModal(true)}
                    >
                      Nuevo asistente
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="management">
              <div className="cardItem3">
                <div className="managementContainer">
                  <h5 className="heading2">Gestión de asistentes</h5>
                  <button
                    onClick={() => handleDeleteClick(0)}
                    className="deleteAllButton"
                    style={hideInstructions ? { display: "none" } : {}}
                  >
                    Vaciar
                    <img src={deleteSvg} alt="delete" className="actionImg" />
                  </button>
                  <div
                    className="tableContainer"
                    style={hideInstructions ? { display: "none" } : {}}
                  >
                    <table className="assistantTable">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="tableBody">
                        {assistants.map((assistant) => (
                          <tr key={assistant.id}>
                            <td
                              className="assistantName"
                              onClick={() => {
                                getAssistantInstById(assistant.id);
                                setId(assistant.id);
                              }}
                            >
                              {assistant.assistantId}
                            </td>
                            <td>
                              {assistant.status === "INACTIVE"
                                ? "Libre"
                                : "Ocupado"}
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteClick(assistant.id)}
                                className="actionButton"
                              >
                                <img
                                  src={deleteSvg}
                                  alt="delete"
                                  className="actionImg"
                                />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2>No puedes acceder a esta parte del sistema</h2>
        </div>
      )}
      {showNewAssistantModal && (
        <div className="modal">{newAssistantModal}</div>
      )}
      {showDeleteModal && (
        <div className="modal">
          <DeleteModal
            show={showDeleteModal}
            handleClose={handleDeleteModalClose}
            handleDelete={handleDelete}
          />
        </div>
      )}
      <div
        className="modal-content"
        style={updateModal ? {} : { display: "none" }}
      >
        <Modal onHide={updateModalClose} show={updateModal}>
          <Modal.Header closeButton>
            <Modal.Title>Activar/Desactivar</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="form-group">
                <label htmlFor="question">¿Desea confirmar?</label>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <button className="decline" onClick={updateModalClose}>
              Cancelar
            </button>
            <button className="accept" onClick={() => handleUpdateConfig()}>
              Confirmar
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
