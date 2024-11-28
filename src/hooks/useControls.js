import { useState } from "react";
import statusBackendClient from '../api/statusBackendClient';

export const useControls = () => {
  const [controls, setControls] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [lastItemRemoved, setLastItemRemoved] = useState(0);

  const addEmptyControl = () => {
    setControls([
      ...controls,
      {
        name: "",
        description: "",
        period: "",
        startDate: "",
        endDate: "",
        mashup_id: "",
        catalog_id: "",
        inputs: [],
        inputValues: {},
      },
    ]);
  };

  const getControlByIdFromDB = async (id) => {
    const response = await statusBackendClient.get(`/api/controls/${id}`);
    return response.data;
  };

  const getInputControlsByControlIdFromDB = async (id) => {
    const response = await statusBackendClient.get(`/api/controls/${id}/input_controls`);
    return response.data;
  };

  const createControlInDB = async (
    name,
    description,
    period,
    startDate,
    endDate,
    mashupId,
    catalogId
  ) => {
    const response = await statusBackendClient.post('/api/controls', {
      name,
      description,
      period,
      startDate: startDate || null,
      endDate: endDate || null,
      mashup_id: mashupId,
      catalog_id: catalogId,
    });
    return response.data;
  };

  const updateControl = (index, field, value) => {
    const updatedControls = [...controls];
    updatedControls[index][field] = value;
    setControls(updatedControls);
  };

  const updateControlInDB = async (
    id,
    name,
    description,
    period,
    startDate,
    endDate,
    mashup_id,
    catalog_id
  ) => {
    const response = await statusBackendClient.patch(`/api/controls/${id}`, {
      name,
      description,
      period,
      startDate: startDate || null,
      endDate: endDate || null,
      mashup_id,
      catalog_id,
    });
    return response.data;
  };

  const removeControl = (index) => {
    const isLastItem = index === controls.length - 1;
    setControls(controls.filter((_, i) => i !== index));

    if (isLastItem && controls.length > 0) {
      setLastItemRemoved((prev) => prev + 1);
    }
  };

  const createControlInputInDB = async (control_id, input_id, value) => {
    const response = await statusBackendClient.post(`/api/input_controls`, {
      control_id,
      input_id,
      value,
    });
    return response.data;
  };

  const updateControlInputInDb = async (id, value) => {
    const response = await statusBackendClient.patch(`/api/input_controls/${id}`, {
      value,
    });
    return response.data;
  };

  const deleteControlByIdInDb = async (id) => {
    const response = await statusBackendClient.delete(`/api/controls/${id}`);
    return response.data;
  };

  const deleteInputControlsByControlIdInDb = async (id) => {
    const response = await statusBackendClient.delete(`/api/controls/${id}/input_controls`);
    return response.data;
  };

  const updateControlInputs = (controlIndex, inputId, inputValue) => {
    const updatedControls = [...controls];
    updatedControls[controlIndex].inputValues[inputId] = inputValue;
    setControls(updatedControls);
  };

  const getControlPanels = async (controlId) => {
    try {
      const response = await statusBackendClient.get(`/api/controls/${controlId}/panels`);
      return response.data;
    } catch (error) {
      console.error("Error fetching control panels:", error);
      return [];
    }
  };

  const createControlPanel = async (controlId, panelId, dashboardUid) => {
    try {
      const response = await statusBackendClient.post(`/api/controls/${controlId}/panel/${panelId}`, {
        dashboardUid,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating ControlPanel:", error);
    }
  };

  return {
    controls,
    setControls,
    getControlByIdFromDB,
    getInputControlsByControlIdFromDB,
    addEmptyControl,
    createControlInDB,
    updateControlInputInDb,
    updateControl,
    updateControlInDB,
    removeControl,
    deleteControlByIdInDb,
    deleteInputControlsByControlIdInDb,
    lastItemRemoved,
    createControlInputInDB,
    updateControlInputs,
    getControlPanels,
    createControlPanel,
    inputs,
    setInputs,
  };
};
