import { defineConfig } from 'astro/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import initAstroTypedoc from '../../index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const astroTypedoc = await initAstroTypedoc({
  baseUrl: '/docs/',
  entryPoints: [resolve(__dirname, '../types/index.ts')],
  tsconfig: resolve(__dirname, '../types/tsconfig.json')
})

const reflections = await astroTypedoc.getReflections()

await astroTypedoc.generateDocs(reflections, 'src/pages/docs')
await astroTypedoc.generateNavigationJSON(
  reflections,
  resolve(__dirname, './src/')
)

// https://astro.build/config
export default defineConfig({})
