'use client'
// 1. Asegúrate de incluir useState y useEffect en los imports
import { API_URL } from '../../../utils/api';
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Menu } from "primereact/menu";
import { useRef, useState, useEffect } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    // 2. Definimos el estado para los usuarios
    const [users, setUsers] = useState<any[]>([]); // Empezamos con un array vacío
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    const userMenuRef = useRef<Menu>(null);

    // 3. El "puente" al backend de NestJS
    useEffect(() => {
        //fetch('http://localhost:5000/users') // Tu endpoint de Nest
        fetch(`${API_URL}/users`) // Tu endpoint de Nest
            .then(res => {
                if (!res.ok) throw new Error('Error en la red');
                return res.json();
            })
            .then(data => {
                setUsers(data); // Aquí guardamos los usuarios
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al conectar con NestJS:", err);
                setLoading(false);
            });
    }, []);

    // ... resto de tus navigationItems y topbarItems

    return (
        <div className="card">
            <DataTable value={users} tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="ID"></Column>
                <Column field="name" header="Nombre"></Column>
                <Column field="email" header="Correo"></Column>
            </DataTable>
        </div>
    );
}