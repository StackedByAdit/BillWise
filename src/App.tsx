import { useState } from 'react'
import { BuyerDetailsForm } from './components/BuyerDetailsForm'
import { LineItemsTable } from './components/LineItemsTable'
import { SellerProfileForm } from './components/SellerProfileForm'
import { createEmptyLineItem } from './lib/lineItems'
import { EMPTY_PARTY, type LineItem } from './types/invoice'

function App() {
  const [buyer, setBuyer] = useState(EMPTY_PARTY)
  const [items, setItems] = useState<LineItem[]>([createEmptyLineItem()])

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
