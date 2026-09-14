'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Ripple } from 'primereact/ripple';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    console.log("=== AUDITORÍA DE ROL EN LOGIN ===", user);
    
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    const handleNavigate = (path: string) => {
        setMenuVisible(false);
        router.push(path);
    };

    // Forzado en true para pruebas en la rama develop
    const esAdministrador = true;

    return (
        <div className="flex flex-column min-h-screen bg-gray-50">
            
            {/* 🔴 BARRA DE PRUEBA EN VIVO (Franja superior independiente para que sea 100% visible) */}
            <div className="bg-yellow-300 text-red-700 text-center font-bold p-2 text-sm md:text-base border-bottom-1 border-yellow-400 z-5">
                ⚠️ ¡ESTO ES UNA PRUEBA EN VIVO CORRIENDO EN DEVELOP!
            </div>

            {/* BARRA SUPERIOR (HEADER) */}
            <header className="flex flex-column bg-white shadow-1 sticky top-0 z-4">
                
                {/* Fila 1: Navegación, Título y Hamburguesa */}
                <div className="flex justify-content-between align-items-center p-3 w-full">
                    
                    {/* Contenedor Izquierdo (Regreso + Hamburguesa) */}
                    <div className="flex align-items-center gap-2" style={{ minWidth: '80px' }}>
                        <Button 
                            icon="pi pi-arrow-left" 
                            className="p-button-text p-button-plain p-button-sm" 
                            onClick={() => window.history.back()} 
                        />

                        {/* 🍔 Botón Hamburguesa de Administración */}
                        {esAdministrador && (
                            <Button 
                                icon="pi pi-bars" 
                                className="p-button-rounded p-button-info p-button-text p-button-sm" 
                                onClick={() => setMenuVisible(true)}
                                tooltip="Panel de Administrador"
                                tooltipOptions={{ position: 'bottom' }}
                            />
                        )}
                    </div>

                    {/* Título de la Sección (Centro) */}
                    <div className="text-center flex-1">
                        <span className="font-bold text-blue-600 text-lg uppercase tracking-wider">Portal</span>
                    </div>
                    
                    {/* Contenedor Derecho (Botón de Salir) */}
                    <div className="flex justify-content-end" style={{ minWidth: '80px' }}>
                        <Button 
                            icon="pi pi-sign-out" 
                            label="Salir" 
                            className="p-button-text p-button-danger p-button-sm" 
                            onClick={() => logout()} 
                        />
                    </div>
                </div>

                {/* Fila 2: Saludo al Usuario */}
                <div className="text-center pb-3 pt-1 border-top-1 border-100 surface-border">
                    <span className="text-sm text-600">
                        Hola usuario, <b className="text-900">{user?.userName?.split(" ")[0] || 'Usuario'}</b>
                    </span>
                </div>
            </header>

            {/* 🍔 PANEL LATERAL DESPLEGABLE (SIDEBAR DE PRIMEREACT) */}
            <Sidebar 
                visible={menuVisible} 
                onHide={() => setMenuVisible(false)} 
                position="left" 
                className="w-full md:w-20rem p-sidebar-sm"
            >
                <div className="flex align-items-center justify-content-between mb-4 px-2 border-bottom-1 surface-border pb-3">
                    <span className="font-bold text-xl text-900">
                        <i className="pi pi-cog mr-2 text-blue-500"></i>Panel Admin
                    </span>
                </div>

                <ul className="list-none p-0 m-0 overflow-hidden flex flex-column gap-2">
                    <li>
                        <button 
                            onClick={() => handleNavigate('/admin/nominas')}
                            className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full bg-transparent border-none text-left"
                        >
                            <i className="pi pi-cloud-upload mr-3 text-xl text-blue-500"></i>
                            <span className="font-medium text-base text-900">Carga Masiva Nóminas</span>
                            <Ripple />
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={() => handleNavigate('/admin/usuarios')}
                            className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full bg-transparent border-none text-left"
                        >
                            <i className="pi pi-users mr-3 text-xl text-green-500"></i>
                            <span className="font-medium text-base text-900">Gestión de Empleados</span>
                            <Ripple />
                        </button>
                    </li>
                    <li className="mt-3 border-top-1 surface-border pt-3">
                        <button 
                            onClick={() => handleNavigate('/')}
                            className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full bg-transparent border-none text-left"
                        >
                            <i className="pi pi-home mr-3 text-xl text-purple-500"></i>
                            <span className="font-medium text-base text-900">Inicio de Empleado</span>
                            <Ripple />
                        </button>
                    </li>
                </ul>
            </Sidebar>

            {/* CONTENIDO CENTRADO */}
            <main className="flex-1 flex justify-content-center p-3">
                <div className="w-full" style={{ maxWidth: '500px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}



/*
'use client'
import { useAuth } from '../context/AuthContext';
import { Button } from 'primereact/button';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-column min-h-screen bg-gray-50">
    {/* BARRA SUPERIOR (HEADER) }
    <header className="flex flex-column bg-white shadow-1 sticky top-0 z-5">
        
        {/* Fila 1: Navegación y Título }
        <div className="flex justify-content-between align-items-center p-3 w-full">
            {/* Botón de Regreso (Izquierda) }
            <Button 
                icon="pi pi-arrow-left" 
                className="p-button-text p-button-plain p-button-sm" 
                onClick={() => window.history.back()} // O tu función de navegación nativa
            />

            {/* Título de la Sección (Centrado Absoluto) }
            <span className="font-bold text-blue-600 text-lg">EMPLEADOS</span>
            
            {/* Botón de Salir (Derecha) }
            <Button 
                icon="pi pi-sign-out" 
                label="Salir" 
                className="p-button-text p-button-danger p-button-sm" 
                onClick={() => logout()} 
            />
        </div>

        {/* Fila 2: Saludo al Usuario (Renglón abajo, centrado de lado a lado) }
        <div className="text-center pb-3 pt-1 border-top-1 border-300 surface-border">
            <span className="text-sm text-600">
                Hola, <b className="text-900">{user?.userName.split(" ")[0] || 'Usuario'}</b>
            </span>
        </div>
    </header>

    {/* CONTENIDO CENTRADO }
    <main className="flex-1 flex justify-content-center p-3">
        <div className="w-full" style={{ maxWidth: '500px' }}>
            {children}
        </div>
    </main>
</div>
    );
}
    

*/