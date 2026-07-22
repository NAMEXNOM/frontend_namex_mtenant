'use client';
import { API_URL } from '../../utils/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from 'primereact/divider';

export default function RecoverPage() {
    const [userRFC, setUserRFC] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const ejecutarRecuperacion = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Limpiar espacios en blanco
        const cleanRFC = userRFC.trim();
        const cleanEmail = email.trim().toLowerCase(); // El correo suele ser minúsculas

        // 1. Validaciones básicas en el cliente utilizando los datos limpios
        if (!cleanRFC || !cleanEmail) {
            alert("Por favor ingresa tu RFC y tu Correo Electrónico.");
            return;
        }

        setLoading(true);
        try {
            // 2. Consumir el endpoint de envío de clave temporal
            //const res = await fetch('http://localhost:5000/auth/recover-password', {
            const res = await fetch(`${API_URL}/auth/recover-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userRFC: cleanRFC, 
                    email: cleanEmail 
                }) // Enviamos los datos limpios
            })

            const data = await res.json();

            // Interceptor estricto de errores del servidor
            if (!res.ok || data.status === 404 || data.status === 401 || data.name === 'HttpException') {
                console.warn("❌ SOLICITUD RECHAZADA POR EL BACKEND:", data);
                const msg = data.message || "Los datos ingresados no son correctos.";
                alert(Array.isArray(msg) ? msg.join(', ') : msg);
                setLoading(false);
                return; 
            }

            // 3. Flujo exitoso
            console.log("✅ CLAVE GENERADA CON ÉXITO:", data);
            alert("¡Proceso Exitoso! Se ha enviado una contraseña temporal a tu correo electrónico registrado.");
            
            // Mandamos al usuario de regreso al login para que use la clave recibida
            router.push('/login'); 

        } catch (error) {
            console.error("🚨 Error físico de comunicación:", error);
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
                    <div className="text-900 text-2xl font-medium mb-2">Recuperar Acceso</div>
                    <p className="text-600 m-0">Válido para olvido de clave o primer inicio de sesión.</p>
                </div>

                <div className="flex flex-column gap-3">
                    <div>
                        <label htmlFor="userRFC" className="block text-900 font-medium mb-2">RFC de Usuario</label>
                        <InputText 
                            id="userRFC" 
                            value={userRFC} 
                            onChange={(e) => setUserRFC(e.target.value.toUpperCase())} 
                            className="w-full p-inputtext-lg" 
                            placeholder="Ingresa tu RFC con Homoclave"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-900 font-medium mb-2">Correo Electrónico</label>
                        <InputText 
                            id="email" 
                            type="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full p-inputtext-lg" 
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <Button 
                        label="Enviar Contraseña Temporal" 
                        icon="pi pi-envelope" 
                        className="w-full p-3 text-xl mt-2" 
                        loading={loading}
                        onClick={ejecutarRecuperacion} 
                    />
                </div>
                
                <Divider align="center" className="my-4" />

                <div className="text-center">
                    <a onClick={() => router.push('/login')} className="font-medium no-underline text-blue-500 cursor-pointer">
                        Volver al Inicio de Sesión
                    </a>
                </div>
            </div>
        </div>
    );
}
