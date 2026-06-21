import { Link, NavLink } from 'react-router-dom'
import { SITE } from '../lib/site'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors sm:flex-none sm:text-left ${
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`

const savedLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors sm:flex-none sm:text-left ${
    isActive
      ? 'bg-slate-800 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-slate-900 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-8 w-1 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
          <Link
            to="/"
            className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl"
          >
            {SITE.name}
          </Link>
        </div>

        <nav className="flex w-full gap-2 sm:w-auto">
          <NavLink to="/" end className={savedLinkClass}>
            Saved Invoices
          </NavLink>
          <NavLink to="/new" className={navLinkClass}>
            New Invoice
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
