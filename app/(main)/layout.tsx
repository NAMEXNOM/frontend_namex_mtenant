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

                    {/* El título ahora llama a la función corregida */}
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
