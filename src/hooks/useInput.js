import { statusApi } from "../api/statusApi";

export const useInput = () => {
  const getInputByIdFromDB = async (input_id) => {
    const resp = await statusApi.get(
      `http://localhost:3001/api/inputs/${input_id}`
    );
    return resp.data;
  };

  return {
    getInputByIdFromDB,
  };
};
