import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, User, Search, Edit3, Link2, UserPlus } from 'lucide-react';
import type { UserAccount, Capilla, Persona } from '../domain/types';
import { useActionAlert } from '../hooks/useActionAlert';
import { useAuth } from '../hooks/useAuth';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureTable } from '../components/common/FeatureTable';
import { FeatureSearchFilters } from '../components/common/FeatureSearchFilters';
import { StatusToggleButton, EditButton } from '../components/common/TableButtons';
import { apiService } from '../services/api';

const ROLES = ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE', 'SECRETARIO', 'FELIGRES'];

const DEFAULT_PASSWORD = '12345678';

const inputClass = 'w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100';
const labelClass = 'text-[10px] text-slate-500 block mb-1 uppercase tracking-wider font-bold';

// ─── Sub-componente: Modal de Crear/Editar ───────────────────────────────────

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  triggerAlert: (type: string, message: string) => void;
  capillas: Capilla[];
  editUser?: UserAccount | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSuccess, triggerAlert, capillas, editUser }) => {
  const isEditing = !!editUser;
  const { user: currentUser } = useAuth();
  
  const getAvailableRoles = () => {
    const curRole = currentUser?.role;
    if (curRole === 'SUPERADMIN') return ROLES;
    if (curRole === 'ADMINISTRADOR') return ROLES.filter(r => r !== 'SUPERADMIN');
    if (curRole === 'PARROCO') return ['SACERDOTE', 'RECTOR', 'SECRETARIO'];
    if (curRole === 'RECTOR') return ['SECRETARIO'];
    return [];
  };
  const availableRoles = getAvailableRoles();

  // Modo: 'nueva' = crear persona nueva, 'vincular' = buscar persona existente
  const [personaMode, setPersonaMode] = useState<'nueva' | 'vincular'>('nueva');

  // Campos del usuario
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [role, setRole] = useState(availableRoles[0] || 'SECRETARIO');
  const [selectedCapillas, setSelectedCapillas] = useState<string[]>([]);

  // Campos de persona nueva
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [ci, setCi] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefono, setTelefono] = useState('');

  // Vincular persona existente
  const [personaSearch, setPersonaSearch] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [searchingPersonas, setSearchingPersonas] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar datos del usuario al editar
  useEffect(() => {
    if (editUser) {
      setUsername(editUser.username);
      setEmail(editUser.email);
      setRole(editUser.role || 'SECRETARIO');
      setSelectedCapillas(editUser.capillas ? editUser.capillas.map(c => c.id) : []);
      setPassword('');
      if (editUser.persona) {
        setNombres(editUser.persona.nombres || '');
        setApellidoPaterno(editUser.persona.apellido_paterno || '');
        setApellidoMaterno(editUser.persona.apellido_materno || '');
        setCi(editUser.persona.ci || '');
        setSexo(editUser.persona.sexo || '');
        setTelefono(editUser.persona.telefono || '');
        setPersonaMode('nueva');
      }
    } else {
      resetForm();
    }
  }, [editUser]);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword(DEFAULT_PASSWORD);
    setRole(availableRoles[0] || 'SECRETARIO');
    setSelectedCapillas([]);
    setNombres('');
    setApellidoPaterno('');
    setApellidoMaterno('');
    setCi('');
    setSexo('');
    setTelefono('');
    setPersonaMode('nueva');
    setSelectedPersona(null);
    setPersonaSearch('');
    setPersonas([]);
    setErrorMsg('');
  };

  const handleSearchPersonas = async () => {
    if (personaSearch.length < 2) return;
    setSearchingPersonas(true);
    try {
      const results = await apiService.getPersonas(personaSearch);
      setPersonas(results);
    } catch {
      setPersonas([]);
    }
    setSearchingPersonas(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        username: username.trim(),
        email: email.trim(),
        role,
        capillas: role === 'FELIGRES' ? [] : selectedCapillas,
      };

      if (isEditing) {
        // Editar: incluir datos de persona
        payload.nombres = nombres;
        payload.apellido_paterno = apellidoPaterno;
        payload.apellido_materno = apellidoMaterno || null;
        payload.ci = ci || null;
        payload.sexo = sexo || null;
        payload.telefono = telefono || null;
        if (password) {
          payload.password = password;
        }
        await apiService.updateUser(editUser!.id, payload);
        triggerAlert('editado', `USUARIO ${username.toUpperCase()} ACTUALIZADO EXITOSAMENTE`);
      } else {
        // Crear
        payload.password = password;
        if (personaMode === 'vincular' && selectedPersona) {
          payload.persona_id = selectedPersona.id;
        } else {
          payload.nombres = nombres;
          payload.apellido_paterno = apellidoPaterno;
          payload.apellido_materno = apellidoMaterno || null;
          payload.ci = ci || null;
          payload.sexo = sexo || null;
          payload.telefono = telefono || null;
        }
        await apiService.createUser(payload);
        triggerAlert('creado', `USUARIO ${username.toUpperCase()} Y PERSONA CREADOS EXITOSAMENTE`);
      }

      resetForm();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } };
      if (error.response?.data) {
        const fieldMap: Record<string, string> = {
          username: 'Nombre de Usuario',
          email: 'Correo Electrónico',
          nombres: 'Nombres',
          password: 'Contraseña'
        };
        const messages = Object.entries(error.response.data)
          .map(([key, val]) => {
            const fieldName = fieldMap[key] || key;
            const errorMsg = Array.isArray(val) ? val.join(' ') : val;
            return `• ${fieldName.toUpperCase()}: ${errorMsg}`;
          })
          .join('\n');
        setErrorMsg(messages);
      } else {
        setErrorMsg('Error al guardar el usuario. Verifique los datos o su conexión.');
      }
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            {isEditing ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-blue-600" />}
            {isEditing ? 'Editar Usuario del Sistema' : 'Registrar Nuevo Usuario del Sistema'}
          </h3>
          <button onClick={() => { resetForm(); onClose(); }} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase whitespace-pre-line">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold">
          {/* ── Sección: Datos de la Persona ── */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Datos de la Persona</p>
              {!isEditing && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => { setPersonaMode('nueva'); setSelectedPersona(null); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all ${
                      personaMode === 'nueva'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <UserPlus className="w-3 h-3" /> Nueva
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersonaMode('vincular')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all ${
                      personaMode === 'vincular'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Link2 className="w-3 h-3" /> Vincular Existente
                  </button>
                </div>
              )}
            </div>

            {/* Modo: Crear Persona Nueva */}
            {(personaMode === 'nueva' || isEditing) && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Nombres *</label>
                    <input type="text" required={personaMode === 'nueva'} value={nombres} onChange={(e) => setNombres(e.target.value.toUpperCase())} className={`${inputClass} uppercase`} placeholder="EJ: JUAN CARLOS" />
                  </div>
                  <div>
                    <label className={labelClass}>Apellido Paterno *</label>
                    <input type="text" required={personaMode === 'nueva'} value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value.toUpperCase())} className={`${inputClass} uppercase`} placeholder="EJ: QUISPE" />
                  </div>
                  <div>
                    <label className={labelClass}>Apellido Materno</label>
                    <input type="text" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value.toUpperCase())} className={`${inputClass} uppercase`} placeholder="EJ: MAMANI" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>C.I. (Carnet)</label>
                    <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} className={inputClass} placeholder="EJ: 4589123 LP" />
                  </div>
                  <div>
                    <label className={labelClass}>Sexo</label>
                    <select value={sexo} onChange={(e) => setSexo(e.target.value)} className={`${inputClass} font-bold`}>
                      <option value="">— Sin especificar —</option>
                      <option value="M">MASCULINO</option>
                      <option value="F">FEMENINO</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Teléfono</label>
                    <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputClass} placeholder="EJ: 71234567" />
                  </div>
                </div>
              </div>
            )}

            {/* Modo: Vincular Persona Existente */}
            {personaMode === 'vincular' && !isEditing && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={personaSearch}
                    onChange={(e) => setPersonaSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchPersonas(); } }}
                    className={`${inputClass} flex-1`}
                    placeholder="BUSCAR POR NOMBRE, APELLIDO O C.I. ..."
                  />
                  <button
                    type="button"
                    onClick={handleSearchPersonas}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase cursor-pointer flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" /> Buscar
                  </button>
                </div>

                {searchingPersonas && <p className="text-[10px] text-slate-400">Buscando...</p>}

                {/* Persona seleccionada */}
                {selectedPersona && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {selectedPersona.nombre_completo || `${selectedPersona.nombres} ${selectedPersona.apellido_paterno}`}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        CI: {selectedPersona.ci || '—'} | Tel: {selectedPersona.telefono || '—'}
                      </p>
                    </div>
                    <button type="button" onClick={() => setSelectedPersona(null)} className="text-rose-500 text-[10px] font-bold cursor-pointer">QUITAR</button>
                  </div>
                )}

                {/* Resultados de búsqueda */}
                {!selectedPersona && personas.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    {personas.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPersona(p)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer transition-all"
                      >
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {p.nombre_completo || `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno || ''}`}
                        </p>
                        <p className="text-[10px] text-slate-500">CI: {p.ci || '—'} | Tel: {p.telefono || '—'}</p>
                      </button>
                    ))}
                  </div>
                )}
                {!selectedPersona && personas.length === 0 && personaSearch.length >= 2 && !searchingPersonas && (
                  <p className="text-[10px] text-slate-400">No se encontraron resultados.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Sección: Datos de la Cuenta ── */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Datos de la Cuenta</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nombre de Usuario *</label>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} placeholder="EJ: SecretariaMaria" />
              </div>
              <div>
                <label className={labelClass}>Correo Electrónico *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="EJ: maria@fidessystem.org" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Contraseña {isEditing ? '(dejar vacío para no cambiar)' : '*'}</label>
                <input type="password" required={!isEditing} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder={isEditing ? '••••••••' : DEFAULT_PASSWORD} />
              </div>
              <div>
                <label className={labelClass}>Rol en el Sistema</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputClass} font-bold`}>
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              
              {role !== 'FELIGRES' && (
                <div>
                  <label className={labelClass}>Capilla Asignada</label>
                  <select 
                    value={selectedCapillas.length > 0 ? selectedCapillas[0] : ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCapillas(val ? [val] : []);
                    }} 
                    className={`${inputClass} font-bold`}
                  >
                    <option value="">— Sin asignar —</option>
                    {capillas.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="pt-2 flex justify-end space-x-2">
            <button type="button" onClick={() => { resetForm(); onClose(); }} className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={submitting || (personaMode === 'vincular' && !selectedPersona && !isEditing)}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'GUARDANDO...' : isEditing ? 'ACTUALIZAR USUARIO' : 'GUARDAR USUARIO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Componente Principal ────────────────────────────────────────────────────

export const UsuariosFeature: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [capillas, setCapillas] = useState<Capilla[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserAccount | null>(null);
  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterCapilla, setFilterCapilla] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const { user: currentUser } = useAuth();
  
  const getAvailableRoles = () => {
    const curRole = currentUser?.role;
    if (curRole === 'SUPERADMIN') return ROLES;
    if (curRole === 'ADMINISTRADOR') return ROLES.filter(r => r !== 'SUPERADMIN');
    if (curRole === 'PARROCO') return ['SACERDOTE', 'RECTOR', 'SECRETARIO'];
    if (curRole === 'RECTOR') return ['SECRETARIO'];
    return [];
  };
  const availableRoles = getAvailableRoles();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
    setLoading(false);
  }, []);

  const loadCapillas = useCallback(async () => {
    try {
      const data = await apiService.getCapillas();
      setCapillas(data);
    } catch (err) {
      console.error('Error al cargar capillas:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadCapillas();
  }, [loadUsers, loadCapillas]);

  const handleToggleActive = async (user: UserAccount) => {
    try {
      const res = await apiService.toggleUserActive(user.id);
      triggerAlert(res.is_active ? 'activo' : 'inactivo', `USUARIO ${user.username.toUpperCase()} ${res.is_active ? 'ACTIVADO' : 'DESACTIVADO (BAJA LÓGICA)'}`);
      loadUsers();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      triggerAlert('error', 'ERROR AL CAMBIAR EL ESTADO DEL USUARIO');
    }
  };

  const handleEdit = (user: UserAccount) => {
    setEditUser(user);
    setIsCreateOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setEditUser(null);
  };

  const columns = [
    {
      header: 'Usuario',
      render: (u: UserAccount) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 overflow-hidden flex items-center justify-center">
            {u.foto_url && u.foto_url !== '/media/fotos_perfil/default.jpg' ? (
              <img src={u.foto_url} alt={u.username} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-xs">{u.username}</p>
            <p className="text-[10px] text-slate-500">{u.persona?.nombre_completo || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Correo Electrónico',
      render: (u: UserAccount) => <span className="text-xs">{u.email}</span>,
    },
    {
      header: 'Rol Asignado',
      render: (u: UserAccount) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {u.role || '—'}
        </span>
      ),
    },
    {
      header: 'Capillas Asignadas',
      render: (u: UserAccount) => (
        <span className="text-xs">
          {u.capillas && u.capillas.length > 0 
            ? u.capillas.map(c => c.nombre).join(', ') 
            : '—'}
        </span>
      ),
    },
    {
      header: 'Estado',
      render: (u: UserAccount) => (
        <StatusToggleButton
          isActive={u.is_active}
          onToggle={() => handleToggleActive(u)}
        />
      ),
    },
    {
      header: 'Acciones',
      className: 'text-center',
      render: (u: UserAccount) => (
        <div className="flex items-center justify-center gap-1.5">
          <EditButton onClick={() => handleEdit(u)} />
        </div>
      ),
    },
  ];

  // Filtrado local del lado del cliente
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    
    // El buscador de texto YA NO busca por Rol o Estado, solo por texto libre
    const matchesSearch =
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.persona?.nombre_completo || '').toLowerCase().includes(term);

    const matchesRole = filterRole ? u.role === filterRole : true;
    const matchesCapilla = filterCapilla ? u.capillas?.some(c => c.id === filterCapilla) : true;
    const matchesStatus = filterStatus ? (filterStatus === 'ACTIVO' ? u.is_active : !u.is_active) : true;

    return matchesSearch && matchesRole && matchesCapilla && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      <FeatureHeader
        title="GESTIÓN DE CUENTAS DE USUARIOS"
        description="Administración centralizada de accesos, capillas asignadas y bajas lógicas (Soft Delete). Creación simultánea de Usuario + Persona."
        icon={Users}
        action={
          <button
            onClick={() => { setEditUser(null); setIsCreateOpen(true); }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREAR USUARIO</span>
          </button>
        }
      />

      {/* Barra de búsqueda con filtros avanzados */}
      <FeatureSearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="BUSCAR POR NOMBRE, CORREO O PERSONA..."
        selectFilters={[
          {
            value: filterStatus,
            onChange: setFilterStatus,
            placeholder: 'TODOS LOS ESTADOS',
            options: [
              { label: 'ACTIVOS', value: 'ACTIVO' },
              { label: 'INACTIVOS', value: 'INACTIVO' }
            ],
          },
          {
            value: filterRole,
            onChange: setFilterRole,
            placeholder: 'TODOS LOS ROLES',
            options: availableRoles.map((role) => ({ label: role, value: role })),
          },
          {
            value: filterCapilla,
            onChange: setFilterCapilla,
            placeholder: 'TODAS LAS CAPILLAS',
            options: capillas.map((c) => ({ label: c.nombre, value: c.id })),
          }
        ]}
      />

      {/* Tabla de Usuarios */}
      <FeatureTable
        title="Usuarios Registrados"
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No se encontraron usuarios registrados."
        defaultPageSize={20}
      />

      {/* Modal Crear/Editar Usuario */}
      <UserFormModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        onSuccess={loadUsers}
        triggerAlert={triggerAlert as (type: string, message: string) => void}
        capillas={capillas}
        editUser={editUser}
      />
    </div>
  );
};
