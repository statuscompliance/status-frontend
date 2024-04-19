import { useState} from "react";
import { statusApi } from "../api/statusApi";
import { useNode } from './useNode';

export const useAuth = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { isNodeRedDeployed, checkNodeRedDeployment } = useNode();
    const [authority, setAuthority] = useState('');

    function getCookie(){
        if(document.cookie.split('; ').find(row => row.startsWith(`accessToken=`))) {
            return document.cookie.split('; ').find(row => row.startsWith('accessToken=')).split('=')[1].trim();
        } else {
            return '';
        }
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        statusApi.post('http://localhost:3001/api/user/signIn', {
            username: username,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then((response) => {
            const now = new Date();
            const oneHourLater = new Date(now.getTime()+ 60 * 60 * 1000);
            const oneDayLater = new Date(now.getTime()+ 24 * 60 * 60 * 1000);
            const accessExpires = oneHourLater.toUTCString();
            const refreshExpires = oneDayLater.toUTCString();

            document.cookie = `accessToken=${response.data.accessToken}; expires=${accessExpires}`;
            document.cookie = `refreshToken=${response.data.refreshToken}; expires=${refreshExpires}`;
            checkNodeRedDeployment();
            if (isNodeRedDeployed) {
                statusApi.post('http://localhost:1880/auth/token', {
                    "client_id": "node-red-admin",
                    "grant_type": "password",
                    "scope": "*",
                    "username": username,
                    "password": password
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then((response) => {
                    const accessExpires = response.data.expires_in;
                    document.cookie = `nodeRedAccessToken=${response.data.access_token}; expires=${accessExpires}`;
                    window.location.href = window.location.origin;
                }).catch((error) => {
                    console.error(error.message);
                });
            } else {
                throw new Error('Node-RED is not deployed');
            }
        })
        .catch((error) => {
            if (error.response && error.response.status === 404) {
                document.getElementById('error-message').innerText = 'El usuario introducido no está registrado en el sistema';
            } else if (error && error.message === 'Node-RED is not deployed') {
                document.getElementById('error-message').innerText = 'Inicialmente, Node-RED no está desplegado. Por favor, despliegue Node-RED y vuelva a intentarlo';
            } else if (error.response && error.response.status === 401){
                document.getElementById('error-message').innerText = 'La contraseña introducida no es correcta';
            } else {
                document.getElementById('error-message').innerText = 'Error al iniciar sesión. Por favor, inténtelo de nuevo o contacte con el administrador del sistema';
            }
            
        });
    };

    const handleRefresh = async (event) => {
        event.preventDefault();
        if(document.cookie.split('; ').find(row => row.startsWith(`refreshToken=`))) {
            const refreshToken = document.cookie.split('; ').find(row => row.startsWith('refreshToken=')).split('=')[1];
            try {
                const response = await statusApi.get('http://localhost:3001/api/refresh', {
                headers: {
                    Authorization: `Bearer ${refreshToken}`
                }});
                const now = new Date();
                const oneHourLater = new Date(now.getTime()+ 60 * 60 * 1000);
                const accessExpires = oneHourLater.toUTCString();
                document.cookie = `accessToken=${response.data.accessToken}; expires=${accessExpires}`;
            } catch (error) {
                console.error('Error refreshing the token:', error);
            };
        }
    }

    const getAuthority = async () => {
        const accessToken = await getCookie();
        if(accessToken) {
            try {
                const response = await statusApi.get(`http://localhost:3001/api/user/auth/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                setAuthority(response.data.authority);
            } catch (error) {
                console.error('Error fetching user authority:', error);
            }
        } else {
            console.error('No access token found');
        }
    }

    

    return { username, password, handleUsernameChange, handlePasswordChange, handleSubmit, handleRefresh,getAuthority, authority };
};