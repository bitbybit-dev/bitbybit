---
sidebar_position: 1
title: Points in Bitbybit
sidebar_label: Points in Bitbybit
description: Learn about the Point class in Bitbybit. Understand how to create, transform, and analyze points in your 3D projects.
tags: [code, point]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/point-icon.svg" 
  alt="Vector category icon" 
  title="Vector category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/point.ts)

The `Point` class in Bitbybit provides essential tools for working with points in 3D space.

**What is a Point in Bitbybit?**

Just like a `Vector`, a `Point` in Bitbybit is fundamentally a simple **array of three numbers: `[x, y, z]`**.
*   This means you can often use a `Point` where a `Vector` is expected, and vice-versa, as they share the same underlying structure.
*   When working in 2D, the Z-coordinate is typically just set to `0`, so a 2D point looks like `[x, y, 0]`.

This simplicity makes it easy to define locations and work with geometric data.

## Core Capabilities of the Point Class

The `Point` class is all about defining locations and manipulating them. Here's an overview of what it helps you do. For the nitty-gritty details of each function, including specific input parameters, please check the [full Point API documentation](https://docs.bitbybit.dev/classes/Bit.Point.html) or the GitHub source linked above.

### 1. Creating Points & Point Patterns

Need to define a point or a collection of points?
*   **Basic Points:** Create individual 3D points from X, Y, and Z coordinates (`pointXYZ()`) or 2D points from X and Y (`pointXY()`, which creates `[x, y, 0]`).
*   **Pattern Generation:**
    *   `spiral()`: Generate points arranged in a spiral pattern.
    *   `hexGrid()`: Create points that form the centers of a hexagonal grid.
    *   `hexGridScaledToFit()`: A more advanced hexagonal grid generator that can scale the grid to fit specific dimensions and provides both center points and hexagon vertices.
*   **Duplication:**
    *   `multiplyPoint()`: Create multiple copies of the same point.

### 2. Transforming Points (Moving, Rotating, Scaling)

This is a major strength of the `Point` class. You can easily change the position, orientation, or size of points:
*   **General Transformations:** Apply complex transformations (like those created by the `Transforms` class) to a single point (`transformPoint()`) or multiple points (`transformPoints()`). You can even apply a unique transformation to each point in a list (`transformsForPoints()`).
*   **Translation (Moving):**
    *   Move points by a single vector (`translatePoints()`, `translateXYZPoints()`).
    *   Move each point in a list by its own unique translation vector (`translatePointsWithVectors()`).
*   **Scaling (Resizing):**
    *   Scale points around a center point using X, Y, Z scale factors (`scalePointsCenterXYZ()`).
*   **Stretching:**
    *   Stretch points along a specific direction from a center point (`stretchPointsDirFromCenter()`).
*   **Rotation:**
    *   Rotate points around an axis that passes through a center point (`rotatePointsCenterAxis()`).

### 3. Analyzing and Measuring Points

Get information about your points and their relationships:
*   **Coordinates:** Get the individual X, Y, or Z coordinate of a point (`getX()`, `getY()`, `getZ()`).
*   **Distance:**
    *   Calculate the distance between two specific points (`distance()`).
    *   Find the distances from one point to many other points (`distancesToPoints()`).
*   **Closest Point:**
    *   From a reference point, find the closest point in a list of other points (`closestPointFromPoints()`).
    *   You can also get the *distance* to this closest point (`closestPointFromPointsDistance()`) or its *index* in the list (`closestPointFromPointsIndex()`).
*   **Bounding Box:** Find the smallest box that encloses a set of points (`boundingBoxOfPoints()`). This gives you the minimum and maximum extent, center, and dimensions.
*   **Average Point:** Calculate the average position of a group of points (`averagePoint()`).
*   **Equality Check:** Determine if two points are in (almost) the same location, within a small tolerance (`twoPointsAlmostEqual()`).

### 4. Calculating Normals and Fillets (More Advanced Geometry)

*   **Normal Vector:** Calculate a normal vector (a vector perpendicular to a surface) from three points that define a plane (`normalFromThreePoints()`).
*   **Fillet Radius Calculation:** Functions to help determine the maximum possible radius for a smooth, rounded corner (fillet) given points that define the corner (`maxFilletRadius()`, `maxFilletRadiusHalfLine()`, `maxFilletsHalfLine()`, `safestPointsMaxFilletHalfLine()`). These are useful for advanced modeling tasks like creating smooth transitions between edges.

### 5. Utility and Cleaning

*   **Removing Duplicates:** Clean up lists of points by removing consecutive identical points, considering a tolerance (`removeConsecutiveDuplicates()`).
*   **Sorting:** Sort a list of points, primarily by X, then Y, then Z coordinates (`sortPoints()`).
