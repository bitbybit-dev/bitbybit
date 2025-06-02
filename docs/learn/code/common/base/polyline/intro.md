---
title: Polylines in Bitbybit
sidebar_label: Polylines in Bitbybit
description: An overview of the Polyline class in Bitbybit, explaining how to create, analyze, and transform polylines (sequences of connected points).
tags: [code, polyline]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/polyline-icon.svg" 
  alt="Polyline category icon" 
  title="Polyline category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/polyline.ts)

The `Polyline` class in Bitbybit provides tools for working with polylines, which are essentially paths or sequences of connected straight line segments.

**What is a Polyline in Bitbybit?**

A polyline in Bitbybit is typically represented as an object with a `points` property. This property holds an array (a list) of 3D points `[x, y, z]`.
`{ points: [[x1,y1,z1], [x2,y2,z2], [x3,y3,z3], ...] }`

A polyline can also be `isClosed`, meaning there's an implied segment connecting the last point back to the first point, forming a closed loop or polygon outline.

## Core Capabilities of the Polyline Class

The `Polyline` class helps you define, analyze, and manipulate these sequences of points. Here's a high-level look at its features. For the exact input parameters (like DTOs) and detailed behavior, please refer to the [full Polyline API documentation](https://docs.bitbybit.dev/classes/Bit.Polyline.html) or the GitHub source linked above.

### 1. Creating Polylines

*   **From Points (`create()`):** The primary way to create a polyline is by providing a list of its points. You can also specify if the polyline should be considered closed.

### 2. Getting Information About Polylines

Understanding your polyline's properties:
*   **Points (`getPoints()`):** Retrieve the list of points that make up the polyline.
*   **Length (`length()`):** Calculate the total length of the polyline by summing the lengths of all its segments.
*   **Number of Points (`countPoints()`):** Get the total count of points in the polyline.

### 3. Modifying and Transforming Polylines

Changing existing polylines:
*   **Reverse (`reverse()`):** Reverse the order of points in the polyline. This effectively flips its direction.
*   **Transform (`transformPolyline()`):** Apply a 3D transformation (like translation, rotation, scaling) to all points of the polyline.

### 4. Converting Polylines

Changing the representation:
*   **To Line Segments (`polylineToLines()`, `polylineToSegments()`):** Convert a polyline into a list of individual line segments.
    *   `polylineToLines()` returns a list of line objects (`{start, end}`).
    *   `polylineToSegments()` returns a list of segment arrays (`[[startPt], [endPt]]`).
    *   If the polyline `isClosed`, an additional segment connecting the last point to the first is included (unless they are already the same point).

### 5. Intersection (Advanced)

Finding where polylines cross:
*   **Self-Intersection (`polylineSelfIntersection()`):** Find all points where a polyline crosses over itself. This does not consider intersections between adjacent segments.
*   **Two Polyline Intersection (`twoPolylineIntersection()`):** Find all points where two different polylines intersect each other.
    *   Both intersection methods use a tolerance to account for floating-point inaccuracies.

### 6. Organizing and Sorting (Advanced)

*   **Sort Segments into Polylines (`sortSegmentsIntoPolylines()`):**
    *   A powerful utility that takes a collection of potentially disconnected and unordered line segments.
    *   It attempts to connect these segments end-to-end (within a tolerance) to form one or more continuous polylines.
    *   It can identify both open and closed polylines from the input segments.

### 7. Fillet Calculations (Advanced Geometry)

*   **Max Fillet Radii (`maxFilletsHalfLine()`):** For each corner (vertex) of the polyline, calculate the maximum possible radius for a smooth, rounded fillet that can be applied, based on a "half-line" constraint (tangent points within the first half of each segment).
*   **Safest Fillet Radius (`safestFilletRadius()`):** Determine the single smallest fillet radius from the `maxFilletsHalfLine` results. This is the largest radius that could be applied *uniformly* to all corners of the polyline without overlaps, given the half-line constraint.
