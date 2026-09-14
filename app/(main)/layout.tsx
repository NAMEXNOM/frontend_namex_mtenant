'use client'
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; 
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Ripple } from 'primereact/ripple';

export default function NextMainLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Estado para controlar la apertura del menú de hamburguesa
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    const mostrarRegresar = pathname !== '/';

    // Función nativa de tu proyecto para obtener los títulos
    const obtenerTitulo = () => {
        if (!pathname) return 'EMPLEADOS';
        const rutaActual = pathname.toLowerCase();
        if (rutaActual.includes('attendance')) return 'ASISTENCIAS';
        if (rutaActual.includes('vacation')) return 'VACACIONES';
        return 'EMPLEADOS'; 
    };

    const handleNavigate = (path: string) => {
        setMenuVisible(false);
        router.push(path);
    };

    // 🟢 Regla de seguridad: Activado en true para las pruebas visuales en develop
    const esAdministrador = true;

    return (
        <div className="flex flex-column min-h-screen bg-gray-50">
            
            {/* 🔴 BARRA DE PRUEBA EN VIVO: Si esta barra sale, es que ganamos la batalla */}
            <div className="bg-yellow-300 text-red-700 text-center font-bold p-2 text-sm z-5">
                ⚠️ ¡ESTO ES UNA PRUEBA EN VIVO CORRIENDO EN DEVELOP!
            </div>

            <header className="flex flex-column bg-white shadow-1 sticky top-0 z-5">
                <div className="flex justify-content-between align-items-center p-3 w-full">
                    
                    {/* Botón de regresar y hamburguesa alineados a la izquierda */}
                    <div className="flex align-items-center justify-content-start gap-2 w-7rem">
                        {mostrarRegresar ? (
                            <Button 
                                icon="pi pi-arrow-left" 
                                className="p-button-text p-button-secondary p-button-sm p-0 h-2rem w-2rem" 
                                onClick={() => router.back()} 
                            />
                        ) : (
                            <div className="w-2rem h-2rem"></div>
                        )}

                        {/* 🍔 NUEVO: El botón de hamburguesa por fin inyectado en el archivo real */}
                        {esAdministrador && (
                            <Button 
                                icon="pi pi-bars" 
                                className="p-button-text p-button-info p-button-sm p-0 h-2rem w-2rem" 
                                onClick={() => setMenuVisible(true)}
                            />
                        )}
                    </div>

                    {/* Título de la Sección */}
                    <span className="font-bold text-blue-600 text-lg text-center flex-1 uppercase">
                        {obtenerTitulo()}
                    </span>
                    
                    <div className="flex align-items-center justify-content-end w-7rem">
                        <Button 
                            icon="pi pi-sign-out" 
                            label="Salir" 
                            className="p-button-text p-button-danger p-button-sm" 
                            onClick={() => logout()} 
                        />
                    </div>
                </div>

                <div className="text-center pb-3 pt-1 border-top-1 border-100">
                    <span className="text-sm text-600">
                        Hola, <b className="text-900">{user?.userName || 'Usuario'}</b>
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

            <main className="flex-1 flex justify-content-center p-3">
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}



/*

'use client'
import { useAuth } from '../../context/AuthContext'; 
import { Button } from 'primereact/button';
import { useRouter, usePathname } from 'next/navigation';

export default function NextMainLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const mostrarRegresar = pathname !== '/';

    // Función corregida con las rutas exactas de tu consola
const obtenerTitulo = () => {
    if (!pathname) return 'EMPLEADOS';

    const rutaActual = pathname.toLowerCase();

    // Ahora busca los términos exactos en inglés
    if (rutaActual.includes('attendance')) return 'ASISTENCIAS';
    if (rutaActual.includes('vacation')) return 'VACACIONES';

    return 'EMPLEADOS'; // Título para la raíz "/"
};

    return (
        <div className="flex flex-column min-h-screen bg-gray-50">
            <header className="flex flex-column bg-white shadow-1 sticky top-0 z-5">
                <div className="flex justify-content-between align-items-center p-3 w-full">
                    
                    <div className="flex align-items-center justify-content-start w-7rem">
                        {mostrarRegresar ? (
                            <Button 
                                icon="pi pi-arrow-left" 
                                className="p-button-text p-button-secondary p-button-sm p-0 h-2rem w-2rem" 
                                onClick={() => router.back()} 
                            />
                        ) : (
                            <div className="w-2rem h-2rem"></div>
                        )}
                    </div>

                    {/* El título ahora llama a la función corregida */  /*  } 
                    <span className="font-bold text-blue-600 text-lg text-center flex-1 uppercase">
                        {obtenerTitulo()}
                    </span>
                    
                    <div className="flex align-items-center justify-content-end w-7rem">
                        <Button 
                            icon="pi pi-sign-out" 
                            label="Salir" 
                            className="p-button-text p-button-danger p-button-sm" 
                            onClick={() => logout()} 
                        />
                    </div>
                </div>

                <div className="text-center pb-3 pt-1 border-top-1 border-100">
                    <span className="text-sm text-600">
                        Hola, <b className="text-900">{user?.userName || 'Usuario'}</b>
                    </span>
                </div>
            </header>

            <main className="flex-1 flex justify-content-center p-3">
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

*/