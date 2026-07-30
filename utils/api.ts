// utils/api.ts
/*
declare const process: any;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const fetchCustom = async (endpoint: string, options: RequestInit = {}) => {
    return fetch(`${API_URL}${endpoint}`, options);
};
*/

// utils/api.ts

import axios from 'axios';

const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }

    return `http://${hostname}/api`;
  }
  
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();

// 🟢 1. CREA LA INSTANCIA DE AXIOS USANDO TU API_URL DINÁMICA
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 🟢 2. INTERCEPTOR QUE EXTRAE EL SUBDOMINIO E INYECTA EL ENCABEZADO EN CADA CLIC
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname; // Ejemplo: "empresa_a.namexportal.com"
    const parts = hostname.split('.');
    
    let tenantId = 'empresademo'; // Tu valor por defecto seguro para desarrollo local

    // Si estás en producción con el dominio real de AWS
    if (hostname.includes('namexportal.com') && parts.length > 2) {
      tenantId = parts[0]; // Captura dinámicamente "empresa_a" o "empresademo"
    }

    // 🎯 EL ENLACE MAESTRO: Pegamos el identificador en la cabecera que espera el Backend
    config.headers['X-Tenant-ID'] = tenantId;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Nota: Asegúrate de que en tus componentes o pantallas importes "api" 
// (ej: api.post('/auth/login')) en lugar del "axios" global para que aplique el encabezado.
export default api;