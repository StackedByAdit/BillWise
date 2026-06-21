import type { ReactNode } from 'react'

export function RequiredMark() {
  return (
    <span className="ml-0.5 text-red-500" aria-hidden="true">
      *
    </span>
  )
}

export function FieldLabel({
  htmlFor,
  required = false,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required ? <RequiredMark /> : null}
    </label>
  )
}
