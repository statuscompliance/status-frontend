import { useState, useEffect } from "react";
import { statusApi } from "../api/statusApi";

export const useCatalogs = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [catalogName, setCatalogName] = useState("");
  const [catalogStartDate, setCatalogStartDate] = useState("");
  const [catalogEndDate, setCatalogEndDate] = useState("");

  useEffect(() => {
    getCatalogsFromTheDatabase();
  }, []);

  const getCatalogsFromTheDatabase = async () => {
    const resp = await statusApi.get("http://localhost:3001/api/catalogs");
    setCatalogs(resp.data);
  };

  const createCatalogInDB = async (catalogName, startDate, endDate) => {
    const resp = await statusApi.post("http://localhost:3001/api/catalogs", {
      name: catalogName,
      startDate: startDate,
      endDate: endDate,
    });
    return resp.data;
  };

  const updateCatalog = (index, id, value) => {
    const updatedCatalogs = [...catalogs];
    updatedCatalogs[index].inputValues[id] = value;
    setCatalogs(updatedCatalogs);
  };

  const updateCatalogInDB = async (catalogName, startDate, endDate) => {
    const resp = await statusApi.post("http://localhost:3001/api/catalogs", {
      name: catalogName,
      startDate: startDate,
      endDate: endDate,
    });
    return resp.data;
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
  };
};
