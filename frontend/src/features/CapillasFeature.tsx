import React, { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, Users, CheckCircle2 } from 'lucide-react';
import type { Capilla } from '../domain/types';
import { apiService } from '../services/api';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';

export const CapillasFeature: React.FC = () => {
  const [capillas, setCapillas] = useState<Capilla[]>([]);

  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const fetchCapillas = async () => {
    try {
      const data = await apiService.getCapillas();
      setCapillas(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCapillas();
  }, []);

  const handleToggleEstadoCapilla = (c: Capilla) => {
    const nuevoEstado = c.estado === 'INACTIVO' ? 'ACTIVO' : 'INACTIVO';
    triggerAlert(nuevoEstado === 'ACTIVO' ? 'activo' : 'inactivo', `CAPILLA CAMBIADA A ESTADO ${nuevoEstado}`);
    fetchCapillas();
  };

  return (
    <div className="space-y-4">
      {/* Portals */}
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      <FeatureHeader
        title="CAPILLAS BAJO LA JURISDICCIÓN DE LA PARROQUIA SANTÍSIMA TRINIDAD"
        description="Red centralizada de capillas en la ciudad de La Paz, Bolivia. Todas las partidas están unificadas."
        icon={Building2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capillas.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    c.es_sede_principal
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {c.es_sede_principal ? 'SEDE PRINCIPAL' : 'CAPILLA DEPENDIENTE'}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {c.estado}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase mt-3">
                {c.nombre}
              </h3>

              <div className="mt-3 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{c.direccion || 'DIRECCIÓN NO ESPECIFICADA'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>TELÉFONO: {c.telefono || '74185852'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>CAPACIDAD: {c.capacidad_personas} PERSONAS</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {c.coordenadas_gps && (
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  GPS: {c.coordenadas_gps}
                </span>
              )}

              <button
                onClick={() => handleToggleEstadoCapilla(c)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-slate-300 text-[10px] font-bold uppercase transition-all cursor-pointer ml-auto"
              >
                CAMBIAR ESTADO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
