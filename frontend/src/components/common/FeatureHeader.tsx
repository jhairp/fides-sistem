import React from 'react';

interface FeatureHeaderProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

export const FeatureHeader: React.FC<FeatureHeaderProps> = ({
  title,
  description,
  icon: Icon,
  action,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {description}
        </p>
      </div>

      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
};
