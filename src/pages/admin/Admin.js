import React, {useEffect, useState}from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCookie } from '../../hooks/useCookie';




export default function Admin() {
    const existsCookie = useCookie('accessToken');
    const { getAuthority, authority } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    useEffect(() => {
        setIsLoggedIn(existsCookie);
        getAuthority();

        if (!isLoggedIn || authority !== 'ADMIN') {
            setTimeout(() => {
                window.location.href = window.location.origin;
            }, 2000);
        }
    }, [existsCookie, getAuthority, isLoggedIn, authority]);

    return (
        <div className='adminContainer'>
            {isLoggedIn && (authority=== 'ADMIN') ? (
                <div>
                <h1>Panel de Administración</h1>
                </div>
            ) : (
                <div>
                    <h2>No puedes acceder a esta parte del sistema</h2>
                </div>
            )}
        </div>
    );
}
