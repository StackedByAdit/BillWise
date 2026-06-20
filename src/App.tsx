import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { HashRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import { clearDraftInvoiceNumber } from './lib/invoiceNumber'
import { EditInvoicePage } from './pages/EditInvoicePage'
import { InvoiceBuilder } from './pages/InvoiceBuilder'
import { SavedInvoicesList } from './pages/SavedInvoicesList'

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50 font-sans text-slate-800">
      <header className="border-b border-slate-200 bg-slate-900 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-blue-500" aria-hidden="true" />
            <Link to="/" className="text-xl font-semibold tracking-tight text-white">
              GST Invoice Generator
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              Saved Invoices
            </NavLink>
            <NavLink
              to="/new"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              New Invoice
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} GST Invoice Generator
          </p>
          <p className="text-sm text-blue-600">BillWise</p>
        </div>
      </footer>
    </div>
  )
}

function NewInvoicePage() {
  useEffect(() => {
    clearDraftInvoiceNumber()
  }, [])

  return <InvoiceBuilder key="new" />
}

function EditInvoiceRoute() {
  return <EditInvoicePage />
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <SavedInvoicesList />
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
    </HashRouter>
  )
}

export default App
