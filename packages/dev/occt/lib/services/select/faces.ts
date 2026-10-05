import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import { checkedChoice, checkedCount, checkedDirection, checkedIndexes, checkedNumber, checkedPoint, checkedShape, withIndexesInRange } from "../base/input-checks";

const SURFACE_TYPES: readonly Inputs.OCCT.surfaceTypeEnum[] = [
    Inputs.OCCT.surfaceTypeEnum.plane,
    Inputs.OCCT.surfaceTypeEnum.cylinder,
    Inputs.OCCT.surfaceTypeEnum.cone,
    Inputs.OCCT.surfaceTypeEnum.sphere,
    Inputs.OCCT.surfaceTypeEnum.torus,
    Inputs.OCCT.surfaceTypeEnum.bezier,
    Inputs.OCCT.surfaceTypeEnum.bspline,
    Inputs.OCCT.surfaceTypeEnum.revolution,
    Inputs.OCCT.surfaceTypeEnum.extrusion,
    Inputs.OCCT.surfaceTypeEnum.offset,
    Inputs.OCCT.surfaceTypeEnum.other,
];

const RADIANS_PER_DEGREE = Math.PI / 180;

/**
 * Choosing the faces of an OpenCascade shape by what they are and where they lie, so that "the top
 * face" still names the right face after a parameter changes. Every method returns face indexes as
 * `shapes.face.getFaces` counts them, from 0, which the getters and the other selectors take as they
 * are. `indexes` limits a filter to faces chosen before, keeping their order; left out, every face is
 * a candidate, and an empty list chooses nothing. Positions are read at each face's centre of mass.
 */
export class OCCTSelectFaces {

    constructor(
        private readonly occ: BitbybitOcctModule,
    ) { }

    /**
     * Chooses the faces that lie on one kind of surface, such as the planar faces of a part or the
     * cylindrical walls of its holes.
     * @param inputs - The shape, the surface type and the faces to choose among
     * @returns The indexes of the chosen faces
     * @group by geometry
     * @shortname faces of type
     * @drawable false
     * @example
     * ```typescript
     * const walls = await bitbybit.occt.select.faces.ofType({ shape: part, type: Bit.Inputs.OCCT.surfaceTypeEnum.cylinder });
     * ```
     */
    ofType(inputs: Inputs.OCCT.SelectFacesOfTypeDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectFacesOfTypeDto, inputs) as Resolved.OCCT.SelectFacesOfTypeDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const type = checkedChoice(resolved.type, SURFACE_TYPES, "type");
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesOfType(shape, among, [SURFACE_TYPES.indexOf(type)])));
    }

    /**
     * Chooses the faces whose normal, read at the middle of each face, points within `angle`
     * degrees of `direction`: an angle of 0 finds the faces looking straight that way.
     * @param inputs - The shape, the direction, the angle in degrees and the faces to choose among
     * @returns The indexes of the chosen faces
     * @group by geometry
     * @shortname faces facing
     * @drawable false
     * @example
     * ```typescript
     * const up = await bitbybit.occt.select.faces.facing({ shape: part, direction: [0, 0, 1], angle: 0 });
     * ```
     */
    facing(inputs: Inputs.OCCT.SelectByDirectionDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectByDirectionDto, inputs) as Resolved.OCCT.SelectByDirectionDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const direction = checkedDirection(resolved.direction, "direction");
        const angle = checkedNumber(resolved.angle, "angle", 0, 180);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesFacing(shape, among, direction, angle * RADIANS_PER_DEGREE)));
    }

    /**
     * Chooses the faces whose centres lie furthest along `direction`, with any others within
     * `tolerance` of them: the top faces along z, the lowest along minus z.
     * @param inputs - The shape, the direction, the tolerance and the faces to choose among
     * @returns The indexes of the chosen faces
     * @group by position
     * @shortname extreme faces
     * @drawable false
     * @example
     * ```typescript
     * const top = await bitbybit.occt.select.faces.extreme({ shape: part, direction: [0, 0, 1], tolerance: 1e-7 });
     * ```
     */
    extreme(inputs: Inputs.OCCT.SelectExtremeDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectExtremeDto, inputs) as Resolved.OCCT.SelectExtremeDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const direction = checkedDirection(resolved.direction, "direction");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesExtreme(shape, among, direction, tolerance)));
    }

    /**
     * Chooses the faces whose centres lie inside a box lined up with the axes, given by two
     * opposite corners in either order.
     * @param inputs - The shape, the two corners and the faces to choose among
     * @returns The indexes of the chosen faces
     * @group by position
     * @shortname faces in box
     * @drawable false
     * @example
     * ```typescript
     * const near = await bitbybit.occt.select.faces.inBox({ shape: part, corner: [0, 0, 9], oppositeCorner: [10, 10, 11] });
     * ```
     */
    inBox(inputs: Inputs.OCCT.SelectInBoxDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectInBoxDto, inputs) as Resolved.OCCT.SelectInBoxDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const corner = checkedPoint(resolved.corner, "corner");
        const oppositeCorner = checkedPoint(resolved.oppositeCorner, "oppositeCorner");
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesInBox(shape, among, corner, oppositeCorner)));
    }

    /**
     * Chooses the faces whose centres lie within `radius` of `center`.
     * @param inputs - The shape, the center, the radius and the faces to choose among
     * @returns The indexes of the chosen faces
     * @group by position
     * @shortname faces in sphere
     * @drawable false
     * @example
     * ```typescript
     * const around = await bitbybit.occt.select.faces.inSphere({ shape: part, center: [5, 5, 10], radius: 2 });
     * ```
     */
    inSphere(inputs: Inputs.OCCT.SelectInSphereDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectInSphereDto, inputs) as Resolved.OCCT.SelectInSphereDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const center = checkedPoint(resolved.center, "center");
        const radius = checkedNumber(resolved.radius, "radius", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesInSphere(shape, among, center, radius)));
    }

    /**
     * Chooses the `count` faces whose centres lie nearest `point`, nearest first; faces as near as
     * each other keep their order.
     * @param inputs - The shape, the point, how many and the faces to choose among
     * @returns The indexes of the chosen faces, nearest first
     * @group by position
     * @shortname nearest faces
     * @drawable false
     * @example
     * ```typescript
     * const [picked] = await bitbybit.occt.select.faces.nearest({ shape: part, point: [5, 5, 12], count: 1 });
     * ```
     */
    nearest(inputs: Inputs.OCCT.SelectNearestDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectNearestDto, inputs) as Resolved.OCCT.SelectNearestDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const point = checkedPoint(resolved.point, "point");
        const count = checkedCount(resolved.count, "count");
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesNearest(shape, among, point, count)));
    }

    /**
     * Chooses the planar faces that lie in a plane, given by a point on it and its normal; a face
     * counts from either side, within `tolerance`.
     * @param inputs - The shape, the plane, the tolerance and the faces to choose among
     * @returns The indexes of the chosen faces
     * @group by position
     * @shortname faces on plane
     * @drawable false
     * @example
     * ```typescript
     * const bottom = await bitbybit.occt.select.faces.onPlane({ shape: part, origin: [0, 0, 0], normal: [0, 0, 1] });
     * ```
     */
    onPlane(inputs: Inputs.OCCT.SelectOnPlaneDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectOnPlaneDto, inputs) as Resolved.OCCT.SelectOnPlaneDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const origin = checkedPoint(resolved.origin, "origin");
        const normal = checkedDirection(resolved.normal, "normal");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesOnPlane(shape, among, origin, normal, tolerance)));
    }

    /**
     * Chooses the faces whose area lies between `min` and `max`, both included.
     * @param inputs - The shape, the range of areas and the faces to choose among
     * @returns The indexes of the chosen faces
     * @group by geometry
     * @shortname faces by size
     * @drawable false
     * @example
     * ```typescript
     * const small = await bitbybit.occt.select.faces.bySize({ shape: part, min: 0, max: 10 });
     * ```
     */
    bySize(inputs: Inputs.OCCT.SelectInRangeDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectInRangeDto, inputs) as Resolved.OCCT.SelectInRangeDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const min = checkedNumber(resolved.min, "min", 0);
        const max = checkedNumber(resolved.max, "max", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesBySize(shape, among, min, max)));
    }

    /**
     * Chooses the faces on cylinders and spheres whose radius lies between `min` and `max`, and the
     * faces on tori whose tube radius does, the rounds a fillet makes along a curved edge.
     * @param inputs - The shape, the range of radii and the faces to choose among
     * @returns The indexes of the chosen faces
     * @group by geometry
     * @shortname faces by radius
     * @drawable false
     * @example
     * ```typescript
     * const holes = await bitbybit.occt.select.faces.byRadius({ shape: part, min: 1.9, max: 2.1 });
     * ```
     */
    byRadius(inputs: Inputs.OCCT.SelectInRangeDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectInRangeDto, inputs) as Resolved.OCCT.SelectInRangeDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const min = checkedNumber(resolved.min, "min", 0);
        const max = checkedNumber(resolved.max, "max", 0);
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesByRadius(shape, among, min, max)));
    }

    /**
     * Chooses the faces that share an edge with any of the given faces, leaving out the given faces
     * themselves.
     * @param inputs - The shape and the faces to start from
     * @returns The indexes of the neighbouring faces, in order
     * @group by relation
     * @shortname adjacent faces
     * @drawable false
     * @example
     * ```typescript
     * const sides = await bitbybit.occt.select.faces.adjacentTo({ shape: part, indexes: [5] });
     * ```
     */
    adjacentTo(inputs: Inputs.OCCT.SelectFromIndexesDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectFromIndexesDto, inputs) as Resolved.OCCT.SelectFromIndexesDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const faces = checkedIndexes(resolved.indexes, "indexes");
        return Array.from(withIndexesInRange(this.occ, "faces", { indexes: faces }, () => this.occ.SelectFacesAdjacentTo(shape, faces)));
    }

    /**
     * Chooses the faces bounded by any of the given edges, counted as `shapes.edge.getEdges` counts
     * them: the two faces that meet along each.
     * @param inputs - The shape and the edges to start from
     * @returns The indexes of the faces, in order
     * @group by relation
     * @shortname faces of edges
     * @drawable false
     * @example
     * ```typescript
     * const beside = await bitbybit.occt.select.faces.ofEdges({ shape: part, indexes: [0] });
     * ```
     */
    ofEdges(inputs: Inputs.OCCT.SelectFromIndexesDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectFromIndexesDto, inputs) as Resolved.OCCT.SelectFromIndexesDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const edges = checkedIndexes(resolved.indexes, "indexes");
        return Array.from(withIndexesInRange(this.occ, "edges", { indexes: edges }, () => this.occ.SelectFacesOfEdges(shape, edges)));
    }

    /**
     * Orders faces by how far along `direction` their centres lie, from the lowest to the highest;
     * faces level with each other keep their order.
     * @param inputs - The shape, the direction and the faces to sort
     * @returns The indexes of the faces, sorted
     * @group order
     * @shortname sort faces along
     * @drawable false
     * @example
     * ```typescript
     * const bottomToTop = await bitbybit.occt.select.faces.sortAlong({ shape: part, direction: [0, 0, 1] });
     * ```
     */
    sortAlong(inputs: Inputs.OCCT.SelectSortAlongDto<TopoDS_Shape>): number[] {
        const resolved = resolveDto(Inputs.OCCT.SelectSortAlongDto, inputs) as Resolved.OCCT.SelectSortAlongDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const direction = checkedDirection(resolved.direction, "direction");
        return Array.from(this.chosen(resolved.indexes, new Int32Array(), among => this.occ.SelectFacesSortedAlong(shape, among, direction)));
    }

    /**
     * Sorts faces along `direction` and groups them by level: a group ends where the next centre lies
     * more than `tolerance` beyond the group's first.
     * @param inputs - The shape, the direction, the tolerance and the faces to group
     * @returns One list of face indexes per level, from the lowest
     * @group order
     * @shortname group faces along
     * @drawable false
     * @example
     * ```typescript
     * const levels = await bitbybit.occt.select.faces.groupAlong({ shape: part, direction: [0, 0, 1], tolerance: 0.01 });
     * ```
     */
    groupAlong(inputs: Inputs.OCCT.SelectGroupAlongDto<TopoDS_Shape>): number[][] {
        const resolved = resolveDto(Inputs.OCCT.SelectGroupAlongDto, inputs) as Resolved.OCCT.SelectGroupAlongDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const direction = checkedDirection(resolved.direction, "direction");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        return this.chosen<Int32Array[]>(resolved.indexes, [], among => this.occ.SelectFacesGroupedAlong(shape, among, direction, tolerance)).map(group => Array.from(group));
    }

    private chosen<T>(indexes: number[] | undefined, nothing: T, choose: (among: number[]) => T): T {
        if (indexes === undefined) {
            return withIndexesInRange(this.occ, "faces", {}, () => choose([]));
        }
        const among = checkedIndexes(indexes, "indexes");
        return among.length === 0 ? nothing : withIndexesInRange(this.occ, "faces", { indexes: among }, () => choose(among));
    }
}
