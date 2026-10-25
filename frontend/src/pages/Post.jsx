import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPost, deletePost } from '../api/postService'
import { Button, Container } from '../components'
import parse from 'html-react-parser'
import { useSelector } from 'react-redux'

function Post() {
  // Result is keyed by slug, so a slug change automatically reads as "loading".
  const [result, setResult] = useState({ slug: null, post: null, error: '' })
  const [actionError, setActionError] = useState('')
  const { slug } = useParams()
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)

  const post = result.slug === slug ? result.post : null
  const error = result.slug === slug ? result.error : ''
  const loading = !post && !error

  // userId is populated by the API, so compare against the populated _id.
  const isAuthor = post && userData ? post.userId?._id === userData._id : false

  useEffect(() => {
    if (!slug) {
      navigate('/')
      return
    }

    let active = true

    getPost(slug)
      .then((res) => {
        if (!active) return
        const found = res.data?.post
        setResult(
          found
            ? { slug, post: found, error: '' }
            : { slug, post: null, error: 'Post not found.' },
        )
      })
      .catch((err) => {
        if (!active) return
        setResult({
          slug,
          post: null,
          error:
            err.response?.status === 404
              ? 'This post does not exist or has been removed.'
              : err.response?.data?.message || 'Could not load this post.',
        })
      })

    return () => {
      active = false
    }
  }, [slug, navigate])

  const deleteHandler = async () => {
    if (!post) return
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return

    setActionError('')
    try {
      await deletePost(post.slug)
      navigate('/')
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not delete this post.')
    }
  }

  if (loading) {
    return (
      <div className="py-10 sm:py-14">
        <Container>
          <div className="editorial-card animate-pulse rounded-[36px] px-8 py-16 text-center text-slate-500">
            Loading post...
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-10 sm:py-14">
        <Container>
          <section className="editorial-card rounded-[36px] px-8 py-16 text-center">
            <h1 className="font-serif text-3xl font-semibold text-slate-900">{error}</h1>
            <p className="mt-4 text-sm text-slate-500">
              Head back to the homepage, or browse the archive for another story.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/">
                <Button bgColor="bg-slate-950">Back to home</Button>
              </Link>
              <Link to="/all-posts">
                <Button bgColor="bg-white" textColor="text-slate-700">
                  All posts
                </Button>
              </Link>
            </div>
          </section>
        </Container>
      </div>
    )
  }

  if (!post) return null

  const coverImage = post.featuredImage?.url

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <article className="editorial-card overflow-hidden rounded-[36px]">
          {coverImage ? (
            <div className="relative flex justify-center border-b border-slate-200/80 bg-slate-100 p-3">
              <img
                src={coverImage}
                alt={post.title}
                className="max-h-[280px] w-full rounded-[28px] object-cover"
              />

              {isAuthor && (
                <div className="absolute right-6 top-6 flex gap-3">
                  <Link to={`/edit-post/${post.slug}`}>
                    <Button bgColor="bg-emerald-600">Edit</Button>
                  </Link>
                  <Button bgColor="bg-red-500" onClick={deleteHandler}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ) : (
            isAuthor && (
              <div className="flex justify-end gap-3 border-b border-slate-200/80 px-6 py-4">
                <Link to={`/edit-post/${post.slug}`}>
                  <Button bgColor="bg-emerald-600">Edit</Button>
                </Link>
                <Button bgColor="bg-red-500" onClick={deleteHandler}>
                  Delete
                </Button>
              </div>
            )
          )}

          <div className="px-6 py-8 sm:px-10">
            <div className="mb-4">
              <span className="inline-flex rounded-full bg-sky-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                Published Story
              </span>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                {post.title}
              </h1>
              {post.userId?.name && (
                <p className="mt-3 text-sm text-slate-500">By {post.userId.name}</p>
              )}
            </div>

            {actionError && (
              <p className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {actionError}
              </p>
            )}

            <div className="post-content">{parse(post.content)}</div>
          </div>
        </article>
      </Container>
    </div>
  )
}

export default Post
