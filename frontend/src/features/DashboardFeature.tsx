import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Building2, Users, ScanLine, FileText, ArrowUpRight, LayoutDashboard } from 'lucide-react';

export const DashboardFeature: React.FC = () => {
  const navigate = useNavigate();
  const stats = [
    { label: 'Capillas Registradas', value: '5', icon: Building2, color: 'from-blue-600 to-blue-700' },
    { label: 'Partidas Bautismo', value: '1,248', icon: BookOpen, color: 'from-blue-500 to-indigo-600' },
    { label: 'Partidas Matrimonio', value: '412', icon: Heart, color: 'from-rose-500 to-rose-600' },
    { label: 'Personas en Sistema', value: '3,890', icon: Users, color: 'from-emerald-500 to-teal-600' },
  ];

  const capillasList = [
    { nombre: 'SANTÍSIMA TRINIDAD', tipo: 'SEDE PRINCIPAL', tel: '74185852', cap: '200 personas' },
    { nombre: 'SANTUARIO JESÚS DEL GRAN PODER', tipo: 'CAPILLA', tel: '72062964', cap: '200 personas' },
    { nombre: 'SANTA RITA', tipo: 'CAPILLA', tel: '67107486', cap: '200 personas' },
    { nombre: 'SEÑOR DE EXALTACIÓN', tipo: 'CAPILLA', tel: '74856914', cap: '200 personas' },
    { nombre: 'CAPILLA DE SANTA MÓNICA', tipo: 'CAPILLA', tel: '741', cap: '200 personas' },
  ];

  return (
    <div className="space-y-4">
      {/* Banner Top — compacto */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white shadow-md border border-blue-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
            Parroquia Santísima Trinidad
          </span>
          <h2 className="text-sm sm:text-base font-bold mt-1.5 text-white flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Sistema Centralizado de Registros Sacramentales
          </h2>
          <p className="text-[11px] text-blue-200/80 mt-0.5">
            Administración unificada para las 5 capillas de la jurisdicción parroquial en La Paz, Bolivia.
          </p>
        </div>
        <button
          onClick={() => navigate('/ocr')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-sm cursor-pointer"
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>Digitalizar Libro con IA</span>
        </button>
      </div>

      {/* Stats Grid — compacto */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors"
            >
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  {stat.label}
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Capillas List Card */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Capillas bajo la Jurisdicción Parroquial
            </h3>
            <button
              onClick={() => navigate('/capillas')}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 uppercase cursor-pointer"
            >
              Ver Todas <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-blue-50 dark:divide-slate-800">
            {capillasList.map((c, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase">
                    {c.nombre}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Teléf: {c.tel} | Capacidad: {c.cap}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    c.tipo === 'SEDE PRINCIPAL'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {c.tipo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/bautismos')}
                className="w-full text-left p-3 rounded-xl bg-blue-50/50 dark:bg-slate-800/50 hover:bg-blue-100 dark:hover:bg-slate-800 border border-blue-100 dark:border-slate-700/60 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                  Nueva Partida de Bautismo
                </span>
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              </button>

              <button
                onClick={() => navigate('/matrimonios')}
                className="w-full text-left p-3 rounded-xl bg-blue-50/50 dark:bg-slate-800/50 hover:bg-blue-100 dark:hover:bg-slate-800 border border-blue-100 dark:border-slate-700/60 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                  Nuevo Registro de Matrimonio
                </span>
                <Heart className="w-3.5 h-3.5 text-rose-500" />
              </button>

              <button
                onClick={() => navigate('/notas')}
                className="w-full text-left p-3 rounded-xl bg-blue-50/50 dark:bg-slate-800/50 hover:bg-blue-100 dark:hover:bg-slate-800 border border-blue-100 dark:border-slate-700/60 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                  Emitir Nota Marginal
                </span>
                <FileText className="w-3.5 h-3.5 text-amber-500" />
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 text-center">
            <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
              Modo Mayúsculas Activo
            </p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
              Todos los datos se guardan automáticamente en mayúsculas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
