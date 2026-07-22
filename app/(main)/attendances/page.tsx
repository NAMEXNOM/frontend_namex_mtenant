/*
// app/(main)/attendances/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ProgressSpinner } from 'primereact/progressspinner';
import { API_URL } from '../../../utils/api';

interface PeriodoAsistencia {
    id: number;
    label: string;
    startDate: Date;
    endDate: Date;
    data: any[];
}

export default function AsistenciasPage() {
    const { user } = useAuth();
    const [periods, setPeriods] = useState<PeriodoAsistencia[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let userId = user?.userId;
        let token = user?.token;

        // Recuperación segura por si hay un refresco de página (F5)
        if (!userId || !token) {
            const sessionRaw = localStorage.getItem('userSession');
            if (sessionRaw) {
                try {
                    const sessionData = JSON.parse(sessionRaw);
                    userId = sessionData.userId;
                    token = sessionData.token;
                } catch (e) {
                    console.error("Error al parsear userSession:", e);
                }
            }
        }

        // CORRECCIÓN 1: Si aún no hay sesión, desactivamos el loading para evitar loops, pero no bloqueamos futuros renders
        if (!userId || !token) {
            setLoading(false);
            return;
        }

        const cargarAsistencias = async () => {
            try {
                setLoading(true);
                //const res = await fetch(`http://127.0.0.1:5000/attendances/user?userId=${userId}`, {
                const res = await fetch(`${API_URL}/attendances/user?userId=${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const responseData = await res.json();
                    
                    // Procesamos y segmentamos las asistencias usando los rangos calculados por el backend
                    procesarYAgruparPeriodos(
                        responseData.attendances || [], 
                        responseData.config?.periodStartDate, 
                        responseData.config?.periodEndDate
                    );
                } else {
                    console.error("Error al consultar asistencias. Estatus:", res.status);
                }
            } catch (error) {
                console.error("Error de conexión con el backend:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarAsistencias();
    }, [user]); // Monitoreamos el objeto user completo para reaccionar a cambios de sesión

    // Algoritmo para segmentar las asistencias en bloques semanales de 7 días de forma exacta
    const procesarYAgruparPeriodos = (attendances: any[], startStr: string, endStr: string) => {
        if (!startStr) return;
        const fechaInicioTotal = new Date(startStr);
        
        // Creamos las 3 semanas consecutivas hacia atrás de forma matemática
        const semanas: PeriodoAsistencia[] = [];
        const nombresPeriodos = ['2 Semanas Atrás', '1 Semana Atrás', 'Período Actual'];

        for (let i = 0; i < 3; i++) {
            const inicioSemana = new Date(fechaInicioTotal);
            inicioSemana.setDate(fechaInicioTotal.getDate() + (i * 7));
            inicioSemana.setHours(0, 0, 0, 0);

            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            finSemana.setHours(23, 59, 59, 999);

            // Filtramos las asistencias que caen dentro de este rango de fechas específico
            const datosSemana = attendances.filter(attendance => {
                if (!attendance.recDate) return false;
                const fechaAsistencia = new Date(attendance.recDate + 'T00:00:00');
                return fechaAsistencia >= inicioSemana && fechaAsistencia <= finSemana;
            });

            semanas.push({
                id: i,
                label: nombresPeriodos[i],
                startDate: inicioSemana,
                endDate: finSemana,
                data: datosSemana
            });
        }

        // CORRECCIÓN 3: Invertimos usando el operador spread para no mutar el array original directamente y mantener consistencia con PrimeReact
        setPeriods([...semanas].reverse());
    };

    // Formateador visual para recortar los segundos de las marcas de tiempo (HH:MM:SS -> HH:MM)
    const formatTime = (rowData: any, field: string) => {
        if (!rowData[field]) return <span className="text-400">-:-</span>;
        return <span>{rowData[field].substring(0, 5)}</span>;
    };

    // Formateador de texto amigable para los encabezados de los acordeones
    const buildHeaderTemplate = (period: PeriodoAsistencia) => {
        const opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
        const inicioFormateado = period.startDate.toLocaleDateString('es-MX', opciones);
        const finFormateado = period.endDate.toLocaleDateString('es-MX', opciones);
        return (
            <div className="flex justify-content-between align-items-center w-full pr-3">
                <span className="font-semibold text-sm">{period.label}</span>
                <span className="text-xs text-500 font-normal">({inicioFormateado} al {finFormateado})</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center min-h-screen">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
            </div>
        );
    }

    return (
        <div className="surface-card p-2 md:p-4 shadow-2 border-round-xl m-2">
            <div className="flex align-items-center mb-3">
                <i className="pi pi-calendar-clock text-blue-600 text-2xl mr-2"></i>
                <h2 className="text-xl font-bold text-800 m-0">Mis Asistencias Semanales</h2>
            </div>
            
            <Accordion activeIndex={0}>
                {periods.map((period) => (
                    <AccordionTab key={period.id} header={buildHeaderTemplate(period)}>
                        <DataTable 
                            value={period.data} 
                            size="small" 
                            className="text-xs"
                            emptyMessage="No se encontraron registros de asistencia para esta semana."
                            stripedRows
                        >
                            <Column 
                                header="Día / Fecha" 
                                style={{ width: '18%' }}
                                body={(row) => {
                                    const fechaObj = new Date(row.recDate + 'T00:00:00');
                                    return <span className="capitalize">{fechaObj.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit' })}</span>;
                                }}
                            />
                            <Column field="recType" header="Tipo" style={{ width: '12%' }} />
                            <Column field="shift" header="Turno" style={{ width: '10%' }} bodyStyle={{ textAlign: 'center' }} />
                            <Column header="Entrada 1" body={(row) => formatTime(row, 'checkIn1')} bodyStyle={{ textAlign: 'center' }} />
                            <Column header="Salida 1" body={(row) => formatTime(row, 'checkOut1')} bodyStyle={{ textAlign: 'center' }} />
                            <Column header="Entrada 2" body={(row) => formatTime(row, 'checkIn2')} bodyStyle={{ textAlign: 'center' }} />
                            <Column header="Salida 2" body={(row) => formatTime(row, 'checkOut2')} bodyStyle={{ textAlign: 'center' }} />
                            <Column 
                                field="dailyHours" 
                                header="Total Hrs" 
                                style={{ width: '12%' }} 
                                bodyStyle={{ textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}
                            />
                        </DataTable>
                    </AccordionTab>
                ))}
            </Accordion>
        </div>
    );
}
*/

// app/(main)/attendances/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ProgressSpinner } from 'primereact/progressspinner';
import { API_URL } from '../../../utils/api';

interface PeriodoAsistencia {
    id: number;
    label: string;
    startDate: Date;
    endDate: Date;
    data: any[];
}

export default function AsistenciasPage() {
    const { user } = useAuth();
    const [periods, setPeriods] = useState<PeriodoAsistencia[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let userId = user?.userId;
        let token = user?.token;

        if (!userId || !token) {
            const sessionRaw = localStorage.getItem('userSession');
            if (sessionRaw) {
                try {
                    const sessionData = JSON.parse(sessionRaw);
                    userId = sessionData.userId;
                    token = sessionData.token;
                } catch (e) {
                    console.error("Error al parsear userSession:", e);
                }
            }
        }

        if (!userId || !token) {
            setLoading(false);
            return;
        }

        const cargarAsistencias = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/attendances/user?userId=${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const responseData = await res.json();
                    procesarYAgruparPeriodos(
                        responseData.attendances || [], 
                        responseData.config?.periodStartDate, 
                        responseData.config?.periodEndDate
                    );
                } else {
                    console.error("Error al consultar asistencias. Estatus:", res.status);
                }
            } catch (error) {
                console.error("Error de conexión con el backend:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarAsistencias();
    }, [user]);

 // ORDEN ASCENDENTE
/*
const procesarYAgruparPeriodos = (attendances: any[], startStr: string, endStr: string) => {
        if (!startStr) return;
        
        // 1. Forzamos a que la fecha base de inicio no sufra desfases de zona horaria agregando la hora explícita
        const fechaInicioTotal = new Date(startStr + 'T00:00:00');
        
        const semanas: PeriodoAsistencia[] = [];
        const nombresPeriodos = ['2 Semanas Atrás', '1 Semana Atrás', 'Período Actual'];

        // Constante con los milisegundos exactos que tiene 1 día
        const UN_DIA_EN_MS = 24 * 60 * 60 * 1000;

        for (let i = 0; i < 3; i++) {
            // 2. 🟢 CORRECCIÓN: Calculamos el inicio multiplicando los días en milisegundos puros
            const desfaseInicioMs = i * 7 * UN_DIA_EN_MS;
            const inicioSemana = new Date(fechaInicioTotal.getTime() + desfaseInicioMs);
            inicioSemana.setHours(0, 0, 0, 0);

            // 3. 🟢 CORRECCIÓN: El fin de semana es exactamente 6 días después en milisegundos
            const finSemana = new Date(inicioSemana.getTime() + (6 * UN_DIA_EN_MS));
            finSemana.setHours(23, 59, 59, 999);

            const datosSemana = attendances.filter(attendance => {
                if (!attendance.recDate) return false;
                const fechaAsistencia = new Date(attendance.recDate + 'T00:00:00');
                return fechaAsistencia >= inicioSemana && fechaAsistencia <= finSemana;
            });

            semanas.push({
                id: i,
                label: nombresPeriodos[i],
                startDate: inicioSemana,
                endDate: finSemana,
                data: datosSemana
            });
        }

        setPeriods([...semanas].reverse());
    };

// TERMINA ORDEN ASCENDENTE
*/

// ORDEN DESCENDENTE
const procesarYAgruparPeriodos = (attendances: any[], startStr: string, endStr: string) => {
        if (!startStr) return;
        
        const fechaInicioTotal = new Date(startStr + 'T00:00:00');
        const semanas: PeriodoAsistencia[] = [];
        const nombresPeriodos = ['2 Semanas Atrás', '1 Semana Atrás', 'Período Actual'];
        const UN_DIA_EN_MS = 24 * 60 * 60 * 1000;

        for (let i = 0; i < 3; i++) {
            const desfaseInicioMs = i * 7 * UN_DIA_EN_MS;
            const inicioSemana = new Date(fechaInicioTotal.getTime() + desfaseInicioMs);
            inicioSemana.setHours(0, 0, 0, 0);

            const finSemana = new Date(inicioSemana.getTime() + (6 * UN_DIA_EN_MS));
            finSemana.setHours(23, 59, 59, 999);

            // 1. Filtramos los datos pertenecientes a esta semana
            const datosSemana = attendances.filter(attendance => {
                if (!attendance.recDate) return false;
                const fechaAsistencia = new Date(attendance.recDate + 'T00:00:00');
                return fechaAsistencia >= inicioSemana && fechaAsistencia <= finSemana;
            });

            // 2. 🟢 NUEVO: Ordenamos los registros de forma DESCENDENTE (Día más nuevo primero)
            datosSemana.sort((a, b) => {
                return new Date(b.recDate + 'T00:00:00').getTime() - new Date(a.recDate + 'T00:00:00').getTime();
            });

            semanas.push({
                id: i,
                label: nombresPeriodos[i],
                startDate: inicioSemana,
                endDate: finSemana,
                data: datosSemana // Guardamos los datos ya ordenados descendentemente
            });
        }

        setPeriods([...semanas].reverse());
    };
// FIN ORDEN DESCENDENTE

/////////////////////////
    
 
 /*   const procesarYAgruparPeriodos = (attendances: any[], startStr: string, endStr: string) => {
        if (!startStr) return;
        const fechaInicioTotal = new Date(startStr);
        
        const semanas: PeriodoAsistencia[] = [];
        const nombresPeriodos = ['2 Semanas Atrás', '1 Semana Atrás', 'Período Actual'];

        for (let i = 0; i < 3; i++) {
            const inicioSemana = new Date(fechaInicioTotal);
            inicioSemana.setDate(fechaInicioTotal.getDate() + (i * 7));
            inicioSemana.setHours(0, 0, 0, 0);

            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            finSemana.setHours(23, 59, 59, 999);

            const datosSemana = attendances.filter(attendance => {
                if (!attendance.recDate) return false;
                const fechaAsistencia = new Date(attendance.recDate + 'T00:00:00');
                return fechaAsistencia >= inicioSemana && fechaAsistencia <= finSemana;
            });

            semanas.push({
                id: i,
                label: nombresPeriodos[i],
                startDate: inicioSemana,
                endDate: finSemana,
                data: datosSemana
            });
        }

        setPeriods([...semanas].reverse());
    };
*/


    const formatTime = (rowData: any, field: string) => {
        if (!rowData[field]) return <span className="text-400">-:-</span>;
        return <span>{rowData[field].substring(0, 5)}</span>;
    };

    const buildHeaderTemplate = (period: PeriodoAsistencia) => {
        const opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
        const inicioFormateado = period.startDate.toLocaleDateString('es-MX', opciones);
        const finFormateado = period.endDate.toLocaleDateString('es-MX', opciones);
        return (
            <div className="flex justify-content-between align-items-center w-full pr-3">
                <span className="font-semibold text-sm">{period.label}</span>
                <span className="text-xs text-500 font-normal">({inicioFormateado} al {finFormateado})</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center min-h-screen">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
            </div>
        );
    }

    return (
        <div className="surface-card p-2 md:p-4 shadow-2 border-round-xl m-2">
            <div className="flex align-items-center mb-3">
                <i className="pi pi-calendar-clock text-blue-600 text-2xl mr-2"></i>
                <h2 className="text-xl font-bold text-800 m-0">Mis Asistencias Semanales</h2>
            </div>
            
            <Accordion activeIndex={0}>
                {periods.map((period) => (
                    <AccordionTab key={period.id} header={buildHeaderTemplate(period)}>
                        <DataTable 
                            value={period.data} 
                            size="small" 
                            className="text-xs"
                            emptyMessage="No se encontraron registros de asistencia para esta semana."
                            stripedRows
                        >
                            <Column 
                                header="Día / Fecha" 
                                style={{ width: '15%' }}
                                body={(row) => {
                                    const fechaObj = new Date(row.recDate + 'T00:00:00');
                                    return <span className="capitalize">{fechaObj.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit' })}</span>;
                                }}
                            />
                            <Column field="recType" header="Tipo" style={{ width: '10%' }} />
                            <Column field="shift" header="Turno" style={{ width: '8%' }} bodyStyle={{ textAlign: 'center' }} />
                            <Column header="Entrada 1" body={(row) => formatTime(row, 'checkIn1')} bodyStyle={{ textAlign: 'center' }} />
                            <Column header="Salida 1" body={(row) => formatTime(row, 'checkOut1')} bodyStyle={{ textAlign: 'center' }} />
                            <Column header="Entrada 2" body={(row) => formatTime(row, 'checkIn2')} bodyStyle={{ textAlign: 'center' }} />
                            <Column header="Salida 2" body={(row) => formatTime(row, 'checkOut2')} bodyStyle={{ textAlign: 'center' }} />
                            
                            {/* 🟢 NUEVA COLUMNA: Horas Ordinarias (Por consistencia visual) */}
                            <Column 
                                header="Hrs Regular" 
                                bodyStyle={{ textAlign: 'center' }} 
                                body={(row) => <span>{row.dailyHours ? Number(row.dailyHours).toFixed(2) : '0.00'}</span>} 
                            />

                            {/* 🟢 NUEVA COLUMNA: Horas Extra (dailyHoursOVT renderizado como NUMERIC(5,2)) */}
                            <Column 
                                header="Hrs Extra (OVT)" 
                                bodyStyle={{ textAlign: 'center', fontWeight: 'bold' }} 
                                className="text-green-600"
                                body={(row) => <span>{row.dailyHoursOVT ? Number(row.dailyHoursOVT).toFixed(2) : '0.00'}</span>} 
                            />

                            {/* 🟢 NUEVA COLUMNA: ID de Incidencia (Muestra el string plano o un guion) */}
                            <Column 
                                field="incidentId" 
                                header="Incidencia" 
                                bodyStyle={{ textAlign: 'center' }} 
                                body={(row) => row.incidentId ? <span className="p-badge p-badge-warning text-xs font-semibold">{row.incidentId}</span> : <span className="text-400">-</span>}
                            />
                        </DataTable>
                    </AccordionTab>
                ))}
            </Accordion>
        </div>
    );
}

