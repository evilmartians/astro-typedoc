import { defineConfig } from 'astro/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'url'

import { generateApiDocs } from '../../index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

await generateApiDocs({
  entryPoints: [resolve(__dirname, '../types/index.ts')],
  tsconfig: resolve(__dirname, '../types/tsconfig.json')
})

// https://astro.build/config
export default defineConfig({})
