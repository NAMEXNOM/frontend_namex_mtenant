'use client'
import { useAuth } from '../context/AuthContext';
import { Button } from 'primereact/button';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-column min-h-screen bg-gray-50">
    {/* BARRA SUPERIOR (HEADER) */}
    <header className="flex flex-column bg-white shadow-1 sticky top-0 z-5">
        
        {/* Fila 1: Navegación y Título */}
        <div className="flex justify-content-between align-items-center p-3 w-full">
            {/* Botón de Regreso (Izquierda) */}
            <Button 
                icon="pi pi-arrow-left" 
                className="p-button-text p-button-plain p-button-sm" 
                onClick={() => window.history.back()} // O tu función de navegación nativa
            />

            {/* Título de la Sección (Centrado Absoluto) */}
            <span className="font-bold text-blue-600 text-lg">EMPLEADOS</span>
            
            {/* Botón de Salir (Derecha) */}
            <Button 
                icon="pi pi-sign-out" 
                label="Salir" 
                className="p-button-text p-button-danger p-button-sm" 
                onClick={() => logout()} 
            />
        </div>

        {/* Fila 2: Saludo al Usuario (Renglón abajo, centrado de lado a lado) */}
        <div className="text-center pb-3 pt-1 border-top-1 border-300 surface-border">
            <span className="text-sm text-600">
                Hola, <b className="text-900">{user?.userName.split(" ")[0] || 'Usuario'}</b>
            </span>
        </div>
    </header>

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
    return (
        <div className="flex flex-column min-h-screen bg-gray-50">
            
            <header className="flex justify-content-between align-items-center p-3 bg-white shadow-1 sticky top-0 z-5">
                <span className="font-bold text-blue-600">EMPLEADOS</span>
                
                <div className="flex align-items-center gap-3">
                    <span className="text-sm">Hola, <b>{user?.userName.split(" ")[0] || 'Usuario'}</b></span>
                    <Button 
                        icon="pi pi-sign-out" 
                        label="Salir" 
                        className="p-button-text p-button-danger p-button-sm" 
                        onClick={() => logout()} 
                    />
                </div>
            </header>

           
            <main className="flex-1 flex justify-content-center p-3">
                <div className="w-full" style={{ maxWidth: '500px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
*/