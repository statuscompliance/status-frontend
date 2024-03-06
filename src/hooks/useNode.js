import { useState, useEffect } from "react";
import { statusApi } from "../api/statusApi";

export const useNode = () => {
    const [isNodeRedDeployed, setIsNodeRedDeployed] = useState(false);

    useEffect(() => {
        checkNodeRedDeployment();
    }, []);

    const checkNodeRedDeployment = async () => {
        try{
            const response = await statusApi.get('http://localhost:1880');
            if (response.ok) {
                setIsNodeRedDeployed(true);
            }
        } catch(error) {
                if (error) {
                    setIsNodeRedDeployed(false);
                }
        }
    };

    return { isNodeRedDeployed };
};
