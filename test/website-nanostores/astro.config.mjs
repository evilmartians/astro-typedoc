import { defineConfig } from 'astro/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'url'

import initAstroTypedoc from '../../index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const astroTypedoc = await initAstroTypedoc({
  baseUrl: '/docs/',
  entryPoints: [resolve(__dirname, '../../../nanostores/index.d.ts')],
  pagesDirectory: 'src/pages/docs',
  tsconfig: resolve(__dirname, '../../../nanostores/tsconfig.json')
})

const reflections = await astroTypedoc.getReflections()

await astroTypedoc.generateDocs(reflections)
await astroTypedoc.generateNavigationJSON(
  reflections,
  resolve(__dirname, './src/')
)

// https://astro.build/config
export default defineConfig({})
