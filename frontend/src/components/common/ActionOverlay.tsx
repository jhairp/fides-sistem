import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  XCircle,
  ShieldCheck,
  Edit3,
  Trash2,
  Users,
} from 'lucide-react';

export type ActionOverlayType =
  | 'creado'
  | 'editado'
  | 'eliminado'
  | 'activo'
  | 'inactivo'
  | 'error'
  | 'asignado'
  | 'desasignado';

interface ActionOverlayProps {
  isVisible: boolean;
  type?: ActionOverlayType;
}

export const ActionOverlay: React.FC<ActionOverlayProps> = ({ isVisible, type = 'creado' }) => {
  const config = {
    creado: {
      bg: 'bg-emerald-500/20',
      icon: <Check size={180} className="text-emerald-500" strokeWidth={3} />,
      glow: 'shadow-[0_0_150px_rgba(16,185,129,0.4)]',
    },
    editado: {
      bg: 'bg-amber-400/25',
      icon: <Edit3 size={180} className="text-amber-400" strokeWidth={3} />,
      glow: 'shadow-[0_0_150px_rgba(251,191,36,0.45)]',
    },
    eliminado: {
      bg: 'bg-rose-500/20',
      icon: <Trash2 size={180} className="text-rose-500" />,
      glow: 'shadow-[0_0_150px_rgba(244,63,94,0.4)]',
    },
    activo: {
      bg: 'bg-emerald-500/20',
      icon: <ShieldCheck size={180} className="text-emerald-500" />,
      glow: 'shadow-[0_0_150px_rgba(16,185,129,0.4)]',
    },
    inactivo: {
      bg: 'bg-orange-500/20',
      icon: <XCircle size={180} className="text-orange-500" />,
      glow: 'shadow-[0_0_150px_rgba(245,158,11,0.4)]',
    },
    error: {
      bg: 'bg-rose-600/30',
      icon: <XCircle size={180} className="text-rose-600" />,
      glow: 'shadow-[0_0_150px_rgba(225,29,72,0.4)]',
    },
    asignado: {
      bg: 'bg-blue-600/20',
      icon: <Users size={180} className="text-blue-500" strokeWidth={2.5} />,
      glow: 'shadow-[0_0_150px_rgba(37,99,235,0.5)]',
    },
    desasignado: {
      bg: 'bg-indigo-900/30',
      icon: <Users size={180} className="text-indigo-400" strokeWidth={2.5} />,
      glow: 'shadow-[0_0_150px_rgba(79,70,229,0.4)]',
    },
  };

  const current = config[type] || config.creado;

  const overlayContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md ${current.bg}`}
          style={{ pointerEvents: 'none' }}
        >
          <motion.div
            initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 3, opacity: 0, filter: 'blur(12px)' }}
            transition={{ type: 'spring', damping: 10, stiffness: 120 }}
            className={`rounded-full p-10 ${current.glow} bg-white/10 dark:bg-black/20`}
          >
            {current.icon}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined'
    ? createPortal(overlayContent, document.body)
    : null;
};

export default ActionOverlay;
