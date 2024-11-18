import React, { useState } from "react";
import statusBackendClient from '../api/statusBackendClient';

export const Context = React.createContext();

export const useAdmin = () => {
  const [instructions, setInstructions] = useState("");
  const [assistants, setAssistants] = useState([]);
  const [limit, setLimit] = useState(0);

  const getConfigurationByEndpoint = async (endpoint) => {
    try {
      const response = await statusBackendClient.post('/api/config', {
        endpoint,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching configuration:", error);
    }
  };

  const getGPTConfiguration = async () => {
    const thread = await getConfigurationByEndpoint("/api/thread");
    const assistant = await getConfigurationByEndpoint("/api/assistant");
    return { assistant: assistant.available, thread: thread.available };
  };

  const getLimit = async () => {
    try {
      const response = await statusBackendClient.get('/api/config/assistant/limit');
      setLimit(response.data.limit);
    } catch (error) {
      console.error("Error fetching limit:", error);
    }
  };

  const updateConfiguration = async (endpoint, available) => {
    try {
      const response = await statusBackendClient.put('/api/config', {
        endpoint,
        available,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating configuration:", error);
    }
  };

  const updateLimit = async (limit) => {
    try {
      await statusBackendClient.put(`/api/config/assistant/limit/${limit}`);
      getLimit();
    } catch (error) {
      if (error.response?.status === 400) {
        return true;
      } else {
        console.error("Error updating limit:", error);
      }
    }
  };

  const getAssistantInstById = async (assistantId) => {
    try {
      const response = await statusBackendClient.get(`/api/assistant/${assistantId}/instructions`);
      setInstructions(response.data.instructions);
    } catch (error) {
      console.error("Error fetching assistant:", error);
    }
  };

  const updateAssistantInst = async (assistantId, instructions) => {
    try {
      await statusBackendClient.put(`/api/assistant/${assistantId}/instructions`, { instructions });
    } catch (error) {
      console.error("Error updating assistant:", error);
    }
  };

  const getAssistants = async () => {
    try {
      const response = await statusBackendClient.get(`/api/assistant`);
      setAssistants(response.data);
    } catch (error) {
      console.error("Error fetching assistants:", error);
    }
  };

  const deleteAssistant = async (id) => {
    try {
      await statusBackendClient.delete(`/api/assistant/${id}`);
    } catch (error) {
      console.error("Error deleting assistant:", error);
    }
  };

  const deleteAllAssistants = async () => {
    try {
      await statusBackendClient.delete(`/api/assistant`);
    } catch (error) {
      console.error("Error deleting all assistants:", error);
    }
  };

  return {
    instructions,
    assistants,
    limit,
    getLimit,
    updateLimit,
    getGPTConfiguration,
    updateConfiguration,
    getAssistantInstById,
    updateAssistantInst,
    getAssistants,
    deleteAssistant,
    deleteAllAssistants,
  };
};
