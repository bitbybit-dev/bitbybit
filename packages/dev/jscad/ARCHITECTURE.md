# Architecture - `@bitbybit-dev/jscad`

Why parts of this package work the way they do, where the code alone does not say. The kernel quirks
and conventions are in `CLAUDE.md` beside this file.

## The kernel entry

`jscad-generated.js` is an entry module, not a bundle: it gathers `@jscad/modeling` and the
serializers the downloads go through into the one object `Jscad` takes, under the names the service
reads them by (`IOUTILS`, `STLSERIALIZER`, `DXFSERIALIZER`, `THREEMFSERIALIZER`). Every one of those
packages is CommonJS, so each is default-imported to get its `module.exports` object. A namespace
import of a CommonJS module surfaces only the exports Node can lex statically, which for
`@jscad/modeling` is one of fourteen.

## The service

- JSCAD v1 returned objects that carried their own `toPolygons()`; a v2 geometry is plain data and
  the equivalent is a free function. A value still arriving in the v1 shape is read the v1 way, so the
  service asks the value for `toPolygons` (`legacyPolygons`) rather than trusting its declared type.
- An operation that needs a solid narrows its input first and names itself in the error
  (`asSolid`). The kernel's own failure for a 2D shape is a property access on undefined several
  frames deep, which tells a script author nothing.

## Tests

- `lib/api/__test__/kernel.ts` loads the kernel once per process and every suite in a file shares
  it: the kernel is plain JavaScript with no global state to corrupt, and loading it once keeps the
  suites fast.
- A test measures what the wrapper built with the kernel's own measurement functions: a wrapper is
  correct when the library's measurements of its output are the ones the shape should have.
- The API returns the union of three unrelated entity kinds, so a test that reads a path's points
  narrows first with `expectPath`, `expectRegion` or `expectSolid`, which say what arrived when it is
  the wrong kind. Reading `.points` off a solid directly would compare undefined with undefined and
  pass. `asOne` does the same for a result that may be one entity or a list.
