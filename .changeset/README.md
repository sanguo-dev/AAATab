# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

- `bun run changeset` records a new version bump for the next release.
- `bun run version-packages` applies pending changesets, updates
  `package.json`/`CHANGELOG.md`, and therefore the extension version WXT reads
  from `package.json`.

This package is private, so `privatePackages.version` is enabled in
`config.json`; publishing to npm is not part of the workflow.
