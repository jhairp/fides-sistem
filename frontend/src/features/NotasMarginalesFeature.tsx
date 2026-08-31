import React, { useState, useEffect } from 'react';
import { FileText, Plus } from 'lucide-react';
import type { NotaMarginal } from '../domain/types';
import { apiService } from '../services/api';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';

export const NotasMarginalesFeature: React.FC = () => {
  const [notas, setNotas] = useState<NotaMarginal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const [formData, setFormData] = useState<NotaMarginal>({
    tipo_anotacion: 'MATRIMONIO',
    descripcion: '',
    fecha_decreto: new Date().toISOString().split('T')[0],
    autorizado_por: 'PÁRROCO ALBERTO QUISPE',
    parroquia_externa_nombre: 'PARROQUIA SAN PEDRO',
    ciudad_externa: 'LA PAZ',
  });

  const fetchNotas = async () => {
    setLoading(true);
    try {
      const data = await apiService.getNotasMarginales();
      setNotas(data);
    } catch (err) {
      console.error('Error al consultar notas marginales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  const handleCreateNota = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createNotaMarginal(formData);
      triggerAlert('creado', 'NOTA MARGINAL EMITIDA Y VINCULADA');
      setIsCreateOpen(false);
      fetchNotas();
      setFormData({
        tipo_anotacion: 'MATRIMONIO',
        descripcion: '',
        fecha_decreto: new Date().toISOString().split('T')[0],
        autorizado_por: 'PÁRROCO ALBERTO QUISPE',
        parroquia_externa_nombre: 'PARROQUIA SAN PEDRO',
        ciudad_externa: 'LA PAZ',
      });
    } catch (err) {
      triggerAlert('error', 'ERROR AL EMITIR NOTA MARGINAL');
    }
  };

  const handleToggleEstadoNota = (_nota: NotaMarginal) => {
    triggerAlert('inactivo', 'NOTA MARGINAL DESACTIVADA (SOFT DELETE)');
    fetchNotas();
  };

  return (
    <div className="space-y-4">
      {/* Portals */}
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      <FeatureHeader
        title="GESTIÓN DE NOTAS MARGINALES CANÓNICAS"
        description="Vinculación de notas de matrimonio, confirmación y decretos canónicos (locales o parroquia externa)."
        icon={FileText}
        action={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>EMITIR NOTA MARGINAL</span>
          </button>
        }
      />

      {/* Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            NOTAS MARGINALES REGISTRADAS ({notas.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase animate-pulse">
            Cargando notas marginales...
          </div>
        ) : notas.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            No se encontraron notas marginales registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/80 dark:bg-slate-800/80 text-blue-900 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">TIPO DE ANOTACIÓN</th>
                  <th className="p-3">DESCRIPCIÓN DECRETO</th>
                  <th className="p-3">PARROQUIA / ORIGEN</th>
                  <th className="p-3">AUTORIZADO POR</th>
                  <th className="p-3 rounded-r-xl text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200 uppercase">
                {notas.map((n, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-blue-700 dark:text-blue-400">
                      {n.tipo_anotacion}
                    </td>
                    <td className="p-3 max-w-xs truncate">{n.descripcion}</td>
                    <td className="p-3">{n.parroquia_externa_nombre || 'SANTÍSIMA TRINIDAD (LOCAL)'}</td>
                    <td className="p-3">{n.autorizado_por_nombre || n.autorizado_por}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleEstadoNota(n)}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-600 hover:text-white text-orange-700 dark:text-orange-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
                      >
                        DESACTIVAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Emitir Nota Marginal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                EMISIÓN DE NOTA MARGINAL CANÓNICA
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateNota} className="space-y-3 text-xs uppercase font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">TIPO DE ANOTACIÓN *</label>
                  <select
                    value={formData.tipo_anotacion}
                    onChange={(e) => setFormData({ ...formData, tipo_anotacion: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase font-bold cursor-pointer"
                  >
                    <option value="MATRIMONIO">MATRIMONIO</option>
                    <option value="CONFIRMACION">CONFIRMACIÓN</option>
                    <option value="ORDEN_SACERDOTAL">ORDEN SACERDOTAL</option>
                    <option value="RECTIFICACION">RECTIFICACIÓN</option>
                    <option value="NULIDAD">NULIDAD</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">FECHA DE DECRETO</label>
                  <input
                    type="date"
                    value={formData.fecha_decreto}
                    onChange={(e) => setFormData({ ...formData, fecha_decreto: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">DESCRIPCIÓN DEL DECRETO O ANOTACIÓN *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })}
                  placeholder="EJEMPLO: CONTRAJO MATRIMONIO CON MARÍA PEREZ EL 12 DE MAYO DE 2024..."
                  className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">PARROQUIA EXTERNA (SI APLICA)</label>
                  <input
                    type="text"
                    value={formData.parroquia_externa_nombre || ''}
                    onChange={(e) => setFormData({ ...formData, parroquia_externa_nombre: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">CIUDAD EXTERNA</label>
                  <input
                    type="text"
                    value={formData.ciudad_externa || ''}
                    onChange={(e) => setFormData({ ...formData, ciudad_externa: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  EMITIR NOTA MARGINAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
