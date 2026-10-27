import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { computeVertexNormals } from "@bitbybit-dev/base/lib/api/services/helpers/mesh/mesh-normals";
import { mergedMeshBuffers } from "./mesh-buffers";
import type { MeshMerge, MeshPart } from "./draw-helper-types";

type Presence = "matching" | "absent" | "empty" | "wrong";

interface PartSpec {
    vertexCount: number;
    positions: number[];
    indices: number[];
    normals: Presence;
    normalValues: number[];
    uvs: Presence;
    uvValues: number[];
    colors: Presence;
    colorValues: number[];
}

interface Merged {
    positions: number[];
    normals: number[];
    indices: number[];
    uvs: number[] | undefined;
    colors: number[] | undefined;
}

const SEED = 20261018;
const LEADING_GARBAGE = 5;
const GARBAGE = -7;
const MILLION = 1_000_000;

const exactCoordinate = fc.integer({ min: -400, max: 400 }).map(value => value / 8);
const byteChannel = fc.integer({ min: 0, max: 255 }).map(value => value / 255);
const presence = fc.constantFrom<Presence>("matching", "absent", "empty", "wrong");

const partSpec = (colorSize: number): fc.Arbitrary<PartSpec> => fc.integer({ min: 0, max: 9 }).chain(vertexCount => fc.record({
    vertexCount: fc.constant(vertexCount),
    positions: fc.array(exactCoordinate, { minLength: vertexCount * 3, maxLength: vertexCount * 3 }),
    indices: vertexCount === 0
        ? fc.constant<number[]>([])
        : fc.array(fc.tuple(fc.nat(vertexCount - 1), fc.nat(vertexCount - 1), fc.nat(vertexCount - 1)), { maxLength: 8 }).map(triangles => triangles.flat()),
    normals: presence,
    normalValues: fc.array(exactCoordinate, { minLength: vertexCount * 3, maxLength: vertexCount * 3 }),
    uvs: presence,
    uvValues: fc.array(exactCoordinate, { minLength: vertexCount * 2, maxLength: vertexCount * 2 }),
    colors: presence,
    colorValues: fc.array(byteChannel, { minLength: vertexCount * colorSize, maxLength: vertexCount * colorSize }),
}));

const mergeOptions: fc.Arbitrary<MeshMerge> = fc.record({
    colorSize: fc.constantFrom<number | undefined>(3, 4, undefined),
    flipNormals: fc.boolean(),
    reverseWinding: fc.boolean(),
}).map(({ colorSize, ...turns }): MeshMerge => colorSize === undefined ? turns : { ...turns, colorSize });

const caseOf = fc.tuple(mergeOptions, fc.boolean()).chain(([merge, asViews]) => fc.record({
    merge: fc.constant(merge),
    asViews: fc.constant(asViews),
    specs: fc.array(partSpec(merge.colorSize ?? 4), { maxLength: 6 }),
}));

const valuesFor = (kind: Presence, values: number[], wrongLength: number): number[] | undefined => {
    if (kind === "absent") {
        return undefined;
    }
    if (kind === "empty") {
        return [];
    }
    return kind === "matching" ? values : values.slice(0, wrongLength).concat(values.length === 0 ? [1] : []);
};

const wrongLengthOf = (values: number[], itemSize: number): number => Math.max(0, values.length - itemSize);

const listsOf = (spec: PartSpec): MeshPart => {
    const normals = valuesFor(spec.normals, spec.normalValues, wrongLengthOf(spec.normalValues, 3));
    const uvs = valuesFor(spec.uvs, spec.uvValues, wrongLengthOf(spec.uvValues, 2));
    const colors = valuesFor(spec.colors, spec.colorValues, wrongLengthOf(spec.colorValues, 1));
    return {
        positions: spec.positions,
        indices: spec.indices,
        ...(normals === undefined ? {} : { normals }),
        ...(uvs === undefined ? {} : { uvs }),
        ...(colors === undefined ? {} : { colors }),
    };
};

const sharedViews = <T extends Float32Array | Uint32Array>(lists: readonly (readonly number[] | undefined)[], make: (length: number) => T): (T | undefined)[] => {
    const total = lists.reduce((sum, list) => sum + (list?.length ?? 0), LEADING_GARBAGE);
    const shared = make(total).fill(GARBAGE);
    let at = LEADING_GARBAGE;
    return lists.map(list => {
        if (list === undefined) {
            return undefined;
        }
        shared.set(list, at);
        const view = shared.subarray(at, at + list.length) as T;
        at += list.length;
        return view;
    });
};

const viewsOf = (parts: readonly MeshPart[]): MeshPart[] => {
    const toLists = (pick: (part: MeshPart) => ArrayLike<number> | undefined): (number[] | undefined)[] => parts.map(part => {
        const values = pick(part);
        return values === undefined ? undefined : Array.from(values);
    });
    const positions = sharedViews(toLists(part => part.positions), length => new Float32Array(length));
    const indices = sharedViews(toLists(part => part.indices), length => new Uint32Array(length));
    const normals = sharedViews(toLists(part => part.normals), length => new Float32Array(length));
    const uvs = sharedViews(toLists(part => part.uvs), length => new Float32Array(length));
    const colors = sharedViews(toLists(part => part.colors), length => new Float32Array(length));
    return parts.map((_, at) => ({
        positions: positions[at]!,
        indices: indices[at]!,
        ...(normals[at] === undefined ? {} : { normals: normals[at] }),
        ...(uvs[at] === undefined ? {} : { uvs: uvs[at] }),
        ...(colors[at] === undefined ? {} : { colors: colors[at] }),
    }));
};

const singles = (values: readonly number[]): number[] => values.map(value => Math.fround(value) + 0);

const plain = (values: ArrayLike<number> | undefined): number[] | undefined => values && Array.from(values, value => value + 0);

const plainMerged = (merged: ReturnType<typeof mergedMeshBuffers>): Merged => ({
    positions: plain(merged.positions)!,
    normals: plain(merged.normals)!,
    indices: plain(merged.indices)!,
    uvs: plain(merged.uvs),
    colors: plain(merged.colors),
});

const oracleOf = (parts: readonly MeshPart[], merge: MeshMerge): Merged => {
    const colorSize = merge.colorSize ?? 4;
    const sign = merge.flipNormals ? -1 : 1;
    const anyUvs = parts.some(part => part.uvs !== undefined && part.uvs.length > 0);
    const everyColored = parts.length > 0 && parts.every(part => part.colors !== undefined && part.colors.length === part.positions.length / 3 * colorSize);
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];
    let offset = 0;
    for (const part of parts) {
        const vertexCount = part.positions.length / 3;
        const own = Array.from(part.positions);
        positions.push(...own);
        const given = part.normals !== undefined && part.normals.length === part.positions.length ? Array.from(part.normals) : computeVertexNormals(own, Array.from(part.indices));
        normals.push(...given.map(value => sign * value));
        for (let at = 0; at < part.indices.length; at += 3) {
            const [a, b, c] = [part.indices[at]!, part.indices[at + 1]!, part.indices[at + 2]!];
            indices.push(...(merge.reverseWinding ? [a, c, b] : [a, b, c]).map(index => index + offset));
        }
        const ownUvs = part.uvs !== undefined && part.uvs.length === vertexCount * 2 ? Array.from(part.uvs) : new Array<number>(vertexCount * 2).fill(0);
        uvs.push(...ownUvs);
        if (everyColored) {
            colors.push(...Array.from(part.colors!));
        }
        offset += vertexCount;
    }
    return {
        positions: singles(positions),
        normals: singles(normals),
        indices,
        uvs: anyUvs ? singles(uvs) : undefined,
        colors: everyColored ? singles(colors) : undefined,
    };
};

const snapshotOf = (parts: readonly MeshPart[]): (number[] | undefined)[][] => parts.map(part => [part.positions, part.indices, part.normals, part.uvs, part.colors].map(values => plain(values)));

const viewAfterGarbage = <T extends Float32Array | Uint32Array>(values: T, make: (length: number) => T): T => {
    const shared = make(values.length + LEADING_GARBAGE).fill(GARBAGE);
    shared.set(values, LEADING_GARBAGE);
    return shared.subarray(LEADING_GARBAGE) as T;
};

const separateTriangles = (pointCount: number): { positions: Float32Array; indices: Uint32Array; normals: Float32Array } => {
    const positions = new Float32Array(pointCount * 3);
    const normals = new Float32Array(pointCount * 3);
    const indices = new Uint32Array(pointCount);
    for (let triangle = 0; triangle * 3 < pointCount; triangle++) {
        const x = triangle % 1000;
        const y = Math.floor(triangle / 1000);
        positions.set([x, y, 0, x + 1, y, 0, x, y + 1, 0], triangle * 9);
        normals.set([0, 0, 1, 0, 0, 1, 0, 0, 1], triangle * 9);
        indices.set([triangle * 3, triangle * 3 + 1, triangle * 3 + 2], triangle * 3);
    }
    return { positions, indices, normals };
};

describe("mergedMeshBuffers over generated parts", () => {
    it("should hold, for any parts and any merge, exactly what joining them by hand holds", () => {
        // Act & Assert
        fc.assert(fc.property(caseOf, ({ merge, asViews, specs }) => {
            const lists = specs.map(listsOf);
            const parts = asViews ? viewsOf(lists) : lists;
            expect(plainMerged(mergedMeshBuffers(parts, merge))).toEqual(oracleOf(parts, merge));
        }), { seed: SEED, numRuns: 300 });
    });

    it("should join views into shared buffers exactly as it joins the same numbers as lists", () => {
        // Act & Assert
        fc.assert(fc.property(caseOf, ({ merge, specs }) => {
            const lists = specs.map(listsOf);
            expect(plainMerged(mergedMeshBuffers(viewsOf(lists), merge))).toEqual(plainMerged(mergedMeshBuffers(lists, merge)));
        }), { seed: SEED + 1, numRuns: 300 });
    });

    it("should leave every part it was given as it was, lists and views alike", () => {
        // Act & Assert
        fc.assert(fc.property(caseOf, ({ merge, asViews, specs }) => {
            const lists = specs.map(listsOf);
            const parts = asViews ? viewsOf(lists) : lists;
            const before = snapshotOf(parts);
            mergedMeshBuffers(parts, merge);
            mergedMeshBuffers(parts, merge);
            expect(snapshotOf(parts)).toEqual(before);
        }), { seed: SEED + 2, numRuns: 200 });
    });

    it("should turn a back face round once: its normals the front's negated and its triangles the front's reversed", () => {
        // Act & Assert
        fc.assert(fc.property(caseOf, ({ asViews, specs }) => {
            const lists = specs.map(listsOf);
            const parts = asViews ? viewsOf(lists) : lists;
            const front = plainMerged(mergedMeshBuffers(parts));
            const back = plainMerged(mergedMeshBuffers(parts, { flipNormals: true, reverseWinding: true }));
            const reversed = front.indices.map((_, at) => front.indices[at - (at % 3) + [0, 2, 1][at % 3]!]!);
            expect(back.normals).toEqual(front.normals.map(value => -value + 0));
            expect(back.indices).toEqual(reversed);
            expect(back.positions).toEqual(front.positions);
        }), { seed: SEED + 3, numRuns: 200 });
    });

    it("should refuse, naming the part, any part whose positions or indexes do not come in threes", () => {
        // Act & Assert
        fc.assert(fc.property(fc.array(partSpec(4), { minLength: 1, maxLength: 5 }), fc.nat(4), fc.constantFrom(1, 2), fc.boolean(), (specs, pick, extra, onIndexes) => {
            const lists = specs.map(listsOf);
            const at = pick % lists.length;
            const broken = lists.map((part, index) => index !== at ? part : {
                ...part,
                positions: onIndexes ? part.positions : [...Array.from(part.positions), ...new Array<number>(extra).fill(0)],
                indices: onIndexes ? [...Array.from(part.indices), ...new Array<number>(extra).fill(0)] : part.indices,
            });
            const brokenPart = broken[at]!;
            expect(() => mergedMeshBuffers(broken)).toThrow(`Mesh part ${at} holds ${brokenPart.positions.length} position values and ${brokenPart.indices.length} indexes; both must be whole points and triangles, three values each.`);
        }), { seed: SEED + 4, numRuns: 150 });
    });
});

describe("mergedMeshBuffers over huge surfaces", () => {
    const TIME_BUDGET_MS = 4000;

    it("should join one face of two million points, as typed views, in one pass within the time budget", () => {
        // Arrange
        const pointCount = 2 * MILLION + 1;
        const face = separateTriangles(pointCount);
        const started = performance.now();

        // Act
        const merged = mergedMeshBuffers([{ positions: viewAfterGarbage(face.positions, length => new Float32Array(length)), indices: viewAfterGarbage(face.indices, length => new Uint32Array(length)), normals: viewAfterGarbage(face.normals, length => new Float32Array(length)) }, { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] }], { reverseWinding: true, flipNormals: true });
        const elapsed = performance.now() - started;

        // Assert
        expect(merged.positions).toHaveLength(pointCount * 3 + 9);
        expect(plain(merged.indices.subarray(0, 3))).toEqual([0, 2, 1]);
        expect(plain(merged.indices.subarray(-3))).toEqual([pointCount, pointCount + 2, pointCount + 1]);
        expect(merged.normals[pointCount * 3 - 1]).toBe(-1);
        expect(elapsed).toBeLessThan(TIME_BUDGET_MS);
    });

    it("should join one face of a million points given as plain lists, working out its normals, within the time budget", () => {
        // Arrange
        const pointCount = MILLION - 1;
        const face = separateTriangles(pointCount);
        const positions = Array.from(face.positions);
        const indices = Array.from(face.indices);
        const started = performance.now();

        // Act
        const merged = mergedMeshBuffers([{ positions, indices }], { flipNormals: true, reverseWinding: true });
        const elapsed = performance.now() - started;

        // Assert
        expect(merged.positions).toHaveLength(pointCount * 3);
        expect(plain(merged.normals.subarray(0, 3))).toEqual([0, 0, -1]);
        expect(plain(merged.normals.subarray(-3))).toEqual([0, 0, -1]);
        expect(plain(merged.indices.subarray(-3))).toEqual([pointCount - 3, pointCount - 1, pointCount - 2]);
        expect(elapsed).toBeLessThan(TIME_BUDGET_MS);
    });

    it("should join twenty thousand faces that are views into one shared buffer, each moved to its own vertices", () => {
        // Arrange
        const faceCount = 20_000;
        const quad = { positions: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0], indices: [0, 1, 2, 0, 2, 3], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], uvs: [0, 0, 1, 0, 1, 1, 0, 1] };
        const faces = viewsOf(Array.from({ length: faceCount }, () => quad));
        const started = performance.now();

        // Act
        const merged = mergedMeshBuffers(faces, { reverseWinding: true });
        const elapsed = performance.now() - started;

        // Assert
        expect(merged.positions).toHaveLength(faceCount * 12);
        expect(merged.uvs).toHaveLength(faceCount * 8);
        expect(plain(merged.indices.subarray(-6))).toEqual([0, 2, 1, 0, 3, 2].map(index => index + (faceCount - 1) * 4));
        expect(elapsed).toBeLessThan(TIME_BUDGET_MS);
    });
});

describe("mergedMeshBuffers regressions", () => {
    it("should join a face of three hundred thousand points, which a spread into push overflows the call stack on", () => {
        // Arrange
        const pointCount = 300_000;
        const face = separateTriangles(pointCount);

        // Act
        const join = (): number => mergedMeshBuffers([{ positions: Array.from(face.positions), indices: Array.from(face.indices), normals: Array.from(face.normals), uvs: new Array<number>(pointCount * 2).fill(0.5) }]).uvs!.length;

        // Assert
        expect(join).not.toThrow();
        expect(join()).toBe(pointCount * 2);
    });

    it("should refuse a part of ten position values instead of drawing a triangle that points at vertex 0", () => {
        // Arrange
        const tenPositions: MeshPart = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0, 5], indices: [0, 1, 2] };

        // Act
        const join = (): unknown => mergedMeshBuffers([tenPositions]);

        // Assert
        expect(join).toThrow("Mesh part 0 holds 10 position values and 3 indexes; both must be whole points and triangles, three values each.");
    });

    it("should work the normals of a back face without normals out of its front triangles, then turn them round, not the other way", () => {
        // Arrange
        const tilted: MeshPart = { positions: [0, 0, 0, 2, 0, 0, 0, 0, 2], indices: [0, 1, 2] };

        // Act
        const back = mergedMeshBuffers([tilted], { flipNormals: true, reverseWinding: true });

        // Assert
        expect(plain(back.normals)).toEqual([0, 1, 0, 0, 1, 0, 0, 1, 0]);
        expect(plain(back.indices)).toEqual([0, 2, 1]);
    });
});
