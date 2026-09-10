# Bit By Bit Developers App Examples

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

These app examples are meant to show how bitbybit npm packages can be used to create 3D models on the browser and on the server.
Core, babylonjs and threejs libraries work only on the browser and are dependant on many great 3D libraries. bitbybit-occt library is much more versatile and can be used both on the nodejs and browser applications.

Visit https://bitbybit.dev to use our full cloud platform.

# App Example Frameworks
We present examples with full integration for the most popular frameworks, such as Angular, React, NextJS, Nuxt, NodeJS with Express. Whenever possible we try to build a valid 3D model configurator, using either babylonjs or threejs game enegines for representation.

# Github
https://github.com/bitbybit-dev/app-examples

# NPM
BABYLONJS   
https://www.npmjs.com/package/@bitbybit-dev/babylonjs  
THREEJS   
https://www.npmjs.com/package/@bitbybit-dev/threejs  
CORE   
https://www.npmjs.com/package/@bitbybit-dev/core   
OCCT WORKER   
https://www.npmjs.com/package/@bitbybit-dev/occt-worker   
OCCT   
https://www.npmjs.com/package/@bitbybit-dev/occt   

# Example Applications

Visit this page to find a short overview of all the configurators built so far:
https://app-store.bitbybit.dev

| App | Engine | Live | Source in this repository |
| --- | --- | --- | --- |
| Patterns | Three.js | https://app-store.bitbybit.dev/patterns | [webpack/threejs/src/code/patterns.ts](./webpack/threejs/src/code/patterns.ts) |
| Laptop Holder | BabylonJS | https://app-store.bitbybit.dev/laptop-holder | [angular/babylonjs/laptop-holder](./angular/babylonjs/laptop-holder), [react/babylonjs/laptop-holder](./react/babylonjs/laptop-holder) |
| 3D Printable Vase | Three.js | https://app-store.bitbybit.dev/bitbybit-threejs | [react/threejs/vase](./react/threejs/vase) |
| Cup Configurator | BabylonJS | https://app-store.bitbybit.dev/cup | [react/babylonjs/cup](./react/babylonjs/cup) |
| Cup Configurator | Three.js | https://app-store.bitbybit.dev/cup-three | [vite/threejs/cup](./vite/threejs/cup), [webpack/threejs/src/code/cup.ts](./webpack/threejs/src/code/cup.ts) |

<img src="https://app.bitbybit.dev/assets/laptop-holder.png" alt="Laptop Holder Configurator">

Other closed-source apps we built: Terrace Furniture (BabylonJS), https://app-store.bitbybit.dev/terrace-furniture

# Verifying the examples

Every example installs the published `@bitbybit-dev` packages from the registry, the way a user
does, so the examples are the post-publish smoke of the packages. `scripts/examples.mjs` finds
every directory here with a `package.json` and runs each on its own, reporting per example:

```
npm run list               # every example, and any that verify.config.json skips (with the reason)
npm run verify             # npm ci, then npm run build, in each - Angular, Next.js and Nuxt install only
npm run verify:heavy       # the same, building those three too
npm run audit:all          # npm audit at the high level over every lockfile
npm run refresh-lockfiles  # regenerate every lockfile and apply the audit fixes it can
```

`.github/workflows/examples.yml` runs verify and the audit weekly, on every published version and
by hand, and the create-app templates' scaffold-and-install smoke beside them. It is not a
pull-request gate: nothing here builds from the repository's sources, so a pull request cannot
break it - a publish, or a dependency advisory, can. The lockfiles are what Dependabot reads for
this repository; when it reports an advisory under `examples/`, run `npm run refresh-lockfiles`
here and commit the result, bumping a direct dependency in the example's `package.json` where the
fix is outside its range. `api/dotnet-rest` is a .NET project and is outside this lane.

# Running the examples on this repository's packages

The lane above answers "does the published package work". This one answers "does the change I am
making work", by pointing the examples at `packages/dev/*` instead of at the registry, so an idea
can be tried in a real application before anything is published.

```
npm run status:local       # what each example is pointed at, and the port it would get
npm run dev:local          # link every example, start each on its own port, and list them
npm run build:local        # link every example and build it
npm run link:local         # link only
npm run unlink:local       # put the installed packages back
```

`dev:local` with nothing further starts every linkable example at once and prints a page of its own
at http://localhost:5300 listing them. Ctrl-C stops them all. The same commands are at the
repository root as `npm run examples:dev`, `examples:build`, `examples:link`, `examples:unlink` and
`examples:status`.

An example is linked one of two ways, and which one it gets is worked out from the example itself:

- **source**, for the examples Vite runs directly. Their `@bitbybit-dev/*` become symlinks to the
  package directories, and a generated Vite configuration asks for the `@bitbybit-dev/source`
  export condition, so Vite serves the TypeScript under `packages/dev/*/lib` itself. **An edit
  there reaches the browser with no build step at all.** This is the mode to work in. The
  generated file is `vite.config.bitbybit-local.mts`, it is not tracked, and it merges the
  example's own Vite configuration rather than replacing it.
- **dist**, for everything else - Angular, Next.js, Nuxt, webpack, Node. Build the packages first
  (`npm run build-packages` at the repository root, then `npm run watch-packages` to keep them
  compiled while you work), and what npm would publish is copied into the example. Every bundler
  understands it and nothing is generated, but a change needs that rebuild before it shows up.

Some examples are not linked, and `status:local` says which and why: an example that declares no
package from this workspace, and one pinned to an older release than the one here.

**The kernels are not part of this.** The OCCT, JSCAD and Manifold workers are fetched from the CDN
at run time unless an example passes its own, so linking changes the library the page runs and
leaves the kernel where it was. A change under `packages/dev/*-worker/lib` reaches an example
through this lane; a change to a compiled kernel does not.

# Starting one example

Every command takes `--only <part of a path>`, which is the usual way in. From this directory:

```
npm run status:local                             # what can be linked, and the port each would get
npm run dev:local    -- --only vite/threejs/cup  # link that one and start it
npm run build:local  -- --only vite/threejs/cup  # link it and build it
npm run unlink:local -- --only vite/threejs/cup  # put its installed packages back
```

`--only` matches anywhere in the path, so `--only vite/threejs` takes a directory and `--only cup`
takes every example of that name. Two more flags:

- `--port <number>` moves the block of ports, which starts at 5300.
- `--dist` links what npm would publish rather than the sources - the shape a user installs. It
  needs the packages built: `npm run build-packages` at the repository root, and `npm run
  watch-packages` there to keep them compiled while you work.

# Working from inside one example

Once an example is linked, its own directory is a normal place to work from, and the link survives
until you `unlink:local`.

An example linked in **dist** mode - Angular, Next.js, Nuxt, webpack, Node - has the packages copied
into its `node_modules`, so its own scripts already run against this repository with nothing else
passed:

```
cd webpack/threejs
npm start          # on whatever port its own configuration names, not the one this lane hands out
```

An example linked in **source** mode - anything Vite runs directly - needs the generated
configuration, which is sitting in the example directory after the link:

```
cd vite/threejs/cup
npx vite --config vite.config.bitbybit-local.mts
npx vite build --config vite.config.bitbybit-local.mts
```

Its plain `npm run dev` is **not** the same thing. The symlinks are still in place, so it does reach
this repository - but through each package's `dist/`, which then has to have been built, and without
the deduplication the generated configuration carries, so the page ends up with two copies of the 3D
engine. Measured on `vite/threejs/cup`: 580 modules with the generated configuration and 582 without
it, the two extra being a second `three`. Use the generated configuration, or link the example with
`--dist` and mean it.

# Media Channels
Discord: https://discord.gg/GSe3VMe  
Youtube: https://www.youtube.com/@bitbybitdev?sub_confirmation=1  
Instagram: https://www.instagram.com/bitbybit.dev  
Twitter: https://twitter.com/bitbybit_dev  
LinkedIn: https://lnkd.in/gQjEQA2  
Facebook: https://www.facebook.com/bitbybitdev  
Medium: https://bitbybit-dev.medium.com/  

# Principles
Bit By Bit Developers company will keep these core algorithms that you can find in this repository free and opensource for its users. These algorithms are based on other open-source projects, run and are deployed on the browser, thus there is no point of closing them down from public.

# About Bit By Bit Developers platform
Bit By Bit Developers web platform allows creators to program geometry through simple visual programming language or choose monaco typescript editor with full intellisense of bitbybit API. This cloud platform can fulfil many practical, educational and artistic needs of its users. Through familiar programming interface used in tools such as Scratch and Blockly.Games we expose powerful 3D algorithms that make it easier to implement various parametric tasks. Our goal is to make it very simple for users to share their ideas and designs. We want to encourage everyone to engage in the future of this tool.

# Major Dependencies
BabylonJS, ThreeJS, OpenCascade, JSCAD, Verbnurbs, React, Angular, NextJS, Nuxt, Webpack, NodeJS