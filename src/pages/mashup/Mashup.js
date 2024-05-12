import React, { useState} from 'react';
import "../../static/css/mashup.css";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { useCookie } from '../../hooks/useCookie';
import { useNode } from '../../hooks/useNode';
import { Modal } from 'react-bootstrap';
import DeleteModal from '../../components/DeleteModal';
import deleteSvg from "../../static/images/delete.svg";
import edit from "../../static/images/edit.svg";
import ai from "../../static/images/ai.svg";
import info from "../../static/images/info.svg";
import { useOpenAI } from '../../hooks/useOpenAI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Mashup() {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mashupName, setMashupName] = useState('');
    const [mashupDescription, setMashupDescription] = useState('');
    const { isNodeRedDeployed, mashups, createInitialMashup, deleteMashup, getFlow, addFlowInfo} = useNode();
    const { createThread, getThreadById} = useOpenAI();
    const existsCookie = useCookie('accessToken');
    const [rowData, setRowData] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [currentMashupDetails, setCurrentMashupDetails] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const interval = 1000;

    const [globalFilter, setGlobalFilter] = useState('');

    const onGlobalFilterChange = (event) => {
        setGlobalFilter(event.target.value);
    };

    const handleCreateMashup = async () => {
        await createInitialMashup(mashupName, mashupDescription);
        handleModalClose();
        window.location.href = `/editor`;
    };

    const handleView = async (rowData) => {
        const flow = mashups.find(mashup => mashup.id === rowData.id);
        if(flow){
            setCurrentMashupDetails(flow.mashupDetails);
            setShowDetailsModal(true);
        }
    };

    const handleEdit = () => {
        window.location.href = `/editor`;
    };

    const handleAI = async (rowData) => {
        setDisabled(true);

        setTimeout(() => {
            setDisabled(false);
        }, 60000);
        const flow = await getFlow(rowData.id);
        if(flow){
            const  { newThreadId, msgError }  = await createThread(JSON.stringify(flow));
            if (msgError) {
                console.error("Something went wrong generating the mashup description")
              }else {
                await getThreadMessages(newThreadId, rowData.id, flow);
            }
        }
    }

    const handleDelete = () => {
        deleteMashup(rowData.id);
        setShowDeleteModal(false);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setShowDetailsModal(false);
        setMashupName('');
        setMashupDescription('');
    };

    const handleDeleteModalClose = () => {
        setShowDeleteModal(false);
    }

    async function getThreadMessages(id, mashupId, flow) {
        let retryInterval = interval;
        const maxRetryInterval = 30000;
        setTimeout(async function retry() {
          try {
            let response = await getThreadById(id);
            if (response.message === "Run not completed yet") {
              if (retryInterval < maxRetryInterval) {
                retryInterval *= 2;
                console.log(`Generando respuesta, espere ${retryInterval / 1000} segundos...`);//BORRAR
                setTimeout(retry, retryInterval);
              } else {
                console.log("Se alcanzó el tiempo máximo de espera. No se pudo completar el proceso."); //BORRAR
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
                if(aiResponse.role === "assistant" && aiResponse.content){
                    await addFlowInfo(mashupId, flow, aiResponse.content);
                }
              } else {
                console.error("La respuesta no tiene el formato esperado:", response);
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
                            <input type="text" id="mashupName" value={mashupName} onChange={(e) => setMashupName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mashupDescription">Descripción:</label>
                            <textarea id="mashupDescription" value={mashupDescription} onChange={(e) => setMashupDescription(e.target.value)} />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={handleModalClose}>Cancelar</button>
                    <button className="create" onClick={handleCreateMashup}>Continuar</button>
                </Modal.Footer>
            </Modal>
        </div>
    );

    const modalDetails = (
        <div className="modal-content">
            <Modal onHide={handleModalClose} show={showDetailsModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del mashup</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="form-group">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentMashupDetails}</ReactMarkdown>
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
                <InputText type="search" onInput={onGlobalFilterChange} placeholder="Buscar..." />
            </span>
            <button className="create-button" onClick={handleCreateButtonClick}>+</button>
        </div>
    );

    const actionTemplate = (rowData) => {
        return (
            <div className='actions'>
                <button onClick={() => handleAI(rowData)} className={`actionButton ${disabled? 'disabled' : ''}`} disabled={disabled}>
                    <img src={ai} alt="ai" className='actionImg'/>
                </button>
                <button onClick={() => handleView(rowData)} className="actionButton">
                    <img src={info} alt="info" className='actionImg'/>
                </button>
                <button onClick={() => handleEdit(rowData)} className="actionButton">
                    <img src={edit} alt="edit" className='actionImg'/>
                </button>
                <button onClick={() => {
                    setRowData(rowData);
                    setShowDeleteModal(true);
                }} className="actionButton">
                    <img src={deleteSvg} alt="delete" className='actionImg'/>
                </button>
            </div>
        );
    };

    
    return (
        <div className='body'>
            {existsCookie && isNodeRedDeployed? (
            <div className='mashups'>
                <div className="datatable-header">
                    {filterHeader}
                </div>
                <DataTable className="dataTable" value={mashups} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} globalFilter={globalFilter}>
                    <Column className="column" field="label" header="Nombre" style={{ width: '25%' }}></Column>
                    <Column className="column" field="mashupDescription" header="Descripción" style={{ width: '35%' }}></Column>
                    <Column body={actionTemplate} className="column" field="action" header="Acciones" style={{ width: '15%' }}></Column>
                </DataTable>
                {showModal && (
                <div className="modal">
                    {modalContent}
                </div>
                )}
                {showDetailsModal && (
                <div className="modal">
                    {modalDetails}
                </div>
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
            </div>
            ) : (
                <div className='alert'>
                    <div className="signin-alert">
                        <p>Para acceder a esta sección debes iniciar sesión y tener desplegado Node-Red</p>
                    </div>
                </div>
            )}
            
        </div>
    );
}
