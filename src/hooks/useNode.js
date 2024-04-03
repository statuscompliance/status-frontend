import { useState, useEffect } from "react";
import { statusApi } from "../api/statusApi";

export const useNode = () => {
    const [isNodeRedDeployed, setIsNodeRedDeployed] = useState(false);
    const [mashups, setMashups] = useState([]);

    useEffect(() => {
        checkNodeRedDeployment();
        getMashups();
    }, []);

    const checkNodeRedDeployment = async () => {
        try{
            const response = await statusApi.get('http://localhost:1880');
            if (response.status === 200) {
                setIsNodeRedDeployed(true);
            }
        } catch(error) {
                if (error) {
                    setIsNodeRedDeployed(false);
                }
        }
    };

    const getMashups = async () => {
        const nodeRed = await statusApi.get('http://localhost:1880');
        const status = nodeRed.status;
        if(document.cookie.split('; ').find(row => row.startsWith(`nodeRedAccessToken=`)) && status === 200) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('nodeRedAccessToken=')).split('nodeRedAccessToken=')[1].trim();
            try {
                const response = await statusApi.get('http://localhost:1880/flows', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const filteredMashups = response.data.filter(obj => obj.type === 'tab');
                setMashups(filteredMashups);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const createInitialMashup = async (name,description) => {
        const nodeRed = await statusApi.get('http://localhost:1880');
        const status = nodeRed.status;
        if(document.cookie.split('; ').find(row => row.startsWith(`nodeRedAccessToken=`)) && status === 200) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('nodeRedAccessToken=')).split('nodeRedAccessToken=')[1].trim();
            try {
                const response = await statusApi.post('http://localhost:1880/flow',{
                    label: name,
                    nodes: [ ],
                    configs: [ ],
                    info: description
                }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                return response.data;
            } catch (error) {
                console.log(error);
            }
        }
    };

    const deleteMashup = async (id) => {
        const nodeRed = await statusApi.get('http://localhost:1880');
        const status = nodeRed.status;
        if(document.cookie.split('; ').find(row => row.startsWith(`nodeRedAccessToken=`)) && status === 200) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('nodeRedAccessToken=')).split('nodeRedAccessToken=')[1].trim();
            try {
                await statusApi.delete(`http://localhost:1880/flow/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                getMashups();
            } catch (error) {
                console.log(error);
            }
        }
    };


    return { isNodeRedDeployed,mashups, checkNodeRedDeployment, createInitialMashup, deleteMashup};
};
