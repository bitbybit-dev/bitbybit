import { OccHelper } from "../occ-helper";
import { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs";

/**
 * Rounding and beveling the edges of OpenCascade shapes: a fillet replaces a sharp edge with a
 * rounded surface of a given radius, a chamfer with a flat bevel of a given distance. Edges are
 * chosen by 0-based index in the order `shapes.edge.getEdges` lists them, or passed in directly;
 * flat outlines and faces are rounded at their corners with `fillet2d`, which counts corners from
 * 1. A radius that does not fit, for instance larger than a neighbouring face, makes the kernel
 * fail, so start small. Every method returns a new shape.
 */
export class OCCTFillets {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Rounds the edges of a shape with a fillet radius, in model units.
     *
     * Without `indexes` every edge is rounded with `radius`. With `indexes`, counted from 0 in the
     * order `shapes.edge.getEdges` lists them, only those edges are rounded, each with `radius` or
     * the matching entry of `radiusList`, paired with the selected edges in edge order.
     * @param inputs - The shape, the radius or the radius list, and the optional 0-based edge indexes
     * @returns The shape with rounded edges
     * @group 3d fillets
     * @shortname fillet edges
     * @drawable true
     * @example
     * ```typescript
     * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 20, height: 5, center: [0, 0, 0] });
     * const rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 1 });
     * const twoEdges = await bitbybit.occt.fillets.filletEdges({ shape: box, radiusList: [1, 2], indexes: [0, 3] });
     * ```
     */
    filletEdges(inputs: Inputs.OCCT.FilletDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.filletsService.filletEdges(inputs);
    }

    /**
     * Rounds the given edges of a shape, each with its own radius.
     *
     * The edges must belong to the shape; `radiusList` pairs with them by position and must have
     * the same length, or an error is thrown.
     * @param inputs - The shape, its edges to round and one radius per edge
     * @returns The shape with rounded edges
     * @group 3d fillets
     * @shortname fillet edges list
     * @drawable true
     * @example
     * ```typescript
     * const edges = await bitbybit.occt.shapes.edge.getEdges({ shape: box });
     * const rounded = await bitbybit.occt.fillets.filletEdgesList({ shape: box, edges: [edges[0], edges[1]], radiusList: [1, 2] });
     * ```
     */
    filletEdgesList(inputs: Inputs.OCCT.FilletEdgesListDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesList(inputs);
    }

    /**
     * Rounds the given edges of a shape, all with the same radius.
     *
     * The edges must belong to the shape; an empty list throws an error.
     * @param inputs - The shape, its edges to round and the radius
     * @returns The shape with rounded edges
     * @group 3d fillets
     * @shortname fillet edges list one r
     * @drawable true
     * @example
     * ```typescript
     * const edges = await bitbybit.occt.shapes.edge.getEdges({ shape: box });
     * const rounded = await bitbybit.occt.fillets.filletEdgesListOneRadius({ shape: box, edges: [edges[0], edges[1]], radius: 1 });
     * ```
     */
    filletEdgesListOneRadius(inputs: Inputs.OCCT.FilletEdgesListOneRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesListOneRadius(inputs);
    }

    /**
     * Rounds one edge of a shape with a radius that changes along it.
     *
     * `paramsU` are positions along the edge as fractions from 0 at its start to 1 at its end, and
     * `radiusList` gives the radius at each; the kernel blends smoothly between them. The two lists
     * must have the same length, or an error is thrown.
     * @param inputs - The shape, its edge, the radii and the positions along the edge they apply at
     * @returns The shape with the rounded edge
     * @group 3d fillets
     * @shortname fillet edge variable r
     * @drawable true
     * @example
     * ```typescript
     * const edges = await bitbybit.occt.shapes.edge.getEdges({ shape: box });
     * const tapered = await bitbybit.occt.fillets.filletEdgeVariableRadius({ shape: box, edge: edges[0], radiusList: [0.5, 2, 0.5], paramsU: [0, 0.5, 1] });
     * ```
     */
    filletEdgeVariableRadius(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgeVariableRadius(inputs);
    }

    /**
     * Rounds several edges of a shape, each with the same radius profile that changes along it.
     *
     * `paramsU` are positions along each edge as fractions from 0 to 1 and `radiusList` the radius
     * at each; the lists must have the same length, or an error is thrown.
     * @param inputs - The shape, its edges, the radii and the positions along each edge they apply at
     * @returns The shape with the rounded edges
     * @group 3d fillets
     * @shortname fillet edges same variable r
     * @drawable true
     * @example
     * ```typescript
     * const edges = await bitbybit.occt.shapes.edge.getEdges({ shape: box });
     * const tapered = await bitbybit.occt.fillets.filletEdgesSameVariableRadius({ shape: box, edges: [edges[0], edges[2]], radiusList: [0.5, 2, 0.5], paramsU: [0, 0.5, 1] });
     * ```
     */
    filletEdgesSameVariableRadius(inputs: Inputs.OCCT.FilletEdgesSameVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesSameVariableRadius(inputs);
    }

    /**
     * Rounds several edges of a shape, each with its own radius profile that changes along it.
     *
     * `radiusLists` and `paramsULists` hold one list per edge, in edge order; within each pair the
     * positions are fractions from 0 to 1 along the edge and the radii apply there. All three lists
     * must have the same length, or an error is thrown.
     * @param inputs - The shape, its edges, one radius list per edge and one position list per edge
     * @returns The shape with the rounded edges
     * @group 3d fillets
     * @shortname fillet edges variable r
     * @drawable true
     * @example
     * ```typescript
     * const edges = await bitbybit.occt.shapes.edge.getEdges({ shape: box });
     * const tapered = await bitbybit.occt.fillets.filletEdgesVariableRadius({
     *     shape: box,
     *     edges: [edges[0], edges[2]],
     *     radiusLists: [[0.5, 2], [2, 0.5]],
     *     paramsULists: [[0, 1], [0, 1]],
     * });
     * ```
     */
    filletEdgesVariableRadius(inputs: Inputs.OCCT.FilletEdgesVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesVariableRadius(inputs);
    }

    /**
     * Rounds the corners of a wire that does not lie in one plane.
     *
     * The kernel has no direct 3D wire fillet, so the wire is extruded along `direction` into a
     * shell, the shell is filleted and the rounded wire is read back off it; `direction` must not
     * be parallel to the wire and must leave room for the fillets.
     * @param inputs - The wire, the radius or radius list, the optional 0-based corner indexes and the extrusion direction
     * @returns The rounded wire
     * @group 3d fillets
     * @shortname fillet 3d wire
     * @drawable true
     * @example
     * ```typescript
     * const rounded = await bitbybit.occt.fillets.fillet3DWire({ shape: zigzagWire, radius: 0.5, direction: [0, 5, 0] });
     * ```
     */
    fillet3DWire(inputs: Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.filletsService.fillet3DWire(inputs);
    }

    /**
     * Rounds the corners of several wires that do not lie in one plane, as `fillet3DWire` does for
     * one, with the same radius, indexes and direction for all.
     * @param inputs - The wires, the radius or radius list, the optional corner indexes and the extrusion direction
     * @returns The rounded wires, in the same order
     * @group 3d fillets
     * @shortname fillet 3d wires
     * @drawable true
     * @example
     * ```typescript
     * const rounded = await bitbybit.occt.fillets.fillet3DWires({ shapes: [wireA, wireB], radius: 0.5, direction: [0, 5, 0] });
     * ```
     */
    fillet3DWires(inputs: Inputs.OCCT.Fillet3DWiresDto<TopoDS_Wire>): TopoDS_Shape[] {
        return inputs.shapes.map(shape => this.och.filletsService.fillet3DWire({
            shape,
            radius: inputs.radius,
            radiusList: inputs.radiusList,
            indexes: inputs.indexes,
            direction: inputs.direction
        }));
    }

    /**
     * Bevels the edges of a shape by a distance, in model units, cutting each sharp edge back to a
     * flat strip.
     *
     * Without `indexes` every edge is beveled with `distance`. With `indexes`, counted from 0 in
     * the order `shapes.edge.getEdges` lists them, only those edges are beveled, each with
     * `distance` or the matching entry of `distanceList`, in edge order.
     * @param inputs - The shape, the distance or the distance list, and the optional 0-based edge indexes
     * @returns The shape with beveled edges
     * @group 3d chamfers
     * @shortname chamfer edges
     * @drawable true
     * @example
     * ```typescript
     * const beveled = await bitbybit.occt.fillets.chamferEdges({ shape: box, distance: 1 });
     * ```
     */
    chamferEdges(inputs: Inputs.OCCT.ChamferDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.filletsService.chamferEdges(inputs);
    }

    /**
     * Bevels the given edges of a shape, each by its own distance.
     *
     * The edges must belong to the shape; `distanceList` pairs with them by position and must have
     * the same length, or an error is thrown.
     * @param inputs - The shape, its edges to bevel and one distance per edge
     * @returns The shape with beveled edges
     * @group 3d chamfers
     * @shortname chamfer edges list
     * @drawable true
     * @example
     * ```typescript
     * const edges = await bitbybit.occt.shapes.edge.getEdges({ shape: box });
     * const beveled = await bitbybit.occt.fillets.chamferEdgesList({ shape: box, edges: [edges[0], edges[1]], distanceList: [1, 2] });
     * ```
     */
    chamferEdgesList(inputs: Inputs.OCCT.ChamferEdgesListDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesList(inputs);
    }

    /**
     * Bevels one edge of a shape with an uneven chamfer: `distance1` is measured on `face`, one of
     * the two faces meeting at the edge, and `distance2` on the other.
     *
     * The face decides which side gets which distance; swap them to flip the bevel.
     * @param inputs - The shape, the edge, the face the first distance applies to, and the two distances
     * @returns The shape with the beveled edge
     * @group 3d chamfers
     * @shortname chamfer edge 2 dist
     * @drawable true
     * @example
     * ```typescript
     * const edges = await bitbybit.occt.shapes.edge.getEdges({ shape: box });
     * const faces = await bitbybit.occt.shapes.face.getFaces({ shape: box });
     * const beveled = await bitbybit.occt.fillets.chamferEdgeTwoDistances({ shape: box, edge: edges[0], face: faces[0], distance1: 1, distance2: 2 });
     * ```
     */
    chamferEdgeTwoDistances(inputs: Inputs.OCCT.ChamferEdgeTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgeTwoDistances(inputs);
    }

    /**
     * Bevels several edges of a shape with the same uneven chamfer: `distance1` is measured on each
     * edge's paired face and `distance2` on the other face.
     *
     * `faces` pairs with `edges` by position and must have the same length, or an error is thrown.
     * @param inputs - The shape, the edges, one paired face per edge, and the two distances
     * @returns The shape with beveled edges
     * @group 3d chamfers
     * @shortname chamfer edges 2 dist
     * @drawable true
     * @example
     * ```typescript
     * const beveled = await bitbybit.occt.fillets.chamferEdgesTwoDistances({ shape: box, edges: [edges[0], edges[1]], faces: [faces[0], faces[0]], distance1: 1, distance2: 2 });
     * ```
     */
    chamferEdgesTwoDistances(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesTwoDistances(inputs);
    }

    /**
     * Bevels several edges of a shape, each with its own uneven chamfer: for each edge `distances1`
     * is measured on its paired face and `distances2` on the other face.
     *
     * `faces`, `distances1` and `distances2` pair with `edges` by position and must all have the
     * same length, or an error is thrown.
     * @param inputs - The shape, the edges, one paired face per edge, and the two distance lists
     * @returns The shape with beveled edges
     * @group 3d chamfers
     * @shortname chamfer edges 2 dist lists
     * @drawable true
     * @example
     * ```typescript
     * const beveled = await bitbybit.occt.fillets.chamferEdgesTwoDistancesLists({
     *     shape: box,
     *     edges: [edges[0], edges[1]],
     *     faces: [faces[0], faces[0]],
     *     distances1: [1, 0.5],
     *     distances2: [2, 1],
     * });
     * ```
     */
    chamferEdgesTwoDistancesLists(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesListsDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesTwoDistancesLists(inputs);
    }

    /**
     * Bevels one edge of a shape by a distance measured on `face` and an angle in degrees from that
     * face.
     *
     * The bevel starts `distance` away from the edge on the given face and leaves it at `angle`; 45
     * degrees gives an even chamfer.
     * @param inputs - The shape, the edge, the face the distance is measured on, the distance and the angle
     * @returns The shape with the beveled edge
     * @group 3d chamfers
     * @shortname chamfer edge angle
     * @drawable true
     * @example
     * ```typescript
     * const beveled = await bitbybit.occt.fillets.chamferEdgeDistAngle({ shape: box, edge: edges[0], face: faces[0], distance: 1, angle: 30 });
     * ```
     */
    chamferEdgeDistAngle(inputs: Inputs.OCCT.ChamferEdgeDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgeDistAngle(inputs);
    }

    /**
     * Bevels several edges of a shape by the same distance and angle, the distance measured on each
     * edge's paired face and the angle in degrees from it.
     *
     * `faces` pairs with `edges` by position and must have the same length, or an error is thrown.
     * @param inputs - The shape, the edges, one paired face per edge, the distance and the angle
     * @returns The shape with beveled edges
     * @group 3d chamfers
     * @shortname chamfer edges angle
     * @drawable true
     * @example
     * ```typescript
     * const beveled = await bitbybit.occt.fillets.chamferEdgesDistAngle({ shape: box, edges: [edges[0], edges[1]], faces: [faces[0], faces[0]], distance: 1, angle: 30 });
     * ```
     */
    chamferEdgesDistAngle(inputs: Inputs.OCCT.ChamferEdgesDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesDistAngle(inputs);
    }

    /**
     * Bevels several edges of a shape, each by its own distance and angle, the distance measured on
     * the edge's paired face and the angle in degrees from it.
     *
     * `faces`, `distances` and `angles` pair with `edges` by position and must all have the same
     * length, or an error is thrown.
     * @param inputs - The shape, the edges, one paired face per edge, the distances and the angles
     * @returns The shape with beveled edges
     * @group 3d chamfers
     * @shortname chamfer edges angles
     * @drawable true
     * @example
     * ```typescript
     * const beveled = await bitbybit.occt.fillets.chamferEdgesDistsAngles({
     *     shape: box,
     *     edges: [edges[0], edges[1]],
     *     faces: [faces[0], faces[0]],
     *     distances: [1, 0.5],
     *     angles: [30, 60],
     * });
     * ```
     */
    chamferEdgesDistsAngles(inputs: Inputs.OCCT.ChamferEdgesDistsAnglesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesDistsAngles(inputs);
    }

    /**
     * Rounds the corners of a flat wire or face with arcs of a given radius.
     *
     * Without `indexes` every corner is rounded with `radius`. With `indexes`, counted from 1 along
     * the outline, only those corners are rounded, each with `radius` or the matching entry of
     * `radiusList`, as long as `indexes`. Wires with free-form edges use `fillet3DWire`.
     * @param inputs - The flat wire or face, the radius or radius list, and the optional 1-based corner indexes
     * @returns The rounded wire or face
     * @group 2d fillets
     * @shortname fillet 2d wire or face
     * @drawable true
     * @example
     * ```typescript
     * const rectangle = await bitbybit.occt.shapes.wire.createRectangleWire({ width: 10, length: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * const rounded = await bitbybit.occt.fillets.fillet2d({ shape: rectangle, radius: 1 });
     * const twoCorners = await bitbybit.occt.fillets.fillet2d({ shape: rectangle, radiusList: [1, 2], indexes: [1, 3] });
     * ```
     */
    fillet2d(inputs: Inputs.OCCT.FilletDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        return this.och.filletsService.fillet2d(inputs);
    }

    /**
     * Rounds the corners of several flat wires or faces, as `fillet2d` does for one, with the same
     * radius and corner indexes for all.
     * @param inputs - The flat wires or faces, the radius or radius list, and the optional 1-based corner indexes
     * @returns The rounded wires or faces, in the same order
     * @group 2d fillets
     * @shortname fillet 2d wires or faces
     * @drawable true
     * @example
     * ```typescript
     * const rounded = await bitbybit.occt.fillets.fillet2dShapes({ shapes: [rectangleA, rectangleB], radius: 1 });
     * ```
     */
    fillet2dShapes(inputs: Inputs.OCCT.FilletShapesDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face[] | TopoDS_Wire[] {
        return inputs.shapes.map(shape => this.och.filletsService.fillet2d({
            shape,
            radius: inputs.radius,
            radiusList: inputs.radiusList,
            indexes: inputs.indexes
        }));
    }

    /**
     * Joins two edges that lie in one plane with a rounding arc of the given radius, trimming the
     * edges to meet it, and returns the three pieces as one wire.
     *
     * The plane is given by `planeOrigin` and `planeDirection`, its normal. When several arcs fit,
     * `solution` picks one by index; -1 takes the one nearest `planeOrigin`.
     * @param inputs - The two edges, the plane they lie in, the radius and the solution index
     * @returns The wire of first edge, arc and second edge
     * @group 2d fillets
     * @shortname fillet 2 edges
     * @drawable true
     * @example
     * ```typescript
     * const corner = await bitbybit.occt.fillets.filletTwoEdgesInPlaneIntoAWire({
     *     edge1: horizontal,
     *     edge2: vertical,
     *     planeOrigin: [0, 0, 0],
     *     planeDirection: [0, 1, 0],
     *     radius: 1,
     *     solution: -1,
     * });
     * ```
     */
    filletTwoEdgesInPlaneIntoAWire(inputs: Inputs.OCCT.FilletTwoEdgesInPlaneDto<TopoDS_Edge>): TopoDS_Wire {
        const pln = this.och.entitiesService.gpPln(inputs.planeOrigin, inputs.planeDirection);
        const fil = new this.occ.ChFi2d_FilletAlgo(inputs.edge1, inputs.edge2, pln);
        fil.Perform(inputs.radius);
        const pt = this.och.entitiesService.gpPnt(inputs.planeOrigin);
        const edge1 = new this.occ.TopoDS_Edge();
        const edge2 = new this.occ.TopoDS_Edge();

        let solution = -1;
        if (inputs.solution !== undefined) {
            solution = inputs.solution;
        }
        const filletedEdge = fil.Result(pt, edge1, edge2, solution);

        const result = this.och.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge1, filletedEdge, edge2] });
        fil.delete();
        pt.delete();
        pln.delete();
        edge1.delete();
        edge2.delete();
        filletedEdge.delete();
        return result;
    }

    /**
     * Bevels the corners of a flat wire or face: each corner is cut back by `distance` along one
     * edge, at `angle` degrees to it.
     *
     * Without `indexes` every corner is beveled; with them, counted from 1 along the outline, only
     * those corners are.
     * @param inputs - The flat wire or face, the distance, the angle and the optional 1-based corner indexes
     * @returns The beveled wire or face
     * @group 2d fillets
     * @shortname chamfer 2d corners
     * @drawable true
     * @example
     * ```typescript
     * const beveled = await bitbybit.occt.fillets.chamfer2dVertices({ shape: rectangle, distance: 1, angle: 45, indexes: [1, 3] });
     * ```
     */
    chamfer2dVertices(inputs: Inputs.OCCT.Chamfer2dVertexDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        return this.och.filletsService.chamfer2dVertices(inputs);
    }

}
