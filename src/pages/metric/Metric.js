import React, { useEffect, useState, useCallback, useRef } from "react";
import "../../static/css/metric.css";
import { useParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useNavigate } from "react-router-dom";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useControls } from "../../hooks/useControls";
import { useGrafana } from "../../hooks/useGrafana";
import { useAuth } from "../../hooks/useAuth";
import FilterHeader from "../common/FilterHeader";
import ActionsColumn from "../common/ActionsColumn";

export default function Metric() {
  const { catalogId, controlId } = useParams();
  const [metrics, setMetrics] = useState([]);
  const [controlDetails, setControlDetails] = useState(null);
  const { getCatalogByIdFromTheDB } = useCatalogs();
  const { getControlByIdFromDB, getControlPanels } = useControls();
  const { getDashboardMetrics, deleteMetric } = useGrafana();
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const dashboardIdRef = useRef(null);
  const { checkAdminAuthority } = useAuth();

  useEffect(() => {
    checkAdminAuthority();
  }, [checkAdminAuthority]);

  const fetchData = useCallback(async () => {
    try {
      const control = await getControlByIdFromDB(controlId);
      setControlDetails(control);
      const metrics = await getControlPanels(controlId);
      setMetrics(metrics);
    } catch (error) {
      if (error.response?.status === 404) {
        setMetrics([]);
      } else {
        console.error("Error fetching data:", error);
      }
    }
  }, [
    controlId,
    catalogId,
    getControlByIdFromDB,
    getCatalogByIdFromTheDB,
    getDashboardMetrics,
  ]);

  useEffect(() => {
    fetchData();
  }, [controlId]);

  const onGlobalFilterChange = (e) => {
    setGlobalFilter(e.target.value);
  };

  const handleCreate = () => {
    navigate(`/catalog/${catalogId}/control/${controlId}/new_metric`);
  };

  const handleEdit = useCallback(
    (rowData) => {
      navigate(
        `/catalog/${catalogId}/control/${controlId}/edit_metric/${rowData.id}`
      );
    },
    [navigate, catalogId, controlId]
  );

  const handleDelete = useCallback(
    async (rowData) => {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete metric "${rowData.title}"?`
      );

      if (confirmDelete) {
        try {
          await deleteMetric(dashboardIdRef.current, rowData.id);
          console.log("Metric successfully deleted.");
          window.location.reload();
        } catch (error) {
          console.error(
            "Error when deleting the metric and its dependencies:",
            error
          );
        }
      }
    },
    [metrics]
  );

  return (
    <div className="body">
      {controlDetails && (
        <div className="control-details mt-5">
          <h2 className="control-title">Control Details</h2>
          <div className="control-info">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{controlDetails.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Description:</span>
              <span className="info-value">{controlDetails.description}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Period:</span>
              <span className="info-value">{controlDetails.period}</span>
            </div>
          </div>
        </div>
      )}
      <div className="datatable-header">
        <FilterHeader
          onGlobalFilterChange={onGlobalFilterChange}
          handleCreate={handleCreate}
        />
      </div>
      <div className="metrics">
        <DataTable
          className="dataTable"
          value={metrics}
          globalFilter={globalFilter}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="No metrics found"
        >
          <Column field="title" header="Name" style={{ width: "20%" }} />
          <Column field="sqlQuery" header="Query" style={{ width: "60%" }} />
          <Column
            body={(rowData) => (
              <ActionsColumn
                rowData={rowData}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showView={() => false}
              />
            )}
            header="Actions"
            style={{ width: "20%" }}
          />
        </DataTable>
      </div>
    </div>
  );
}
