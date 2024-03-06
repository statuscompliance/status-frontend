import { useState, useEffect } from "react";
import { statusApi } from "../api/statusApi";

export const useMashups = () => {
  const [mashups, setMashups] = useState([]);

  useEffect(() => {
    getMashupsFromTheDB();
  }, []);

  const getMashupsFromTheDB = async () => {
    const resp = await statusApi.get("http://localhost:3001/api/mashup");
    setMashups(resp.data);
  };

  const getInputsForMashupFromTheDB = async (mashupId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/${mashupId}/inputs`
      );
      if (!response.ok) {
        throw new Error("No se pudieron obtener las entradas del mashup");
      }
      const inputs = await response.json();
      return inputs;
    } catch (error) {
      console.error("Error al obtener las entradas del mashup:", error);
      return [];
    }
  };

  return {
    mashups,
    getInputsForMashupFromTheDB,
  };
};
