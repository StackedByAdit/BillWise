import { useMemo, useState } from 'react'
import { BuyerDetailsForm } from '../components/BuyerDetailsForm'
import { InvoiceMetaForm } from '../components/InvoiceMetaForm'
import { InvoiceSummary } from '../components/InvoiceSummary'
import { LineItemsTable } from '../components/LineItemsTable'
import { SellerProfileForm } from '../components/SellerProfileForm'
import { createInitialInvoiceDraft } from '../lib/invoiceDraft'
import { formatIndianCurrency } from '../lib/lineItems'
import { calculateTaxBreakdown } from '../lib/taxCalculator'
import {
  applyInvoiceMeta,
  toInvoiceMeta,
  type InvoiceDraft,
} from '../types/invoiceDraft'
import type { TaxBreakdown } from '../types/invoice'

export function InvoiceBuilder() {
  const [invoice, setInvoice] = useState<InvoiceDraft>(() =>
    createInitialInvoiceDraft(),
  )
  const [mobileTotalsOpen, setMobileTotalsOpen] = useState(false)

  const taxBreakdown = useMemo(
    () =>
      calculateTaxBreakdown(
        invoice.items,
        invoice.seller.stateCode,
        invoice.buyer.stateCode,
      ),
    [invoice.items, invoice.seller.stateCode, invoice.buyer.stateCode],
  )

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-6 py-10 pb-28 lg:pb-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-8">
            <SellerProfileForm
              value={invoice.seller}
              onChange={(seller) =>
                setInvoice((current) => ({ ...current, seller }))
              }
            />
            <InvoiceMetaForm
              value={toInvoiceMeta(invoice)}
              onChange={(meta) =>
                setInvoice((current) => applyInvoiceMeta(current, meta))
              }
            />
            <BuyerDetailsForm
              value={invoice.buyer}
              onChange={(buyer) =>
                setInvoice((current) => ({ ...current, buyer }))
              }
            />
            <LineItemsTable
              items={invoice.items}
              onChange={(items) =>
                setInvoice((current) => ({ ...current, items }))
              }
            />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <InvoiceSummary breakdown={taxBreakdown} />
            </div>
          </aside>
        </div>
      </div>

      <MobileTotalsBar
        breakdown={taxBreakdown}
        open={mobileTotalsOpen}
        onOpen={() => setMobileTotalsOpen(true)}
        onClose={() => setMobileTotalsOpen(false)}
      />
    </>
  )
}

interface MobileTotalsBarProps {
  breakdown: TaxBreakdown
  open: boolean
  onOpen: () => void
  onClose: () => void
}

function MobileTotalsBar({
  breakdown,
  open,
  onOpen,
  onClose,
}: MobileTotalsBarProps) {
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Grand Total
            </p>
            <p className="text-lg font-semibold tabular-nums text-slate-900">
              {formatIndianCurrency(breakdown.grandTotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            View totals
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close totals sheet"
            className="absolute inset-0 bg-slate-900/40"
            onClick={onClose}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-2xl bg-slate-50 p-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />
            <InvoiceSummary breakdown={breakdown} />
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
