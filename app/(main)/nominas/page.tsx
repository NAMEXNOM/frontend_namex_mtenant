'use client'
import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { useAuth } from '../../../context/AuthContext'; 

interface ReciboNomina {
    id: string;
    periodo_tipo: string;
    numero_periodo: number;
    nomina_tipo: string;
    fecha_pago: string;
    url_pdf: string;
    url_xml: string;
    monto_neto: number;
}

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


export default function MisRecibosPage() {
    const { user } = useAuth();
    const [recibos, setRecibos] = useState<ReciboNomina[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // 🟢 1. Cargar el historial de recibos al entrar a la pantalla
    useEffect(() => {
        const cargarRecibos = async () => {
            try {
                setLoading(true);
                const tokenReal = obtenerTokenCookieGlobal();

                const response = await fetch('/api/nominas/mis-recibos', {
                    headers: {
                        'x-tenant-id': localStorage.getItem('tenant_schema_name') || 'empresademo',
                        'Authorization': `Bearer ${tokenReal}` 
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setRecibos(data);
                }
            } catch (error) {
                console.error("Error cargando recibos:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarRecibos();
    }, []);

    // 📄 2. Descargar y abrir archivos de forma segura inyectando el Token
    const procesarDescargaSegura = async (s3Key: string) => {
        try {
            const tokenReal = obtenerTokenCookieGlobal();

            const response = await fetch(`/api/nominas/descargar-archivo?key=${s3Key}`, {
                headers: {
                    'x-tenant-id': localStorage.getItem('tenant_schema_name') || 'empresademo',
                    'Authorization': `Bearer ${tokenReal}`
                }
            });

            if (!response.ok) throw new Error('No autorizado o archivo no encontrado');

            // Convertimos la respuesta en un archivo temporal para el navegador
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            // Abrimos el archivo en una pestaña nueva limpia y segura
            window.open(blobUrl, '_blank');
        } catch (error) {
            console.error("Error en la descarga segura:", error);
        }
    };

    // Plantilla visual para el botón PDF
    const actionPdfTemplate = (rowData: ReciboNomina) => {
        return (
            <Button 
                icon="pi pi-file-pdf" 
                className="p-button-rounded p-button-danger p-button-text text-xl" 
                tooltip="Ver PDF"
                onClick={() => procesarDescargaSegura(rowData.url_pdf)}
                disabled={!rowData.url_pdf}
            />
        );
    };

    // Plantilla visual para el botón XML
    const actionXmlTemplate = (rowData: ReciboNomina) => {
        return (
            <Button 
                icon="pi pi-code" 
                className="p-button-rounded p-button-info p-button-text text-xl" 
                tooltip="Descargar XML"
                onClick={() => procesarDescargaSegura(rowData.url_xml)}
                disabled={!rowData.url_xml}
            />
        );
    };

    // Plantilla para pintar etiquetas bonitas según el tipo de nómina
    const nominaTipoTemplate = (rowData: ReciboNomina) => {
        const severity = rowData.nomina_tipo === 'Ordinaria' ? 'success' : 'warning';
        return <Tag value={rowData.nomina_tipo} severity={severity} className="text-xs px-2" />;
    };

    // Formateador de fechas legible
    const fechaTemplate = (rowData: ReciboNomina) => {
        if (!rowData.fecha_pago) return 'No registrada';
        const fecha = new Date(rowData.fecha_pago);
        return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="p-2 md:p-4 max-w-4xl mx-auto mt-3">
            <Card className="shadow-2 border-round-xl bg-white">
                
                <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <h1 className="text-900 text-xl font-bold m-0 flex align-items-center gap-2">
                            <i className="pi pi-wallet text-blue-600 text-2xl"></i> Mis Recibos de Nómina
                        </h1>
                        <p className="text-600 text-sm m-0 mt-1">Consulta, visualiza y descarga de forma segura tus comprobantes de pago CFDIs.</p>
                    </div>
                </div>

                <DataTable 
                    value={recibos} 
                    loading={loading}
                    emptyMessage="Aún no tienes recibos de nómina cargados en este periodo."
                    className="p-datatable-sm"
                    responsiveLayout="stack" 
                    breakpoint="960px"
                    paginator 
                    rows={5}
                    rowsPerPageOptions={[5, 10, 20]}
                >
                    <Column field="numero_periodo" header="Periodo" sortable className="font-semibold text-900" headerClassName="bg-gray-100" />
                    <Column field="periodo_tipo" header="Frecuencia" sortable headerClassName="bg-gray-100" />
                    <Column header="Tipo Nómina" body={nominaTipoTemplate} sortable headerClassName="bg-gray-100" />
                    <Column header="Fecha Pago" body={fechaTemplate} sortable headerClassName="bg-gray-100" />
                    <Column header="PDF" body={actionPdfTemplate} headerClassName="bg-gray-100" style={{ width: '4rem', textAlign: 'center' }} />
                    <Column header="XML" body={actionXmlTemplate} headerClassName="bg-gray-100" style={{ width: '4rem', textAlign: 'center' }} />
                </DataTable>

            </Card>
        </div>
    );
}



/*
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { useAuth } from '../../../context/AuthContext';

// Interfaz alineada con tu backend en NestJS
interface Recibo {
    id: string;
    periodoTipo: 'Semanal' | 'Quincenal' | 'Mensual';
    numeroPeriodo: number;
    nominaTipo: 'Ordinaria' | 'Especial';
    fechaPago: string;
    montoNeto: number;
    urlPdf: string;
    urlXml: string;
}

export default function NominasHistorialPage() {
    const router = useRouter();
    const { user } = useAuth(); // Usado para asegurar la reactividad o validación si es necesario
    const [recibos, setRecibos] = useState<Recibo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [tipoFiltro, setTipoFiltro] = useState<string | null>(null);

    // Simulación o llamado a tu API de NestJS
    useEffect(() => {
        // Reemplazar por tu cliente HTTP (Axios/Fetch) configurado con el token
        /*fetch('/api/nominas/mis-recibos')
            .then((res) => res.json())
            .then((data) => {
                setRecibos(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error cargando recibos:", err);
                setLoading(false);
            });*//*
    }, []);

    // Plantilla para la etiqueta del Tipo de Nómina
    const tipoNominaTemplate = (rowData: Recibo) => {
        const severity = rowData.nominaTipo === 'Ordinaria' ? 'success' : 'warning';
        return <Tag value={rowData.nominaTipo} severity={severity} className="text-xs px-2" />;
    };

    // Plantilla para formatear la moneda
    const montoTemplate = (rowData: Recibo) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(rowData.montoNeto);
    };

    // Plantilla para formatear la fecha
    const fechaTemplate = (rowData: Recibo) => {
        return new Date(rowData.fechaPago).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Plantilla para las acciones de descarga
    const accionesTemplate = (rowData: Recibo) => {
        return (
            <div className="flex gap-2 justify-content-end sm:justify-content-start">
                <Button 
                    icon="pi pi-file-pdf" 
                    tooltip="Descargar PDF"
                    className="p-button-rounded p-button-danger p-button-text p-button-sm" 
                    onClick={() => window.open(rowData.urlPdf, '_blank')}
                />
                <Button 
                    icon="pi pi-code" 
                    tooltip="Descargar XML"
                    className="p-button-rounded p-button-secondary p-button-text p-button-sm" 
                    onClick={() => window.open(rowData.urlXml, '_blank')}
                />
            </div>
        );
    };

    // Filtros de la cabecera de la tabla
    const opcionesFiltro = [
        { label: 'Todos los tipos', value: null },
        { label: 'Ordinaria', value: 'Ordinaria' },
        { label: 'Especial', value: 'Especial' }
    ];

    const header = (
        <div className="flex flex-column sm:flex-row justify-content-between align-items-center gap-3">
            <span className="text-xl text-900 font-bold">Mis Comprobantes</span>
            <Dropdown 
                value={tipoFiltro} 
                options={opcionesFiltro} 
                onChange={(e) => setTipoFiltro(e.value)} 
                placeholder="Filtrar por Tipo" 
                className="w-full sm:w-12rem"
            />
        </div>
    );

    // Filtrado local en base al estado del Dropdown
    const recibosFiltrados = tipoFiltro 
        ? recibos.filter(r => r.nominaTipo === tipoFiltro) 
        : recibos;

    return (
        <div className="p-3 mt-4 max-w-5xl mx-auto">
            {/* Botón para regresar al Home */ /*}
            <div className="mb-4">
                <Button 
                    label="Volver al Menú" 
                    icon="pi pi-arrow-left" 
                    className="p-button-text p-button-secondary font-medium" 
                    onClick={() => router.push('/')} 
                />
            </div>

            {/* Contenedor Principal */ /*}
            <div className="surface-card p-4 sm:p-5 shadow-2 border-round-xl">
                <div className="mb-4">
                    <h1 className="text-900 text-2xl font-medium mb-1">Historial de Nóminas</h1>
                    <p className="text-600 m-0">Consulta, visualiza y descarga tus recibos fiscales emitidos.</p>
                </div>

                {/* Tabla Interactiva de PrimeReact */ /*}
                <DataTable 
                    value={recibosFiltrados} 
                    loading={loading}
                    header={header}
                    rows={10} 
                    paginator
                    className="p-datatable-sm"
                    emptyMessage="No se encontraron recibos de nómina registrados."
                    responsiveLayout="stack" // Transforma la tabla en tarjetas en dispositivos móviles de forma automática
                    breakpoint="960px"
                >
                    <Column field="periodoTipo" header="Periodo" body={(r: Recibo) => `${r.periodoTipo} (No. ${r.numeroPeriodo})`} sortable />
                    <Column field="nominaTipo" header="Tipo de Nómina" body={tipoNominaTemplate} sortable />
                    <Column field="fechaPago" header="Fecha de Pago" body={fechaTemplate} sortable />
                    <Column field="montoNeto" header="Monto Neto" body={montoTemplate} sortable />
                    <Column header="Acciones" body={accionesTemplate} style={{ minWidth: '8rem' }} />
                </DataTable>
            </div>
        </div>
    );
}
*/