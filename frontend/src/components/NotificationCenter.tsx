import React, { useState } from 'react';
import { Bell, Check, Trash2, Info, CheckCircle2, ScanLine, FileText } from 'lucide-react';

export interface NotificationItem {
  id: string;
  tipo: 'OCR' | 'REGISTRO' | 'NOTA' | 'SISTEMA';
  titulo: string;
  descripcion: string;
  tiempo: string;
  leido: boolean;
}

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      tipo: 'REGISTRO',
      titulo: 'NUEVO BAUTISMO REGISTRADO',
      descripcion: 'JUAN CARLOS MAMANI PEREZ REGISTRADO EN CAPILLA SANTÍSIMA TRINIDAD.',
      tiempo: 'HACE 10 MIN',
      leido: false,
    },
    {
      id: '2',
      tipo: 'OCR',
      titulo: 'PROCESAMIENTO OCR COMPLETADO',
      descripcion: 'RECONOCIMIENTO DE IA AL 94.5% EN LIBRO N° 1 DE BAUTISMOS.',
      tiempo: 'HACE 35 MIN',
      leido: false,
    },
    {
      id: '3',
      tipo: 'NOTA',
      titulo: 'NOTA MARGINAL VINCULADA',
      descripcion: 'ANOTACIÓN DE MATRIMONIO VINCULADA A BAUTISMO DE SANTA RITA.',
      tiempo: 'HACE 2 HORAS',
      leido: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.leido).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all border border-blue-100 dark:border-slate-700 cursor-pointer"
        title="Centro de Notificaciones"
      >
        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-black text-white bg-rose-600 rounded-full shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden space-y-0">
          <div className="p-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-300" />
              <h3 className="text-xs font-black uppercase tracking-wider">NOTIFICACIONES</h3>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-extrabold uppercase bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> MARCAR LEÍDAS
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-[10px] font-extrabold uppercase bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Limpiar todas"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold uppercase">
                No hay notificaciones recientes.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start space-x-3 transition-colors ${
                    n.leido ? 'bg-white dark:bg-slate-900' : 'bg-blue-50/50 dark:bg-slate-800/60 font-bold'
                  }`}
                >
                  <div className="mt-0.5">
                    {n.tipo === 'OCR' && <ScanLine className="w-4 h-4 text-blue-600" />}
                    {n.tipo === 'REGISTRO' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {n.tipo === 'NOTA' && <FileText className="w-4 h-4 text-amber-600" />}
                    {n.tipo === 'SISTEMA' && <Info className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 uppercase">
                        {n.titulo}
                      </p>
                      <span className="text-[9px] font-semibold text-slate-400">{n.tiempo}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 uppercase leading-snug">
                      {n.descripcion}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
