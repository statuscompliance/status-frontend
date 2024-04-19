import React, {useEffect, useState}from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCookie } from '../../hooks/useCookie';
import { useAdmin } from '../../hooks/useAdmin';
import "../../static/css/admin.css";
import { Modal } from 'react-bootstrap';

export default function Admin() {
    const existsCookie = useCookie('accessToken');
    const { getAuthority, authority } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [updateModal, setUpdateModal] = useState(false);
    const [configStatus, setConfigStatus] = useState(false);
    const { config= [], instructions, assistants, getGPTConfiguration, updateConfiguration, getAssistantInst, updateAssistantInst, getAssistants } = useAdmin();
    const [newInstructions, setNewInstructions] = useState('');
    const [hideInstructions, setHideInstructions] = useState(false);

    useEffect(() => {
        setIsLoggedIn(existsCookie);
        getAuthority();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existsCookie]);

    useEffect(() => {
        if (isLoggedIn && authority === 'ADMIN' && !hideInstructions) {
            getGPTConfiguration();
            getAssistantInst();
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

    const updateInstructions = async (newInstructions) => {
        if(newInstructions !== instructions){
            await updateAssistantInst(newInstructions);
            getAssistantInst();
        } else {
            alert('No se han realizado cambios');
        }
    }

    const actionTemplate = (rowData) => {
        return (
            <div className='actions'>
                {/* { rowData.info === "" || rowData.info === undefined? (
                    <button onClick={() => handleAI(rowData)} className="actionButton">
                        <img src={ai} alt="ai" className='actionImg'/>
                    </button>
                    ) : (null)
                }
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
                </button> */}
            </div>
        );
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
                                        <button className='updateButton' onClick={() => updateInstructions(newInstructions)}>Actualizar</button>
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
                                            <li>
                                                <p>Asistente de OpenAI</p>
                                                <label className="switch">
                                                <input type="checkbox" checked={configStatus} onChange={(e) => showConfigModal(e.target.checked)}/>
                                                <span className="slider round"></span>
                                                </label>
                                            </li>
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
                                                    <tr key={assistant.id}>
                                                        <td>{assistant.assistantId}</td>
                                                        <td>{assistant.status === "INACTIVE" ? "Libre" : "Ocupado"}</td>
                                                        <td>{actionTemplate(assistant)}</td>
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
