import React, { useState } from 'react';
import { Calendar, Plus, Clock, MapPin, User } from 'lucide-react';
import type { LiturgicalEvent } from '../domain/types';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';

export const EventosFeature: React.FC = () => {
  const [eventos, setEventos] = useState<LiturgicalEvent[]>([
    {
      id: '1',
      tipo: 'MISA_SALUD',
      titulo: 'MISA DE SALUD FAMILIA MAMANI',
      intencion_de: 'FAMILIA MAMANI PEREZ',
      capilla_nombre: 'SANTÍSIMA TRINIDAD (SEDE)',
      fecha_hora: '2026-08-30 08:00 AM',
      sacerdote_nombre: 'PADRE ALBERTO QUISPE',
      estado: 'PENDIENTE',
    },
    {
      id: '2',
      tipo: 'MISA_DIFUNTO',
      titulo: 'MISA RECORDATORIA 1 AÑO',
      intencion_de: 'JUAN CARLOS FLORES',
      capilla_nombre: 'SANTUARIO JESÚS DEL GRAN PODER',
      fecha_hora: '2026-08-30 10:00 AM',
      sacerdote_nombre: 'PADRE ALBERTO QUISPE',
      estado: 'PENDIENTE',
    },
    {
      id: '3',
      tipo: 'BAUTISMO_COLECTIVO',
      tipo_sacramento: 'BAUTISMO',
      titulo: 'BAUTISMOS COMUNITARIOS',
      intencion_de: 'GRUPO DE 8 NIÑOS BAUTIZANDOS',
      capilla_nombre: 'SANTA RITA',
      fecha_hora: '2026-08-31 11:00 AM',
      sacerdote_nombre: 'PADRE ALBERTO QUISPE',
      estado: 'PENDIENTE',
    } as any,
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const [formData, setFormData] = useState<Partial<LiturgicalEvent>>({
    tipo: 'MISA_SALUD',
    titulo: '',
    intencion_de: '',
    capilla_nombre: 'SANTÍSIMA TRINIDAD (SEDE)',
    fecha_hora: new Date().toISOString().split('T')[0] + ' 08:00 AM',
    sacerdote_nombre: 'PADRE ALBERTO QUISPE',
  });

  const handleCreateEvento = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvt: LiturgicalEvent = {
      id: String(Date.now()),
      tipo: formData.tipo as any,
      titulo: formData.titulo?.toUpperCase() || 'INTENCIÓN DE MISA',
      intencion_de: formData.intencion_de?.toUpperCase() || 'FAMILIA SOLICITANTE',
      capilla_nombre: formData.capilla_nombre || 'SANTÍSIMA TRINIDAD (SEDE)',
      fecha_hora: formData.fecha_hora || '',
      sacerdote_nombre: formData.sacerdote_nombre || 'PADRE ALBERTO QUISPE',
      estado: 'PENDIENTE',
    };
    setEventos([...eventos, newEvt]);
    triggerAlert('creado', 'INTENCIÓN LITÚRGICA REGISTRADA');
    setIsCreateOpen(false);
    setFormData({ tipo: 'MISA_SALUD', titulo: '', intencion_de: '', capilla_nombre: 'SANTÍSIMA TRINIDAD (SEDE)' });
  };

  const handleToggleEstado = (evt: LiturgicalEvent) => {
    const nextEst = evt.estado === 'PENDIENTE' ? 'CELEBRADA' : 'PENDIENTE';
    setEventos(eventos.map((e) => (e.id === evt.id ? { ...e, estado: nextEst } : e)));
    triggerAlert(nextEst === 'CELEBRADA' ? 'activo' : 'inactivo', `EVENTO CAMBIADO A ${nextEst}`);
  };

  return (
    <div className="space-y-4">
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      <FeatureHeader
        title="AGENDA LITÚRGICA E INTENCIONES DE MISA"
        description="Programación de celebraciones, misas comunitarias e intenciones por capilla."
        icon={Calendar}
        action={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>REGISTRAR INTENCIÓN</span>
          </button>
        }
      />

      {/* Grid Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventos.map((e) => (
          <div
            key={e.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px] uppercase">
                  {e.tipo.replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  e.estado === 'CELEBRADA' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950' : 'bg-amber-100 text-amber-800 dark:bg-amber-950'
                }`}>
                  {e.estado}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase mt-2">
                {e.titulo}
              </h3>

              <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <p className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>INTENCIÓN: {e.intencion_de}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>CAPILLA: {e.capilla_nombre}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>{e.fecha_hora}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleToggleEstado(e)}
                className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-slate-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                {e.estado === 'PENDIENTE' ? 'Marcar Celebrada' : 'Marcar Pendiente'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Registrar Intención */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Registrar Intención Litúrgica de Misa
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateEvento} className="space-y-3 text-xs font-semibold uppercase">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">TIPO DE CELEBRACIÓN *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="MISA_SALUD">MISA DE SALUD / ACCIÓN DE GRACIAS</option>
                  <option value="MISA_DIFUNTO">MISA RECORDATORIA / DIFUNTOS</option>
                  <option value="BAUTISMO_COLECTIVO">BAUTISMOS COMUNITARIOS</option>
                  <option value="CONFIRMACION">CONFIRMACIÓN</option>
                  <option value="MATRIMONIO">MATRIMONIO</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">TÍTULO O MOTIVO DE LA MISA *</label>
                <input
                  type="text"
                  required
                  placeholder="EJEMPLO: MISA DE SALUD POR LA SALUD DE JUAN"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value.toUpperCase() })}
                  className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">INTENCIÓN A NOMBRE DE (SOLICITANTE)</label>
                <input
                  type="text"
                  required
                  placeholder="EJEMPLO: FAMILIA MAMANI PEREZ"
                  value={formData.intencion_de}
                  onChange={(e) => setFormData({ ...formData, intencion_de: e.target.value.toUpperCase() })}
                  className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  GUARDAR INTENCIÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
