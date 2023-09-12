# astro-typedoc

Utility for generating Astro pages from `TypeDoc`.

## Testing

There are 3 subfolders is `test/` folder.

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
