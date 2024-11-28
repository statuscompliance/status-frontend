import axios from 'axios';
import { getCookie } from "../hooks/useCookie";

const statusBackendClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

statusBackendClient.interceptors.request.use((config) => {
  const accessToken = getCookie("accessToken");
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default statusBackendClient;