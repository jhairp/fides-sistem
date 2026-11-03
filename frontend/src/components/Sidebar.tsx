import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  BookOpenCheck,
  BookOpen,
  Heart,
  FileText,
  ScanLine,
  Building2,
  Users,
  ShieldCheck,
  Calendar,
  QrCode,
  ClipboardList,
  X
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isSecretario = user?.role === 'SECRETARIO';
  const defaultTab = isSecretario ? 'busqueda-sacramentos' : 'dashboard';
  const currentPath = location.pathname.substring(1) || defaultTab;

  const menuSections = [
    {
      label: 'SACRAMENTOS',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE', 'FELIGRES'],
        },
        {
          id: 'busqueda',
          label: 'Búsqueda Personas',
          icon: Search,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE'],
        },
        {
          id: 'busqueda-sacramentos',
          label: 'Búsqueda Sacramentos',
          icon: BookOpenCheck,
          roles: ['SECRETARIO', 'SUPERADMIN'],
        },
        {
          id: 'bautismos',
          label: 'Bautismos',
          icon: BookOpen,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE'],
        },
        {
          id: 'matrimonios',
          label: 'Matrimonios',
          icon: Heart,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE'],
        },
        {
          id: 'notas',
          label: 'Notas Marginales',
          icon: FileText,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE'],
        },
      ],
    },
    {
      label: 'HERRAMIENTAS',
      items: [
        {
          id: 'ocr',
          label: 'OCR (IA)',
          icon: ScanLine,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE'],
        },
        {
          id: 'capillas',
          label: 'Capillas',
          icon: Building2,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE'],
        },
        {
          id: 'eventos',
          label: 'Eventos y Misas',
          icon: Calendar,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE', 'FELIGRES'],
        },
        {
          id: 'comprobantes',
          label: 'Certificados QR',
          icon: QrCode,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE'],
        },
      ],
    },
    {
      label: 'ADMINISTRACIÓN',
      items: [
        {
          id: 'usuarios',
          label: 'Usuarios',
          icon: Users,
          roles: ['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR'],
        },
        {
          id: 'roles',
          label: 'Roles y Permisos',
          icon: ShieldCheck,
          roles: ['SUPERADMIN'],
        },
        {
          id: 'auditoria',
          label: 'Auditoría',
          icon: ClipboardList,
          roles: ['SUPERADMIN', 'ADMINISTRADOR'],
        },
      ],
    },
  ];

  const role = user?.role || 'FELIGRES';
  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);

  const handleSelectTab = (tab: string) => {
    navigate(`/${tab}`);
    setIsMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <nav className="space-y-4">
        <div className="flex items-center justify-between px-3">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-widest">
            MENÚ PRINCIPAL
          </p>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {filteredSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 text-[9px] font-bold text-slate-400/70 dark:text-slate-600 tracking-widest mb-1">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer info canónica */}
      <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-slate-900/40 border border-blue-100/50 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-bold text-slate-700 dark:text-slate-300">ARQUIDIÓCESIS DE LA PAZ</p>
        <p>Parroquia Santísima Trinidad</p>
        <p className="text-[9px] text-slate-400 dark:text-slate-500">FidesSystem v2.0 • 2026</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 hidden md:block self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-3 shadow-xs h-full">
          {navContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-950 p-4 shadow-2xl flex flex-col h-full border-r border-slate-200 dark:border-slate-800">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
