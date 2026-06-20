export interface Party {
  name: string
  gstin: string
  address: string
  state: string
  stateCode: string
  email: string
  phone: string
}

export const EMPTY_PARTY: Party = {
  name: '',
  gstin: '',
  address: '',
  state: '',
  stateCode: '',
  email: '',
  phone: '',
}

export interface LineItem {
  id: string
  description: string
  hsnSac: string
  quantity: number
  unit: string
  rate: number
  discountPercent: number
  taxRatePercent: number
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled'

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  seller: Party
  buyer: Party
  items: LineItem[]
  notes: string
  termsAndConditions: string
  status: InvoiceStatus
}

export interface TaxBreakdown {
  taxableValue: number
  cgst: number
  sgst: number
  igst: number
  roundOff: number
  grandTotal: number
}
