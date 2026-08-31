import React from 'react';
import { Edit3 } from 'lucide-react';

interface StatusToggleProps {
  isActive: boolean;
  onToggle: () => void;
  activeText?: string;
  inactiveText?: string;
}

export const StatusToggleButton: React.FC<StatusToggleProps> = ({
  isActive,
  onToggle,
  activeText = 'ACTIVO',
  inactiveText = 'INACTIVO',
}) => {
  return (
    <button
      onClick={onToggle}
      title={isActive ? `Clic para ${inactiveText}` : `Clic para ${activeText}`}
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105 cursor-pointer ${
        isActive
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900'
      }`}
    >
      {isActive ? activeText : inactiveText}
    </button>
  );
};

interface EditButtonProps {
  onClick: () => void;
  title?: string;
}

export const EditButton: React.FC<EditButtonProps> = ({ onClick, title = 'Editar Usuario' }) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-400 text-white dark:bg-amber-500 hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
    >
      <Edit3 className="w-4 h-4" />
    </button>
  );
};
