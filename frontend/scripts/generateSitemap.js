/**
 * Build-time sitemap generator.
 *
 * Runs from the "prebuild" script, so `npm run build` always ships a fresh
 * sitemap. Published posts are fetched from the site's own API, which means
 * anything added later through MCP appears on the next deploy automatically -
 * no manual editing, and posts are never duplicated in the repository.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/sitemap.xml')

/**
 * Vite only exposes .env to the bundle, so a plain Node script has to read the
 * file itself. Values already present in the environment (Render, CI) win.
 */
function loadEnvFile(file) {
    const path = resolve(ROOT, file)
    if (!existsSync(path)) return

    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
        if (!match) continue

        const [, key, rawValue] = match
        if (process.env[key] !== undefined) continue

        process.env[key] = rawValue.replace(/^["']|["']$/g, '')
    }
}

loadEnvFile('.env.production')
loadEnvFile('.env')

const API_BASE = (process.env.SITEMAP_API_URL || process.env.VITE_API_URL || '').replace(/\/+$/, '')

// Site root is the API URL minus its /api route:
//   https://host/api  ->  https://host
// SITEMAP_SITE_URL / RENDER_EXTERNAL_URL only override this for the case where
// the frontend and the API live on different hosts.
const SITE_OVERRIDE = process.env.SITEMAP_SITE_URL || process.env.RENDER_EXTERNAL_URL || ''
const SITE_SOURCE = process.env.SITEMAP_SITE_URL
    ? 'SITEMAP_SITE_URL'
    : process.env.RENDER_EXTERNAL_URL
      ? 'RENDER_EXTERNAL_URL'
      : 'derived from VITE_API_URL'
const SITE = (SITE_OVERRIDE || (API_BASE ? new URL(API_BASE).origin : '')).replace(/\/+$/, '')

const STATIC_PAGES = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/about', changefreq: 'monthly', priority: '0.5' },
    { path: '/contact', changefreq: 'monthly', priority: '0.5' },
    { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
    { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.3' },
    { path: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
    // '/all-posts' is still behind AuthLayout - add it here once that page is
    // public, otherwise Google gets a login redirect.
]

if (!SITE) {
    console.warn('[sitemap] VITE_API_URL is not set - skipping sitemap generation.')
    process.exit(0)
}

/**
 * The API runs on a free tier that sleeps, and a cold start takes ~50s, so a
 * single request is not reliable. Retry a few times before giving up.
 */
async function fetchPosts(attempts = 3) {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const res = await fetch(`${API_BASE}/posts?limit=1000`, {
                signal: AbortSignal.timeout(90_000),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            const data = await res.json()
            return Array.isArray(data.rows) ? data.rows : []
        } catch (err) {
            const isLast = attempt === attempts
            console.warn(
                `[sitemap] attempt ${attempt}/${attempts} failed: ${err.message}` +
                    (isLast ? '' : ' - retrying in 10s')
            )
            if (isLast) return []
            await new Promise((done) => setTimeout(done, 10_000))
        }
    }
}

const escapeXml = (value) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

const urlEntry = ({ loc, lastmod, changefreq, priority }) => {
    const parts = [`        <loc>${escapeXml(loc)}</loc>`]
    if (lastmod) parts.push(`        <lastmod>${lastmod}</lastmod>`)
    if (changefreq) parts.push(`        <changefreq>${changefreq}</changefreq>`)
    if (priority) parts.push(`        <priority>${priority}</priority>`)
    return `    <url>\n${parts.join('\n')}\n    </url>`
}

const posts = await fetchPosts()

const postEntries = posts
    .filter((post) => post?.slug)
    .map((post) =>
        urlEntry({
            loc: `${SITE}/post/${encodeURIComponent(post.slug)}`,
            lastmod: (post.updatedAt || post.createdAt || '').slice(0, 10) || undefined,
            changefreq: 'monthly',
            priority: '0.8',
        })
    )

const staticEntries = STATIC_PAGES.map((page) =>
    urlEntry({ ...page, loc: `${SITE}${page.path === '/' ? '/' : page.path}` })
)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...postEntries].join('\n')}
</urlset>
`

writeFileSync(OUT, xml, 'utf8')

console.log(`[sitemap] wrote ${staticEntries.length + postEntries.length} URLs to public/sitemap.xml`)
console.log(`[sitemap] site root: ${SITE} (${SITE_SOURCE})`)
console.log(`[sitemap] api base:  ${API_BASE}`)

if (!posts.length) {
    console.warn('[sitemap] no posts returned by the API - sitemap contains static pages only.')
}
