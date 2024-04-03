import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { statusApi } from '../../api/statusApi';

export default function Logout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showModal, setShowModal] = useState(true);
    const [redirect, setRedirect] = useState(false);


    const existsCookie = (name) => {
        const cookieString = document.cookie;
        const cookies = cookieString.split(';');
        
        for (const cookie of cookies) {
            const cookieTrimmed = cookie.trim();
            if (cookieTrimmed.startsWith(name + '=')) {
                return true;
            }
        }
        return false;
    };

    const handleLogout = () => {
        statusApi.get('http://localhost:3001/api/user/signOut')
            .then(() => {
                document.cookie = `accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                document.cookie = `refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                document.cookie = `nodeRedAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                setRedirect(true);
            })
            .catch((error) => {
                console.error(error.message);
            });
    };

    const closeModal = () => {
        setShowModal(false);
        setRedirect(true);
    };

    // Verificar si el usuario está autenticado
    useEffect(() => {
        setIsLoggedIn(existsCookie('accessToken'));
    }, []);

    if (redirect) { 
        window.location.href = window.location.origin;
    }


    return (
        <div>
            {isLoggedIn ? (
                <div className="logout">
                    <Modal onHide={closeModal} show={showModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirmación</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            ¿Estás seguro que deseas cerrar sesión?
                        </Modal.Body>
                        <Modal.Footer>
                            <button onClick={closeModal}>Cancelar</button>
                            <button onClick={handleLogout}>Cerrar sesión</button>
                        </Modal.Footer>
                    </Modal>
                </div>
            ) : (
                <p>No has iniciado sesión</p>
            )}
        </div>
    );
}
