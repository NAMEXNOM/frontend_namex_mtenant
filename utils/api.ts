import axios from 'axios';

const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Si estás desarrollando en tu PC local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }

    // En producción: Usamos la ruta relativa limpia de Nginx
    return '/api';
  }
  
  // 🟢 CORRECCIÓN PARA EL SERVIDOR (SSR): 
  // En lugar de localhost:5000 fijo, usamos ruta relativa para que no fuerce la demo en el backend
  return '/api'; 
};

export const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor molecular que inyecta la cabecera en cada petición
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    let tenantId = 'empresademo'; // Valor local por defecto

    if (hostname.includes('namexportal.com') && parts.length > 2) {
      tenantId = parts[0]; // Captura de forma estricta "empresa_a" o "empresademo"
    }

    // Inyectamos la cabecera real verificada
    config.headers['X-Tenant-ID'] = tenantId;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
