import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getPosts } from '../api/postService'
import { Container, PostCard } from '../components'

function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const authStatus = useSelector((state) => state.auth.status)

  useEffect(() => {
    let active = true

    getPosts()
      .then((res) => {
        if (active) setPosts(res.data?.rows || [])
      })
      .catch((err) => {
        if (!active) return
        setError(err.response?.data?.message || 'Could not load posts. Is the API running?')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full py-10 sm:py-14">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="editorial-card h-72 animate-pulse rounded-2xl bg-slate-100/80"
              />
            ))}
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full py-10 sm:py-14">
        <Container>
          <section className="editorial-card rounded-3xl px-8 py-12 text-center">
            <h1 className="text-3xl font-semibold text-slate-900">Something went wrong</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">{error}</p>
          </section>
        </Container>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="w-full py-10 sm:py-14">
        <Container>
          <section className="editorial-card rounded-3xl px-8 py-12 text-center">
            <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-slate-900">
              Read and publish posts in a clean, focused workspace.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-500">
              {authStatus
                ? 'Your feed is ready for the first published story.'
                : 'Sign in to start reading, writing, and managing your posts in one professional dashboard.'}
            </p>
          </section>
        </Container>
      </div>
    )
  }

  return (
    <div className="w-full py-10 sm:py-14">
      <Container>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <div key={post._id}>
              <PostCard {...post} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default Home
