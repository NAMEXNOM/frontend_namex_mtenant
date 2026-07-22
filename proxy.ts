// frontend/middleware.ts
/*
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function proxy(request: NextRequest) {
    // 1. Intentar obtener el token desde las cookies (ajusta 'token' por el nombre que uses)
    //const token = request.cookies.get('token')?.value;
    const token = request.cookies.get('token')?.value; // Debe coincidir con el nombre de la cookie
    const { pathname } = request.nextUrl;

    // 2. Definir las rutas que CUALQUIERA puede ver sin iniciar sesión
    const esRutaPublica = pathname === '/login' || pathname === '/recover';

    // 3. CASO A: Si el usuario NO tiene token y quiere entrar a una ruta protegida (ej: /, /dashboard)
    if (!token && !esRutaPublica) {
        // Lo mandamos al login de forma forzada
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. CASO B: Si el usuario YA tiene token e intenta ir al login o recover por error
    if (token && esRutaPublica) {
        // Lo mandamos a la página principal porque ya está logueado
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Si todo está bien, dejamos que continúe a la página que pidió
    return NextResponse.next();
}

// 5. Configurar el filtro de Next.js (CRÍTICO para evitar bucles infinitos)
export const config = {
    matcher: [
        /*
         * Protege todo el sitio EXCEPTO:
         * - api (rutas internas de Next)
         * - _next/static y _next/image (archivos de diseño y fotos de Next)
         * - favicon.ico y carpetas de assets públicos como imágenes (.png, .jpg)
         */
  //      '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  //  ],
//};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // 💡 Corrección de tipo: 'next/server' en vez de 'next/request'

export function proxy(request: NextRequest) {
    // 1. Intentar obtener el token y la sesión desde las cookies
    const token = request.cookies.get('token')?.value; 
    const sessionCookie = request.cookies.get('namex_session')?.value;
    const { pathname } = request.nextUrl;

    // 2. Definir las rutas que CUALQUIERA puede ver sin iniciar sesión
    const esRutaPublica = pathname === '/login' || pathname === '/recover';

    // 3. CASO A: Si el usuario NO tiene token y quiere entrar a una ruta protegida
    if (!token && !esRutaPublica) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. CASO B: Si el usuario YA tiene token e intenta ir al login o recover por error
    if (token && esRutaPublica) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 5. 🚨 NUEVO - CASO C: Si está logueado pero tiene deudas de seguridad (Cambio Obligatorio)
    if (token && sessionCookie) {
        try {
            const user = JSON.parse(sessionCookie);
            const debeCambiarClave = user.firstTimeLoad === true || user.status === 'TEMPORAL';

            // Si debe cambiar clave por obligación y NO está en la pantalla de cambio, lo encerramos ahí
            if (debeCambiarClave && pathname !== '/change-password') {
                return NextResponse.redirect(new URL('/change-password', request.url));
            }

            // Si YA está activo (libre) e intenta forzar entrar a /change-password, lo devolvemos al Home
            if (!debeCambiarClave && pathname === '/change-password') {
                // Permitimos el acceso solo si va por su cuenta desde el menú (ej: /change-password?voluntary=true)
                const esVoluntario = request.nextUrl.searchParams.get('voluntary') === 'true';
                if (!esVoluntario) {
                    return NextResponse.redirect(new URL('/', request.url));
                }
            }
        } catch (error) {
            // Si la cookie de sesión se corrompe, limpiamos y deslogueamos por seguridad
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('namex_session');
            response.cookies.delete('token');
            return response;
        }
    }

    // Si todo está bien, dejamos que continúe a la página que pidió
    return NextResponse.next();
}

// 5. Filtro de Next.js (Mantenemos tu excelente configuración original)
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
    ],
};
