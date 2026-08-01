'use client';
import { API_URL } from '../../utils/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; 
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState(''); // 🚨 NUEVO: Captura clave temporal
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { logout } = useAuth(); 
    const router = useRouter();

    const ejecutarCambio = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Por favor completa todos los campos.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Las contraseñas nuevas no coinciden. Verifica los datos.");
            return;
        }

        if (newPassword.length < 6) {
            alert("Por motivos de seguridad, la nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }

        // EXTRACCIÓN INMEDIATA DESDE COOKIES PARA EVITAR EL RETRASO DE REACT SESSIONS
        const obtenerCookie = (name: string) => {
            if (typeof document === 'undefined') return null;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };

        const userIdReal = obtenerCookie('namex_userId');

        if (!userIdReal) {
            alert("Sesión inválida o expirada. Por favor vuelve a iniciar sesión.");
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            // LÓGICA DE DETECCIÓN MOLECULAR DE SUBDOMINIO (Igual a tu Login)
            let currentTenant = 'empresademo'; 

            if (typeof window !== 'undefined') {
                const hostname = window.location.hostname;
                const parts = hostname.split('.');

                if (hostname.includes('namexportal.com') && parts.length > 2) {
                    currentTenant = parts[0] !== 'www' ? parts[0] : 'empresademo';
                }
            }

            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': currentTenant // Cabecera del esquema multi-tenant
                },
                body: JSON.stringify({ 
                    userId: userIdReal, 
                    password: newPassword,
                    currentPassword: currentPassword // 🎯 SE CORRIGE EL CONTRATO DEL DTO
                })
            });

            const data = await res.json();

            if (!res.ok || data.status === 404 || data.status === 401 || data.name === 'HttpException') {
                const msg = data.message || "No se pudo actualizar la contraseña.";
                alert(Array.isArray(msg) ? msg.join(', ') : msg);
                return;
            }

            alert("¡Contraseña actualizada con éxito! Inicia sesión con tu nueva clave.");
            
            logout(); 
            router.push('/login');

        } catch (error) {
            alert("Error de conexión con el servidor al intentar cambiar la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    const header = <div className="font-bold text-sm mb-3">Sugerencia de contraseña</div>;
    const footer = (
        <>
            <Divider />
            <p className="mt-2 text-sm text-600">Requisitos:</p>
            <ul className="pl-2 ml-2 mt-0 text-sm text-600 line-height-3">
                <li>Al menos una minúscula</li>
                <li>Al menos una mayúscula</li>
                <li>Al menos un número</li>
                <li>Mínimo 6 caracteres</li>
            </ul>
        </>
    );

    return (
        <div className="flex flex-column align-items-center justify-content-center min-h-screen">
            <div className="surface-card p-6 shadow-2 border-round-xl w-full sm:w-26rem md:w-28rem lg:w-30rem mx-3">
                <div className="text-center mb-3">
                    <img src="/namex.png" alt="Image" height="50" className="mb-1" />
                    <div className="text-900 text-3xl font-medium mb-3">Actualizar Contraseña</div>
                    <span className="text-600 font-medium line-height-3">Por seguridad es necesario actualizar tu contraseña temporal en tu primer inicio de sesión.</span>
                </div>

                <form onSubmit={ejecutarCambio}>
                    <div>
                        <label className="text-900 font-medium block mb-2">Contraseña actual</label>
                        <Password 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            toggleMask 
                            className="w-full mb-1" 
                            inputClassName="w-full p-3" 
                            feedback={false}
                        />

                        <label className="text-900 font-medium block mb-2">Nueva contraseña</label>
                        <Password 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            toggleMask 
                            className="w-full mb-1" 
                            inputClassName="w-full p-3"
                            header={header} 
                            footer={footer} 
                            promptLabel="Ingresa contraseña" 
                            weakLabel="Débil" 
                            mediumLabel="Media" 
                            strongLabel="Fuerte"
                        />

                        <label className="text-900 font-medium block mb-2">Confirmar contraseña</label>
                        <Password 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            toggleMask 
                            className="w-full mb-1" 
                            inputClassName="w-full p-3" 
                            feedback={false}
                        />

                        <div className="flex gap-3 mt-4">
                            <Button 
                                type="button" 
                                label="Cancelar" 
                                icon="pi pi-times" 
                                className="w-6 p-3 p-button-outlined" 
                                onClick={() => { logout(); router.push('/login'); }}
                            />
                            <Button 
                                type="submit" 
                                label="Guardar" 
                                icon="pi pi-check" 
                                className="w-6 p-3" 
                                loading={loading}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}


/*
'use client';
import { API_URL } from '../../utils/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // 🚨 Ajusta esta ruta a tu AuthContext real
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';

export default function ChangePasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Recuperamos la sesión actual y la función de cierre de sesión
    const { user, logout } = useAuth(); 
    const router = useRouter();

    const ejecutarCambio = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // 1. Validaciones básicas en el cliente
        if (!newPassword || !confirmPassword) {
            alert("Por favor completa ambos campos.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden. Verifica los datos.");
            return;
        }

        if (newPassword.length < 6) {
            alert("Por motivos de seguridad, la contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);
        try {
            // 2. Consumir el endpoint que acabamos de crear en NestJS
            //const res = await fetch('http://localhost:5000/auth/change-password', {
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user?.userId , // Enviamos el ID del usuario logueado
                    password: newPassword 
                })
            });

            const data = await res.json();

            // Verificación estricta de errores idéntica a tu Login
            if (!res.ok || data.status === 404 || data.status === 401 || data.name === 'HttpException') {
                const msg = data.message || "No se pudo actualizar la contraseña.";
                alert(Array.isArray(msg) ? msg.join(', ') : msg);
                return;
            }

            alert("¡Contraseña actualizada con éxito! Inicia sesión con tu nueva clave.");
            
            // Limpiamos el token temporal y redirigimos al login
            logout(); 
            router.push('/login');

        } catch (error) {
            alert("Error de conexión con el servidor al intentar cambiar la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen p-3">
            <div className="surface-card p-6 shadow-2 border-round-xl w-full" style={{ maxWidth: '400px' }}>
                
                <div className="text-center mb-5">
                    <img src="/namex.png" alt="logo" height="50" className="mb-3" />
                    <div className="text-900 text-2xl font-medium mb-2">Nueva Contraseña</div>
                    <p className="text-600 m-0">Por seguridad, debes cambiar tu clave asignada antes de continuar al sistema.</p>
                </div>

                <div className="flex flex-column gap-3">
                    <div>
                        <label htmlFor="newPassword" className="block text-900 font-medium mb-2">Contraseña Nueva</label>
                        <Password 
                            id="newPassword" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            toggleMask 
                            className="w-full" 
                            inputClassName="w-full p-3"
                            promptLabel="Escribe una contraseña"
                            weakLabel="Muy Débil"
                            mediumLabel="Aceptable"
                            strongLabel="Fuerte y Segura"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-900 font-medium mb-2">Confirmar Contraseña</label>
                        <Password 
                            id="confirmPassword" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            toggleMask 
                            feedback={false} 
                            className="w-full" 
                            inputClassName="w-full p-3" 
                        />
                    </div>

                    <Button 
                        label="Confirmar y Guardar" 
                        icon="pi pi-check-circle" 
                        className="w-full p-3 text-xl mt-2" 
                        loading={loading}
                        onClick={ejecutarCambio} 
                    />
                </div>
                
                <Divider align="center" className="my-4" />

                <div className="text-center">
                    <span className="text-600 font-medium">¿Deseas salir?</span>
                    <a onClick={() => { logout(); router.push('/login'); }} className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Cerrar Sesión</a>
                </div>
            </div>
        </div>
    );
}
*/