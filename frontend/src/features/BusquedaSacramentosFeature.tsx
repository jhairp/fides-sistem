import React, { useState, useEffect, useRef } from 'react';
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
  Users,
  ShieldCheck,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Hash,
  Bookmark,
  Cake,
} from 'lucide-react';
import type { SacramentoSearchResult } from '../domain/types';
import { apiService } from '../services/api';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureTable, type TableColumn } from '../components/common/FeatureTable';

interface AppliedFilters {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  padre: string;
  madre: string;
  libro: string;
  folio: string;
  partida: string;
  tipo_sacramento: string;
  fecha_nac_desde: string;
  fecha_nac_hasta: string;
  fecha_desde: string;
  fecha_hasta: string;
}

const initialFilters: AppliedFilters = {
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  padre: '',
  madre: '',
  libro: '',
  folio: '',
  partida: '',
  tipo_sacramento: '',
  fecha_nac_desde: '',
  fecha_nac_hasta: '',
  fecha_desde: '',
  fecha_hasta: '',
};

export const BusquedaSacramentosFeature: React.FC = () => {
  const [sacramentos, setSacramentos] = useState<SacramentoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 1. Buscador dividido por Nombres y Apellidos del Titular
  const [searchNombres, setSearchNombres] = useState('');
  const [searchApellidoPaterno, setSearchApellidoPaterno] = useState('');
  const [searchApellidoMaterno, setSearchApellidoMaterno] = useState('');

  // 2. Buscador por Padres (Actas de Bautismo)
  const [searchPadre, setSearchPadre] = useState('');
  const [searchMadre, setSearchMadre] = useState('');

  // 3. Ubicación física en libros parroquiales (3 Secciones Exactas)
  const [filterLibro, setFilterLibro] = useState('');
  const [filterFolio, setFilterFolio] = useState('');
  const [filterPartida, setFilterPartida] = useState('');

  // 4. Tipo de Sacramento
  const [filterTipo, setFilterTipo] = useState('');

  // 5. Rango de Fechas de Nacimiento
  const [fechaNacInicio, setFechaNacInicio] = useState('');
  const [fechaNacFin, setFechaNacFin] = useState('');

  // 6. Rango de Fechas de Celebración (Sacramento)
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Filtros aplicados para control de paginación desacoplado
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(initialFilters);

  // Selected item for modal & loading detail
  const [selectedSacramento, setSelectedSacramento] = useState<SacramentoSearchResult | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const { isVisible, alertType, alertMessage } = useActionAlert();

  // Helper canónico para formatear fechas a DD-MM-AAAA
  const formatDateDMY = (dateStr?: string | null): string => {
    if (!dateStr) return 'NO ESPECIFICADA';
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }
    return dateStr;
  };

  const getDisplayCapilla = (capillaName?: string | null): string => {
    if (!capillaName) return 'SANTUARIO JESÚS DEL GRAN PODER';
    if (capillaName.toUpperCase().includes('TRINIDAD')) {
      return 'SANTUARIO JESÚS DEL GRAN PODER';
    }
    return capillaName;
  };

  const fetchSacramentos = async (page = 1, filters = appliedFilters) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        page_size: 50,
      };
      if (filters.nombres.trim()) params.nombres = filters.nombres.trim();
      if (filters.apellido_paterno.trim()) params.apellido_paterno = filters.apellido_paterno.trim();
      if (filters.apellido_materno.trim()) params.apellido_materno = filters.apellido_materno.trim();
      if (filters.padre.trim()) params.padre = filters.padre.trim();
      if (filters.madre.trim()) params.madre = filters.madre.trim();
      if (filters.libro.trim()) params.libro = filters.libro.trim();
      if (filters.folio.trim()) params.folio = filters.folio.trim();
      if (filters.partida.trim()) params.partida = filters.partida.trim();
      if (filters.tipo_sacramento) params.tipo_sacramento = filters.tipo_sacramento;
      if (filters.fecha_nac_desde) params.fecha_nac_desde = filters.fecha_nac_desde;
      if (filters.fecha_nac_hasta) params.fecha_nac_hasta = filters.fecha_nac_hasta;
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;

      const res = await apiService.buscarSacramentos(params);
      setSacramentos(res.results || []);
      setTotalCount(res.count || 0);
      setTotalPages(res.total_pages || 1);
      setCurrentPage(res.current_page || 1);
    } catch (err) {
      console.error('Error al buscar sacramentos:', err);
      setSacramentos([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial al montar el componente
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchSacramentos(1, initialFilters);
      return;
    }
    fetchSacramentos(currentPage, appliedFilters);
  }, [currentPage]);

  const handleSearch = () => {
    const newFilters: AppliedFilters = {
      nombres: searchNombres.trim(),
      apellido_paterno: searchApellidoPaterno.trim(),
      apellido_materno: searchApellidoMaterno.trim(),
      padre: searchPadre.trim(),
      madre: searchMadre.trim(),
      libro: filterLibro.trim(),
      folio: filterFolio.trim(),
      partida: filterPartida.trim(),
      tipo_sacramento: filterTipo,
      fecha_nac_desde: fechaNacInicio,
      fecha_nac_hasta: fechaNacFin,
      fecha_desde: fechaInicio,
      fecha_hasta: fechaFin,
    };
    setAppliedFilters(newFilters);
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchSacramentos(1, newFilters);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearchNombres('');
    setSearchApellidoPaterno('');
    setSearchApellidoMaterno('');
    setSearchPadre('');
    setSearchMadre('');
    setFilterLibro('');
    setFilterFolio('');
    setFilterPartida('');
    setFilterTipo('');
    setFechaNacInicio('');
    setFechaNacFin('');
    setFechaInicio('');
    setFechaFin('');
    setAppliedFilters(initialFilters);
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchSacramentos(1, initialFilters);
    }
  };

  const handleOpenDetail = async (item: SacramentoSearchResult) => {
    setSelectedSacramento(item);
    if (item.detalles_adicionales && Object.keys(item.detalles_adicionales).length > 0) {
      return;
    }
    setLoadingDetail(true);
    try {
      const fullDetail = await apiService.getDetalleSacramento(item.id);
      setSelectedSacramento(fullDetail);
    } catch (err) {
      console.error('Error al obtener detalle del sacramento:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

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
      header: 'Fecha Nacimiento',
      render: (s) => (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 font-mono">
            <Cake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>{formatDateDMY(s.titular_fecha_nacimiento)}</span>
          </span>
          {s.titular_secundario && s.titular_secundario_fecha_nacimiento && (
            <p className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 pl-5">
              CÓNYUGE: {formatDateDMY(s.titular_secundario_fecha_nacimiento)}
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
            <span>{getDisplayCapilla(s.capilla_nombre)}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Fecha Celebración',
      render: (s) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{formatDateDMY(s.fecha_sacramento)}</span>
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
      header: 'Acciones',
      className: 'text-center',
      render: (s) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleOpenDetail(s)}
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
        description="Búsqueda avanzada por titular (nombres y apellidos separados), padres, ubicación canónica exacta (libro, folio, partida) y rangos de fechas de nacimiento y celebración."
        icon={BookOpenCheck}
      />

      {/* Panel de Filtros Avanzados y Búsqueda Manual */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm space-y-4">
        {/* Sección 1: Datos del Titular (Feligrés) */}
        <div>
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>DATOS DEL TITULAR (FELIGRÉS / CONTRAYENTES):</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Nombres */}
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">NOMBRES:</span>
              <input
                type="text"
                value={searchNombres}
                onChange={(e) => setSearchNombres(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="EJ. EVA MARIA"
                className="w-full px-3 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Apellido Paterno */}
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">APELLIDO PATERNO:</span>
              <input
                type="text"
                value={searchApellidoPaterno}
                onChange={(e) => setSearchApellidoPaterno(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="EJ. FLORES"
                className="w-full px-3 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Apellido Materno */}
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">APELLIDO MATERNO:</span>
              <input
                type="text"
                value={searchApellidoMaterno}
                onChange={(e) => setSearchApellidoMaterno(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="EJ. MAMANI"
                className="w-full px-3 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Tipo de Sacramento */}
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">SACRAMENTO:</span>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 pr-8 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold uppercase cursor-pointer outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">TODOS LOS SACRAMENTOS</option>
                <option value="BAUTISMO">BAUTISMO</option>
                <option value="MATRIMONIO">MATRIMONIO</option>
                <option value="CONFIRMACION">CONFIRMACIÓN</option>
                <option value="COMUNION">PRIMERA COMUNIÓN</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección 2: Padres (Bautismos) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>NOMBRES DE LOS PADRES (FILTRO PARA ACTAS DE BAUTISMO):</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">NOMBRE COMPLETO DEL PADRE:</span>
              <input
                type="text"
                value={searchPadre}
                onChange={(e) => setSearchPadre(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="EJ. CARLOS FLORES"
                className="w-full px-3 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">NOMBRE COMPLETO DE LA MADRE:</span>
              <input
                type="text"
                value={searchMadre}
                onChange={(e) => setSearchMadre(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="EJ. MARIA MAMANI"
                className="w-full px-3 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Ubicación física exacta en libros (3 Secciones) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>UBICACIÓN FÍSICA EXACTA EN LIBROS (3 SECCIONES):</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Sección 1: Número de Libro */}
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">N° LIBRO (EXACTO):</span>
              <div className="relative">
                <Bookmark className="w-4 h-4 absolute left-3.5 top-3 text-blue-600/70" />
                <input
                  type="text"
                  value={filterLibro}
                  onChange={(e) => setFilterLibro(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="EJ. 3"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Sección 2: Número de Folio / Página */}
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">N° FOLIO / PÁGINA:</span>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3.5 top-3 text-amber-600/70" />
                <input
                  type="text"
                  value={filterFolio}
                  onChange={(e) => setFilterFolio(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="EJ. 118"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Sección 3: Número de Partida / Asiento */}
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">N° PARTIDA:</span>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-3 text-emerald-600/70" />
                <input
                  type="text"
                  value={filterPartida}
                  onChange={(e) => setFilterPartida(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="EJ. 349"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección 4: Rangos de Fechas (Nacimiento y Celebración) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Rango Fecha Nacimiento */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5 mb-2">
              <Cake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              RANGO DE FECHA DE NACIMIENTO:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">DESDE:</span>
                <input
                  type="date"
                  value={fechaNacInicio}
                  onChange={(e) => setFechaNacInicio(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">HASTA:</span>
                <input
                  type="date"
                  value={fechaNacFin}
                  onChange={(e) => setFechaNacFin(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Rango Fecha Celebración */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              RANGO DE FECHA DE CELEBRACIÓN (SACRAMENTO):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">DESDE:</span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">HASTA:</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección 5: Botones de Acción (BUSCAR y LIMPIAR FILTROS) */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {(searchNombres ||
            searchApellidoPaterno ||
            searchApellidoMaterno ||
            searchPadre ||
            searchMadre ||
            filterLibro ||
            filterFolio ||
            filterPartida ||
            filterTipo ||
            fechaNacInicio ||
            fechaNacFin ||
            fechaInicio ||
            fechaFin) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 text-xs font-bold uppercase transition-all shadow-xs cursor-pointer border border-rose-200 dark:border-rose-900/50"
            >
              <X className="w-4 h-4" />
              <span>LIMPIAR FILTROS</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>BUSCAR</span>
          </button>
        </div>
      </div>

      {/* Tabla Estandarizada con Conteo y Paginación Servidor */}
      <div className="space-y-3">
        <FeatureTable<SacramentoSearchResult>
          title={`Partidas Sacramentales (${totalCount.toLocaleString()} Registros Canónicos)`}
          columns={columns}
          data={sacramentos}
          loading={loading}
          emptyMessage="No se encontraron registros de sacramentos con los criterios de búsqueda aplicados."
        />

        {/* Controles de Paginación Optimizados */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              MOSTRANDO PÁGINA <span className="font-bold text-blue-600 dark:text-blue-400">{currentPage}</span> DE{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages}</span> ({totalCount.toLocaleString()} REGISTROS)
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-inherit text-slate-700 dark:text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>ANTERIOR</span>
              </button>

              <button
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-inherit text-slate-700 dark:text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <span>SIGUIENTE</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle Completo de la Partida Canónica (Carga bajo demanda) */}
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 pt-1 border-t border-blue-100 dark:border-blue-900/40 gap-2">
                  <span className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                    <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>SEDE / CAPILLA: {getDisplayCapilla(selectedSacramento.capilla_nombre)}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ESTADO: {selectedSacramento.estado_partida}</span>
                  </span>
                </div>

                {/* DISTINCIÓN CLARA DE FECHA DE NACIMIENTO VS FECHA DE CELEBRACIÓN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Tarjeta 1: Fecha de Nacimiento */}
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 shadow-xs">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 mb-1">
                      <Cake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        FECHA DE NACIMIENTO
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-amber-950 dark:text-amber-100 font-mono">
                      {formatDateDMY(selectedSacramento.titular_fecha_nacimiento)}
                    </p>
                    <p className="text-[9px] font-semibold text-amber-700/80 dark:text-amber-400/80 uppercase mt-0.5">
                      Feligrés / Titular de la partida
                    </p>
                  </div>

                  {/* Tarjeta 2: Fecha de Celebración */}
                  <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 shadow-xs">
                    <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-400 mb-1">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        FECHA DE CELEBRACIÓN
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-blue-950 dark:text-blue-100 font-mono">
                      {formatDateDMY(selectedSacramento.fecha_sacramento)}
                    </p>
                    <p className="text-[9px] font-semibold text-blue-700/80 dark:text-blue-400/80 uppercase mt-0.5">
                      Celebración del Sacramento
                    </p>
                  </div>
                </div>

                {/* Si es Matrimonio y la novia tiene fecha de nacimiento registrada */}
                {selectedSacramento.titular_secundario_fecha_nacimiento && (
                  <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1.5">
                      <Cake className="w-3.5 h-3.5 text-rose-600" />
                      <span>FECHA NACIMIENTO (CÓNYUGE / ESPOSA):</span>
                    </span>
                    <span className="font-mono font-bold text-rose-950 dark:text-rose-200">
                      {formatDateDMY(selectedSacramento.titular_secundario_fecha_nacimiento)}
                    </span>
                  </div>
                )}
              </div>

              {/* Sección 2: Personas Involucradas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500" />
                    PERSONA(S) Y PARTÍCIPES DEL SACRAMENTO
                  </p>
                  {loadingDetail && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold uppercase animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      CARGANDO DETALLES HISTÓRICOS...
                    </span>
                  )}
                </div>

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
                              {formatDateDMY(selectedSacramento.detalles_adicionales.reg_civil_fecha)}
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
