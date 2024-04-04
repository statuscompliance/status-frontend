import { useState} from "react";
import { statusApi } from "../api/statusApi";
import { useNode } from './useNode';

export const useAuth = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { isNodeRedDeployed, checkNodeRedDeployment } = useNode();

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
                window.location.href = window.location.origin;
            }
        })
        .catch((error) => {
            console.error(error.message);
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
            

    return { username, password, handleUsernameChange, handlePasswordChange, handleSubmit, handleRefresh };
};