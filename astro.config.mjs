import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

// 站点域名：构建时用 SITE_URL 环境变量注入（本地默认 localhost）
const SITE_URL = process.env.SITE_URL || 'http://localhost:4321'

export default defineConfig({
  base: process.env.SITE_BASE || '/',
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
})
