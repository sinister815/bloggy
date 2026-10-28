import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LAST_UPDATED, SITE_NAME } from '../config/siteConfig.js'

function InfoPageLayout({ title, eyebrow = 'BLOGGY / INFORMATION', description, children }) {
  useEffect(() => {
    document.title = `${title} | ${SITE_NAME}`

    let descriptionTag = document.querySelector('meta[name="description"]')
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta')
      descriptionTag.name = 'description'
      document.head.appendChild(descriptionTag)
    }
    descriptionTag.content = description
  }, [title, description])

  return (
    <div className="w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
          <Link className="font-medium transition hover:text-sky-700" to="/">
            Home
          </Link>
          <span aria-hidden="true" className="mx-2 text-slate-300">/</span>
          <span aria-current="page" className="text-slate-700">{title}</span>
        </nav>

        <article className="editorial-card overflow-hidden rounded-3xl">
          <header className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-9 text-white sm:px-10 sm:py-12 lg:px-12">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sky-300">{eyebrow}</p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
          </header>

          <div className="px-6 py-7 sm:px-10 sm:py-10 lg:px-12">
            <p className="mb-7 text-xs font-medium text-slate-400">Last updated: {LAST_UPDATED}</p>
            <div className="info-page-content">{children}</div>

            <div className="mt-10 border-t border-slate-200 pt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <span aria-hidden="true">←</span> Back to {SITE_NAME}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

export default InfoPageLayout
