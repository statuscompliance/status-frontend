import { useState, useEffect } from "react";
import { useGrafana } from "./useGrafana";
import statusBackendClient from '../api/statusBackendClient';

export const useCatalogs = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [catalogName, setCatalogName] = useState("");
  const [catalogStartDate, setCatalogStartDate] = useState("");
  const [catalogEndDate, setCatalogEndDate] = useState("");
  const { createDashboard } = useGrafana();

  useEffect(() => {
    getCatalogsFromTheDatabase();
  }, []);

  const getCatalogsFromTheDatabase = async () => {
    const resp = await statusBackendClient.get('/api/catalogs');
    setCatalogs(resp.data);
  };

  const getCatalogByIdFromTheDB = async (id) => {
    const resp = await statusBackendClient.get(`/api/catalogs/${id}`);
    return resp.data;
  };

  const createCatalogInDB = async (catalogName, startDate, endDate) => {
    try {
      const catalogResp = await statusBackendClient.post('/api/catalogs', {
        name: catalogName,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      const newCatalog = catalogResp.data;
  
      const dashboardResp = await createDashboard(newCatalog);
      const dashboardId = dashboardResp.uid;
  
      const updatedCatalogResp = await statusBackendClient.patch(`/api/catalogs/${newCatalog.id}`, {
        dashboard_id: dashboardId,
      });
  
      return updatedCatalogResp.data;
    } catch (error) {
      console.error('Error creating catalog:', error);
      throw error;
    }
  };  

  const updateCatalog = (index, id, value) => {
    const updatedCatalogs = [...catalogs];
    updatedCatalogs[index].inputValues[id] = value;
    setCatalogs(updatedCatalogs);
  };

  const updateCatalogInDB = async (id, catalogName, startDate, endDate) => {
    const response = await statusBackendClient.patch(`/api/catalogs/${id}`, {
      name: catalogName,
      startDate: startDate || null,
      endDate: endDate || null,
    });
    return response.data;
  };

  const getCatalogControlsInDB = async (catalogId) => {
    const response = await statusBackendClient.get(`/api/catalogs/${catalogId}/controls`);
    return response.data;
  };

  const deleteCatalogByIdFromTheDatabase = async (catalogId) => {
    const response = await statusBackendClient.delete(`/api/catalogs/${catalogId}`);
    return response.data;
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
    setCatalogs(catalogs.filter((_, i) => i !== index));
  };

  return {
    catalogs,
    getCatalogByIdFromTheDB,
    createCatalogInDB,
    updateCatalogInDB,
    updateCatalog,
    catalogName,
    setCatalogName,
    catalogStartDate,
    setCatalogStartDate,
    catalogEndDate,
    setCatalogEndDate,
    handleNameChange,
    handleStartDateChange,
    handleEndDateChange,
    removeCatalog,
    getCatalogControlsInDB,
    deleteCatalogByIdFromTheDatabase,
  };
};