import React from 'react'

export function Input({ type = 'text', placeholder = '', onChange, className = '' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  )
}
