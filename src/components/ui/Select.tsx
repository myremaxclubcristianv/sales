import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: { value: string; label: string }[]
  children?: React.ReactNode
}

export function Select({ label, error, options, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {options ? options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )) : children}
      </select>
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  )
}
