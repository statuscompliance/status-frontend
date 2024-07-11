import { useState} from "react";
import { statusApi } from "../api/statusApi";

export const useAuth = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
        .then(async (response) => {
            const now = new Date();
            const oneHourLater = new Date(now.getTime()+ 60 * 60 * 1000);
            const oneDayLater = new Date(now.getTime()+ 24 * 60 * 60 * 1000);
            const accessExpires = oneHourLater.toUTCString();
            const refreshExpires = oneDayLater.toUTCString();

            document.cookie = `accessToken=${response.data.accessToken}; expires=${accessExpires}`;
            document.cookie = `refreshToken=${response.data.refreshToken}; expires=${refreshExpires}`;
            // await checkNodeRedDeployment();
            // await signIn(username, password);
            window.location.href = window.location.origin;
        })
        .catch((error) => {
            if (error.response && error.response.status === 404) {
                document.getElementById('error-message').innerText = 'El usuario introducido no está registrado en el sistema';
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
        const accessToken = getCookie();
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
        }
    }

    

    return { username, password, handleUsernameChange, handlePasswordChange, handleSubmit, handleRefresh,getAuthority, authority };
};