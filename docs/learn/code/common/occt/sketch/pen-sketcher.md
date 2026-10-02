---
sidebar_position: 1
title: Pen Sketcher
sidebar_label: Pen Sketcher
description: Draw exact 2D outlines in OCCT with a pen - lines, tangent arcs, sagitta and bulge arcs, Bezier curves, rounded and beveled corners - on any plane, then extrude them into solids.
tags: [code, occt, typescript]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation" 
  title="OCCT category icon" />

# Drawing Outlines With a Pen

`bitbybit.occt.sketch.pen` draws a flat outline the way you would describe it in words: start here, go 40 to the right, go up 10, round that corner, curve back smoothly, close. Each command draws on from where the previous one ended. The result is one exact wire, or a face when the outline closes, ready to extrude, revolve or sweep.

Straight pieces come out as true lines and arcs as true circles, so an extruded sketch has planar and cylindrical faces that fillets, selectors and measurements treat exactly.

## A first sketch

```typescript
const plate = await bitbybit.occt.sketch.pen({
    commands: [
        { type: "hLine", id: "base", length: 40 },
        { type: "vLine", id: "right", length: 10 },
        { type: "filletCorner", radius: 2 },
        { type: "tangentArc", id: "nose", to: [-10, 10], relative: true },
        { type: "line", id: "top", to: [0, 20] },
        { type: "close", id: "left" },
    ],
    makeFace: true,
});

const block = await bitbybit.occt.operations.extrude({ shape: plate, direction: [0, 5, 0] });
bitbybit.draw.drawAnyAsync({ entity: block });
```

`makeFace` turns the closed outline into a face whose normal is the frame's normal, whichever way the outline runs, so extruding along that normal always builds the solid on the same side. An outline that crosses itself is refused with a message naming the problem, as is any command that cannot be drawn.

## The commands

Every command is a small object with a `type`, and an optional `id` that names it in the segments report described below. Points are in the sketch's own x and y. A point is absolute unless `relative` is true, in which case it is an offset from where the pen is.

| `type` | Fields | Draws |
|---|---|---|
| `line` | `to`, `relative` | a straight segment to a point |
| `hLine` | `length` | along the sketch's x axis; negative goes left |
| `vLine` | `length` | along the sketch's y axis; negative goes down |
| `polarLine` | `length`, `angle` | at an angle in degrees from the x axis, counterclockwise |
| `tangentLine` | `length` | straight on, in the direction the previous segment ended in |
| `threePointArc` | `through`, `to`, `relative` | a circular arc through a middle point |
| `tangentArc` | `to`, `relative` | a circular arc leaving tangent to the previous segment |
| `sagittaArc` | `to`, `sagitta`, `relative` | an arc whose middle stands `sagitta` off the chord; positive bows to the left of travel |
| `bulgeArc` | `to`, `bulge`, `relative` | the DXF way: `bulge` is the tangent of a quarter of the swept angle, positive counterclockwise |
| `quadratic` | `control`, `to`, `relative` | a quadratic Bezier curve |
| `cubic` | `control1`, `control2`, `to`, `relative` | a cubic Bezier curve |
| `close` | | a straight segment back to the start point |
| `filletCorner` | `radius` | rounds the corner between the segments before and after it |
| `chamferCorner` | `distance` | bevels that corner, cutting `distance` off each segment |

Corner commands sit between the two segments they join. Placed after `close`, a corner command rounds or bevels the corner at the start point. Corners work between lines and circular arcs in any combination.

In the visual editors, `bitbybit.occt.sketch.commands` has one builder per command (`line`, `hLine`, `tangentArc`, `filletCorner` and the rest); collect their outputs into a list and feed it to the pen.

## Sketching on a plane

A sketch lies in the plane of a frame: the frame's `direction` is the sketch's x axis, and its `normal` crossed with the direction is the sketch's y axis. Without a frame, the sketch lies on the ground, facing up, with its y axis running along -Z, which reads naturally when you look down from above.

```typescript
const wallProfile = await bitbybit.occt.sketch.pen({
    start: [0, 0],
    commands: [
        { type: "hLine", length: 30 },
        { type: "vLine", length: 20 },
        { type: "sagittaArc", to: [0, 20], sagitta: -4 },
        { type: "close" },
    ],
    frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] },
    makeFace: true,
});
```

## Finding the edges a command drew

`bitbybit.occt.sketch.penWithSegments` draws the same outline and also reports which edges each command drew, numbered as `bitbybit.occt.shapes.edge.getEdges` numbers them. Give commands an `id` to find their edges by name rather than by position, which shifts when a command is added.

```typescript
const drawn = await bitbybit.occt.sketch.penWithSegments({
    commands: [
        { type: "hLine", id: "base", length: 40 },
        { type: "vLine", id: "side", length: 10 },
        { type: "close", id: "slope" },
    ],
    makeFace: true,
});
const slopeEdges = drawn.segments.find(segment => segment.id === "slope")?.edges;
```

## Outlining a wire with a width

`bitbybit.occt.sketch.stroke` outlines a wire as if it were drawn with a pen of a given width: a slot from a path, a trace from a centre line. `cap` finishes the two ends with a flat cut, a half circle or a square end, and `join` sets how the outline goes around corners. A closed wire gives a ring.

```typescript
const path = await bitbybit.occt.sketch.pen({
    commands: [{ type: "hLine", length: 30 }, { type: "tangentArc", to: [10, 10], relative: true }],
});
const slot = await bitbybit.occt.sketch.stroke({
    shape: path,
    width: 4,
    cap: Bit.Inputs.OCCT.strokeCapEnum.round,
});
```

## Wrapping shapes in a hull

`bitbybit.occt.sketch.hull` wraps vertices, lines, circles and circular arcs in the tightest convex outline around them. It is exact: straight where it spans between shapes, following a circle where a circle bulges out. The hull of a few circles is the classic way to draw a lever, a link or a rounded plate.

```typescript
const pivot = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 8, center: [0, 0, 0], direction: [0, 1, 0] });
const tip = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 4, center: [40, 0, 0], direction: [0, 1, 0] });
const lever = await bitbybit.occt.sketch.hull({ shapes: [pivot, tip] });
```
