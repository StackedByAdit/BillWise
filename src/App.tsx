import { useMemo, useState } from 'react'
import { BuyerDetailsForm } from './components/BuyerDetailsForm'
import { InvoiceSummary } from './components/InvoiceSummary'
import { LineItemsTable } from './components/LineItemsTable'
import { SellerProfileForm } from './components/SellerProfileForm'
import { useLocalStorage } from './hooks/useLocalStorage'
import { createEmptyLineItem } from './lib/lineItems'
import { calculateTaxBreakdown } from './lib/taxCalculator'
import { EMPTY_PARTY, type LineItem } from './types/invoice'
import { EMPTY_SELLER_PROFILE, type SellerProfile } from './types/seller'

const SELLER_PROFILE_KEY = 'gst-invoice:seller-profile'

function App() {
  const [buyer, setBuyer] = useState(EMPTY_PARTY)
  const [items, setItems] = useState<LineItem[]>([createEmptyLineItem()])
  const [sellerProfile] = useLocalStorage<SellerProfile>(
    SELLER_PROFILE_KEY,
    EMPTY_SELLER_PROFILE,
  )

  const taxBreakdown = useMemo(
    () =>
      calculateTaxBreakdown(
        items,
        sellerProfile.stateCode,
        buyer.stateCode,
      ),
    [items, sellerProfile.stateCode, buyer.stateCode],
  )

  return (
    <div className="flex min-h-svh flex-col bg-slate-50 font-sans text-slate-800">
      <header className="border-b border-slate-200 bg-slate-900 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-blue-500" aria-hidden="true" />
            <h1 className="text-xl font-semibold tracking-tight text-white">
              GST Invoice Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
        <SellerProfileForm />
        <BuyerDetailsForm value={buyer} onChange={setBuyer} />
        <LineItemsTable items={items} onChange={setItems} />
        <InvoiceSummary breakdown={taxBreakdown} />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} GST Invoice Generator
          </p>
          <p className="text-sm text-blue-600">BillWise</p>
        </div>
      </footer>
    </div>
  )
}

export default App
