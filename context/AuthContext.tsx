'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  userName: string; 
  token: string;
  role?: string;    
  userBalance: number;
  vacationsTaken: number;
  userId: string;
  firstTimeLoad?: boolean | string; // Control estricto de primer ingreso
  status?: string;                  // Control de estatus en base de datos
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userSession');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error al parsear el usuario de localStorage", error);
        localStorage.removeItem('userSession');
      }
    }
    setLoading(false);
  }, []);

  
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userSession', JSON.stringify(userData));
    
    // Calcular 1 hora para Safari
    const ahora = new Date();
    ahora.setTime(ahora.getTime() + (1 * 60 * 60 * 1000));
    const tiempoExpires = ahora.toUTCString();

    document.cookie = `token=${userData.token}; path=/; expires=${tiempoExpires}; SameSite=Lax`;
    document.cookie = `namex_firstTimeLoad=${userData.firstTimeLoad}; path=/; expires=${tiempoExpires}; SameSite=Lax`;
    document.cookie = `namex_status=${userData.status}; path=/; expires=${tiempoExpires}; SameSite=Lax`;
  };
  
  /*
  const login = (userData: User) => {
    // 🎯 FUSIÓN ABSOLUTA: Guardamos todo el objeto incluyendo variables de control
    setUser(userData);
    localStorage.setItem('userSession', JSON.stringify(userData));
    
    // Inyección de cookies base para el Middleware de Next.js
    document.cookie = `token=${userData.token}; path=/; max-age=1800; SameSite=Lax`;
    document.cookie = `namex_firstTimeLoad=${userData.firstTimeLoad}; path=/; max-age=1800; SameSite=Lax`;
    document.cookie = `namex_status=${userData.status}; path=/; max-age=1800; SameSite=Lax`;
  };
*/

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userSession');

    // Limpieza de cookies absolutas
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "namex_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure";
    document.cookie = "namex_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "namex_firstTimeLoad=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "namex_userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    
    console.log("🔒 Sesión destruida limpiamente en cliente y servidor.");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
