import React, { useState, useEffect } from 'react';
import '../../static/css/iframe.css';

export default function Editor() {
    const [isNodeRedDeployed, setIsNodeRedDeployed] = useState(false);

    useEffect(() => {
        // Realiza la comprobación cuando el componente se monta
        checkNodeRedDeployment();
    }, []);

    const checkNodeRedDeployment = () => {
        // Realiza una petición a la URL de Node-RED
        fetch('http://localhost:1880')
            .then(response => {
                // Si la petición es exitosa, Node-RED está desplegado
                if (response.ok) {
                    setIsNodeRedDeployed(true);
                }
            })
            .catch(error => {
                // Si hay un error, Node-RED no está desplegado
                setIsNodeRedDeployed(false);
            });
    };

    return (
        <div className='container'>
            {isNodeRedDeployed ? (
                <iframe src="http://localhost:1880" title="Node-RED" className="node-red"></iframe>
            ) : (
                <div className='node-red-off'>
                    <p className='pt-serif-bold'>Despliega Node-RED de forma local para abrir el editor.</p>
                    <a href='/editor' className='btn btn-success pt-serif-regular'>Listo</a>
                </div>
            )}
        </div>
    );
}
