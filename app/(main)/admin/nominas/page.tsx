'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { TabView, TabPanel } from 'primereact/tabview';
import { Message } from 'primereact/message';

// 🔑 FUNCIÓN DE COOKIE INFALIBLE (Limpia y extrae el token sin expresiones regulares)
const obtenerTokenCookieGlobal = (): string => {
    if (typeof document === 'undefined') return '';
    const cookies = document.cookie.split(';');
    const cookieToken = cookies.find(c => c.trim().startsWith('token='));
    if (!cookieToken) return '';
    return cookieToken.split('=')[1].trim();
};

interface PeriodoHistorial {
    id: string;
    nombre: string;
}

function NominasModuleContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useRef<Toast>(null);

    // --- ESTADOS: CARGA MASIVA ---
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [periodoTipo, setPeriodoTipo] = useState<string | null>(null);
    const [numeroPeriodo, setNumeroPeriodo] = useState<string>('');
    const [nominaTipo, setNominaTipo] = useState<string | null>(null);
    const [archivoZip, setArchivoZip] = useState<File | null>(null);
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);

    // --- ESTADOS: REVERSIÓN (ROLLBACK) ---
    const [periodosHistorial, setPeriodosHistorial] = useState<PeriodoHistorial[]>([]); // 🟢 Inicializa vacío sin basura
    const [periodoARevertir, setPeriodoARevertir] = useState<string | null>(null);
    const [palabraConfirmacion, setPalabraConfirmacion] = useState<string>('');
    const [loadingRollback, setLoadingRollback] = useState<boolean>(false);

    const opcionesPeriodo = [
        { label: 'Semanal', value: 'Semanal' },
        { label: 'Quincenal', value: 'Quincenal' },
        { label: 'Mensual', value: 'Mensual' }
    ];

    const opcionesNomina = [
        { label: 'Ordinaria', value: 'Ordinaria' },
        { label: 'Especial (Aguinaldo, Bonos)', value: 'Especial' }
    ];

    // Escucha las peticiones de navegación del menú de hamburguesa (?action=rollback)
    useEffect(() => {
        const action = searchParams?.get('action');
        if (action === 'rollback') {
            setActiveIndex(1); // Mueve directo a la pestaña de Reversión
        } else {
            setActiveIndex(0); // Mueve por defecto a Carga Masiva
        }
    }, [searchParams]);

    // 🔄 CONEXIÓN REAL: Consulta los periodos activos existentes en PostgreSQL
    useEffect(() => {
        const consultarPeriodosReales = async () => {
            try {
                const tokenReal = obtenerTokenCookieGlobal();
                const response = await fetch('/api/admin/nominas/periodos-activos', {
                    method: 'GET',
                    headers: {
                        'x-tenant-id': localStorage.getItem('tenant_schema_name') || 'empresademo', 
                        'Authorization': `Bearer ${tokenReal}`
                    }
                });
                
                const result = await response.json();
                if (response.ok && result.success) {
                    setPeriodosHistorial(result.data); // Setea el arreglo dinámico
                }
            } catch (error) {
                console.error("Error al consultar periodos reales del servidor:", error);
            }
        };

        if (activeIndex === 1) {
            consultarPeriodosReales();
        }
    }, [activeIndex]);

    // 🔒 Validación estricta del candado de seguridad
    const esConfirmacionRollbackValida = 
        periodoARevertir !== null && 
        palabraConfirmacion.trim() === 'ELIMINAR';

    const onTemplateSelect = (e: any) => {
        const file = e.files[0]; 
        if (file && (file.type === 'application/zip' || file.name.endsWith('.zip'))) {
            setArchivoZip(file);
        } else {
            toast.current?.show({ severity: 'error', summary: 'Archivo inválido', detail: 'Solo se permiten archivos comprimidos (.ZIP)', life: 3000 });
        }
    };

    // --- ACCIÓN: SUBIR NÓMINA ---
    const handleSubmitUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!periodoTipo || !numeroPeriodo || !nominaTipo || !archivoZip) {
            toast.current?.show({ severity: 'warn', summary: 'Campos incompletos', detail: 'Por favor, llena todos los campos y selecciona un archivo.', life: 3000 });
            return;
        }

        const formData = new FormData();
        formData.append('file', archivoZip);
        formData.append('periodo_tipo', periodoTipo);
        formData.append('numero_periodo', numeroPeriodo);
        formData.append('nomina_tipo', nominaTipo);

        try {
            setLoadingUpload(true);
            const tokenReal = obtenerTokenCookieGlobal();

            const response = await fetch('/api/admin/nominas/upload-mass-zip', {
                method: 'POST',
                headers: {
                    'x-tenant-id': localStorage.getItem('tenant_schema_name') || 'empresademo', 
                    'Authorization': `Bearer ${tokenReal}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                toast.current?.show({ 
                    severity: 'success', 
                    summary: '¡Dispersión Exitosa!', 
                    detail: `Procesados con éxito: ${result.resumen.aceptados} recibos en AWS S3.`, 
                    life: 6000 
                });
                setNumeroPeriodo('');
                setArchivoZip(null);
                setPeriodoARevertir(null);
            } else {
                throw new Error(result.message || 'Error al procesar el archivo en el servidor.');
            }
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Error de Servidor', detail: error.message, life: 5000 });
        } finally {
            setLoadingUpload(false);
        }
    };



    
    // --- ACCIÓN: REVERSIÓN (ROLLBACK) ---
    const handleExecuteRollback = async () => {
        if (!esConfirmacionRollbackValida || !periodoARevertir) return;

        try {
            setLoadingRollback(true);
            const tokenReal = obtenerTokenCookieGlobal();

            // Desestructuramos el ID dinámico "Semanal-14-Ordinaria" para enviarlo desagregado
            const [periodo_tipo, numero_periodo, nomina_tipo] = periodoARevertir.split('-');

            const response = await fetch('/api/admin/nominas/rollback', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': localStorage.getItem('tenant_schema_name') || 'empresademo', 
                    'Authorization': `Bearer ${tokenReal}`
                },
                // Cuerpo alineado estrictamente con el DTO del backend
                body: JSON.stringify({ 
                    periodo_tipo, 
                    numero_periodo, 
                    nomina_tipo 
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.current?.show({ 
                    severity: 'success', 
                    summary: '¡Rollback Exitoso!', 
                    detail: result.message || 'El periodo fue purgado de la base de datos y de AWS S3.', 
                    life: 6000 
                });
                
                // Forzamos la limpieza de selecciones
                setPeriodoARevertir(null);
                setPalabraConfirmacion('');
                
                // 🔄 Refrescar la lista de periodos activos para remover el que se acaba de eliminar
                const responseRefresh = await fetch('/api/admin/nominas/periodos-activos', {
                    method: 'GET',
                    headers: {
                        'x-tenant-id': localStorage.getItem('tenant_schema_name') || 'empresademo', 
                        'Authorization': `Bearer ${tokenReal}`
                    }
                });
                const resultRefresh = await responseRefresh.json();
                if (responseRefresh.ok && resultRefresh.success) {
                    setPeriodosHistorial(resultRefresh.data);
                }
            } else {
                throw new Error(result.message || 'Error al procesar el rollback en el servidor.');
            }
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Error de Servidor', detail: error.message, life: 5000 });
        } finally {
            setLoadingRollback(false);
        }
    };

    return (
        <div className="p-3 mt-4 max-w-xl mx-auto">
            <Toast ref={toast} />
            
            <div className="mb-4">
                <Button 
                    label="Volver al Inicio" 
                    icon="pi pi-arrow-left" 
                    className="p-button-text p-button-secondary font-medium" 
                    onClick={() => router.push('/')} 
                />
            </div>

            <div className="surface-card p-4 shadow-2 border-round-xl bg-white">
                <div className="mb-4 text-center">
                    <h1 className="text-900 text-2xl font-medium mb-2">Panel de Administración</h1>
                    <p className="text-600 m-0 text-sm">Gestión integral del ciclo de recibos de nómina del sistema.</p>
                </div>

                <TabView 
                    activeIndex={activeIndex} 
                    onTabChange={(e) => {
                        setActiveIndex(e.index);
                        router.push('/admin/nominas'); // Resetea el query param al conmutar manualmente
                    }}
                >
                    {/* PESTAÑA A: DISPERSIÓN / CARGA MASIVA */}
                    <TabPanel header="Carga Masiva" leftIcon="pi pi-cloud-upload mr-2">
                        <form onSubmit={handleSubmitUpload} className="flex flex-column gap-4 mt-3">
                            <div className="flex flex-column gap-2">
                                <label className="text-900 font-semibold text-sm">Tipo de Periodo</label>
                                <Dropdown value={periodoTipo} options={opcionesPeriodo} onChange={(e) => setPeriodoTipo(e.value)} placeholder="Selecciona el periodo" className="w-full" disabled={loadingUpload} />
                            </div>

                            <div className="flex flex-column gap-2">
                                <label className="text-900 font-semibold text-sm">Número de Periodo</label>
                                <InputText keyfilter="int" value={numeroPeriodo} onChange={(e) => setNumeroPeriodo(e.target.value)} placeholder="Ej. 14" className="w-full p-3 text-base" disabled={loadingUpload} />
                            </div>

                            <div className="flex flex-column gap-2">
                                <label className="text-900 font-semibold text-sm">Tipo de Nómina</label>
                                <Dropdown value={nominaTipo} options={opcionesNomina} onChange={(e) => setNominaTipo(e.value)} placeholder="Selecciona el tipo" className="w-full" disabled={loadingUpload} />
                            </div>

                            <div className="flex flex-column gap-2">
                                <label className="text-900 font-semibold text-sm">Archivo Colectivo (.ZIP)</label>
                                <FileUpload mode="basic" name="file" accept=".zip" maxFileSize={50000000} onSelect={onTemplateSelect} chooseLabel={archivoZip ? archivoZip.name : "Seleccionar Archivo ZIP"} className="w-full p-button-outlined p-button-secondary" disabled={loadingUpload} />
                            </div>

                            <Button type="submit" label={loadingUpload ? "Procesando y Subiendo a AWS S3..." : "Iniciar Carga y Dispersión"} icon={loadingUpload ? "pi pi-spin pi-spinner" : "pi pi-cloud-upload"} className="w-full p-3 text-lg p-button-primary mt-3" disabled={loadingUpload} />
                        </form>
                    </TabPanel>

                    {/* PESTAÑA B: REVERSIÓN / ROLLBACK */}
                    <TabPanel header="Reversión (Rollback)" leftIcon="pi pi-history mr-2" headerClassName="text-red-500">
                        <div className="flex flex-column gap-4 mt-3">
                            <Message 
                                severity="warn" 
                                text="Esta acción eliminará de forma irreversible todos los recibos de este periodo en la Base de Datos y sus archivos PDF correspondientes en el almacén de AWS S3." 
                                className="w-full justify-content-start font-medium text-xs shadow-1"
                            />

                            <div className="flex flex-column gap-2">
                                <label htmlFor="periodo" className="text-900 font-semibold text-sm">
                                    1. Selecciona el Periodo a Revertir:
                                </label>
                                <Dropdown 
                                    id="periodo"
                                    value={periodoARevertir} 
                                    options={periodosHistorial} 
                                    onChange={(e) => setPeriodoARevertir(e.value)} 
                                    optionLabel="nombre" 
                                    optionValue="id"
                                    placeholder="-- Selecciona un periodo activo --" 
                                    className="w-full"
                                    disabled={loadingRollback}
                                    emptyMessage="No se encontraron periodos con recibos activos en este tenant."
                                />
                            </div>

                            <div className="flex flex-column gap-2">
                                <label htmlFor="confirmar" className="text-900 font-semibold text-sm">
                                    2. Para confirmar, escribe la palabra <b className="text-red-600 font-bold">ELIMINAR</b>:
                                </label>
                                <InputText 
                                    id="confirmar"
                                    value={palabraConfirmacion} 
                                    onChange={(e) => setPalabraConfirmacion(e.target.value)} 
                                    placeholder="Escribe aquí..." 
                                    className="w-full p-3 text-base text-red-600 font-bold uppercase tracking-wider"
                                    disabled={loadingRollback || !periodoARevertir}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="pt-2 border-top-1 surface-border">
                                <Button 
                                    label={loadingRollback ? 'Ejecutando Rollback en Servidores...' : 'Ejecutar Reversión Masiva'} 
                                    icon={loadingRollback ? 'pi pi-spin pi-spinner' : 'pi pi-exclamation-triangle'} 
                                    className="p-button-danger w-full p-3 text-base font-bold shadow-1"
                                    onClick={handleExecuteRollback}
                                    disabled={!esConfirmacionRollbackValida || loadingRollback}
                                />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    );
}




// 🏛️ Componente Raíz que exporta la página con su Suspense Boundary para Next.js (App Router)
export default function AdminUploadNominasPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-column justify-content-center align-items-center min-h-screen text-600 font-medium p-5">
                <i className="pi pi-spin pi-spinner text-3xl text-blue-500 mb-3"></i>
                <span>Cargando panel de administración...</span>
            </div>
        }>
            <NominasModuleContent />
        </Suspense>
    );
}





/*
'use client'
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';

// 🔑 FUNCIÓN DE COOKIE INFALIBLE (Limpia y extrae el token sin expresiones regulares)
const obtenerTokenCookieGlobal = (): string => {
    if (typeof document === 'undefined') return '';
    
    // Divide todas las cookies por punto y coma
    const cookies = document.cookie.split(';');
    
    // Busca la que empiece con "token="
    const cookieToken = cookies.find(c => c.trim().startsWith('token='));
    
    if (!cookieToken) return '';
    
    // Corta el texto después del signo "=" para quedarse solo con el JWT limpio
    return cookieToken.split('=')[1].trim();
};

export default function AdminUploadNominasPage() {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [periodoTipo, setPeriodoTipo] = useState<string | null>(null);
    const [numeroPeriodo, setNumeroPeriodo] = useState<string>('');
    const [nominaTipo, setNominaTipo] = useState<string | null>(null);
    const [archivoZip, setArchivoZip] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const opcionesPeriodo = [
        { label: 'Semanal', value: 'Semanal' },
        { label: 'Quincenal', value: 'Quincenal' },
        { label: 'Mensual', value: 'Mensual' }
    ];

    const opcionesNomina = [
        { label: 'Ordinaria', value: 'Ordinaria' },
        { label: 'Especial (Aguinaldo, Bonos)', value: 'Especial' }
    ];

    const onTemplateSelect = (e: any) => {
        const file = e.files[0]; 
        if (file && (file.type === 'application/zip' || file.name.endsWith('.zip'))) {
            setArchivoZip(file);
        } else {
            toast.current?.show({ severity: 'error', summary: 'Archivo inválido', detail: 'Solo se permiten archivos comprimidos (.ZIP)', life: 3000 });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!periodoTipo || !numeroPeriodo || !nominaTipo || !archivoZip) {
            toast.current?.show({ severity: 'warn', summary: 'Campos incompletos', detail: 'Por favor, llena todos los campos y selecciona un archivo.', life: 3000 });
            return;
        }

        const formData = new FormData();
        formData.append('file', archivoZip);
        formData.append('periodo_tipo', periodoTipo);
        formData.append('numero_periodo', numeroPeriodo);
        formData.append('nomina_tipo', nominaTipo);

        try {
            setLoading(true);
            
            // 🟢 1. Extraemos el pasaporte JWT auténtico de la sesión activa
            const tokenReal = obtenerTokenCookieGlobal();

            // 🟢 2. Realizamos la petición inyectando el encabezado Authorization requerido
            const response = await fetch('/api/admin/nominas/upload-mass-zip', {
                method: 'POST',
                headers: {
                    'x-tenant-id': localStorage.getItem('tenant_schema_name') || 'empresademo', 
                    // 🚀 ESTO ROMPE EL BLOQUEO 403 DEL SERVIDOR:
                    'Authorization': `Bearer ${tokenReal}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                toast.current?.show({ 
                    severity: 'success', 
                    summary: '¡Dispersión Exitosa!', 
                    detail: `Procesados con éxito: ${result.resumen.aceptados} recibos en AWS S3.`, 
                    life: 6000 
                });
                setNumeroPeriodo('');
                setArchivoZip(null);
            } else {
                throw new Error(result.message || 'Error al procesar el archivo en el servidor.');
            }
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Error de Servidor', detail: error.message, life: 5000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3 mt-4 max-w-xl mx-auto">
            <Toast ref={toast} />
            
            <div className="mb-4">
                <Button 
                    label="Volver al Inicio" 
                    icon="pi pi-arrow-left" 
                    className="p-button-text p-button-secondary font-medium" 
                    onClick={() => router.push('/')} 
                />
            </div>

            <div className="surface-card p-5 shadow-2 border-round-xl bg-white">
                <div className="mb-5 text-center">
                    <h1 className="text-900 text-2xl font-medium mb-2">Panel de Administración</h1>
                    <p className="text-600 m-0">Dispersión masiva de recibos de nómina comprimidos en ZIP (Pares PDF + XML).</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2">
                        <label className="text-900 font-semibold text-sm">Tipo de Periodo</label>
                        <Dropdown value={periodoTipo} options={opcionesPeriodo} onChange={(e) => setPeriodoTipo(e.value)} placeholder="Selecciona el periodo" className="w-full" />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label className="text-900 font-semibold text-sm">Número de Periodo</label>
                        <InputText keyfilter="int" value={numeroPeriodo} onChange={(e) => setNumeroPeriodo(e.target.value)} placeholder="Ej. 14" className="w-full p-3 text-base" />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label className="text-900 font-semibold text-sm">Tipo de Nómina</label>
                        <Dropdown value={nominaTipo} options={opcionesNomina} onChange={(e) => setNominaTipo(e.value)} placeholder="Selecciona el tipo" className="w-full" />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label className="text-900 font-semibold text-sm">Archivo Colectivo (.ZIP)</label>
                        <FileUpload mode="basic" name="file" accept=".zip" maxFileSize={50000000} onSelect={onTemplateSelect} chooseLabel={archivoZip ? archivoZip.name : "Seleccionar Archivo ZIP"} className="w-full p-button-outlined p-button-secondary" />
                    </div>

                    <Button type="submit" label={loading ? "Procesando y Subiendo a AWS S3..." : "Iniciar Carga y Dispersión"} icon={loading ? "pi pi-spin pi-spinner" : "pi pi-cloud-upload"} className="w-full p-3 text-lg p-button-primary mt-3" disabled={loading} />
                </form>
            </div>
        </div>
    );
}

*/