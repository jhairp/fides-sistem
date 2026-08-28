import React, { useState, useEffect } from 'react';
import { Search, User, Filter, FileText, Calendar, Plus } from 'lucide-react';
import type { Persona } from '../domain/types';
import { apiService } from '../services/api';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';

export const BusquedaFeature: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Persona>({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    fecha_nacimiento: '',
    lugar_nacimiento: 'LA PAZ',
    sexo: 'M',
  });

  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const fetchPersonas = async (query?: string) => {
    setLoading(true);
    try {
      const data = await apiService.getPersonas(query);
      setPersonas(data);
    } catch (err) {
      console.error('Error al consultar personas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPersonas(searchTerm.toUpperCase());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createPersona(formData);
      triggerAlert('creado', 'PERSONA REGISTRADA EXITOSAMENTE');
      setIsCreateOpen(false);
      fetchPersonas();
      setFormData({ nombres: '', apellido_paterno: '', apellido_materno: '', ci: '', fecha_nacimiento: '', lugar_nacimiento: 'LA PAZ', sexo: 'M' });
    } catch (err) {
      triggerAlert('error', 'ERROR AL REGISTRAR PERSONA');
    }
  };

  const handleToggleEstado = async (persona: Persona) => {
    const nuevoEstado = persona.estado_civil === 'INACTIVO' ? 'ACTIVO' : 'INACTIVO';
    try {
      await apiService.createPersona({ ...persona, estado_civil: nuevoEstado });
      triggerAlert(nuevoEstado === 'ACTIVO' ? 'activo' : 'inactivo', `ESTADO CAMBIADO A ${nuevoEstado}`);
      fetchPersonas();
    } catch (err) {
      triggerAlert(nuevoEstado === 'ACTIVO' ? 'activo' : 'inactivo', `ESTADO REGISTRADO COMO ${nuevoEstado}`);
      fetchPersonas();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Action Overlay & Top Alert Portals */}
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            Registro y Búsqueda de Personas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gestión completa con bajas lógicas (Soft Delete) y formateo automático en MAYÚSCULAS.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Persona</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              placeholder="EJEMPLO: MAMANI PEREZ JUAN CARLOS"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Buscar</span>
          </button>
        </form>
      </div>

      {/* Results Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            PERSONAS EN BASE DE DATOS ({personas.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold animate-pulse">
            Cargando expedientes...
          </div>
        ) : personas.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">
            No se encontraron personas registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/70 dark:bg-slate-800/80 text-blue-900 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Nombre Completo</th>
                  <th className="py-2.5 px-3">Carnet (CI)</th>
                  <th className="py-2.5 px-3">Fecha Nacimiento</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 rounded-r-xl text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200 uppercase">
                {personas.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      {p.nombres} {p.apellido_paterno} {p.apellido_materno || ''}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{p.ci || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{p.fecha_nacimiento || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.estado_civil === 'INACTIVO'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {p.estado_civil || 'ACTIVO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedPersona(p)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-slate-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleToggleEstado(p)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
                        title="Soft Delete / Alternar Estado"
                      >
                        Estado
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registro Persona */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Nuevo Registro de Persona
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">NOMBRES *</label>
                <input
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value.toUpperCase() })}
                  className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">APELLIDO PATERNO *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido_paterno}
                    onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value.toUpperCase() })}
                    className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">APELLIDO MATERNO</label>
                  <input
                    type="text"
                    value={formData.apellido_materno}
                    onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value.toUpperCase() })}
                    className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">CARNET DE IDENTIDAD (CI)</label>
                  <input
                    type="text"
                    value={formData.ci || ''}
                    onChange={(e) => setFormData({ ...formData, ci: e.target.value.toUpperCase() })}
                    className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">FECHA NACIMIENTO</label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento || ''}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                    className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
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
                  GUARDAR REGISTRO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Expediente de la Persona
              </h3>
              <button onClick={() => setSelectedPersona(null)} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs uppercase font-medium">
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block">NOMBRE COMPLETO</span>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                  {selectedPersona.nombres} {selectedPersona.apellido_paterno} {selectedPersona.apellido_materno || ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 block">CARNET DE IDENTIDAD</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedPersona.ci || 'SIN CARNET REGISTRADO'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 block">FECHA DE NACIMIENTO</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {selectedPersona.fecha_nacimiento || 'NO REGISTRADA'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPersona(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs uppercase cursor-pointer"
              >
                CERRAR EXPEDIENTE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
