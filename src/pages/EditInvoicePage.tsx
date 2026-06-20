import { Navigate, useParams } from 'react-router-dom'
import { getSavedInvoice } from '../lib/savedInvoices'
import { InvoiceBuilder } from './InvoiceBuilder'

export function EditInvoicePage() {
  const { id } = useParams()
  const invoice = id ? getSavedInvoice(id) : undefined

  if (!id || !invoice) {
    return <Navigate to="/" replace />
  }

  return <InvoiceBuilder key={id} invoiceId={id} />
}
