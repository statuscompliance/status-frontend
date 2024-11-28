import React, { useState, useEffect } from "react";
import "../../static/css/catalog.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useNavigate } from "react-router-dom";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useControls } from "../../hooks/useControls";
import { useInputControls } from "../../hooks/useInputControls";
import { useGrafana } from "../../hooks/useGrafana";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../common/dateUtils"
import FilterHeader from "../common/FilterHeader";
import ActionsColumn from "../common/ActionsColumn";

export default function Catalog() {
  const [globalFilter, setGlobalFilter] = useState("");
  const { catalogs, getCatalogControlsInDB, deleteCatalogByIdFromTheDatabase } = useCatalogs();
  const { deleteControlByIdInDb } = useControls();
  const { getInputControlsByControlIdFromTheDB, deleteInputControlsFromTheDB } = useInputControls();
  const { deleteDashboardById } = useGrafana();
  const { checkAdminAuthority } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuthority();
  }, [checkAdminAuthority]);

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
      }
    }
  };

  const dateTemplate = (rowData, columnField) => {
    if (!Object.prototype.hasOwnProperty.call(rowData, columnField)) {
      console.error(`Invalid columnField: ${columnField}`);
      return <span>Invalid data</span>;
    }
    return <span>{formatDate(rowData[columnField])}</span>;
  };

  return (
    <div className="body">
      <div className="datatable-header">
        <FilterHeader
          onGlobalFilterChange={onGlobalFilterChange}
          handleCreate={handleCreate}
        />
      </div>
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
            body={(rowData) => dateTemplate(rowData, "startDate")}
            style={{ width: "25%" }}>
          </Column>
          <Column
            className="column"
            field="endDate"
            header="End Date"
            body={(rowData) => dateTemplate(rowData, "endDate")}
            style={{ width: "25%" }}>
          </Column>
          <Column
            className="column"
            body={(rowData) => (
              <ActionsColumn
                rowData={rowData}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            header="Actions"
            style={{ width: "20%" }}>
          </Column>
        </DataTable>
      </div>
    </div>
  );
}