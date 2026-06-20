import { useId, type ChangeEvent } from 'react'
import {
  getDueDateForPaymentTerms,
  PAYMENT_TERMS_OPTIONS,
  type InvoiceMeta,
  type PaymentTerms,
} from '../types/invoiceMeta'

const inputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700'

export interface InvoiceMetaFormProps {
  value: InvoiceMeta
  onChange: (meta: InvoiceMeta) => void
}

export function InvoiceMetaForm({ value, onChange }: InvoiceMetaFormProps) {
  const formId = useId()

  function updateMeta(updates: Partial<InvoiceMeta>) {
    const nextMeta: InvoiceMeta = { ...value, ...updates }

    if (updates.invoiceDate !== undefined || updates.paymentTerms !== undefined) {
      const invoiceDate = nextMeta.invoiceDate
      const paymentTerms = nextMeta.paymentTerms

      if (paymentTerms !== 'custom') {
        nextMeta.dueDate = getDueDateForPaymentTerms(invoiceDate, paymentTerms)
      } else if (updates.invoiceDate !== undefined) {
        nextMeta.dueDate = invoiceDate
      }
    }

    onChange(nextMeta)
  }

  function handlePaymentTermsChange(event: ChangeEvent<HTMLSelectElement>) {
    const paymentTerms = event.target.value as PaymentTerms
    updateMeta({ paymentTerms })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">Invoice Details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set invoice metadata, payment terms, and notes for this document.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-invoice-number`} className={labelClassName}>
            Invoice Number
          </label>
          <input
            id={`${formId}-invoice-number`}
            type="text"
            required
            value={value.invoiceNumber}
            onChange={(event) => updateMeta({ invoiceNumber: event.target.value })}
            className={`${inputClassName} font-medium tracking-wide`}
            placeholder="INV-2026-0001"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-payment-terms`} className={labelClassName}>
            Payment Terms
          </label>
          <select
            id={`${formId}-payment-terms`}
            value={value.paymentTerms}
            onChange={handlePaymentTermsChange}
            className={inputClassName}
          >
            {PAYMENT_TERMS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-invoice-date`} className={labelClassName}>
            Invoice Date
          </label>
          <input
            id={`${formId}-invoice-date`}
            type="date"
            required
            value={value.invoiceDate}
            onChange={(event) => updateMeta({ invoiceDate: event.target.value })}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-due-date`} className={labelClassName}>
            Due Date
          </label>
          <input
            id={`${formId}-due-date`}
            type="date"
            required
            value={value.dueDate}
            onChange={(event) => updateMeta({ dueDate: event.target.value })}
            disabled={value.paymentTerms !== 'custom'}
            className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
          />
          {value.paymentTerms !== 'custom' ? (
            <p className="mt-1.5 text-xs text-slate-500">
              Calculated automatically from payment terms.
            </p>
          ) : null}
        </div>

        {value.paymentTerms === 'custom' ? (
          <div className="md:col-span-2">
            <label htmlFor={`${formId}-custom-terms`} className={labelClassName}>
              Custom Payment Terms
            </label>
            <input
              id={`${formId}-custom-terms`}
              type="text"
              value={value.customPaymentTerms}
              onChange={(event) =>
                updateMeta({ customPaymentTerms: event.target.value })
              }
              className={inputClassName}
              placeholder="e.g. 50% advance, balance on delivery"
            />
          </div>
        ) : null}

        <div className="md:col-span-2">
          <label htmlFor={`${formId}-notes`} className={labelClassName}>
            Notes / Terms
          </label>
          <textarea
            id={`${formId}-notes`}
            rows={4}
            value={value.notes}
            onChange={(event) => updateMeta({ notes: event.target.value })}
            className={`${inputClassName} resize-y`}
            placeholder="Additional notes, bank details, or terms and conditions"
          />
        </div>
      </div>
    </section>
  )
}
