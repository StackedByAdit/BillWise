import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePdfDocument } from '../components/InvoicePdfDocument'
import { createInitialInvoiceDraft } from './invoiceDraft'
import { assignInvoiceNumber, clearDraftInvoiceNumber, reserveNextInvoiceNumber } from './invoiceNumber'
import { validateInvoiceDraft } from './schemas'
import {
  deleteSavedInvoice,
  duplicateInvoice,
  getSavedInvoice,
  listSavedInvoices,
  saveInvoice,
} from './savedInvoices'
import { calculateTaxBreakdown } from './taxCalculator'
import { SITE } from './site'
import type { InvoiceDraft } from '../types/invoiceDraft'

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

function createProfessionalInvoice(overrides: Partial<InvoiceDraft> = {}): InvoiceDraft {
  return {
    id: crypto.randomUUID(),
    invoiceNumber: assignInvoiceNumber(),
    invoiceDate: '2026-06-21',
    dueDate: '2026-07-21',
    paymentTerms: 'net_30',
    customPaymentTerms: '',
    notes: 'Thank you for your business.',
    termsAndConditions: 'Payment due within 30 days.',
    status: 'draft',
    seller: {
      name: 'Acme Traders Pvt. Ltd.',
      gstin: '27AAPFU0939F1ZV',
      address: '101, Trade Centre, Mumbai 400001',
      state: 'Maharashtra',
      stateCode: '27',
      email: 'billing@acme.test',
      phone: '+91 98765 43210',
    },
    buyer: {
      name: 'Beta Retail LLP',
      gstin: '29AABCT1332L1ZA',
      address: '42 MG Road, Bengaluru 560001',
      state: 'Karnataka',
      stateCode: '29',
      email: 'accounts@beta.test',
      phone: '+91 91234 56789',
    },
    items: [
      {
        id: 'line-1',
        description: 'Consulting services',
        hsnSac: '998314',
        quantity: 2,
        unit: 'hrs',
        rate: 2500,
        discountPercent: 10,
        taxRatePercent: 18,
      },
      {
        id: 'line-2',
        description: 'Software subscription',
        hsnSac: '997331',
        quantity: 1,
        unit: 'nos',
        rate: 5000,
        discountPercent: 0,
        taxRatePercent: 18,
      },
    ],
    ...overrides,
  }
}

describe('professional invoice workflow', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock())
    vi.stubGlobal('sessionStorage', createStorageMock())
    clearDraftInvoiceNumber()
    reserveNextInvoiceNumber()
  })

  it('exposes site author details and footer link label', () => {
    expect(SITE.authorName).toBe('Aditya Kumar Gupta')
    expect(SITE.authorEmail).toContain('@')
    expect(SITE.digitalHeroesLabel).toBe('Built for Digital Heroes')
    expect(SITE.digitalHeroesUrl).toBe('https://digitalheroesco.com')
  })

  it('accepts professionally formatted GSTINs for seller and buyer', () => {
    const invoice = createProfessionalInvoice()
    const result = validateInvoiceDraft(invoice)

    expect(result.success).toBe(true)
    expect(result.messages).toHaveLength(0)
  })

  it('blocks save/download when seller GSTIN is missing or malformed', () => {
    const missing = validateInvoiceDraft(
      createProfessionalInvoice({
        seller: {
          ...createProfessionalInvoice().seller,
          gstin: '',
        },
      }),
    )
    const malformed = validateInvoiceDraft(
      createProfessionalInvoice({
        seller: {
          ...createProfessionalInvoice().seller,
          gstin: '27BAD',
        },
      }),
    )

    expect(missing.success).toBe(false)
    expect(malformed.success).toBe(false)
  })

  it('calculates IGST for inter-state invoices with mixed GST line items', () => {
    const invoice = createProfessionalInvoice({
      items: [
        {
          id: 'line-a',
          description: 'Service A',
          hsnSac: '998314',
          quantity: 2,
          unit: 'hrs',
          rate: 1000,
          discountPercent: 0,
          taxRatePercent: 5,
        },
        {
          id: 'line-b',
          description: 'Service B',
          hsnSac: '998315',
          quantity: 1,
          unit: 'nos',
          rate: 2000,
          discountPercent: 10,
          taxRatePercent: 12,
        },
        {
          id: 'line-c',
          description: 'Service C',
          hsnSac: '997331',
          quantity: 3,
          unit: 'nos',
          rate: 500,
          discountPercent: 0,
          taxRatePercent: 18,
        },
      ],
    })
    const breakdown = calculateTaxBreakdown(
      invoice.items,
      invoice.seller.stateCode,
      invoice.buyer.stateCode,
    )

    expect(breakdown.cgst).toBe(0)
    expect(breakdown.sgst).toBe(0)
    expect(breakdown.igst).toBeGreaterThan(0)
    expect(breakdown.grandTotal).toBeGreaterThan(breakdown.taxableValue)
  })

  it('switches from IGST to CGST/SGST when buyer state matches seller', () => {
    const interState = createProfessionalInvoice()
    const interBreakdown = calculateTaxBreakdown(
      interState.items,
      interState.seller.stateCode,
      interState.buyer.stateCode,
    )

    const intraState = createProfessionalInvoice({
      buyer: {
        ...interState.buyer,
        state: 'Maharashtra',
        stateCode: '27',
        gstin: '27AAAAA0000A1Z2',
      },
    })
    const intraBreakdown = calculateTaxBreakdown(
      intraState.items,
      intraState.seller.stateCode,
      intraState.buyer.stateCode,
    )

    expect(interBreakdown.igst).toBeGreaterThan(0)
    expect(interBreakdown.cgst).toBe(0)
    expect(intraBreakdown.igst).toBe(0)
    expect(intraBreakdown.cgst).toBe(intraBreakdown.sgst)
    expect(intraBreakdown.cgst).toBeGreaterThan(0)
  })

  it('calculates IGST for inter-state invoices', () => {
    const invoice = createProfessionalInvoice()
    const breakdown = calculateTaxBreakdown(
      invoice.items,
      invoice.seller.stateCode,
      invoice.buyer.stateCode,
    )

    expect(breakdown.cgst).toBe(0)
    expect(breakdown.sgst).toBe(0)
    expect(breakdown.igst).toBeGreaterThan(0)
    expect(breakdown.grandTotal).toBeGreaterThan(breakdown.taxableValue)
  })

  it('calculates CGST and SGST for intra-state invoices', () => {
    const invoice = createProfessionalInvoice({
      buyer: {
        ...createProfessionalInvoice().buyer,
        state: 'Maharashtra',
        stateCode: '27',
        gstin: '27AAAAA0000A1Z2',
      },
    })
    const breakdown = calculateTaxBreakdown(
      invoice.items,
      invoice.seller.stateCode,
      invoice.buyer.stateCode,
    )

    expect(breakdown.igst).toBe(0)
    expect(breakdown.cgst).toBeGreaterThan(0)
    expect(breakdown.sgst).toBeGreaterThan(0)
    expect(breakdown.cgst).toBe(breakdown.sgst)
  })

  it('supports save, list, reload, duplicate, and delete', () => {
    const invoice = createProfessionalInvoice({
      id: 'persist-1',
      items: [
        {
          id: 'line-1',
          description: 'Consulting services',
          hsnSac: '998314',
          quantity: 2,
          unit: 'hrs',
          rate: 2500,
          discountPercent: 10,
          taxRatePercent: 18,
        },
        {
          id: 'line-2',
          description: 'Software subscription',
          hsnSac: '997331',
          quantity: 1,
          unit: 'nos',
          rate: 5000,
          discountPercent: 0,
          taxRatePercent: 12,
        },
        {
          id: 'line-3',
          description: 'Support retainer',
          hsnSac: '998316',
          quantity: 1,
          unit: 'nos',
          rate: 1500,
          discountPercent: 5,
          taxRatePercent: 5,
        },
      ],
    })

    saveInvoice(invoice)
    expect(listSavedInvoices()).toHaveLength(1)
    expect(getSavedInvoice('persist-1')?.items).toHaveLength(3)
    expect(getSavedInvoice('persist-1')?.buyer.name).toBe('Beta Retail LLP')

    const reloaded = getSavedInvoice('persist-1')
    expect(reloaded?.items[2]?.taxRatePercent).toBe(5)

    const duplicate = duplicateInvoice(invoice)
    saveInvoice(duplicate)

    expect(listSavedInvoices()).toHaveLength(2)
    expect(duplicate.invoiceNumber).not.toBe(invoice.invoiceNumber)
    expect(duplicate.items.every((item) => item.id !== invoice.items[0]?.id)).toBe(true)

    deleteSavedInvoice('persist-1')
    expect(listSavedInvoices()).toHaveLength(1)
    expect(getSavedInvoice('persist-1')).toBeUndefined()
  })

  it('generates a non-empty PDF for a valid professional invoice', async () => {
    const invoice = createProfessionalInvoice()
    const breakdown = calculateTaxBreakdown(
      invoice.items,
      invoice.seller.stateCode,
      invoice.buyer.stateCode,
    )

    const buffer = await renderToBuffer(
      <InvoicePdfDocument invoice={invoice} breakdown={breakdown} />,
    )

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF')
    expect(buffer.length).toBeGreaterThan(1000)
  })

  it('creates a usable new draft with one line item', () => {
    const draft = createInitialInvoiceDraft()

    expect(draft.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/)
    expect(draft.items).toHaveLength(1)
    expect(draft.items[0]?.quantity).toBe(1)
    expect(draft.items[0]?.rate).toBe(0)
    expect(draft.items[0]?.description).toBe('')
  })
})
