// types/auth.ts
export interface LoginResponse {
  access_token: string;
  user: {
    email: string;
    userName: string;
    role?: string;
    userBalance: number;
    vacationsTaken: number;

  };
}

// types/vacation.ts
export interface Vacation {
  id?: string;
  period: string;      // Ej: "2024"
  recordType: string;  // Ej: "Ordinarias"
  fechaInicio: string; // O Date, dependiendo de cómo llegue del backend
  fechaFinal: string;
  vacationDays: string;
}