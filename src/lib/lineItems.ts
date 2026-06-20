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
