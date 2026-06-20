export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) {
    return '—'
  }

  const [year, month, day] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}
