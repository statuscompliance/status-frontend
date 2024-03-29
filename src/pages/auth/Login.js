import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import "../../static/css/login.css";


export default function Login() {
    const { username, password, handleUsernameChange, handlePasswordChange, handleSubmit } = useAuth();
    
    return (
        <div className='loginContainer'>
            <div className='loginSquare'>
                <p className='loginText'>Iniciar sesión</p>
                <form onSubmit={handleSubmit}>
                    <div className='usernameBox'>
                        <label className='usernameLabel' htmlFor="username">Usuario:</label>
                        <input
                            id="username"
                            onChange={handleUsernameChange}
                            placeholder='Introduce tu nombre de usuario'
                            type="text"
                            value={username}
                        />
                    </div>
                    <div className='pwdBox'> 
                        <label className='pwdLabel' htmlFor="password">Contraseña:</label>
                        <input
                            id="password"
                            onChange={handlePasswordChange}
                            placeholder='Introduce tu contraseña'
                            type="password"
                            value={password}
                        />
                    </div>
                    <button className='loginButton' type="submit">Enviar</button>
                </form>
            </div>
        </div>
    );
}
