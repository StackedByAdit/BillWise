import { describe, expect, it } from 'vitest'
import type { LineItem } from '../types/invoice'
import { calculateTaxBreakdown } from './taxCalculator'

function makeItem(overrides: Partial<LineItem> = {}): LineItem {
  return {
    id: 'item-1',
    description: 'Test item',
    hsnSac: '998314',
    quantity: 1,
    unit: 'nos',
    rate: 100,
    discountPercent: 0,
    taxRatePercent: 18,
    ...overrides,
  }
}

describe('calculateTaxBreakdown', () => {
  it('splits tax into CGST and SGST for same-state supplies', () => {
    const items = [makeItem({ rate: 1000, taxRatePercent: 18 })]

    const result = calculateTaxBreakdown(items, '27', '27')

    expect(result.taxableValue).toBe(1000)
    expect(result.cgst).toBe(90)
    expect(result.sgst).toBe(90)
    expect(result.igst).toBe(0)
    expect(result.grandTotal).toBe(1180)
    expect(result.roundOff).toBe(0)
  })

  it('applies IGST for different-state supplies', () => {
    const items = [makeItem({ rate: 1000, taxRatePercent: 18 })]

    const result = calculateTaxBreakdown(items, '27', '29')

    expect(result.taxableValue).toBe(1000)
    expect(result.cgst).toBe(0)
    expect(result.sgst).toBe(0)
    expect(result.igst).toBe(180)
    expect(result.grandTotal).toBe(1180)
    expect(result.roundOff).toBe(0)
  })

  it('handles multiple items with different GST rates', () => {
    const items = [
      makeItem({ id: 'item-1', rate: 1000, taxRatePercent: 18 }),
      makeItem({ id: 'item-2', rate: 500, taxRatePercent: 5 }),
    ]

    const result = calculateTaxBreakdown(items, '07', '07')

    expect(result.taxableValue).toBe(1500)
    expect(result.cgst).toBe(102.5)
    expect(result.sgst).toBe(102.5)
    expect(result.igst).toBe(0)
    expect(result.grandTotal).toBe(1705)
    expect(result.roundOff).toBe(0)
  })

  it('calculates taxable value with zero discount', () => {
    const items = [makeItem({ quantity: 3, rate: 250, discountPercent: 0 })]

    const result = calculateTaxBreakdown(items, '24', '24')

    expect(result.taxableValue).toBe(750)
    expect(result.cgst).toBe(67.5)
    expect(result.sgst).toBe(67.5)
    expect(result.grandTotal).toBe(885)
  })

  it('applies discount before calculating tax', () => {
    const items = [
      makeItem({
        quantity: 2,
        rate: 100,
        discountPercent: 10,
        taxRatePercent: 18,
      }),
    ]

    const result = calculateTaxBreakdown(items, '33', '33')

    expect(result.taxableValue).toBe(180)
    expect(result.cgst).toBe(16.2)
    expect(result.sgst).toBe(16.2)
    expect(result.grandTotal).toBe(212)
    expect(result.roundOff).toBeCloseTo(-0.4)
  })

  it('rounds grand total to the nearest rupee and stores round-off delta', () => {
    const items = [makeItem({ rate: 100.33, taxRatePercent: 18 })]

    const result = calculateTaxBreakdown(items, '09', '09')

    const unroundedGrandTotal =
      result.taxableValue + result.cgst + result.sgst + result.igst

    expect(result.taxableValue).toBeCloseTo(100.33)
    expect(unroundedGrandTotal).toBeCloseTo(118.3894)
    expect(result.grandTotal).toBe(118)
    expect(result.roundOff).toBeCloseTo(-0.3894)
    expect(unroundedGrandTotal + result.roundOff).toBeCloseTo(result.grandTotal)
  })
})
