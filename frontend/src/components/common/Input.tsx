import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  autoUppercase?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  autoUppercase = true,
  onChange,
  className = '',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (autoUppercase && e.target.type === 'text') {
      e.target.value = e.target.value.toUpperCase();
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">
          {label}
        </label>
      )}
      <input
        onChange={handleChange}
        className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`}
        {...props}
      />
    </div>
  );
};
