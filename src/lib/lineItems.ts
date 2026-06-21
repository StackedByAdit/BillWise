import type { LineItem } from '../types/invoice'

export function calculateLineItemTaxableAmount(item: LineItem): number {
  const subtotal = item.quantity * item.rate
  const discountMultiplier = 1 - item.discountPercent / 100
  return subtotal * discountMultiplier
}

export function createEmptyLineItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    hsnSac: '',
    quantity: 1,
    unit: 'nos',
    rate: 0,
    discountPercent: 0,
    taxRatePercent: 18,
  }
}

export function isLineItemComplete(item: {
  quantity: number
  rate: number
}): boolean {
  return item.quantity > 0 && item.rate > 0
}

export function formatLineItemAmount(item: LineItem): string {
  if (!isLineItemComplete(item)) {
    return '—'
  }

  return formatIndianCurrency(calculateLineItemTaxableAmount(item))
}

export function clampDiscountPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, value))
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function parseNumericInput(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatNumericFieldValue(
  value: number,
  emptyWhenZero = false,
): string {
  if (emptyWhenZero && value === 0) {
    return ''
  }

  return Number.isFinite(value) ? String(value) : ''
}
