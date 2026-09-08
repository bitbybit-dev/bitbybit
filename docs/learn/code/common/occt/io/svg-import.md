---
sidebar_position: 7
title: SVG Import
sidebar_label: SVG Import
description: Import SVG drawings into OCCT geometry - which elements are supported, how faces and holes are worked out, and what to do about text and reused symbols.
tags: [code, occt, rete, blockly, typescript]
---

<img
  class="category-icon-small"
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg"
  alt="OCCT category icon with a stylized logo representation"
  title="OCCT category icon" />

# Importing SVG Drawings

SVG is the easiest way to get a 2D outline out of a drawing tool and into a script. You draw in
Illustrator, Inkscape, Figma or a browser, save an SVG, and import it as OCCT wires or faces.

The importer does not support the whole SVG specification, and this page tells you where the edges
are, so you can prepare a file that imports cleanly the first time.

## What gets imported

Seven elements produce geometry:

`path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`

Nine more are recognised and deliberately skipped, because they hold definitions rather than drawings:

`defs`, `symbol`, `clipPath`, `mask`, `marker`, `pattern`, `metadata`, `title`, `desc`

Grouping elements such as `g`, `a` and `switch` are walked through, so geometry nested inside them
comes across normally along with any transform they apply.

## The import tells you what it could not use

The result carries a `warnings` array. Anything the importer met and could not turn into geometry is
reported there, once per kind of element.

**Read it.** An SVG that imports as an empty scene is almost always explained by a single line in that
array, and the alternative is guessing.

## Two limitations worth knowing before you export

### Reused symbols do not come across

The `use` element places a copy of something defined elsewhere in the document, usually inside `defs`.
Since `defs` is skipped, a `use` element has nothing to point at, and contributes nothing.

This matters more than it sounds, because it is how most drawing tools export anything repeated: they
define the shape once and place it twenty times. Such a file imports as an empty drawing.

**What to do:** in your drawing tool, expand, flatten or ungroup the repeated items before exporting,
so each copy is written out as its own path.

### Text is not geometry

`text` and `tspan` describe characters in a font, not outlines. Fonts are not available to the
importer, so text cannot be turned into shapes.

**What to do:** convert text to paths or outlines before exporting. Every major drawing tool has this
option, usually called "Convert to Outlines", "Object to Path" or "Create Outlines".

The same applies to `image`, which holds a raster picture, and `foreignObject`, which holds content
that is not SVG at all. Neither has geometry to import.

## Styling

Presentation attributes and inline `style="..."` are both read, and inherited down the tree the way you
would expect.

An embedded `<style>` block with CSS selectors is **not** applied. Matching CSS selectors is a much
larger job than reading attributes, and machine-generated SVG rarely uses them. If your file styles
through a stylesheet, the import warns about it, and the fix is to export with presentation attributes
instead - most tools have a setting for this.

## Faces and holes

If you ask for faces rather than wires, the importer decides which outlines are holes inside other
outlines, and which are separate shapes.

Two things decide it: whether one outline's centre lies inside another, and whether its area is
genuinely smaller. Both are needed. The area comparison is what separates two circles drawn around the
same centre, where the centre test alone cannot tell you which contains which.

Your drawing's own fill rule is respected, so a shape drawn with `evenodd` and one drawn with
`nonzero` produce the hole arrangement you see in the drawing tool.

## Arcs survive transforms

An arc inside a group that has been scaled, rotated or mirrored stays a true arc rather than being
approximated. Mirroring reverses the direction the arc sweeps, which is handled, so a mirrored drawing
does not come in with its curves bulging the wrong way.
