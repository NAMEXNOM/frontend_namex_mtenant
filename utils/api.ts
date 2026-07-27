// utils/api.ts
/*
declare const process: any;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const fetchCustom = async (endpoint: string, options: RequestInit = {}) => {
    return fetch(`${API_URL}${endpoint}`, options);
};
*/

// utils/api.ts

const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname; // Extrae "localhost" o "empresademo.namexportal.com"
    
    // 🟢 NUEVO: Si estás en tu computadora local, apunta al NestJS del puerto 5000 sin el /api
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }

    // 🚨 CONFIGURACIÓN PARA AWS PRODUCCIÓN: Forzamos HTTP plano para evadir el bloqueo de certificados en la demo
    return `http://${hostname}/api`;
  }
  
  return 'http://localhost:5000'; // Respaldo para renderizado del lado del servidor (SSR)
};

export const API_URL = getApiUrl();