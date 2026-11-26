# solid-ui components (copy-and-own)

These files come from [Solid UI v2](https://github.com/stefan-karger/solid-ui) through
`solidui-cli`, which installs the registry source into this project instead of adding an
npm dependency. Upstream `main` at the time of the last update was
`07c22335db3be124caf16f5c152fa9818a871281` (2026-11-26); the published registry at
https://www.solid-ui.com/r/styles/nova is what actually got installed.

## Do not reintroduce `cn-*` classes

The registry serves each component with its semantic classes already resolved: upstream
writes `cn-button-variant-default` and the registry export replaces that token with the
literal Tailwind utilities taken from `style-nova.css`. The files in this directory are that
exported form, which is why this project does not need — and no longer contains — a copy of
the `.style-nova` theme stylesheet.

Consequences:

- Editing a component here is fine, but keep writing plain Tailwind utilities.
- Don't copy raw files from `apps/docs/src/registry/ui` in the upstream repo: those still
  contain `cn-*` tokens and render unstyled without `style-nova.css`.
- `.style-nova` is no longer put on `<html>`; only `.dark` is, and it drives the dark tokens
  that `assets/solid-ui.css` ships.

## Runtime dependencies

- `@ui-sdk/solid` + `@ui-sdk/core` `0.1.0-beta.17` — behavior, top-layer popups. Both stay
  on one exact build: betas are not interchangeable, and the components are written against
  this one.
- `class-variance-authority`, `clsx`, `tailwind-merge` (via `@/lib/utils`).
- `tw-animate-css` and `@fontsource-variable/geist`, imported by `assets/solid-ui.css`.
- Solid 2: `solid-js`, `@solidjs/web` (`^2.0.3` here, upstream pins `2.0.1`).

## Styles

- `assets/solid-ui.css` — owned by the CLI. It is generated from preset `b2fA` (style
  `nova`) and holds the shared state variants, accordion keyframes, scroll-fade and shimmer
  utilities, the preset's light/dark tokens, and the Tailwind `--color-*` mapping. Never edit
  it by hand: `npx solidui-cli init --force` rewrites it.
- `assets/app.css` — the project stylesheet. It keeps `@layer ui-sdk;` first and imports
  `./solid-ui.css` right after Tailwind, then overrides the tokens with AAATab's
  blue-on-near-black dark palette and adds project-only pieces (`no-scrollbar`,
  `.tab-surface`, base resets).

## Local edits

Only user-facing text differs from the registry source:

- the dialog close button's label is `关闭` instead of `Close`.

Import paths need no edit: `components.json` declares the `@/` aliases, so the CLI rewrites
`~/lib/utils` → `@/lib/utils` and `~/registry/ui/button` → `@/components/ui/button` on
install.

## Updating

```bash
npx solidui-cli@latest add --overwrite button card input label switch alert context-menu drawer dialog select textarea
```

1. Re-apply the `关闭` label in `components/ui/dialog.tsx`.
2. Run `bun run compile` and `bun run build`.
3. Check the dialog, drawer, context menu and switch in a real browser.

After a UI SDK beta bump, change `@ui-sdk/core` and `@ui-sdk/solid` together to the exact
build listed in `apps/docs/src/registry/ui/_registry.ts` dependencies upstream.

## License

MIT, with portions adapted from shadcn/ui and Lucide icons under ISC. See `LICENSE` in this
directory.
