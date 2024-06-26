import { useState, useEffect } from "react";
import { statusApi } from "../api/statusApi";

export const useMashups = () => {
  const [mashups, setMashups] = useState([]);

  useEffect(() => {
    getMashupsFromTheDB();
  }, []);

  const getMashupsFromTheDB = async () => {
    const resp = await statusApi.get("http://localhost:3001/api/mashups");
    setMashups(resp.data);
  };

  const getMashupByIdFromTheDB = async (mashup_id) => {
    const resp = await statusApi.get(
      `http://localhost:3001/api/mashups/${mashup_id}`
    );
    return resp.data;
  };

  const getInputsForMashupFromTheDB = async (mashup_id) => {
    try {
      const response = await statusApi.get(
        `http://localhost:3001/api/mashups/${mashup_id}/inputs`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener las entradas del mashup:", error);
      return [];
    }
  };

  return {
    mashups,
    getMashupByIdFromTheDB,
    getInputsForMashupFromTheDB,
  };
};
