import React, { useState } from 'react';
import { Church, Sun, Moon, LogOut, User as UserIcon, Building2, Menu, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { NotificationCenter } from './NotificationCenter';
import { UserProfileModal } from './UserProfileModal';

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [selectedCapilla, setSelectedCapilla] = useState('SANTÍSIMA TRINIDAD (SEDE)');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isMoniUser =
    user?.username?.toLowerCase() === 'monicabuscador' ||
    user?.email?.toLowerCase() === 'monicabuscador@gmail.com';

  const effectiveCapilla = isMoniUser ? 'SANTUARIO JESÚS DEL GRAN PODER' : selectedCapilla;

  const capillas = [
    'SANTÍSIMA TRINIDAD (SEDE)',
    'SANTUARIO JESÚS DEL GRAN PODER',
    'SANTA RITA',
    'SEÑOR DE EXALTACIÓN',
    'CAPILLA DE SANTA MÓNICA'
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 transition-colors shadow-sm">
        {/* Left: Mobile Menu Toggle + Brand Identity */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-slate-100 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Abrir menú"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-bold shadow-sm">
              <Church className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 m-0 leading-none">
                Fides<span className="text-blue-600 dark:text-blue-400">System</span>
              </h1>
              <p className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Parroquia Santísima Trinidad — La Paz
              </p>
            </div>
          </div>
        </div>

        {/* Center: Chapel Switcher (Desktop) - Fijo en Gran Poder para monicabuscador */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="relative">
            {isMoniUser ? (
              <div
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-xs cursor-default select-none"
                title="Capilla asignada exclusiva y no modificable para este usuario"
              >
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-[11px] font-extrabold uppercase tracking-wide">
                  SANTUARIO JESÚS DEL GRAN PODER
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-200/70 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 font-black uppercase">
                  ASIGNADO
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-xs font-medium text-blue-900 dark:text-blue-200">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <select
                  value={effectiveCapilla}
                  onChange={(e) => setSelectedCapilla(e.target.value)}
                  className="bg-transparent outline-none font-bold cursor-pointer uppercase text-[11px]"
                >
                  {capillas.map((c, i) => (
                    <option key={i} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Toggle Theme */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-blue-900" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile Avatar */}
          {user && (
            <div className="flex items-center space-x-1.5 sm:space-x-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                title="Ver Mi Perfil"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white font-bold shadow-sm">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden xl:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                    {user.username}
                  </p>
                  <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    {user.is_superuser ? 'SuperAdmin' : 'Personal'}
                  </span>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1.5 sm:p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
