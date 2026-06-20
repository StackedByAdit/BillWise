export type PaymentTerms = 'due_on_receipt' | 'net_15' | 'net_30' | 'custom'

export interface InvoiceMeta {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  paymentTerms: PaymentTerms
  customPaymentTerms: string
  notes: string
}

export interface PaymentTermsOption {
  value: PaymentTerms
  label: string
  days: number | null
}

export const PAYMENT_TERMS_OPTIONS: readonly PaymentTermsOption[] = [
  { value: 'due_on_receipt', label: 'Due on Receipt', days: 0 },
  { value: 'net_15', label: 'Net 15', days: 15 },
  { value: 'net_30', label: 'Net 30', days: 30 },
  { value: 'custom', label: 'Custom', days: null },
] as const

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return formatIsoDate(date)
}

export function getDueDateForPaymentTerms(
  invoiceDate: string,
  paymentTerms: PaymentTerms,
): string {
  if (paymentTerms === 'custom') {
    return invoiceDate
  }

  const option = PAYMENT_TERMS_OPTIONS.find((entry) => entry.value === paymentTerms)
  return addDaysToIsoDate(invoiceDate, option?.days ?? 0)
}

export function createDefaultInvoiceMeta(invoiceNumber: string): InvoiceMeta {
  const invoiceDate = formatIsoDate(new Date())

  return {
    invoiceNumber,
    invoiceDate,
    dueDate: invoiceDate,
    paymentTerms: 'due_on_receipt',
    customPaymentTerms: '',
    notes: '',
  }
}
