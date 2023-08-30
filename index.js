import { writeFile } from 'node:fs/promises'
import { Application } from 'typedoc'

const page = ({ title }) => `
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

export async function generateApiDocs({ entryPoints, tsconfig }) {
  let types = await getTypes({ entryPoints, tsconfig })

  for (let type of types) {
    await writeFile(
      `src/pages/docs/${type.name}.astro`,
      page({ title: type.name })
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
