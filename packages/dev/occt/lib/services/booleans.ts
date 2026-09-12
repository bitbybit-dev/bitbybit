import { BitbybitOcctModule, TopoDS_Shape,TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";

/**
 * Combining OpenCascade shapes with each other: union fuses them into one, difference cuts one away
 * from another, intersection keeps only what they share. These work on the exact geometry and give
 * exact results. The mesh intersection methods instead triangulate the shapes and intersect the
 * triangles, which is faster and more robust on awkward geometry but gives polylines rather than
 * curves. Every method returns a new shape; unless `keepEdges` is set, faces that end up lying on
 * one surface are merged and the seams between them removed.
 */
export class OCCTBooleans {

    constructor(
        _occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Fuses several shapes into one, the way two overlapping blobs of clay become one lump.
     *
     * The shapes are fused one after another in list order. With `keepEdges` false, the default,
     * faces that end up on one surface are merged and the seams removed; true keeps every edge of
     * the inputs.
     * @param inputs - The shapes to fuse and whether to keep the seam edges
     * @returns The fused shape
     * @group booleans
     * @shortname union
     * @drawable true
     * @example
     * ```typescript
     * const fused = await bitbybit.occt.booleans.union({ shapes: [box, cylinder], keepEdges: false });
     * ```
     */
    union(inputs: Inputs.OCCT.UnionDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.booleansService.union(inputs);
    }

    /**
     * Cuts shapes away from a main shape, the way a drill removes material: what remains is the
     * main shape minus every shape in the list.
     *
     * The shapes are subtracted one after another. With `keepEdges` false, the default, faces left
     * on one surface are merged; when exactly one solid remains it is returned on its own rather
     * than inside a compound.
     * @param inputs - The main shape, the shapes to subtract and whether to keep the seam edges
     * @returns What is left of the main shape
     * @group booleans
     * @shortname difference
     * @drawable true
     * @example
     * ```typescript
     * const holed = await bitbybit.occt.booleans.difference({ shape: box, shapes: [cylinder], keepEdges: false });
     * ```
     */
    difference(inputs: Inputs.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.booleansService.difference(inputs);
    }

    /**
     * Keeps only the volume the first shape shares with each of the others.
     *
     * The first shape is intersected with every other shape one at a time and the pieces come back
     * in one compound: with three shapes you get the overlap of the first with the second and with
     * the third, not of all three. Fewer than two shapes throw.
     * @param inputs - The shapes, the first being the one intersected with the rest, and whether to keep the seam edges
     * @returns A compound of the shared parts
     * @group booleans
     * @shortname intersection
     * @drawable true
     * @example
     * ```typescript
     * const common = await bitbybit.occt.booleans.intersection({ shapes: [box, sphere], keepEdges: false });
     * ```
     */
    intersection(inputs: Inputs.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape {
        const int = this.och.booleansService.intersection(inputs);
        const res = this.och.converterService.makeCompound({ shapes: int });
        return res;
    }

    /**
     * Finds where the surfaces of two shapes cross by triangulating both and intersecting the
     * triangles, and returns the crossing lines as wires.
     *
     * Each shape has its own meshing precision: a smaller value follows curved surfaces more
     * closely and takes longer. The wires are polylines, so they trace the crossing approximately;
     * the exact curves come from `intersection` with faces.
     * @param inputs - The two shapes and their meshing precisions
     * @returns The crossing lines as polyline wires
     * @group mesh based
     * @shortname mesh mesh intersection as wires
     * @drawable true
     * @example
     * ```typescript
     * const seams = await bitbybit.occt.booleans.meshMeshIntersectionWires({ shape1: sphere, shape2: box, precision1: 0.01, precision2: 0.01 });
     * ```
     */
    meshMeshIntersectionWires(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        return this.och.meshingService.meshMeshIntersectionWires(inputs);
    }

    /**
     * Finds where the surfaces of two shapes cross by triangulating both and intersecting the
     * triangles, and returns the crossing lines as lists of points.
     *
     * Each shape has its own meshing precision: a smaller value follows curved surfaces more
     * closely and takes longer. Each list of points is one crossing line, in order along it.
     * @param inputs - The two shapes and their meshing precisions
     * @returns One list of points per crossing line
     * @group mesh based
     * @shortname mesh mesh intersection as points
     * @drawable true
     * @example
     * ```typescript
     * const lines = await bitbybit.occt.booleans.meshMeshIntersectionPoints({ shape1: sphere, shape2: box, precision1: 0.01, precision2: 0.01 });
     * ```
     */
    meshMeshIntersectionPoints(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.meshingService.meshMeshIntersectionPoints(inputs);
    }

    /**
     * Finds where the surface of one shape crosses the surfaces of several others by triangulating
     * them all and intersecting the triangles, and returns the crossing lines as wires.
     *
     * `precision` meshes the main shape and `precisionShapes` gives one precision per other shape;
     * smaller values follow curves more closely and take longer.
     * @param inputs - The main shape, the other shapes and the meshing precisions
     * @returns The crossing lines as polyline wires, for all the shapes together
     * @group mesh based
     * @shortname mesh mesh intersection of shapes as wires
     * @drawable true
     * @example
     * ```typescript
     * const seams = await bitbybit.occt.booleans.meshMeshIntersectionOfShapesWires({ shape: sphere, shapes: [box, cylinder], precision: 0.01, precisionShapes: [0.01, 0.01] });
     * ```
     */
    meshMeshIntersectionOfShapesWires(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        return this.och.meshingService.meshMeshIntersectionOfShapesWires(inputs);
    }

    /**
     * Finds where the surface of one shape crosses the surfaces of several others by triangulating
     * them all and intersecting the triangles, and returns the crossing lines as lists of points.
     *
     * `precision` meshes the main shape and `precisionShapes` gives one precision per other shape;
     * each list of points is one crossing line, in order along it.
     * @param inputs - The main shape, the other shapes and the meshing precisions
     * @returns One list of points per crossing line, for all the shapes together
     * @group mesh based
     * @shortname mesh mesh intersection of shapes as points
     * @drawable true
     * @example
     * ```typescript
     * const lines = await bitbybit.occt.booleans.meshMeshIntersectionOfShapesPoints({ shape: sphere, shapes: [box, cylinder], precision: 0.01, precisionShapes: [0.01, 0.01] });
     * ```
     */
    meshMeshIntersectionOfShapesPoints(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.meshingService.meshMeshIntersectionOfShapesPoints(inputs);
    }



}
