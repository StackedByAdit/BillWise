import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionButtonWithTooltip } from '../components/ActionButtonWithTooltip'
import { ValidationAlert } from '../components/ValidationAlert'
import { BuyerDetailsForm } from '../components/BuyerDetailsForm'
import { InvoiceMetaForm } from '../components/InvoiceMetaForm'
import { InvoiceSummary } from '../components/InvoiceSummary'
import { LineItemsTable } from '../components/LineItemsTable'
import { SellerProfileForm } from '../components/SellerProfileForm'
import { createInitialInvoiceDraft } from '../lib/invoiceDraft'
import { downloadInvoicePdf } from '../lib/downloadInvoicePdf'
import { formatIndianCurrency } from '../lib/lineItems'
import { getSavedInvoice, saveInvoice } from '../lib/savedInvoices'
import {
  getInvoiceValidationTooltip,
  validateInvoiceDraft,
} from '../lib/schemas'
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

  const validation = useMemo(
    () => validateInvoiceDraft(invoice),
    [invoice],
  )
  const validationTooltip = getInvoiceValidationTooltip(validation.messages)
  const canSaveOrDownload = validation.success

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
    if (!canSaveOrDownload) {
      return
    }

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
    if (!canSaveOrDownload) {
      return
    }

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
            {!validation.success ? (
              <ValidationAlert messages={validation.messages} />
            ) : null}
            <SellerProfileForm
              value={invoice.seller}
              onChange={(seller) =>
                setInvoice((current) => ({ ...current, seller }))
              }
              validationErrors={{
                gstin: validation.errors.sellerGstin,
              }}
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
              validationErrors={{
                name: validation.errors.buyerName,
                gstin: validation.errors.buyerGstin,
              }}
            />
            <LineItemsTable
              items={invoice.items}
              onChange={(items) =>
                setInvoice((current) => ({ ...current, items }))
              }
              validationErrors={{
                items: validation.errors.items,
                lineItems: validation.errors.lineItems,
              }}
            />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <InvoiceSummary breakdown={taxBreakdown} />
              <ActionButtonWithTooltip
                onClick={handleSaveInvoice}
                disabled={!canSaveOrDownload}
                disabledReason={validationTooltip}
                loading={isSaving}
                loadingLabel="Saving…"
                label="Save Invoice"
                variant="primary"
              />
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
                disabled={!canSaveOrDownload}
                disabledReason={validationTooltip}
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
        canSaveOrDownload={canSaveOrDownload}
        validationTooltip={validationTooltip}
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
  canSaveOrDownload: boolean
  validationTooltip: string
  pdfError: string | null
  saveMessage: string | null
}

function DownloadPdfButton({
  onClick,
  loading,
  disabled,
  disabledReason,
  error,
  fullWidth = false,
}: {
  onClick: () => void
  loading: boolean
  disabled?: boolean
  disabledReason?: string
  error: string | null
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'w-full' : undefined}>
      <ActionButtonWithTooltip
        onClick={onClick}
        disabled={Boolean(disabled)}
        disabledReason={disabledReason}
        loading={loading}
        loadingLabel="Generating PDF…"
        label="Download PDF"
        className={fullWidth ? 'w-full' : 'w-full'}
      />
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
  canSaveOrDownload,
  validationTooltip,
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
            <ActionButtonWithTooltip
              onClick={onSaveInvoice}
              disabled={!canSaveOrDownload}
              disabledReason={validationTooltip}
              loading={savingInvoice}
              loadingLabel="Saving…"
              label="Save Invoice"
              variant="primary"
              className="mt-4"
            />
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
              disabled={!canSaveOrDownload}
              disabledReason={validationTooltip}
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
