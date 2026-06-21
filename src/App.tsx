import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { Footer } from './components/Footer'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import { clearDraftInvoiceNumber } from './lib/invoiceNumber'
import { SITE } from './lib/site'
import { EditInvoicePage } from './pages/EditInvoicePage'
import { InvoiceBuilder } from './pages/InvoiceBuilder'
import { SavedInvoicesList } from './pages/SavedInvoicesList'

function AppLayout({ children }: { children: ReactNode }) {
  useDocumentMeta()

  return (
    <div className="flex min-h-svh flex-col bg-slate-50 font-sans text-slate-800">
      <AppHeader />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}

function NewInvoicePage() {
  useDocumentMeta(`${SITE.name} — New Invoice`, SITE.description)

  useEffect(() => {
    clearDraftInvoiceNumber()
  }, [])

  return <InvoiceBuilder key="new" />
}

function SavedInvoicesPage() {
  useDocumentMeta(`${SITE.name} — Saved Invoices`, SITE.description)

  return <SavedInvoicesList />
}

function EditInvoiceRoute() {
  return <EditInvoicePage />
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <SavedInvoicesPage />
          </AppLayout>
        }
      />
      <Route
        path="/new"
        element={
          <AppLayout>
            <NewInvoicePage />
          </AppLayout>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <AppLayout>
            <EditInvoiceRoute />
          </AppLayout>
        }
      />
    </Routes>
  )
}

export default App
