import { PageMapItem } from './types'
import fs from 'fs-extra';
import { getLocaleFromFilename, parseJsonFile, removeExtension } from './utils'
import path from 'path'
import slash from 'slash'
import grayMatter from 'gray-matter'
import { extension, findPagesDir, metaExtension } from './page-map'
import { Compiler } from 'webpack'
import { restoreCache } from './content-dump'

export function collectFiles(
  dir: string,
  route: string = '/',
  fileMap: Record<string, any> = {}
): { items: PageMapItem[]; fileMap: Record<string, any> } {
  // const files = await util.promisify(readdir)(dir, { withFileTypes: true });

  const items: any[] = [];
  const files = fs.readdirSync(dir, { "withFileTypes": true });

  for (const file of files) {
    const filePath = path.resolve(dir, file.name);
    const fileRoute = slash(path.join(route, removeExtension(file.name).replace(/^index$/, '')));

    if (file.isDirectory()) {
      if (fileRoute === '/api') continue; // we don't mess with the api
      const { items: children } = collectFiles(filePath, fileRoute, fileMap);
      if (!children || !children.length) continue;
      items.push({
        name: file.name,
        children,
        route: fileRoute
      })
    } else if (extension.test(file.name)) {
      const locale = getLocaleFromFilename(file.name);
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const { data } = grayMatter(fileContents);

      if (Object.keys(data).length) {
        fileMap[filePath] = {
          name: removeExtension(file.name),
          route: fileRoute,
          frontMatter: fileRoute,
          locale
        }
        items.push(fileMap[filePath]);
        continue;
      }
      fileMap[filePath] = {
        name: removeExtension(file.name),
        route: fileRoute,
        locale
      }
      items.push(fileMap[filePath]);
      continue;
    } else if (metaExtension.test(file.name)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const meta = parseJsonFile(content, filePath);
      // @ts-expect-error since metaExtension.test(f.name) === true
      const locale = file.name.match(metaExtension)[1]
      fileMap[filePath] = {
        name: 'meta.json',
        meta,
        locale
      }
      items.push(fileMap[filePath])
    }
  }

  return {
    items,
    fileMap
  }

}

export class PageMapCache {
  public cache: { items: PageMapItem[]; fileMap: Record<string, any> } | null
  constructor() {
    this.cache = { items: [], fileMap: {} }
  }
  set(data: { items: PageMapItem[]; fileMap: Record<string, any> }) {
    this.cache!.items = data.items
    this.cache!.fileMap = data.fileMap
  }
  clear() {
    this.cache = null
  }
  get() {
    return this.cache
  }
}

export const pageMapCache = new PageMapCache()

class HoneyPlugin {
  config: any
  constructor(honeyConfig: any) {
    this.config = honeyConfig
  }
  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tapAsync(
      'HoneyPlugin',
      async (_, callback) => {
        if (this.config && this.config.unstable_flexsearch) {
          // Restore the search data from the cache.
          restoreCache()
        }

        const result = collectFiles(
          path.join(process.cwd(), findPagesDir()),
          '/'
        )

        pageMapCache.set(result)
        callback()
      }
    )
  }
}

export { HoneyPlugin }
