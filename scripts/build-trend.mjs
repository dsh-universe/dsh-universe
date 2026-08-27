#!/usr/bin/env node
/**
 * build-trend.mjs — 生成生态趋势数据（src/data/trend-data.json）
 *
 * 数据源：
 *  - 插件数量曲线：catalog.json 自带 createdAt（无需 GitHub API）
 *  - Stars 历史曲线（可选增强）：设置 GITHUB_TOKEN 后拉取 Top 仓库的
 *    stargazers 时间线（每个 star 的时间点），按天聚合
 *
 * 用法：
 *  node scripts/build-trend.mjs              # 仅数量曲线（离线可用）
 *  GITHUB_TOKEN=xxx node scripts/build-trend.mjs   # 数量 + Stars 曲线
 *
 * 建议在数据同步（npm run sync）后运行，构建前执行：
 *  npm run trend
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CATALOG_PATH = path.join(ROOT, 'src/data/catalog.json')
const OUT_PATH = path.join(ROOT, 'src/data/trend-data.json')

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'))
const repos = catalog.repositories || catalog

// ---------- 1. 数量曲线（createdAt 按天聚合，累计） ----------
const byDay = {}
for (const r of repos) {
  const d = (r.createdAt || '').slice(0, 10)
  if (!d || d < '2020-01-01') continue
  byDay[d] = (byDay[d] || 0) + 1
}
const days = Object.keys(byDay).sort()
let cum = 0
const countSeries = days.map((d) => {
  cum += byDay[d]
  return { date: d, count: cum }
})

// ---------- 2. Stars 历史曲线（可选，需 GITHUB_TOKEN） ----------
let starSeries = null
const token = process.env.GITHUB_TOKEN
if (token) {
  // 取 Top 60 仓库（覆盖绝大多数 stars），拉 stargazers 时间线
  const top = [...repos]
    .filter((r) => r.stars > 0)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 60)

  const starByDay = {}
  let fetched = 0
  for (const r of top) {
    const fullName = r.fullName || `${r.owner.login}/${r.name}`
    try {
      // 带 star+json Accept 头可拿到每个 star 的 starred_at
      const res = await fetch(`https://api.github.com/repos/${fullName}/stargazers?per_page=100`, {
        headers: {
          Accept: 'application/vnd.github.star+json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) { console.warn(`skip ${fullName}: ${res.status}`); continue }
      const arr = await res.json()
      for (const s of arr) {
        const d = (s.starred_at || '').slice(0, 10)
        if (d) starByDay[d] = (starByDay[d] || 0) + 1
      }
      // 超过 100 页（>100 star）只取最新 100 个——历史曲线近似
      fetched++
      await new Promise((r2) => setTimeout(r2, 400)) // 限速：2.5 req/s 内
    } catch (e) {
      console.warn(`skip ${fullName}: ${e.message}`)
    }
  }
  if (fetched > 0) {
    const starDays = Object.keys(starByDay).sort()
    let cum2 = 0
    starSeries = starDays.map((d) => {
      cum2 += starByDay[d]
      return { date: d, stars: cum2 }
    })
  }
  console.log(`Stars 曲线：拉取 ${fetched} 个仓库时间线`)
} else {
  console.log('未设置 GITHUB_TOKEN，仅生成数量曲线（Stars 曲线需 token）')
}

const totalStars = repos.reduce((s, r) => s + (r.stars || 0), 0)

const out = {
  generatedAt: new Date().toISOString(),
  totalPlugins: repos.length,
  totalStars,
  hasStarSeries: !!starSeries,
  countSeries,
  starSeries,
}
fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2))
console.log(`趋势数据已生成：${OUT_PATH}`)
console.log(`  插件总数 ${out.totalPlugins}，Stars 合计 ${totalStars}，时间跨度 ${days[0]} ~ ${days[days.length - 1]}`)
