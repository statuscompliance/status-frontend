import React, { useState } from "react";
import "../../static/css/catalog.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useControls } from "../../hooks/useControls";
import { useInputControls } from "../../hooks/useInputControls";
import { useGrafana } from "../../hooks/useGrafana";
import info from "../../static/images/info.svg";
import edit from "../../static/images/edit.svg";
import deleteSvg from "../../static/images/delete.svg";

export default function Catalog() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [catalogToDelete, setCatalogToDelete] = useState(null);
  const { catalogs, getCatalogControlsInDB, deleteCatalogByIdFromTheDatabase } = useCatalogs();
  const { deleteControlByIdInDb } = useControls();
  const { getInputControlsByControlIdFromTheDB, deleteInputControlsFromTheDB } = useInputControls();
  const { deleteDashboardById } = useGrafana();
  const navigate = useNavigate();

  const onGlobalFilterChange = (e) => {
    setGlobalFilter(e.target.value);
  };

  const handleView = (rowData) => {
    navigate(`/catalog/${rowData.id}/controls`);
  };

  const handleCreate = () => {
    navigate("/catalog/new");
  };
  
  const handleEdit = (rowData) => {
    navigate(`/catalog/${rowData.id}/edit`);
  };

  const handleDelete = async (rowData) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete catalog "${rowData.name}"?`);

    if (confirmDelete) {
      setCatalogToDelete(rowData.id);

      try {
        const controls = await getCatalogControlsInDB(rowData.id);
        if (!controls) throw new Error("Error when obtaining catalog controls");

        for (const control of controls) {
          const inputControls = await getInputControlsByControlIdFromTheDB(control.id);
          if (!inputControls) throw new Error(`Error getting input_controls from control ${control.id}`);

          for (const inputControl of inputControls) {
            await deleteInputControlsFromTheDB(inputControl.id);
          }

          await deleteControlByIdInDb(control.id);
        }

        if (rowData.dashboard_id) {
          await deleteDashboardById(rowData.dashboard_id);
        }

        await deleteCatalogByIdFromTheDatabase(rowData.id);

        console.log("Catalog successfully deleted.");
        window.location.reload();
      } catch (error) {
        console.error("Error when deleting the catalog and its dependencies:", error);
      } finally {
        setCatalogToDelete(null);
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
        <button className="actionButton" onClick={() => handleView(rowData)}>
          <img alt="info" className="actionImg" src={info} />
        </button>
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
      <div className="datatable-header">{header}</div>
      <div className="catalog">
        <DataTable
          className="dataTable"
          globalFilter={globalFilter}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          value={catalogs}
        >
          <Column 
            className="column"
            field="name"
            header="Name"
            style={{ width: "30%" }}>
          </Column>
          <Column
            className="column"
            field="startDate"
            header="Start Date"
            style={{ width: "25%" }}>
          </Column>
          <Column
            className="column"
            field="endDate"
            header="End Date"
            style={{ width: "25%" }}>
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