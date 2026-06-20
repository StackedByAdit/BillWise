function App() {
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

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 shadow-sm">
          <p className="text-base font-medium text-slate-700">
            Main content area
          </p>
          <p className="mt-2 max-w-md text-center text-sm text-slate-500">
            Invoice forms, previews, and generated documents will appear here.
          </p>
        </div>
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
