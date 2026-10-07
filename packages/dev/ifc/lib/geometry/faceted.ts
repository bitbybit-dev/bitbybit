import { signedVolumeOf } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-measures";
import { newellNormal, triangulateFace } from "@bitbybit-dev/base/lib/api/services/helpers/triangulation";
import { POINT3_SIZE } from "../build/constants";
import { numbersOf } from "../build/placement";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcEntity, IfcValue } from "../step/step-types";
import { isList, isReference } from "../step/values";
import { UnsupportedGeometryError } from "./errors";
import type { TriangleMesh } from "./geometry-types";

export const OUTWARD = 1;
export const INWARD = -1;
export const UNORIENTED = 0;

const TRIANGLE_CORNERS = 3;
const OUTER_BOUND = "IfcFaceOuterBound";
const POLY_LOOP = "IfcPolyLoop";
const FACE_WITH_VOIDS = "IfcIndexedPolygonalFaceWithVoids";

function referencesOf(value: IfcValue, what: string): number[] {
    if (!isList(value)) {
        throw new UnsupportedGeometryError(`${what} is not a list`);
    }
    return value.map((item) => {
        if (!isReference(item)) {
            throw new UnsupportedGeometryError(`${what} holds something other than a reference`);
        }
        return item.ref;
    });
}

export function zeroBased(value: IfcValue, count: number, what: string, of: string): number[] {
    if (!isList(value) || !value.every((index): index is number => typeof index === "number" && Number.isSafeInteger(index))) {
        throw new UnsupportedGeometryError(`${what} is not a list of indices`);
    }
    return value.map((index) => {
        if (index < 1 || index > count) {
            throw new UnsupportedGeometryError(`${what} names ${index}, outside the ${count} ${of}`);
        }
        return index - 1;
    });
}

export function concatenated(meshes: readonly TriangleMesh[]): TriangleMesh {
    const positions: number[] = [];
    const indices: number[] = [];
    for (const mesh of meshes) {
        const offset = positions.length / POINT3_SIZE;
        for (const value of mesh.positions) {
            positions.push(value);
        }
        for (const vertex of mesh.indices) {
            indices.push(vertex + offset);
        }
    }
    return { positions, indices };
}

export class MeshCollector {
    private readonly model: ModelSnapshot;
    private readonly positions: number[] = [];
    private readonly indices: number[] = [];
    private readonly vertexOfPoint = new Map<number, number>();
    private readonly vertexAt = new Map<number, Map<number, Map<number, number>>>();

    constructor(model: ModelSnapshot) {
        this.model = model;
    }

    get mesh(): TriangleMesh {
        return { positions: this.positions, indices: this.indices };
    }

    shell(shell: number, sense: number): void {
        const first = this.indices.length;
        for (const face of this.references(shell, "CfsFaces")) {
            this.face(face);
        }
        this.orient(first, sense);
    }

    triangulatedFaces(item: number): void {
        const entity = this.model.peek(item);
        const vertices = this.indexedPoints(item, entity);
        const first = this.indices.length;
        const triangles = this.model.valueOf(entity, "CoordIndex");
        (isList(triangles) ? triangles : []).forEach((triangle, at) => {
            const what = `#${item} triangle ${at}`;
            const corners = vertices(triangle, what);
            if (corners.length !== TRIANGLE_CORNERS) {
                throw new UnsupportedGeometryError(`${what} has ${corners.length} corners, not ${TRIANGLE_CORNERS}`);
            }
            this.add(corners);
        });
        this.orient(first, this.model.valueOf(entity, "Closed") === true ? OUTWARD : UNORIENTED);
    }

    polygonalFaces(item: number): void {
        const entity = this.model.peek(item);
        const vertices = this.indexedPoints(item, entity);
        const first = this.indices.length;
        for (const face of referencesOf(this.model.valueOf(entity, "Faces"), `#${item} Faces`)) {
            const faceEntity = this.model.peek(face);
            const outer = vertices(this.model.valueOf(faceEntity, "CoordIndex"), `#${face} CoordIndex`);
            const inner = this.model.schema.isSubtypeOf(faceEntity.type, FACE_WITH_VOIDS) ? this.model.valueOf(faceEntity, "InnerCoordIndices") : null;
            const holes = (isList(inner) ? inner : []).map((hole, at) => vertices(hole, `#${face} inner loop ${at}`));
            this.add(triangulateFace(this.positions, [outer, ...holes]));
        }
        this.orient(first, this.model.valueOf(entity, "Closed") === true ? OUTWARD : UNORIENTED);
    }

    private indexedPoints(item: number, entity: IfcEntity): (value: IfcValue, what: string) => number[] {
        const coordinates = this.model.valueOf(entity, "Coordinates");
        if (!isReference(coordinates)) {
            throw new UnsupportedGeometryError(`#${item} has no coordinates`);
        }
        const list = this.model.valueOf(this.model.peek(coordinates.ref), "CoordList");
        const points = isList(list) ? list : [];
        const offset = this.positions.length / POINT3_SIZE;
        points.forEach((point, index) => {
            const numbers = numbersOf(point, `#${coordinates.ref} point ${index}`);
            this.positions.push(numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0);
        });
        const pointIndex = this.model.valueOf(entity, "PnIndex");
        const lookup = isList(pointIndex) ? zeroBased(pointIndex, points.length, `#${item} PnIndex`, "points") : undefined;
        return (value, what) => (lookup
            ? zeroBased(value, lookup.length, what, "entries of PnIndex").map((entry) => lookup[entry]! + offset)
            : zeroBased(value, points.length, what, "points").map((index) => index + offset));
    }

    private references(id: number, attribute: string): readonly number[] {
        return this.model.referenceList(id) ?? referencesOf(this.model.valueOf(this.model.peek(id), attribute), `#${id} ${attribute}`);
    }

    private face(face: number): void {
        const loops: number[][] = [];
        let outer = -1;
        for (const bound of this.references(face, "Bounds")) {
            const boundEntity = this.model.peek(bound);
            const loop = this.model.valueOf(boundEntity, "Bound");
            if (!isReference(loop)) {
                throw new UnsupportedGeometryError(`#${bound} has no loop`);
            }
            const vertices = this.loop(loop.ref);
            if (this.model.valueOf(boundEntity, "Orientation") === false) {
                vertices.reverse();
            }
            if (outer < 0 && this.model.schema.isSubtypeOf(boundEntity.type, OUTER_BOUND)) {
                outer = loops.length;
            }
            loops.push(vertices);
        }
        if (outer < 0) {
            const spans = loops.map((loop) => Math.hypot(...newellNormal(this.positions, loop)));
            outer = spans.indexOf(Math.max(...spans));
        }
        this.add(triangulateFace(this.positions, [loops[outer] ?? [], ...loops.filter((_, at) => at !== outer)]));
    }

    private loop(loop: number): number[] {
        const type = this.model.typeOf(loop);
        if (type !== POLY_LOOP) {
            throw new UnsupportedGeometryError(`A face bounded by an ${type ?? `unknown #${loop}`} is not supported yet`);
        }
        return this.references(loop, "Polygon").map((point) => this.vertex(point));
    }

    private vertex(point: number): number {
        const known = this.vertexOfPoint.get(point);
        if (known !== undefined) {
            return known;
        }
        const coordinates = numbersOf(this.model.valueOf(this.model.peek(point), "Coordinates"), `#${point} Coordinates`);
        const x = coordinates[0] ?? 0;
        const y = coordinates[1] ?? 0;
        const z = coordinates[2] ?? 0;
        let byY = this.vertexAt.get(x);
        if (!byY) {
            byY = new Map();
            this.vertexAt.set(x, byY);
        }
        let byZ = byY.get(y);
        if (!byZ) {
            byZ = new Map();
            byY.set(y, byZ);
        }
        let vertex = byZ.get(z);
        if (vertex === undefined) {
            vertex = this.positions.length / POINT3_SIZE;
            this.positions.push(x, y, z);
            byZ.set(z, vertex);
        }
        this.vertexOfPoint.set(point, vertex);
        return vertex;
    }

    private add(triangles: readonly number[]): void {
        for (const vertex of triangles) {
            this.indices.push(vertex);
        }
    }

    private orient(first: number, sense: number): void {
        if (sense === UNORIENTED || signedVolumeOf(this.positions, this.indices, first) * sense >= 0) {
            return;
        }
        for (let at = first; at < this.indices.length; at += POINT3_SIZE) {
            const second = this.indices[at + 1]!;
            this.indices[at + 1] = this.indices[at + 2]!;
            this.indices[at + 2] = second;
        }
    }
}
