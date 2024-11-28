import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import statusBackendClient from '../api/statusBackendClient';

export const useAuth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authority, setAuthority] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  function getCookie() {
    if (
      document.cookie.split("; ").find((row) => row.startsWith(`accessToken=`))
    ) {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        .split("=")[1]
        .trim();
    } else {
      return "";
    }
  }

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await statusBackendClient.post('/api/user/signIn', {
        username,
        password,
      });
  
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
      document.cookie = `accessToken=${response.data.accessToken}; expires=${oneHourLater.toUTCString()}`;
      document.cookie = `refreshToken=${response.data.refreshToken}; expires=${oneDayLater.toUTCString()}`;
      document.cookie = `nodeRedAccessToken=${response.data.nodeRedToken}; expires=${oneWeekLater.toUTCString()}`;
  
      window.location.href = window.location.origin;
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMessage('The user is not registered in the system');
      } else if (error.response?.status === 401) {
        setErrorMessage('The password is not correct');
      } else {
        setErrorMessage('Error logging in. Please try again or contact your system administrator.');
      }
    }
  };

  const handleRefresh = async (event) => {
    event.preventDefault();
    const refreshToken = document.cookie.split("; ").find((row) => row.startsWith("refreshToken="))?.split("=")[1];
    if (refreshToken) {
      try {
        const response = await statusBackendClient.get('/api/refresh');
        const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
        document.cookie = `accessToken=${response.data.accessToken}; expires=${oneHourLater.toUTCString()}`;
      } catch (error) {
        console.error("Error refreshing the token:", error);
      }
    }
  };

  const getAuthority = useCallback(async () => {
    const accessToken = getCookie();
    if (accessToken) {
      try {
        const response = await statusBackendClient.get('/api/user/auth/');
        setAuthority(response.data.authority);
        return response.data.authority;
      } catch (error) {
        console.error("Error fetching user authority:", error);
        setAuthority('');
        return '';
      }
    }
    setAuthority('');
    return '';
  }, []);

  const checkAdminAuthority = useCallback(async () => {
    const userAuthority = await getAuthority();
    if (userAuthority !== "ADMIN") {
      navigate("/login");
    }
  }, [getAuthority, navigate]);

  return {
    username,
    password,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
    handleRefresh,
    getAuthority,
    authority,
    errorMessage,
    setErrorMessage,
    checkAdminAuthority,
  };
};
