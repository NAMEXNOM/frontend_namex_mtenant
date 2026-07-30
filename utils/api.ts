import axios from 'axios';

const getApiUrl = (): string => {
  // 🟢 1. CÓDIGO DEL LADO DEL CLIENTE (Navegador)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Si estás desarrollando localmente en tu PC de casa
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }

    // En producción en AWS: Usamos la ruta relativa limpia de Nginx
    return '/api';
  }
  
  // 🟢 2. CÓDIGO DEL LADO DEL SERVIDOR (SSR de Next.js en AWS)
  // Apunta directo al puerto interno de NestJS para que la página cargue sin colapsar
  return 'http://127.0.0.1:5000'; 
};

export const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor molecular que inyecta la cabecera en cada petición del navegador
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
