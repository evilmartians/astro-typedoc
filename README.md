# astro-typedoc

Utility for generating Astro pages from `TypeDoc`.

## Testing

There are 3 subfolders is `test/` folder.

1. `types` - this is a stub TypeScript project, contains types, which are used for generating docs
2. `website-types` - a sample site which is generated from `types/` publicly exported types
3. `website-nanostores` - a sample site which is generated from `nanostores` package

### Building sites

`website-types` and `website-nanostores` are Astro sites with enabled integration.

`pnpm run build` to build projects, works for both of them.
`pnpm start` to start a development server for a website
