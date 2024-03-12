import React, { useEffect } from 'react';
import { useNode } from '../../hooks/useNode';
import '../../static/css/iframe.css';


export default function Editor() {
    const { isNodeRedDeployed, checkNodeRedDeployment } = useNode();
    
    useEffect(() => {
        checkNodeRedDeployment();
    },[isNodeRedDeployed, checkNodeRedDeployment]);


    return (
        <div className='container'>
            {isNodeRedDeployed ? (
                <iframe className="node-red" src="http://localhost:1880" title="Node-RED"></iframe>
            ) : (
                <div className='node-red-off'>
                    <p className='pt-serif-bold'>Despliega Node-RED de forma local para abrir el editor.</p>
                    <button className='btn btn-success pt-serif-regular' onClick={() => window.location.reload()}>Listo</button>
                </div>
            )}
        </div>
    );
}
