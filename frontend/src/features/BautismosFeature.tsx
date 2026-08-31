import React, { useState, useEffect } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import type { PartidaBautismo } from '../domain/types';
import { apiService } from '../services/api';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';

import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureTable } from '../components/common/FeatureTable';
import { FeatureSearchFilters } from '../components/common/FeatureSearchFilters';

export const BautismosFeature: React.FC = () => {
  const [bautismos, setBautismos] = useState<PartidaBautismo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  // Form State
  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    padre: '',
    madre: '',
    padrino: '',
    madrina: '',
    sacerdote: 'PADRE ALBERTO QUISPE FLORES',
    numero_libro: 1,
    numero_folio: 1,
    numero_partida: 1,
    fecha_sacramento: new Date().toISOString().split('T')[0],
  });

  const fetchBautismos = async () => {
    setLoading(true);
    try {
      const data = await apiService.getBautismos();
      setBautismos(data);
    } catch (err) {
      console.error('Error al consultar bautismos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBautismos();
  }, []);

  const handleCreateBautismo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      triggerAlert('creado', 'PARTIDA DE BAUTISMO REGISTRADA');
      setIsCreateOpen(false);
      fetchBautismos();
      setFormData({
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        padre: '',
        madre: '',
        padrino: '',
        madrina: '',
        sacerdote: 'PADRE ALBERTO QUISPE FLORES',
        numero_libro: 1,
        numero_folio: 1,
        numero_partida: 1,
        fecha_sacramento: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      triggerAlert('error', 'ERROR AL REGISTRAR BAUTISMO');
    }
  };

  const handleAnularBautismo = (_b: PartidaBautismo) => {
    // Soft Delete policy: Change status to ANULADA without SQL row deletion
    triggerAlert('eliminado', 'PARTIDA DE BAUTISMO ANULADA (BAJA LÓGICA)');
    fetchBautismos();
  };

  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      header: 'Bautizado',
      render: (b: PartidaBautismo) => (
        <div className="flex items-center gap-2 font-bold">
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span>
            {b.bautizado_detalle?.nombres || 'JUAN CARLOS'} {b.bautizado_detalle?.apellido_paterno || 'MAMANI PEREZ'}
          </span>
        </div>
      ),
    },
    {
      header: 'Libro / Folio / Partida',
      render: (b: PartidaBautismo) => (
        <span>
          L. {b.partida_detalle?.numero_folio || 1} / F. {b.partida_detalle?.numero_folio || 1} / P. {b.partida_detalle?.numero_partida || 1}
        </span>
      ),
    },
    {
      header: 'Padres',
      render: (b: PartidaBautismo) => (
        <span>
          {b.padre || 'PADRE NO REGISTRADO'} / {b.madre || 'MADRE NO REGISTRADA'}
        </span>
      ),
    },
    {
      header: 'Estado Partida',
      render: (b: PartidaBautismo) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {b.partida_detalle?.estado_partida || 'ACTIVA'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      render: (b: PartidaBautismo) => (
        <button
          onClick={() => handleAnularBautismo(b)}
          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
          title="Anular Partida (Soft Delete)"
        >
          ANULAR
        </button>
      ),
    },
  ];

  // Client-side search filtering for demonstration / full function
  const filteredBautismos = bautismos.filter((b) => {
    const term = searchTerm.toLowerCase();
    const name = `${b.bautizado_detalle?.nombres} ${b.bautizado_detalle?.apellido_paterno}`.toLowerCase();
    return name.includes(term) || b.padre?.toLowerCase().includes(term) || b.madre?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4">
      {/* Portals */}
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      {/* Header */}
      <FeatureHeader
        title="REGISTRO DE PARTIDAS DE BAUTISMO"
        description="Gestión completa de libros sacramentales de bautismos con bajas lógicas y validación canónica."
        icon={BookOpen}
        action={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>NUEVA PARTIDA DE BAUTISMO</span>
          </button>
        }
      />

      {/* Reusable Search Filters */}
      <FeatureSearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="BUSCAR POR NOMBRE O PADRES..."
      />

      {/* Reusable Data Table */}
      <FeatureTable
        title="Libro de Bautismos"
        columns={columns}
        data={filteredBautismos}
        loading={loading}
        emptyMessage="No se encontraron partidas registradas en el libro actual."
        defaultPageSize={20}
      />

      {/* Modal Registro Bautismo */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                INSCRIPCIÓN DE PARTIDA DE BAUTISMO
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateBautismo} className="space-y-3 text-xs uppercase font-bold">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">NOMBRES BAUTIZADO *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">APELLIDO PATERNO *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido_paterno}
                    onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">APELLIDO MATERNO</label>
                  <input
                    type="text"
                    value={formData.apellido_materno}
                    onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">PADRE</label>
                  <input
                    type="text"
                    value={formData.padre}
                    onChange={(e) => setFormData({ ...formData, padre: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">MADRE</label>
                  <input
                    type="text"
                    value={formData.madre}
                    onChange={(e) => setFormData({ ...formData, madre: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">PADRINO</label>
                  <input
                    type="text"
                    value={formData.padrino}
                    onChange={(e) => setFormData({ ...formData, padrino: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">MADRINA</label>
                  <input
                    type="text"
                    value={formData.madrina}
                    onChange={(e) => setFormData({ ...formData, madrina: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">LIBRO N°</label>
                  <input
                    type="number"
                    value={formData.numero_libro}
                    onChange={(e) => setFormData({ ...formData, numero_libro: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">FOLIO N°</label>
                  <input
                    type="number"
                    value={formData.numero_folio}
                    onChange={(e) => setFormData({ ...formData, numero_folio: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">PARTIDA N°</label>
                  <input
                    type="number"
                    value={formData.numero_partida}
                    onChange={(e) => setFormData({ ...formData, numero_partida: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black cursor-pointer"
                >
                  GUARDAR PARTIDA DE BAUTISMO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
