import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Saved Invoices</h2>
          <p className="mt-1 text-sm text-slate-500">
            Open, duplicate, or delete invoices stored on this device.
          </p>
        </div>
        <Link
          to="/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-base font-medium text-slate-700">No saved invoices yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Create an invoice and click Save Invoice to store it here.
          </p>
          <Link
            to="/new"
            className="mt-6 inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                    <td className="px-4 py-4 text-slate-700">{invoice.buyerName}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {formatDisplayDate(invoice.invoiceDate)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium tabular-nums text-slate-900">
                      {formatIndianCurrency(invoice.grandTotal)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {pendingDeleteId === invoice.id ? (
                          <>
                            <span className="self-center text-xs text-slate-500">
                              Delete this invoice?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDelete(invoice.id)}
                              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/edit/${invoice.id}`)}
                              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Open / Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(invoice.id)}
                              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(invoice.id)}
                              className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  )
}
