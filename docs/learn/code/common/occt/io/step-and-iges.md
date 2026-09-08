---
sidebar_position: 8
title: STEP & IGES Import
sidebar_label: STEP & IGES Import
description: Read STEP and IGES files into OCCT shapes - the compressed variants, passing file data from a browser, and how a file that cannot be read reports itself.
tags: [code, occt, rete, blockly, typescript]
---

<img
  class="category-icon-small"
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg"
  alt="OCCT category icon with a stylized logo representation"
  title="OCCT category icon" />

# Importing STEP and IGES

STEP and IGES are the two exchange formats CAD systems agree on. Both describe exact geometry rather
than a mesh, so what you get back is a real solid you can cut, fillet and measure, not a triangulated
approximation.

## Four extensions, two shapes of data

| Extension | Format | Data |
|---|---|---|
| `.step`, `.stp` | STEP | text |
| `.iges`, `.igs` | IGES | text |
| `.stpz` | STEP | compressed, binary |
| `.igz` | IGES | compressed, binary |

The compressed variants are ordinary STEP and IGES run through zip. They are common when a file is
emailed or downloaded, because the text forms are large.

**Compressed files must be handed over as binary.** Read the file as an `ArrayBuffer` or a
`Uint8Array` rather than as text. Reading a compressed file as text corrupts it before the importer
ever sees it, because the bytes are not valid text.

Uncompressed STEP and IGES can be passed as text, which is usually the simpler path.

## Passing a file from a browser

If you have a `File` from an upload input, or a `Blob`, read it before you pass it in:

- `await file.text()` for uncompressed STEP or IGES
- `await file.arrayBuffer()` for the compressed `.stpz` and `.igz` forms, or when you would rather not
  think about which you have

Handing a `File` or `Blob` straight to the importer does not work. Reading one is asynchronous, and the
importer is not, so the conversion has to happen on your side first.

## Standing the model up

CAD systems commonly treat Z as up, while Bitbybit treats Y as up. A model imported from such a system
therefore arrives lying on its side.

The `adjustZtoY` option corrects that as part of the import. Turn it on for a file that came out of a
CAD package, and leave it off for one that was written by Bitbybit.

## A file that cannot be read gives you nothing

If the importer cannot build a model, you get nothing back rather than an empty shape, and the reason
is written to the console.

This is worth knowing because a file can be *readable* without being *usable*: it parses as valid
STEP or IGES, but contains nothing the kernel can turn into geometry. That case reports as a failure
too. If you get nothing back, the file is the place to look, not your script.
