---
title: Lines in Bitbybit
sidebar_label: Lines in Bitbybit
description: An overview of the Line class in Bitbybit, explaining how to create, analyze, and transform lines and line segments in 3D.
tags: [code, line]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/line-icon.svg" 
  alt="Line category icon" 
  title="Line category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/line.ts)

The `Line` class in Bitbybit provides tools for working with straight lines and line segments in 3D space.

**What is a Line in Bitbybit?**

In Bitbybit, a "Line" (specifically, a line segment) is typically defined by two points: a start point and an end point. It's represented as an object:
`{ start: [x, y, z], end: [x, y, z] }`

Sometimes, a "segment" might also be represented as a simple array of two points:
`[[startX, startY, startZ], [endX, endY, endZ]]`

The `Line` class provides methods to work with both these representations and convert between them.

## Core Capabilities of the Line Class

The `Line` class allows you to define, analyze, and manipulate these line segments. Here's a high-level look at its features. For the exact input parameters (like DTOs) and detailed behavior, please refer to the [full Line API documentation](https://docs.bitbybit.dev/classes/Bit.Line.html) or the GitHub source linked above.

### 1. Creating Lines and Segments

Defining new lines:
*   **From Start and End Points (`create()`):** Create a line object `{ start, end }` by providing its two endpoint coordinates.
*   **Segment from Points (`createSegment()`):** Create a segment (an array of two points) from its start and end point coordinates.
*   **Lines from a Sequence of Points (`linesBetweenPoints()`):** Given a list of points, create a series of connected line segments (e.g., point A to B, B to C, C to D).
*   **Lines from Separate Start/End Point Lists (`linesBetweenStartAndEndPoints()`):** If you have a list of start points and a corresponding list of end points, create a line segment for each pair.

### 2. Getting Information About Lines

Accessing properties of a line:
*   **Endpoints:** Get the start point (`getStartPoint()`) or end point (`getEndPoint()`) of a line.
*   **Length (`length()`):** Calculate the length of a line segment.
*   **Point on Line (`getPointOnLine()`):** Find the coordinates of a point that lies on the line segment at a specific fractional distance (parameter `param` from 0.0 at the start to 1.0 at the end) between its start and end points.

### 3. Modifying and Transforming Lines

Changing existing lines:
*   **Reverse (`reverse()`):** Swap the start and end points of a line.
*   **Transformations:**
    *   `transformLine()`: Apply a 3D transformation (like translation, rotation, scaling) to a single line.
    *   `transformsForLines()`: Apply a unique transformation to each line in a list of lines.

### 4. Converting Between Line and Segment Formats

Switching representations:
*   **Line to Segment (`lineToSegment()`, `linesToSegments()`):** Convert a line object (or a list of them) into the segment array format.
*   **Segment to Line (`segmentToLine()`, `segmentsToLines()`):** Convert a segment array (or a list of them) into the line object format.

### 5. Intersection (Advanced)

*   **Line-Line Intersection (`lineLineIntersection()`):**
    *   Determine if two lines (or line segments, if specified) intersect in 3D space.
    *   If they do intersect, this method returns the point of intersection.
    *   It handles various cases, including parallel, collinear, and skew lines, using a tolerance value.
    *   You can specify whether to check for intersection only within the bounds of the line *segments* or to treat them as infinite lines.
