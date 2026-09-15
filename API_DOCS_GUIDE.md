# API documentation guide

The JSDoc on the public API is the documentation of this library. It reaches a user in the
TypeScript editor as the hover text, on the generated documentation pages, and, through the
translated resource files in `languages/`, as help text in other languages. One comment, written
once, read in all of those places - so it is written for someone who installed the package from npm
and has never seen the code, in plain words, and every fact in it comes from the implementation.

`npm run check:api-docs` (part of `npm test`) holds the corpus to `scripts/api-docs-baseline.json`;
`npm run api-docs:report` lists what still falls short, `npm run api-docs:update` records progress.
The checker reads and reports; it never rewrites a comment. Method and class docs are authored on
the kernel classes and regenerated into the worker packages (`npm run gen:worker-api`); DTO docs
are authored in the inputs fragments and reassembled (`npm run gen:inputs`).

The translated help text in `languages/<locale>.json` is derived from these comments, keyed by the
dotted path of the member (`bitbybit.occt.shapes.solid.createBox_description`, `_returns`,
`_param_inputs`) or of the DTO property (`Inputs.OCCT.BoxDto.width_description`); `languages/doc-paths.json`
maps the names the documentation pages use (`Bit.OCCTSolid.createBox`) to those keys, which is how
a documentation build in another language finds its text. Examples are code and are never
translated. Edit the comment, never a resource file: a resource file is regenerated from the source.

## The register

Full sentences with periods. Active voice, present tense: "Rounds the edges", not "This method
will round". No "we"; "you" only where the caller makes a choice. Sentence case. Backticks for
identifiers, property names, literals and code; single quotes for a word used as a word. American
spelling, matching the identifiers. A regular hyphen, never an em dash. ASCII in prose: `->` for an
arrow, "times" or "x" for multiplication. Say "less than" rather than `<` outside backticks.

Lengths are "in model units": the kernels attach no physical unit. Angles say "in degrees" or "in
radians" on every angle, read from the service (`degToRad` there means the public value is degrees).

## A method

```ts
/**
 * Creates a box solid with its sides parallel to the axes.
 *
 * `width` runs along X, `height` along Y (up) and `length` along Z, all in model units. By default
 * the box is centered on `center`; with `originOnCenter` set to false it stands on that point
 * instead, so `center` becomes the middle of the bottom face.
 * @param inputs - Box size, the point it is placed on, and whether it is centered on or stands on it
 * @returns A new solid
 * @group primitives
 * @shortname box
 * @drawable true
 * @example
 * ```typescript
 * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 20, height: 5 });
 * const rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 1 });
 * ```
 */
```

- The first paragraph is one sentence saying what the method does in plain words - no echo of the
  method name, no kernel name. It is the summary tools show on its own.
- Then a blank ` *` line and up to three sentences: what the inputs mean together, what comes back,
  and the one thing a user hits - units, orientation, order, index base, what an empty list or a
  wrong shape does, what throws. These sentences go in the description, because only the
  description reaches every reader. Sixty words at most.
- `@param inputs - <noun phrase>` with the hyphen; `@returns <concrete noun phrase>` ("A new solid",
  "Distance in model units"), no trailing period on either.
- The generator tags (`@group`, `@shortname`, `@drawable`, `@disposableOutput`, `@ignore`) keep
  their values and order exactly; they are structured metadata, not prose.
- `@example` last. Examples are the default, not the exception: a method goes without one only when
  the DTO already says everything (a getter, a setter of one value, a pass-through). An example
  stands alone: three to ten lines, the call itself first, real values that show the interesting
  inputs, a follow-up call when the result is the point, no imports or setup, in the form users
  type - `await bitbybit.<path>(...)` - fenced as ```` ```typescript ````. One per method; a second
  only when two call shapes genuinely differ. An enum-typed property takes the enum member, never
  its string value (`combination: Bit.Inputs.OCCT.combinationCirclesForFaceEnum.inOrder`, not
  `"inOrder"`): string enums do not type-check against a literal, so the copied example must.

## A DTO and its properties

```ts
/**
 * A shape to fillet with either one `radius` for every selected edge or a `radiusList` giving one
 * radius per entry in `indexes`. Used by `fillets.filletEdges`, where indexes are 0-based edges, and
 * by `fillets.fillet2d`, where they are 1-based corners; each method says which.
 */
export class FilletDto<T> {
    /**
     * Which edges to round. Leave it out to round every edge with `radius`. The index base is set by
     * the method: 0-based edges for `filletEdges`, 1-based corners for `fillet2d`.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
```

- A DTO class doc is one or two sentences: which method(s) it feeds, by dotted path below the
  package root, and how the properties relate to each other. Ninety characters or more where it
  can be, so the documentation page uses it as its description.
- A property doc says what the value means, its unit or frame ("in model units", "in degrees",
  "along Y, which is up"), the range in words only when the tags do not already say it, what
  omitting it does for an optional, and how it relates to its siblings. It never restates the type
  or the name. Thirty words at most. The tags below it (`@default`, `@minimum`, `@maximum`, `@step`,
  `@optional`) stay exactly as they are.
- The same DTO may serve several methods with different semantics; say so per method, as the
  fillet docs do, rather than choosing one.

## An API class

Two to four sentences, ninety characters or more: what the class covers, the mental model a
newcomer needs (in the glossary's words), and where the sibling classes are. The first sentence
stands on its own - it is the search snippet and the page description.

## Structure

The text is markdown, rendered everywhere it is shown: paragraphs separated by a blank ` *` line,
`- ` bullets and `1. ` steps, backticks for code, `**bold**` sparingly, fenced code only under
`@example`. No headings, tables, links, images, HTML or `_underscore_` emphasis in a description.
Never `*` for a bullet or for multiplication. When a sentence wraps, no line may start with `- ` or
a number followed by a period: markdown reads that line as a list item (`check:api-docs` reports
both).

## Never

- `@` in prose: no `{@link}`, no email address, no package name - say "the occt package". A tag is
  the only `@`.
- An em dash, an HTML tag, a URL in a method or property doc (a class doc may credit the upstream
  library once), a version number, code outside `@example`, a second comment of any kind between
  the JSDoc and its member.
- Words that describe something other than the library: "the platform", "the studio", "visual
  programming", "the visual editors", "sockets", "worker facade", "in-process".
- A claim copied from a neighbouring doc. Read the service the method delegates to and its tests,
  and state from the code: units, index base, the default the service applies (`??`), whether a
  new object is returned or the input changed, what an empty list or an unmatched index does, what
  throws. What cannot be verified is left out rather than guessed.

## Glossary

One plain definition per term, written once in the class or namespace doc that introduces it and
reused in the same words wherever the term appears.

- **shape** - anything the kernel holds: a vertex, edge, wire, face, shell, solid or compound. A
  shape you get back is a handle to geometry that lives in the kernel, not a copy of its numbers,
  so it is passed on to the next call rather than read.
- **vertex, edge, wire** - a vertex is a point. An edge is a curve between two vertices: straight,
  circular or free-form. A wire is a chain of edges joined end to end; when the chain returns to its
  start the wire is closed and can bound a face.
- **face, shell, solid, compound** - a face is a bounded piece of surface, usually the region inside
  a closed wire. A shell is a set of faces joined along their edges. A solid is a closed shell that
  encloses a volume. A compound is a loose collection of shapes kept together as one.
- **tolerance** - the distance below which two positions count as the same. Used where the maths
  cannot be exact: joining edges, comparing points, deciding whether a wire is closed. A larger value
  is more forgiving and less precise.
- **B-spline** - a smooth curve or surface defined by control points that pull on it rather than by
  points it passes through, with a degree that says how smooth it is.
- **loft** - a surface or solid stretched through a sequence of wires, like skin over ribs; the
  wires are the cross-sections and their order is the order of the ribs.
- **sweep (pipe)** - a profile moved along a path to make a surface or solid; the profile keeps its
  angle to the path as it goes.
- **boolean** - combining two shapes by union (join them), difference (subtract the second from the
  first) or intersection (keep only what both share).
- **fillet, chamfer** - a fillet rounds an edge or corner with a given radius; a chamfer cuts it off
  flat at a given distance.
- **manifold** - a mesh that is watertight: every edge is shared by exactly two triangles and inside
  and outside are unambiguous. Booleans and 3D printing need this, and the Manifold kernel keeps
  every result manifold.
- **cross-section** - a flat 2D region, possibly with holes, that a manifold operation extrudes,
  revolves or combines in the plane.
- **UV parameter** - a face's own coordinates: U and V run across the surface from its start to its
  end in each direction, so a point on the surface is addressed by (u, v) rather than by x, y, z.
  Where a method says normalized, 0 is the start and 1 the end.
- **normal** - a direction of length 1 pointing straight out of a surface or a plane at a point.
- **transformation matrix** - sixteen numbers in column-major order that hold a move, a rotation and
  a scale in one value; a list of them transforms once per matrix, in order.
- **model units** - the number system geometry lives in. The library attaches no physical unit; a
  file format decides what one unit means on export.
