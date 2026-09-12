import { BitbybitOcctModule, TopoDS_Vertex, TopoDS_Shape, TopoDS_Compound } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

/**
 * Vertices in OpenCascade: the kernel's own form of a point, the corner where edges meet. Plain
 * `[x, y, z]` points are what the rest of the library works with, so the methods here mostly
 * convert between the two: make vertices from points, read points back out of vertices, list the
 * vertices of any shape, and project points onto a shape.
 */
export class OCCTVertex {

    constructor(
        _occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Makes a vertex from x, y and z values.
     * @param inputs - The three coordinates
     * @returns The vertex
     * @group from
     * @shortname vertex from xyz
     * @drawable true
     * @example
     * ```typescript
     * const vertex = await bitbybit.occt.shapes.vertex.vertexFromXYZ({ x: 1, y: 2, z: 3 });
     * ```
     */
    vertexFromXYZ(inputs: Inputs.OCCT.XYZDto): TopoDS_Vertex {
        return this.och.verticesService.vertexFromXYZ(inputs);
    }

    /**
     * Makes a vertex, the kernel's own point, from a plain `[x, y, z]` point.
     * @param inputs - The point as `[x, y, z]`
     * @returns The vertex
     * @group from
     * @shortname vertex from point
     * @drawable true
     * @example
     * ```typescript
     * const vertex = await bitbybit.occt.shapes.vertex.vertexFromPoint({ point: [1, 2, 3] });
     * ```
     */
    vertexFromPoint(inputs: Inputs.OCCT.PointDto): TopoDS_Vertex {
        return this.och.verticesService.vertexFromPoint(inputs);
    }

    /**
     * Makes one vertex, the kernel's own point, for each plain `[x, y, z]` point.
     * @param inputs - The points
     * @returns One vertex per point, in the same order
     * @group from
     * @shortname vertices from points
     * @drawable true
     * @example
     * ```typescript
     * const vertices = await bitbybit.occt.shapes.vertex.verticesFromPoints({ points: [[0, 0, 0], [1, 0, 0]] });
     * ```
     */
    verticesFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Vertex[] {
        return this.och.verticesService.verticesFromPoints(inputs);
    }

    /**
     * Makes one vertex per point and bundles them into a single compound, so a whole point cloud
     * can be drawn or transformed as one shape.
     * @param inputs - The points
     * @returns A compound holding one vertex per point
     * @group from
     * @shortname compound vertices from points
     * @drawable true
     * @example
     * ```typescript
     * const cloud = await bitbybit.occt.shapes.vertex.verticesCompoundFromPoints({ points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]] });
     * ```
     */
    verticesCompoundFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Compound {
        return this.och.verticesService.verticesCompoundFromPoints(inputs);
    }

    /**
     * Lists every vertex of a shape as the kernel walks it.
     *
     * A vertex is repeated for every face and edge that use it, so a box lists 48 vertices rather
     * than its 8 corners; use `getVerticesAsPoints` with `point.removeAllDuplicateVectors` for
     * unique corners.
     * @param inputs - The shape
     * @returns The vertices found in the shape
     * @group get
     * @shortname get vertices from shape
     * @drawable true
     * @example
     * ```typescript
     * const corners = await bitbybit.occt.shapes.vertex.getVertices({ shape: box });
     * ```
     */
    getVertices(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Vertex[] {
        return this.och.verticesService.getVertices(inputs);
    }

    /**
     * Lists every vertex of a shape as a plain `[x, y, z]` point, as the kernel walks it.
     *
     * A vertex is repeated for every face and edge that use it, so a box lists 48 points rather
     * than its 8 corners; `point.removeAllDuplicateVectors` reduces them to the unique ones.
     * @param inputs - The shape
     * @returns The points of the vertices
     * @group get
     * @shortname get vertices as points
     * @drawable true
     * @example
     * ```typescript
     * const corners = await bitbybit.occt.shapes.vertex.getVerticesAsPoints({ shape: box });
     * ```
     */
    getVerticesAsPoints(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.verticesService.getVerticesAsPoints(inputs);
    }

    /**
     * Reads the coordinates of each vertex as a plain `[x, y, z]` point.
     * @param inputs - The vertices
     * @returns One point per vertex, in the same order
     * @group transform
     * @shortname vertices to points
     * @drawable true
     * @example
     * ```typescript
     * const points = await bitbybit.occt.shapes.vertex.verticesToPoints({ shapes: vertices });
     * ```
     */
    verticesToPoints(inputs: Inputs.OCCT.ShapesDto<TopoDS_Vertex>): Inputs.Base.Point3[] {
        return this.och.verticesService.verticesToPoints(inputs);
    }

    /**
     * Reads the coordinates of a vertex as a plain `[x, y, z]` point.
     * @param inputs - The vertex
     * @returns The point
     * @group transform
     * @shortname vertex to point
     * @drawable true
     * @example
     * ```typescript
     * const point = await bitbybit.occt.shapes.vertex.vertexToPoint({ shape: vertex });
     * ```
     */
    vertexToPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Vertex>): Inputs.Base.Point3 {
        return this.och.verticesService.vertexToPoint(inputs);
    }

    /**
     * Projects points onto a shape along a direction and gives the points where they land.
     *
     * Each point travels along `direction` for exactly that vector's length, so it must be long
     * enough to reach the shape. Where the path crosses the shape more than once, `projectionType`
     * keeps the closest hit, the furthest, both or all; a path that misses gives nothing.
     * @param inputs - The points, the shape, the direction with its length, and which hits to keep
     * @returns The projected points
     * @group place
     * @shortname project points
     * @drawable true
     * @example
     * ```typescript
     * const onGround = await bitbybit.occt.shapes.vertex.projectPoints({
     *     points: [[0, 10, 0], [1, 10, 0]],
     *     shape: terrain,
     *     direction: [0, -20, 0],
     *     projectionType: Bit.Inputs.OCCT.pointProjectionTypeEnum.closest,
     * });
     * ```
     */
    projectPoints(inputs: Inputs.OCCT.ProjectPointsOnShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.verticesService.projectPoints(inputs);
    }
}
