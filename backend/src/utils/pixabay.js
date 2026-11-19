/**
 * Pixabay search + Cloudinary import helpers.
 *
 * Pixabay keys and Cloudinary credentials stay on the API server, so the MCP
 * client never sees either. Every image is copied into Cloudinary, which means
 * the website is not hot-linking a third-party CDN and an image keeps working
 * even if the Pixabay result disappears.
 */
import { uploadRemoteImage } from './imageStore.js'

const PIXABAY_API_URL = 'https://pixabay.com/api/'
const REQUEST_TIMEOUT_MS = 20_000

const pixabayError = (message, status = 502) =>
  Object.assign(new Error(message), { status })

/**
 * Only Pixabay-hosted URLs may be pulled in (blocks arbitrary SSRF targets).
 * The `(^|\.)` boundary keeps look-alikes such as `evil-pixabay.com` out.
 */
export const isPixabayUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && /(^|\.)pixabay\.com$/i.test(url.hostname)
  } catch {
    return false
  }
}

const toImage = (hit) => ({
  id: hit.id,
  tags: hit.tags,
  pageUrl: hit.pageURL,
  previewUrl: hit.previewURL,
  downloadUrl: hit.largeImageURL || hit.webformatURL || hit.imageURL,
  width: hit.imageWidth,
  height: hit.imageHeight,
  author: hit.user,
  authorUrl: hit.userURL,
})

/**
 * Pixabay allows 100 requests/minute and asks callers to cache for 24h, so this
 * stays a single request per call and never loops.
 */
export async function searchPixabay({
  query,
  id,
  perPage = 12,
  page = 1,
  orientation = 'horizontal',
  imageType = 'photo',
} = {}) {
  const key = process.env.PIXABAY_API_KEY
  if (!key) throw pixabayError('PIXABAY_API_KEY is not configured on the API server', 503)
  if (!query && !id) throw pixabayError('Provide a search query (q) or an image id', 400)

  const params = new URLSearchParams({
    key,
    per_page: String(Math.min(Math.max(Number(perPage) || 12, 3), 50)),
    page: String(Math.max(Number(page) || 1, 1)),
    orientation,
    image_type: imageType,
    safesearch: 'true',
    order: 'popular',
  })
  if (query) params.set('q', String(query).slice(0, 100))
  if (id) params.set('id', String(id))

  let res
  try {
    res = await fetch(`${PIXABAY_API_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    throw pixabayError(`Could not reach Pixabay: ${err.message}`)
  }

  if (res.status === 429) {
    throw pixabayError('Pixabay rate limit reached (100 requests/minute). Try again shortly.', 429)
  }
  if (!res.ok) {
    throw pixabayError(`Pixabay responded with HTTP ${res.status}`)
  }

  const data = await res.json()
  return Array.isArray(data.hits) ? data.hits.map(toImage).filter((hit) => hit.downloadUrl) : []
}

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])

const splitTags = (tags) =>
  typeof tags === 'string'
    ? tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 10)
    : []

/** Attribution stored on the post (and rendered under the cover). */
const toCredit = (candidate) => ({
  source: 'pixabay',
  author: candidate.author || null,
  authorUrl: candidate.authorUrl || null,
  pageUrl: candidate.pageUrl || null,
  tags: splitTags(candidate.tags),
})

/** Ready-to-paste <figure> for an in-article image, credit included. */
const figureHtml = ({ url, altText, credit }) => {
  const alt = escapeHtml(altText || '')
  const link = credit.pageUrl || credit.authorUrl || 'https://pixabay.com/'
  const source = credit.author
    ? `<a href="${escapeHtml(link)}" rel="noopener nofollow">${escapeHtml(credit.author)}</a> / Pixabay`
    : 'Pixabay'
  return (
    `<figure><img src="${escapeHtml(url)}" alt="${alt}" loading="lazy" decoding="async" />` +
    `<figcaption>Photo: ${source}</figcaption></figure>`
  )
}

/** Resolves {imageUrl | imageId | query} into the Pixabay hit to be imported. */
async function pickCandidate({ imageUrl, imageId, query }) {
  if (imageUrl) {
    if (!isPixabayUrl(imageUrl)) {
      throw pixabayError('imageUrl must be a Pixabay URL. Use imageQuery or imageId otherwise.', 400)
    }
    return { downloadUrl: imageUrl }
  }
  if (imageId) {
    const [hit] = await searchPixabay({ id: imageId, perPage: 3 })
    if (!hit) throw pixabayError(`No Pixabay image found with id ${imageId}`, 404)
    return hit
  }
  if (query) {
    const [hit] = await searchPixabay({ query })
    if (!hit) throw pixabayError(`No Pixabay images matched "${query}"`, 404)
    return hit
  }
  throw pixabayError('Provide imageQuery, imageId or imageUrl', 400)
}

const uploadError = (err) =>
  err.status ? err : pixabayError(`Cloudinary upload failed: ${err.message}`)

/**
 * Cover image for a post: stored as <folder>/covers/<slug>, replacing the
 * previous asset under that same public id.
 */
export async function resolvePixabayCover({ imageUrl, imageId, query, slug }) {
  const candidate = await pickCandidate({ imageUrl, imageId, query })

  let uploaded
  try {
    uploaded = await uploadRemoteImage({ url: candidate.downloadUrl, slug, role: 'cover' })
  } catch (err) {
    throw uploadError(err)
  }

  return {
    url: uploaded.url,
    publicId: uploaded.publicId,
    credit: toCredit(candidate),
  }
}

/**
 * In-article image: stored as <folder>/inline/<slug>-<n> (n auto-incremented),
 * so it can never overwrite the cover. Returns the HTML tag for the article.
 */
export async function resolvePixabayImage({
  imageUrl,
  imageId,
  query,
  slug,
  index,
  altText,
  title,
}) {
  const candidate = await pickCandidate({ imageUrl, imageId, query })

  let uploaded
  try {
    uploaded = await uploadRemoteImage({
      url: candidate.downloadUrl,
      slug,
      role: 'inline',
      index,
    })
  } catch (err) {
    throw uploadError(err)
  }

  const credit = toCredit(candidate)

  return {
    url: uploaded.url,
    publicId: uploaded.publicId,
    width: uploaded.width,
    height: uploaded.height,
    credit,
    html: figureHtml({ url: uploaded.url, altText: altText || title, credit }),
  }
}
