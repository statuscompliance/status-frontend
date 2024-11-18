import { useState } from "react";
import statusBackendClient from "../api/statusBackendClient";

export const useInputControls = () => {
  const [values, setValues] = useState([]);

  const getValuesByInputIdAndControlIdFromTheDB = async (input_id, control_id) => {
    const response = await statusBackendClient.get(`/api/input_controls/${input_id}/controls/${control_id}/values`);
    return response.data;
  };

  const getInputControlsByControlIdFromTheDB = async (control_id) => {
    const response = await statusBackendClient.get(`/api/controls/${control_id}/input_controls`);
    return response.data;
  };

  const deleteInputControlsFromTheDB = async (id) => {
    const response = await statusBackendClient.delete(`/api/input_controls/${id}`);
    return response.data;
  };

  const updateValues = (values) => {
    setValues(values);
  };

  return {
    values,
    setValues,
    getValuesByInputIdAndControlIdFromTheDB,
    getInputControlsByControlIdFromTheDB,
    deleteInputControlsFromTheDB,
    updateValues,
  };
};
