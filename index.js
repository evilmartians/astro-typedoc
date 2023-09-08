import { writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Application, PageEvent, TSConfigReader } from 'typedoc'

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

  let nav = project?.groups
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

  return nav ?? []
}

const typedocConfig = {
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  githubPages: false
}

const markdownPluginConfig = {
  hideBreadcrumbs: true,
  hideInPageTOC: true,
  hidePageHeader: true,
  hidePageTitle: true
}

const removeTrailingSlash = (pathString = '') =>
  pathString.endsWith(sep)
    ? pathString.slice(0, pathString.length - 1)
    : pathString

export default async function initAstroTypedoc({
  baseUrl = '/docs/',
  entryPoints,
  tsconfig
}) {
  let app = await Application.bootstrapWithPlugins({
    ...typedocConfig,
    ...markdownPluginConfig,
    basePath: baseUrl,
    entryPoints,
    plugin: ['typedoc-plugin-markdown', resolve(__dirname, './theme.js')],
    readme: 'none',
    theme: 'custom-markdown-theme',
    tsconfig
  })

  app.options.addReader(new TSConfigReader())
  app.renderer.on(PageEvent.END, event => onRendererPageEnd(event))

  let getReflections = async () => await app.convert()
  let generateDocs = async (project, pagesDirectory = 'src/pages/docs') =>
    await app.generateDocs(project, pagesDirectory)
  let generateNavigationJSON = async (project, outputFolder) => {
    let navigation = getNavigationFromProject(baseUrl, project)

    await writeFile(
      `${removeTrailingSlash(outputFolder)}/nav.json`,
      JSON.stringify(navigation)
    )
  }

  return {
    generateDocs,
    generateNavigationJSON,
    getReflections
  }
}
