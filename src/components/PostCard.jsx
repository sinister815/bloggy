import React, { useState } from 'react'
import appwriteService from '../appwrite/dbAuth'
import { Link } from 'react-router-dom'

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildPreview(content, limit = 150) {
  const source = stripHtml(content)
  if (!source) return 'Read More'
  return (
    <>
      {source.slice(0, limit).trim()}
      <span className="font-semibold text-slate-900"> ...Read More</span>
    </>
  )
}

function PostCard({ $id, title, featuredImage, content }) {
  const [hasImageError, setHasImageError] = useState(false)
  const imageSrc = featuredImage ? appwriteService.getFilePreview(featuredImage) : null
  const preview = buildPreview(content)

  return (
    <Link to={`/post/${$id}`}>
      <article className="editorial-card h-full overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-0.5">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          {imageSrc && !hasImageError ? (
            <img
              src={imageSrc}
              alt={title}
              onError={() => setHasImageError(true)}
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-500">
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-3xl border border-slate-300 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 h-10 w-10 rounded-full border border-slate-300 bg-slate-100" />
                <div className="h-1.5 w-14 rounded-full bg-slate-300" />
                <div className="mt-2 h-1.5 w-8 rounded-full bg-slate-300" />
                <span className="mt-3 text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
                  No image
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2 p-4 text-left">
          <h2 className="text-lg font-semibold leading-tight text-slate-900">{title}</h2>
          <p className="text-sm leading-6 text-slate-500">{preview}</p>
        </div>
      </article>
    </Link>
  )
}

export default PostCard
