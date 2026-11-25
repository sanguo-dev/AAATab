# AAATab

A browser new tab page built with [WXT](https://wxt.dev/) and
[Solid 2](https://docs.solidjs.com/) (`solid-js` + `@solidjs/web`).

- Styling: [Tailwind CSS 4](https://tailwindcss.com/) + [solid-ui-next](https://github.com/stefan-karger/solid-ui-next) components (Solid 2 + UI SDK)
- Icons: [`@lucide/solid`](https://lucide.dev/guide/solid/getting-started), the Lucide package for Solid 2
- Routing: `@solidjs/router` 2 with `hashHistory()` on the options page only; the new tab pager is plain state, no URL changes
- Page transitions: [anime.js](https://animejs.com/) 4
- Versioning: [Changesets](https://github.com/changesets/changesets)

Installing the extension overrides the browser's new tab page with AAATab.
Settings live on the extension's options page: set your name and choose
whether to show the greeting, clock, and date. The gear on the new tab page
opens that page directly.

