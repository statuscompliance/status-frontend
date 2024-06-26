import { statusApi } from "../api/statusApi";

export const useBluejay = () => {

    const postAgreement = async (tpaData) => {
        const resp = await statusApi.post(
          `http://localhost:5400/api/v6/agreements`,
          tpaData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return resp.data;
      };
    
      const deleteAgreement = async () => {
        const resp = await statusApi.delete(
          `http://localhost:5400/api/v6/agreements/tpa-example-project`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return resp.data;
      };
    
      const createPoints = async (contractData) => {
        const resp = await statusApi.post(
          `http://localhost:5300/api/v4/contracts/tpa-example-project/createPointsFromPeriods`,
          contractData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return resp.data;
      };

  return {
    postAgreement,
    deleteAgreement,
    createPoints,
  };
};
