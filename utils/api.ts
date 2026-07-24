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
    const hostname = window.location.hostname; // Extrae "empresademo.namexportal.com"
    
    // 🚨 FIX DE EMERGENCIA: Forzamos HTTP plano para evadir el bloqueo de certificados en la demo
    return `http://${hostname}/api`;
  }
  
  return 'http://127.0.0';
};

export const API_URL = getApiUrl();