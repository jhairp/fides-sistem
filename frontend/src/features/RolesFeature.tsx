import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { apiService } from '../services/api';
import type { Rol } from '../domain/types';
import { EditButton } from '../components/common/TableButtons';
import { FeatureSearchFilters } from '../components/common/FeatureSearchFilters';
import ActionOverlay from '../components/common/ActionOverlay';
import { useActionAlert } from '../hooks/useActionAlert';
import { FeatureHeader } from '../components/common/FeatureHeader';
import { FeatureTable, type TableColumn } from '../components/common/FeatureTable';

export const RolesFeature: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ codigo: '', nombre: '', descripcion: '' });
  const [formError, setFormError] = useState('');

  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await apiService.getRoles();
      setRoles(data);
    } catch (error) {
      triggerAlert('eliminado', 'Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openModal = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({ codigo: rol.codigo, nombre: rol.nombre, descripcion: rol.descripcion });
    } else {
      setEditingRol(null);
      setFormData({ codigo: '', nombre: '', descripcion: '' });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRol(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingRol) {
        await apiService.updateRol(editingRol.id, formData);
        triggerAlert('editado', 'Rol actualizado correctamente');
      } else {
        await apiService.createRol(formData);
        triggerAlert('creado', 'Rol creado correctamente');
      }
      closeModal();
      fetchRoles();
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
      header: 'Descripción',
      render: (r) => <span className="text-slate-500">{r.descripcion}</span>,
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

  return (
    <div className="space-y-4">
      <ActionOverlay isVisible={isVisible} type={alertType} message={alertMessage} />
      
      <FeatureHeader
        title="Gestión de Roles"
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

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <FeatureSearchFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          placeholder="BUSCAR POR CÓDIGO O NOMBRE..."
        />
      </div>

      <FeatureTable
        columns={columns}
        data={filteredRoles}
        loading={loading}
        emptyMessage="NO SE ENCONTRARON ROLES REGISTRADOS."
      />

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase">
                {editingRol ? 'EDITAR ROL' : 'NUEVO ROL'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800/50">
                  {formError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Código *</label>
                  <input
                    required
                    type="text"
                    value={formData.codigo}
                    onChange={e => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-medium dark:text-slate-100 outline-none transition-all"
                    placeholder="EJ. SECRETARIO"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Nombre *</label>
                  <input
                    required
                    type="text"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-medium dark:text-slate-100 outline-none transition-all"
                    placeholder="EJ. SECRETARIO PARROQUIAL"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Descripción</label>
                  <textarea
                    rows={3}
                    value={formData.descripcion}
                    onChange={e => setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-medium dark:text-slate-100 outline-none transition-all"
                    placeholder="DESCRIPCIÓN DEL ROL..."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  GUARDAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
