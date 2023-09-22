# astro-typedoc

Utility for generating Astro pages from `TypeDoc`.

## How it works

This library works as a bridge between Astro and `typedoc`, `typedoc-plugin-markdown`.

The idea is to create Markdown-based Astro pages from `typedoc` output. But still, it can work fine with `CollectionsAPI`, as the output files are Markdown with frontmatter.

## API

### `initAstroTypedoc({ baseUrl, entryPoints })`

Creates a builder of pages and side-menu for your TypeDoc.

`baseUrl`
Defines the root path for generated documentation. /docs/ means that documentation root is accessible on example.com/docs/

`entryPoints`
An array of paths to entry points of the project.

### `astroTypedoc.getReflections`

Returns TypeDoc project reflection

Project reflection contains information about types and serves as the basis for creating documentation.

### `astroTypedoc.generateDocs({ project, outputFolder, frontmatter })`

Generates Markdown pages and places them in specified folder.

### `astroTypedoc.generateNavigationJSON(typedocProject, outputFolder)`

Generates JSON file which contains navigation tree for generated documentation.

For single entry point projects:

```js
{
  type: 'flat',
  items: [
    {
      title: 'Atom',
      url: '/docs/interfaces/interface.Atom'
    }
  ]
}
```

For multiple entry point projects:

```js
{
  "type": "modular",
  "modules": [
    {
      "items": [
        {
          "title": "Router",
          "url": "/docs/nanostores_router/interfaces/interface.Router"
        },
        {
          "title": "RouterOptions",
          "url": "/docs/nanostores_router/interfaces/interface.RouterOptions"
        },
      ],
      "name": "@nanostores/router"
    },
    {
      "items": [
        {
          "title": "MapCreator",
          "url": "/docs/nanostores/interfaces/interface.MapCreator"
        },
      ],
      "name": "nanostores"
    }
  ]
}
```

## Usage

### Basic example

```js
// astro.config.mjs

import { defineConfig } from 'astro/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import initAstroTypedoc from 'astro-typedoc'

const __dirname = dirname(fileURLToPath(import.meta.url))

const astroTypedoc = await initAstroTypedoc({
  baseUrl: '/docs/',
  // Path to your library's entry file, relatively to
  // config file
  entryPoints: [resolve(__dirname, '../my-library/index.ts')]
})

const reflections = await astroTypedoc.getReflections()

await astroTypedoc.generateDocs(reflections, 'src/pages/docs')
await astroTypedoc.generateNavigationJSON(
  reflections,
  resolve(__dirname, './src/')
)

// https://astro.build/config
export default defineConfig({})
```

### Common cases

1. The site is dedicated to API documentation, with the default styling provided by `astro-typedoc`
   [Example 1](https://github.com/evilmartians/astro-typedoc/tree/main/test/website-nanostores)
   [Example 2 with multiple entry points](https://github.com/evilmartians/astro-typedoc/tree/main/test/website-nanostores-multiple-ep)
2. The API documentation is a section of the site, reuses default layout provided by `astro-typedoc`
   [Example](https://github.com/evilmartians/astro-typedoc/tree/main/test/website-semi-custom-layout)
3. The API documentation is a section of the site or the site itself, but uses custom styling/layout
   [Example](https://github.com/evilmartians/astro-typedoc/tree/main/test/website-custom-layout)

### Reusable components/styles

Library provides Astro components and some CSS files to simplify life even with custom layout.

#### Reusable components

Can be found at `astro-typedoc/ui/components/`

What's included:

- `Layout.astro` basic layout "sidebar + content"
- `Navigation.astro` sidebar navigation

#### Reusable styles

Currently there are few Markdown content styles.

Can be found at `astro-typedoc/ui/styles/md`

What's included:

- `reset.css` - defaults for Markdown content styles
- `code.css` - adds styling to a code block
- `table.css` - styling for parameter tables

Please, make sure that your Markdown content is wrapped by element with the `at-markdown` class name.

## Development

There are 6 subfolders is `test/` folder.

1. `types` - this is a stub TypeScript project, contains types, which are used for generating docs
2. `website-types` - a sample site which is generated from `types/` publicly exported types
3. `website-nanostores` - a sample site which is generated from `nanostores` package.
   [`nanostores`](https://github.com/nanostores/nanostores) repository needs to be cloned locally.

   Folder structure should look like this:

   ```
   .
   ├── astro-typedoc
   └── nanostores
   ```

4. `website-custom-layout` - contains usage example for custom layout sites
5. `website-semi-custom-layout` - shows an example of reusing some of default layout components
6. `website-nanostores-multiple-ep` - a sample site which is generated from two packages: `nanostores` and `@nanostores/router`

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

All folders in `test/` which has `website-` in the name are Astro sites.

`pnpm start` to start a development server for a website
`pnpm run build` to build project
