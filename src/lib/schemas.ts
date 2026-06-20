import { z } from 'zod'
import { GSTIN_REGEX } from './validation'
import type { InvoiceDraft } from '../types/invoiceDraft'

export const partySchema = z.object({
  name: z.string(),
  gstin: z.string(),
  address: z.string(),
  state: z.string(),
  stateCode: z.string(),
  email: z.string(),
  phone: z.string(),
})

export const sellerProfileSchema = partySchema.extend({
  logo: z.string().optional(),
})

export const buyerPartySchema = partySchema

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  hsnSac: z.string(),
  quantity: z.number(),
  unit: z.string(),
  rate: z.number(),
  discountPercent: z.number(),
  taxRatePercent: z.number(),
})

export const invoiceStatusSchema = z.enum(['draft', 'sent', 'paid', 'cancelled'])

export const paymentTermsSchema = z.enum([
  'due_on_receipt',
  'net_15',
  'net_30',
  'custom',
])

export const invoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  dueDate: z.string().min(1),
  seller: partySchema,
  buyer: buyerPartySchema,
  items: z.array(lineItemSchema),
  notes: z.string(),
  termsAndConditions: z.string(),
  status: invoiceStatusSchema,
})

export const invoiceDraftSchema = invoiceSchema
  .extend({
    paymentTerms: paymentTermsSchema,
    customPaymentTerms: z.string(),
    seller: sellerProfileSchema,
  })
  .superRefine((invoice, ctx) => {
    const sellerGstin = invoice.seller.gstin.trim()

    if (!sellerGstin) {
      ctx.addIssue({
        code: 'custom',
        message: 'Seller GSTIN is required.',
        path: ['seller', 'gstin'],
      })
    } else if (!GSTIN_REGEX.test(sellerGstin.toUpperCase())) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid 15-character GSTIN for the seller.',
        path: ['seller', 'gstin'],
      })
    }

    if (!invoice.buyer.name.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Buyer name is required.',
        path: ['buyer', 'name'],
      })
    }

    const buyerGstin = invoice.buyer.gstin.trim()
    if (buyerGstin && !GSTIN_REGEX.test(buyerGstin.toUpperCase())) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid 15-character GSTIN for the buyer.',
        path: ['buyer', 'gstin'],
      })
    }

    if (invoice.items.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Add at least one line item.',
        path: ['items'],
      })
    }

    invoice.items.forEach((item, index) => {
      const rowLabel = item.description.trim() || `Line ${index + 1}`

      if (item.quantity <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: `${rowLabel}: quantity must be greater than 0.`,
          path: ['items', index, 'quantity'],
        })
      }

      if (item.rate <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: `${rowLabel}: rate must be greater than 0.`,
          path: ['items', index, 'rate'],
        })
      }
    })
  })

export interface LineItemValidationErrors {
  quantity?: string
  rate?: string
}

export interface InvoiceValidationErrors {
  sellerGstin?: string
  buyerName?: string
  buyerGstin?: string
  items?: string
  lineItems: Record<string, LineItemValidationErrors>
}

export interface InvoiceValidationResult {
  success: boolean
  errors: InvoiceValidationErrors
  messages: string[]
}

function createEmptyErrors(): InvoiceValidationErrors {
  return { lineItems: {} }
}

export function validateInvoiceDraft(
  invoice: InvoiceDraft,
): InvoiceValidationResult {
  const result = invoiceDraftSchema.safeParse(invoice)

  if (result.success) {
    return {
      success: true,
      errors: createEmptyErrors(),
      messages: [],
    }
  }

  const errors = createEmptyErrors()
  const messages: string[] = []

  for (const issue of result.error.issues) {
    if (!messages.includes(issue.message)) {
      messages.push(issue.message)
    }

    const [root, second, third] = issue.path

    if (root === 'seller' && second === 'gstin') {
      errors.sellerGstin = issue.message
    }

    if (root === 'buyer' && second === 'name') {
      errors.buyerName = issue.message
    }

    if (root === 'buyer' && second === 'gstin') {
      errors.buyerGstin = issue.message
    }

    if (root === 'items' && second === undefined) {
      errors.items = issue.message
    }

    if (root === 'items' && typeof second === 'number') {
      const item = invoice.items[second]
      const field = third

      if (item && (field === 'quantity' || field === 'rate')) {
        errors.lineItems[item.id] = {
          ...errors.lineItems[item.id],
          [field]: issue.message,
        }
      }
    }
  }

  return {
    success: false,
    errors,
    messages,
  }
}

export function getInvoiceValidationTooltip(messages: string[]): string {
  if (messages.length === 0) {
    return ''
  }

  return `Complete the required fields before saving or downloading:\n${messages.join('\n')}`
}
