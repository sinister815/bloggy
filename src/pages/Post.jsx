import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import appwriteService from '../appwrite/dbAuth'
import { Button, Container } from '../components'
import parse from 'html-react-parser'
import { useSelector } from 'react-redux'

function Post() {
  const [post, setPost] = useState(null)
  const { slug } = useParams()
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)

  const isAuthor = post && userData ? post.userId === userData.$id : false

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((post) => {
        if (post) {
          setPost(post)
        } else {
          navigate('/')
        }
      })
    } else {
      navigate('/')
    }
  }, [slug, navigate])

  const deletePost = () => {
    appwriteService.deletePost(post.$id).then((status) => {
      if (status) {
        appwriteService.deleteFile(post.featuredImage)
        navigate('/')
      }
    })
  }

  return post ? (
    <div className="py-10 sm:py-14">
      <Container>
        <article className="editorial-card overflow-hidden rounded-[36px]">
          <div className="relative flex justify-center border-b border-slate-200/80 bg-slate-100 p-3">
            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="max-h-[420px] w-full rounded-[28px] object-cover"
            />

            {isAuthor && (
              <div className="absolute right-6 top-6 flex gap-3">
                <Link to={`/edit-post/${post.$id}`}>
                  <Button bgColor="bg-emerald-600">Edit</Button>
                </Link>
                <Button bgColor="bg-red-500" onClick={deletePost}>
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="px-6 py-8 sm:px-10">
            <div className="mb-6">
              <span className="inline-flex rounded-full bg-sky-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                Published Story
              </span>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                {post.title}
              </h1>
            </div>

            <div className="post-content">{parse(post.content)}</div>
          </div>
        </article>
      </Container>
    </div>
  ) : null
}

export default Post
