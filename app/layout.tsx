// app/layout.tsx
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // O tu tema
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css'; // <-- Vital para las clases flex
import { AuthProvider } from '../context/AuthContext';
import { AuthGuard } from '../context/AuthGuard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}> {/* Quitamos el margen por defecto del navegador */}
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}