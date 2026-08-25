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
            });*/
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
            {/* Botón para regresar al Home */}
            <div className="mb-4">
                <Button 
                    label="Volver al Menú" 
                    icon="pi pi-arrow-left" 
                    className="p-button-text p-button-secondary font-medium" 
                    onClick={() => router.push('/')} 
                />
            </div>

            {/* Contenedor Principal */}
            <div className="surface-card p-4 sm:p-5 shadow-2 border-round-xl">
                <div className="mb-4">
                    <h1 className="text-900 text-2xl font-medium mb-1">Historial de Nóminas</h1>
                    <p className="text-600 m-0">Consulta, visualiza y descarga tus recibos fiscales emitidos.</p>
                </div>

                {/* Tabla Interactiva de PrimeReact */}
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
