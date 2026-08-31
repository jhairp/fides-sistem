import React, { useState } from 'react';
import { Users, Plus, User } from 'lucide-react';
import type { UserAccount } from '../domain/types';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureTable } from '../components/common/FeatureTable';
import { FeatureSearchFilters } from '../components/common/FeatureSearchFilters';

export const UsuariosFeature: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: '1',
      username: 'SuperAdmin',
      email: 'suad@gmail.com',
      role: 'SUPERADMIN',
      capilla_nombre: 'SANTÍSIMA TRINIDAD (SEDE)',
      is_active: true,
      created_at: '2026-08-01',
    },
    {
      id: '2',
      username: 'PadreAlberto',
      email: 'alberto.quispe@fidessystem.org',
      role: 'PARROCO',
      capilla_nombre: 'SANTÍSIMA TRINIDAD (SEDE)',
      is_active: true,
      created_at: '2026-08-05',
    },
    {
      id: '3',
      username: 'SecretariaMaria',
      email: 'maria.secretaria@fidessystem.org',
      role: 'SECRETARIO',
      capilla_nombre: 'SANTUARIO JESÚS DEL GRAN PODER',
      is_active: true,
      created_at: '2026-08-10',
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'SECRETARIO' as UserAccount['role'],
    capilla_nombre: 'SANTÍSIMA TRINIDAD (SEDE)',
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAccount = {
      id: String(Date.now()),
      username: formData.username,
      email: formData.email,
      role: formData.role,
      capilla_nombre: formData.capilla_nombre,
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    triggerAlert('creado', 'USUARIO Y ROL ASIGNADO EXITOSAMENTE');
    setIsCreateOpen(false);
    setFormData({ username: '', email: '', role: 'SECRETARIO', capilla_nombre: 'SANTÍSIMA TRINIDAD (SEDE)' });
  };

  const handleToggleActive = (user: UserAccount) => {
    const nextActive = !user.is_active;
    setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: nextActive } : u)));
    triggerAlert(nextActive ? 'activo' : 'inactivo', `USUARIO ${user.username} ${nextActive ? 'ACTIVADO' : 'DESACTIVADO (BAJA LÓGICA)'}`);
  };

  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      header: 'Usuario',
      render: (u: UserAccount) => (
        <div className="flex items-center gap-2 font-bold">
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <span>{u.username}</span>
        </div>
      ),
    },
    {
      header: 'Correo Electrónico',
      render: (u: UserAccount) => <span>{u.email}</span>,
    },
    {
      header: 'Rol Asignado',
      render: (u: UserAccount) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {u.role}
        </span>
      ),
    },
    {
      header: 'Capilla',
      render: (u: UserAccount) => <span>{u.capilla_nombre || '—'}</span>,
    },
    {
      header: 'Estado',
      render: (u: UserAccount) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          u.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
        }`}>
          {u.is_active ? 'ACTIVO' : 'INACTIVO'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      render: (u: UserAccount) => (
        <button
          onClick={() => handleToggleActive(u)}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
        >
          {u.is_active ? 'Desactivar' : 'Activar'}
        </button>
      ),
    },
  ];

  // Client-side search filtering
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.role.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4">
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      <FeatureHeader
        title="GESTIÓN DE CUENTAS DE USUARIOS"
        description="Administración centralizada de accesos, capillas asignadas y bajas lógicas (Soft Delete)."
        icon={Users}
        action={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREAR USUARIO</span>
          </button>
        }
      />

      {/* Reusable Search Filters */}
      <FeatureSearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="BUSCAR POR NOMBRE, CORREO O ROL..."
      />

      {/* Reusable Data Table */}
      <FeatureTable
        title="Usuarios Registrados"
        columns={columns}
        data={filteredUsers}
        loading={false}
        emptyMessage="No se encontraron usuarios registrados."
        defaultPageSize={20}
      />

      {/* Modal Crear Usuario */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Registrar Nuevo Usuario del Sistema
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">NOMBRE DE USUARIO *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">CORREO ELECTRÓNICO *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">ROL DEL SISTEMA *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="SUPERADMIN">SUPERADMIN</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                    <option value="PARROCO">PÁRROCO</option>
                    <option value="RECTOR">RECTOR</option>
                    <option value="SECRETARIO">SECRETARIO</option>
                    <option value="SACERDOTE">SACERDOTE</option>
                    <option value="FELIGRES">FELIGRÉS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">CAPILLA ASIGNADA</label>
                  <input
                    type="text"
                    value={formData.capilla_nombre}
                    onChange={(e) => setFormData({ ...formData, capilla_nombre: e.target.value.toUpperCase() })}
                    className="w-full p-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
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
                  GUARDAR USUARIO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
