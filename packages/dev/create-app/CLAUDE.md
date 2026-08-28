# CLAUDE.md - `@bitbybit-dev/create-app`

The scaffolder behind `npx @bitbybit-dev/create-app my-project`. **It is a CLI, not a library**, and
so departs from `packages/dev/CLAUDE.md` in several ways:

- it exposes `bin` entries (`create-bitbybit-app` and `@bitbybit-dev/create-app`)
- it has **no test script**
- it depends on none of the other `@bitbybit-dev` packages - it writes templates that reference them
- its dependencies are CLI ergonomics: `commander`, `inquirer`, `chalk`, `ora`, `gradient-string`,
  `fs-extra`

`npm run dev` runs it locally; `prepublishOnly` builds before publish.

Because it scaffolds projects that then install the published packages, its templates pin versions
that must exist on npm. Bumping the packages without updating the templates produces a scaffold that
fails on first install, and nothing in this repository's test suites would catch that.
