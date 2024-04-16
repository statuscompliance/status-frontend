import {  useEffect, useState } from 'react';
import { statusApi } from "../api/statusApi";

export const useOpenAI= () => {
    const [threads, setThreads] = useState([]);
    const [assistant, setAssistant] = useState();

    useEffect(() => {
        getThreadsFromTheDatabase();
        getAssistant();
    }, []);

    const getThreadsFromTheDatabase = async () => {
        if(document.cookie.split('; ').find(row => row.startsWith(`accessToken=`))) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('accessToken=')).split('=')[1];
            try {
                const response = await statusApi.get('http://localhost:3001/api/thread', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                setThreads(response.data);
            } catch (error) {
                console.log(`Error with access token: ${accessToken}`);
            }
        }
    }

    const getThreadById = async (threadId) => {
        if(document.cookie.split('; ').find(row => row.startsWith(`accessToken=`))) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('accessToken=')).split('=')[1];
            try {
                const response = await statusApi.get(`http://localhost:3001/api/thread/${threadId}`,{
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                return response.data;
            } catch (error) {
                console.log(`Error getting thread with id: ${threadId}`);
            }
        }
    }

    const getAssistant = async () => {
        if(document.cookie.split('; ').find(row => row.startsWith(`accessToken=`))) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('accessToken=')).split('=')[1];
            try {
                const response = await statusApi.get('http://localhost:3001/api/assistant', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                let responseAssistant;
                if(response.data.length > 1) {
                    responseAssistant = response.data[0];
                } else {
                    responseAssistant = response.data;
                }
                // AQUÍ SE DEBE SELECCIONAR UN ASISTENTE LIBRE (POR AHORA SE COJE EL ÚNICO EXISTENTE)
                setAssistant(responseAssistant.assistantId);
            } catch (error) {
                console.error(error);
                console.log(`Error getting assistant`);
            }
        }
    }

    const createThread = async (content) => {
        if(document.cookie.split('; ').find(row => row.startsWith(`accessToken=`))) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('accessToken=')).split('=')[1];
            try {
                const response = await statusApi.post('http://localhost:3001/api/thread', {
                    assistantId: assistant,
                    content: content
                }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                if(response.status === 201) {
                    const threadId = response.data.id;
                    return {newThreadId: threadId, msgError: false};
                }
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    return {newThreadId: "", msgError: true};
                } else {
                    console.error(error);
                    console.log(`Error creating the thread`);
                }
            }
        }
    };

    const sendNewMessage = async (threadId, content) => {
        if(document.cookie.split('; ').find(row => row.startsWith(`accessToken=`))) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('accessToken=')).split('=')[1];
            try {
                const response = await statusApi.post(`http://localhost:3001/api/thread/${threadId}`, {
                    assistantId: assistant,
                    content: content
                }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                if(response.status === 201) {
                    return false;
                }
            } catch (error) {
                if (error.response.status === 400) {
                    return true;
                } else {
                    console.log(`Error adding the message to the thread`);
                }
            }
        }
    }

    const changeThreadName = async (threadId, name) => {
        if(document.cookie.split('; ').find(row => row.startsWith(`accessToken=`))) {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('accessToken=')).split('=')[1];
            try {
                const response = await statusApi.put(`http://localhost:3001/api/thread/${threadId}`, {
                    name: name
                }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                if(response.status === 200) {
                    return true;
                }
                return false;
            } catch (error) {
                console.log(`Error changing the name of the thread`);
            }
        }
    }

    return {
        threads,
        getThreadById,
        createThread,
        sendNewMessage,
        changeThreadName
    };
}