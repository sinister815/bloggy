import React, { useEffect, useState } from 'react'
import { Container, PostForm } from '../components'
import { getPost } from '../api/postService'
import { Link, useNavigate, useParams } from 'react-router-dom'

function EditPost() {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  const { slug } = useParams()
  const navigate = useNavigate()

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
        if (found) setPost(found)
        else setError('Post not found.')
      })
      .catch((err) => {
        if (!active) return
        setError(err.response?.data?.message || 'Could not load this post.')
      })

    return () => {
      active = false
    }
  }, [slug, navigate])

  if (error) {
    return (
      <div className="py-10 sm:py-14">
        <Container>
          <div className="editorial-card rounded-3xl px-8 py-14 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">{error}</h1>
            <Link
              to="/all-posts"
              className="mt-5 inline-flex text-sm font-semibold text-sky-700 hover:underline"
            >
              Back to all posts
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return post ? (
    <div className="py-10 sm:py-14">
      <Container>
        <PostForm post={post} />
      </Container>
    </div>
  ) : null
}

export default EditPost
