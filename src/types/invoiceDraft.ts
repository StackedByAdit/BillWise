import type { LineItem, Party, InvoiceStatus } from './invoice'
import type { InvoiceMeta } from './invoiceMeta'
import type { SellerProfile } from './seller'

export interface InvoiceDraft extends InvoiceMeta {
  id: string
  seller: SellerProfile
  buyer: Party
  items: LineItem[]
  termsAndConditions: string
  status: InvoiceStatus
}

export function toInvoiceMeta(invoice: InvoiceDraft): InvoiceMeta {
  return {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    paymentTerms: invoice.paymentTerms,
    customPaymentTerms: invoice.customPaymentTerms,
    notes: invoice.notes,
  }
}

export function applyInvoiceMeta(
  invoice: InvoiceDraft,
  meta: InvoiceMeta,
): InvoiceDraft {
  return {
    ...invoice,
    ...meta,
  }
}
