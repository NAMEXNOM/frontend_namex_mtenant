'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Agregamos las variables de control al tipo User
interface User {
  userName: string; 
  token: string;
  role?: string;    
  userBalance: number;
  vacationsTaken: number;
  userId: string;
  firstTimeLoad?: boolean | string; // 🚨 NUEVO
  status?: string;                  // 🚨 NUEVO
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
    
    document.cookie = `token=${userData.token}; path=/; max-age=86400; SameSite=Lax`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userSession');

    // Limpiamos absolutamente todas las cookies de control existentes
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
