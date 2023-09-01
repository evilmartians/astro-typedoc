import { Application, TSConfigReader } from 'typedoc'

export async function generateApiDocs({
  entryPoints,
  pagesDirectory = 'src/pages/docs',
  tsconfig
}) {
  let app = new Application()

  app.options.addReader(new TSConfigReader())

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
}
