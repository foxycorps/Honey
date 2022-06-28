import React from 'react'
import Link from 'next/link'
import ThemeSwitch from './theme-switch'
import type { HoneyBlogTheme } from './types'
import { split } from './utils/get-tags'

interface MeatProps {
  author: string
  date: string
  tag: string | string[]
  back: string
  config: HoneyBlogTheme
}
export default function Meta({ author, date, tag, back, config }: MeatProps) {
  const authorNode = author ? author : null
  const dateNode = date ? <time>{new Date(date).toDateString()}</time> : null
  const tags = tag ? split(tag) : []

  return (
    <div className="meta-line">
      <div className="meta">
        {authorNode}
        {authorNode && dateNode ? ', ' : null}
        {dateNode}
        {(authorNode || dateNode) && tags.length ? ' • ' : null}
        {tags.map(t => {
          return (
            <Link key={t} href="/tags/[tag]" as={`/tags/${t}`}>
              <a className="tag">{t}</a>
            </Link>
          )
        })}
      </div>
      {back ? (
        <Link href={back}>
          <a className="meta-back">Back</a>
        </Link>
      ) : null}
      {config.darkMode && <ThemeSwitch />}
    </div>
  )
}
