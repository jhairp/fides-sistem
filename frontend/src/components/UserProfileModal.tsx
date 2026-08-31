import React, { useState } from 'react';
import { User, ShieldCheck, Mail, Building2, Key, CheckCircle2, X, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen || !user) return null;

  const rolLabel = user.role || (user.is_superuser ? 'SUPERADMIN' : 'PERSONAL PARROQUIAL');
  const capillaLabel = user.capilla_nombre || user.persona?.nombre_completo || 'SIN ASIGNAR';
  const personaLabel = user.persona?.nombre_completo || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;

  const permisosMap: Record<string, string[]> = {
    SUPERADMIN: [
      'GESTIÓN TOTAL MULTI-PARROQUIA Y CAPILLAS',
      'CREACIÓN Y ASIGNACIÓN DE ROLES Y GRUPOS DE PERMISOS',
      'CREACIÓN, MODIFICACIÓN Y RECTIFICACIÓN DE PARTIDAS',
      'EJECUCIÓN DE PROCESAMIENTO OCR Y REVISIÓN CON IA',
      'EMISIÓN Y AUTENTICACIÓN DE CERTIFICADOS EN PDF CON QR',
      'ACCESO COMPLETO AL HISTORIAL DE AUDITORÍA (JSONB)',
    ],
    ADMINISTRADOR: [
      'CREACIÓN Y APERTURA DE LIBROS SACRAMENTALES',
      'GESTIÓN DE CAPILLAS DEPENDIENTES Y CAPACIDAD',
      'EMISIÓN DE REPORTES Y ESTADÍSTICAS PARROQUIALES',
    ],
    PARROCO: [
      'FIRMA CANÓNICA DE PARTIDAS Y CERTIFICADOS',
      'EMISIÓN DE NOTAS MARGINALES Y DECRETOS',
      'APROBACIÓN DE RECTIFICACIONES Y NULIDADES',
    ],
    RECTOR: [
      'INSCRIPCIÓN DE PARTIDAS DE BAUTISMO Y MATRIMONIO',
      'ADMINISTRACIÓN DE AGENDA LITÚRGICA',
    ],
    SECRETARIO: [
      'INSCRIPCIÓN Y BÚSQUEDA DE PERSONAS',
      'CARGA DE ESCANEOS E INTERPRETACIÓN OCR CON IA',
      'EMISIÓN DE CERTIFICADOS IMPRESOS CON QR',
    ],
    SACERDOTE: [
      'CONSULTA DE AGENDA DE MISAS E INTENCIONES',
      'VERIFICACIÓN DE REQUISITOS SACRAMENTALES',
    ],
    FELIGRES: [
      'SOLICITUD DE INTENCIONES EN LÍNEA',
      'CONSULTA DE HORARIOS DE CAPILLAS',
    ],
  };

  const permisos = permisosMap[rolLabel] || permisosMap['FELIGRES'];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setPasswordMsg('');
    setPasswordSuccess(false);
    try {
      await apiService.changePassword(currentPassword, newPassword);
      setPasswordMsg('CONTRASEÑA ACTUALIZADA EXITOSAMENTE');
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setPasswordMsg(error.response?.data?.error || 'ERROR AL CAMBIAR LA CONTRASEÑA');
      setPasswordSuccess(false);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-2xl space-y-5 uppercase">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20 overflow-hidden">
              {user.foto_url && user.foto_url !== '/media/fotos_perfil/default.jpg' ? (
                <img src={user.foto_url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                EXPEDIENTE DE MI PERFIL DE USUARIO
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">VERIFICACIÓN Y PERMISOS DEL ROL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 block mb-1">NOMBRE DE USUARIO</span>
            <p className="font-black text-blue-700 dark:text-blue-400 text-sm">{user.username}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 normal-case">{personaLabel}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 block mb-1">CORREO ELECTRÓNICO</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              {user.email}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 block mb-1">ROL DEL SISTEMA</span>
            <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] inline-block">
              {rolLabel}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 block mb-1">CAPILLA ASIGNADA</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              {capillaLabel}
            </p>
          </div>
        </div>

        {/* Active Permissions Matrix */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            PERMISOS ACTIVOS ASIGNADOS AL ROL
          </h4>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            {permisos.map((perm, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="space-y-2">
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase cursor-pointer hover:text-amber-500 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            {showChangePassword ? 'OCULTAR CAMBIAR CONTRASEÑA' : 'CAMBIAR MI CONTRASEÑA'}
          </button>

          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 space-y-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">CONTRASEÑA ACTUAL</label>
                <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">NUEVA CONTRASEÑA</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs" />
              </div>
              {passwordMsg && (
                <p className={`text-[10px] font-bold ${passwordSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>{passwordMsg}</p>
              )}
              <button type="submit" disabled={saving} className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-[10px] uppercase cursor-pointer disabled:opacity-50">
                {saving ? 'GUARDANDO...' : 'ACTUALIZAR CONTRASEÑA'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-extrabold">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>ESTADO DE CUENTA: ACTIVA & VERIFICADA</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black text-xs uppercase hover:bg-slate-800 cursor-pointer"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
};
