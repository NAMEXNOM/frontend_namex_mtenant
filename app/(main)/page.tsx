/*
'use client'
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
    const router = useRouter();
    const { user } = useAuth();

    const menuOptions = [
        { label: 'Usuarios', icon: 'pi pi-users', path: '/users' },
        { label: 'Roles', icon: 'pi pi-pencil', path: '/roles' },
        { label: 'Vacaciones', icon: 'pi pi-calendar', path: '/vacations' },
        { label: 'Asistencias', icon: 'pi pi-calendar-clock', path: '/attendances' },
    ];

    return (
        <div className="flex flex-column align-items-center justify-content-center p-3 mt-4">
            <div className="surface-card p-7 shadow-2 border-round-xl w-full" style={{ maxWidth: '450px' }}>
                
                <div className="text-center mb-5">
                    <h1 className="text-900 text-2xl font-medium mb-2">Bienvenido</h1>
                    <span className="text-blue-600 font-bold text-xl">{user?.userName}</span>
                    <p className="text-600 mt-3">Estado de Vacaciones:</p>
                </div>

                <div className="flex flex-row gap-3 mb-5">
                    <div className="flex-1 p-3 border-round-lg bg-blue-200 border-2 border-blue-200 flex flex-column align-items-center">
                        <i className="pi pi-sun text-blue-600 text-xl mb-2"></i>
                        <span className="text-700 text-xs font-semibold uppercase">Disponibles</span>
                        <span className="text-blue-900 font-bold text-2xl">{user?.userBalance ?? 0}</span>
                    </div>

                    <div className="flex-1 p-3 border-round-lg bg-orange-50 border-2 border-orange-200 flex flex-column align-items-center">
                        <i className="pi pi-calendar-times text-orange-600 text-xl mb-2"></i>
                        <span className="text-700 text-xs font-semibold uppercase">Tomadas</span>
                        <span className="text-orange-900 font-bold text-2xl">{user?.vacationsTaken ?? 0}</span>
                    </div>
                </div>

                <div className="flex flex-column gap-3">
                    <Button 
                        label="Detalle Vacaciones" 
                        icon="pi pi-send" 
                        className="w-full p-3 text-lg p-button-success" 
                        onClick={() => router.push('/vacations')} 
                    />

                    <Button 
                        label="Mis Asistencias" 
                        icon="pi pi-calendar-clock" 
                        className="w-full p-3 text-lg p-button-info" 
                        onClick={() => router.push('/attendances')} 
                    />
                </div>

            </div>
        </div>
    );
}
*/

'use client'
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
    const router = useRouter();
    const { user } = useAuth();

    // Actualizado: Se añade la opción al arreglo por si la necesitas en otro submenú dinámico
    const menuOptions = [
        { label: 'Usuarios', icon: 'pi pi-users', path: '/users' },
        { label: 'Roles', icon: 'pi pi-pencil', path: '/roles' },
        { label: 'Vacaciones', icon: 'pi pi-calendar', path: '/vacations' },
        { label: 'Asistencias', icon: 'pi pi-calendar-clock', path: '/attendances' },
        { label: 'Recibos de Nómina', icon: 'pi pi-file-pdf', path: '/nominas' },
    ];

    return (
        <div className="flex flex-column align-items-center justify-content-center p-3 mt-4">
            <div className="surface-card p-7 shadow-2 border-round-xl w-full" style={{ maxWidth: '450px' }}>
                
                <div className="text-center mb-5">
                    <h1 className="text-900 text-2xl font-medium mb-2">Bienvenido</h1>
                    <span className="text-blue-600 font-bold text-xl">{user?.userName}</span>
                    <p className="text-600 mt-3">Estado de Vacaciones:</p>
                </div>

                <div className="flex flex-row gap-3 mb-5">
                    <div className="flex-1 p-3 border-round-lg bg-blue-200 border-2 border-blue-200 flex flex-column align-items-center">
                        <i className="pi pi-sun text-blue-600 text-xl mb-2"></i>
                        <span className="text-700 text-xs font-semibold uppercase">Disponibles</span>
                        <span className="text-blue-900 font-bold text-2xl">{user?.userBalance ?? 0}</span>
                    </div>

                    <div className="flex-1 p-3 border-round-lg bg-orange-50 border-2 border-orange-200 flex flex-column align-items-center">
                        <i className="pi pi-calendar-times text-orange-600 text-xl mb-2"></i>
                        <span className="text-700 text-xs font-semibold uppercase">Tomadas</span>
                        <span className="text-orange-900 font-bold text-2xl">{user?.vacationsTaken ?? 0}</span>
                    </div>
                </div>

                <div className="flex flex-column gap-3">
                    <Button 
                        label="Detalle Vacaciones" 
                        icon="pi pi-send" 
                        className="w-full p-3 text-lg p-button-success" 
                        onClick={() => router.push('/vacations')} 
                    />

                    <Button 
                        label="Mis Asistencias" 
                        icon="pi pi-calendar-clock" 
                        className="w-full p-3 text-lg p-button-info" 
                        onClick={() => router.push('/attendances')} 
                    />

                    {/* Nuevo Botón: Módulo de Recibos de Nómina */}
                    <Button 
                        label="Mis Recibos" 
                        icon="pi pi-file-pdf" 
                        className="w-full p-3 text-lg p-button-help" 
                        onClick={() => router.push('/nominas')} 
                    />
                </div>

            </div>
        </div>
    );
}
