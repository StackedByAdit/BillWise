import { describe, expect, it } from 'vitest'
import { createEmptyLineItem } from './lineItems'
import { validateInvoiceDraft } from './schemas'
import type { InvoiceDraft } from '../types/invoiceDraft'

const validInvoice: InvoiceDraft = {
  id: 'invoice-1',
  invoiceNumber: 'INV-2026-0001',
  invoiceDate: '2026-06-21',
  dueDate: '2026-06-21',
  paymentTerms: 'due_on_receipt',
  customPaymentTerms: '',
  notes: '',
  termsAndConditions: '',
  status: 'draft',
  seller: {
    name: 'Acme Traders',
    gstin: '27AAAAA0000A1Z2',
    address: 'Mumbai',
    state: 'Maharashtra',
    stateCode: '27',
    email: 'billing@acme.test',
    phone: '+91 98765 43210',
  },
  buyer: {
    name: 'Beta Retail',
    gstin: '',
    address: 'Bengaluru',
    state: 'Karnataka',
    stateCode: '29',
    email: 'accounts@beta.test',
    phone: '+91 91234 56789',
  },
  items: [
    {
      id: 'line-1',
      description: 'Service',
      hsnSac: '998314',
      quantity: 1,
      unit: 'nos',
      rate: 1000,
      discountPercent: 0,
      taxRatePercent: 18,
    },
  ],
}

describe('validateInvoiceDraft', () => {
  it('passes a complete invoice', () => {
    const result = validateInvoiceDraft(validInvoice)

    expect(result.success).toBe(true)
    expect(result.messages).toHaveLength(0)
  })

  it('requires seller GSTIN', () => {
    const result = validateInvoiceDraft({
      ...validInvoice,
      seller: { ...validInvoice.seller, gstin: '' },
    })

    expect(result.success).toBe(false)
    expect(result.errors.sellerGstin).toMatch(/Seller GSTIN is required/)
  })

  it('requires buyer name', () => {
    const result = validateInvoiceDraft({
      ...validInvoice,
      buyer: { ...validInvoice.buyer, name: '' },
    })

    expect(result.success).toBe(false)
    expect(result.errors.buyerName).toMatch(/Buyer name is required/)
  })

  it('requires at least one line item', () => {
    const result = validateInvoiceDraft({
      ...validInvoice,
      items: [],
    })

    expect(result.success).toBe(false)
    expect(result.errors.items).toMatch(/at least one line item/)
  })

  it('flags invalid line item quantity and rate', () => {
    const item = createEmptyLineItem()
    item.id = 'line-bad'
    item.quantity = 0
    item.rate = 0

    const result = validateInvoiceDraft({
      ...validInvoice,
      items: [item],
    })

    expect(result.success).toBe(false)
    expect(result.errors.lineItems['line-bad']?.quantity).toBeTruthy()
    expect(result.errors.lineItems['line-bad']?.rate).toBeTruthy()
  })

  it('flags invalid GSTIN format, checksum, and state mismatch', () => {
    const sellerResult = validateInvoiceDraft({
      ...validInvoice,
      seller: { ...validInvoice.seller, gstin: 'INVALID-GSTIN' },
    })
    const buyerResult = validateInvoiceDraft({
      ...validInvoice,
      buyer: { ...validInvoice.buyer, gstin: '123' },
    })
    const checksumResult = validateInvoiceDraft({
      ...validInvoice,
      seller: { ...validInvoice.seller, gstin: '27AAAAA0000A1Z5' },
    })
    const mismatchResult = validateInvoiceDraft({
      ...validInvoice,
      seller: {
        ...validInvoice.seller,
        gstin: '29AABCT1332L1ZA',
        stateCode: '27',
        state: 'Maharashtra',
      },
    })

    expect(sellerResult.errors.sellerGstin).toMatch(/valid 15-character GSTIN/)
    expect(buyerResult.errors.buyerGstin).toMatch(/valid 15-character GSTIN/)
    expect(checksumResult.errors.sellerGstin).toMatch(/check digit is invalid/)
    expect(mismatchResult.errors.sellerGstin).toMatch(/match the selected seller state/)
  })
})
