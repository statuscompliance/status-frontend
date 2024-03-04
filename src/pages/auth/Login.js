import React, { useEffect, useState } from 'react';
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
            document.cookie = `accessToken=${response.data.accessToken}`;
            document.cookie = `refreshToken=${response.data.refreshToken}`; // Expiración¿?
            window.location.href = '';
        })
        .catch((error) => {
            // Maneja cualquier error
            console.error(error.message);
        });
    };
    
    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );

    
}
