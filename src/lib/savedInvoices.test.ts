import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { InvoiceDraft } from '../types/invoiceDraft'
import { reserveNextInvoiceNumber } from './invoiceNumber'
import {
  deleteSavedInvoice,
  duplicateInvoice,
  getSavedInvoice,
  listSavedInvoices,
  readSavedInvoices,
  saveInvoice,
  SAVED_INVOICES_KEY,
} from './savedInvoices'

function createStorageMock() {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

const sampleInvoice: InvoiceDraft = {
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
    gstin: '27AAAAA0000A1Z5',
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

describe('savedInvoices', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock())
  })

  it('saves and reads invoices from localStorage', () => {
    saveInvoice(sampleInvoice)

    expect(readSavedInvoices()).toHaveLength(1)
    expect(getSavedInvoice('invoice-1')?.buyer.name).toBe('Beta Retail')
  })

  it('updates an existing invoice by id', () => {
    saveInvoice(sampleInvoice)
    saveInvoice({ ...sampleInvoice, buyer: { ...sampleInvoice.buyer, name: 'Updated Buyer' } })

    expect(readSavedInvoices()).toHaveLength(1)
    expect(getSavedInvoice('invoice-1')?.buyer.name).toBe('Updated Buyer')
  })

  it('deletes a saved invoice', () => {
    saveInvoice(sampleInvoice)
    deleteSavedInvoice('invoice-1')

    expect(readSavedInvoices()).toHaveLength(0)
  })

  it('lists invoices with computed grand totals', () => {
    saveInvoice(sampleInvoice)

    const list = listSavedInvoices()

    expect(list).toHaveLength(1)
    expect(list[0]?.invoiceNumber).toBe('INV-2026-0001')
    expect(list[0]?.buyerName).toBe('Beta Retail')
    expect(list[0]?.grandTotal).toBe(1180)
  })

  it('duplicates an invoice with a new id and invoice number', () => {
    const year = new Date().getFullYear()
    reserveNextInvoiceNumber()
    saveInvoice(sampleInvoice)
    const duplicate = duplicateInvoice(sampleInvoice)

    expect(duplicate.id).not.toBe(sampleInvoice.id)
    expect(duplicate.invoiceNumber).toBe(`INV-${year}-0002`)
    expect(duplicate.items[0]?.id).not.toBe(sampleInvoice.items[0]?.id)
    expect(localStorage.getItem(SAVED_INVOICES_KEY)).toBeTruthy()
  })
})
