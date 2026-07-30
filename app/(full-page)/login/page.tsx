'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext'; 
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';

export default function LoginPage() {
    const [userRFC, setUserRFC] = useState(''); 
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const router = useRouter();

    const ejecutarLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!userRFC || !password) {
            alert("Por favor ingresa tu RFC y contraseña");
            return;
        }

        setLoading(true);
        try {
            // 🟢 LÓGICA DE DETECCIÓN MOLECULAR DE SUBDOMINIO
            let currentTenant = 'empresademo'; 
            let targetApiUrl = '/api'; 

            if (typeof window !== 'undefined') {
                const hostname = window.location.hostname;
                const parts = hostname.split('.');

                // 1. Caso de desarrollo local en tu PC de casa
                if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    targetApiUrl = 'http://localhost:5000';
                } 
                // 2. Caso de producción en AWS: Extraemos solo si hay un subdominio real por delante
                else if (hostname.includes('namexportal.com') && parts.length > 2) {
                    // Si el subdominio es "www", lo ignoramos y usamos la demo
                    currentTenant = parts[0] !== 'www' ? parts[0] : 'empresademo';
                    targetApiUrl = '/api'; 
                }
            }

            // 🎯 REALIZAMOS LA PETICIÓN CON LA CABECERA GARANTIZADA
            const res = await fetch(`${targetApiUrl}/auth/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': currentTenant 
                },
                body: JSON.stringify({ userRFC, password })
            });

            const data = await res.json(); 

            if (!res.ok || data.status === 404 || data.status === 401 || data.name === 'HttpException') {
                const msg = data.message || "Credenciales incorrectas";
                alert(Array.isArray(msg) ? msg.join(', ') : msg);
                setLoading(false);
                return; 
            }

            // 🟢 SOLUCIÓN AL BUILD: Mandamos únicamente los campos nativos y válidos a tu AuthContext original
            login({ 
                userName: data.userName,      
                token: data.access_token,     
                userBalance: data.userBalance,
                userId: data.userId
            });

            // 🟢 Guardar las banderas extendidas en cookies (Aquí no causan errores de TypeScript)
            document.cookie = `namex_userId=${data.userId}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `namex_firstTimeLoad=${data.firstTimeLoad}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `namex_status=${data.status}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `namex_vacationsTaken=${data.vacationsTaken}; path=/; max-age=86400; SameSite=Lax`;

            // Redirección inteligente basada en los datos de la respuesta
            const esPrimerIngreso = data.firstTimeLoad === true || data.firstTimeLoad === 'true';
            const esEstatusTemporal = data.status === 'TEMPORAL' || data.status === 'temporal';

            if (esPrimerIngreso || esEstatusTemporal) {
                router.push('/change-password'); 
            } else {
                router.push('/');
            }
            
            setTimeout(() => {
                router.refresh();
            }, 150);

        } catch (error) {
            console.error("🚨 Error crítico de red o código en el Frontend:", error);
            alert("Error de conexión con el servidor. Verifica que el Backend esté encendido.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen p-3">
            <div className="surface-card p-6 shadow-2 border-round-xl w-full" style={{ maxWidth: '400px' }}>
                <div className="text-center mb-5">
                    <img src="/namex.png" alt="logo" height="50" className="mb-3" />
                    <div className="text-900 text-3xl font-medium mb-3">Bienvenido</div>
                </div>

                <div className="flex flex-column gap-3">
                    <div>
                        <label htmlFor="userRFC" className="block text-900 font-medium mb-2">RFC de Usuario</label>
                        <InputText 
                            id="userRFC" 
                            value={userRFC} 
                            onChange={(e) => setUserRFC(e.target.value.toUpperCase())} 
                            className="w-full p-inputtext-lg" 
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-900 font-medium mb-2">Contraseña</label>
                        <Password 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            toggleMask 
                            feedback={false}
                            className="w-full" 
                            inputClassName="w-full p-3" 
                        />
                    </div>

                    <Button 
                        label="Entrar" 
                        icon="pi pi-sign-in" 
                        className="w-full p-3 text-xl mt-2" 
                        loading={loading}
                        onClick={ejecutarLogin} 
                    />
                </div>
                
                <Divider align="center" className="my-4" />

                <div className="text-center">
                    <a onClick={() => router.push('/recover')} className="font-medium no-underline text-blue-500 cursor-pointer">
                        ¿Olvidaste tu contraseña o es tu primer ingreso? Haz clic aquí
                    </a>
                </div>
            </div>
        </div>
    );
}
