// context/AuthGuard.tsx
'use client';
import { useAuth } from './AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Esperar a que el Context lea el localStorage

    // 1. Definimos las rutas que no requieren login
    const esRutaPublica = pathname === '/login' || pathname === '/recover';

    // 2. Evaluamos si el usuario actual tiene restricciones de contraseña temporal
    // Validamos tanto booleano como string por compatibilidad con la base de datos
    const esUsuarioTemporal = 
      user?.status === 'TEMPORAL' || 
      user?.status === 'temporal' || 
      user?.firstTimeLoad === true || 
      user?.firstTimeLoad === 'true';

    // CASO A: Si no hay usuario y quiere ingresar a una pantalla privada, lo expulsamos al login
    if (!user && !esRutaPublica && pathname !== '/change-password') {
      router.push('/login');
      return;
    }
    
    // CASO B: El usuario es TEMPORAL y está intentando navegar a cualquier ruta que NO sea /change-password
    if (user && esUsuarioTemporal && pathname !== '/change-password') {
      console.log("🚨 AuthGuard: Usuario con credenciales temporales detectado. Forzando cambio de contraseña.");
      router.push('/change-password');
      return;
    }

    // CASO C: El usuario ya está ACTIVO (normal) e intenta entrar a login o recover, se le manda al home
    if (user && !esUsuarioTemporal && (pathname === '/login' || pathname === '/recover')) {
      router.push('/');
      return;
    }
  }, [user, pathname, router, loading]);

  // Si el AuthContext está cargando, mostramos spinner limpio de PrimeReact
  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
         <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '3rem' }}></i>
      </div>
    );
  }

  // 3. CONTROL DE RENDERIZADO SEGURO
  const esRutaPublica = pathname === '/login' || pathname === '/recover';
  
  // Si no hay usuario y no es ruta pública (y no es change-password), bloqueamos renderizado
  if (!user && !esRutaPublica && pathname !== '/change-password') return null;

  // Si el usuario es temporal y trata de ver la raíz u otra página privada, bloqueamos la vista mientras redirige
  const esUsuarioTemporal = user?.status === 'TEMPORAL' || user?.firstTimeLoad === true || user?.firstTimeLoad === 'true';
  if (user && esUsuarioTemporal && pathname !== '/change-password') return null;

  return <>{children}</>;
};
