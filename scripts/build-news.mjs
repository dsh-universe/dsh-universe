/**
 * build-news.mjs — 解析 Horizon 日报 md → src/data/news-data.json
 *
 * 数据源：D:\Hermes\AI-programs\Horizon\data\summaries\horizon-{date}-zh.md
 *   （每天一份主文件，含 科技新闻 / 财经新闻 两个 section；
 *     某天主文件缺财经时，尝试补读 horizon-{date}-finance-zh.md）
 * 窗口：最近 14 天（build 时自动截断，更早的本地保留、站上不显示）
 * 用法：node scripts/build-news.mjs
 * 输出：src/data/news-data.json
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SUMMARIES_DIR = process.env.HORIZON_SUMMARIES_DIR || 'D:/Hermes/AI-programs/Horizon/data/summaries'
const OUT_PATH = join(process.cwd(), 'src', 'data', 'news-data.json')
const WINDOW_DAYS = Number(process.env.NEWS_WINDOW_DAYS || 5)

/** 解析单个 md 文件 → {sections: [{cat, items: [...]}]} */
function parseMd(text) {
  const sections = []
  // 按 "## 标题" 切分（科技新闻 / 财经新闻）
  const parts = text.split(/^##\s+(.+)$/m)
  // parts[0] 是头部，之后成对 [标题, 内容]
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const catName = parts[i].trim()
    const body = parts[i + 1]
    let cat = null
    if (catName.includes('科技')) cat = 'tech'
    else if (catName.includes('财经')) cat = 'finance'
    if (!cat) continue

    const items = []
    // 按 "### " 分条目
    const blocks = body.split(/^###\s+/m)
    for (let j = 1; j < blocks.length; j++) {
      const block = blocks[j]
      const lines = block.split(/\r?\n/)
      const head = lines[0] || ''
      // 头行: [标题](url) ⭐️ 9.0/10
      const titleMatch = head.match(/\[([^\]]+)\]\(([^)]+)\)/)
      const scoreMatch = head.match(/⭐️?\s*([\d.]+)\/10/)
      if (!titleMatch) continue
      const title = titleMatch[1].trim()
      const url = titleMatch[2].trim()
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : null

      // 摘要 = 第一个非空段落（跳过头行，正文首段；不取「背景」「影响」等带 ** 的段落）
      let summary = ''
      for (const line of lines.slice(1)) {
        const t = line.trim()
        if (!t) continue
        if (t.startsWith('**') || t.startsWith('<details') || t.startsWith('<a id') || t.startsWith('|') || t.startsWith('---')) continue
        summary = t.replace(/^#+\s*/, '').trim()
        break
      }

      // 来源 = 来源行（形如 "hackernews · zacharyozer · 8月16日 20:31 · [社区讨论](...)"）
      let source = ''
      for (const line of lines.slice(1)) {
        const t = line.trim()
        if (t.includes(' · ') && !t.startsWith('**')) {
          source = t.split(' · ')[0].trim()
          break
        }
      }

      items.push({ title, url, score, source, summary })
    }
    if (items.length) sections.push({ cat, items })
  }
  return sections
}

/** 解析 finance 单独文件（某天主文件缺财经时补读） */
function parseFinanceOnly(text) {
  const sections = parseMd(text)
  return sections.filter((s) => s.cat === 'finance')
}

function main() {
  if (!existsSync(SUMMARIES_DIR)) {
    console.error(`[build-news] 目录不存在: ${SUMMARIES_DIR}`)
    process.exit(1)
  }
  const files = readdirSync(SUMMARIES_DIR)
  const dateMap = new Map()
  for (const f of files) {
    const m = f.match(/^horizon-(\d{4}-\d{2}-\d{2})-zh\.md$/)
    if (m) dateMap.set(m[1], f)
  }
  const dates = [...dateMap.keys()].sort().reverse().slice(0, WINDOW_DAYS)

  const days = []
  for (const date of dates) {
    const mainFile = dateMap.get(date)
    const sections = parseMd(readFileSync(join(SUMMARIES_DIR, mainFile), 'utf-8'))
    // 主文件缺财经 → 补读 finance 单独文件
    if (!sections.some((s) => s.cat === 'finance')) {
      const finFile = `horizon-${date}-finance-zh.md`
      if (existsSync(join(SUMMARIES_DIR, finFile))) {
        const fin = parseFinanceOnly(readFileSync(join(SUMMARIES_DIR, finFile), 'utf-8'))
        sections.push(...fin)
      }
    }
    days.push({ date, display: date.slice(5), sections })
  }

  const data = {
    updated: new Date().toISOString().slice(0, 16),
    windowDays: WINDOW_DAYS,
    days,
  }
  writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), 'utf-8')
  const total = days.reduce((n, d) => n + d.sections.reduce((m, s) => m + s.items.length, 0), 0)
  console.log(`[build-news] OK: ${days.length} 天 / ${total} 条 → ${OUT_PATH}`)
}

main()
