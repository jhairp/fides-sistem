import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Building2, Phone, MapPin, Users, Plus, Edit3, X, CheckCircle2, Navigation } from 'lucide-react';
import type { Capilla, Parroquia } from '../domain/types';
import { apiService } from '../services/api';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay, { type ActionOverlayType } from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureSearchFilters } from '../components/common/FeatureSearchFilters';
import { StatusToggleButton, EditButton } from '../components/common/TableButtons';

const inputClass =
  'w-full p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all';
const labelClass = 'text-[10px] text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider font-bold';

// ─── Modal para Crear / Editar Capilla ───────────────────────────────────────

interface CapillaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  triggerAlert: (type: ActionOverlayType, message: string) => void;
  parroquias: Parroquia[];
  editCapilla?: Capilla | null;
}

const CapillaModal: React.FC<CapillaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  triggerAlert,
  parroquias,
  editCapilla,
}) => {
  const isEditing = !!editCapilla;

  const [nombre, setNombre] = useState('');
  const [parroquiaId, setParroquiaId] = useState('');
  const [esSedePrincipal, setEsSedePrincipal] = useState(false);
  const [ciudad, setCiudad] = useState('LA PAZ');
  const [municipio, setMunicipio] = useState('NUESTRA SEÑORA DE LA PAZ');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [capacidadPersonas, setCapacidadPersonas] = useState(200);
  const [coordenadasGps, setCoordenadasGps] = useState('');
  const [estado, setEstado] = useState<'ACTIVA' | 'INACTIVA'>('ACTIVA');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = useCallback(() => {
    setNombre('');
    const defaultParroquia =
      parroquias.find((p) => p.nombre?.includes('ESPIRITU SANTO') || p.nombre?.includes('SANTÍSIMA TRINIDAD'))?.id ||
      parroquias[0]?.id ||
      '';
    setParroquiaId(defaultParroquia);
    setEsSedePrincipal(false);
    setCiudad('LA PAZ');
    setMunicipio('NUESTRA SEÑORA DE LA PAZ');
    setDireccion('');
    setTelefono('');
    setCapacidadPersonas(200);
    setCoordenadasGps('');
    setEstado('ACTIVA');
    setErrorMsg('');
  }, [parroquias]);

  useEffect(() => {
    if (isOpen) {
      if (editCapilla) {
        setNombre(editCapilla.nombre || '');
        setParroquiaId(editCapilla.parroquia || parroquias[0]?.id || '');
        setEsSedePrincipal(!!editCapilla.es_sede_principal);
        setCiudad(editCapilla.ciudad || 'LA PAZ');
        setMunicipio(editCapilla.municipio || 'NUESTRA SEÑORA DE LA PAZ');
        setDireccion(editCapilla.direccion || '');
        setTelefono(editCapilla.telefono || '');
        setCapacidadPersonas(editCapilla.capacidad_personas ?? 200);
        setCoordenadasGps(editCapilla.coordenadas_gps || editCapilla.coordenadas || '');
        setEstado((editCapilla.estado as 'ACTIVA' | 'INACTIVA') || 'ACTIVA');
        setErrorMsg('');
      } else {
        resetForm();
      }
    }
  }, [isOpen, editCapilla, resetForm, parroquias]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    if (!nombre.trim()) {
      setErrorMsg('• NOMBRE DE LA CAPILLA: ESTE CAMPO ES OBLIGATORIO.');
      setSubmitting(false);
      return;
    }

    if (!parroquiaId) {
      setErrorMsg('• PARROQUIA: DEBE SELECCIONAR UNA PARROQUIA.');
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      nombre: nombre.trim().toUpperCase(),
      parroquia: parroquiaId,
      es_sede_principal: esSedePrincipal,
      ciudad: ciudad.trim().toUpperCase() || 'LA PAZ',
      municipio: municipio.trim().toUpperCase() || 'NUESTRA SEÑORA DE LA PAZ',
      direccion: direccion.trim().toUpperCase() || null,
      telefono: telefono.trim() || null,
      capacidad_personas: Number(capacidadPersonas) || 200,
      coordenadas_gps: coordenadasGps.trim() || null,
      estado,
    };

    try {
      if (isEditing && editCapilla) {
        await apiService.updateCapilla(editCapilla.id, payload);
        triggerAlert('editado', `CAPILLA ${payload.nombre} ACTUALIZADA EXITOSAMENTE`);
      } else {
        await apiService.createCapilla(payload);
        triggerAlert('creado', `CAPILLA ${payload.nombre} REGISTRADA EXITOSAMENTE`);
      }
      resetForm();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          setErrorMsg(data);
        } else if (typeof data === 'object') {
          const fieldMap: Record<string, string> = {
            nombre: 'Nombre de la Capilla',
            parroquia: 'Parroquia',
            ciudad: 'Ciudad',
            municipio: 'Municipio',
            telefono: 'Teléfono',
            direccion: 'Dirección',
            capacidad_personas: 'Capacidad de Personas',
            coordenadas_gps: 'Coordenadas GPS',
            estado: 'Estado',
            detail: 'Detalle',
            non_field_errors: 'Error General',
          };
          const messages = Object.entries(data)
            .map(([key, val]) => {
              const fieldName = fieldMap[key] || key;
              const msg = Array.isArray(val) ? val.join(' ') : String(val);
              return `• ${fieldName.toUpperCase()}: ${msg}`;
            })
            .join('\n');
          setErrorMsg(messages);
        } else {
          setErrorMsg('Error al guardar la capilla. Verifique los datos.');
        }
      } else {
        setErrorMsg('Error de conexión con el servidor. Intente más tarde.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-2xl space-y-5">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            {isEditing ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-blue-600" />}
            {isEditing ? 'Editar Capilla' : 'Registrar Nueva Capilla'}
          </h3>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Errores */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase whitespace-pre-line leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {/* Nombre & Parroquia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Nombre de la Capilla <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value.toUpperCase())}
                placeholder="EJ. SANTÍSIMA TRINIDAD"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Parroquia de Jurisdicción <span className="text-rose-500">*</span>
              </label>
              <select
                value={parroquiaId}
                onChange={(e) => setParroquiaId(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">SELECCIONAR PARROQUIA...</option>
                {parroquias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sede Principal Checkbox */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                ¿Es la Sede Principal de la Parroquia?
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Determina si esta capilla actúa como templo o sede central de administración.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={esSedePrincipal}
                onChange={(e) => setEsSedePrincipal(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Ciudad y Municipio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ciudad</label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value.toUpperCase())}
                placeholder="LA PAZ"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Municipio</label>
              <input
                type="text"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value.toUpperCase())}
                placeholder="NUESTRA SEÑORA DE LA PAZ"
                className={inputClass}
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className={labelClass}>Dirección o Ubicación</label>
            <textarea
              rows={2}
              value={direccion}
              onChange={(e) => setDireccion(e.target.value.toUpperCase())}
              placeholder="EJ. CALLE BOLÍVAR ESQ. SAN MARTÍN #123"
              className={inputClass}
            />
          </div>

          {/* Teléfono & Capacidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Teléfono de Contacto</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="EJ. 74185852 / 2-2410000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Capacidad Estimada (Personas)</label>
              <input
                type="number"
                min={1}
                value={capacidadPersonas}
                onChange={(e) => setCapacidadPersonas(parseInt(e.target.value, 10) || 0)}
                placeholder="200"
                className={inputClass}
              />
            </div>
          </div>

          {/* Coordenadas GPS & Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Coordenadas GPS (Latitud, Longitud)</label>
              <input
                type="text"
                value={coordenadasGps}
                onChange={(e) => setCoordenadasGps(e.target.value)}
                placeholder="EJ. -16.4965, -68.1328"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Estado del Registro</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as 'ACTIVA' | 'INACTIVA')}
                className={inputClass}
              >
                <option value="ACTIVA">ACTIVA (HABILITADA)</option>
                <option value="INACTIVA">INACTIVA (DESHABILITADA)</option>
              </select>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEditing ? 'Actualizar Capilla' : 'Guardar Capilla'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Componente Principal de Capillas ────────────────────────────────────────

export const CapillasFeature: React.FC = () => {
  const [capillas, setCapillas] = useState<Capilla[]>([]);
  const [parroquias, setParroquias] = useState<Parroquia[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCapilla, setSelectedCapilla] = useState<Capilla | null>(null);

  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [capillasData, parroquiasData] = await Promise.all([
        apiService.getCapillas(),
        apiService.getParroquias(),
      ]);
      setCapillas(Array.isArray(capillasData) ? capillasData : []);
      setParroquias(Array.isArray(parroquiasData) ? parroquiasData : []);
    } catch (err) {
      console.error('Error al cargar datos de capillas:', err);
      setCapillas([]);
      setParroquias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedCapilla(null);
    setIsModalOpen(true);
  };

  const handleEdit = (capilla: Capilla) => {
    setSelectedCapilla(capilla);
    setIsModalOpen(true);
  };

  const handleToggleEstadoCapilla = async (c: Capilla) => {
    const nuevoEstado = c.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    try {
      await apiService.updateCapilla(c.id, { estado: nuevoEstado });
      triggerAlert(
        nuevoEstado === 'ACTIVA' ? 'activo' : 'inactivo',
        `CAPILLA "${c.nombre}" CAMBIADA A ESTADO ${nuevoEstado}`
      );
      loadData();
    } catch (err) {
      console.error('Error al cambiar estado de la capilla:', err);
      triggerAlert('error', 'NO SE PUDO CAMBIAR EL ESTADO DE LA CAPILLA');
    }
  };

  // Filtrado reactivo en el frontend
  const filteredCapillas = useMemo(() => {
    return capillas.filter((c) => {
      // Filtro de estado
      if (filterEstado && c.estado !== filterEstado) {
        return false;
      }
      // Búsqueda de texto por nombre, dirección, municipio o ciudad
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toUpperCase();
        const matchesNombre = c.nombre?.toUpperCase().includes(query);
        const matchesDireccion = c.direccion?.toUpperCase().includes(query);
        const matchesMunicipio = c.municipio?.toUpperCase().includes(query);
        const matchesCiudad = c.ciudad?.toUpperCase().includes(query);
        const matchesParroquia = c.parroquia_nombre?.toUpperCase().includes(query);
        return matchesNombre || matchesDireccion || matchesMunicipio || matchesCiudad || matchesParroquia;
      }
      return true;
    });
  }, [capillas, searchTerm, filterEstado]);

  return (
    <div className="space-y-4">
      {/* Alertas y Overlays */}
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      {/* Modal de Crear / Editar */}
      <CapillaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCapilla(null);
        }}
        onSuccess={loadData}
        triggerAlert={triggerAlert}
        parroquias={parroquias}
        editCapilla={selectedCapilla}
      />

      {/* Header con botón para registrar nueva capilla */}
      <FeatureHeader
        title="RED Y JURISDICCIÓN DE CAPILLAS SACRAMENTALES"
        description="Gestión centralizada de templos y capillas dependientes en la ciudad de La Paz y arquidiócesis. Registros unificados."
        icon={Building2}
        action={
          <button
            onClick={handleCreate}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-blue-500/20 uppercase"
          >
            <Plus className="w-4 h-4" />
            <span>NUEVA CAPILLA</span>
          </button>
        }
      />

      {/* Filtros y Buscador */}
      <FeatureSearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="BUSCAR CAPILLA POR NOMBRE, DIRECCIÓN O JURISDICCIÓN..."
        selectFilters={[
          {
            value: filterEstado,
            onChange: setFilterEstado,
            placeholder: 'TODOS LOS ESTADOS',
            options: [
              { label: 'ACTIVAS', value: 'ACTIVA' },
              { label: 'INACTIVAS', value: 'INACTIVA' },
            ],
          },
        ]}
      />

      {/* Estado de carga */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider">Cargando red de capillas...</p>
        </div>
      ) : filteredCapillas.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 text-center text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
          <p className="text-sm font-bold uppercase">No se encontraron capillas</p>
          <p className="text-xs mt-1">
            {searchTerm || filterEstado
              ? 'Intente modificar los criterios de búsqueda o filtros.'
              : 'Haga clic en "+ NUEVA CAPILLA" para registrar la primera capilla en el sistema.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-semibold uppercase">
            <span>
              Mostrando {filteredCapillas.length} de {capillas.length} capillas registradas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCapillas.map((c) => {
              const isActive = c.estado === 'ACTIVA';
              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400/50 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    {/* Insignias de Cabecera */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.es_sede_principal
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {c.es_sede_principal ? 'SEDE PRINCIPAL' : 'CAPILLA DEPENDIENTE'}
                      </span>

                      <StatusToggleButton
                        isActive={isActive}
                        onToggle={() => handleToggleEstadoCapilla(c)}
                        activeText="ACTIVA"
                        inactiveText="INACTIVA"
                      />
                    </div>

                    {/* Nombre y Parroquia */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {c.nombre}
                      </h3>
                      {c.parroquia_nombre && (
                        <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase mt-0.5">
                          {c.parroquia_nombre}
                        </p>
                      )}
                    </div>

                    {/* Detalles */}
                    <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase pt-1">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">
                          {c.direccion || 'DIRECCIÓN NO ESPECIFICADA'}
                          {c.ciudad ? ` (${c.ciudad})` : ''}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>TEL: {c.telefono || 'NO REGISTRADO'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>CAPACIDAD: {c.capacidad_personas ?? 200} PERSONAS</span>
                      </p>
                      {(c.coordenadas_gps || c.coordenadas) && (
                        <p className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Navigation className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span>GPS: {c.coordenadas_gps || c.coordenadas}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones del pie de la tarjeta */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      {isActive ? 'HABILITADA' : 'DESHABILITADA'}
                    </span>

                    <div className="flex items-center gap-2">
                      <EditButton onClick={() => handleEdit(c)} title="Editar datos de la capilla" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};