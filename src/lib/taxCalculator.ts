import type { LineItem, TaxBreakdown } from '../types/invoice'
import { calculateLineItemTaxableAmount } from './lineItems'

export function calculateTaxBreakdown(
  items: LineItem[],
  sellerStateCode: string,
  buyerStateCode: string,
): TaxBreakdown {
  const isIntraState = sellerStateCode === buyerStateCode

  let taxableValue = 0
  let cgst = 0
  let sgst = 0
  let igst = 0

  for (const item of items) {
    const itemTaxableValue = calculateLineItemTaxableAmount(item)
    taxableValue += itemTaxableValue

    const itemTaxAmount = itemTaxableValue * (item.taxRatePercent / 100)

    if (isIntraState) {
      const halfTax = itemTaxAmount / 2
      cgst += halfTax
      sgst += halfTax
    } else {
      igst += itemTaxAmount
    }
  }

  const unroundedGrandTotal = taxableValue + cgst + sgst + igst
  const grandTotal = Math.round(unroundedGrandTotal)
  const roundOff = grandTotal - unroundedGrandTotal

  return {
    taxableValue,
    cgst,
    sgst,
    igst,
    roundOff,
    grandTotal,
  }
}
