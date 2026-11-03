import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Eye,
  Calendar,
  BookOpen,
  Heart,
  Award,
  Sparkles,
  MapPin,
  User,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import type { SacramentoSearchResult, Capilla } from '../domain/types';
import { apiService } from '../services/api';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureSearchFilters } from '../components/common/FeatureSearchFilters';
import { FeatureTable, type TableColumn } from '../components/common/FeatureTable';

export const BusquedaSacramentosFeature: React.FC = () => {
  const [sacramentos, setSacramentos] = useState<SacramentoSearchResult[]>([]);
  const [capillas, setCapillas] = useState<Capilla[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterCapilla, setFilterCapilla] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  // Selected item for modal
  const [selectedSacramento, setSelectedSacramento] = useState<SacramentoSearchResult | null>(null);

  const { isVisible, alertType, alertMessage } = useActionAlert();

  const fetchCapillas = async () => {
    try {
      const data = await apiService.getCapillas();
      setCapillas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar capillas:', err);
    }
  };

  const fetchSacramentos = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filterTipo) params.tipo_sacramento = filterTipo;
      if (filterCapilla) params.capilla_id = filterCapilla;
      if (filterEstado) params.estado = filterEstado;

      const data = await apiService.buscarSacramentos(params);
      setSacramentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al buscar sacramentos:', err);
      setSacramentos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapillas();
  }, []);

  useEffect(() => {
    fetchSacramentos();
  }, [filterTipo, filterCapilla, filterEstado]);

  // Client-side text search (matches names, CI, celebrant, without duplicating dropdowns)
  const filteredSacramentos = sacramentos.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();

    const matchesTitular = s.titular_principal.toLowerCase().includes(term);
    const matchesSecundario = (s.titular_secundario || '').toLowerCase().includes(term);
    const matchesCI = (s.titular_ci || '').toLowerCase().includes(term);
    const matchesCelebrante = (s.sacerdote_nombre || '').toLowerCase().includes(term);
    const matchesLibro = (s.numero_libro || '').toLowerCase().includes(term);
    const matchesFolio = (s.numero_folio || '').toLowerCase().includes(term);
    const matchesPartida = (s.numero_partida || '').toLowerCase().includes(term);

    return (
      matchesTitular ||
      matchesSecundario ||
      matchesCI ||
      matchesCelebrante ||
      matchesLibro ||
      matchesFolio ||
      matchesPartida
    );
  });

  const getSacramentoBadge = (tipo: string) => {
    switch (tipo) {
      case 'BAUTISMO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            BAUTISMO
          </span>
        );
      case 'MATRIMONIO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Heart className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            MATRIMONIO
          </span>
        );
      case 'CONFIRMACION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Award className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            CONFIRMACIÓN
          </span>
        );
      case 'COMUNION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            COMUNIÓN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {tipo}
          </span>
        );
    }
  };

  const columns: TableColumn<SacramentoSearchResult>[] = [
    {
      header: 'Sacramento',
      render: (s) => getSacramentoBadge(s.tipo_sacramento),
    },
    {
      header: 'Titular(es) / Feligrés',
      render: (s) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span>{s.titular_principal}</span>
          </p>
          {s.titular_ci && (
            <p className="text-[10px] font-semibold text-slate-400 uppercase pl-5">
              CI: {s.titular_ci}
            </p>
          )}
          {s.titular_secundario && (
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase pl-5 flex items-center gap-1">
              <span>💍 CÓNYUGE:</span>
              <span>{s.titular_secundario}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Ubicación Canónica (Libro / Página / Partida)',
      render: (s) => (
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            <span className="text-blue-600 dark:text-blue-400">LIBRO {s.numero_libro}</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-amber-600 dark:text-amber-400">FOLIO {s.numero_folio}</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400">PARTIDA {s.numero_partida}</span>
          </div>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{s.capilla_nombre}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Fecha Celebración',
      render: (s) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{s.fecha_sacramento || 'NO ESPECIFICADA'}</span>
        </span>
      ),
    },
    {
      header: 'Sacerdote Celebrante',
      render: (s) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
          {s.sacerdote_nombre || 'PBRO. DE TURNO'}
        </span>
      ),
    },
    {
      header: 'Estado',
      className: 'text-center',
      render: (s) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            s.estado_partida === 'ACTIVA'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : s.estado_partida === 'RECTIFICADA'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {s.estado_partida}
        </span>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-center',
      render: (s) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => setSelectedSacramento(s)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase transition-all shadow-sm cursor-pointer border border-blue-200 dark:border-slate-700"
            title="Ver Detalle Completo de la Partida"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>VER ACTA</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Portals de Alertas y Feedback */}
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      <FeatureHeader
        title="BÚSQUEDA GENERAL DE SACRAMENTOS"
        description="Localización de partidas sacramentales en los libros físicos (libro, folio y número de asiento) y fecha de celebración."
        icon={BookOpenCheck}
      />

      {/* Buscador y Filtros Avanzados */}
      <FeatureSearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="BUSCAR POR NOMBRE DE PERSONA, CI, LIBRO, FOLIO O SACERDOTE..."
        selectFilters={[
          {
            value: filterTipo,
            onChange: setFilterTipo,
            placeholder: 'TODOS LOS SACRAMENTOS',
            options: [
              { label: 'BAUTISMO', value: 'BAUTISMO' },
              { label: 'MATRIMONIO', value: 'MATRIMONIO' },
              { label: 'CONFIRMACIÓN', value: 'CONFIRMACION' },
              { label: 'PRIMERA COMUNIÓN', value: 'COMUNION' },
            ],
          },
          {
            value: filterCapilla,
            onChange: setFilterCapilla,
            placeholder: 'TODAS LAS CAPILLAS / SEDES',
            options: capillas.map((c) => ({
              label: c.nombre,
              value: c.id,
            })),
          },
          {
            value: filterEstado,
            onChange: setFilterEstado,
            placeholder: 'TODOS LOS ESTADOS',
            options: [
              { label: 'ACTIVA', value: 'ACTIVA' },
              { label: 'RECTIFICADA', value: 'RECTIFICADA' },
              { label: 'ANULADA', value: 'ANULADA' },
            ],
          },
        ]}
      />

      {/* Tabla Estandarizada con Conteo */}
      <FeatureTable<SacramentoSearchResult>
        title="Partidas Sacramentales Encontradas"
        columns={columns}
        data={filteredSacramentos}
        loading={loading}
        emptyMessage="No se encontraron registros de sacramentos con los criterios de búsqueda aplicados."
      />

      {/* Modal de Detalle Completo de la Partida Canónica */}
      {selectedSacramento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    ACTA SACRAMENTAL — {selectedSacramento.tipo_sacramento}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    REGISTRO HISTÓRICO CANÓNICO UNIFICADO
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSacramento(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Sección 1: Ubicación Física del Libro */}
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-blue-700 dark:text-blue-300 uppercase flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    UBICACIÓN FÍSICA EN LIBROS PARROQUIALES
                  </span>
                  {getSacramentoBadge(selectedSacramento.tipo_sacramento)}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">NÚMERO DE LIBRO</p>
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                      {selectedSacramento.numero_libro}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">PÁGINA / FOLIO</p>
                    <p className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                      {selectedSacramento.numero_folio}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">N° DE PARTIDA</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                      {selectedSacramento.numero_partida}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>SEDE / CAPILLA: {selectedSacramento.capilla_nombre}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>FECHA: {selectedSacramento.fecha_sacramento}</span>
                  </span>
                </div>
              </div>

              {/* Sección 2: Personas Involucradas */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" />
                  PERSONA(S) Y PARTÍCIPES DEL SACRAMENTO
                </p>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      TITULAR PRINCIPAL
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase">
                      {selectedSacramento.titular_principal}
                    </p>
                    {selectedSacramento.titular_ci && (
                      <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
                        DOCUMENTO DE IDENTIDAD: {selectedSacramento.titular_ci}
                      </p>
                    )}
                  </div>

                  {selectedSacramento.titular_secundario && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-rose-500 uppercase">
                        CÓNYUGE / ESPOSA
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase">
                        {selectedSacramento.titular_secundario}
                      </p>
                      {selectedSacramento.detalles_adicionales?.novia_ci && (
                        <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
                          DOCUMENTO DE IDENTIDAD: {selectedSacramento.detalles_adicionales.novia_ci}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Detalles de Bautismo */}
                  {selectedSacramento.tipo_sacramento === 'BAUTISMO' &&
                    selectedSacramento.detalles_adicionales && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            PADRE
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {selectedSacramento.detalles_adicionales.padre || 'NO REGISTRADO'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            MADRE
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {selectedSacramento.detalles_adicionales.madre || 'NO REGISTRADA'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            PADRINO
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {selectedSacramento.detalles_adicionales.padrino || 'NO REGISTRADO'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            MADRINA
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {selectedSacramento.detalles_adicionales.madrina || 'NO REGISTRADA'}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Detalles de Matrimonio */}
                  {selectedSacramento.tipo_sacramento === 'MATRIMONIO' &&
                    selectedSacramento.detalles_adicionales && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            PADRINO
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {selectedSacramento.detalles_adicionales.padrino || 'NO REGISTRADO'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            MADRINA
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {selectedSacramento.detalles_adicionales.madrina || 'NO REGISTRADA'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            TESTIGO 1
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {selectedSacramento.detalles_adicionales.testigo_1 || 'NO REGISTRADO'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            TESTIGO 2
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {selectedSacramento.detalles_adicionales.testigo_2 || 'NO REGISTRADO'}
                          </p>
                        </div>
                        {selectedSacramento.detalles_adicionales.reg_civil_oficialia && (
                          <div className="sm:col-span-2 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              DATOS DE REGISTRO CIVIL
                            </span>
                            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
                              OFICIALÍA: {selectedSacramento.detalles_adicionales.reg_civil_oficialia} · LIBRO:{' '}
                              {selectedSacramento.detalles_adicionales.reg_civil_libro} · PARTIDA:{' '}
                              {selectedSacramento.detalles_adicionales.reg_civil_partida} · FECHA:{' '}
                              {selectedSacramento.detalles_adicionales.reg_civil_fecha || '—'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* Sección 3: Fe Pública y Estado Canónico */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    AUTORIDAD CELEBRANTE
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedSacramento.estado_partida === 'ACTIVA'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    ESTADO: {selectedSacramento.estado_partida}
                  </span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 uppercase text-sm">
                  {selectedSacramento.sacerdote_nombre || 'PRESBITERIO PARROQUIAL'}
                </p>
                {selectedSacramento.observaciones && (
                  <p className="text-xs text-slate-500 italic pt-1">
                    Nota canónica: {selectedSacramento.observaciones}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-950/50">
              <button
                onClick={() => setSelectedSacramento(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-wide transition-all shadow-sm cursor-pointer"
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BusquedaSacramentosFeature;
