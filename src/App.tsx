import type { ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { InvoiceBuilder } from './pages/InvoiceBuilder'

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50 font-sans text-slate-800">
      <header className="border-b border-slate-200 bg-slate-900 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-blue-500" aria-hidden="true" />
            <h1 className="text-xl font-semibold tracking-tight text-white">
              GST Invoice Generator
            </h1>
          </div>
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <InvoiceBuilder />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
