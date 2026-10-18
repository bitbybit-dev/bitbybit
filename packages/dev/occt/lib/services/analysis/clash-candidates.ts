import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import { pointInTree, pointsOnTree, treeBox, treesNested, treesWithin, triangleTree } from "@bitbybit-dev/base/lib/api/services/helpers/mesh/mesh-proximity";
import type { TreeBox } from "@bitbybit-dev/base/lib/api/services/helpers/helper-types";
import { movedPoint, movedPositions } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { PAIR_VERDICT } from "./clash-types";
import type { ClashItem, ClashMesh, ClashPartMesh, ClashReading, PairVerdict } from "./clash-types";
import { BOX_CORNERS, BOX_VALUES, CLASSIFIED_POINTS, CLASSIFY_TOLERANCE, ERROR_MARGIN, LEAST_PRECISION, MATRIX_SIZE, MESH_SHARE, MOST_REFINEMENTS, MOST_TRIANGLES, OUTSIDE, REFINE_FACTOR, UNKNOWN } from "./clashes.constants";

const CORNERS = 3;
const POINT_TRIANGLE = [0, 0, 0];
const NO_TRIANGLES: ClashPartMesh = { positions: new Float64Array(0), indices: new Uint32Array(0) };

function placed(positions: ArrayLike<number>, matrix: readonly number[] | undefined): ArrayLike<number> {
    return matrix?.length === MATRIX_SIZE ? movedPositions(matrix, positions) : positions;
}

export function once<T>(make: () => T): () => T {
    let made: [T] | undefined;
    return (): T => {
        made ??= [make()];
        return made[0];
    };
}

export function placedBox(box: ArrayLike<number>, matrix: readonly number[] | undefined): TreeBox | undefined {
    if (box.length < BOX_VALUES || !Array.from(box).every(Number.isFinite)) {
        return undefined;
    }
    const corners = BOX_CORNERS.map(([x, y, z]): Inputs.Base.Point3 => {
        const corner: Inputs.Base.Point3 = [box[x]!, box[y]!, box[z]!];
        return matrix?.length === MATRIX_SIZE ? movedPoint(matrix, corner) : corner;
    });
    const along = (axis: number): number[] => corners.map(corner => corner[axis]!);
    return {
        min: [Math.min(...along(0)), Math.min(...along(1)), Math.min(...along(2))],
        max: [Math.max(...along(0)), Math.max(...along(1)), Math.max(...along(2))],
    };
}

export function meshErrorFrom(box: ArrayLike<number>): number {
    if (box.length < BOX_VALUES) {
        return 0;
    }
    return Math.max(LEAST_PRECISION, MESH_SHARE * Math.hypot(box[3]! - box[0]!, box[4]! - box[1]!, box[5]! - box[2]!));
}

function refinable(error: number, triangles: number, depth: number): boolean {
    return depth < MOST_REFINEMENTS && error / REFINE_FACTOR >= LEAST_PRECISION && triangles * REFINE_FACTOR * REFINE_FACTOR <= MOST_TRIANGLES;
}

export function trianglesOf(mesh: Inputs.OCCT.DecomposedMeshDto): ClashPartMesh {
    const faces = Array.isArray(mesh.faceList) ? mesh.faceList : [];
    const positions = new Float64Array(faces.reduce((count, face) => count + face.vertexCoord.length, 0));
    const indices = new Uint32Array(faces.reduce((count, face) => count + face.triIndexes.length, 0));
    let corner = 0;
    let index = 0;
    for (const face of faces) {
        const offset = corner / CORNERS;
        positions.set(face.vertexCoord, corner);
        corner += face.vertexCoord.length;
        for (const vertex of face.triIndexes) {
            indices[index] = vertex + offset;
            index++;
        }
    }
    return { positions, indices };
}

export function meshableSolid(occ: BitbybitOcctModule, shape: TopoDS_Shape): boolean {
    const solids = occ.SolidsOf(shape, true);
    try {
        const solid = solids.length === 1 ? solids[0]! : undefined;
        const kinds = [occ.TopAbs_ShapeEnum.FACE, occ.TopAbs_ShapeEnum.EDGE, occ.TopAbs_ShapeEnum.VERTEX];
        if (solid === undefined || !kinds.every(kind => occ.CountSubShapes(shape, kind, true) === occ.CountSubShapes(solid, kind, true))) {
            return false;
        }
        const faces = occ.FacesOf(solid, true);
        try {
            return faces.every(face => {
                const surface = occ.BRep_Tool_Surface(face);
                try {
                    return !surface.IsNull();
                } finally {
                    surface.delete();
                }
            });
        } finally {
            faces.forEach(face => face.delete());
        }
    } finally {
        solids.forEach(solid => solid.delete());
    }
}

export function classifiedStates(occ: BitbybitOcctModule, shape: TopoDS_Shape, points: readonly Inputs.Base.Point3[]): number[] {
    return Array.from(occ.ClassifyPointsInSolid(shape, points.flat(), CLASSIFY_TOLERANCE));
}

function clashMeshOf(positions: ArrayLike<number>, indices: ArrayLike<number>, error: number, matrix?: readonly number[], finer?: () => ClashMesh | undefined): ClashMesh {
    return { tree: triangleTree(placed(positions, matrix), indices), error, ...(finer === undefined ? {} : { finer }) };
}

export function refinedMeshes(mesh: (error: number) => ClashPartMesh, first: number, matrix?: readonly number[]): ClashMesh {
    const level = (error: number, depth: number): ClashMesh => {
        const { positions, indices } = error > 0 ? mesh(error) : NO_TRIANGLES;
        let finer: ClashMesh | undefined;
        const refine = refinable(error, indices.length / CORNERS, depth)
            ? (): ClashMesh => {
                finer ??= level(error / REFINE_FACTOR, depth + 1);
                return finer;
            }
            : undefined;
        return clashMeshOf(positions, indices, error, matrix, refine);
    };
    return level(first, 0);
}

export function boxesApart(a: TreeBox | undefined, b: TreeBox | undefined, reach: number): boolean {
    if (a === undefined || b === undefined) {
        return false;
    }
    return [0, 1, 2].some(axis => a.min[axis]! - b.max[axis]! > reach || b.min[axis]! - a.max[axis]! > reach);
}

function verdictAt(first: ClashMesh, second: ClashMesh, clearance: number): PairVerdict {
    const margin = ERROR_MARGIN * (first.error + second.error);
    const reach = clearance + margin;
    if (boxesApart(treeBox(first.tree), treeBox(second.tree), reach)) {
        return PAIR_VERDICT.APART;
    }
    if (!treesWithin(first.tree, second.tree, reach)) {
        return treesNested(first.tree, second.tree) ? PAIR_VERDICT.NESTED : PAIR_VERDICT.APART;
    }
    const certain = clearance - margin;
    if (certain >= 0) {
        return treesWithin(first.tree, second.tree, certain) ? PAIR_VERDICT.CLOSE : PAIR_VERDICT.NEAR;
    }
    return treesWithin(first.tree, second.tree, 0) ? PAIR_VERDICT.CROSSING : PAIR_VERDICT.NEAR;
}

function unusable(mesh: ClashMesh): boolean {
    return mesh.error <= 0 || treeBox(mesh.tree) === undefined;
}

export function pairReading(first: ClashMesh, second: ClashMesh, clearance: number): ClashReading {
    let a = first;
    let b = second;
    for (;;) {
        if (unusable(a) || unusable(b)) {
            return { verdict: PAIR_VERDICT.NESTED, error: 0, first: a, second: b };
        }
        const verdict = verdictAt(a, b, clearance);
        const finerA = verdict === PAIR_VERDICT.NEAR || verdict === PAIR_VERDICT.CROSSING ? a.finer?.() : undefined;
        const finerB = finerA === undefined ? undefined : b.finer?.();
        if (finerA === undefined || finerB === undefined) {
            return { verdict, error: Math.max(a.error, b.error), first: a, second: b };
        }
        a = finerA;
        b = finerB;
    }
}

function holdsPointOf(item: ClashItem, own: ClashMesh, other: ClashMesh): boolean {
    const points = pointsOnTree(other.tree, CLASSIFIED_POINTS);
    if (points.length === 0) {
        return true;
    }
    const known = item.states(points).find(state => state !== UNKNOWN);
    if (known !== undefined) {
        return known !== OUTSIDE;
    }
    const clear = points.find(point => !treesWithin(triangleTree(point, POINT_TRIANGLE), own.tree, ERROR_MARGIN * own.error));
    return clear === undefined || pointInTree(own.tree, clear);
}

export function pairNeedsMeasuring(first: ClashItem, second: ClashItem, clearance: number, facesWithin: (precision: number) => number): boolean {
    if (boxesApart(first.box(), second.box(), clearance)) {
        return false;
    }
    if (!first.meshable() || !second.meshable()) {
        return true;
    }
    const reading = pairReading(first.mesh(), second.mesh(), clearance);
    if (reading.verdict === PAIR_VERDICT.APART) {
        return false;
    }
    if (reading.verdict !== PAIR_VERDICT.NEAR) {
        return true;
    }
    return holdsPointOf(first, reading.first, reading.second) || holdsPointOf(second, reading.second, reading.first) || facesWithin(reading.error) > 0;
}
