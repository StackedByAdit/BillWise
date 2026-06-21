import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { formatDisplayDate } from '../lib/formatDate'
import { formatIndianCurrency } from '../lib/lineItems'
import {
  deleteSavedInvoice,
  duplicateInvoice,
  getSavedInvoice,
  listSavedInvoices,
  saveInvoice,
  type SavedInvoiceListItem,
} from '../lib/savedInvoices'
import type { InvoiceStatus } from '../types/invoice'

export function SavedInvoicesList() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<SavedInvoiceListItem[]>(() =>
    listSavedInvoices(),
  )
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  function refresh() {
    setInvoices(listSavedInvoices())
  }

  function handleDuplicate(id: string) {
    const original = getSavedInvoice(id)
    if (!original) {
      return
    }

    const copy = duplicateInvoice(original)
    saveInvoice(copy)
    refresh()
    navigate(`/edit/${copy.id}`)
  }

  function handleDelete(id: string) {
    deleteSavedInvoice(id)
    setPendingDeleteId(null)
    refresh()
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Saved Invoices
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Open, duplicate, or delete invoices stored on this device.
          </p>
        </div>
        <Link
          to="/new"
          className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
        >
          New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No saved invoices yet"
          description="Create your first GST invoice, then save it to access it here anytime on this device."
          actionLabel="Create your first invoice"
          actionTo="/new"
        />
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            {invoices.map((invoice) => (
              <SavedInvoiceCard
                key={invoice.id}
                invoice={invoice}
                pendingDelete={pendingDeleteId === invoice.id}
                onOpen={() => navigate(`/edit/${invoice.id}`)}
                onDuplicate={() => handleDuplicate(invoice.id)}
                onDelete={() => setPendingDeleteId(invoice.id)}
                onConfirmDelete={() => handleDelete(invoice.id)}
                onCancelDelete={() => setPendingDeleteId(null)}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Invoice Number</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="max-w-[12rem] truncate px-4 py-4 text-slate-700">
                        {invoice.buyerName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                        {formatDisplayDate(invoice.invoiceDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-medium tabular-nums text-slate-900">
                        {formatIndianCurrency(invoice.grandTotal)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-4">
                        <InvoiceRowActions
                          pendingDelete={pendingDeleteId === invoice.id}
                          onOpen={() => navigate(`/edit/${invoice.id}`)}
                          onDuplicate={() => handleDuplicate(invoice.id)}
                          onDelete={() => setPendingDeleteId(invoice.id)}
                          onConfirmDelete={() => handleDelete(invoice.id)}
                          onCancelDelete={() => setPendingDeleteId(null)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface SavedInvoiceCardProps {
  invoice: SavedInvoiceListItem
  pendingDelete: boolean
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

function SavedInvoiceCard({
  invoice,
  pendingDelete,
  onOpen,
  onDuplicate,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: SavedInvoiceCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {invoice.invoiceNumber}
          </p>
          <p className="mt-1 truncate text-sm text-slate-600">{invoice.buyerName}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Date
          </dt>
          <dd className="mt-1 text-slate-800">
            {formatDisplayDate(invoice.invoiceDate)}
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Grand Total
          </dt>
          <dd className="mt-1 font-semibold tabular-nums text-slate-900">
            {formatIndianCurrency(invoice.grandTotal)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <InvoiceRowActions
          pendingDelete={pendingDelete}
          onOpen={onOpen}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
          stacked
        />
      </div>
    </article>
  )
}

interface InvoiceRowActionsProps {
  pendingDelete: boolean
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  stacked?: boolean
}

function InvoiceRowActions({
  pendingDelete,
  onOpen,
  onDuplicate,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  stacked = false,
}: InvoiceRowActionsProps) {
  if (pendingDelete) {
    return (
      <div
        className={`flex flex-wrap gap-2 ${stacked ? '' : 'justify-end'}`}
      >
        <span className="w-full self-center text-xs text-slate-500 sm:w-auto">
          Delete this invoice?
        </span>
        <button
          type="button"
          onClick={onConfirmDelete}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={onCancelDelete}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-wrap gap-2 ${stacked ? '' : 'justify-end'}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        Open / Edit
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        Duplicate
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
      >
        Delete
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const styles: Record<InvoiceStatus, string> = {
    draft: 'bg-slate-100 text-slate-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  )
}
