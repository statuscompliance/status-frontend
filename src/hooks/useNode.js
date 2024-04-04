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
        const nodeRed =  await statusApi.get('http://localhost:1880').then(response => response).catch(error => null);
        const status = nodeRed?.status;
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
        const nodeRed =  await statusApi.get('http://localhost:1880').then(response => response).catch(error => null);
        const status = nodeRed?.status;
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
        const nodeRed = await statusApi.get('http://localhost:1880').then(response => response).catch(error => null);
        const status = nodeRed?.status;
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

    const checkIfExist = async (accessToken,jsonString) => {
        try {
            const response = await statusApi.get('http://localhost:1880/flows',{
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data.includes(jsonString);
        } catch (error) {
            console.error(error);
        }
    }




    const temporalMashup = async (content) => {
        const nodeRed = await statusApi.get('http://localhost:1880').then(response => response).catch(error => null);
        const status = nodeRed?.status;
        if(document.cookie.split('; ').find(row => row.startsWith(`nodeRedAccessToken=`)) && status === 200) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('nodeRedAccessToken=')).split('nodeRedAccessToken=')[1].trim();
            try {
                const jsonString = content.replace(/^```json+|```$/g, '');
                const parsedNodes = JSON.parse(jsonString);
                const id = parsedNodes[0].id;
                const label = parsedNodes[0].label;
                const info = parsedNodes[0].info;
                parsedNodes.shift();
                const existsMashup = await checkIfExist(accessToken,jsonString);
                if(existsMashup){
                    return '';
                }else {
                    try{
                        const response = await statusApi.post('http://localhost:1880/flow',{
                            id: id,
                            label: label,
                            nodes: parsedNodes,
                            configs: [],
                            info: info
                        }, {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        });
                        getMashups();
                        const mashupId = response.data.id;
                        return mashupId?mashupId:'';
                    } catch (error) {
                        console.log(error);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    return { isNodeRedDeployed,mashups, checkNodeRedDeployment, createInitialMashup, deleteMashup, temporalMashup};
};
