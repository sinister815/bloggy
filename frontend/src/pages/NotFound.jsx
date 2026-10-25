import React from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components'

function NotFound() {
  return (
    <div className="w-full py-16 sm:py-24">
      <Container>
        <section className="editorial-card rounded-[36px] px-8 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">404</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-slate-900">
            This page has wandered off.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-500">
            The link may be broken, or the story may have been unpublished.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Back to home
            </Link>
            <Link
              to="/all-posts"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Browse posts
            </Link>
          </div>
        </section>
      </Container>
    </div>
  )
}

export default NotFound
