import { writeFile } from 'node:fs/promises'
import { Application } from 'typedoc'

const pageTemplate = ({ title }) => `
---
---
<html lang="en">
  <head>
    <title>${title}</title>
  </head>
  <body>
    <h1>This page is about ${title}</h1>
  </body>
</html>
`

export async function generateApiDocs({
  entryPoints,
  pagesDirectory = 'src/pages/docs',
  tsconfig
}) {
  let types = await getTypes({ entryPoints, tsconfig })

  for (let type of types) {
    await writeFile(
      `${pagesDirectory}/${type.name}.astro`,
      pageTemplate({ title: type.name })
    )
  }
}

async function getTypes({ entryPoints = [], tsconfig }) {
  let app = await Application.bootstrap({
    entryPoints,
    tsconfig
  })

  let project = await app.convert()
  let types = project.children

  return types
}
