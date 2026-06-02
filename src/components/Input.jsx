import React, { forwardRef, useId } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    placeholder = '',
    className = '',
    ...props
  },
  ref,
) {
  const id = useId()

  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="mb-2 block text-sm font-semibold tracking-wide text-slate-700">{label}</label>}
      <input
        type={type}
        id={id}
        ref={ref}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 ${className}`}
        {...props}
      />
    </div>
  )
})

export default Input
