import { useState } from "react";
import statusBackendClient from "../api/statusBackendClient";

export const useGrafana = () => {
  const [metrics, setMetrics] = useState([]);
  
  const getFolders = async () => {
    const response = await statusBackendClient.get(`/api/grafana/folder`);
    return response.data;
  }
  
  const getDashboardsByFolderUid = async (folderUid = '{uid}') => {
    const response = await statusBackendClient.get(`/api/grafana/folder/${folderUid}/dashboard`);
    return response.data;
  };

  const getGrafanaUrl = async (dashboardUid) => {
    const response = await statusBackendClient.get(`/api/grafana/dashboard/${dashboardUid}`);
    return response.data.meta.url;
  };

  const createDashboard = async (data) => {
    const response = await statusBackendClient.post(`/api/grafana/dashboard`, {
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
    });
    return response.data;
  };

  const deleteDashboardById = async (dashboardUid) => {
    try {
      const response = await statusBackendClient.delete(`/api/grafana/dashboard/${dashboardUid}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting dashboard with UID ${dashboardUid}:`, error);
      throw error;
    }
  };

  const getMetricById = async (dashboardUid, panelId) => {
    const response = await statusBackendClient.get(`/api/grafana/dashboard/${dashboardUid}/panel/${panelId}/query`);
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
    const metricRegex =
      /SELECT\s+(\w+)(?:\((\w+)\))?\s+FROM\s+statusdb\.(\w+)/i;
    const whereRegex =
      /WHERE\s*\(\s*(\w+)\s*(>|>=|<|<=|=|!=)\s*['"]?(\w+)['"]?\s*\)/i;

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
      metric.filterValue = whereMatch[3].replace(/['"]/g, "");
    }

    return metric;
  };

  const getDashboardMetrics = async (uid) => {
    const response = await statusBackendClient.get(`/api/grafana/dashboard/${uid}/panel/query`);
    return response.data;
  };

  const createMetric = async (uid, body) => {
    const response = await statusBackendClient.post(`/api/grafana/dashboard/${uid}/panel`, body);
    return response.data;
  };

  const updateMetric = async (dashboardUid, panelId, body) => {
    const response = await statusBackendClient.patch(`/api/grafana/dashboard/${dashboardUid}/panel/${panelId}`, body);
    return response.data;
  };

  const deleteMetric = async (dashboardUid, panelId) => {
    const response = await statusBackendClient.delete(`/api/grafana/dashboard/${dashboardUid}/panel/${panelId}`);
    return response.data;
  };

  return {
    metrics,
    setMetrics,
    getFolders,
    getDashboardsByFolderUid,
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