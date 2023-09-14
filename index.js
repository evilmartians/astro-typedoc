import { writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  Application,
  Converter,
  PageEvent,
  ReflectionKind,
  TSConfigReader
} from 'typedoc'

const __dirname = dirname(fileURLToPath(import.meta.url))
const objectToFrontmatter = (object = {}) =>
  Object.entries(object)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

const onRendererPageEnd =
  (frontmatterObject = {}) =>
  event => {
    if (!event.contents) {
      return
    } else if (/README\.md$/.test(event.url)) {
      event.preventDefault()
      return
    }

    if (!frontmatterObject?.layout) {
      frontmatterObject.layout = resolve(
        __dirname,
        './ui/components/Layout.astro'
      )
    }

    let prependix = `---
title: '${event.model.name}'
${objectToFrontmatter(frontmatterObject)}
---

`

    event.contents = prependix + event.contents
  }

const buildNavigationFromProjectReflection = (baseUrl = '', project) => {
  let baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/gm, '')
  let result = { type: 'flat' }

  let isGroupOfModules = group => group.title === 'Modules'
  let reflectionToNavItem = reflection => {
    return {
      title: reflection.name,
      url: `${baseUrlWithoutTrailingSlash}/${reflection.url}`.replace(
        /\.md$/,
        ''
      )
    }
  }
  let modulesGroupToNavigationGroup = module => ({
    items: module.groups.flatMap(group =>
      group.children.map(reflectionToNavItem)
    ),
    name: module.name
  })

  let navFromReflectionGroups = (groups, nav = {}) => {
    groups.forEach(group => {
      if (isGroupOfModules(group)) {
        nav.type = 'modular'
        nav.modules = group.children.map(modulesGroupToNavigationGroup)
      } else {
        nav.items = nav?.items?.length ? nav.items : []
        nav.items = nav.items.concat(
          group.children.flatMap(reflectionToNavItem)
        )
      }
    })

    return nav
  }

  return navFromReflectionGroups(project.groups, result)
}

const onDeclaration =
  (entryPoints = []) =>
  (context, reflection) => {
    if (reflection.kind === ReflectionKind.Module) {
      let matchingEntryPoint = entryPoints.find(
        entryPoint => entryPoint.path === reflection.sources[0].fullFileName
      )

      reflection.name = matchingEntryPoint?.name ?? reflection.name
    }
  }

const typedocConfig = {
  excludeExternals: true,
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

export const initAstroTypedoc = async ({ baseUrl = '/docs/', entryPoints }) => {
  // Hack to make sure entrypoints will be loaded
  await writeFile(
    resolve(__dirname, './tsconfig.generic.json'),
    JSON.stringify({
      compilerOptions: {
        baseUrl: '.',
        paths: entryPoints.reduce((paths, { name, path }) => {
          if (name) {
            paths[name] = [path]
          }

          return paths
        }, {})
      },
      include: entryPoints.map(e => e.path)
    })
  )
  let app = await Application.bootstrapWithPlugins({
    ...typedocConfig,
    ...markdownPluginConfig,
    basePath: baseUrl,
    entryPoints: entryPoints.map(e => e.path),
    plugin: ['typedoc-plugin-markdown', resolve(__dirname, './theme.js')],
    readme: 'none',
    theme: 'custom-markdown-theme',
    tsconfig: resolve(__dirname, './tsconfig.generic.json')
  })

  app.options.addReader(new TSConfigReader())
  app.converter.on(
    Converter.EVENT_CREATE_DECLARATION,
    onDeclaration(entryPoints)
  )

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
    let navigation = buildNavigationFromProjectReflection(baseUrl, project)

    await writeFile(
      `${removeTrailingSlash(outputFolder)}/nav.json`,
      JSON.stringify(navigation)
    )
    // Place nav file dupe to the defaul theme
    await writeFile(
      `${resolve(__dirname, './ui/')}/nav.json`,
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
