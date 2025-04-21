import React from 'react'

export function Button({ children, onClick, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800 ${className}`}
    >
      {children}
    </button>
  )
}
