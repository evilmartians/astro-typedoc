import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'path'
import { Application, PageEvent, TSConfigReader } from 'typedoc'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function onRendererPageEnd(event) {
  if (!event.contents) {
    return
  } else if (/README\.md$/.test(event.url)) {
    event.preventDefault()
    return
  }

  let frontmatter = `---
title: '${event.model.name}'
layout: '../../../layouts/DocLayout.astro'
---

`

  event.contents = frontmatter + event.contents
}

function getNavigationFromProject(baseUrl = '', project) {
  let baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/gm, '')

  let nav = project.groups
    .map(group => {
      return group.children.map(groupChild => {
        return {
          title: groupChild.name,
          url: `${baseUrlWithoutTrailingSlash}/${groupChild.url}`.replace(
            /\.md$/,
            ''
          )
        }
      })
    })
    .flat()

  return nav
}

export async function generateApiDocs({
  baseUrl = '/docs/',
  entryPoints,
  pagesDirectory = 'src/pages/docs',
  tsconfig
}) {
  let app = await Application.bootstrapWithPlugins({
    basePath: baseUrl,
    entryPoints,
    excludeInternal: true,
    excludePrivate: true,
    excludeProtected: true,
    githubPages: false,
    hideBreadcrumbs: true,
    hideInPageTOC: true,
    // hideKindPrefix: true,
    hidePageHeader: true,
    hidePageTitle: true,
    plugin: ['typedoc-plugin-markdown', resolve(__dirname, './theme.js')],
    readme: 'none',
    theme: 'custom-markdown-theme',
    tsconfig
  })

  app.options.addReader(new TSConfigReader())
  app.renderer.on(PageEvent.END, event => onRendererPageEnd(event))

  let project = await app.convert()

  await app.generateDocs(project, pagesDirectory)

  let navigation = getNavigationFromProject(baseUrl, project)

  await writeFile('src/nav.json', JSON.stringify(navigation))
}
