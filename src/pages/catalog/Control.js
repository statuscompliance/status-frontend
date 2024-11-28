import React, { useEffect, useState, useCallback } from "react";
import "../../static/css/control.css";
import { useParams } from "react-router-dom";
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

export default function Control() {
  const { catalogId } = useParams();
  const [controls, setControls] = useState([]);
  const [catalogDetails, setCatalogDetails] = useState(null);
  const [grafanaUrl, setGrafanaUrl] = useState(null);
  const { getCatalogControlsInDB, getCatalogByIdFromTheDB } = useCatalogs();
  const { deleteControlByIdInDb } = useControls();
  const { getInputControlsByControlIdFromTheDB, deleteInputControlsFromTheDB } = useInputControls();
  const { getGrafanaUrl } = useGrafana();
  const [globalFilter, setGlobalFilter] = useState("");
  const { checkAdminAuthority } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuthority();
  }, [checkAdminAuthority]);

  const fetchData = useCallback(async () => {
    try {
      const catalog = await getCatalogByIdFromTheDB(catalogId);
      setCatalogDetails(catalog);

      const controlsData = await getCatalogControlsInDB(catalogId);
      setControls(controlsData);

      if (catalog.dashboard_id) {
        const url = await getGrafanaUrl(catalog.dashboard_id);
        setGrafanaUrl(url);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [catalogId, getCatalogByIdFromTheDB, getCatalogControlsInDB, getGrafanaUrl]);

  useEffect(() => {
    fetchData();
  }, [catalogId]);

  const onGlobalFilterChange = (e) => {
    setGlobalFilter(e.target.value);
  };

  const handleView = (rowData) => {
    navigate(`/catalog/${catalogId}/controls/${rowData.id}/metrics`);
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

  const openGrafanaUrl = () => {
    if (grafanaUrl) {
      window.open(`http://localhost:3100${grafanaUrl}`);
    } else {
      console.error("Grafana URL not available");
    }
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
              <span className="info-value">{formatDate(catalogDetails.startDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">End Date:</span>
              <span className="info-value">{formatDate(catalogDetails.endDate)}</span>
            </div>
          </div>

          {grafanaUrl ? (
            <div className="grafana-url">
              <button onClick={openGrafanaUrl} className="grafana-button">
                Open Grafana Dashboard
              </button>
            </div>
          ) : (
            <div>Loading Grafana dashboard...</div>
          )}
        </div>
      )}
      <div className="datatable-header">
        <FilterHeader
          onGlobalFilterChange={onGlobalFilterChange}
          handleCreate={handleCreate}
        />
      </div>
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