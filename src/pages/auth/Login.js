import React, { useState } from 'react';
import axios from 'axios';


export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    
        axios.post('http://localhost:3001/api/user/signIn', {
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
            window.location.href = '/';
        })
        .catch((error) => {
            console.error(error.message);
        });
    };
    
    return (
        <div>
            <h1>Iniciar sesión</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Usuario:</label>
                    <input
                        id="username"
                        onChange={handleUsernameChange}
                        type="text"
                        value={username}
                    />
                </div>
                <div> 
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        id="password"
                        onChange={handlePasswordChange}
                        type="password"
                        value={password}
                    />
                </div>
                <button type="submit">Enviar</button>
            </form>
        </div>
    );

    
}
