import React from 'react';
import { useAuth } from '../../hooks/useAuth';


export default function Login() {
    const { username, password, handleUsernameChange, handlePasswordChange, handleSubmit } = useAuth();
    
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
