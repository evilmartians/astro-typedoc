import { slug } from 'github-slugger'
import path from 'node:path'
import {
  MarkdownTheme,
  MarkdownThemeRenderContext
} from 'typedoc-plugin-markdown'

const externalLinkRegex = /^(http|ftp|mailto)s?:\/\//

export function load(app) {
  app.renderer.defineTheme('custom-markdown-theme', CustomMarkdownTheme)
}

export class CustomMarkdownTheme extends MarkdownTheme {
  getRenderContext(pageEvent) {
    return new CustomMarkdownThemeContext(pageEvent, this.application.options)
  }
}

class CustomMarkdownThemeContext extends MarkdownThemeRenderContext {
  relativeURL = url => {
    if (!url) {
      return null
    } else if (externalLinkRegex.test(url)) {
      return url
    }

    let basePath = this.options.getValue('basePath')
    let basePathParsed = path.parse(basePath)
    let baseUrl = basePath.replace(basePathParsed.root, '/')
    let filePathParsed = path.parse(url)
    let directory = filePathParsed.dir.split(path.sep).join('/')
    let [, anchor] = filePathParsed.base.split('#')

    let constructedUrl = typeof baseUrl === 'string' ? baseUrl : ''
    constructedUrl += '/'
    constructedUrl += directory.length > 0 ? `${directory}/` : ''
    constructedUrl += filePathParsed.name
    constructedUrl += anchor && anchor.length > 0 ? `#${slug(anchor)}` : ''

    return constructedUrl
  }
}
