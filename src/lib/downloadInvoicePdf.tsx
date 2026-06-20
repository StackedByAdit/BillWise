import { pdf } from '@react-pdf/renderer'
import { InvoicePdfDocument } from '../components/InvoicePdfDocument'
import type { TaxBreakdown } from '../types/invoice'
import type { InvoiceDraft } from '../types/invoiceDraft'

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.-]+/g, '_')
}

export async function downloadInvoicePdf(
  invoice: InvoiceDraft,
  breakdown: TaxBreakdown,
): Promise<void> {
  const blob = await pdf(
    <InvoicePdfDocument invoice={invoice} breakdown={breakdown} />,
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFilename(invoice.invoiceNumber)}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
