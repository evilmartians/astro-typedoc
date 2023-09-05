import { writeFile } from 'node:fs/promises'
import { Application, PageEvent, TSConfigReader } from 'typedoc'

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
  let baseUrlWithoutTrailingSlash = baseUrl.replace('/$', '')

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
  baseUrl = '/docs',
  entryPoints,
  pagesDirectory = 'src/pages/docs',
  tsconfig
}) {
  let app = new Application()

  app.options.addReader(new TSConfigReader())
  app.renderer.on(PageEvent.END, event => onRendererPageEnd(event))

  await app.bootstrapWithPlugins({
    entryPoints,
    excludeInternal: true,
    excludePrivate: true,
    excludeProtected: true,
    githubPages: false,
    hideBreadcrumbs: true,
    hideInPageTOC: true,
    hideKindPrefix: true,
    hidePageHeader: true,
    hidePageTitle: true,
    plugin: ['typedoc-plugin-markdown'],
    readme: 'none',
    tsconfig
  })

  let project = await app.convert()

  await app.generateDocs(project, pagesDirectory)

  let navigation = getNavigationFromProject(baseUrl, project)

  await writeFile('src/nav.json', JSON.stringify(navigation))
}
