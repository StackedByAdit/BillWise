import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BuyerDetailsForm } from '../components/BuyerDetailsForm'
import { InvoiceMetaForm } from '../components/InvoiceMetaForm'
import { InvoiceSummary } from '../components/InvoiceSummary'
import { LineItemsTable } from '../components/LineItemsTable'
import { SellerProfileForm } from '../components/SellerProfileForm'
import { createInitialInvoiceDraft } from '../lib/invoiceDraft'
import { downloadInvoicePdf } from '../lib/downloadInvoicePdf'
import { formatIndianCurrency } from '../lib/lineItems'
import { getSavedInvoice, saveInvoice } from '../lib/savedInvoices'
import { calculateTaxBreakdown } from '../lib/taxCalculator'
import {
  applyInvoiceMeta,
  toInvoiceMeta,
  type InvoiceDraft,
} from '../types/invoiceDraft'
import type { TaxBreakdown } from '../types/invoice'

interface InvoiceBuilderProps {
  invoiceId?: string
}

export function InvoiceBuilder({ invoiceId }: InvoiceBuilderProps) {
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<InvoiceDraft>(() => {
    if (invoiceId) {
      const saved = getSavedInvoice(invoiceId)
      if (saved) {
        return saved
      }
    }

    return createInitialInvoiceDraft()
  })
  const [mobileTotalsOpen, setMobileTotalsOpen] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const taxBreakdown = useMemo(
    () =>
      calculateTaxBreakdown(
        invoice.items,
        invoice.seller.stateCode,
        invoice.buyer.stateCode,
      ),
    [invoice.items, invoice.seller.stateCode, invoice.buyer.stateCode],
  )

  async function handleDownloadPdf() {
    setPdfError(null)
    setIsDownloadingPdf(true)

    try {
      await downloadInvoicePdf(invoice, taxBreakdown)
    } catch {
      setPdfError('Unable to generate PDF. Please try again.')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  function handleSaveInvoice() {
    setSaveMessage(null)
    setIsSaving(true)

    try {
      saveInvoice(invoice)
      setSaveMessage('Invoice saved successfully.')

      if (!invoiceId) {
        navigate(`/edit/${invoice.id}`, { replace: true })
      }
    } catch {
      setSaveMessage('Unable to save invoice. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

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
            <div className="sticky top-6 space-y-4">
              <InvoiceSummary breakdown={taxBreakdown} />
              <button
                type="button"
                onClick={handleSaveInvoice}
                disabled={isSaving}
                className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save Invoice'}
              </button>
              {saveMessage ? (
                <p
                  className={`text-sm font-medium ${
                    saveMessage.includes('successfully')
                      ? 'text-green-700'
                      : 'text-red-600'
                  }`}
                  role="status"
                >
                  {saveMessage}
                </p>
              ) : null}
              <DownloadPdfButton
                onClick={handleDownloadPdf}
                loading={isDownloadingPdf}
                error={pdfError}
              />
            </div>
          </aside>
        </div>
      </div>

      <MobileTotalsBar
        breakdown={taxBreakdown}
        open={mobileTotalsOpen}
        onOpen={() => setMobileTotalsOpen(true)}
        onClose={() => setMobileTotalsOpen(false)}
        onDownloadPdf={handleDownloadPdf}
        onSaveInvoice={handleSaveInvoice}
        downloadingPdf={isDownloadingPdf}
        savingInvoice={isSaving}
        pdfError={pdfError}
        saveMessage={saveMessage}
      />
    </>
  )
}

interface MobileTotalsBarProps {
  breakdown: TaxBreakdown
  open: boolean
  onOpen: () => void
  onClose: () => void
  onDownloadPdf: () => void
  onSaveInvoice: () => void
  downloadingPdf: boolean
  savingInvoice: boolean
  pdfError: string | null
  saveMessage: string | null
}

function DownloadPdfButton({
  onClick,
  loading,
  error,
  fullWidth = false,
}: {
  onClick: () => void
  loading: boolean
  error: string | null
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'w-full' : undefined}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
          fullWidth ? 'w-full' : 'w-full'
        }`}
      >
        {loading ? 'Generating PDF…' : 'Download PDF'}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function MobileTotalsBar({
  breakdown,
  open,
  onOpen,
  onClose,
  onDownloadPdf,
  onSaveInvoice,
  downloadingPdf,
  savingInvoice,
  pdfError,
  saveMessage,
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
              onClick={onSaveInvoice}
              disabled={savingInvoice}
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingInvoice ? 'Saving…' : 'Save Invoice'}
            </button>
            {saveMessage ? (
              <p
                className={`mt-2 text-sm font-medium ${
                  saveMessage.includes('successfully')
                    ? 'text-green-700'
                    : 'text-red-600'
                }`}
                role="status"
              >
                {saveMessage}
              </p>
            ) : null}
            <DownloadPdfButton
              onClick={onDownloadPdf}
              loading={downloadingPdf}
              error={pdfError}
              fullWidth
            />
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
