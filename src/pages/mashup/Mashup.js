import React, { useContext, useState } from "react";
import "../../static/css/mashup.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { useCookie } from "../../hooks/useCookie";
import { useNode } from "../../hooks/useNode";
import { Modal } from "react-bootstrap";
import DeleteModal from "../../components/DeleteModal";
import deleteSvg from "../../static/images/delete.svg";
import edit from "../../static/images/edit.svg";
import ai from "../../static/images/ai.svg";
import info from "../../static/images/info.svg";
import { useOpenAI } from "../../hooks/useOpenAI";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Context } from "../../hooks/useAdmin";

export default function Mashup() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mashupName, setMashupName] = useState("");
  const [mashupDescription, setMashupDescription] = useState("");
  const {
    isNodeRedDeployed,
    mashups,
    createInitialMashup,
    deleteMashup,
    getFlow,
    addFlowInfo,
  } = useNode();
  const { createThread, getThreadById } = useOpenAI();
  const { assistant, thread } = useContext(Context);
  const existsCookie = useCookie("accessToken");
  const [rowData, setRowData] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [currentMashupDetails, setCurrentMashupDetails] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentMashupName, setCurrentMashupName] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const interval = 1000;

  const [globalFilter, setGlobalFilter] = useState("");

  const onGlobalFilterChange = (event) => {
    setGlobalFilter(event.target.value);
  };

  const handleCreateMashup = async () => {
    await createInitialMashup(mashupName, mashupDescription);
    handleModalClose();
    window.location.href = `/editor`;
  };

  const handleView = async (rowData) => {
    const flow = mashups.find((mashup) => mashup.id === rowData.id);
    if (flow) {
      setCurrentMashupName(flow.label);
      setCurrentMashupDetails(flow.mashupDetails);
      setShowDetailsModal(true);
    }
  };

  const handleEdit = () => {
    window.location.href = `/editor`;
  };

  const handleAI = async (rowData) => {
    setDisabled(true);
    setShowLoader(true);

    setTimeout(() => {
      setDisabled(false);
    }, 60000);
    const flow = await getFlow(rowData.id);
    if (flow) {
      const { newThreadId, msgError } = await createThread(
        JSON.stringify(flow)
      );
      if (msgError) {
        console.error("Something went wrong generating the mashup description");
      } else {
        await getThreadMessages(newThreadId, rowData.id, flow);
        setShowLoader(false);
      }
    }
  };

  const handleDelete = () => {
    deleteMashup(rowData.id);
    setShowDeleteModal(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowDetailsModal(false);
    setMashupName("");
    setMashupDescription("");
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
  };

  async function getThreadMessages(id, mashupId, flow) {
    let retryInterval = interval;
    const maxRetryInterval = 30000;
    setTimeout(async function retry() {
      try {
        let response = await getThreadById(id);
        if (response.message === "Run not completed yet") {
          if (retryInterval < maxRetryInterval) {
            retryInterval *= 2;
            setTimeout(retry, retryInterval);
          }
        } else {
          if (response && response.data && Array.isArray(response.data)) {
            let result = response.data.map((message) => {
              return {
                role: message.role,
                content: message.content[0].text.value,
              };
            });
            const aiResponse = result[0];
            if (aiResponse.role === "assistant" && aiResponse.content) {
              await addFlowInfo(mashupId, flow, aiResponse.content);
            }
          } else {
            console.error(
              "La respuesta no tiene el formato esperado:",
              response
            );
          }
        }
      } catch (error) {
        console.error("Error al obtener la descripción", error);
      }
    }, retryInterval);
  }

  const modalContent = (
    <div className="modal-content">
      <Modal onHide={handleModalClose} show={showModal}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Mashup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="mashupName">Nombre del mashup:</label>
              <input
                id="mashupName"
                onChange={(e) => setMashupName(e.target.value)}
                type="text"
                value={mashupName}
              />
            </div>
            <div className="form-group">
              <label htmlFor="mashupDescription">Descripción:</label>
              <textarea
                id="mashupDescription"
                onChange={(e) => setMashupDescription(e.target.value)}
                value={mashupDescription}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={handleModalClose}>Cancelar</button>
          <button className="create" onClick={handleCreateMashup}>
            Continuar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );

  const modalDetails = (
    <div className="modal-content">
      <Modal onHide={handleModalClose} show={showDetailsModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentMashupName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentMashupDetails}
              </ReactMarkdown>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={handleModalClose}>Cerrar</button>
        </Modal.Footer>
      </Modal>
    </div>
  );

  const handleCreateButtonClick = () => {
    setShowModal(true);
  };

  const filterHeader = (
    <div className="filter-header">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          onInput={onGlobalFilterChange}
          placeholder="Search..."
          type="search"
        />
      </span>
      <button className="create-button" onClick={handleCreateButtonClick}>
        +
      </button>
    </div>
  );

  const actionTemplate = (rowData) => {
    return (
      <div className="actions">
        <button
          className={`actionButton ${disabled ? "disabled" : ""}`}
          disabled={disabled}
          onClick={() => handleAI(rowData)}
          style={assistant && thread ? {} : { display: "none" }}
        >
          <img alt="ai" className="actionImg" src={ai} />
        </button>
        <button className="actionButton" onClick={() => handleView(rowData)}>
          <img alt="info" className="actionImg" src={info} />
        </button>
        <button className="actionButton" onClick={() => handleEdit(rowData)}>
          <img alt="edit" className="actionImg" src={edit} />
        </button>
        <button
          onClick={() => {
            setRowData(rowData);
            setShowDeleteModal(true);
          }}
          className="actionButton"
        >
          <img alt="delete" className="actionImg" src={deleteSvg} />
        </button>
      </div>
    );
  };

  return (
    <div className="body">
      {showLoader && <div className="descLoader"></div>}
      {existsCookie && isNodeRedDeployed ? (
        <div className={`mashups ${showLoader ? "blur" : ""}`}>
          <div className="datatable-header">{filterHeader}</div>
          <DataTable
            className="dataTable"
            globalFilter={globalFilter}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25, 50]}
            value={mashups}
          >
            <Column
              className="column"
              field="label"
              header="Name"
              style={{ width: "25%" }}
            ></Column>
            <Column
              className="column"
              field="mashupDescription"
              header="Description"
              style={{ width: "35%" }}
            ></Column>
            <Column
              body={actionTemplate}
              className="column"
              field="action"
              header="Actions"
              style={{ width: "15%" }}
            ></Column>
          </DataTable>
          {showModal && <div className="modal">{modalContent}</div>}
          {showDetailsModal && <div className="modal">{modalDetails}</div>}
          {showDeleteModal && (
            <div className="modal">
              <DeleteModal
                handleClose={handleDeleteModalClose}
                handleDelete={handleDelete}
                show={showDeleteModal}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="alert">
          <div className="signin-alert">
            <p>
              Para acceder a esta sección debes iniciar sesión y tener
              desplegado Node-Red
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
