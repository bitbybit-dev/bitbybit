# CLAUDE.md - the Docusaurus site for learn.bitbybit.dev

`npm run build` is the gate: it regenerates the API pages from `static/openapi.json`, injects the
static reference sections, builds, then runs `scripts/check-descriptions.js`. `llms.txt` is
generated from `static/llms.template.txt` - edit the template, never the output.

`api/openapi-docs/` is generated **and tracked**, so a build leaves it modified: the committed copy
is the pre-injection output, and `inject-openapi-static.js` appends a reference section behind a
marker line (it skips a file that already carries the marker, so it is safe to re-run). Do not
commit the injected form.

## Routes are a contract

This site is live and linked from outside. `trailingSlash: false` and every category's explicit
`slug` are what hold URLs still - never change either to satisfy a build error. Prove a dependency
change kept them: build before, save `build/sitemap.xml`, build after, diff the two `<loc>` sets.
Anything removed is a broken inbound link. `onBrokenLinks: "throw"` already covers internal ones.

Two sidebar categories may not share a label within one sidebar - Docusaurus derives an i18n key
from the label and refuses the duplicate. The `npm-packages/*` and `runners/engines/*` trees both
have BabylonJS, PlayCanvas and ThreeJS categories, so the runners ones carry an explicit `key` in
`_category_.json`. `key` disambiguates the translation key without touching the label or the slug,
which is why it is used instead of renaming anything.

## The `overrides` block

Every entry is a security patch that nothing in the tree lifts on its own, and each one is pinned
to the major already installed. That scoping is not decoration:

- `js-yaml@4` is scoped **on purpose**. The tree holds both 4.x and 5.x, and only the 4.x copy is
  vulnerable; a blanket `js-yaml` override drags 5.x down a major and the build dies on
  `CORE_SCHEMA.withTags is not a function`.
- Two more cannot be overridden at all. `@faker-js/faker` reaches the tree only through
  `postman-collection`, which pins 5.5.3 and calls the 5.x API - forcing the patched 10.5.0 breaks
  the build on `faker.address` being undefined. `image-size` has no patched version published.
  Both are recorded in `scripts/advisories.allow.json` with the reasoning.

Never run `npm audit fix --force` here: npm reports the fix for the openapi plugin advisories as
`docusaurus-plugin-openapi-docs@2.1.3`, which is a three-year downgrade, not a fix. The Docusaurus
packages and the two openapi plugins move together - the plugins require `@docusaurus/* ^3.10.0`.
