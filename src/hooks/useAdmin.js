import { useState} from "react";
import { statusApi } from "../api/statusApi";
import { getCookie } from "./useCookie";

export const useAdmin = () => {
    const [config, setConfig] = useState({});
    const [instructions, setInstructions] = useState('');
    const accessToken =  getCookie('accessToken');
    const [assistants, setAssistants] = useState([]);
    


    const getConfigurationByEndpoint = async (endpoint) => {
        try{
            const response = await statusApi.post(`http://localhost:3001/api/config`, {
                endpoint: endpoint
            },{
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
            return response.data;
        } catch(error) {
            console.error('Error fetching configuration:', error);
        }
    }

    const getGPTConfiguration = async () => {
        const threads = await getConfigurationByEndpoint('/api/thread');
        const assistant = await getConfigurationByEndpoint('/api/assistant');
        setConfig([ threads, assistant ]);
    }

    const updateConfiguration = async (endpoint, available) => {
        try {
            const response = await statusApi.put(`http://localhost:3001/api/config`, {
                endpoint: endpoint,
                available: available
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating configuration:', error);
        }
    }

    const getAssistantInst = async () => {
        try {
            const response = await statusApi.get(`http://localhost:3001/api/assistant/2/instructions`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setInstructions(response.data.instructions);
        } catch (error) {
            console.error('Error fetching assistant:', error);
        }
    }

    const updateAssistantInst = async (instructions) => {
        console.log(instructions);
        try {
            const response = await statusApi.put(`http://localhost:3001/api/assistant/2/instructions`, {
                instructions: instructions
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log(response);
        } catch (error) {
            console.error('Error updating assistant:', error);
        }
    }

    const getAssistants = async () => {
        try {
            const response = await statusApi.get(`http://localhost:3001/api/assistant`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setAssistants(response.data);
        } catch (error) {
            console.error('Error fetching assistants:', error);
        }
    }

    return { config, instructions,assistants, getGPTConfiguration, updateConfiguration, getAssistantInst, updateAssistantInst, getAssistants };
};