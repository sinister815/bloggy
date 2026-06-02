import React, { forwardRef, useId } from 'react'

function Select({ label, options = [], className = '', ...props }, ref) {
  const id = useId()

  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="mb-2 block text-sm font-semibold tracking-wide text-slate-700">{label}</label>}
      <select
        {...props}
        id={id}
        ref={ref}
        className={`w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 outline-none transition duration-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 ${className}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default forwardRef(Select)
