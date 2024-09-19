import { useState } from "react";
import { statusApi } from "../api/statusApi";
import { getCookie } from "./useCookie";

export const useInputControls = () => {
  const [values, setValues] = useState([]);
  const accessToken = getCookie("accessToken");

  const getValuesByInputIdAndControlIdFromTheDB = async (
    input_id,
    control_id
  ) => {
    const resp = await statusApi.get(
      `http://localhost:3001/api/input_controls/${input_id}/controls/${control_id}/values`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const getInputControlsByControlIdFromTheDB = async (control_id) => {
    const resp = await statusApi.get(
      `http://localhost:3001/api/controls/${control_id}/input_controls`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const deleteInputControlsFromTheDB = async (id) => {
    const resp = await statusApi.delete(
      `http://localhost:3001/api/input_controls/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
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
    getInputControlsByControlIdFromTheDB,
    deleteInputControlsFromTheDB,
    updateValues,
  };
};
