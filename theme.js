import { slug } from 'github-slugger'
import path from 'node:path'
import {
  MarkdownTheme,
  MarkdownThemeRenderContext
} from 'typedoc-plugin-markdown'

const externalLinkRegex = /^(http|ftp)s?:\/\//

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

    let filePath = path.parse(url)
    let [, anchor] = filePath.base.split('#')
    let basePath = this.options.getValue('basePath')

    let constructedUrl = typeof basePath === 'string' ? basePath : ''
    constructedUrl += '/'
    constructedUrl += filePath.dir.length > 0 ? `${filePath.dir}/` : ''
    constructedUrl += filePath.name
    constructedUrl += anchor && anchor.length > 0 ? `#${slug(anchor)}` : ''

    return constructedUrl
  }
}
