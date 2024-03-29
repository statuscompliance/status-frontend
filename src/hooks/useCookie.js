import { useEffect, useState } from 'react';

export function useCookie(cookieName) {
  const [cookieExists, setCookieExists] = useState(false);

  useEffect(() => {
    const exists = checkCookie(cookieName);
    setCookieExists(exists);
  }, [cookieName]);

  const checkCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');
    
    for (const cookie of cookies) {
      const cookieTrimmed = cookie.trim();
      if (cookieTrimmed.startsWith(name + '=')) {
        return true;
      }
    }
    return false;
  };

  return cookieExists;
}