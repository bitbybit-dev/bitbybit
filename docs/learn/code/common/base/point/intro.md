---
sidebar_position: 1
title: Points in Bitbybit
sidebar_label: Points in Bitbybit
description: How bitbybit.point builds points and point patterns such as spirals, arcs and hex grids, moves, rotates and scales them, measures distances and bounding boxes, and finds the largest fillet a corner allows.
topic: code.base.point
type: explanation
tags: [code, point]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/point-icon.svg" 
  alt="Vector category icon" 
  title="Vector category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/point.ts)

`bitbybit.point` builds, moves and measures points.

## What a point is

A point is an array of three numbers, `[x, y, z]`, with Y pointing up, so the ground is the XZ plane. A vector has the same shape, so a point can be passed where a vector is expected and back. A 2D point is `[x, y]`.

Every function gives new points or numbers and leaves its input unchanged. Angles are in degrees and lengths in model units.

## Making points and patterns

- `pointXYZ` builds `[x, y, z]`, and `pointXY` builds the 2D point `[x, y]`.
- `multiplyPoint` repeats one point `amountOfPoints` times.
- `arcThroughThreePoints` lays out points along the circular arc from `start` through `middle` to `end`, in `segments` equal steps (default 16). Three points on one line fix no arc and come back as they are.
- `spiral` lays out `numberPoints` points along a logarithmic spiral in the XY plane, from the origin out to `radius`; `phi`, `widening` and `factor` shape how it opens.
- `hexGrid` gives the centers of a honeycomb of hexagons in the XY plane, `nrHexagonsX` columns along X and `nrHexagonsY` rows along Y, with every second row shifted by half a column. `radiusHexagon` is the distance from a center to a corner.
- `hexGridScaledToFit` fills a `width` by `height` rectangle with `nrHexagonsInWidth` by `nrHexagonsInHeight` hexagons. It gives the `centers`, the six corners of every hexagon in `hexagons`, the shortest and longest edge, and the largest fillet radius that fits every corner. A corner points up unless `flatTop` is on, and the `extend...` options stretch the outer rows past the edges so the rectangle has no jagged border.

Both hex grids start at the origin unless you center them (`orientOnCenter`, `centerGrid`), and `pointsOnGround` lays them on the XZ ground plane instead.

## Moving, rotating and scaling

- `translatePoints` moves every point by one vector, and `translateXYZPoints` by separate `x`, `y` and `z` amounts. `translatePointsWithVectors` moves each point by its own vector.
- `rotatePointsCenterAxis` turns points by `angle` degrees around an `axis` through `center`, counter-clockwise when the axis points toward you.
- `scalePointsCenterXYZ` scales points about a `center` with a factor per axis, so `[1, 2, 1]` doubles distances along Y only.
- `stretchPointsDirFromCenter` stretches points along one `direction`, measured from a `center`; distances across it stay the same.
- `transformPoint` and `transformPoints` apply a transformation matrix, or a list of them in order, such as `bitbybit.babylon.transforms` builds. `transformsForPoints` applies a different one to each point.

`translatePointsWithVectors` and `transformsForPoints` throw unless both lists have the same length.

## Measuring

- `getX`, `getY` and `getZ` read one coordinate.
- `distance` measures between two points, and `distancesToPoints` from one point to each point of a list.
- `closestPointFromPoints` gives the nearest point of a list, and `closestPointFromPointsDistance` the distance to it. `closestPointFromPointsIndex` gives its position counted from 1, not 0, so the first point of the list is 1.
- `averagePoint` gives the average of the points.
- `boundingBoxOfPoints` gives the smallest axis-aligned box around the points: its `min` and `max` corners, `center`, and `width` (along X), `height` (along Y) and `length` (along Z).
- `twoPointsAlmostEqual` tells whether two points are closer together than `tolerance`.
- `normalFromThreePoints` gives the unit direction at right angles to the plane through three points, by the right-hand rule from the first point to the second to the third; `reverseNormal` flips it. Points on one line give `undefined`.

## Fillets at corners

These find the largest radius a rounded corner can have, which is useful before filleting a polyline or a wire.

- `maxFilletRadius` takes one corner. Note the names: `end` is the corner itself, and `start` and `center` are the far ends of the two segments that meet there. The radius is limited by the shorter segment.
- `maxFilletRadiusHalfLine` limits the arc to the nearer half of each segment, so neighbouring corners of a polyline can all be filleted without their arcs overlapping.
- `maxFilletsHalfLine` gives that radius for every corner of a polyline. With `checkLastWithFirst` on, the polyline counts as closed and the radii of the corners at its first and last points are added at the end of the list.
- `safestPointsMaxFilletHalfLine` gives the smallest of those radii: one radius that fits every corner.

A straight or folded-back corner, or a segment shorter than `tolerance`, allows no fillet and gives 0.

## Cleaning and sorting

- `removeConsecutiveDuplicates` removes a point that repeats the one right before it, within `tolerance`. With `checkFirstAndLast` on, a last point that repeats the first is dropped too.
- `sortPoints` sorts by X, then by Y, then by Z.

## Every function

{/* api:point:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`arcThroughThreePoints`](https://docs.bitbybit.dev/classes/Bit.Point#arcThroughThreePoints) | Lays out points along the circular arc through three points, from the first through the second to the third. |
| [`averagePoint`](https://docs.bitbybit.dev/classes/Bit.Point#averagePoint) | Finds the average of the points, which is their center of mass when they weigh the same. |
| [`boundingBoxOfPoints`](https://docs.bitbybit.dev/classes/Bit.Point#boundingBoxOfPoints) | Finds the smallest axis-aligned box that holds all the points. |
| [`closestPointFromPoints`](https://docs.bitbybit.dev/classes/Bit.Point#closestPointFromPoints) | Finds the nearest point in a list to a given point. |
| [`closestPointFromPointsDistance`](https://docs.bitbybit.dev/classes/Bit.Point#closestPointFromPointsDistance) | Measures the distance from a point to the nearest point in a list. |
| [`closestPointFromPointsIndex`](https://docs.bitbybit.dev/classes/Bit.Point#closestPointFromPointsIndex) | Finds the position of the nearest point in a list, counted from 1. |
| [`distance`](https://docs.bitbybit.dev/classes/Bit.Point#distance) | Measures the straight-line distance between two points. |
| [`distancesToPoints`](https://docs.bitbybit.dev/classes/Bit.Point#distancesToPoints) | Measures the distance from one point to each point in a list. |
| [`getX`](https://docs.bitbybit.dev/classes/Bit.Point#getX) | Reads the X value of a point. |
| [`getY`](https://docs.bitbybit.dev/classes/Bit.Point#getY) | Reads the Y value of a point, the one that points up. |
| [`getZ`](https://docs.bitbybit.dev/classes/Bit.Point#getZ) | Reads the Z value of a point. |
| [`hexGrid`](https://docs.bitbybit.dev/classes/Bit.Point#hexGrid) | Lays out the centers of a honeycomb of hexagons in the XY plane. |
| [`hexGridScaledToFit`](https://docs.bitbybit.dev/classes/Bit.Point#hexGridScaledToFit) | Lays out a honeycomb of hexagons that fills a given width and height, sizing the hexagons from the counts. |
| [`maxFilletRadius`](https://docs.bitbybit.dev/classes/Bit.Point#maxFilletRadius) | Finds the largest fillet that fits a corner: the arc touches both segments and stays inside them. |
| [`maxFilletRadiusHalfLine`](https://docs.bitbybit.dev/classes/Bit.Point#maxFilletRadiusHalfLine) | Finds the largest fillet at a corner whose arc touches each segment within its nearer half, so neighboring corners of a polyline can each be filleted without the arcs overlapping. |
| [`maxFilletsHalfLine`](https://docs.bitbybit.dev/classes/Bit.Point#maxFilletsHalfLine) | Finds the largest fillet for every corner of a polyline, each limited to the nearer half of its segments so the fillets never overlap. |
| [`multiplyPoint`](https://docs.bitbybit.dev/classes/Bit.Point#multiplyPoint) | Repeats one point a given number of times in a list. |
| [`normalFromThreePoints`](https://docs.bitbybit.dev/classes/Bit.Point#normalFromThreePoints) | Finds the direction at right angles to the plane through three points, with length 1. |
| [`pointXY`](https://docs.bitbybit.dev/classes/Bit.Point#pointXY) | Builds a 2D point from its x and y values. |
| [`pointXYZ`](https://docs.bitbybit.dev/classes/Bit.Point#pointXYZ) | Builds a 3D point from its x, y and z values. |
| [`removeConsecutiveDuplicates`](https://docs.bitbybit.dev/classes/Bit.Point#removeConsecutiveDuplicates) | Removes a point when it repeats the one right before it; the same point further away is kept. |
| [`rotatePointsCenterAxis`](https://docs.bitbybit.dev/classes/Bit.Point#rotatePointsCenterAxis) | Rotates points around an axis that passes through a center. |
| [`safestPointsMaxFilletHalfLine`](https://docs.bitbybit.dev/classes/Bit.Point#safestPointsMaxFilletHalfLine) | Finds one fillet radius that fits every corner of a polyline: the smallest of the per-corner maximums under the half-segment rule. |
| [`scalePointsCenterXYZ`](https://docs.bitbybit.dev/classes/Bit.Point#scalePointsCenterXYZ) | Scales points away from or toward a center, with its own factor per axis. |
| [`sortPoints`](https://docs.bitbybit.dev/classes/Bit.Point#sortPoints) | Sorts points by X, then by Y for equal X, then by Z. |
| [`spiral`](https://docs.bitbybit.dev/classes/Bit.Point#spiral) | Lays out points along a logarithmic spiral in the XY plane, from the origin outward to `radius`. |
| [`stretchPointsDirFromCenter`](https://docs.bitbybit.dev/classes/Bit.Point#stretchPointsDirFromCenter) | Stretches points along one direction, measured from a center; distances across that direction stay as they are. |
| [`transformPoint`](https://docs.bitbybit.dev/classes/Bit.Point#transformPoint) | Applies a transformation matrix, or a list of them in order, to one point. |
| [`transformPoints`](https://docs.bitbybit.dev/classes/Bit.Point#transformPoints) | Applies the same transformation matrix, or list of them in order, to every point. |
| [`transformsForPoints`](https://docs.bitbybit.dev/classes/Bit.Point#transformsForPoints) | Applies a different transformation to each point: the first transformation to the first point, and so on. |
| [`translatePoints`](https://docs.bitbybit.dev/classes/Bit.Point#translatePoints) | Moves every point by the same vector. |
| [`translatePointsWithVectors`](https://docs.bitbybit.dev/classes/Bit.Point#translatePointsWithVectors) | Moves each point by its own vector: the first point by the first vector, and so on. |
| [`translateXYZPoints`](https://docs.bitbybit.dev/classes/Bit.Point#translateXYZPoints) | Moves every point by the given x, y and z amounts. |
| [`twoPointsAlmostEqual`](https://docs.bitbybit.dev/classes/Bit.Point#twoPointsAlmostEqual) | Tells whether two points are closer together than a tolerance. |

{/* api:point:end */}
