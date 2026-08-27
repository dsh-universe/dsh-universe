import { describe, expect, it } from 'vitest'

import {
  buildHomepageStructuredData,
  getCanonicalUrl,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_URL,
  serializeJsonLd,
} from './seo'

describe('canonical URLs', () => {
  it('uses the production origin and removes query strings and fragments', () => {
    expect(
      getCanonicalUrl(new URL('http://localhost:4321/plugins/1333111893?sort=stars#readme')),
    ).toBe(new URL('/plugins/1333111893', SITE_URL).toString())
  })

  it('keeps the root slash while removing trailing slashes from content pages', () => {
    expect(getCanonicalUrl(new URL('http://localhost:4321/'))).toBe(new URL('/', SITE_URL).toString())
    expect(getCanonicalUrl(new URL('http://localhost:4321/topics/dsh-plugin/'))).toBe(
      new URL('/topics/dsh-plugin', SITE_URL).toString(),
    )
  })
})

describe('homepage search intent', () => {
  it('uses the requested DSH plugin market name as the homepage title', () => {
    expect(HOME_TITLE).toBe('DSH UNIVERSE - DeepSeek Harness 插件与技能目录')
    expect(HOME_DESCRIPTION).toContain('DSH UNIVERSE')
    expect(HOME_DESCRIPTION).toContain('DeepSeek Harness 生态')
  })

  it('describes the homepage as a searchable plugin collection without overstating verification', () => {
    const data = buildHomepageStructuredData(830)
    const graph = data['@graph']

    expect(graph).toEqual(expect.arrayContaining([
      expect.objectContaining({
        '@type': 'WebSite',
        name: 'DSH UNIVERSE',
        alternateName: expect.arrayContaining([
          'DSH UNIVERSE',
          'DSH 插件市场',
          'DeepSeek Harness Plugin Store',
        ]),
      }),
      expect.objectContaining({
        '@type': 'CollectionPage',
        mainEntity: expect.objectContaining({
          '@type': 'ItemList',
          numberOfItems: 830,
        }),
      }),
    ]))
  })

  it('serializes JSON-LD without allowing script-tag injection', () => {
    expect(serializeJsonLd({ description: '</script><script>alert(1)</script>' }))
      .not.toContain('</script>')
  })
})
