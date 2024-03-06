import { useState } from "react";

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
    return await fetch("http://localhost:3001/api/control", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: description,
        startDate: startDate,
        endDate: endDate,
        period: period,
        mashup_id: mashupId,
        catalog_id: catalogId,
      }),
    });
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
    return await fetch("http://localhost:3001/api/input_control", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        control_id: control_id,
        input_id: input_id,
        value: value,
      }),
    });
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
