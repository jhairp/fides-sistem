import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export interface TableColumn<T> {
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface FeatureTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading: boolean;
  emptyMessage: string;
  defaultPageSize?: number;
  title?: string;
}

export function FeatureTable<T>({
  columns,
  data,
  loading,
  emptyMessage,
  defaultPageSize = 20,
  title,
}: FeatureTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Total pages calculation
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Sync page if out of bounds (e.g., after filter)
  const activePage = Math.min(currentPage, totalPages);

  // Pagination slice
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm space-y-3">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
            TOTAL: {totalItems} REGISTROS
          </span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold animate-pulse flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          CARGANDO EXPEDIENTES...
        </div>
      ) : totalItems === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/70 dark:bg-slate-800/80 text-blue-900 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <tr>
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className={`py-2.5 px-3 ${col.className || ''} ${
                        index === 0
                          ? 'rounded-l-xl'
                          : index === columns.length - 1
                          ? 'rounded-r-xl'
                          : ''
                      }`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200 uppercase">
                {paginatedData.map((item, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`py-2.5 px-3 ${col.className || ''}`}>
                        {col.render ? col.render(item, startIndex + rowIdx) : (item as any)[col.header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <div>
              {totalItems > 0 ? (
                <span>
                  MOSTRANDO {startIndex + 1}-{endIndex} DE {totalItems} REGISTROS
                </span>
              ) : (
                <span>0 REGISTROS</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Rows Per Page Select */}
              <div className="flex items-center gap-1.5">
                <span>MOSTRAR:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none text-[10px]"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={totalItems}>TODOS</option>
                </select>
              </div>

              {/* Prev/Next buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(activePage - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2">
                  PÁG. {activePage} DE {totalPages}
                </span>
                <button
                  type="button"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(activePage + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
