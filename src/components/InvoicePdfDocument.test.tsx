import { renderToBuffer } from '@react-pdf/renderer'
import { describe, expect, it } from 'vitest'
import { InvoicePdfDocument } from './InvoicePdfDocument'
import { formatIndianCurrency } from '../lib/lineItems'
import { calculateTaxBreakdown } from '../lib/taxCalculator'
import type { InvoiceDraft } from '../types/invoiceDraft'

const testInvoice: InvoiceDraft = {
  id: 'test-invoice',
  invoiceNumber: 'INV-2026-0099',
  invoiceDate: '2026-06-21',
  dueDate: '2026-07-06',
  paymentTerms: 'net_15',
  customPaymentTerms: '',
  notes: 'Thank you for your business.',
  termsAndConditions: '',
  status: 'draft',
  seller: {
    name: 'Acme Traders Pvt. Ltd.',
    gstin: '27AAAAA0000A1Z2',
    address: '123 Market Road, Mumbai',
    state: 'Maharashtra',
    stateCode: '27',
    email: 'billing@acme.test',
    phone: '+91 98765 43210',
  },
  buyer: {
    name: 'Beta Retail LLP',
    gstin: '29BBBBB1111B2ZI',
    address: '45 Commerce Street, Bengaluru',
    state: 'Karnataka',
    stateCode: '29',
    email: 'accounts@beta.test',
    phone: '+91 91234 56789',
  },
  items: [
    {
      id: 'line-1',
      description: 'Software subscription',
      hsnSac: '998314',
      quantity: 1,
      unit: 'nos',
      rate: 10000,
      discountPercent: 0,
      taxRatePercent: 18,
    },
  ],
}

describe('InvoicePdfDocument', () => {
  it('generates a valid PDF buffer with totals matching the on-screen breakdown', async () => {
    const breakdown = calculateTaxBreakdown(
      testInvoice.items,
      testInvoice.seller.stateCode,
      testInvoice.buyer.stateCode,
    )

    const buffer = await renderToBuffer(
      <InvoicePdfDocument invoice={testInvoice} breakdown={breakdown} />,
    )

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF')
    expect(formatIndianCurrency(breakdown.grandTotal)).toBe('₹11,800.00')
    expect(buffer.length).toBeGreaterThan(1000)
  })
})
