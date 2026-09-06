import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Edit3 } from 'lucide-react';
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

  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase mb-1";
  const inputClass = "w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase outline-none transition-all";

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

      {/* Se eliminó el div contenedor para que los filtros se vean exactamente como en UsuariosFeature */}
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

      {/* Form Modal idéntico al de UsuariosFeature */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xl space-y-4">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                {editingRol ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-blue-600" />}
                {editingRol ? 'EDITAR ROL' : 'NUEVO ROL'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 font-bold text-sm cursor-pointer">✕</button>
            </div>
            
            {/* Mensaje de Error */}
            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase whitespace-pre-line">
                {formError}
              </div>
            )}
            
            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold">
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Datos del Rol</p>
                <div className="space-y-3">
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
                  
                  <div>
                    <label className={labelClass}>Descripción</label>
                    <textarea
                      rows={3}
                      value={formData.descripcion}
                      onChange={e => setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })}
                      className={inputClass}
                      placeholder="DESCRIPCIÓN DEL ROL..."
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide cursor-pointer"
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
