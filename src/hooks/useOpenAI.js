import {  useEffect, useState } from 'react';
import statusBackendClient from "../api/statusBackendClient";

export const useOpenAI= () => {
    const [threads, setThreads] = useState([]);
    const [assistant, setAssistant] = useState();

    useEffect(() => {
        getThreadsFromTheDatabase();
        getAssistant();
    }, []);

    const getThreadsFromTheDatabase = async () => {
        try {
          const response = await statusBackendClient.get('/api/thread');
          setThreads(response.data);
        } catch (error) {
          console.log(`Error fetching threads:`, error);
        }
    };

    const getThreadById = async (threadId) => {
        try {
          const response = await statusBackendClient.get(`/api/thread/${threadId}`);
          return response.data;
        } catch (error) {
          console.log(`Error getting thread with id: ${threadId}`, error);
        }
    };

    const createAssistant = async (name, instructions, tools, model) => {
        try {
          const response = await statusBackendClient.post('/api/assistant/admin', {
            name,
            instructions,
            tools,
            model,
          });
          return response.status;
        } catch (error) {
          return error.response?.status;
        }
    };

    const getAssistant = async () => {
        try {
            const response = await statusBackendClient.get('/api/assistant/');
            let responseAssistant;
            // AQUÍ SE DEBE SELECCIONAR UN ASISTENTE LIBRE (POR AHORA SE COJE EL ÚLTIMO EXISTENTE)
            // LÓGICA AQUÍ
            if(response.data.length > 1) {
                responseAssistant = response.data[response.data.length - 1];
            } else {
                responseAssistant = response.data;
            }
            setAssistant(responseAssistant.assistantId);
        } catch (error) {
            console.error('Error fetching assistants:', error);
        }
    }

    const createThread = async (content) => {
        try {
          const response = await statusBackendClient.post('/api/thread', {
            assistantId: assistant,
            content,
          });
          if (response.status === 201) {
            const threadId = response.data.id;
            return { newThreadId: threadId, msgError: false };
          }
        } catch (error) {
          if (error.response?.status === 400) {
            return { newThreadId: '', msgError: true };
          } else {
            console.error('Error creating thread:', error);
          }
        }
    };      

    const sendNewMessage = async (threadId, content) => {
        try {
          const response = await statusBackendClient.post(`/api/thread/${threadId}`, {
            assistantId: assistant,
            content,
          });
          return response.status !== 201;
        } catch (error) {
          if (error.response?.status === 400) {
            return true;
          } else {
            console.log('Error adding the message to the thread:', error);
          }
        }
      };      

      const changeThreadName = async (threadId, name) => {
        try {
          const response = await statusBackendClient.put(`/api/thread/${threadId}`, { name });
          return response.status === 200;
        } catch (error) {
          console.log('Error changing the name of the thread:', error);
          return false;
        }
      };      

    return {
        threads,
        getThreadById,
        createThread,
        createAssistant,
        sendNewMessage,
        changeThreadName
    };
}