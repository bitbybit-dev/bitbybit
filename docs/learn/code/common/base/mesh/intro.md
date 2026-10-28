---
title: Mesh Utilities
sidebar_label: Mesh Utilities
description: How bitbybit.mesh works on plain triangle meshes - lists of triangles and indexed meshes, spheres and cones to start from, smooth and creased normals, inside and collision tests, mending the winding, the plane of a triangle, signed distances, where meshes cut each other, enclosed volume and triangulating a flat polygon with holes.
topic: code.base.mesh
type: explanation
tags: [code, mesh]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/mesh-icon.svg" 
  alt="Mesh category icon" 
  title="Mesh category icon"/> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/mesh.ts)

`bitbybit.mesh` works on plain triangle meshes. It needs no CAD kernel, so it runs on any triangulated data: a mesh you built point by point, or one taken from a shape.

## How a mesh is written

- A **triangle** is a list of three points: `[[x1,y1,z1], [x2,y2,z2], [x3,y3,z3]]`.
- A **mesh** is a list of triangles.
- An **indexed mesh** `{ positions, indices, normals }` stores each point once, the layout glTF and the game engines draw. `positions` holds x, y and z for each point in turn, `indices` three point numbers per triangle, counted from 0, and `normals`, when present, one direction per point. Triangles that share a corner share its number, which is how the mesh knows its neighbours.
- A **plane** is `{ normal: [nx,ny,nz], d }`: a unit normal and the plane's distance from the origin along that normal. A point `X` lies on the plane when `normal · X = d`.

`toIndexed` turns a list of triangles into an indexed mesh, joining corners that agree within `tolerance` (default `1e-7`) in every coordinate, so two triangles that share an edge give 4 points and 6 indices. `fromIndexed` writes the triangles out again as lists of points; it leaves any normals behind, since a list of triangles has no place for them. The functions below say which of the two forms they take.

## Meshes to start from

Both give a closed list of triangles, facing outward.

- `icosphere` makes a sphere from an icosahedron whose triangles are split in four `detail` times: 0 gives 20 triangles, the default 2 gives 320, and 6, the most, gives 81,920. Its triangles stay close to equal in size everywhere, which a sphere made of latitude and longitude bands does not manage near its poles.
- `frustum` makes a cone, a cylinder or a cone with its tip cut off, with flat ends. It stands on `center` and rises along `direction` by `height`, with `sides` flat faces around, at least 3. A `topRadius` of 0 makes a cone and one equal to `bottomRadius` a cylinder.

## Normals and shading

A renderer shades a mesh by its normals, the direction the surface faces at each point. Both functions take an indexed mesh and give it normals, one per point:

- `smoothNormals` gives each point the sum of the directions of the triangles around it, a large triangle counting for more than a sliver, so the mesh shades without visible facets. The points and triangles stay as they are. That suits a curved surface and softens a box's edges into a blur.
- `creasedNormals` keeps sharp edges sharp. Where neighbouring triangles turn from each other by more than `angle`, 30 degrees by default, the point between them is split into one copy per side, so a box keeps its hard edges while the side of a cylinder shades smoothly: a cube welded into 8 points comes back with 24, 4 per face. An `angle` of 0 shades every triangle flat and 180 smooths across every edge.

To shade an `icosphere` smoothly, turn it into an indexed mesh with `toIndexed` first.

## Inside, near and touching

These take lists of triangles.

- `isPointInside` tells whether a point lies inside a closed mesh: rays from the point in three directions count the triangles they cross, and an odd count for most of them means inside, so `[0.5, 0.5, 0.5]` lies inside a unit cube. A mesh that is not closed has no inside, and the answer means nothing.
- `meshesWithin` tells whether two meshes come within `distance` of each other, touching and crossing included, as a quick collision test; the default `distance` of 0 asks whether they touch or cross. It stops at the first triangles close enough, and a mesh, or a separate piece of one, lying wholly inside a closed one counts too. Two unit cubes half a unit apart are within 0.6 of each other and not within 0.4.

## Mending the winding

The order of a triangle's corners, its winding, decides which side is its front by the right-hand rule. A mesh read from a file or stitched from several sources sometimes has triangles wound the wrong way, which shows as holes in the shading and spoils the volume `signedVolume` measures. Both take an indexed mesh:

- `windingPieces` splits the mesh into its connected pieces, triangles that share an edge, and says for each triangle which piece it belongs to (`pieces`) and whether it winds against the first triangle of its piece (`turnOver`); `count` is the number of pieces. An edge that more than two triangles share is not followed, so two separate triangles are two pieces.
- `orientConsistently` turns those triangles over. Each piece keeps the winding most of its area has, so a few triangles written inside out are mended, and a piece wound inward on purpose stays as it is: a cube with one face inside out comes back with every face outward.

## Planes and distances

- `calculateTrianglePlane` gives the plane a triangle lies in. The normal follows the right-hand rule around the triangle's points, so `[[0,0,0], [1,0,0], [0,1,0]]` gives `{ normal: [0,0,1], d: 0 }`. A triangle with no area, whose points are on one line, has no plane and gives `undefined`; `tolerance` (default `1e-7`) sets how short the normal may be before the triangle counts as having no area.
- `signedDistanceToPlane` measures how far a point is from a plane, as `normal · point - d`: positive on the side the normal points to, negative on the other.

## Where triangles and meshes cut each other

- `triangleTriangleIntersection` gives the segment where two triangles cut through each other. Triangles that do not touch, are parallel, or lie in the same plane give `undefined`, so two coplanar triangles that overlap over an area give no result.
- `meshMeshIntersectionSegments` tests every triangle of one mesh against every triangle of the other and lists each segment found.
- `meshMeshIntersectionPolylines` joins those segments end to end into polylines, closed where the curve loops.
- `meshMeshIntersectionPoints` gives the same curves as lists of points. A closed curve repeats its first point at the end, so the loop is explicit when you draw it.

Each of these takes a `tolerance` (default `1e-7`, in model units): distances below it count as zero when deciding whether triangles touch and when joining segment ends. Comparing every triangle with every other takes time on large meshes.

## Volume and triangulation

- `signedVolume` measures the volume a closed mesh encloses. It is positive when the triangles face outwards by the right-hand rule and negative when they all face inwards. A mesh that is not closed has no inside, and the number means nothing.
- `triangulatePolygon` cuts a flat polygon, with any holes through it, into triangles. Every corner of the outline stays a corner of a triangle, so neighbouring polygons that share an edge give a mesh closed along it. The triangles face the way the outline turns; holes may run either way.

## Every function

{/* api:mesh:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`calculateTrianglePlane`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#calculateTrianglePlane) | Finds the plane a triangle lies in: its unit normal and its distance from the origin along that normal. |
| [`creasedNormals`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#creasedNormals) | Gives an indexed mesh normals that keep its sharp edges sharp and smooth the rest. |
| [`fromIndexed`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#fromIndexed) | Turns an indexed mesh back into a list of triangles, each written out as its three points. |
| [`frustum`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#frustum) | Makes a cone, a cylinder or a cone with its tip cut off, as a closed triangulated mesh. |
| [`icosphere`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#icosphere) | Makes a sphere as an evenly triangulated mesh, the icosahedron split `detail` times. |
| [`isPointInside`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#isPointInside) | Tells whether a point lies inside a closed triangle mesh. |
| [`meshesWithin`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#meshesWithin) | Tells whether two triangle meshes come within a distance of each other, touching and crossing included, as a quick collision test. |
| [`meshMeshIntersectionPoints`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#meshMeshIntersectionPoints) | Finds where the surfaces of two meshes cut through each other, as one list of points per curve. |
| [`meshMeshIntersectionPolylines`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#meshMeshIntersectionPolylines) | Finds where the surfaces of two meshes cut through each other and joins the pieces into polylines, closed where the curve loops. |
| [`meshMeshIntersectionSegments`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#meshMeshIntersectionSegments) | Finds every segment where the surfaces of two meshes cut through each other, testing each triangle of one against each triangle of the other. |
| [`orientConsistently`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#orientConsistently) | Turns over the triangles of an indexed mesh that wind against the rest of their piece. |
| [`signedDistanceToPlane`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#signedDistanceToPlane) | Measures how far a point is from a plane, with a sign: positive on the side the normal points to, negative on the other. |
| [`signedVolume`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#signedVolume) | Measures the volume a closed triangle mesh encloses, with a sign: positive when its triangles face outwards by the right-hand rule, negative when they all face inwards. |
| [`smoothNormals`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#smoothNormals) | Gives an indexed mesh smooth normals, one per point, so it shades without visible facets. |
| [`toIndexed`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#toIndexed) | Turns a list of triangles into an indexed mesh, which stores each point once. |
| [`triangleTriangleIntersection`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#triangleTriangleIntersection) | Finds the segment where two triangles cut through each other. |
| [`triangulatePolygon`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#triangulatePolygon) | Cuts a flat polygon, with any holes through it, into triangles. |
| [`windingPieces`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#windingPieces) | Splits an indexed mesh into its connected pieces and finds the triangles that wind against the first triangle of their piece. |

{/* api:mesh:end */}
