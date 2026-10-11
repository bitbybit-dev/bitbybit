# Architecture - `@bitbybit-dev/manifold-worker`

How the worker side behaves where the code alone does not say why. The caches are described in
`CLAUDE.md` beside this file, and the rules for crossing the worker boundary in
`packages/dev/CLAUDE.md`.

## Binary arguments in the cache key

`toHashable` replaces every `ArrayBuffer` and view in the arguments, at any depth, by a digest of its
bytes and its length (why is in `CLAUDE.md`). It copies only the objects and lists on the way to a
binary value, so arguments without one come back as they are, and it passes over a list of plain
values - a point, a long list of numbers - without a copy. A structure that refers to itself is left
for `JSON.stringify` to refuse.
