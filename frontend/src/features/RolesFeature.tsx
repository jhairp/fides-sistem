import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Edit3 } from 'lucide-react';
import { apiService } from '../services/api';
import type { Rol, Permiso } from '../domain/types';
import { EditButton } from '../components/common/TableButtons';
import { FeatureSearchFilters } from '../components/common/FeatureSearchFilters';
import ActionOverlay from '../components/common/ActionOverlay';
import { useActionAlert } from '../hooks/useActionAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureTable, type TableColumn } from '../components/common/FeatureTable';

export const RolesFeature: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ codigo: '', nombre: '', descripcion: '' });
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);
  const [formError, setFormError] = useState('');

  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, permisosData] = await Promise.all([
        apiService.getRoles(),
        apiService.getPermisos()
      ]);
      setRoles(rolesData);
      setPermisos(permisosData);
    } catch (error) {
      triggerAlert('eliminado', 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({ codigo: rol.codigo, nombre: rol.nombre, descripcion: rol.descripcion });
      setSelectedPermisos(rol.permiso_ids || []);
    } else {
      setEditingRol(null);
      setFormData({ codigo: '', nombre: '', descripcion: '' });
      setSelectedPermisos([]);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRol(null);
  };

  const handleTogglePermiso = (id: number) => {
    setSelectedPermisos(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const payload = { ...formData, permiso_ids: selectedPermisos };
    
    try {
      if (editingRol) {
        await apiService.updateRol(editingRol.id, payload);
        triggerAlert('editado', 'Rol actualizado correctamente');
      } else {
        await apiService.createRol(payload);
        triggerAlert('creado', 'Rol creado correctamente');
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Error al guardar el rol. Verifica los datos.');
    }
  };

  const filteredRoles = roles.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: TableColumn<Rol>[] = [
    {
      header: 'Código',
      render: (r) => <span className="font-bold text-slate-800 dark:text-slate-200">{r.codigo}</span>,
    },
    {
      header: 'Nombre',
      render: (r) => r.nombre,
    },
    {
      header: 'Permisos',
      render: (r) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {r.permiso_ids?.length || 0} asignados
        </span>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-center',
      render: (r) => (
        <div className="flex justify-center">
          <EditButton onClick={() => openModal(r)} title="Editar Rol" />
        </div>
      ),
    },
  ];

  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase mb-1";
  const inputClass = "w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase outline-none transition-all";

  // Group permissions by model name
  const groupedPermisos = permisos.reduce((acc, p) => {
    const groupName = p.name.split(' ').slice(2).join(' ') || 'Otros';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(p);
    return acc;
  }, {} as Record<string, Permiso[]>);

  return (
    <div className="space-y-4">
      <ActionOverlay isVisible={isVisible} type={alertType} message={alertMessage} />
      
      <FeatureHeader
        title="Gestión de Roles y Permisos"
        description="Administración de los roles y niveles de acceso del sistema"
        icon={ShieldCheck}
        action={
          <button
            onClick={() => openModal()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>NUEVO ROL</span>
          </button>
        }
      />

      <FeatureSearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="BUSCAR POR CÓDIGO O NOMBRE..."
      />

      <FeatureTable
        title="Roles Registrados"
        columns={columns}
        data={filteredRoles}
        loading={loading}
        emptyMessage="No se encontraron roles registrados."
        defaultPageSize={20}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xl">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                {editingRol ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-blue-600" />}
                {editingRol ? 'EDITAR ROL Y PERMISOS' : 'NUEVO ROL Y PERMISOS'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
            </div>
            
            <div className="overflow-y-auto p-5">
              {formError && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase whitespace-pre-line">
                  {formError}
                </div>
              )}
              
              <form id="rolForm" onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                {/* Datos Básicos */}
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Datos del Rol</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Código *</label>
                      <input
                        required
                        type="text"
                        value={formData.codigo}
                        onChange={e => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                        className={inputClass}
                        placeholder="EJ. SECRETARIO"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Nombre *</label>
                      <input
                        required
                        type="text"
                        value={formData.nombre}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                        className={inputClass}
                        placeholder="EJ. SECRETARIO PARROQUIAL"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Descripción</label>
                      <input
                        type="text"
                        value={formData.descripcion}
                        onChange={e => setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })}
                        className={inputClass}
                        placeholder="DESCRIPCIÓN DEL ROL..."
                      />
                    </div>
                  </div>
                </div>

                {/* Matriz de Permisos */}
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matriz de Permisos</p>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {selectedPermisos.length} Seleccionados
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedPermisos).map(([groupName, perms]) => (
                      <div key={groupName} className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50">
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 border-b border-slate-200 dark:border-slate-800 pb-1 capitalize">
                          {groupName}
                        </p>
                        <div className="space-y-2">
                          {perms.map(p => (
                            <label key={p.id} className="flex items-start gap-2 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedPermisos.includes(p.id)}
                                onChange={() => handleTogglePermiso(p.id)}
                                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors uppercase leading-tight">
                                {p.name.replace('Can add', 'Crear').replace('Can change', 'Editar').replace('Can delete', 'Eliminar').replace('Can view', 'Ver')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                form="rolForm"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide cursor-pointer shadow-sm"
              >
                GUARDAR CAMBIOS
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
