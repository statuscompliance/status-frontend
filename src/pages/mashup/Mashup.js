import React, { useState} from 'react';
import "../../static/css/mashup.css";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { useCookie } from '../../hooks/useCookie';
import { useNode } from '../../hooks/useNode';
import { Modal } from 'react-bootstrap';
import DeleteModal from '../../components/DeleteModal';

export default function Mashup() {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mashupName, setMashupName] = useState('');
    const [mashupDescription, setMashupDescription] = useState('');
    const { isNodeRedDeployed, mashups, createInitialMashup, deleteMashup} = useNode();
    const existsCookie = useCookie('accessToken');
    const [rowData, setRowData] = useState('');

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
        console.log(rowData);
    };

    const handleEdit = () => {
        window.location.href = `/editor`;
    };

    const handleDelete = () => {
        deleteMashup(rowData.id);
        setShowDeleteModal(false);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setMashupName('');
        setMashupDescription('');
    };

    const handleDeleteModalClose = () => {
        setShowDeleteModal(false);
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
                <button onClick={() => handleView(rowData)} className="see-button">Ver</button>
                <button onClick={() => handleEdit(rowData)} className="edit-button">Editar</button>
                <button onClick={() => {
                    setRowData(rowData);
                    setShowDeleteModal(true);
                }} className="delete-button">Eliminar</button>
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
                    <Column className="column" field="info" header="Descripción" style={{ width: '35%' }}></Column>
                    <Column body={actionTemplate} className="column" field="action" header="Acciones" style={{ width: '10%' }}></Column>
                </DataTable>
                {showModal && (
                <div className="modal">
                    {modalContent}
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
