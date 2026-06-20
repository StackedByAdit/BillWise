const INVOICE_COUNTER_KEY = 'gst-invoice:invoice-counter'
const DRAFT_INVOICE_NUMBER_KEY = 'gst-invoice:draft-invoice-number'

export interface InvoiceCounterState {
  year: number
  sequence: number
}

export function formatInvoiceNumber(year: number, sequence: number): string {
  return `INV-${year}-${String(sequence).padStart(4, '0')}`
}

export function getNextCounterState(
  current: InvoiceCounterState,
  year = new Date().getFullYear(),
): InvoiceCounterState {
  if (current.year !== year) {
    return { year, sequence: 1 }
  }

  return { year, sequence: current.sequence + 1 }
}

function readCounter(): InvoiceCounterState {
  try {
    const stored = localStorage.getItem(INVOICE_COUNTER_KEY)
    if (!stored) {
      return { year: new Date().getFullYear(), sequence: 0 }
    }

    return JSON.parse(stored) as InvoiceCounterState
  } catch {
    return { year: new Date().getFullYear(), sequence: 0 }
  }
}

function writeCounter(state: InvoiceCounterState): void {
  localStorage.setItem(INVOICE_COUNTER_KEY, JSON.stringify(state))
}

export function reserveNextInvoiceNumber(): string {
  const current = readCounter()
  const next = getNextCounterState(current)
  writeCounter(next)
  return formatInvoiceNumber(next.year, next.sequence)
}

export function assignInvoiceNumber(): string {
  const existingDraft = sessionStorage.getItem(DRAFT_INVOICE_NUMBER_KEY)
  if (existingDraft) {
    return existingDraft
  }

  const invoiceNumber = reserveNextInvoiceNumber()
  sessionStorage.setItem(DRAFT_INVOICE_NUMBER_KEY, invoiceNumber)
  return invoiceNumber
}

export function clearDraftInvoiceNumber(): void {
  sessionStorage.removeItem(DRAFT_INVOICE_NUMBER_KEY)
}
