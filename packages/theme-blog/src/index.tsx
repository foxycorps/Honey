import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { ThemeProvider, useTheme } from 'next-themes'
import { ReactCusdis } from 'react-cusdis'
import Meta from './meta'
import Nav from './nav'
import MDXTheme, { HeadingContext } from './mdx-theme'

import traverse from './utils/traverse'
import getTags from './utils/get-tags'
import sortDate from './utils/sort-date'
import type { PageMapItem, PageOpt } from '@honeydocs/honey'
import type { HoneyBlogTheme } from './types'
const isProduction = process.env.NODE_ENV === 'production'
// comments
const Cusdis = dynamic(
  // @ts-ignore
  () => import('react-cusdis').then(mod => mod.ReactCusdis),
  { ssr: false }
) as typeof ReactCusdis

interface LayoutProps {
  config: HoneyBlogTheme
  contentNodes: React.ReactNode
  opts: PageOpt
}

const BlogLayout = ({
  config,
  contentNodes,
  opts
}: LayoutProps) => {
  // gather info for tag/posts pages
  let posts: PageMapItem[] = []
  let navPages: PageMapItem[] = []
  const type = opts.meta.type || 'post'
  const route = opts.route
  const hasH1 = opts.hasH1
  let back: string | null = null
  // This only renders once per page
  if (type === 'posts' || type === 'tag' || type === 'page') {
    posts = []
    // let's get all posts
    traverse(opts.pageMap, page => {
      if (
        page.frontMatter &&
        ['page', 'posts'].includes(page.frontMatter.type)
      ) {
        if (page.route === route) {
          navPages.push({ ...page, active: true })
        } else {
          navPages.push(page)
        }
      }
      if (page.children) return
      if (page.name.startsWith('_')) return
      if (
        type === 'posts' &&
        !page.route.startsWith(route === '/' ? route : route + '/')
      )
        return
      if (
        type !== 'page' &&
        (!page.frontMatter ||
          !page.frontMatter.type ||
          page.frontMatter.type === 'post')
      ) {
        posts.push(page)
      }
    })
    posts = posts.sort(sortDate)
    navPages = navPages.sort(sortDate)
  }
  if (type !== 'post') {
    back = null
  } else {
    const parentPages: PageMapItem[] = []
    traverse(opts.pageMap, page => {
      if (
        route !== page.route &&
        (route + '/').startsWith(page.route === '/' ? '/' : page.route + '/')
      ) {
        parentPages.push(page)
      }
    })
    const parentPage = parentPages
      .reverse()
      .find(page => page.frontMatter && page.frontMatter.type === 'posts')
    if (parentPage) {
      back = parentPage.route
    }
  }
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const { query } = router
  const tagName = type === 'tag' ? query.tag : null
  const pageTitle = opts.meta.title || opts.titleText || ''
  const mdxTitle = hasH1 && !pageTitle
  let comments

  if (config.cusdis) {
    if (!config.cusdis.appId) {
      console.warn('[cusdis]', '`appId` is required')
    } else {
      comments = (
        <Cusdis
          lang={config.cusdis.lang}
          style={{
            marginTop: '4rem'
          }}
          attrs={{
            host: config.cusdis.host || 'https://cusdis.com',
            appId: config.cusdis.appId,
            pageId: router.pathname,
            pageTitle,
            theme:
              theme === 'dark' || resolvedTheme === 'dark' ? 'dark' : 'light'
          }}
        />
      )
    }
  }
  const meta = opts.meta

  const postList = posts.length > 0 ? (
    <ul>
      {posts.map(post => {
        if (tagName) {
          const tags = getTags(post)
          if (!Array.isArray(tagName) && !tags.includes(tagName)) {
            return null
          }
        } else if (type === 'tag') {
          return null
        }

        const postTitle =
          (post.frontMatter ? post.frontMatter.title : null) || post.name
        const postDate = post.frontMatter ? (
          <time className="post-item-date">
            {new Date(post.frontMatter.date).toDateString()}
          </time>
        ) : null
        const postDescription =
          post.frontMatter && post.frontMatter.description ? (
            <p className="post-item-desc">
              {post.frontMatter.description}
              {config.readMore ? (
                <Link href={post.route}>
                  <a className="post-item-more">{config.readMore}</a>
                </Link>
              ) : null}
            </p>
          ) : null

        return (
          <div key={post.route} className="post-item">
            <h3>
              <Link href={post.route}>
                <a className="post-item-title">{postTitle}</a>
              </Link>
            </h3>
            {postDescription}
            {postDate}
          </div>
        )
      })}
    </ul>
  ) : null
  const ref = React.useRef<HTMLHeadingElement>(null)

  return (
    <>
      <Head>
        <title>
          {pageTitle}
          {config.titleSuffix}
        </title>
        {config.head
          ? config.head({ title: `${pageTitle} ${config.titleSuffix}`, meta: opts.meta })
          : null}
      </Head>
      <article className="container prose prose-sm md:prose dark:prose-dark">
        <HeadingContext.Provider value={ref}>
          {pageTitle ? <h1>{pageTitle}</h1> : null}
          {mdxTitle ? <h1 ref={ref}></h1> : null}
          {type === 'post' ? (
            /** @ts-expect-error */
            <Meta {...meta} back={back} config={config} />
          ) : (
            <Nav navPages={navPages} config={config} />
          )}
          <MDXTheme>
            {contentNodes}
            {type === 'post' ? config.postFooter : null}
            {type === 'post' ? comments : null}
          </MDXTheme>
          {postList}
          {config.footer}
        </HeadingContext.Provider>
      </article>
    </>
  )
}


const createLayout = (opts: PageOpt, _config: HoneyBlogTheme) => {
  const config: HoneyBlogTheme = Object.assign(
    {
      readMore: 'Read More →',
      footer: (
        <small style={{ display: 'block', marginTop: '8rem' }}>
          CC BY-NC 4.0 2022 © Brayden Moon.
        </small>
      ),
      titleSuffix: null,
      postFooter: null
    },
    _config
  )
  let layoutUsed = false
  const Page = ({ children }: { children: React.ReactChildren }) => {
    if (!layoutUsed && isProduction) {
      throw new Error(
        '[Honey] Please add the `getLayout` logic to your _app.js, see https://nextjs.org/docs/basic-features/layouts#per-page-layouts.'
      )
    }
    return children
  }
  const Layout = (page: React.ReactChildren) => {
    layoutUsed = true
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
      >
        <BlogLayout
          config={config}
          contentNodes={page}
          opts={opts}
        />
      </ThemeProvider>
    )
  }
  Page.getLayout = Layout
  return Page
}


export default createLayout
