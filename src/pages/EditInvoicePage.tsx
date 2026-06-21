import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { SITE } from '../lib/site'
import { getSavedInvoice } from '../lib/savedInvoices'
import { InvoiceBuilder } from './InvoiceBuilder'

export function EditInvoicePage() {
  const { id } = useParams()

  useDocumentMeta(`${SITE.name} — Edit Invoice`, SITE.description)

  if (!id) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Invoice not found"
          description="This invoice link is invalid. Return to your saved invoices or create a new one."
          actionLabel="View saved invoices"
          actionTo="/"
        />
      </div>
    )
  }

  const invoice = getSavedInvoice(id)

  if (!invoice) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Invoice not found"
          description="This invoice may have been deleted or never saved on this device."
          actionLabel="View saved invoices"
          actionTo="/"
        />
        <p className="mt-4 text-center">
          <Link
            to="/new"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Create a new invoice instead
          </Link>
        </p>
      </div>
    )
  }

  return <InvoiceBuilder key={id} invoiceId={id} />
}
