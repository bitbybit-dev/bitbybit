---
title: Mesh Utilities
sidebar_label: Mesh Utilities
description: How bitbybit.mesh works on plain triangle meshes - the plane of a triangle, signed distances, where triangles and meshes cut each other, enclosed volume and turning a flat polygon with holes into triangles.
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
- A **plane** is `{ normal: [nx,ny,nz], d }`: a unit normal and the plane's distance from the origin along that normal. A point `X` lies on the plane when `normal · X = d`.

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
| [`meshMeshIntersectionPoints`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#meshMeshIntersectionPoints) | Finds where the surfaces of two meshes cut through each other, as one list of points per curve. |
| [`meshMeshIntersectionPolylines`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#meshMeshIntersectionPolylines) | Finds where the surfaces of two meshes cut through each other and joins the pieces into polylines, closed where the curve loops. |
| [`meshMeshIntersectionSegments`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#meshMeshIntersectionSegments) | Finds every segment where the surfaces of two meshes cut through each other, testing each triangle of one against each triangle of the other. |
| [`signedDistanceToPlane`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#signedDistanceToPlane) | Measures how far a point is from a plane, with a sign: positive on the side the normal points to, negative on the other. |
| [`signedVolume`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#signedVolume) | Measures the volume a closed triangle mesh encloses, with a sign: positive when its triangles face outwards by the right-hand rule, negative when they all face inwards. |
| [`triangleTriangleIntersection`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#triangleTriangleIntersection) | Finds the segment where two triangles cut through each other. |
| [`triangulatePolygon`](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit#triangulatePolygon) | Cuts a flat polygon, with any holes through it, into triangles. |

{/* api:mesh:end */}
