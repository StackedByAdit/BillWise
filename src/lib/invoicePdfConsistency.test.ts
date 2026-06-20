import { describe, expect, it } from 'vitest'
import {
  calculateLineItemTaxableAmount,
  formatIndianCurrency,
} from './lineItems'
import { numberToWords } from './numberToWords'
import { calculateTaxBreakdown } from './taxCalculator'
import type { LineItem } from '../types/invoice'

const sampleItems: LineItem[] = [
  {
    id: '1',
    description: 'Consulting',
    hsnSac: '998314',
    quantity: 2,
    unit: 'hrs',
    rate: 1500,
    discountPercent: 10,
    taxRatePercent: 18,
  },
  {
    id: '2',
    description: 'Support',
    hsnSac: '998315',
    quantity: 1,
    unit: 'nos',
    rate: 500,
    discountPercent: 0,
    taxRatePercent: 5,
  },
]

describe('invoice PDF financial consistency', () => {
  it('uses the same taxable amounts and totals as the on-screen summary', () => {
    const breakdown = calculateTaxBreakdown(sampleItems, '27', '27')

    const lineAmounts = sampleItems.map((item) =>
      formatIndianCurrency(calculateLineItemTaxableAmount(item)),
    )

    expect(lineAmounts).toEqual(['₹2,700.00', '₹500.00'])
    expect(formatIndianCurrency(breakdown.taxableValue)).toBe('₹3,200.00')
    expect(formatIndianCurrency(breakdown.cgst)).toBe('₹255.50')
    expect(formatIndianCurrency(breakdown.sgst)).toBe('₹255.50')
    expect(formatIndianCurrency(breakdown.igst)).toBe('₹0.00')
    expect(formatIndianCurrency(breakdown.roundOff)).toBe('₹0.00')
    expect(formatIndianCurrency(breakdown.grandTotal)).toBe('₹3,711.00')
    expect(numberToWords(breakdown.grandTotal)).toBe(
      'Three Thousand Seven Hundred Eleven Rupees Only',
    )
  })

  it('matches inter-state IGST totals shown in the UI', () => {
    const breakdown = calculateTaxBreakdown(sampleItems, '27', '29')

    expect(formatIndianCurrency(breakdown.igst)).toBe('₹511.00')
    expect(formatIndianCurrency(breakdown.cgst)).toBe('₹0.00')
    expect(formatIndianCurrency(breakdown.sgst)).toBe('₹0.00')
    expect(formatIndianCurrency(breakdown.grandTotal)).toBe('₹3,711.00')
  })
})
