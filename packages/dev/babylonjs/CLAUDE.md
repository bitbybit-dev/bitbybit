# CLAUDE.md - `@bitbybit-dev/babylonjs`

The Babylon.js integration layer over `@bitbybit-dev/core`. Shared package conventions are one level
up in `packages/dev/CLAUDE.md`.

**The engine is a peer dependency here, not a hard one** - `@babylonjs/core`, `gui`, `havok`,
`loaders`, `materials`, `serializers`, plus `earcut`. Its siblings `threejs` and `playcanvas` take
their engines as ordinary dependencies instead. That asymmetry is load-bearing: the tooling that
builds the hosted runners reads **`peerDependencies`** as the source of truth for which engine
version a runner must install. Moving an engine between `dependencies` and `peerDependencies`
therefore changes how the runners resolve it.

Because the engine is a peer, the consuming application supplies it. A version skew between the app's
Babylon and the one this package was built against surfaces at runtime, not at build time.

Adding a feature area follows a fixed shape: a class, its inputs, two index entries and the
aggregator. JSDoc tags on the public surface drive the studio's generated components, so a missing
tag becomes a wrong control in the editor rather than an error here.
