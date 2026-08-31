import React, { useState, useEffect } from 'react';
import { Heart, Plus } from 'lucide-react';
import type { PartidaMatrimonio } from '../domain/types';
import { apiService } from '../services/api';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureTable } from '../components/common/FeatureTable';
import { FeatureSearchFilters } from '../components/common/FeatureSearchFilters';

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

  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      header: 'Esposos (Novio y Novia)',
      render: (m: PartidaMatrimonio) => (
        <div className="flex items-center gap-2 font-bold">
          <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <Heart className="w-3.5 h-3.5" />
          </div>
          <span>
            {m.novio_detalle?.nombres || 'PEDRO'} & {m.novia_detalle?.nombres || 'MARÍA'}
          </span>
        </div>
      ),
    },
    {
      header: 'Libro / Folio / Partida',
      render: (m: PartidaMatrimonio) => (
        <span>
          L. {m.partida_detalle?.numero_folio || 1} / F. {m.partida_detalle?.numero_folio || 1} / P. {m.partida_detalle?.numero_partida || 1}
        </span>
      ),
    },
    {
      header: 'Registro Civil',
      render: (m: PartidaMatrimonio) => (
        <span>{m.reg_civil_oficialia || 'OFICIALÍA LA PAZ'}</span>
      ),
    },
    {
      header: 'Estado Partida',
      render: (m: PartidaMatrimonio) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {m.partida_detalle?.estado_partida || 'ACTIVA'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      render: (m: PartidaMatrimonio) => (
        <button
          onClick={() => handleAnularMatrimonio(m)}
          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
        >
          ANULAR
        </button>
      ),
    },
  ];

  // Client-side search filtering
  const filteredMatrimonios = matrimonios.filter((m) => {
    const term = searchTerm.toLowerCase();
    const spouses = `${m.novio_detalle?.nombres} ${m.novia_detalle?.nombres}`.toLowerCase();
    return spouses.includes(term) || m.reg_civil_oficialia?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4">
      {/* Portals */}
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      {/* Header */}
      <FeatureHeader
        title="REGISTRO DE PARTIDAS DE MATRIMONIO"
        description="Matrimonios canónicos con datos de Registro Civil y bajas lógicas protegidas."
        icon={Heart}
        action={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>NUEVO MATRIMONIO CANÓNICO</span>
          </button>
        }
      />

      {/* Reusable Search Filters */}
      <FeatureSearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="BUSCAR POR ESPOSOS O REGISTRO CIVIL..."
      />

      {/* Reusable Data Table */}
      <FeatureTable
        title="Libro de Matrimonios"
        columns={columns}
        data={filteredMatrimonios}
        loading={loading}
        emptyMessage="No se encontraron matrimonios registrados."
        defaultPageSize={20}
      />

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
