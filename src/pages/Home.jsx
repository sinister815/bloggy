import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import appwriteService from '../appwrite/dbAuth'
import { Container, PostCard } from '../components'

function Home() {
  const [posts, setPosts] = useState([])
  const authStatus = useSelector((state) => state.auth.status)

  useEffect(() => {
    appwriteService.getPosts().then((posts) => {
      if (posts) {
        setPosts(posts.rows)
      }
    })
  }, [])

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
        {/* <section className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="editorial-card rounded-3xl px-8 py-10">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-slate-900">
              A simple, professional place to manage your blog.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-500">
              Discover recent stories, publish new ideas, and keep your content organized without visual clutter.
            </p>
          </div>

          <div className="editorial-card rounded-3xl px-8 py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Overview</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-5 py-6">
                <p className="text-3xl font-semibold text-slate-900">{posts.length}</p>
                <p className="mt-2 text-sm text-slate-500">Published stories</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-5 py-6">
                <p className="text-3xl font-semibold text-slate-900">{authStatus ? 'Live' : 'Guest'}</p>
                <p className="mt-2 text-sm text-slate-500">Current workspace mode</p>
              </div>
            </div>
          </div>
        </section> */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <div key={post.$id}>
              <PostCard {...post} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default Home
