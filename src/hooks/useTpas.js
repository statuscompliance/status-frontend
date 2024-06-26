import { statusApi } from "../api/statusApi";

export const useTpas = () => {
    const getTpaByCatalogIdFromTheDatabase = async (catalogId) => {
        const resp = await statusApi.get(
            `http://localhost:3001/api/catalogs/${catalogId}/tpa`
          );
        return resp.data;
    };

    const createTpaInDB = async (content, catalogId) => {
        const resp = await statusApi.post("http://localhost:3001/api/catalogs/tpa", {
          content: content,
          catalog_id: catalogId,
        });
        return resp.data;
    };

    const deleteTpaByIdFromTheDatabase = async (catalogId) => {
        await statusApi.delete(`http://localhost:3001/api/catalogs/${catalogId}/tpa`);
    };

    return {
        getTpaByCatalogIdFromTheDatabase,
        createTpaInDB,
        deleteTpaByIdFromTheDatabase,
    };
};
