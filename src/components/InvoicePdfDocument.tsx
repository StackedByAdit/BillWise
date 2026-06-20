import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import { formatDisplayDate } from '../lib/formatDate'
import {
  calculateLineItemTaxableAmount,
  formatIndianCurrency,
} from '../lib/lineItems'
import { numberToWords } from '../lib/numberToWords'
import type { TaxBreakdown } from '../types/invoice'
import type { InvoiceDraft } from '../types/invoiceDraft'
import { PAYMENT_TERMS_OPTIONS } from '../types/invoiceMeta'

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    lineHeight: 1.4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  sellerBlock: {
    flexDirection: 'row',
    gap: 12,
    maxWidth: '62%',
  },
  logo: {
    width: 56,
    height: 56,
    objectFit: 'contain',
  },
  sellerName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#0f172a',
  },
  muted: {
    color: '#475569',
    marginBottom: 2,
  },
  taxInvoiceTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    textAlign: 'right',
  },
  taxInvoiceSubtitle: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 10,
  },
  metaItem: {
    width: '48%',
  },
  metaLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  table: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 8,
    color: '#0f172a',
  },
  colIndex: { width: '4%' },
  colDescription: { width: '24%' },
  colHsn: { width: '10%' },
  colQty: { width: '7%', textAlign: 'right' },
  colUnit: { width: '7%' },
  colRate: { width: '11%', textAlign: 'right' },
  colDisc: { width: '7%', textAlign: 'right' },
  colGst: { width: '7%', textAlign: 'right' },
  colAmount: { width: '13%', textAlign: 'right' },
  totalsWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  totalsBox: {
    width: 240,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  totalsRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#1e3a8a',
  },
  totalsLabel: {
    fontSize: 9,
    color: '#334155',
  },
  totalsValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  grandTotalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  wordsBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 4,
  },
  wordsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  wordsText: {
    fontSize: 9,
    color: '#0f172a',
  },
  notesBox: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  signatureBlock: {
    marginTop: 28,
    alignItems: 'flex-end',
  },
  signatureLine: {
    width: 180,
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#475569',
  },
})

export interface InvoicePdfDocumentProps {
  invoice: InvoiceDraft
  breakdown: TaxBreakdown
}

export function InvoicePdfDocument({
  invoice,
  breakdown,
}: InvoicePdfDocumentProps) {
  const isInterState = breakdown.igst > 0
  const paymentTermsLabel = getPaymentTermsLabel(invoice)
  const notesText = getNotesText(invoice)

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.sellerBlock}>
            {invoice.seller.logo ? (
              <Image src={invoice.seller.logo} style={styles.logo} />
            ) : null}
            <View>
              <Text style={styles.sellerName}>{invoice.seller.name || 'Seller'}</Text>
              {invoice.seller.gstin ? (
                <Text style={styles.muted}>GSTIN: {invoice.seller.gstin}</Text>
              ) : null}
              {invoice.seller.address ? (
                <Text style={styles.muted}>{invoice.seller.address}</Text>
              ) : null}
              {invoice.seller.state ? (
                <Text style={styles.muted}>
                  {invoice.seller.state} ({invoice.seller.stateCode})
                </Text>
              ) : null}
              {invoice.seller.email ? (
                <Text style={styles.muted}>{invoice.seller.email}</Text>
              ) : null}
              {invoice.seller.phone ? (
                <Text style={styles.muted}>{invoice.seller.phone}</Text>
              ) : null}
            </View>
          </View>

          <View>
            <Text style={styles.taxInvoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.taxInvoiceSubtitle}>Original for Recipient</Text>
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.sellerName}>{invoice.buyer.name || 'Buyer'}</Text>
            {invoice.buyer.gstin ? (
              <Text style={styles.muted}>GSTIN: {invoice.buyer.gstin}</Text>
            ) : null}
            {invoice.buyer.address ? (
              <Text style={styles.muted}>{invoice.buyer.address}</Text>
            ) : null}
            {invoice.buyer.state ? (
              <Text style={styles.muted}>
                {invoice.buyer.state} ({invoice.buyer.stateCode})
              </Text>
            ) : null}
            {invoice.buyer.email ? (
              <Text style={styles.muted}>{invoice.buyer.email}</Text>
            ) : null}
            {invoice.buyer.phone ? (
              <Text style={styles.muted}>{invoice.buyer.phone}</Text>
            ) : null}
          </View>

          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Invoice Number</Text>
                <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Invoice Date</Text>
                <Text style={styles.metaValue}>
                  {formatDisplayDate(invoice.invoiceDate)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Due Date</Text>
                <Text style={styles.metaValue}>
                  {formatDisplayDate(invoice.dueDate)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Payment Terms</Text>
                <Text style={styles.metaValue}>{paymentTermsLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colIndex]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colHsn]}>HSN/SAC</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnit]}>Unit</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
              <Text style={[styles.tableHeaderCell, styles.colDisc]}>Disc%</Text>
              <Text style={[styles.tableHeaderCell, styles.colGst]}>GST%</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
            </View>

            {invoice.items.map((item, index) => {
              const amount = calculateLineItemTaxableAmount(item)

              return (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colIndex]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, styles.colDescription]}>
                    {item.description || '—'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colHsn]}>
                    {item.hsnSac || '—'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>
                    {item.unit || '—'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colRate]}>
                    {formatIndianCurrency(item.rate)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDisc]}>
                    {item.discountPercent}%
                  </Text>
                  <Text style={[styles.tableCell, styles.colGst]}>
                    {item.taxRatePercent}%
                  </Text>
                  <Text style={[styles.tableCell, styles.colAmount]}>
                    {formatIndianCurrency(amount)}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Taxable Value</Text>
              <Text style={styles.totalsValue}>
                {formatIndianCurrency(breakdown.taxableValue)}
              </Text>
            </View>

            {isInterState ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>IGST</Text>
                <Text style={styles.totalsValue}>
                  {formatIndianCurrency(breakdown.igst)}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>CGST</Text>
                  <Text style={styles.totalsValue}>
                    {formatIndianCurrency(breakdown.cgst)}
                  </Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>SGST</Text>
                  <Text style={styles.totalsValue}>
                    {formatIndianCurrency(breakdown.sgst)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Round Off</Text>
              <Text style={styles.totalsValue}>
                {formatIndianCurrency(breakdown.roundOff)}
              </Text>
            </View>

            <View style={styles.totalsRowLast}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatIndianCurrency(breakdown.grandTotal)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.wordsBox}>
          <Text style={styles.wordsTitle}>Amount in Words</Text>
          <Text style={styles.wordsText}>{numberToWords(breakdown.grandTotal)}</Text>
        </View>

        {notesText ? (
          <View style={styles.notesBox}>
            <Text style={styles.wordsTitle}>Notes / Terms</Text>
            <Text style={styles.wordsText}>{notesText}</Text>
          </View>
        ) : null}

        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Authorized Signatory</Text>
        </View>
      </Page>
    </Document>
  )
}

function getPaymentTermsLabel(invoice: InvoiceDraft): string {
  if (invoice.paymentTerms === 'custom') {
    return invoice.customPaymentTerms || 'Custom'
  }

  return (
    PAYMENT_TERMS_OPTIONS.find((option) => option.value === invoice.paymentTerms)
      ?.label ?? '—'
  )
}

function getNotesText(invoice: InvoiceDraft): string {
  const parts = [invoice.notes, invoice.termsAndConditions].filter(Boolean)
  return parts.join('\n\n')
}
