import { defineConfig } from 'astro/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import initAstroTypedoc from '../../index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const astroTypedoc = await initAstroTypedoc({
  baseUrl: '/docs/',
  entryPoints: [
    {
      name: 'nanostores',
      path: resolve(__dirname, '../../../nanostores/index.d.ts')
    },
    {
      name: '@nanostores/router',
      path: resolve(__dirname, '../../../router/index.d.ts')
    }
  ]
})

const project = await astroTypedoc.getReflections()

await astroTypedoc.generateDocs({
  frontmatter: {
    layout: resolve(__dirname, './src/layouts/DocLayout.astro')
  },
  outputFolder: 'src/pages/docs',
  project
})
await astroTypedoc.generateNavigationJSON(project, resolve(__dirname, './src/'))

// https://astro.build/config
export default defineConfig({})
