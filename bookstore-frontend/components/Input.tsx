'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all ${
          error ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
        <span className="mr-1">⚠</span>
        {error}
      </p>}
    </div>
  );
}

