import type { Base } from "@bitbybit-dev/base";

export interface ExactBody {
    node: Base.RecipeBrepNode;
    f64: number[];
}

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const UP: Base.Vector3 = [0, 0, 1];
const ALONG_X: Base.Vector3 = [1, 0, 0];

const placedAt = (origin: Base.Point3, axis: Base.Vector3 = UP, xDirection: Base.Vector3 = ALONG_X): Base.RecipeBrepPlacement => ({ origin, axis, xDirection });
const line = (origin: Base.Point3, direction: Base.Vector3): Base.RecipeBrepCurve => ({ kind: "line", origin, direction });

export function exactRecipe(body: ExactBody, millimetresPerUnit = 1, matrix: Base.TransformMatrix = IDENTITY): Base.Recipe {
    return { format: "bitbybit.recipe", version: 1, millimetresPerUnit, tolerance: 0.001, buffers: { f64: new Float64Array(body.f64), i32: new Int32Array() }, nodes: [body.node], roots: [{ node: 0, matrix, tag: {} }] };
}

export function meshBoxRecipe(size: Base.Vector3, millimetresPerUnit: number): Base.Recipe {
    const corners = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1].map((value, at) => value * size[at % 3]!);
    const outward = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
    return { format: "bitbybit.recipe", version: 1, millimetresPerUnit, tolerance: 0.001, buffers: { f64: new Float64Array(corners), i32: new Int32Array(outward) }, nodes: [{ op: "triangles", positions: [0, corners.length], indices: [0, outward.length] }], roots: [{ node: 0, matrix: IDENTITY, tag: {} }] };
}

export function cylinderBody(radius: number, height: number, bottom = 0): ExactBody {
    const top = bottom + height;
    return {
        node: {
            op: "brep",
            vertices: [0, 6],
            curves: [
                { kind: "circle", ...placedAt([0, 0, bottom]), radius },
                { kind: "circle", ...placedAt([0, 0, top]), radius },
                line([radius, 0, bottom], UP),
            ],
            surfaces: [{ kind: "cylinder", ...placedAt([0, 0, bottom]), radius }, { kind: "plane", ...placedAt([0, 0, bottom]) }, { kind: "plane", ...placedAt([0, 0, top]) }],
            edges: [{ curve: 0, start: 0, end: 0 }, { curve: 1, start: 1, end: 1 }, { curve: 2, start: 0, end: 1 }],
            faces: [
                { surface: 0, sameSense: true, bounds: [{ outer: true, edges: [0, 2, 1, 2], forward: [true, true, false, false] }] },
                { surface: 1, sameSense: false, bounds: [{ outer: true, edges: [0], forward: [false] }] },
                { surface: 2, sameSense: true, bounds: [{ outer: true, edges: [1], forward: [true] }] },
            ],
            closed: true,
        },
        f64: [radius, 0, bottom, radius, 0, top],
    };
}

function turnedInside(face: Base.RecipeBrepFace): Base.RecipeBrepFace {
    return {
        surface: face.surface,
        sameSense: !face.sameSense,
        bounds: face.bounds.map((bound) => ({ outer: bound.outer, edges: [...bound.edges].reverse(), forward: [...bound.forward].reverse().map((forward) => !forward) })),
    };
}

export function hollowedBody(outer: ExactBody, cavity: ExactBody): ExactBody {
    const [vertexCount, curveCount, surfaceCount, edgeCount, faceCount] = [outer.f64.length / 3, outer.node.curves.length, outer.node.surfaces.length, outer.node.edges.length, outer.node.faces.length];
    const inside = cavity.node.faces.map(turnedInside).map((face) => ({ ...face, surface: face.surface + surfaceCount, bounds: face.bounds.map((bound) => ({ ...bound, edges: bound.edges.map((edge) => edge + edgeCount) })) }));
    return {
        node: {
            op: "brep",
            vertices: [0, outer.f64.length + cavity.f64.length],
            curves: [...outer.node.curves, ...cavity.node.curves],
            surfaces: [...outer.node.surfaces, ...cavity.node.surfaces],
            edges: [...outer.node.edges, ...cavity.node.edges.map((edge) => ({ ...edge, curve: edge.curve + curveCount, start: edge.start + vertexCount, end: edge.end + vertexCount }))],
            faces: [...outer.node.faces, ...inside],
            closed: true,
            solids: [{ outer: outer.node.faces.map((_, at) => at), voids: [cavity.node.faces.map((_, at) => faceCount + at)] }],
        },
        f64: [...outer.f64, ...cavity.f64],
    };
}

export function quarterCylinderBody(radius: number, height: number): ExactBody {
    const half = Math.SQRT1_2;
    const arc = (z: number): number[] => [radius, 0, z, radius, radius, z, 0, radius, z];
    const vertices = [0, 0, 0, radius, 0, 0, 0, radius, 0, 0, 0, height, radius, 0, height, 0, radius, height];
    const side = [radius, 0, 0, radius, 0, height, radius, radius, 0, radius, radius, height, 0, radius, 0, 0, radius, height];
    const [bottomArc, topArc, arcWeights, unitKnots, sidePoints, sideWeights] = [18, 27, 36, 39, 41, 59];
    const spline = (points: number): Base.RecipeBrepCurve => ({ kind: "bspline", degree: 2, points: [points, 9], weights: [arcWeights, 3], knots: [unitKnots, 2], multiplicities: [3, 3] });
    return {
        node: {
            op: "brep",
            vertices: [0, vertices.length],
            curves: [
                spline(bottomArc), spline(topArc),
                line([0, 0, 0], ALONG_X), line([0, 0, 0], [0, 1, 0]), line([0, 0, height], ALONG_X), line([0, 0, height], [0, 1, 0]),
                line([0, 0, 0], UP), line([radius, 0, 0], UP), line([0, radius, 0], UP),
            ],
            surfaces: [
                { kind: "bspline", uDegree: 2, vDegree: 1, uCount: 3, vCount: 2, points: [sidePoints, side.length], weights: [sideWeights, 6], uKnots: [unitKnots, 2], uMultiplicities: [3, 3], vKnots: [unitKnots, 2], vMultiplicities: [2, 2] },
                { kind: "plane", ...placedAt([0, 0, 0]) },
                { kind: "plane", ...placedAt([0, 0, height]) },
                { kind: "plane", ...placedAt([0, 0, 0], [0, -1, 0]) },
                { kind: "plane", ...placedAt([0, 0, 0], [-1, 0, 0], [0, 1, 0]) },
            ],
            edges: [
                { curve: 0, start: 1, end: 2 }, { curve: 1, start: 4, end: 5 },
                { curve: 2, start: 0, end: 1 }, { curve: 3, start: 0, end: 2 }, { curve: 4, start: 3, end: 4 }, { curve: 5, start: 3, end: 5 },
                { curve: 6, start: 0, end: 3 }, { curve: 7, start: 1, end: 4 }, { curve: 8, start: 2, end: 5 },
            ],
            faces: [
                { surface: 0, sameSense: true, bounds: [{ outer: true, edges: [0, 8, 1, 7], forward: [true, true, false, false] }] },
                { surface: 1, sameSense: false, bounds: [{ outer: true, edges: [3, 0, 2], forward: [true, false, false] }] },
                { surface: 2, sameSense: true, bounds: [{ outer: true, edges: [4, 1, 5], forward: [true, true, false] }] },
                { surface: 3, sameSense: true, bounds: [{ outer: true, edges: [2, 7, 4, 6], forward: [true, true, false, false] }] },
                { surface: 4, sameSense: true, bounds: [{ outer: true, edges: [6, 5, 8, 3], forward: [true, true, false, false] }] },
            ],
            closed: true,
        },
        f64: [...vertices, ...arc(0), ...arc(height), 1, half, 1, 0, 1, ...side, 1, 1, half, half, 1, 1],
    };
}
