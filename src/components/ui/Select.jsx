import React from 'react'

export function Select({ options = [], defaultValue = '', onChange, className = '' }) {
  return (
    <select
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
