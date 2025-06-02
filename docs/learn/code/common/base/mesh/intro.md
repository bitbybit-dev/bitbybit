---
title: Mesh Utilities
sidebar_label: Mesh Utilities
description: An overview of the MeshBitByBit class, providing utility functions for working with mesh triangles, planes, and intersections.
tags: [code, mesh]
---

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/mesh.ts) <!-- Assuming this will be the correct path -->

The `MeshBitByBit` class (often referred to as `Mesh` or `Mesh Utilities` in context) offers a set of specialized tools for working directly with the fundamental components of meshes, primarily triangles and planes. These functions can be useful for lower-level geometric analysis and operations that go beyond standard CAD modeling features.

**Understanding Meshes in this Context:**

For the purposes of this class:
*   A **Triangle** is typically represented as an array of three 3D points: `[[x1,y1,z1], [x2,y2,z2], [x3,y3,z3]]`.
*   A **Mesh** is often treated as a list (array) of these triangles.
*   A **Plane** is efficiently defined by its **normal vector** (a vector perpendicular to the plane's surface) and a scalar distance `d`. This definition follows the equation `N · X = d`, where `N` is the normal vector, `X` is any point `[x,y,z]` on the plane, and `·` denotes the dot product. The value `d` represents the distance from the origin to the plane along its normal vector. The structure is typically `{ normal: [nx,ny,nz], d: number }`.

## Core Capabilities of the MeshBitByBit Class

This class focuses on geometric calculations involving triangles, planes, and their interactions. Here's a high-level look. For precise input parameters (like DTOs) and detailed algorithms, please refer to the [full Mesh Utilities API documentation](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit.html) or the GitHub source linked above.

### 1. Plane and Triangle Geometry

Basic calculations related to planes and individual triangles:
*   **Signed Distance to Plane (`signedDistanceToPlane()`):** Calculate the shortest distance from a given point to a defined plane (`N · X = d`). The "signed" part means the result will be positive if the point is on one side of the plane (in the direction of `N`) and negative if it's on the other. It's calculated as `N · Point - d`.
*   **Calculate Triangle Plane (`calculateTrianglePlane()`):** Given the three points of a triangle, compute the plane in which that triangle lies. It returns the plane's `normal` vector and its distance `d` (satisfying `N · X = d`). This won't work for degenerate triangles (where points are collinear, resulting in an undefined plane).

### 2. Intersection Operations (Advanced)

Finding where geometric entities cross or meet:
*   **Triangle-Triangle Intersection (`triangleTriangleIntersection()`):**
    *   Determine if two triangles in 3D space intersect.
    *   If they do intersect, this method returns the line segment that represents their intersection.
    *   It handles various geometric configurations and uses a tolerance to manage floating-point precision. It's important to note that this function is designed to find a *segment* of intersection, and may not explicitly handle cases where triangles are coplanar and overlap over an area.
*   **Mesh-Mesh Intersection (`meshMeshIntersectionSegments()`, `meshMeshIntersectionPolylines()`, `meshMeshIntersectionPoints()`):**
    *   These methods find the intersections between two entire meshes (collections of triangles).
    *   `meshMeshIntersectionSegments()`: First, it checks every triangle from the first mesh against every triangle from the second mesh using `triangleTriangleIntersection()`. This results in a collection of individual line segments where any pair of triangles intersect.
    *   `meshMeshIntersectionPolylines()`: Takes the raw intersection segments generated above and attempts to connect them end-to-end (using the `Polyline.sortSegmentsIntoPolylines()` utility) to form continuous polylines representing the intersection curves between the two meshes.
    *   `meshMeshIntersectionPoints()`: Further processes the intersection polylines to provide a list of point lists, suitable for drawing or further analysis. For closed polylines, the first point is repeated at the end to close the loop visually.

## Important Considerations

*   **Tolerance:** Many of these geometric calculations, especially intersections, rely on a `tolerance` value. This small number helps account for the inevitable tiny inaccuracies that occur with floating-point arithmetic. Choosing an appropriate tolerance is important for getting reliable results.
*   **Computational Cost:** Mesh-mesh intersection, in particular, can be computationally intensive because it potentially compares every triangle of one mesh with every triangle of the other. For very large meshes, this can take time.
*   **Focus on Fundamentals:** These methods provide building blocks. For instance, the `triangleTriangleIntersection` is a core part of the more complex `meshMeshIntersection`.
