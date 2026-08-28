import React from 'react';
import { User, ShieldCheck, Mail, Building2, Key, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!isOpen || !user) return null;

  const permisosSuperAdmin = [
    'GESTIÓN TOTAL MULTI-PARROQUIA Y CAPILLAS',
    'CREACIÓN Y ASIGNACIÓN DE ROLES Y GRUPOS DE PERMISOS',
    'CREACIÓN, MODIFICACIÓN Y RECTIFICACIÓN DE PARTIDAS',
    'EJECUCIÓN DE PROCESAMIENTO OCR Y REVISIÓN CON IA',
    'EMISIÓN Y AUTENTICACIÓN DE CERTIFICADOS EN PDF CON QR',
    'ACCESO COMPLETO AL HISTORIAL DE AUDITORÍA (JSONB)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl p-6 rounded-3xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-2xl space-y-5 uppercase">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
              <User className="w-5 h-5" />
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
              {user.is_superuser ? 'SUPERADMINISTRADOR' : 'PERSONAL PARROQUIAL'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 block mb-1">CAPILLA ASIGNADA</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              SANTÍSIMA TRINIDAD (SEDE)
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
            {permisosSuperAdmin.map((perm, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
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
