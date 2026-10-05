# examples/scripts

The tooling behind the two lanes over the examples. `../README.md` lists the commands a person runs;
this file explains how the scripts behind them work. They are plain Node scripts with no dependencies
of their own, run from `examples/` (or through the `examples:*` scripts at the repository root), and
they carry no comments: what a comment would have said is here.

## discover.mjs

Finds the examples and says what each one is. Both lanes read it - `examples.mjs`, which installs
every example from the registry the way a user does, and `local.mjs`, which points them at the
packages in this repository instead - so the two can never disagree about what an example is.

- An example is any directory under `examples/` with a `package.json`. Generated output,
  `node_modules`, the lanes' own log directories and this directory are not descended into
  (`SKIP_DIRS`).
- `verify.config.json` names the examples to skip, each with a reason, and the frameworks whose
  builds are too heavy to run every time.
- `selected(args)` is the command-line shape both lanes share: `--only <part>` keeps the examples
  whose path contains that text, so `--only vite/threejs` is a directory and `--only cup` is every
  example named one.

## examples.mjs

Runs every example the way a consumer would - install from the registry, build, audit - and reports
each one on its own, so one broken example names itself instead of hiding the rest.

```
node scripts/examples.mjs list                     every example found, and why any is skipped
node scripts/examples.mjs install [--only <part>]  npm ci in each (npm install where no lockfile)
node scripts/examples.mjs build   [--only <part>]  npm run build in each that has a build script
node scripts/examples.mjs verify  [--only <part>]  install, then build
node scripts/examples.mjs audit   [--only <part>]  npm audit at the moderate level, lockfile only
node scripts/examples.mjs refresh [--only <part>]  move each lockfile to the newest versions its
                                                   manifest allows, then apply audit fixes
```

The frameworks `verify.config.json` marks as heavy install on every run and build only with
`--heavy`. A run exits non-zero when any example failed. Each step's full output goes to
`.verify-logs/`, and the last lines of a failing step are printed; when `GITHUB_STEP_SUMMARY` is set,
the results table is appended to the file it names. In `refresh`, the audit fix after the lockfile
update is information rather than a gate: advisories it cannot fix are reported as a note.

`audit` is npm's view and is not the whole picture. npm resolves advisories from its own feed, which
has diverged from the advisory database the repository's dependency alerts read - `multer@1.4.5-lts.2`
reported "found 0 vulnerabilities" here while fifteen advisories were held against it.
`../../scripts/check-advisories.mjs` covers that gap and runs beside this one; neither replaces the
other.

## local.mjs

Runs the examples against the packages in this repository instead of the ones on the registry, so an
idea can be tried in a real application before it is published. The verification lane deliberately
installs from the registry; this one deliberately does not.

```
node scripts/local.mjs status  [--only <part>]  what each example is pointed at right now
node scripts/local.mjs link    [--only <part>]  point them at this repository
node scripts/local.mjs unlink  [--only <part>]  put the installed copies back
node scripts/local.mjs dev     [--only <part>]  link, then start each on its own port
node scripts/local.mjs build   [--only <part>]  link, then build each
```

`--dist` forces dist mode for every example, and `--port <base>` moves the base port (5300).

### The two modes

How an example is linked is derived from the example rather than declared anywhere:

- **source** - the example's dev script is Vite. `node_modules/@bitbybit-dev/*` become symlinks to
  the package directories, and a generated Vite config asks for the `@bitbybit-dev/source` export
  condition, so Vite serves the TypeScript in `packages/dev/*/lib` itself and an edit there reaches
  the browser with no build step.
- **dist** - anything else. The packages have to be built first, and what npm would publish is
  copied into the example. Most packages publish `dist/` as the package root, so a built one has a
  manifest in there; the ones that publish from their own root with a `files` list have none, and
  what npm would send is those entries beside the manifest.

Three details decide the shape of this, and each was measured rather than assumed:

- A package cannot be reached through a symlink unless whatever resolves it is told to look through
  the link. Resolution follows a symlink to its real path, so `three` inside a linked
  `@bitbybit-dev/threejs` resolves to this repository's copy while the example's own
  `import ... from "three"` resolves to the example's - two copies of the engine in one page, which
  breaks as soon as anything is compared by identity. Worse for a typechecking bundler: the real path
  is a package directory holding both `lib/*.ts` and `dist/*.d.ts`, and ts-loader reaches the same
  class twice and reduces it to `never`. So dist mode copies, so that nothing resolves past the
  example. In source mode the sources are the point, and Vite's `resolve.dedupe` keeps one engine
  instead.
- Copying is nearly free where the filesystem can clone (APFS does, through `cp -Rc`), which is what
  makes it affordable to put the 100MB of compiled kernel into each example. Elsewhere it is an
  ordinary copy.
- The published packages carry no `exports` map (`scripts/dist-manifest.mjs` at the repository root
  drops it), so the `@bitbybit-dev/source` condition exists only on the package directories in this
  repository. That is why source mode links the package root.

### State on disk

Whatever an example had before `link` is moved to `node_modules/.bitbybit-installed` and put back by
`unlink`. A copied package carries a `.bitbybit-local.json` marker, so `status` reads the truth from
disk - a symlink says where it points, a marker says it was copied - rather than from a record the
script keeps. Nothing tracked by git is written: the generated Vite config and the `.local`
directory (build logs and the index page) are both ignored. `link` and `unlink` both delete
`node_modules/.vite`: Vite pre-bundles what it finds in `node_modules` and caches it against the
lockfile, which this lane changes underneath it, so dropping the cache is what stops a stale copy
being served.

### The generated Vite config

Source mode writes `vite.config.bitbybit-local.mts` beside the example. It loads the example's own
Vite configuration and merges into it rather than replacing it, so a plugin an example needs - React,
or the headers the multithreaded kernel wants - still applies. It adds:

- `resolve.conditions` with `@bitbybit-dev/source` first. The default conditions are spelled out
  after it because naming any replaces them.
- `resolve.dedupe` over `ENGINE_LIBS`, the libraries an example and a package can both depend on,
  where a second copy is a bug rather than a duplicate. Dist mode has no need of the list, because a
  copied package finds them under the example's own `node_modules`.
- `optimizeDeps.exclude` over the linked packages: they are sources, not a dependency to pre-bundle.
- `server.port` with `strictPort`, and `server.fs.allow` on the repository root, because the sources
  are outside the example and the dev server has to be allowed to read them.

### Ports and builds

Ports are handed out over every linkable example with a dev server, not over the selection, so
`--only` does not move them; `dev` serves an index page listing every started example on the base
port. `PORT_FLAG` says how each dev server is given its port; a tool not in it cannot be started by
this lane. Source mode writes the port into the generated config instead.

In source mode `build` runs `vite build` directly with the generated config. An example whose own
build script also runs `tsc` keeps that step out of this lane: `tsc` resolves the packages through
their published typings, which is the registry lane's question.
