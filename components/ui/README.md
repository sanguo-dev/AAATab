# Vendored solid-ui-next components

These files are copied from [solid-ui-next](https://github.com/stefan-karger/solid-ui-next),
the Solid 2 port of Solid UI, at commit
`f2470e12c40886a4d9ae4973d32050d9455b1e8f` (2026-11-25). They are not an npm
dependency: the registry is copy-and-own, so this directory is the local copy.

## Runtime dependencies

- `@ui-sdk/solid` + `@ui-sdk/core` `0.1.0-beta.10` (behavior, top-layer popups)
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `tw-animate-css` (used by the theme's enter/exit animations)

The UI SDK version is deliberately pinned: the registry was validated against
`0.1.0-beta.10`, and `@ui-sdk/solid`'s peer range (`^0.1.0-beta.10`) would
otherwise float to a newer beta.

## Local edits

Only import paths and user-facing text differ from upstream:

- `~/lib/utils` → `@/lib/utils` (shadcn's conventional location)
- `~/registry/ui/button` → `./button`
- the dialog close button's label is `关闭` instead of `Close`

Everything else, including the Lucide SVG paths in `dialog.tsx` and
`select.tsx`, is unchanged.

## Styles

- `styles/solid-ui.css` — upstream `registry/lib/style-utilities.css`: state
  variants, accordion keyframes, scroll fades, shimmer.
- `styles/theme.css` — upstream `registry/styles/style-nova.css`, the Nova
  style. It is imported with `layer(base)` and scoped by the `.style-nova`
  class that `entrypoints/*/index.html` puts on `<html>`.

The theme expects the shadcn semantic tokens (`--background`, `--card`,
`--primary`, `--sidebar*`, …). They are defined in `assets/app.css`; it also
provides the `no-scrollbar` utility that upstream ships only in its docs app.

## Updating

1. Pick a new upstream commit and re-copy the needed files.
2. Re-apply the three local edits above.
3. Keep `@ui-sdk/solid` and `@ui-sdk/core` on the version the registry pins.
4. Run `bun run compile` and `bun run build`, then check the dialog and select
   interactions in a real browser.

## License

MIT, with portions adapted from shadcn/ui and Lucide icons under ISC. See
`LICENSE` in this directory.
