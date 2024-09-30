import { useState, useEffect } from "react";
import { statusApi } from "../api/statusApi";
import { getCookie } from "./useCookie";

export const useCatalogs = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [catalogName, setCatalogName] = useState("");
  const [catalogStartDate, setCatalogStartDate] = useState("");
  const [catalogEndDate, setCatalogEndDate] = useState("");
  const accessToken = getCookie("accessToken");

  useEffect(() => {
    getCatalogsFromTheDatabase();
  }, []);

  const getCatalogsFromTheDatabase = async () => {
    const resp = await statusApi.get("http://localhost:3001/api/catalogs", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setCatalogs(resp.data);
  };

  const getCatalogByIdFromTheDB = async (id) => {
    const resp = await statusApi.get(`http://localhost:3001/api/catalogs/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return resp.data;
  };

  const createCatalogInDB = async (catalogName, startDate, endDate) => {
    const resp = await statusApi.post(
      "http://localhost:3001/api/catalogs",
      {
        name: catalogName,
        startDate: startDate,
        endDate: endDate,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const updateCatalog = (index, id, value) => {
    const updatedCatalogs = [...catalogs];
    updatedCatalogs[index].inputValues[id] = value;
    setCatalogs(updatedCatalogs);
  };

  const updateCatalogInDB = async (id, catalogName, startDate, endDate) => {
    const resp = await statusApi.patch(
      `http://localhost:3001/api/catalogs/${id}`,
      {
        name: catalogName,
        startDate: startDate,
        endDate: endDate,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const getCatalogControlsInDB = async (catalogId) => {
    const resp = await statusApi.get(
      `http://localhost:3001/api/catalogs/${catalogId}/controls`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  };

  const deleteCatalogByIdFromTheDatabase = async (catalogId) => {
    const resp = await statusApi.delete(
      `http://localhost:3001/api/catalogs/${catalogId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
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