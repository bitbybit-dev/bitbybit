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
