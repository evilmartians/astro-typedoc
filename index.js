import { writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Application, PageEvent, TSConfigReader } from 'typedoc'
import yaml from 'yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))

const onRendererPageEnd = frontmatter => event => {
  if (!event.contents) {
    return
  } else if (/README\.md$/.test(event.url)) {
    event.preventDefault()
    return
  }

  let prependix = `---
title: '${event.model.name}'
${yaml.stringify(frontmatter)}
---

`

  event.contents = prependix + event.contents
}

const getNavigationFromProject = (baseUrl = '', project) => {
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

export const initAstroTypedoc = async ({
  baseUrl = '/docs/',
  entryPoints,
  tsconfig
}) => {
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

  let getReflections = async () => await app.convert()
  let generateDocs = async ({
    frontmatter,
    outputFolder = 'src/pages/docs',
    project
  }) => {
    app.renderer.on(PageEvent.END, onRendererPageEnd(frontmatter))

    await app.generateDocs(project, outputFolder)
  }
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

export default initAstroTypedoc
