import { useState, useEffect } from "react";
import { statusApi } from "../api/statusApi";

export const useCatalogs = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [catalogName, setCatalogName] = useState("");

  useEffect(() => {
    getCatalogsFromTheDatabase();
  }, []);

  const getCatalogsFromTheDatabase = async () => {
    const resp = await statusApi.get("http://localhost:3001/api/catalog");
    setCatalogs(resp.data);
  };

  const createCatalogInDB = async (catalogName) => {
    const resp = await statusApi.post("http://localhost:3001/api/catalog", {
      name: catalogName,
    });
    return resp.data;
  };

  const updateCatalog = (index, id, value) => {
    const updatedCatalogs = [...catalogs];
    updatedCatalogs[index].inputValues[id] = value;
    setCatalogs(updatedCatalogs);
  };

  const handleNameChange = (e) => {
    setCatalogName(e.target.value);
  };

  const removeCatalog = (index) => {
    setCatalogs(catalogs.filter((_, i) => i !== index));
  };

  return {
    catalogs,
    createCatalogInDB,
    updateCatalog,
    catalogName,
    handleNameChange,
    removeCatalog,
  };
};
