import React, { useEffect, useState } from 'react'
import { Container, PostCard } from '../components'
import { getPosts, getMyPosts } from '../api/postService'

const PAGE_SIZE = 9

function AllPosts() {
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')

  // Result is keyed by the request, so any tab/page/query change reads as loading.
  const requestKey = `${tab}|${page}|${query}`
  const [result, setResult] = useState({ key: null, rows: [], pages: 1, total: 0, error: '' })
  const response = result.key === requestKey ? result : null
  const loading = !response
  const posts = response?.rows || []
  const pages = response?.pages || 1
  const total = response?.total || 0
  const error = response?.error || ''

  useEffect(() => {
    let active = true
    const key = `${tab}|${page}|${query}`

    const request =
      tab === 'mine'
        ? getMyPosts()
        : getPosts({ page, limit: PAGE_SIZE, ...(query ? { search: query } : {}) })

    request
      .then((res) => {
        if (!active) return
        const rows = res.data?.rows || []
        setResult({
          key,
          rows,
          pages: res.data?.pages || 1,
          total: res.data?.total ?? rows.length,
          error: '',
        })
      })
      .catch((err) => {
        if (!active) return
        setResult({
          key,
          rows: [],
          pages: 1,
          total: 0,
          error: err.response?.data?.message || 'Could not load posts.',
        })
      })

    return () => {
      active = false
    }
  }, [tab, page, query])

  const changeTab = (nextTab) => {
    setTab(nextTab)
    setPage(1)
  }

  const submitSearch = (event) => {
    event.preventDefault()
    setPage(1)
    setQuery(searchInput.trim())
  }

  return (
    <div className="w-full py-10 sm:py-14">
      <Container>
        <div className="mb-10 rounded-[36px] bg-white/70 px-8 py-10 shadow-lg shadow-slate-900/5 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Archive</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-slate-900">
            Browse every published post in one clean collection.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500">
            A calmer grid makes the archive easier to scan, revisit, and manage.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => changeTab('all')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  tab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All posts
              </button>
              <button
                type="button"
                onClick={() => changeTab('mine')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  tab === 'mine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                My posts
              </button>
            </div>

            {tab === 'all' && (
              <form onSubmit={submitSearch} className="ml-auto flex w-full max-w-sm gap-2">
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search posts..."
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Search
                </button>
              </form>
            )}
          </div>

          {tab === 'all' && !loading && !error && (
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              {total} {total === 1 ? 'post' : 'posts'}
              {query ? ` matching “${query}”` : ''}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="editorial-card h-72 animate-pulse rounded-2xl bg-slate-100/80"
              />
            ))}
          </div>
        ) : error ? (
          <div className="editorial-card rounded-3xl px-8 py-12 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">Something went wrong</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="editorial-card rounded-3xl px-8 py-12 text-center text-slate-500">
            {tab === 'mine' ? 'You have not written any posts yet.' : 'No posts found.'}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <div key={post._id}>
                  <PostCard {...post} />
                </div>
              ))}
            </div>

            {tab === 'all' && pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-slate-500">
                  Page {page} of {pages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(current + 1, pages))}
                  disabled={page >= pages}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  )
}

export default AllPosts
