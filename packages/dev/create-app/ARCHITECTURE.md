# Architecture - `@bitbybit-dev/create-app`

What the scripts and the test setup of this package do beyond what `CLAUDE.md` beside this file
says.

## The smoke lanes

```bash
npm run build && node scripts/smoke.mjs [--keep] [--dir <path>] [--only <case-name-substring>]
npm run build && node scripts/smoke-local.mjs [--keep] [--dir <path>] [--only <case-name-substring>]
```

- Without `--keep` the scaffolds go to a temporary directory and are deleted at the end; with it they
  land in `.local/smoke/` or `.local/smoke-local/` and stay, so each can be started with its own dev
  command. `--dir` implies `--keep`.
- The .NET backend case is built only where `dotnet` is on the path.
- `smoke-local.mjs` needs the workspace packages built first (`npm run build-packages` at the
  repository root). It installs each project from the registry as a user would, which fetches every
  third-party dependency, and then replaces each installed `@bitbybit-dev` package with a copy of its
  publishable tree: `dist/` for the CAD packages, the package directory itself (without
  `node_modules`) for the ones published from their own root through a `files` allowlist
  (`cad-cloud-sdk`, `mcp`, `create-app`).

## Tests

The suite measures no coverage on purpose. Its cases run the built CLI as a child process, which V8
coverage in the test process cannot observe, so any figure would report 0% of code the suite
exercises end to end. What it asserts is the tree the CLI writes.
