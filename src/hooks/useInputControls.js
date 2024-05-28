import { useState } from "react";
import { statusApi } from "../api/statusApi";

export const useInputControls = () => {
  const [values, setValues] = useState([]);

  const getValuesByInputIdAndControlIdFromTheDB = async (
    input_id,
    control_id
  ) => {
    const resp = await statusApi.get(
      `http://localhost:3001/api/input-controls/${input_id}/controls/${control_id}/values`
    );
    return resp.data;
  };

  const updateValues = (values) => {
    setValues(values);
  };

  return {
    values,
    setValues,
    getValuesByInputIdAndControlIdFromTheDB,
    updateValues,
  };
};
