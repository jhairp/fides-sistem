import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
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
  const currentPath = location.pathname.substring(1) || 'dashboard';

  const menuSections = [
    {
      label: 'SACRAMENTOS',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'busqueda', label: 'Búsqueda Personas', icon: Search },
        { id: 'bautismos', label: 'Bautismos', icon: BookOpen },
        { id: 'matrimonios', label: 'Matrimonios', icon: Heart },
        { id: 'notas', label: 'Notas Marginales', icon: FileText },
      ],
    },
    {
      label: 'HERRAMIENTAS',
      items: [
        { id: 'ocr', label: 'OCR (IA)', icon: ScanLine },
        { id: 'capillas', label: 'Capillas', icon: Building2 },
        { id: 'eventos', label: 'Eventos y Misas', icon: Calendar },
        { id: 'comprobantes', label: 'Certificados QR', icon: QrCode },
      ],
    },
    {
      label: 'ADMINISTRACIÓN',
      items: [
        { id: 'usuarios', label: 'Usuarios', icon: Users },
        { id: 'roles', label: 'Roles y Permisos', icon: ShieldCheck },
        { id: 'auditoria', label: 'Auditoría', icon: ClipboardList },
      ],
    },
  ];

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

        {menuSections.map((section) => (
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
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Parish Footer Card */}
      <div className="mt-4 p-3 bg-blue-50/60 dark:bg-slate-800/40 rounded-xl border border-blue-100/60 dark:border-slate-800 text-center">
        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400">PARROQUIA SANTÍSIMA TRINIDAD</p>
        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Arquidiócesis de La Paz</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Slide-over */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative z-50 w-56 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 h-full p-3 flex flex-col justify-between border-r border-blue-100 dark:border-slate-800 shadow-2xl overflow-y-auto">
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop Sticky Floating Sidebar */}
      <aside className="hidden md:block w-52 flex-shrink-0 sticky top-[57px] h-[calc(100vh-72px)] my-2 ml-4 p-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm overflow-y-auto">
        {navContent}
      </aside>
    </>
  );
};
