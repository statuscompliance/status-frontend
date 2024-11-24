import { useState } from "react";
import statusBackendClient from "../api/statusBackendClient";

export const useInputControls = () => {
  const [values, setValues] = useState([]);

  const getInputControlsByControlIdFromTheDB = async (control_id) => {
    const response = await statusBackendClient.get(`/api/controls/${control_id}/input_controls`);
    return response.data;
  };

  const deleteInputControlsFromTheDB = async (id) => {
    const response = await statusBackendClient.delete(`/api/input_controls/${id}`);
    return response.data;
  };

  return {
    values,
    setValues,
    getInputControlsByControlIdFromTheDB,
    deleteInputControlsFromTheDB,
  };
};
