import React, { useState, useEffect } from 'react';
import '../../static/css/iframe.css';

export default function Editor() {
    const [isNodeRedDeployed, setIsNodeRedDeployed] = useState(false);

    useEffect(() => {
        checkNodeRedDeployment();
    }, []);

    const checkNodeRedDeployment = () => {
        fetch('http://localhost:1880')
            .then(response => {
                if (response.ok) {
                    setIsNodeRedDeployed(true);
                }
            })
            .catch(error => {
                if (error) {
                    setIsNodeRedDeployed(false);
                }
            });
    };

    return (
        <div className='container'>
            {isNodeRedDeployed ? (
                <iframe className="node-red" src="http://localhost:1880" title="Node-RED"></iframe>
            ) : (
                <div className='node-red-off'>
                    <p className='pt-serif-bold'>Despliega Node-RED de forma local para abrir el editor.</p>
                    <a className='btn btn-success pt-serif-regular' href='/editor'>Listo</a>
                </div>
            )}
        </div>
    );
}
