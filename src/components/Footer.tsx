import { SITE } from '../lib/site'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{SITE.authorName}</p>
          <a
            href={`mailto:${SITE.authorEmail}`}
            className="mt-1 block break-all text-sm text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            {SITE.authorEmail}
          </a>
        </div>

        <a
          href={SITE.digitalHeroesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
        >
          {SITE.digitalHeroesLabel}
        </a>
      </div>
    </footer>
  )
}
