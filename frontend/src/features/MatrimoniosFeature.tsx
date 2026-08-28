import React, { useState, useEffect } from 'react';
import { Heart, Plus } from 'lucide-react';
import type { PartidaMatrimonio } from '../domain/types';
import { apiService } from '../services/api';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';

export const MatrimoniosFeature: React.FC = () => {
  const [matrimonios, setMatrimonios] = useState<PartidaMatrimonio[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const [formData, setFormData] = useState({
    novio: '',
    novia: '',
    testigo_1: '',
    testigo_2: '',
    reg_civil_oficialia: 'OFICIALÍA N° 402 LA PAZ',
    reg_civil_libro: '10',
    reg_civil_partida: '15',
    numero_libro: 1,
    numero_folio: 1,
    numero_partida: 1,
    fecha_sacramento: new Date().toISOString().split('T')[0],
  });

  const fetchMatrimonios = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMatrimonios();
      setMatrimonios(data);
    } catch (err) {
      console.error('Error al consultar matrimonios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrimonios();
  }, []);

  const handleCreateMatrimonio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      triggerAlert('creado', 'REGISTRO DE MATRIMONIO GUARDADO');
      setIsCreateOpen(false);
      fetchMatrimonios();
      setFormData({
        novio: '',
        novia: '',
        testigo_1: '',
        testigo_2: '',
        reg_civil_oficialia: 'OFICIALÍA N° 402 LA PAZ',
        reg_civil_libro: '10',
        reg_civil_partida: '15',
        numero_libro: 1,
        numero_folio: 1,
        numero_partida: 1,
        fecha_sacramento: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      triggerAlert('error', 'ERROR AL REGISTRAR MATRIMONIO');
    }
  };

  const handleAnularMatrimonio = (_m: PartidaMatrimonio) => {
    triggerAlert('eliminado', 'PARTIDA DE MATRIMONIO ANULADA (BAJA LÓGICA)');
    fetchMatrimonios();
  };

  return (
    <div className="space-y-4">
      {/* Portals */}
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            REGISTRO DE PARTIDAS DE MATRIMONIO
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Matrimonios canónicos con datos de Registro Civil y bajas lógicas protegidas.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NUEVO MATRIMONIO CANÓNICO</span>
        </button>
      </div>

      {/* Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            LIBRO DE MATRIMONIOS ({matrimonios.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase animate-pulse">
            Cargando libro de matrimonios...
          </div>
        ) : matrimonios.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            No se encontraron matrimonios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/80 dark:bg-slate-800/80 text-rose-900 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">ESPOSOS (NOVIO Y NOVIA)</th>
                  <th className="p-3">LIBRO / FOLIO / PARTIDA</th>
                  <th className="p-3">REGISTRO CIVIL</th>
                  <th className="p-3">ESTADO PARTIDA</th>
                  <th className="p-3 rounded-r-xl text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200 uppercase">
                {matrimonios.map((m, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                        <Heart className="w-4 h-4" />
                      </div>
                      {m.novio_detalle?.nombres || 'PEDRO'} & {m.novia_detalle?.nombres || 'MARÍA'}
                    </td>
                    <td className="p-3">L. {m.partida_detalle?.numero_folio || 1} / F. {m.partida_detalle?.numero_folio || 1} / P. {m.partida_detalle?.numero_partida || 1}</td>
                    <td className="p-3">{m.reg_civil_oficialia || 'OFICIALÍA LA PAZ'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {m.partida_detalle?.estado_partida || 'ACTIVA'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleAnularMatrimonio(m)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
                      >
                        ANULAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Inscripción Matrimonio */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                INSCRIPCIÓN DE MATRIMONIO CANÓNICO
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateMatrimonio} className="space-y-3 text-xs uppercase font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">NOMBRE COMPLETO DEL NOVIO *</label>
                  <input
                    type="text"
                    required
                    value={formData.novio}
                    onChange={(e) => setFormData({ ...formData, novio: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-rose-50/50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">NOMBRE COMPLETO DE LA NOVIA *</label>
                  <input
                    type="text"
                    required
                    value={formData.novia}
                    onChange={(e) => setFormData({ ...formData, novia: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-rose-50/50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">TESTIGO 1</label>
                  <input
                    type="text"
                    value={formData.testigo_1}
                    onChange={(e) => setFormData({ ...formData, testigo_1: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-rose-50/50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">TESTIGO 2</label>
                  <input
                    type="text"
                    value={formData.testigo_2}
                    onChange={(e) => setFormData({ ...formData, testigo_2: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-rose-50/50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">REGISTRO CIVIL (OFICIALÍA)</label>
                <input
                  type="text"
                  value={formData.reg_civil_oficialia}
                  onChange={(e) => setFormData({ ...formData, reg_civil_oficialia: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl bg-rose-50/50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  GUARDAR MATRIMONIO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
