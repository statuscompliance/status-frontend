import React, { useState } from "react";
import { statusApi } from "../api/statusApi";
import { getCookie } from "./useCookie";

export const Context = React.createContext();

export const useAdmin = () => {
  const [instructions, setInstructions] = useState("");
  const accessToken = getCookie("accessToken");
  const [assistants, setAssistants] = useState([]);
  const [limit, setLimit] = useState(0);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     await getLimit();
  //   };
  //   if (accessToken) {
  //     fetchData();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [accessToken]);

  const getConfigurationByEndpoint = async (endpoint) => {
    try {
      const response = await statusApi.post(
        `http://localhost:3001/api/config`,
        {
          endpoint: endpoint,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
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
      const response = await statusApi.get(
        `http://localhost:3001/api/config/assistant/limit`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setLimit(response.data.limit);
    } catch (error) {
      console.error("Error fetching limit:", error);
    }
  };

  const updateConfiguration = async (endpoint, available) => {
    try {
      const response = await statusApi.put(
        `http://localhost:3001/api/config`,
        {
          endpoint: endpoint,
          available: available,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating configuration:", error);
    }
  };

  const updateLimit = async (limit) => {
    try {
      await statusApi.put(
        `http://localhost:3001/api/config/assistant/limit/${limit}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      getLimit();
    } catch (error) {
      if (error.response.status === 400) {
        return true;
      } else {
        console.error("Error updating limit:", error);
      }
    }
  };

  const getAssistantInstById = async (assistantId) => {
    try {
      const response = await statusApi.get(
        `http://localhost:3001/api/assistant/${assistantId}/instructions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setInstructions(response.data.instructions);
    } catch (error) {
      console.error("Error fetching assistant:", error);
    }
  };

  const updateAssistantInst = async (assistantId, instructions) => {
    try {
      await statusApi.put(
        `http://localhost:3001/api/assistant/${assistantId}/instructions`,
        {
          instructions: instructions,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating assistant:", error);
    }
  };

  const getAssistants = async () => {
    try {
      const response = await statusApi.get(
        `http://localhost:3001/api/assistant`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setAssistants(response.data);
    } catch (error) {
      console.error("Error fetching assistants:", error);
    }
  };

  const deleteAssistant = async (id) => {
    try {
      await statusApi.delete(`http://localhost:3001/api/assistant/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error("Error deleting assistant:", error);
    }
  };

  const deleteAllAssistants = async () => {
    try {
      await statusApi.delete(`http://localhost:3001/api/assistant`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
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
