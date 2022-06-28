export interface HoneyBlogTheme {
  readMore?: string
  footer?: React.ReactNode
  titleSuffix?: string
  postFooter?: string
  head?: ({
    title,
    meta
  }: {
    title: string
    meta: Record<string, any>
  }) => React.ReactNode
  cusdis?: {
    appId: string
    host?: string
    lang: string
  }
  darkMode?: boolean
  navs?: {
    url: string
    name: string
  }[]
}
