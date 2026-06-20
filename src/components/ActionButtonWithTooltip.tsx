interface ActionButtonWithTooltipProps {
  onClick: () => void
  disabled: boolean
  disabledReason?: string
  loading?: boolean
  loadingLabel: string
  label: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export function ActionButtonWithTooltip({
  onClick,
  disabled,
  disabledReason,
  loading = false,
  loadingLabel,
  label,
  variant = 'secondary',
  className = '',
}: ActionButtonWithTooltipProps) {
  const isDisabled = disabled || loading
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full rounded-md px-4 py-2.5 text-sm font-medium shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
      } ${className}`}
    >
      {loading ? loadingLabel : label}
    </button>
  )

  if (isDisabled && disabledReason) {
    return (
      <span className="block w-full" title={disabledReason}>
        {button}
      </span>
    )
  }

  return button
}
