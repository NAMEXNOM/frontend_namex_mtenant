/*
'use client';
import { API_URL } from '../../../utils/api';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Ajusta la ruta a tu AuthContext
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function MisVacacionesPage() {
    const { user } = useAuth(); // Obtenemos el usuario logueado del contexto global
    const [vacations, setVacations] = useState<any[]>([]); // Tipado básico para el estado
    const [loading, setLoading] = useState(true);

// app/(main)/vacations/page.tsx

useEffect(() => {
    // 1. Intentamos obtener los datos del contexto global 'user'
    let userId = user?.userId;
    let token = user?.token;

    // 2. Si no están en el contexto (por un F5/refresco), los extraemos de 'userSession' de forma segura
    if (!userId || !token) {
        const sessionRaw = localStorage.getItem('userSession');
        if (sessionRaw) {
            try {
                const sessionData = JSON.parse(sessionRaw);
                userId = sessionData.userId;
                token = sessionData.token;
            } catch (e) {
                console.error("Error al parsear userSession desde el localStorage:", e);
            }
        }
    }

    // 🚨 Bloqueo de seguridad: Si después de buscar en ambos lados aún falta algo, esperamos
    if (!userId || !token) {
        console.warn("Esperando el userId y el token de autenticación de userSession...");
        return;
    }

    const cargarVacaciones = async () => {
        try {
            setLoading(true);
            //const res = await fetch(`http://localhost:5000/vacations/user?userId=${userId}`, {
            const res = await fetch(`${API_URL}/vacations/user?userId=${userId}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Ahora sí llevará el token real de la sesión
                }
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Vacaciones del usuario cargadas con éxito:", data);
                setVacations(data);
            } else {
                console.error("Error al responder el servidor. Estatus:", res.status);
            }
        } catch (error) {
            console.error("Error de conexión con el backend:", error);
        } finally {
            setLoading(false);
        }
    };

    cargarVacaciones();
}, [user?.userId, user?.token]); // Se mantiene la escucha de cambios primitivos


    // 🎨 Formateador visual sin marcar errores en TypeScript (tipo: any)
    const tipoRegistroTemplate = (rowData: any) => {
        if (rowData.recordType === 1 || rowData.recordType === "1") {
            return <span className="text-green-600 font-semibold">Abonadas</span>;
        } else if (rowData.recordType === 2 || rowData.recordType === "2") {
            return <span className="text-orange-600 font-semibold">Tomadas</span>;
        }
        return <span>{rowData.recordType}</span>;
    };

    return (
        <div className="surface-card p-1 md:p-3 shadow-2 border-round-xl">
            <DataTable 
                value={vacations} 
                loading={loading}
                size="small" 
                className="text-xs"
                tableStyle={{ minWidth: '100%' }}
            >
                <Column field="period" header="Per." style={{ width: '15%' }} />
                
                <Column 
                    field="recordType" 
                    header="Tipo" 
                    style={{ width: '25%' }}
                    body={tipoRegistroTemplate} // 👈 Vinculación directa de tu plantilla corregida
                />

                <Column 
                    header="Inicio" 
                    style={{ width: '22%' }}
                    body={(rowData: any) => new Date(rowData.fechaInicio).toLocaleDateString('es-MX', {day:'2-digit', month:'2-digit', year:'2-digit'})}
                />
                
                <Column 
                    header="Fin" 
                    style={{ width: '22%' }}
                    body={(rowData: any) => new Date(rowData.fechaFinal).toLocaleDateString('es-MX', {day:'2-digit', month:'2-digit', year:'2-digit'})}
                />

                <Column 
                    field="vacationDays" 
                    header="Días" 
                    style={{ width: '16%' }}
                    bodyStyle={{ textAlign: 'center', fontWeight: 'bold' }}
                    headerStyle={{ textAlign: 'center' }}
                />
            </DataTable>
        </div>
    );
}
*/

'use client';
import { API_URL } from '../../../utils/api';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Ajusta la ruta a tu AuthContext
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function MisVacacionesPage() {
    const { user } = useAuth(); // Obtenemos el usuario logueado del contexto global
    const [vacations, setVacations] = useState<any[]>([]); // Tipado básico para el estado
    const [loading, setLoading] = useState(true);

// app/(main)/vacations/page.tsx

useEffect(() => {
    // 1. Intentamos obtener los datos del contexto global 'user'
    let userId = user?.userId;
    let token = user?.token;

    // 2. Si no están en el contexto (por un F5/refresco), los extraemos de 'userSession' de forma segura
    if (!userId || !token) {
        const sessionRaw = localStorage.getItem('userSession');
        if (sessionRaw) {
            try {
                const sessionData = JSON.parse(sessionRaw);
                userId = sessionData.userId;
                token = sessionData.token;
            } catch (e) {
                console.error("Error al parsear userSession desde el localStorage:", e);
            }
        }
    }

    // 🚨 Bloqueo de seguridad: Si después de buscar en ambos lados aún falta algo, esperamos
    if (!userId || !token) {
        console.warn("Esperando el userId y el token de autenticación de userSession...");
        return;
    }

        const cargarVacaciones = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/vacations/user?userId=${userId}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Vacaciones del usuario cargadas con éxito:", data);
                
                // 🟢 MODIFICADO: Ordenamiento cronológico por fechaFinal (de la más antigua a la más reciente)
                const datosOrdenados = data.sort((a: any, b: any) => {
                    return new Date(a.fechaFinal).getTime() - new Date(b.fechaFinal).getTime();
                });

                setVacations(datosOrdenados); 
            } else {
                console.error("Error al responder el servidor. Estatus:", res.status);
            }
        } catch (error) {
            console.error("Error de conexión con el backend:", error);
        } finally {
            setLoading(false);
        }
    };


    cargarVacaciones();
}, [user?.userId, user?.token]); // Se mantiene la escucha de cambios primitivos


    // 🎨 Formateador visual sin marcar errores en TypeScript (tipo: any)
    const tipoRegistroTemplate = (rowData: any) => {
        if (rowData.recordType === 1 || rowData.recordType === "1") {
            return <span className="text-green-600 font-semibold">Abonadas</span>;
        } else if (rowData.recordType === 2 || rowData.recordType === "2") {
            return <span className="text-orange-600 font-semibold">Tomadas</span>;
        }
        return <span>{rowData.recordType}</span>;
    };

    return (
        <div className="surface-card p-1 md:p-3 shadow-2 border-round-xl">
            <DataTable 
                value={vacations} 
                loading={loading}
                size="small" 
                className="text-xs"
                tableStyle={{ minWidth: '100%' }}
            >
                <Column field="period" header="Per." style={{ width: '15%' }} />
                
                <Column 
                    field="recordType" 
                    header="Tipo" 
                    style={{ width: '25%' }}
                    body={tipoRegistroTemplate} // 👈 Vinculación directa de tu plantilla corregida
                />

                <Column 
                    header="Inicio" 
                    style={{ width: '22%' }}
                    body={(rowData: any) => new Date(rowData.fechaInicio).toLocaleDateString('es-MX', {day:'2-digit', month:'2-digit', year:'2-digit'})}
                />
                
                <Column 
                    header="Fin" 
                    style={{ width: '22%' }}
                    body={(rowData: any) => new Date(rowData.fechaFinal).toLocaleDateString('es-MX', {day:'2-digit', month:'2-digit', year:'2-digit'})}
                />

                <Column 
                    field="vacationDays" 
                    header="Días" 
                    style={{ width: '16%' }}
                    bodyStyle={{ textAlign: 'center', fontWeight: 'bold' }}
                    headerStyle={{ textAlign: 'center' }}
                />
            </DataTable>
        </div>
    );
}
