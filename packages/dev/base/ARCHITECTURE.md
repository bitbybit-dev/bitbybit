# Architecture - `@bitbybit-dev/base`

Why parts of this package work the way they do, where the code alone does not say. The conventions
are in `CLAUDE.md` beside this file.

## Kernel calls

- `describeKernelFailure` reports a WebAssembly trap (an error named `RuntimeError`) as kind `crash`,
  apart from an ordinary kernel failure, because a trap leaves the kernel's memory in an unknown state
  and nothing the kernel holds can be trusted afterwards.
- A `KernelOperationError` is recognised by its `name`, not by `instanceof`: the error may have been
  thrown by another copy of the class than the one describing it, and `instanceof` matches only its
  own. Only a string `code` makes it a named failure.

## Frames

- Code that reduces a caller's list of vectors (`reachOf`, the largest coordinate) loops over it
  instead of spreading it into `Math.max`. A spread passes every element as an argument, and a long
  list overflows the call stack.
- `bestFit` decides every sign the points leave open the same way every time. When their turning is
  too small to read, or the first point lies across the widest spread, the axis is flipped so that its
  largest component is positive (`withLargestPositive`). Components within
  `EQUAL_COMPONENT_TOLERANCE` (1e-12) of each other count as equal and the first of them decides, so
  rounding cannot tip the choice; OCCT's frames break the tie the same way. When the points spread
  evenly every way in their plane, X points at the first point that does not sit on the center.

## DXF export

`services/helpers/dxf/dxf-generator.ts` writes one of two versions, chosen by `acadVersion`:

- `AC1009` (R12), the default. Its readers expect the VPORT, VIEW, UCS, APPID and DIMSTYLE tables
  and a BLOCKS section even when they are empty, and an APPID entry for `ACAD`, so those are written
  empty rather than left out.
- `AC1015` (2000) adds entity handles and subclass markers (`AcDbSymbolTable`,
  `AcDbLayerTableRecord`). Handles count up in upper-case hexadecimal from 0x101.

A `#RRGGBB` colour is written as the nearest of the nine standard AutoCAD Color Index entries (1-9)
by RGB distance, or, with `colorFormat: "truecolor"`, as ACI 256 (by layer) followed by group 420
holding `r * 65536 + g * 256 + b`. Near-black (every channel under 30) and anything that is not
`#RRGGBB` become ACI 7, which viewers draw black on a light background and white on a dark one.

A polyline is written closed when it has at least three points and its first and last agree within
`CLOSED_POLYLINE_TOLERANCE` in X and Y.
