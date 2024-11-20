import axios from 'axios';

const nodeRedClient = axios.create({
  baseURL: process.env.REACT_APP_NODE_RED_URL || 'http://localhost:1880',
  headers: {
    'Content-Type': 'application/json',
  },
});

nodeRedClient.interceptors.request.use((config) => {
  const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("nodeRedAccessToken="))
        .split("nodeRedAccessToken=")[1]
        .trim();
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default nodeRedClient;
