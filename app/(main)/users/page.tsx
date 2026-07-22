'use client';
import { API_URL } from '../../../utils/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function UsersPage() {
    // 1. Declarar los estados (Esto corrige el error de "no encuentra...")
    const [usuarios, setUsuarios] = useState([]); 
    const { user } = useAuth(); // Esto saca el token del login

    useEffect(() => {
        if (!user?.token) return; // Si no hay token, no hacemos nada

        // 2. Llamar al backend usando el token
        //fetch('http://localhost:5000/users', {
        fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // ESTA ES LA CLAVE: Enviamos el token real
                'Authorization': `Bearer ${user.token}` 
            }
        })
            .then(res => res.json())
            .then(data => setUsuarios(data))
            .catch(err => console.error("Error:", err));
        }, [user]); // Se dispara cuando el usuario (y su token) están listos

    return (
        <div className="card">
            <h2 className="text-center mb-4">Lista de Usuarios</h2>
            {/* 3. Mostramos los datos en una tabla de PrimeReact */}
            <DataTable value={usuarios} responsiveLayout="stack" breakpoint="960px">
                <Column field="userRfc" header="RFC"></Column>
                <Column field="userName" header="Nombre"></Column>
                {/* Agrega aquí los campos que tenga tu base de datos */}
            </DataTable>
        </div>
    );
}
