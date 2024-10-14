import { useState } from "react";
import { statusApi } from "../api/statusApi";
import { getCookie } from "./useCookie";

export const useControls = () => {
  const [controls, setControls] = useState([]);
  const [inputs, setInputs] = useState([]);
  const accessToken = getCookie("accessToken");
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
    const resp = await statusApi.get(
      `http://localhost:3001/api/controls/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const getInputControlsByControlIdFromDB = async (id) => {
    const resp = await statusApi.get(
      `http://localhost:3001/api/controls/${id}/input_controls`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
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
    const resp = await statusApi.post(
      "http://localhost:3001/api/controls",
      {
        name: name,
        description: description,
        period: period,
        startDate: startDate || null,
        endDate: endDate || null,
        mashup_id: mashupId,
        catalog_id: catalogId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
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
    const resp = await statusApi.patch(
      `http://localhost:3001/api/controls/${id}`,
      {
        name: name,
        description: description,
        period: period,
        startDate: startDate || null,
        endDate: endDate || null,
        mashup_id: mashup_id,
        catalog_id: catalog_id,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const removeControl = (index) => {
    const isLastItem = index === controls.length - 1;
    setControls(controls.filter((_, i) => i !== index));

    if (isLastItem && controls.length > 0) {
      setLastItemRemoved((prev) => prev + 1);
    }
  };

  const createControlInputInDB = async (control_id, input_id, value) => {
    const resp = await statusApi.post(
      "http://localhost:3001/api/input_controls",
      {
        control_id: control_id,
        input_id: input_id,
        value: value,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const updateControlInputInDb = async (id, value) => {
    const resp = await statusApi.patch(
      `http://localhost:3001/api/input_controls/${id}`,
      {
        value: value,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const deleteControlByIdInDb = async (id) => {
    const resp = await statusApi.delete(
      `http://localhost:3001/api/controls/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const deleteInputControlsByControlIdInDb = async (id) => {
    const resp = await statusApi.delete(
      `http://localhost:3001/api/controls/${id}/input_controls`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const updateControlInputs = (controlIndex, inputId, inputValue) => {
    const updatedControls = [...controls];
    updatedControls[controlIndex].inputValues[inputId] = inputValue;
    setControls(updatedControls);
  };

  const getControlPanels = async (controlId) => {
    try {
      const response = await statusApi.get(`http://localhost:3001/api/controls/${controlId}/panels`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching control panels:", error);
      return [];
    }
  };

  const createControlPanel = async (controlId, panelId) => {
    try {
      const resp = await statusApi.post(`http://localhost:3001/api/controls/${controlId}/panel/${panelId}`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return resp.data;
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
