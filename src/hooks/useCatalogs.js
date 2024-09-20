import { useState, useCallback } from "react";
import { statusApi } from "../api/statusApi";

export const useCatalogs = () => {
  const [catalogs, setCatalogs] = useState(() => {
    const savedCatalogs = localStorage.getItem('catalogs');
    return savedCatalogs ? JSON.parse(savedCatalogs) : [];
  });
  const [catalogName, setCatalogName] = useState("");
  const [catalogStartDate, setCatalogStartDate] = useState("");
  const [catalogEndDate, setCatalogEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCatalogsFromTheDatabase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await statusApi.get("http://localhost:3001/api/catalogs");
      setCatalogs(resp.data);
      localStorage.setItem('catalogs', JSON.stringify(resp.data));
    } catch (error) {
      console.error("Error fetching catalogs:", error);
      setError("Failed to load catalogs. Please try again.");
    } finally {
      setLoading(false);
    } 
  }, []);

  const createCatalogInDB = async (catalogName, startDate, endDate) => {
    try {
      const resp = await statusApi.post("http://localhost:3001/api/catalogs", {
        name: catalogName,
        startDate: startDate,
        endDate: endDate,
      });
      setCatalogs(prevCatalogs => [...prevCatalogs, resp.data]);
      localStorage.setItem('catalogs', JSON.stringify([...catalogs, resp.data]));
      return resp.data;
    } catch (error) {
      console.error("Error creating catalog:", error);
      throw error;
    }
  };

  const updateCatalog = (index, id, value) => {
    setCatalogs(prevCatalogs => {
      const updatedCatalogs = [...prevCatalogs];
      updatedCatalogs[index].inputValues[id] = value;
      return updatedCatalogs;
    });
  };

  const updateCatalogInDB = async (id, catalogName, startDate, endDate) => {
    try {
      const resp = await statusApi.patch(`http://localhost:3001/api/catalogs/${id}`, {
        name: catalogName,
        startDate: startDate,
        endDate: endDate,
      });
      await getCatalogsFromTheDatabase();
      return resp.data;
    } catch (err) {
      console.error("Error updating catalog:", err);
      throw err;
    }
  };

  const getCatalogControlsInDB = async (catalogId) => {
    try {
      const resp = await statusApi.get(`http://localhost:3001/api/catalogs/${catalogId}/controls`);
      return resp.data;
    } catch (err) {
      console.error("Error fetching catalog controls:", err);
      throw err;
    }
  };

  const deleteCatalogByIdFromTheDatabase = async (catalogId) => {
    try {
      const resp = await statusApi.delete(`http://localhost:3001/api/catalogs/${catalogId}`);
      await getCatalogsFromTheDatabase();
      return resp.data;
    } catch (err) {
      console.error("Error deleting catalog:", err);
      throw err;
    }
  };

  const handleNameChange = (e) => {
    setCatalogName(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setCatalogStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setCatalogEndDate(e.target.value);
  };

  const removeCatalog = (index) => {
    setCatalogs(prevCatalogs => prevCatalogs.filter((_, i) => i !== index));
  };

  return {
    catalogs,
    loading,
    error,
    getCatalogsFromTheDatabase,
    createCatalogInDB,
    updateCatalogInDB,
    updateCatalog,
    catalogName,
    catalogStartDate,
    catalogEndDate,
    handleNameChange,
    handleStartDateChange,
    handleEndDateChange,
    removeCatalog,
    getCatalogControlsInDB,
    deleteCatalogByIdFromTheDatabase,
  };
};