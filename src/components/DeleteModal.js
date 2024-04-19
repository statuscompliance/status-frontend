import React from 'react';
import { Modal } from 'react-bootstrap';

const DeleteModal = ({ show, handleClose, handleDelete }) => {
    return (
        <div className="modal-content">
            <Modal onHide={handleClose} show={show}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='text-danger'>¿Estás seguro de que deseas eliminar este elemento? El cambio será irreversible.</p>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={handleClose}>Cancelar</button>
                    <button className='accept' onClick={handleDelete}>Confirmar</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DeleteModal;