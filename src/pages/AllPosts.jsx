import React, { useState, useEffect } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from '../appwrite/dbAuth'

function AllPosts() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    appwriteService.getPosts().then((posts) => {
      if (posts) {
        setPosts(posts.rows || [])
      }
    })
  }, [])

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
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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

export default AllPosts
