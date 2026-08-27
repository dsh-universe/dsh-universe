// 站点域名：构建时用环境变量注入正式域名
// 例：SITE_URL=https://dsh.your-domain.com npm run build
// 本地开发默认 localhost
export const SITE_URL = (import.meta.env.SITE_URL as string | undefined) ?? 'http://localhost:4321'
export const SITE_BRAND = 'DSH UNIVERSE'
export const HOME_TITLE = 'DSH UNIVERSE - DeepSeek Harness 插件与技能目录'
export const HOME_DESCRIPTION = 'DSH UNIVERSE curates DeepSeek Harness plugins and skills, auto-synced from the GitHub dsh-plugin topic — browse, search, verify, and one-click install. The plugin marketplace for the DeepSeek Harness ecosystem.'

export function getCanonicalUrl(currentUrl: URL): string {
  const pathname = currentUrl.pathname === '/' ? '/' : currentUrl.pathname.replace(/\/+$/, '')
  return new URL(pathname, SITE_URL).toString()
}

export function buildHomepageStructuredData(numberOfItems: number) {
  const websiteId = `${SITE_URL}/#website`
  const webpageId = `${SITE_URL}/#webpage`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${SITE_URL}/`,
        name: SITE_BRAND,
        alternateName: [
          'DSH UNIVERSE',
          'DSH 插件市场',
          'DeepSeek Harness Plugin Store',
        ],
        description: HOME_DESCRIPTION,
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'CollectionPage',
        '@id': webpageId,
        url: `${SITE_URL}/`,
        name: HOME_TITLE,
        description: HOME_DESCRIPTION,
        inLanguage: 'zh-CN',
        isPartOf: { '@id': websiteId },
        about: {
          '@type': 'SoftwareApplication',
          name: 'DeepSeek Harness',
          applicationCategory: 'DeveloperApplication',
        },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems,
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: '插件市场', item: `${SITE_URL}/#catalog-tools` },
        ],
      },
    ],
  }
}

export function buildBreadcrumbStructuredData(currentLabel: string, items: { label: string; url: string }[]) {
  const itemList = [
    { '@type': 'ListItem', position: 1, name: '首页', item: `${SITE_URL}/` },
    ...items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: it.label,
      item: new URL(it.url, SITE_URL).toString(),
    })),
  ]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itemList,
  }
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
