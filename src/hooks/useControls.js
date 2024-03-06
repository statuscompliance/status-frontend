import { useState } from "react";
import { statusApi } from "../api/statusApi";

export const useControls = () => {
  const [controls, setControls] = useState([]);
  const [lastItemRemoved, setLastItemRemoved] = useState(0);

  const addEmptyControl = () => {
    setControls([
      ...controls,
      {
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        period: "",
        mashup_id: "",
        catalog_id: "",
        inputs: [],
        inputValues: {},
      },
    ]);
  };

  const createControlInDB = async (
    name,
    description,
    startDate,
    endDate,
    period,
    mashupId,
    catalogId
  ) => {
    const resp = await statusApi.post("http://localhost:3001/api/control", {
      name: name,
      description: description,
      startDate: startDate,
      endDate: endDate,
      period: period,
      mashup_id: mashupId,
      catalog_id: catalogId,
    });
    return resp.data;
  };

  const updateControl = (index, field, value) => {
    const updatedControls = [...controls];
    updatedControls[index][field] = value;
    setControls(updatedControls);
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
      "http://localhost:3001/api/input_control",
      {
        control_id: control_id,
        input_id: input_id,
        value: value,
      }
    );
    return resp.data;
  };

  const updateControlInputs = (controlIndex, inputId, inputValue) => {
    const updatedControls = [...controls];
    updatedControls[controlIndex].inputValues[inputId] = inputValue;
    setControls(updatedControls);
  };

  return {
    controls,
    addEmptyControl,
    createControlInDB,
    updateControl,
    removeControl,
    lastItemRemoved,
    createControlInputInDB,
    updateControlInputs,
  };
};
