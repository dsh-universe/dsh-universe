import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const homepagePath = fileURLToPath(new URL('../pages/index.astro', import.meta.url))
const vectorMarkPath = fileURLToPath(new URL('../../public/deepseek-mark.svg', import.meta.url))
const gridMarkPath = fileURLToPath(new URL('../components/DeepSeekGridMark.astro', import.meta.url))
const homepageSource = readFileSync(homepagePath, 'utf8')

describe('homepage DeepSeek grid mark', () => {


  it('keeps the logo silhouette resolution-independent', () => {
    expect(existsSync(vectorMarkPath)).toBe(true)
    if (!existsSync(vectorMarkPath)) return

    const vectorMark = readFileSync(vectorMarkPath, 'utf8')
    expect(vectorMark).toContain('viewBox="0 0 24 24"')
  })

  it('quantizes the silhouette into complete grid cells at its edges', () => {
    expect(existsSync(gridMarkPath)).toBe(true)
    if (!existsSync(gridMarkPath)) return

    const gridMark = readFileSync(gridMarkPath, 'utf8')
    expect(gridMark).toContain('data-grid-size="80"')
    expect(gridMark).toContain('shape-rendering="crispEdges"')
    expect(gridMark).toContain('deepseek-grid-gradient')
    expect(gridMark).toContain('h.84v.84h-.84z')
  })


})
