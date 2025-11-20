import React from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

export const IconInput = ({ 
  icon, 
  label, 
  loading = false, 
  error, 
  defaultValue, 
  ...props 
}) => {
  // Remove defaultValue if value is provided to avoid controlled/uncontrolled warning
  const inputProps = props.value !== undefined ? { ...props } : { ...props, defaultValue };
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          {icon && <span className="text-primary-600">{icon}</span>}
          {label}
          {loading && (
            <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />
          )}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <span className="text-gray-500">{icon}</span>
          </div>
        )}
        <input
          {...inputProps}
          className={`w-full px-4 py-3 ${icon ? 'pl-11' : 'pl-4'} bg-white/60 backdrop-blur-md border-2 border-gray-300/60 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white/80 transition-all duration-300 hover:bg-white/70 hover:border-primary-400/70 placeholder:text-gray-400 text-gray-900 font-medium ${inputProps.className || ''}`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
          <FiX className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};