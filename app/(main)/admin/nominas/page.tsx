'use client'
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';

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
        const file = e.files[0]; // Captura el archivo del array de PrimeReact
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
            
            // Disparo al puerto 5002 del backend que dejamos funcionando al 100%
            const response = await fetch('http://3.133.86', {
                method: 'POST',
                headers: {
                    'x-tenant-id': localStorage.getItem('tenant_schema_name') || 'empresademo', 
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
