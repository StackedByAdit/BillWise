import { formatIndianCurrency } from '../lib/lineItems'
import { numberToWords } from '../lib/numberToWords'
import type { TaxBreakdown } from '../types/invoice'

export interface InvoiceSummaryProps {
  breakdown: TaxBreakdown
}

export function InvoiceSummary({ breakdown }: InvoiceSummaryProps) {
  const isInterState = breakdown.igst > 0

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">Invoice Summary</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tax totals and amount payable for this invoice.
        </p>
      </div>

      <dl className="space-y-3">
        <SummaryRow label="Taxable Value" amount={breakdown.taxableValue} />

        {isInterState ? (
          <SummaryRow label="IGST" amount={breakdown.igst} />
        ) : (
          <>
            <SummaryRow label="CGST" amount={breakdown.cgst} />
            <SummaryRow label="SGST" amount={breakdown.sgst} />
          </>
        )}

        <SummaryRow label="Round Off" amount={breakdown.roundOff} />

        <div className="border-t border-slate-200 pt-3">
          <SummaryRow
            label="Grand Total"
            amount={breakdown.grandTotal}
            emphasized
          />
        </div>
      </dl>

      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Amount in words
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-800">
          {numberToWords(breakdown.grandTotal)}
        </p>
      </div>
    </section>
  )
}

interface SummaryRowProps {
  label: string
  amount: number
  emphasized?: boolean
}

function SummaryRow({ label, amount, emphasized = false }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt
        className={`text-sm ${emphasized ? 'font-semibold text-slate-900' : 'text-slate-600'}`}
      >
        {label}
      </dt>
      <dd
        className={`tabular-nums ${emphasized ? 'text-lg font-semibold text-slate-900' : 'text-sm font-medium text-slate-900'}`}
      >
        {formatIndianCurrency(amount)}
      </dd>
    </div>
  )
}
