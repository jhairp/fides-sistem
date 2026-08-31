import React from 'react';
import { ClipboardList, User, Clock } from 'lucide-react';
import type { AuditLog } from '../domain/types';
import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureTable } from '../components/common/FeatureTable';
import { FeatureSearchFilters } from '../components/common/FeatureSearchFilters';
import { useState } from 'react';

export const AuditoriaFeature: React.FC = () => {
  const logs: AuditLog[] = [
    {
      id: '1',
      usuario_nombre: 'SUPERADMIN',
      accion: 'CREACION',
      modelo_afectado: 'PERSONA',
      detalle_json: '{"nombres":"JUAN CARLOS","apellido_paterno":"MAMANI","apellido_materno":"PEREZ"}',
      fecha_hora: '2026-08-27 14:32:10',
    },
    {
      id: '2',
      usuario_nombre: 'SUPERADMIN',
      accion: 'EDICION',
      modelo_afectado: 'PARTIDA BAUTISMO',
      detalle_json: '{"campo":"estado_partida","anterior":"ACTIVA","nuevo":"ANULADA"}',
      fecha_hora: '2026-08-27 15:10:45',
    },
    {
      id: '3',
      usuario_nombre: 'SECRETARIAMARIA',
      accion: 'CREACION',
      modelo_afectado: 'NOTA MARGINAL',
      detalle_json: '{"tipo_anotacion":"MATRIMONIO","descripcion":"CONTRAJO MATRIMONIO..."}',
      fecha_hora: '2026-08-27 16:05:22',
    },
    {
      id: '4',
      usuario_nombre: 'SUPERADMIN',
      accion: 'ANULACION',
      modelo_afectado: 'PARTIDA MATRIMONIO',
      detalle_json: '{"campo":"estado_partida","anterior":"ACTIVA","nuevo":"ANULADA","motivo":"NULIDAD ECLESIÁSTICA"}',
      fecha_hora: '2026-08-27 17:22:01',
    },
    {
      id: '5',
      usuario_nombre: 'PADREALBERTO',
      accion: 'LECTURA',
      modelo_afectado: 'CERTIFICADO BAUTISMO',
      detalle_json: '{"codigo":"CERT-2026-8901","accion":"VISTA PREVIA PDF"}',
      fecha_hora: '2026-08-27 18:00:33',
    },
  ];

  const accionColor: Record<string, string> = {
    CREACION: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    EDICION: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    ANULACION: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    LECTURA: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  };

  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      header: 'Fecha y Hora',
      render: (log: AuditLog) => (
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
          <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          {log.fecha_hora}
        </span>
      ),
    },
    {
      header: 'Usuario',
      render: (log: AuditLog) => (
        <span className="font-bold flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          {log.usuario_nombre}
        </span>
      ),
    },
    {
      header: 'Acción',
      render: (log: AuditLog) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${accionColor[log.accion] || ''}`}>
          {log.accion}
        </span>
      ),
    },
    {
      header: 'Modelo Afectado',
      render: (log: AuditLog) => (
        <span className="font-semibold uppercase">{log.modelo_afectado}</span>
      ),
    },
    {
      header: 'Detalle (JSONB)',
      render: (log: AuditLog) => (
        <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 block max-w-xs truncate">
          {log.detalle_json}
        </code>
      ),
    },
  ];

  // Client-side search filtering
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.usuario_nombre.toLowerCase().includes(term) ||
      log.accion.toLowerCase().includes(term) ||
      log.modelo_afectado.toLowerCase().includes(term) ||
      log.detalle_json.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <FeatureHeader
        title="REGISTRO DE AUDITORÍA E HISTORIAL DE CAMBIOS"
        description="Panel inalterable de actividades registradas en JSONB. Cada operación de creación, edición o anulación queda documentada."
        icon={ClipboardList}
      />

      {/* Reusable Search Filters */}
      <FeatureSearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="BUSCAR POR USUARIO, ACCIÓN O DETALLES..."
      />

      {/* Reusable Data Table */}
      <FeatureTable
        title="Bitácora de Eventos"
        columns={columns}
        data={filteredLogs}
        loading={false}
        emptyMessage="No se registraron logs de auditoría."
        defaultPageSize={20}
      />
    </div>
  );
};
