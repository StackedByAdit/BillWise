import { assignInvoiceNumber } from './invoiceNumber'
import { createEmptyLineItem } from './lineItems'
import { EMPTY_PARTY } from '../types/invoice'
import type { InvoiceDraft } from '../types/invoiceDraft'
import { createDefaultInvoiceMeta } from '../types/invoiceMeta'
import { EMPTY_SELLER_PROFILE, type SellerProfile } from '../types/seller'

export const SELLER_PROFILE_KEY = 'gst-invoice:seller-profile'

export function readSellerProfile(): SellerProfile {
  try {
    const stored = localStorage.getItem(SELLER_PROFILE_KEY)
    return stored ? (JSON.parse(stored) as SellerProfile) : EMPTY_SELLER_PROFILE
  } catch {
    return EMPTY_SELLER_PROFILE
  }
}

export function writeSellerProfile(profile: SellerProfile): void {
  localStorage.setItem(SELLER_PROFILE_KEY, JSON.stringify(profile))
}

export function createInitialInvoiceDraft(): InvoiceDraft {
  const meta = createDefaultInvoiceMeta(assignInvoiceNumber())

  return {
    id: crypto.randomUUID(),
    ...meta,
    termsAndConditions: '',
    seller: readSellerProfile(),
    buyer: { ...EMPTY_PARTY },
    items: [createEmptyLineItem()],
    status: 'draft',
  }
}
