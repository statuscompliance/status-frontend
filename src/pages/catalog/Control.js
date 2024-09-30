import React, { useEffect, useState } from "react";
import "../../static/css/control.css";
import { useParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useControls } from "../../hooks/useControls";
import { useInputControls } from "../../hooks/useInputControls";
import edit from "../../static/images/edit.svg";
import deleteSvg from "../../static/images/delete.svg";

export default function Control() {
  const { catalogId } = useParams();
  const [controls, setControls] = useState([]);
  const [catalogDetails, setCatalogDetails] = useState(null);
  const { getCatalogControlsInDB, getCatalogByIdFromTheDB } = useCatalogs();
  const { deleteControlByIdInDb } = useControls();
  const { getInputControlsByControlIdFromTheDB, deleteInputControlsFromTheDB } = useInputControls();
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const catalog = await getCatalogByIdFromTheDB(catalogId);
      setCatalogDetails(catalog);

      const controlsData = await getCatalogControlsInDB(catalogId);
      setControls(controlsData);
    };

    fetchData();
  }, [catalogId, getCatalogByIdFromTheDB, getCatalogControlsInDB]);

  const onGlobalFilterChange = (e) => {
    setGlobalFilter(e.target.value);
  };

  const handleCreate = () => {
    navigate(`/catalog/${catalogId}/new_control`);
  };

  const handleEdit = (rowData) => {
    navigate(`/catalog/${catalogId}/edit_control/${rowData.id}`);
  };

  const handleDelete = async (rowData) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete control "${rowData.name}"?`);

    if (confirmDelete) {
      try {
        const inputControls = await getInputControlsByControlIdFromTheDB(rowData.id);
        if (!inputControls) throw new Error(`Error getting input_controls from control ${rowData.id}`);

        for (const inputControl of inputControls) {
          await deleteInputControlsFromTheDB(inputControl.id);
        }

        await deleteControlByIdInDb(rowData.id);

        console.log("Control successfully deleted.");
        window.location.reload();
      } catch (error) {
        console.error("Error when deleting the control and its dependencies:", error);
      }
    }
  };

  const header = (
    <div className="filter-header">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={onGlobalFilterChange}
          placeholder="Search..."
        />
      </span>
      <button className="create-button" onClick={handleCreate}>
        +
      </button>
    </div>
  );

  const actionTemplate = (rowData) => {
    return (
      <div className="actions">
        <button className="actionButton" onClick={() => handleEdit(rowData)}>
          <img alt="edit" className="actionImg" src={edit} />
        </button>
        <button className="actionButton" onClick={() => handleDelete(rowData)}>
          <img alt="delete" className="actionImg" src={deleteSvg} />
        </button>
      </div>
    );
  };

  return (
    <div className="body">
      {catalogDetails && (
        <div className="catalog-details mt-5">
          <h2 className="catalog-title">Catalog Details</h2>
          <div className="catalog-info">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{catalogDetails.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Start Date:</span>
              <span className="info-value">{catalogDetails.startDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">End Date:</span>
              <span className="info-value">{catalogDetails.endDate}</span>
            </div>
          </div>
        </div>
      )}
      <div className="datatable-header">{header}</div>
      <div className="controls">
        <DataTable
          className="dataTable"
          globalFilter={globalFilter}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          value={controls}
        >
          <Column 
            field="name" 
            header="Control Name" 
            style={{ width: "40%" }}>
          </Column>
          <Column 
            field="description" 
            header="Description" 
            style={{ width: "40%" }}>
          </Column>
          <Column
            className="column"
            body={actionTemplate}
            header="Actions"
            style={{ width: "20%" }}>
          </Column>
        </DataTable>
      </div>
    </div>
  );
}