import { defineConfig } from 'astro/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'url'

import { generateApiDocs } from '../../index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

await generateApiDocs({
  baseUrl: '/docs/',
  entryPoints: [resolve(__dirname, '../../../nanostores/index.d.ts')],
  pagesDirectory: 'src/pages/docs',
  tsconfig: resolve(__dirname, '../../../nanostores/tsconfig.json')
})

// https://astro.build/config
export default defineConfig({})
