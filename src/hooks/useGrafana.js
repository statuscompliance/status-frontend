import { useState } from "react";
import { statusApi } from "../api/statusApi";
import { getCookie } from "./useCookie";

export const useGrafana = () => {
  const [metrics, setMetrics] = useState([]);
  const accessToken = getCookie("accessToken");
  const baseUrl = "http://localhost:3001/api/grafana";

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const getGrafanaUrl = async (dashboardUid) => {
    const resp = await statusApi.get(
      `${baseUrl}/dashboard/${dashboardUid}`,
      { headers }
    );
    return resp.data.meta.url;
  }

  const createDashboard = async (data) => {
    const resp = await statusApi.post(
      `${baseUrl}/dashboard`,
      {
        dashboard: {
          annotations: {
            list: [],
          },
          editable: true,
          fiscalYearStartMonth: 0,
          graphTooltip: 0,
          panels: [],
          schemaVersion: 16,
          tags: [],
          templating: {
            list: [],
          },
          time: {
            from: "now-6h",
            to: "now",
          },
          timezone: "browser",
          title: `Dashboard ${data.id}`,
          version: 0,
        },
        overwrite: true,
      },
      { headers }
    );
    return resp.data;
  };

  const deleteDashboardById = async (dashboardUid) => {
    try {
      const response = await statusApi.delete(
        `${baseUrl}/dashboard/${dashboardUid}`,
        { headers }
      );
      console.log(`Dashboard with UID ${dashboardUid} successfully deleted.`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting dashboard with UID ${dashboardUid}:`, error);
      throw error;
    }
  };

  const getMetricById = async (dashboardUid, panelId) => {
    const response = await statusApi.get(`${baseUrl}/dashboard/${dashboardUid}/panel/${panelId}/query`, { headers });
    if (response.data && response.data.rawSql) {
      const sqlQuery = response.data.rawSql;
      const parsedMetric = parseMetricFromSql(sqlQuery);
      return {
        id: panelId,
        title: response.data.title,
        displayName: response.data.displayName,
        type: response.data.type,
        ...parsedMetric,
      };
    }
    throw new Error("No panel or SQL query found");
  };

  const parseMetricFromSql = (sqlQuery) => {
    const metricRegex = /SELECT\s+(\w+)(?:\((\w+)\))?\s+FROM\s+statusdb\.(\w+)/i;
    const whereRegex = /WHERE\s*\(\s*(\w+)\s*(>|>=|<|<=|=|!=)\s*['"]?(\w+)['"]?\s*\)/i;
  
    let metric = {
      dataset: "computation",
      metricType: "",
      metricField: "",
      filterField: "",
      filterOperator: "",
      filterValue: "",
      whereLogic: "AND",
    };
  
    const metricMatch = sqlQuery.match(metricRegex);
    const whereMatch = sqlQuery.match(whereRegex);
  
    if (metricMatch) {
      metric.metricType = metricMatch[1].toUpperCase();
      metric.metricField = metricMatch[2];
    }
  
    if (whereMatch) {
      metric.filterField = whereMatch[1];
      metric.filterOperator = whereMatch[2];
      metric.filterValue = whereMatch[3].replace(/['"]/g, '');
    }
  
    return metric;
  };
  
  const getDashboardMetrics = async (uid) => {
    const resp = await statusApi.get(
      `${baseUrl}/dashboard/${uid}/panel/query`,
      { headers }
    );
    return resp.data;
  };

  const createMetric = async (uid, body) => {
    const response = await statusApi.post(
      `${baseUrl}/dashboard/${uid}/panel`,
      body,
      { headers }
    );
    return response.data;
  };

  const updateMetric = async (dashboardUid, panelId, body) => {
    const response = await statusApi.patch(
      `${baseUrl}/dashboard/${dashboardUid}/panel/${panelId}`,
      body,
      { headers }
    );
    return response.data;
  };

  const deleteMetric = async (dashboardUid, panelId) => {
    const response = await statusApi.delete(
      `${baseUrl}/dashboard/${dashboardUid}/panel/${panelId}`,
      { headers }
    );
    return response.data;
  };

  return {
    metrics,
    setMetrics,
    getGrafanaUrl,
    createDashboard,
    deleteDashboardById,
    getMetricById,
    getDashboardMetrics,
    createMetric,
    updateMetric,
    deleteMetric,
  };
};