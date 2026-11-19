/**
 * Cloudinary storage layer used by the MCP image tools.
 *
 * Naming contract (one post = one slug):
 *   cover       -> <folder>/covers/<slug>
 *   inline      -> <folder>/inline/<slug>-1, -2, -3 ...
 *
 * The cover id is stable, so replacing a cover overwrites the same asset and the
 * URL never changes. Inline images use their own folder and an auto-incremented
 * slot, so an article image can never overwrite the cover.
 */
import cloudinary from './cloudinary.js'

const UPLOAD_TIMEOUT_MS = 60_000

/** Resized + compressed on Cloudinary's side: smaller pages, no frontend work. */
const UPLOAD_TRANSFORMATION = [
  { width: 1600, crop: 'limit' },
  { fetch_format: 'auto', quality: 'auto:good' },
]

const folder = () => (process.env.CLOUDINARY_FOLDER || 'bloggy').replace(/\/+$/, '')

/** Turns any title/slug into a Cloudinary-safe public id segment. */
export const normalizeSlug = (slug) =>
  String(slug ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'cover'

export const coverPublicId = (slug) => `${folder()}/covers/${normalizeSlug(slug)}`

const inlinePrefix = (slug) => `${folder()}/inline/${normalizeSlug(slug)}-`

export const inlinePublicId = (slug, index) =>
  `${inlinePrefix(slug)}${Math.max(Number(index) || 1, 1)}`

/** Highest existing inline slot + 1, so an import never clobbers a sibling image. */
export async function nextInlineIndex(slug) {
  try {
    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      prefix: inlinePrefix(slug),
      max_results: 100,
    })
    let max = 0
    for (const resource of resources || []) {
      const match = /-(\d+)$/.exec(resource.public_id || '')
      if (match) max = Math.max(max, Number(match[1]))
    }
    return max + 1
  } catch (err) {
    console.warn('Cloudinary listing failed, using slot 1:', err.message)
    return 1
  }
}

/**
 * Copies a remote (Pixabay) URL into Cloudinary. `role: 'cover'` overwrites the
 * post's single cover asset; `role: 'inline'` picks the next free slot unless an
 * explicit slot is passed.
 */
export async function uploadRemoteImage({ url, slug, role = 'cover', index }) {
  let publicId
  if (role === 'inline') {
    const slot = Number(index) > 0 ? Math.trunc(Number(index)) : await nextInlineIndex(slug)
    publicId = inlinePublicId(slug, slot)
  } else {
    publicId = coverPublicId(slug)
  }

  const result = await cloudinary.uploader.upload(url, {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
    timeout: UPLOAD_TIMEOUT_MS,
    transformation: UPLOAD_TRANSFORMATION,
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

/** Renames the cover asset when the post slug changes. Never throws. */
export async function renameForSlug({ publicId, newSlug }) {
  if (!publicId) return null
  const target = coverPublicId(newSlug)
  if (publicId === target) return { renamed: false, publicId: target, url: null }

  try {
    const result = await cloudinary.uploader.rename(publicId, target, {
      overwrite: true,
      invalidate: true,
    })
    return { renamed: true, publicId: result.public_id, url: result.secure_url }
  } catch (err) {
    // A missing asset must not fail the post update; the old URL keeps working.
    console.warn('Cloudinary rename failed:', err.message)
    return null
  }
}

export async function deleteAsset(publicId) {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.warn('Cloudinary delete failed:', err.message)
  }
}

/** Deletes the cover plus every inline image that belongs to the post's slug. */
export async function deletePostImages({ slug, coverPublicId: storedPublicId }) {
  await deleteAsset(storedPublicId || coverPublicId(slug))
  try {
    await cloudinary.api.delete_resources_by_prefix(inlinePrefix(slug))
  } catch (err) {
    console.warn('Cloudinary inline cleanup failed:', err.message)
  }
}
