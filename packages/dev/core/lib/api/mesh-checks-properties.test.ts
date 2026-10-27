import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { checkDrawableMesh, checkKeptDesignMesh } from "./mesh-checks";
import type { DrawableShapeMesh } from "./draw-helper-types";
import type { KeptDesignMesh } from "./draw-appearance";

type FaceKind = "lists" | "typed" | "loosePositions" | "looseIndexes" | "positionsAsRecord" | "noIndexes" | "positionsAsDataView" | "missingFace";

interface FaceCase {
    kind: FaceKind;
    named: boolean;
    faceIndex: number;
    vertexCount: number;
    triangleCount: number;
    extra: number;
}

const SEED = 20261020;

const GOOD_KINDS: readonly FaceKind[] = ["lists", "typed"];

const faceCase: fc.Arbitrary<FaceCase> = fc.record({
    kind: fc.constantFrom<FaceKind>("lists", "lists", "typed", "typed", "loosePositions", "looseIndexes", "positionsAsRecord", "noIndexes", "positionsAsDataView", "missingFace"),
    named: fc.boolean(),
    faceIndex: fc.nat(50),
    vertexCount: fc.nat(5),
    triangleCount: fc.nat(3),
    extra: fc.constantFrom(1, 2),
});

const faceOf = (spec: FaceCase): unknown => {
    const positions = new Array<number>(spec.vertexCount * 3).fill(0.5);
    const indexes = new Array<number>(spec.triangleCount * 3).fill(0);
    const named = spec.named ? { faceIndex: spec.faceIndex } : {};
    switch (spec.kind) {
        case "lists":
            return { ...named, vertexCoord: positions, normalCoord: [], triIndexes: indexes };
        case "typed":
            return { ...named, vertexCoord: new Float32Array(positions), normalCoord: new Float32Array(positions), triIndexes: new Uint32Array(indexes) };
        case "loosePositions":
            return { ...named, vertexCoord: [...positions, ...new Array<number>(spec.extra).fill(0)], triIndexes: indexes };
        case "looseIndexes":
            return { ...named, vertexCoord: new Float32Array(positions), triIndexes: new Uint32Array([...indexes, ...new Array<number>(spec.extra).fill(0)]) };
        case "positionsAsRecord":
            return { ...named, vertexCoord: { ...positions }, triIndexes: indexes };
        case "noIndexes":
            return { ...named, vertexCoord: positions, triIndexes: null };
        case "positionsAsDataView":
            return { ...named, vertexCoord: new DataView(new ArrayBuffer(spec.vertexCount * 12)), triIndexes: indexes };
        case "missingFace":
            return null;
    }
};

const pointsAtNoVertex = (spec: FaceCase): boolean => spec.vertexCount === 0 && spec.triangleCount > 0;

const refusalOf = (specs: readonly FaceCase[]): string | undefined => {
    const at = specs.findIndex(spec => !GOOD_KINDS.includes(spec.kind) || pointsAtNoVertex(spec));
    if (at < 0) {
        return undefined;
    }
    const spec = specs[at]!;
    const name = spec.named && spec.kind !== "missingFace" ? `Face ${spec.faceIndex}` : `The face at ${at}`;
    if (GOOD_KINDS.includes(spec.kind)) {
        return `${name} cannot be drawn: a triangle points at vertex 0 of its 0 vertices; indexes count the face's own vertices from 0.`;
    }
    if (spec.kind === "loosePositions") {
        return `${name} cannot be drawn: it holds ${spec.vertexCount * 3 + spec.extra} position values and ${spec.triangleCount * 3} indexes; both must be whole points and triangles, three values each.`;
    }
    if (spec.kind === "looseIndexes") {
        return `${name} cannot be drawn: it holds ${spec.vertexCount * 3} position values and ${spec.triangleCount * 3 + spec.extra} indexes; both must be whole points and triangles, three values each.`;
    }
    return `${name} cannot be drawn: its positions and its triangle indexes must each be a list of numbers.`;
};

const meshOfFaces = (faceList: unknown[]): DrawableShapeMesh => ({ faceList, edgeList: [], pointsList: [] }) as DrawableShapeMesh;

const keptFace = fc.record({ faceIndex: fc.nat(30), vertexCount: fc.nat(5), triangleCount: fc.nat(3), uvs: fc.boolean() });

const keptMeshOf = (faces: readonly { faceIndex: number; vertexCount: number; triangleCount: number; uvs: boolean }[]): KeptDesignMesh<DrawableShapeMesh> => {
    const positions = new Float32Array(faces.reduce((sum, face) => sum + face.vertexCount * 3, 2));
    const normals = new Float32Array(positions.length);
    const triangles = new Uint32Array(faces.reduce((sum, face) => sum + face.triangleCount * 3, 1));
    let coordinate = 2;
    let index = 1;
    const faceList = faces.map(face => {
        const built = {
            faceIndex: face.faceIndex,
            vertexCoord: positions.subarray(coordinate, coordinate + face.vertexCount * 3),
            normalCoord: normals.subarray(coordinate, coordinate + face.vertexCount * 3),
            triIndexes: triangles.subarray(index, index + face.triangleCount * 3),
            numberOfTriangles: face.triangleCount,
            uvs: face.uvs ? new Float32Array(face.vertexCount * 2) : new Float32Array(0),
            centerPoint: null,
            centerNormal: null,
        };
        coordinate += face.vertexCount * 3;
        index += face.triangleCount * 3;
        return built;
    });
    return { shapeHash: "generated-shape", mesh: meshOfFaces(faceList) };
};

describe("a mesh a drawer is about to draw, over generated faces", () => {
    it("should refuse exactly the meshes with a face that cannot be drawn, naming the first such face by its index or, without one, its place", () => {
        // Act & Assert
        fc.assert(fc.property(fc.array(faceCase, { maxLength: 6 }), specs => {
            const check = (): void => checkDrawableMesh(meshOfFaces(specs.map(faceOf)));
            const refusal = refusalOf(specs);
            if (refusal === undefined) {
                expect(check).not.toThrow();
            } else {
                expect(check).toThrow(refusal);
            }
        }), { seed: SEED, numRuns: 400 });
    });

    it("should refuse a face whose triangles point past its own vertices, as one-based indexes do, before it draws a triangle of another face", () => {
        // Arrange
        const oneBased = { faceIndex: 4, vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], triIndexes: [1, 2, 3] };

        // Act
        const check = (): void => checkDrawableMesh(meshOfFaces([oneBased]));

        // Assert
        expect(check).toThrow("Face 4 cannot be drawn: a triangle points at vertex 3 of its 3 vertices; indexes count the face's own vertices from 0.");
    });

    it("should refuse, naming the face, any face with a triangle that points at a vertex it does not have, as typed arrays or lists", () => {
        // Act & Assert
        fc.assert(fc.property(fc.integer({ min: 1, max: 6 }), fc.array(fc.nat(5), { minLength: 3, maxLength: 9 }), fc.integer({ min: 0, max: 3 }), fc.boolean(), (vertexCount, corners, overshoot, typed) => {
            const triangles = corners.slice(0, corners.length - (corners.length % 3)).map(corner => corner % vertexCount);
            const stray = vertexCount + overshoot;
            const indexes = [...triangles.slice(0, -1), stray];
            const positions = new Array<number>(vertexCount * 3).fill(0.5);
            const face = { faceIndex: 9, vertexCoord: typed ? new Float32Array(positions) : positions, triIndexes: typed ? new Uint32Array(indexes) : indexes };
            expect(() => checkDrawableMesh(meshOfFaces([face]))).toThrow(`Face 9 cannot be drawn: a triangle points at vertex ${stray} of its ${vertexCount} vertices; indexes count the face's own vertices from 0.`);
        }), { seed: SEED + 4, numRuns: 200 });
    });

    it("should refuse a face whose list of indexes holds a negative or a fractional vertex", () => {
        // Arrange
        const negative = { faceIndex: 1, vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], triIndexes: [0, 1, -1] };
        const fractional = { faceIndex: 2, vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], triIndexes: [0, 1.5, 2] };

        // Act
        const checks = [negative, fractional].map(face => (): void => checkDrawableMesh(meshOfFaces([face])));

        // Assert
        expect(checks[0]).toThrow("Face 1 cannot be drawn: a triangle points at vertex -1 of its 3 vertices; indexes count the face's own vertices from 0.");
        expect(checks[1]).toThrow("Face 2 cannot be drawn: a triangle points at vertex 1.5 of its 3 vertices; indexes count the face's own vertices from 0.");
    });
});

describe("a kept mesh a caller hands back, over generated meshes", () => {
    it("should let through the meshes as a drawer hands them out and every structured clone of them", () => {
        // Act & Assert
        fc.assert(fc.property(fc.array(keptFace, { maxLength: 6 }), faces => {
            const kept = keptMeshOf(faces);
            expect(() => checkKeptDesignMesh(kept)).not.toThrow();
            expect(() => checkKeptDesignMesh(structuredClone(kept))).not.toThrow();
            expect(() => checkKeptDesignMesh(structuredClone(structuredClone(kept)))).not.toThrow();
        }), { seed: SEED + 1, numRuns: 200 });
    });

    it("should refuse any mesh with a face stored as JSON, naming its first face", () => {
        // Act & Assert
        fc.assert(fc.property(fc.array(keptFace, { minLength: 1, maxLength: 6 }), faces => {
            const restored = JSON.parse(JSON.stringify(keptMeshOf(faces))) as KeptDesignMesh<DrawableShapeMesh>;
            expect(() => checkKeptDesignMesh(restored)).toThrow(`The mesh kept for generated-shape cannot be drawn: face ${faces[0]!.faceIndex} holds its positions, normals or indexes as something other than a list of numbers`);
        }), { seed: SEED + 2, numRuns: 200 });
    });

    it("should refuse a mesh whose buffers were transferred away exactly when one of its faces counts triangles, naming the first", () => {
        // Act & Assert
        fc.assert(fc.property(fc.array(keptFace, { minLength: 1, maxLength: 6 }), faces => {
            const kept = keptMeshOf(faces);
            const buffers = [...new Set(kept.mesh.faceList.flatMap(face => [face.vertexCoord, face.normalCoord, face.triIndexes].map(values => (values as Float32Array | Uint32Array).buffer as ArrayBuffer)))];
            structuredClone(kept, { transfer: buffers });
            const first = faces.find(face => face.triangleCount > 0);
            const check = (): void => checkKeptDesignMesh(kept);
            if (first === undefined) {
                expect(check).not.toThrow();
            } else {
                expect(check).toThrow(`The mesh kept for generated-shape cannot be drawn: face ${first.faceIndex} counts ${first.triangleCount} triangles but holds no indexes`);
            }
        }), { seed: SEED + 3, numRuns: 200 });
    });
});
