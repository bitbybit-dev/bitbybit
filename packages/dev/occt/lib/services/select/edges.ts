import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { resolveDto } from "@bitbybit-dev/base";
import * as Resolved from "../../api/resolved-inputs";
import { checkedChoice, checkedCount, checkedDirection, checkedIndexes, checkedNumber, checkedPoint, checkedShape, withIndexesInRange } from "../base/input-checks";

const CURVE_TYPES: readonly Inputs.OCCT.curveTypeEnum[] = [
    Inputs.OCCT.curveTypeEnum.line,
    Inputs.OCCT.curveTypeEnum.circle,
    Inputs.OCCT.curveTypeEnum.ellipse,
    Inputs.OCCT.curveTypeEnum.hyperbola,
    Inputs.OCCT.curveTypeEnum.parabola,
    Inputs.OCCT.curveTypeEnum.bezier,
    Inputs.OCCT.curveTypeEnum.bspline,
    Inputs.OCCT.curveTypeEnum.offset,
    Inputs.OCCT.curveTypeEnum.other,
];

const RADIANS_PER_DEGREE = Math.PI / 180;

/**
 * Choosing the edges of an OpenCascade shape by what they are, where they lie and how they meet,
 * so that "the edges round the top" still names the right edges after a parameter changes. Every
 * method returns edge indexes as `shapes.edge.getEdges` counts them, from 0, which `fillets`, the
 * getters and the other selectors take as they are. `indexes` limits a filter to edges chosen
 * before, keeping their order; left out, every edge is a candidate, and an empty list chooses
 * nothing. Degenerate edges, the poles of a sphere, are never chosen.
 */
export class OCCTSelectEdges {

    constructor(
        private readonly occ: BitbybitOcctModule,
    ) { }

    /**
     * Chooses the edges that run along one kind of curve, such as the straight edges of a part or
     * the circular rims of its holes.
     * @param inputs - The shape, the curve type and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by geometry
     * @shortname edges of type
     * @drawable false
     * @example
     * ```typescript
     * const rims = await bitbybit.occt.select.edges.ofType({ shape: part, type: Bit.Inputs.OCCT.curveTypeEnum.circle });
     * ```
     */
    ofType(inputs: Inputs.OCCT.SelectEdgesOfTypeDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectEdgesOfTypeDto, inputs) as Resolved.OCCT.SelectEdgesOfTypeDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const type = checkedChoice(resolved.type, CURVE_TYPES, "type");
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesOfType(shape, among, [CURVE_TYPES.indexOf(type)])));
    }

    /**
     * Chooses the straight edges that run within `angle` degrees of `direction`, either way along
     * it: an angle of 0 finds the edges parallel to it.
     * @param inputs - The shape, the direction, the angle in degrees and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by geometry
     * @shortname edges along
     * @drawable false
     * @example
     * ```typescript
     * const upright = await bitbybit.occt.select.edges.along({ shape: part, direction: [0, 0, 1], angle: 0 });
     * ```
     */
    along(inputs: Inputs.OCCT.SelectByDirectionDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectByDirectionDto, inputs) as Resolved.OCCT.SelectByDirectionDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const direction = checkedDirection(resolved.direction, "direction");
        const angle = checkedNumber(resolved.angle, "angle", 0, 180);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesAlong(shape, among, direction, angle * RADIANS_PER_DEGREE)));
    }

    /**
     * Chooses the edges whose centres lie furthest along `direction`, with any others within
     * `tolerance` of them: the edges round the top along z.
     * @param inputs - The shape, the direction, the tolerance and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by position
     * @shortname extreme edges
     * @drawable false
     * @example
     * ```typescript
     * const topEdges = await bitbybit.occt.select.edges.extreme({ shape: part, direction: [0, 0, 1], tolerance: 1e-7 });
     * ```
     */
    extreme(inputs: Inputs.OCCT.SelectExtremeDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectExtremeDto, inputs) as Resolved.OCCT.SelectExtremeDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const direction = checkedDirection(resolved.direction, "direction");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesExtreme(shape, among, direction, tolerance)));
    }

    /**
     * Chooses the edges whose centres lie inside a box lined up with the axes, given by two opposite
     * corners in either order.
     * @param inputs - The shape, the two corners and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by position
     * @shortname edges in box
     * @drawable false
     * @example
     * ```typescript
     * const near = await bitbybit.occt.select.edges.inBox({ shape: part, corner: [0, 0, 9], oppositeCorner: [10, 10, 11] });
     * ```
     */
    inBox(inputs: Inputs.OCCT.SelectInBoxDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectInBoxDto, inputs) as Resolved.OCCT.SelectInBoxDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const corner = checkedPoint(resolved.corner, "corner");
        const oppositeCorner = checkedPoint(resolved.oppositeCorner, "oppositeCorner");
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesInBox(shape, among, corner, oppositeCorner)));
    }

    /**
     * Chooses the edges whose centres lie within `radius` of `center`.
     * @param inputs - The shape, the center, the radius and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by position
     * @shortname edges in sphere
     * @drawable false
     * @example
     * ```typescript
     * const around = await bitbybit.occt.select.edges.inSphere({ shape: part, center: [5, 5, 10], radius: 6 });
     * ```
     */
    inSphere(inputs: Inputs.OCCT.SelectInSphereDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectInSphereDto, inputs) as Resolved.OCCT.SelectInSphereDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const center = checkedPoint(resolved.center, "center");
        const radius = checkedNumber(resolved.radius, "radius", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesInSphere(shape, among, center, radius)));
    }

    /**
     * Chooses the `count` edges whose centres lie nearest `point`, nearest first; edges as near as
     * each other keep their order.
     * @param inputs - The shape, the point, how many and the edges to choose among
     * @returns The indexes of the chosen edges, nearest first
     * @group by position
     * @shortname nearest edges
     * @drawable false
     * @example
     * ```typescript
     * const [picked] = await bitbybit.occt.select.edges.nearest({ shape: part, point: [5, 0, 10], count: 1 });
     * ```
     */
    nearest(inputs: Inputs.OCCT.SelectNearestDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectNearestDto, inputs) as Resolved.OCCT.SelectNearestDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const point = checkedPoint(resolved.point, "point");
        const count = checkedCount(resolved.count, "count");
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesNearest(shape, among, point, count)));
    }

    /**
     * Chooses the edges that lie in a plane, given by a point on it and its normal: every point of an
     * edge within `tolerance` of the plane.
     * @param inputs - The shape, the plane, the tolerance and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by position
     * @shortname edges on plane
     * @drawable false
     * @example
     * ```typescript
     * const outline = await bitbybit.occt.select.edges.onPlane({ shape: part, origin: [0, 0, 0], normal: [0, 0, 1] });
     * ```
     */
    onPlane(inputs: Inputs.OCCT.SelectOnPlaneDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectOnPlaneDto, inputs) as Resolved.OCCT.SelectOnPlaneDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const origin = checkedPoint(resolved.origin, "origin");
        const normal = checkedDirection(resolved.normal, "normal");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesOnPlane(shape, among, origin, normal, tolerance)));
    }

    /**
     * Chooses the edges whose length lies between `min` and `max`, both included.
     * @param inputs - The shape, the range of lengths and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by geometry
     * @shortname edges by length
     * @drawable false
     * @example
     * ```typescript
     * const short = await bitbybit.occt.select.edges.byLength({ shape: part, min: 0, max: 2 });
     * ```
     */
    byLength(inputs: Inputs.OCCT.SelectInRangeDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectInRangeDto, inputs) as Resolved.OCCT.SelectInRangeDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const min = checkedNumber(resolved.min, "min", 0);
        const max = checkedNumber(resolved.max, "max", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesByLength(shape, among, min, max)));
    }

    /**
     * Chooses the circular edges whose radius lies between `min` and `max`, both included.
     * @param inputs - The shape, the range of radii and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by geometry
     * @shortname edges by radius
     * @drawable false
     * @example
     * ```typescript
     * const rims = await bitbybit.occt.select.edges.byRadius({ shape: part, min: 1.9, max: 2.1 });
     * ```
     */
    byRadius(inputs: Inputs.OCCT.SelectInRangeDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectInRangeDto, inputs) as Resolved.OCCT.SelectInRangeDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const min = checkedNumber(resolved.min, "min", 0);
        const max = checkedNumber(resolved.max, "max", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesByRadius(shape, among, min, max)));
    }

    /**
     * Chooses the edges that bound any of the given faces, counted as `shapes.face.getFaces` counts
     * them.
     * @param inputs - The shape and the faces to start from
     * @returns The indexes of the edges, in order
     * @group by relation
     * @shortname edges of faces
     * @drawable false
     * @example
     * ```typescript
     * const rim = await bitbybit.occt.select.edges.ofFaces({ shape: part, indexes: [5] });
     * ```
     */
    ofFaces(inputs: Inputs.OCCT.SelectFromIndexesDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectFromIndexesDto, inputs) as Resolved.OCCT.SelectFromIndexesDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const faces = checkedIndexes(resolved.indexes, "indexes");
        return Array.from(withIndexesInRange(this.occ, "faces", { indexes: faces }, () => this.occ.SelectEdgesOfFaces(shape, faces)));
    }

    /**
     * Chooses the edges where a face of `indexes` meets a different face of `otherIndexes`, such as
     * the edges round a top face where it meets the sides.
     * @param inputs - The shape and the two sets of faces
     * @returns The indexes of the edges, in order
     * @group by relation
     * @shortname edges between faces
     * @drawable false
     * @example
     * ```typescript
     * const seam = await bitbybit.occt.select.edges.between({ shape: part, indexes: [5], otherIndexes: [0, 1, 2, 3] });
     * ```
     */
    between(inputs: Inputs.OCCT.SelectBetweenDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectBetweenDto, inputs) as Resolved.OCCT.SelectBetweenDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const faces = checkedIndexes(resolved.indexes, "indexes");
        const otherFaces = checkedIndexes(resolved.otherIndexes, "otherIndexes");
        return Array.from(withIndexesInRange(this.occ, "faces", { indexes: faces, otherIndexes: otherFaces }, () => this.occ.SelectEdgesBetween(shape, faces, otherFaces)));
    }

    /**
     * Grows the given edges into the chains they continue smoothly: two edges meeting where their
     * tangents turn by no more than `angle` degrees are one chain, as a fillet runs along.
     * @param inputs - The shape, the edges to start from and the angle in degrees
     * @returns The indexes of the edges in the chains, in order
     * @group by relation
     * @shortname tangent chain
     * @drawable false
     * @example
     * ```typescript
     * const loop = await bitbybit.occt.select.edges.tangentChain({ shape: rounded, indexes: [3], angle: 1 });
     * ```
     */
    tangentChain(inputs: Inputs.OCCT.SelectTangentChainDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectTangentChainDto, inputs) as Resolved.OCCT.SelectTangentChainDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const seeds = checkedIndexes(resolved.indexes, "indexes");
        const angle = checkedNumber(resolved.angle, "angle", 0, 180);
        return Array.from(withIndexesInRange(this.occ, "edges", { indexes: seeds }, () => this.occ.SelectEdgesTangentChain(shape, seeds, angle * RADIANS_PER_DEGREE)));
    }

    /**
     * Chooses the edges where two faces meet at an outside corner, the ridges a fillet rounds off;
     * faces meeting within `tangentAngle` degrees of smooth count as neither.
     * @param inputs - The shape, the angle in degrees and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by geometry
     * @shortname convex edges
     * @drawable false
     * @example
     * ```typescript
     * const ridges = await bitbybit.occt.select.edges.convex({ shape: part, tangentAngle: 1 });
     * ```
     */
    convex(inputs: Inputs.OCCT.SelectConvexityDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectConvexityDto, inputs) as Resolved.OCCT.SelectConvexityDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const tangentAngle = checkedNumber(resolved.tangentAngle, "tangentAngle", 0, 90);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesConvex(shape, among, tangentAngle * RADIANS_PER_DEGREE)));
    }

    /**
     * Chooses the edges where two faces meet at an inside corner, the valleys a fillet fills; faces
     * meeting within `tangentAngle` degrees of smooth count as neither.
     * @param inputs - The shape, the angle in degrees and the edges to choose among
     * @returns The indexes of the chosen edges
     * @group by geometry
     * @shortname concave edges
     * @drawable false
     * @example
     * ```typescript
     * const valleys = await bitbybit.occt.select.edges.concave({ shape: part, tangentAngle: 1 });
     * ```
     */
    concave(inputs: Inputs.OCCT.SelectConvexityDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectConvexityDto, inputs) as Resolved.OCCT.SelectConvexityDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const tangentAngle = checkedNumber(resolved.tangentAngle, "tangentAngle", 0, 90);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesConcave(shape, among, tangentAngle * RADIANS_PER_DEGREE)));
    }

    /**
     * Orders edges by how far along `direction` their centres lie, from the lowest to the highest;
     * edges level with each other keep their order.
     * @param inputs - The shape, the direction and the edges to sort
     * @returns The indexes of the edges, sorted
     * @group order
     * @shortname sort edges along
     * @drawable false
     * @example
     * ```typescript
     * const leftToRight = await bitbybit.occt.select.edges.sortAlong({ shape: part, direction: [1, 0, 0] });
     * ```
     */
    sortAlong(inputs: Inputs.OCCT.SelectSortAlongDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectSortAlongDto, inputs) as Resolved.OCCT.SelectSortAlongDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const direction = checkedDirection(resolved.direction, "direction");
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectEdgesSortedAlong(shape, among, direction)));
    }

    /**
     * Sorts edges along `direction` and groups them by level: a group ends where the next centre lies
     * more than `tolerance` beyond the group's first.
     * @param inputs - The shape, the direction, the tolerance and the edges to group
     * @returns One list of edge indexes per level, from the lowest
     * @group order
     * @shortname group edges along
     * @drawable false
     * @example
     * ```typescript
     * const levels = await bitbybit.occt.select.edges.groupAlong({ shape: part, direction: [0, 0, 1], tolerance: 0.01 });
     * ```
     */
    groupAlong(inputs: Inputs.OCCT.SelectGroupAlongDto<TopoDS_Shape>): number[][] {
        const resolved = resolveDto(Inputs.OCCT.SelectGroupAlongDto, inputs) as Resolved.OCCT.SelectGroupAlongDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const direction = checkedDirection(resolved.direction, "direction");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        return this.chosen<Int32Array[]>(resolved.indexes, [], among => this.occ.SelectEdgesGroupedAlong(shape, among, direction, tolerance)).map(group => Array.from(group));
    }

    /**
     * What a selector chooses among `indexes`: every edge when it is left out, none when it is
     * empty, and an index past the last edge refused as an input error.
     * @ignore true
     */
    private chosen<T>(indexes: number[] | undefined, nothing: T, choose: (among: number[]) => T): T {
        if (indexes === undefined) {
            return withIndexesInRange(this.occ, "edges", {}, () => choose([]));
        }
        const among = checkedIndexes(indexes, "indexes");
        return among.length === 0 ? nothing : withIndexesInRange(this.occ, "edges", { indexes: among }, () => choose(among));
    }
}
