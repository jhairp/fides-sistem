import React from 'react';
import { Search, X } from 'lucide-react';

export interface SelectFilterOption {
  label: string;
  value: string;
}

export interface SelectFilter {
  value: string;
  onChange: (value: string) => void;
  options: SelectFilterOption[];
  placeholder?: string;
}

interface FeatureSearchFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (e: React.FormEvent) => void;
  selectFilters?: SelectFilter[];
  onClear?: () => void;
}

export const FeatureSearchFilters: React.FC<FeatureSearchFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  placeholder = 'EJEMPLO: BUSCAR...',
  onSearch,
  selectFilters = [],
  onClear,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(e);
    }
  };

  const handleClear = () => {
    onSearchTermChange('');
    selectFilters.forEach(filter => filter.onChange(''));
    if (onClear) onClear();
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value.toUpperCase())}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {selectFilters.map((filter, index) => (
          <div key={index} className="relative min-w-[150px]">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full p-2 pr-8 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold uppercase cursor-pointer outline-none focus:ring-2 focus:ring-blue-600"
            >
              {filter.placeholder && (
                <option value="">{filter.placeholder}</option>
              )}
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          type="button"
          onClick={handleClear}
          title="Limpiar todos los filtros"
          className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all shadow-sm flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
