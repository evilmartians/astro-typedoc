# astro-typedoc

Utility for generating Astro pages from `TypeDoc`.

## Usage

### Basic example

Minimal config:

```js
// astro.config.mjs

import { defineConfig } from 'astro/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import initAstroTypedoc from 'astro-typedoc'

const __dirname = dirname(fileURLToPath(import.meta.url))

const astroTypedoc = await initAstroTypedoc({
  baseUrl: '/docs/',
  entryPoints: [resolve(__dirname, 'path/to/entry/point.ts')],
  tsconfig: resolve(__dirname, 'path/to/tsconfig.json')
})

const typedocProject = await astroTypedoc.getReflections()

await astroTypedoc.generateDocs(typedocProject, 'src/pages/docs')
await astroTypedoc.generateNavigationJSON(
  reflections,
  resolve(__dirname, './src/')
)

// https://astro.build/config
export default defineConfig({})
```

## API

### `initAstroTypedoc({ baseUrl, entryPoints, tsconfig })`

Creates `astroTypedoc` instance. Accepts config object as a parameter.

#### `baseUrl`

Defines the root path for generated documentation.
`/docs/` means that documentation root is accessible on
`example.com/docs/`

#### `entryPoints`

An array of paths to entry points of the project.

#### `tsconfig`

Path to `tsconfig.json` of the project, which code will be documented.

### `astroTypedoc.getReflections`

Returns [TypeDoc project reflection](https://typedoc.org/api/classes/Models.ProjectReflection.html)

Project reflection contains information about types and serves as the basis for creating documentation.

### `astroTypedoc.generateDocs(typedocProject, outputFolder)`

Generates documentation.

### `astroTypedoc.generateNavigationJSON(typedocProject, outputFolder)`

Generates JSON file which contains navigation tree for generated documentation.

Sample:

```json
[
  {
    "title": "Atom",
    "url": "/docs/interfaces/interface.Atom"
  }
]
```

## Testing

There are 3 subfolders in `test/` folder.

1. `types` - this is a stub TypeScript project, contains types, which are used for generating docs
2. `website-types` - a sample site which is generated from `types/` publicly exported types
3. `website-nanostores` - a sample site which is generated from `nanostores` package.
   [`nanostores`](https://github.com/nanostores/nanostores) repository needs to be cloned locally.

   [`@nanostores/router`](https://github.com/nanostores/router) respository needs to be cloned locally.

   Folder structure should look like this:

   ```
   .
   ├── astro-typedoc
   ├── router
   └── nanostores
   ```

### Building sites

`website-types` and `website-nanostores` are Astro sites with enabled integration.

`pnpm run build` to build projects, works for both of them.
`pnpm start` to start a development server for a website
