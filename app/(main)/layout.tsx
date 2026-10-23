'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';

interface Periodo {
    id: string;
    nombre: string;
}

// 📦 Componente Interno que maneja la lógica de la URL
function NominasTabsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string | null>(null);
    const [palabraConfirmacion, setPalabraConfirmacion] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Escucha el menú de hamburguesa (?action=rollback)
    useEffect(() => {
        const action = searchParams?.get('action');
        if (action === 'rollback') {
            setActiveIndex(1);
        } else {
            setActiveIndex(0);
        }
    }, [searchParams]);

    // Carga de periodos de prueba
    useEffect(() => {
        setPeriodos([
            { id: '2026-10-Q1', nombre: 'Octubre 2026 - 1ra Quincena' },
            { id: '2026-09-Q2', nombre: 'Septiembre 2026 - 2da Quincena' },
            { id: '2026-09-Q1', nombre: 'Septiembre 2026 - 1ra Quincena' },
        ]);
    }, []);

    const esConfirmacionValida = 
        periodoSeleccionado !== null && 
        palabraConfirmacion.trim() === 'ELIMINAR';

    const handleExecuteRollback = async () => {
        if (!esConfirmacionValida) return;

        setLoading(true);
        try {
            // Simulamos la espera de respuesta del servidor (2 segundos)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            toast.current?.show({
                severity: 'success',
                summary: '¡Rollback Exitoso!',
                detail: `El periodo ${periodoSeleccionado} fue purgado de la BD y S3 de forma segura.`,
                life: 5000
            });

            setPeriodoSeleccionado(null);
            setPalabraConfirmacion('');
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error simulado.',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card w-full max-w-4xl mx-auto mt-4 p-4 bg-white shadow-2 border-round">
            <Toast ref={toast} />
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4 flex align-items-center gap-2 border-bottom-1 surface-border pb-3">
                <i className="pi pi-wallet text-blue-600 text-3xl"></i>
                Módulo de Nóminas (Control de Periodos)
            </h1>

            <TabView 
                activeIndex={activeIndex} 
                onTabChange={(e) => {
                    setActiveIndex(e.index);
                    // Limpia el query param al navegar manualmente
                    router.push('/admin/nominas');
                }}
            >
                {/* PESTAÑA 1: CARGA MASIVA */}
                <TabPanel header="Carga Masiva" leftIcon="pi pi-cloud-upload mr-2">
                    <div className="p-5 text-center border-2 border-dashed border-300 border-round surface-50 min-h-15rem flex flex-column justify-content-center align-items-center mt-3">
                        <i className="pi pi-file-excel text-5xl text-green-500 mb-3"></i>
                        <span className="text-lg font-medium text-700">Arrastra aquí el archivo de nóminas o búscalo</span>
                        <p className="text-sm text-500 mt-1">Formatos aceptados: .xlsx, .csv</p>
                        <Button label="Seleccionar Archivo" icon="pi pi-search" className="p-button-sm mt-3 p-button-info" />
                    </div>
                </TabPanel>

                {/* PESTAÑA 2: REVERSIÓN / ROLLBACK */}
                <TabPanel header="Reversión (Rollback)" leftIcon="pi pi-history mr-2" headerClassName="text-red-500">
                    <div className="flex flex-column gap-4 p-2 mt-3">
                        
                        <Message 
                            severity="warn" 
                            text="Esta acción eliminará de forma permanente todos los recibos de nómina del periodo seleccionado en la Base de Datos y sus archivos PDF correspondientes en el almacén de S3." 
                            className="w-full justify-content-start font-medium shadow-1"
                        />

                        {/* Paso 1: Dropdown */}
                        <div className="flex flex-column gap-2">
                            <label htmlFor="periodo" className="font-semibold text-gray-700 text-sm">
                                1. Selecciona el Periodo a Revertir:
                            </label>
                            <Dropdown 
                                id="periodo"
                                value={periodoSeleccionado} 
                                options={periodos} 
                                onChange={(e) => setPeriodoSeleccionado(e.value)} 
                                optionLabel="nombre" 
                                optionValue="id"
                                placeholder="-- Selecciona un periodo activo --" 
                                className="w-full md:w-25rem"
                                disabled={loading}
                            />
                        </div>

                        {/* Paso 2: Input de Confirmación */}
                        <div className="flex flex-column gap-2">
                            <label htmlFor="confirmar" className="font-semibold text-gray-700 text-sm">
                                2. Para confirmar, escribe la palabra <b className="text-red-600 font-bold">ELIMINAR</b>:
                            </label>
                            <InputText 
                                id="confirmar"
                                value={palabraConfirmacion} 
                                onChange={(e) => setPalabraConfirmacion(e.target.value)} 
                                placeholder="Escribe aquí..." 
                                className="w-full md:w-25rem p-inputtext-sm font-bold uppercase tracking-wider text-red-600"
                                disabled={loading || !periodoSeleccionado}
                                autoComplete="off"
                            />
                        </div>

                        {/* Botón de Ejecución */}
                        <div className="pt-2 border-top-1 surface-border mt-2">
                            <Button 
                                label={loading ? 'Procesando Reversión...' : 'Ejecutar Reversión Masiva'} 
                                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-exclamation-triangle'} 
                                className="p-button-danger w-full md:w-auto font-bold shadow-2"
                                onClick={handleExecuteRollback}
                                disabled={!esConfirmacionValida || loading}
                            />
                        </div>

                    </div>
                </TabPanel>
            </TabView>
        </div>
    );
}

// 🏛️ Componente Raíz que exporta la página con su Suspense Boundary
export default function AdminNominasPage() {
    return (
        <Suspense fallback={<div className="text-center p-5 font-medium text-600">Cargando módulo de nóminas...</div>}>
            <NominasTabsContent />
        </Suspense>
    );
}
