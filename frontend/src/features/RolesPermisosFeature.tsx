import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { SystemRole } from '../domain/types';
import { FeatureHeader } from '../components/common/FeatureHeader';

export const RolesPermisosFeature: React.FC = () => {
  const roles: (SystemRole & { permisos: string[] })[] = [
    {
      id: '1',
      name: 'SUPERADMIN',
      description: 'Control total de la plataforma, multidepartamentos, capillas y asignación de usuarios.',
      permissions_count: 32,
      permisos: [
        'ACCESO TOTAL A CONFIGURACIÓN GENERAL Y BASE DE DATOS',
        'ASIGNACIÓN Y GESTIÓN DE ROLES DE USUARIOS',
        'REINICIO Y RESETEO DE TABLAS CON SEED DATA',
        'AUDITORÍA COMPLETA DE ACTIVIDADES (JSONB)',
      ],
    },
    {
      id: '2',
      name: 'ADMINISTRADOR',
      description: 'Gestión administrativa parroquial, libros sacramentales y reportes globales.',
      permissions_count: 24,
      permisos: [
        'CREACIÓN Y APERTURA DE LIBROS SACRAMENTALES',
        'GESTIÓN DE CAPILLAS DEPENDIENTES Y CAPACIDAD',
        'EMISIÓN DE REPORTES Y ESTADÍSTICAS PARROQUIALES',
      ],
    },
    {
      id: '3',
      name: 'PARROCO',
      description: 'Autoridad canónica con permisos de firma, decretos y notas marginales.',
      permissions_count: 20,
      permisos: [
        'FIRMA CANÓNICA DE PARTIDAS Y CERTIFICADOS',
        'EMISIÓN DE NOTAS MARGINALES Y DECRETOS',
        'APROBACIÓN DE RECTIFICACIONES Y NULIDADES',
      ],
    },
    {
      id: '4',
      name: 'RECTOR',
      description: 'Gestión de actos solemnes, ceremonias y celebración de sacramentos.',
      permissions_count: 18,
      permisos: [
        'INSCRIPCIÓN DE PARTIDAS DE BAUTISMO Y MATRIMONIO',
        'ADMINISTRACIÓN DE AGENDA LITÚRGICA',
      ],
    },
    {
      id: '5',
      name: 'SECRETARIO',
      description: 'Registro de solicitudes, atención en despacho y escaneo OCR de libros.',
      permissions_count: 14,
      permisos: [
        'INSCRIPCIÓN Y BÚSQUEDA DE PERSONAS',
        'CARGA DE ESCANEOS E INTERPRETACIONAL OCR CON IA',
        'EMISIÓN DE CERTIFICADOS IMPRESOS CON QR',
      ],
    },
    {
      id: '6',
      name: 'SACERDOTE',
      description: 'Celebración de sacramentos, consulta de intenciones y agenda parroquial.',
      permissions_count: 10,
      permisos: [
        'CONSULTA DE AGENDA DE MISAS E INTENCIONES',
        'VERIFICACIÓN DE REQUISITOS SACRAMENTALES',
      ],
    },
    {
      id: '7',
      name: 'FELIGRES',
      description: 'Portal público para solicitud de intenciones de misa y horarios.',
      permissions_count: 4,
      permisos: [
        'SOLICITUD DE INTENCIONES EN LÍNEA',
        'CONSULTA DE HORARIOS DE CAPILLAS',
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <FeatureHeader
        title="MATRIZ DE ROLES Y GRUPOS DE PERMISOS"
        description="Estructura jerárquica de los 7 Grupos de Permisos nativos de Django en FidesSystem."
        icon={ShieldCheck}
      />

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">
                  {r.name}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {r.permissions_count} Permisos Activos
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2">
                {r.description}
              </p>

              <div className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Permisos Clave:</p>
                {r.permisos.map((p, i) => (
                  <div key={i} className="flex items-start space-x-1.5 text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                GRUPO ACTIVO DJANGO
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
