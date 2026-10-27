# docs/scripts

Node scripts the documentation site's npm scripts run around `docusaurus build` (see the `scripts`
block of `../package.json` for when each one runs). They are CommonJS with no dependencies beyond
Node, they are linted by the repository root's ESLint configuration, and they carry no comments:
what a comment would have said is here.

## build-id.js

Writes `static/build-id.json`, the identity of the site build: it is shown in the footer and served
at `/build-id.json`, so one deployment can be told apart from the previous one.

```
{ "buildId": "<short commit>.<yyyymmdd>", "version": "<package.json version>" }
```

`BUILD_ID` in the environment wins, so a deploy pipeline can hand the same identity to every artifact
of one run; otherwise it is derived from this repository's `HEAD`, and it is `dev` where git is not
available. There is no dirty marker: the build regenerates tracked API pages before this runs, so the
tree is never clean here.

## generate-llms.js

Writes `static/llms.txt` from `static/llms.template.txt`, replacing every `{{VERSION}}` with the
version in `../package.json`. It runs on every `start` and `build`. Edit the template, never the
output.

## inject-openapi-static.js

The OpenAPI docs plugin renders the parameter, request-body and response panes client-side, so every
endpoint page ships a few dozen words of server-rendered text and a row of empty skeletons. A crawler
that does not run JavaScript sees none of the reference.

This script appends a plain-markdown mirror of the same data to each generated `.api.mdx` under
`api/openapi-docs/`, built from `static/openapi.json`: the parameters, the request body's fields
(nested objects and arrays flattened to three levels), the responses and an example request. It runs
after `generate-api-docs` and before the build. The section opens with the marker line
`{/* static-reference:generated */}`, and a page that already carries it is skipped, so the script is
safe to re-run. The committed `api/openapi-docs/` is the pre-injection output; do not commit the
injected form.

## check-descriptions.js

Fails the build when a page ships a meta description that Docusaurus derived from the source instead
of the front matter. Docusaurus falls back to the first line of the MDX body when `description:` is
missing, which has produced live descriptions reading `return (`, `<img` and `Learn`.

It runs against `build/` after `docusaurus build`. Every indexable page (not `noindex`, not the 404
page) must carry a description that does not start like code and is at least 50 characters long;
each page that fails is listed with the reason.

## topics.js

Every page under `learn/` carries two front-matter keys besides its title and description:

- `topic`, the page's stable id, `<product>.<area>[.<sub>].<name>` in lowercase with dots and dashes
  (`composer.gui.controls`, `runners.engines.threejs.full`). An id is never reused for another page
  and never changes when the page moves, so a link built on it survives a reorganisation.
- `type`, what kind of page it is: `landing`, `tutorial`, `how-to`, `reference` or `explanation`.

A section whose index page Docusaurus generates from its `_category_.json` can carry a topic too, as
`customProps.topic`, when its link has an absolute `slug`. An optional `verified` key is the date of
the last full check of the page against the product, written `yyyy-mm-dd`; the doc footer shows it.

`npm run topics` writes what the ids give the site, both committed:

- `src/data/topics.json`: every topic's id, title, type, address, source file and `verified` date.
  The address is derived the way the docs plugin routes a page (an absolute `slug`, a relative one,
  an index page, an `id`), so it is the page's live URL.
- the two blocks at the end of `static/_redirects`, each between its marker lines, below every
  hand-written rule:
  - **moved pages**: a 301 from every address a page has left to where it is now. The script reads
    the committed `topics.json` before it rewrites it, so a topic whose address changed adds its old
    address here; an earlier entry for the same page is pointed at the new address too, so no redirect
    ever leads to another. An address a page lives at again, or a hand-written rule already takes,
    drops out. Nobody writes a redirect for a moved page by hand.
  - **`/help/<topic>`**: a 302 per topic to its page. `learn.bitbybit.dev/help/<topic>` is the address
    an app or another site links to; the page behind it can move, and a `#anchor` on the link survives
    the redirect. It is a 302 because browsers keep a 301 indefinitely: after a move, a reader who had
    followed the link before would be sent to the old address.

A topic that disappears (its page deleted, or its id renamed, which the rules forbid for a published
page) needs a decision the script cannot make: `npm run topics` refuses to run until the hand-written
part of `static/_redirects` takes `/help/<topic>` (a 302) and the page's last address (a 301), each
pointing at the page that replaces it. Moved-page entries that pointed at it then follow that rule.

`npm run check-topics` (`topics.js --check`, the first step of `npm run build`) reads only the
sources, so it needs no build: it lists every page without a valid topic or type, every id or address
taken twice, and fails when either generated file differs from what `npm run topics` would write. Both
commands also read every rule of `static/_redirects`, because Cloudflare applies the first rule that
matches and a rule wins over a page at the same address. They fail on a rule that sends a live page or
section away, one a rule above it already takes, a redirect to an address another rule redirects (a
chain), a target under `/learn` that is no page or section, and a `/help/` rule that is not a 302.
`topics.test.mjs` holds those rules; the repository's `npm run test:scripts` runs it.

## The search index (`index-search`) and check-search-index.js

The site's search needs no service: `npm run index-search` runs Pagefind over `build/` after
`docusaurus build`, and writes the index into `build/pagefind/`, which deploys with the pages. The
search dialog in the navbar (`src/theme/SearchBar`, `src/components/Search`) loads
`/pagefind/pagefind.js` on first use and fetches only the parts of the index a query needs. `../pagefind.yml` configures the
run and lists what is left out of the index inside a page: the editor tabs' labels, which would read
"Rete. Blockly. TypeScript." in every excerpt, the heading anchors, and the embedded editors' start
button and caption (the script previews beside them stay searchable).

`npm start` builds no index: `keep-search-index.js`, the last part of `index-search`, copies the index
into the gitignored `.search-index/pagefind`, which a local start serves (`docusaurus.config.ts`), so
search on `npm start` reads the last build's index and a new build shows without a restart. Before any
build the dialog says to run one.

Pagefind indexes only what sits inside an element marked `data-pagefind-body`: each docs page's content
(`src/theme/DocItem/Content`, which the learn pages and the CAD Cloud API pages share) and each blog post
on its own page (`src/theme/BlogPostItem`), never the sidebars, the table of contents, the related links
or the blog's list pages. The same element names the page's section (`data-pagefind-filter`), from its
route through `src/components/Search/sections.ts`, and the dialog narrows a search by it.

`check-search-index.js` fails the build when a page with docs or blog content is not marked, when a
marked page has no section, or when the index holds a different number of pages than are marked.
