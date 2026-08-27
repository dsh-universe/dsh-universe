import type { APIRoute } from 'astro'
import { SITE_URL } from '../lib/seo'

// 动态 robots.txt：sitemap 地址跟随 SITE_URL
export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap-index.xml`,
    '',
  ].join('\n')
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
