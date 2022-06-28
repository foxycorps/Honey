import { HoneyPlugin, pageMapCache } from './plugin'

const defaultExtensions = ['js', 'jsx', 'ts', 'tsx']
const markdownExtensions = ['md', 'mdx']
const markdownExtensionTest = /\.mdx?$/

module.exports =
  (...args) =>
    (nextConfig = {}) => {
      const honeyConfig =
        typeof args[0] === 'string'
          ? {
            theme: args[0],
            themeConfig: args[1]
          }
          : args[0]

      const locales = nextConfig.i18n?.locales || null
      const defaultLocale = nextConfig.i18n?.defaultLocale || null

      let pageExtensions = nextConfig.pageExtensions || [...defaultExtensions]
      pageExtensions = pageExtensions.concat(markdownExtensions)

      if (locales) {
        console.log(
          '[Honey] You have Next.js i18n enabled, read here (TODO: link) for the docs.'
        )
      }

      return Object.assign({}, nextConfig, {
        pageExtensions,
        webpack(config, options) {
          const honey = new HoneyPlugin(honeyConfig)
          if (!config.plugins) {
            config.plugins = [honey]
          } else {
            config.plugins.push(honey)
          }

          config.module.rules.push({
            test: markdownExtensionTest,
            use: [
              options.defaultLoaders.babel,
              {
                loader: '@honeydocs/honey/loader',
                options: { ...honeyConfig, locales, defaultLocale, pageMapCache }
              }
            ]
          })

          if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options)
          }

          return config
        }
      })
    }
