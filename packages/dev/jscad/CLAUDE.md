# CLAUDE.md - `@bitbybit-dev/jscad`

The JSCAD kernel wrapper. Shared package conventions are one level up in `packages/dev/CLAUDE.md`.

JSCAD hands out plain JavaScript data and keeps transforms as matrices beside it, rather than applying
them to points. Most of what follows comes from that.

**Shape kind is carried by structure, not by a tag.** A 2D region (`geom2`) has `sides`, a 3D solid
(`geom3`) has `polygons`, a path has neither. The checks are written as TypeScript type predicates so
the test and the narrowing it justifies are one statement. The published input type is the union of all
three, because a script may pass any of them; the kernel's own operations are overloaded per kind and
reject a mixture, so `entity-narrowing.ts` holds the casts and the per-kind refusals in one place
rather than scattering them through every service.

**A shape carries exactly one flat 4x4 matrix.** Converting geometry out of JSCAD therefore means
leaving a world where position is points-plus-matrix for one where it is points alone, and the matrix
has to be baked into the points on the way. Skip that and geometry emerges at its untransformed
position, which looks correct for anything that was never moved. There is only ever one matrix; there
is no list form to support.

**Flat geometry has no faces**, so anything flat is extruded by **0.001** before it can be meshed. That
number is not a tolerance and not a precision - it is an arbitrary invisible thickness. Remove it and
you get an empty mesh; enlarge it and 2D drawings look like thin slabs.

**`shapeToMesh` computes the normals its type declares.** They are calculated where the mesh is built,
so the mesh data means the same thing to every consumer. The implementation is `computeVertexNormals`
in `base`, because the shared draw helper needs it too and neither package may import the other. A
renderer receiving mesh data over a worker still checks the normals are present: that payload arrives
as plain data with no type behind it.

**`JSCADPolygon.createFromCurve` is `@deprecated`.** Converting between two CAD kernels does not belong
in a package dedicated to one of them, and verb's own removal in the next major takes it anyway.
