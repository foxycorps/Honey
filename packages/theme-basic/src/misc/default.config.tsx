import React from 'react'

const defaultTheme = {
  projectLink: 'https://github.com/foxycorps/honey',
  docsRepositoryBase: 'https://github.com/foxycorps/honey',
  titleSuffix: ' – Honey',
  nextLinks: true,
  prevLinks: true,
  search: true,
  darkMode: true,
  nextThemes: {
    defaultTheme: 'system',
    storageKey: 'theme',
    forcedTheme: undefined
  },
  defaultMenuCollapsed: false,
  // @TODO: Can probably introduce a set of options to use Google Fonts directly
  // font: true,
  footer: true,
  footerText: `MIT ${new Date().getFullYear()} © Honey.`,
  footerEditLink: 'Edit this page',
  gitTimestamp: 'Last updated on',
  logo: (
    <React.Fragment>
      <span className="mr-2 font-extrabold hidden md:inline">Honey</span>
      <span className="text-gray-600 font-normal hidden md:inline">
        The Next Documentation Engine
      </span>
    </React.Fragment>
  ),
  head: (
    <React.Fragment>
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="description" content="Honey: the next docs builder" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@foxycorps" />
      <meta property="og:title" content="Honey: the next docs builder" />
      <meta property="og:description" content="Honey: the next docs builder" />
      <meta name="apple-mobile-web-app-title" content="Honey" />
    </React.Fragment>
  ),
  searchPlaceholder: ({ locale }: { locale?: string }) => {
    if (locale === 'zh-CN') return '搜索文档...'
    return 'Search documentation...'
  },
  unstable_searchResultEmpty: () => (
    <span className="block p-8 text-center text-gray-400 text-sm select-none">
      No results found.
    </span>
  )
}

export default defaultTheme
