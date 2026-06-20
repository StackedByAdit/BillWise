import { reserveNextInvoiceNumber } from './invoiceNumber'
import { calculateTaxBreakdown } from './taxCalculator'
import type { InvoiceStatus } from '../types/invoice'
import {
  toInvoiceMeta,
  type InvoiceDraft,
} from '../types/invoiceDraft'
import {
  formatIsoDate,
  getDueDateForPaymentTerms,
} from '../types/invoiceMeta'

export const SAVED_INVOICES_KEY = 'gst-invoice:saved-invoices'

export interface SavedInvoiceListItem {
  id: string
  invoiceNumber: string
  buyerName: string
  invoiceDate: string
  grandTotal: number
  status: InvoiceStatus
}

export function readSavedInvoices(): InvoiceDraft[] {
  try {
    const stored = localStorage.getItem(SAVED_INVOICES_KEY)
    return stored ? (JSON.parse(stored) as InvoiceDraft[]) : []
  } catch {
    return []
  }
}

export function writeSavedInvoices(invoices: InvoiceDraft[]): void {
  localStorage.setItem(SAVED_INVOICES_KEY, JSON.stringify(invoices))
}

export function getSavedInvoice(id: string): InvoiceDraft | undefined {
  return readSavedInvoices().find((invoice) => invoice.id === id)
}

export function saveInvoice(invoice: InvoiceDraft): InvoiceDraft {
  const invoices = readSavedInvoices()
  const existingIndex = invoices.findIndex((entry) => entry.id === invoice.id)
  const savedInvoice = { ...invoice }

  if (existingIndex >= 0) {
    invoices[existingIndex] = savedInvoice
  } else {
    invoices.unshift(savedInvoice)
  }

  writeSavedInvoices(invoices)
  return savedInvoice
}

export function deleteSavedInvoice(id: string): void {
  writeSavedInvoices(readSavedInvoices().filter((invoice) => invoice.id !== id))
}

export function duplicateInvoice(source: InvoiceDraft): InvoiceDraft {
  const invoiceDate = formatIsoDate(new Date())
  const meta = toInvoiceMeta(source)

  return {
    ...source,
    id: crypto.randomUUID(),
    invoiceNumber: reserveNextInvoiceNumber(),
    invoiceDate,
    dueDate: getDueDateForPaymentTerms(invoiceDate, source.paymentTerms),
    paymentTerms: meta.paymentTerms,
    customPaymentTerms: meta.customPaymentTerms,
    notes: meta.notes,
    status: 'draft',
    buyer: { ...source.buyer },
    seller: { ...source.seller },
    items: source.items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    })),
  }
}

export function toSavedInvoiceListItem(invoice: InvoiceDraft): SavedInvoiceListItem {
  const breakdown = calculateTaxBreakdown(
    invoice.items,
    invoice.seller.stateCode,
    invoice.buyer.stateCode,
  )

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    buyerName: invoice.buyer.name || '—',
    invoiceDate: invoice.invoiceDate,
    grandTotal: breakdown.grandTotal,
    status: invoice.status,
  }
}

export function listSavedInvoices(): SavedInvoiceListItem[] {
  return readSavedInvoices()
    .map(toSavedInvoiceListItem)
    .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate))
}
