import React, {useEffect, useState}from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCookie } from '../../hooks/useCookie';
import { useAdmin } from '../../hooks/useAdmin';
import "../../static/css/admin.css";
import { Modal } from 'react-bootstrap';
import DeleteModal from "../../components/DeleteModal";
import deleteSvg from "../../static/images/delete.svg";

export default function Admin() {
    const existsCookie = useCookie('accessToken');
    const { getAuthority, authority } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [updateModal, setUpdateModal] = useState(false);
    const [configStatus, setConfigStatus] = useState(false);
    const { config= [], instructions, assistants, getGPTConfiguration, updateConfiguration,getAssistantInstById, updateAssistantInst, getAssistants, deleteAssistant, deleteAllAssistants } = useAdmin();
    const [newInstructions, setNewInstructions] = useState('');
    const [hideInstructions, setHideInstructions] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [id, setId] = useState('');

    useEffect(() => {
        setIsLoggedIn(existsCookie);
        getAuthority();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existsCookie]);

    useEffect(() => {
        if (isLoggedIn && authority === 'ADMIN' && !hideInstructions) {
            getGPTConfiguration();
            getAssistants();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, authority, hideInstructions]);

    useEffect(() => {
        if (instructions.length > 0) {
            setNewInstructions(instructions);
        }
    }, [instructions]);

    useEffect(() => {
        if (config.length > 0) { 
            checkOpenAIAvailable();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config]);
    
    const updateModalClose = () => {
        setConfigStatus(!configStatus);
        setUpdateModal(false);
    };

    const handleUpdateConfig = async () => {
        await updateConfiguration("/api/thread", configStatus);
        await updateConfiguration("/api/assistant", configStatus);
        getGPTConfiguration();
        updateModalClose();
    }

    const showConfigModal = (state) => {
        setConfigStatus(state);
        setUpdateModal(true);
    }
  
    const handleDeleteModalClose = () => {
      setShowDeleteModal(false);
    }
  
    const handleDelete = async () => {
        if(id !== '0'){
            await deleteAllAssistants();
        } else {
            deleteAssistant(id);
        }
        setShowDeleteModal(false);
        getAssistants();
    };

    const checkOpenAIAvailable = () => {
        if(config.length !== undefined){
            const thread = config[0].available
            const assistant = config[1].available
            setHideInstructions(false)
            setConfigStatus(thread && assistant);
            if(!(thread && assistant)){
                setHideInstructions(true)
            }
        } else {
            setHideInstructions(true);
            return false;
        }
    }

    const updateInstructions = async (updateId,newInstructions) => {
        if(newInstructions !== instructions){
            if(updateId !== ''){
                await updateAssistantInst(updateId, newInstructions);
                getAssistantInstById(updateId);
            } 
        } else {
            alert('No se han realizado cambios');
        }
    }

    const handleDeleteClick = (id) => {
        setId(id);
        setShowDeleteModal(true);
    };

    return (
        <div className='adminContainer'>
            {isLoggedIn && (authority=== 'ADMIN') ? (
                <div className='cont'>
                    {/* <h1>Panel de Administración</h1> */}
                    <div className='assistantCard'>
                        <div className='cardItem1' style={hideInstructions ? { display: 'none' } : {}}>
                            {instructions.length > 0 && !hideInstructions? (
                                <div className='instructionsContainer'>
                                    <h4 className='heading'>Instrucciones del asistente</h4>
                                    <div className='editor'>
                                        <textarea
                                            className='textArea'
                                            value={newInstructions}
                                            onChange={(e) => setNewInstructions(e.target.value)}
                                        ></textarea>
                                        <button className='updateButton' onClick={() => updateInstructions(id,newInstructions)}>Actualizar</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4 className='heading'>Instrucciones del asistente</h4>
                                    <div className='editor'>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='adminCard'>
                        <div className='endpoints'>
                            <div className='cardItem2'>
                                    <ul className='endpointList'>
                                        <div className='endpoint'>
                                            <div className='endpointContent'>
                                                <p>Asistente de OpenAI</p>
                                            </div>
                                            <div className='endpointContent'>
                                                <label className="switch">
                                                    <input checked={configStatus} onChange={(e) => showConfigModal(e.target.checked)} type="checkbox"/>
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                            <div className='endpointContent'>
                                                <button className="costButton" onClick={() => window.open("https://platform.openai.com/usage", "_blank")}>Ver Costes</button>
                                            </div>
                                        </div>
                                    </ul>
                                <div/>
                            </div>
                        </div>
                        <div className='signUp'>
                            <div className='cardItem2'>
                            </div>
                        </div>
                        <div className='management'>
                            <div className='cardItem3' style={hideInstructions ? { display: 'none' } : {}}>
                                <div className='managementContainer'>
                                    <h5 className='heading2'>Gestión de asistentes</h5>
                                    <button onClick={() => handleDeleteClick(0)} className="deleteAllButton">
                                        Vaciar
                                        <img src={deleteSvg} alt="delete" className='actionImg'/>
                                    </button>
                                    <div className='tableContainer'>
                                        <table className='assistantTable'>
                                            <thead>
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Estado</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className='tableBody'>
                                                {assistants.map((assistant) => (
                                                    <tr key={assistant.id} >
                                                        <td className='assistantName' onClick={() => {
                                                            getAssistantInstById(assistant.id);
                                                            setId(assistant.id);
                                                            }}>{assistant.assistantId}</td>
                                                        <td>{assistant.status === "INACTIVE" ? "Libre" : "Ocupado"}</td>
                                                        <td>
                                                        <button onClick={() => handleDeleteClick(assistant.id)} className="actionButton">
                                                            <img src={deleteSvg} alt="delete" className='actionImg'/>
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

            {showDeleteModal && (
                                <div className="modal">
                                    <DeleteModal
                                        show={showDeleteModal}
                                        handleClose={handleDeleteModalClose}
                                        handleDelete={handleDelete}
                                    />
                                </div>
                            )}
            <div className='modal-content' style={updateModal? {} : { display: 'none' } }>
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
                        <button className="decline"onClick={updateModalClose}>Cancelar</button>
                        <button className="accept" onClick={() => handleUpdateConfig()}>Confirmar</button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}
