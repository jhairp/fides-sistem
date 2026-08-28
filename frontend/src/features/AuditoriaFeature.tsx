import React from 'react';
import { ClipboardList, User, Clock } from 'lucide-react';
import type { AuditLog } from '../domain/types';

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Registro de Auditoría e Historial de Cambios
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Panel inalterable de actividades registradas en JSONB. Cada operación de creación, edición o anulación queda documentada.
        </p>
      </div>

      {/* Timeline Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blue-50/70 dark:bg-slate-800/80 text-blue-900 dark:text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">Fecha y Hora</th>
                <th className="py-2.5 px-3">Usuario</th>
                <th className="py-2.5 px-3">Acción</th>
                <th className="py-2.5 px-3">Modelo Afectado</th>
                <th className="py-2.5 px-3 rounded-r-xl">Detalle (JSONB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    {log.fecha_hora}
                  </td>
                  <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    {log.usuario_nombre}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${accionColor[log.accion] || ''}`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold uppercase">{log.modelo_afectado}</td>
                  <td className="py-2.5 px-3">
                    <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 block max-w-xs truncate">
                      {log.detalle_json}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
