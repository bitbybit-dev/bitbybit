import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Models from "./models";
import { DesignMeshCache, designDrawPlanOf, designMeshesOf, designMeshingTextOf, edgeColorsOf, edgeSegmentsOf, lookGroupsOf, lookedMeshOf, lookMeshesOf, meshNumbersOf, type DesignDrawMemory, type DesignMesh, type DesignPlanOptions, type FaceLook, type LookGroup, type LookMeshSource } from "./draw-appearance";

type Appearance = Models.OCCT.DesignBuiltAppearance;

type LookValues = Omit<Models.OCCT.DesignBuiltFaceAppearance, "indexes">;

interface FaceSpec {
    faceIndex: number;
    vertexCount: number;
    positions: number[];
    normals: number[];
    triangles: number[];
}

interface DrawnLook {
    look: FaceLook;
    faces: number[];
}

interface OracleLooked {
    positions: number[];
    normals: number[];
    indices: number[];
    looks: { look: FaceLook; vertexStart: number; vertexCount: number; indexStart: number; indexCount: number }[];
    faceRanges: { face: number; start: number; count: number }[];
}

const SEED = 20261019;
const LEADING_GARBAGE = 4;
const GARBAGE = -7;
const FALLBACK = "#AbCdEf";

const colour = fc.constantFrom("#FF0000", "#ff0000", "#00ff00", "#0000FF", "#123456");
const fraction = fc.constantFrom(0, 0.25, 0.5, 1);
const lookValues: fc.Arbitrary<LookValues> = fc.record({
    color: colour,
    metallic: fraction,
    roughness: fraction,
    opacity: fraction,
    emissive: colour,
    emissiveStrength: fc.constantFrom(0, 1, 2),
}, { requiredKeys: [] });
const faceNumber = fc.integer({ min: 0, max: 11 });
const faceEntry = fc.tuple(fc.array(faceNumber, { maxLength: 6 }), lookValues).map(([indexes, values]): Models.OCCT.DesignBuiltFaceAppearance => ({ indexes, ...values }));
const edgeEntry = fc.tuple(fc.array(faceNumber, { maxLength: 6 }), fc.option(colour, { nil: undefined })).map(([indexes, color]): Models.OCCT.DesignBuiltEdgeAppearance => color === undefined ? { indexes } : { indexes, color });
const appearanceOf: fc.Arbitrary<Appearance | undefined> = fc.option(fc.record({
    values: lookValues,
    faces: fc.array(faceEntry, { maxLength: 5 }),
    edges: fc.option(fc.array(edgeEntry, { maxLength: 5 }), { nil: undefined }),
    edgeColor: fc.option(colour, { nil: undefined }),
}).map(({ values, faces, edges, edgeColor }): Appearance => ({
    ...values,
    faces,
    ...(edges === undefined ? {} : { edges }),
    ...(edgeColor === undefined ? {} : { edgeColor }),
})), { nil: undefined });
const meshFaceIndexes = fc.uniqueArray(fc.integer({ min: 0, max: 9 }), { maxLength: 10 });
const exactCoordinate = fc.integer({ min: -64, max: 64 }).map(value => value / 4);

const faceSpecOf = (faceIndex: number): fc.Arbitrary<FaceSpec> => fc.integer({ min: 0, max: 6 }).chain(vertexCount => fc.record({
    faceIndex: fc.constant(faceIndex),
    vertexCount: fc.constant(vertexCount),
    positions: fc.array(exactCoordinate, { minLength: vertexCount * 3, maxLength: vertexCount * 3 }),
    normals: fc.array(exactCoordinate, { minLength: vertexCount * 3, maxLength: vertexCount * 3 }),
    triangles: vertexCount === 0
        ? fc.constant<number[]>([])
        : fc.array(fc.tuple(fc.nat(vertexCount - 1), fc.nat(vertexCount - 1), fc.nat(vertexCount - 1)), { maxLength: 4 }).map(triangles => triangles.flat()),
}));

const meshSpecOf = meshFaceIndexes.chain(indexes => fc.tuple(...indexes.map(faceSpecOf)));

const sharedIndexMeshSpecOf = fc.array(fc.integer({ min: 0, max: 3 }), { maxLength: 8 }).chain(indexes => fc.tuple(...indexes.map(faceSpecOf)));

const lookOracle = (values: LookValues | undefined, under: FaceLook): FaceLook => {
    const look: FaceLook = { color: (values?.color ?? under.color).toLowerCase(), opacity: values?.opacity ?? under.opacity };
    const metallic = values?.metallic ?? under.metallic;
    const roughness = values?.roughness ?? under.roughness;
    const emissive = values?.emissive === undefined ? under.emissive : values.emissive.toLowerCase();
    const emissiveStrength = values?.emissiveStrength ?? under.emissiveStrength;
    return {
        ...look,
        ...(metallic === undefined ? {} : { metallic }),
        ...(roughness === undefined ? {} : { roughness }),
        ...(emissive === undefined ? {} : { emissive }),
        ...(emissiveStrength === undefined ? {} : { emissiveStrength }),
    };
};

const sameLook = (first: FaceLook, second: FaceLook): boolean => JSON.stringify(Object.entries(first).sort()) === JSON.stringify(Object.entries(second).sort());

const looksOracle = (appearance: Appearance | undefined, faces: readonly number[], fallback: string): DrawnLook[] => {
    const base = lookOracle(appearance, { color: fallback, opacity: 1 });
    const entries = appearance?.faces ?? [];
    const looks: DrawnLook[] = [{ look: base, faces: [] }];
    for (const face of faces) {
        const deciding = [...entries].reverse().find(entry => entry.indexes.includes(face));
        const look = deciding === undefined ? base : lookOracle(deciding, base);
        const group = looks.find(each => sameLook(each.look, look));
        if (group) {
            group.faces.push(face);
        } else {
            looks.push({ look, faces: [face] });
        }
    }
    return looks.filter(each => each.faces.length > 0);
};

const edgeColorsOracle = (appearance: Appearance | undefined, edges: readonly number[], fallback: string): string[] => {
    const base = (appearance?.edgeColor ?? fallback).toLowerCase();
    return edges.map(edge => {
        const deciding = [...(appearance?.edges ?? [])].reverse().find(entry => entry.indexes.includes(edge));
        return deciding === undefined ? base : deciding.color?.toLowerCase() ?? base;
    });
};

const listsMeshOf = (faces: readonly FaceSpec[]): LookMeshSource => ({
    faceList: faces.map(face => ({ faceIndex: face.faceIndex, vertexCoord: face.positions, normalCoord: face.normals, triIndexes: face.triangles })),
});

const viewsMeshOf = (faces: readonly FaceSpec[]): LookMeshSource => {
    const total = (pick: (face: FaceSpec) => number[]): number => faces.reduce((sum, face) => sum + pick(face).length, LEADING_GARBAGE);
    const positions = new Float32Array(total(face => face.positions)).fill(GARBAGE);
    const normals = new Float32Array(total(face => face.normals)).fill(GARBAGE);
    const triangles = new Uint32Array(total(face => face.triangles)).fill(LEADING_GARBAGE);
    let coordinate = LEADING_GARBAGE;
    let index = LEADING_GARBAGE;
    return {
        faceList: faces.map(face => {
            positions.set(face.positions, coordinate);
            normals.set(face.normals, coordinate);
            triangles.set(face.triangles, index);
            const viewed = {
                faceIndex: face.faceIndex,
                vertexCoord: positions.subarray(coordinate, coordinate + face.positions.length),
                normalCoord: normals.subarray(coordinate, coordinate + face.normals.length),
                triIndexes: triangles.subarray(index, index + face.triangles.length),
            };
            coordinate += face.positions.length;
            index += face.triangles.length;
            return viewed;
        }),
    };
};

const lookedOracle = (faces: readonly FaceSpec[], groups: readonly LookGroup[], reverseWinding: boolean): OracleLooked => {
    const result: OracleLooked = { positions: [], normals: [], indices: [], looks: [], faceRanges: [] };
    const taken = new Map<number, number>();
    for (const group of groups) {
        const present = group.faces.flatMap(index => {
            const next = taken.get(index) ?? 0;
            taken.set(index, next + 1);
            return faces.filter(face => face.faceIndex === index).slice(next, next + 1);
        });
        if (!present.some(face => face.triangles.length > 0)) {
            continue;
        }
        const vertexStart = result.positions.length / 3;
        const indexStart = result.indices.length;
        for (const face of present) {
            const offset = result.positions.length / 3;
            result.faceRanges.push({ face: face.faceIndex, start: result.indices.length, count: face.triangles.length });
            result.positions.push(...face.positions);
            result.normals.push(...face.normals);
            for (let at = 0; at < face.triangles.length; at += 3) {
                const [a, b, c] = [face.triangles[at]!, face.triangles[at + 1]!, face.triangles[at + 2]!];
                result.indices.push(...(reverseWinding ? [a, c, b] : [a, b, c]).map(value => value + offset));
            }
        }
        result.looks.push({ look: group.look, vertexStart, vertexCount: result.positions.length / 3 - vertexStart, indexStart, indexCount: result.indices.length - indexStart });
    }
    return result;
};

const plain = (values: ArrayLike<number>): number[] => Array.from(values, value => value + 0);

const plainLooked = (looked: ReturnType<typeof lookedMeshOf>): OracleLooked => ({
    positions: plain(looked.positions),
    normals: plain(looked.normals),
    indices: plain(looked.indices),
    looks: looked.looks.map(span => ({ look: span.group.look, vertexStart: span.vertexStart, vertexCount: span.vertexCount, indexStart: span.indexStart, indexCount: span.indexCount })),
    faceRanges: looked.faceRanges,
});

const squareFace = (faceIndex: number, x: number): FaceSpec => ({
    faceIndex,
    vertexCount: 4,
    positions: [x, 0, 0, x + 1, 0, 0, x + 1, 1, 0, x, 1, 0],
    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    triangles: [0, 1, 2, 0, 2, 3],
});

describe("the looks of a shape's faces over generated appearances", () => {
    it("should give each face the values of the last entry that lists it over the base look, the base look first and the rest by their first face", () => {
        // Act & Assert
        fc.assert(fc.property(appearanceOf, meshFaceIndexes, (appearance, faces) => {
            const groups = lookGroupsOf(appearance, faces, FALLBACK);
            expect(groups.map(group => ({ look: group.look, faces: group.faces }))).toEqual(looksOracle(appearance, faces, FALLBACK));
        }), { seed: SEED, numRuns: 400 });
    });

    it("should share one key between equal looks and give different looks different keys", () => {
        // Act & Assert
        fc.assert(fc.property(appearanceOf, meshFaceIndexes, (appearance, faces) => {
            const groups = lookGroupsOf(appearance, faces, FALLBACK);
            expect(new Set(groups.map(group => group.key)).size).toBe(groups.length);
            expect(groups.every(group => group.faces.length > 0)).toBe(true);
        }), { seed: SEED + 1, numRuns: 300 });
    });

    it("should put every face of the mesh in exactly one look, as often as the mesh lists it", () => {
        // Act & Assert
        fc.assert(fc.property(appearanceOf, fc.array(fc.integer({ min: 0, max: 5 }), { maxLength: 12 }), (appearance, faces) => {
            const groups = lookGroupsOf(appearance, faces, FALLBACK);
            expect(groups.flatMap(group => group.faces).sort((a, b) => a - b)).toEqual([...faces].sort((a, b) => a - b));
        }), { seed: SEED + 2, numRuns: 300 });
    });

    it("should color each edge by the last entry listing it, an entry without a color and an edge no entry lists taking the edge color", () => {
        // Act & Assert
        fc.assert(fc.property(appearanceOf, fc.array(faceNumber, { maxLength: 12 }), (appearance, edges) => {
            expect(edgeColorsOf(appearance, edges, FALLBACK)).toEqual(edgeColorsOracle(appearance, edges, FALLBACK));
        }), { seed: SEED + 3, numRuns: 300 });
    });
});

describe("the faces of each look merged, over generated meshes", () => {
    it("should merge every look in one set as joining each look's faces by hand does, with each look's span and each face's range", () => {
        // Act & Assert
        fc.assert(fc.property(meshSpecOf, appearanceOf, fc.boolean(), fc.boolean(), (faces, appearance, asViews, reverseWinding) => {
            const mesh = asViews ? viewsMeshOf(faces) : listsMeshOf(faces);
            const groups = lookGroupsOf(appearance, faces.map(face => face.faceIndex), FALLBACK);
            expect(plainLooked(lookedMeshOf(mesh, groups, { reverseWinding }))).toEqual(lookedOracle(faces, groups, reverseWinding));
        }), { seed: SEED + 4, numRuns: 300 });
    });

    it("should hold in one set the meshes of each look put one after another, the looks without triangles left out", () => {
        // Act & Assert
        fc.assert(fc.property(meshSpecOf, appearanceOf, fc.boolean(), (faces, appearance, asViews) => {
            const mesh = asViews ? viewsMeshOf(faces) : listsMeshOf(faces);
            const groups = lookGroupsOf(appearance, faces.map(face => face.faceIndex), FALLBACK);
            const each = lookMeshesOf(mesh, groups).filter(look => look.indices.length > 0);
            const whole = lookedMeshOf(mesh, groups);
            expect(plain(whole.positions)).toEqual(each.flatMap(look => plain(look.positions)));
            expect(whole.looks.map(span => span.group.key)).toEqual(each.map(look => look.group.key));
            expect(whole.faceRanges).toEqual(each.flatMap((look, at) => look.faceRanges.map(range => ({ ...range, start: range.start + whole.looks[at]!.indexStart }))));
            expect(plain(whole.indices)).toEqual(each.flatMap((look, at) => plain(look.indices).map(index => index + whole.looks[at]!.vertexStart)));
        }), { seed: SEED + 5, numRuns: 300 });
    });

    it("should point each face's range at that face's own triangles", () => {
        // Act & Assert
        fc.assert(fc.property(meshSpecOf, appearanceOf, (faces, appearance) => {
            const groups = lookGroupsOf(appearance, faces.map(face => face.faceIndex), FALLBACK);
            const whole = lookedMeshOf(viewsMeshOf(faces), groups);
            for (const range of whole.faceRanges) {
                const face = faces.find(each => each.faceIndex === range.face)!;
                const own = plain(whole.indices.subarray(range.start, range.start + range.count));
                const firstVertex = own.length === 0 ? 0 : Math.min(...own) - Math.min(...face.triangles);
                expect(own.map(index => index - firstVertex)).toEqual(face.triangles);
            }
        }), { seed: SEED + 6, numRuns: 300 });
    });

    it("should leave the mesh it merged as it was", () => {
        // Act & Assert
        fc.assert(fc.property(meshSpecOf, appearanceOf, (faces, appearance) => {
            const mesh = viewsMeshOf(faces);
            const before = mesh.faceList.map(face => [plain(face.vertexCoord), plain(face.normalCoord), plain(face.triIndexes)]);
            const groups = lookGroupsOf(appearance, faces.map(face => face.faceIndex), FALLBACK);
            lookedMeshOf(mesh, groups, { reverseWinding: true });
            lookMeshesOf(mesh, groups);
            expect(mesh.faceList.map(face => [plain(face.vertexCoord), plain(face.normalCoord), plain(face.triIndexes)])).toEqual(before);
        }), { seed: SEED + 7, numRuns: 150 });
    });

    it("should draw every face of a mesh once, faces that share an index included, as joining each look's faces by hand does", () => {
        // Act & Assert
        fc.assert(fc.property(sharedIndexMeshSpecOf, appearanceOf, fc.boolean(), (faces, appearance, reverseWinding) => {
            const groups = lookGroupsOf(appearance, faces.map(face => face.faceIndex), FALLBACK);
            const whole = lookedMeshOf(viewsMeshOf(faces), groups, { reverseWinding });
            const drawnFaces = groups.flatMap(group => lookMeshesOf(listsMeshOf(faces), [group])[0]!.faceRanges).length;
            expect(plainLooked(whole)).toEqual(lookedOracle(faces, groups, reverseWinding));
            expect(drawnFaces).toBe(faces.length);
        }), { seed: SEED + 12, numRuns: 300 });
    });

    it("should point the range of each of two faces sharing an index at its own triangles, so picking either finds it", () => {
        // Arrange
        const faces = [squareFace(0, 0), squareFace(0, 10)];
        const groups = lookGroupsOf(undefined, faces.map(face => face.faceIndex), FALLBACK);

        // Act
        const whole = lookedMeshOf(listsMeshOf(faces), groups, { reverseWinding: true });

        // Assert
        expect(whole.faceRanges).toEqual([{ face: 0, start: 0, count: 6 }, { face: 0, start: 6, count: 6 }]);
        expect(plain(whole.indices.subarray(6, 12))).toEqual([4, 6, 5, 4, 7, 6]);
        expect(plain(whole.positions.subarray(12, 15))).toEqual([10, 0, 0]);
    });

    it("should keep each face's own triangles when two faces of a mesh share an index, as the plain drawer draws both", () => {
        // Arrange
        const faces = [squareFace(0, 0), squareFace(0, 10)];
        const groups = lookGroupsOf(undefined, faces.map(face => face.faceIndex), FALLBACK);

        // Act
        const whole = lookedMeshOf(listsMeshOf(faces), groups);

        // Assert
        expect(plain(whole.positions)).toEqual([...faces[0]!.positions, ...faces[1]!.positions]);
    });
});

describe("the edges of a mesh as segments, over generated edges", () => {
    const pointOf = fc.option(fc.tuple(exactCoordinate, exactCoordinate, exactCoordinate), { nil: undefined, freq: 4 });
    const edgesOf = fc.array(fc.record({ edgeIndex: fc.nat(20), vertexCoord: fc.array(pointOf, { maxLength: 6 }) }), { maxLength: 6 });

    it("should cut each edge into segments between its consecutive points, skipping missing points, with each edge's range", () => {
        // Act & Assert
        fc.assert(fc.property(edgesOf, edges => {
            const segments = edgeSegmentsOf({ edgeList: edges });
            const expected: number[] = [];
            const ranges = edges.map(edge => {
                const points = edge.vertexCoord.filter((point): point is [number, number, number] => point !== undefined);
                const start = expected.length / 6;
                points.slice(1).forEach((point, at) => expected.push(...points[at]!, ...point));
                return { edge: edge.edgeIndex, start, count: expected.length / 6 - start };
            });
            expect(plain(segments.positions)).toEqual(expected);
            expect(segments.edgeRanges).toEqual(ranges);
        }), { seed: SEED + 8, numRuns: 300 });
    });
});

describe("the weight of a kept mesh and the cache that keeps it, over generated meshes", () => {
    const keptMeshOf = fc.record({
        faces: fc.array(fc.record({ vertices: fc.nat(6), triangles: fc.nat(4), uvs: fc.boolean(), analysis: fc.boolean() }), { maxLength: 5 }),
        edges: fc.array(fc.nat(5), { maxLength: 4 }),
    }).map(({ faces, edges }): DesignMesh => ({
        faceList: faces.map((face, faceIndex) => ({
            faceIndex,
            vertexCoord: new Float32Array(face.vertices * 3),
            normalCoord: new Float32Array(face.vertices * 3),
            triIndexes: new Uint32Array(face.triangles * 3),
            ...(face.uvs ? { uvs: new Float32Array(face.vertices * 2) } : {}),
            ...(face.analysis ? { analysisValues: new Float32Array(face.vertices) } : {}),
        })),
        edgeList: edges.map((points, edgeIndex) => ({ edgeIndex, vertexCoord: Array.from({ length: points }, (): number[] => [0, 0, 0]) })),
    }));

    it("should weigh a mesh by every number it holds: positions, normals, triangles, uvs, analysis values and edge points", () => {
        // Act & Assert
        fc.assert(fc.property(keptMeshOf, mesh => {
            const faces = mesh.faceList.reduce((sum, face) => sum + face.vertexCoord.length * 2 + face.triIndexes.length + (face.uvs?.length ?? 0) + (face.analysisValues?.length ?? 0), 0);
            const edges = mesh.edgeList.reduce((sum, edge) => sum + edge.vertexCoord.length * 3, 0);
            expect(meshNumbersOf(mesh)).toBe(faces + edges);
        }), { seed: SEED + 9, numRuns: 300 });
    });

    type CacheStep = { kind: "set"; key: string; mesh: DesignMesh } | { kind: "get"; key: string } | { kind: "clear" };

    it("should keep and forget meshes as a least-recently-used cache bounded by count and by numbers does", () => {
        // Arrange
        const key = fc.constantFrom("a", "b", "c", "d", "e");
        const step: fc.Arbitrary<CacheStep> = fc.oneof(
            { weight: 5, arbitrary: fc.record({ kind: fc.constant<"set">("set"), key, mesh: keptMeshOf }) },
            { weight: 4, arbitrary: fc.record({ kind: fc.constant<"get">("get"), key }) },
            { weight: 1, arbitrary: fc.record({ kind: fc.constant<"clear">("clear") }) },
        );

        // Act & Assert
        fc.assert(fc.property(fc.integer({ min: 1, max: 4 }), fc.integer({ min: 0, max: 160 }), fc.array(step, { maxLength: 30 }), (capacity, budget, steps) => {
            const cache = new DesignMeshCache<DesignMesh>(capacity, budget);
            const model: { key: string; mesh: DesignMesh; numbers: number }[] = [];
            for (const each of steps) {
                if (each.kind === "clear") {
                    cache.clear();
                    model.length = 0;
                } else if (each.kind === "get") {
                    const at = model.findIndex(entry => entry.key === each.key);
                    const expected = at < 0 ? undefined : model.splice(at, 1)[0]!;
                    if (expected !== undefined) {
                        model.push(expected);
                    }
                    expect(cache.get(each.key)).toBe(expected?.mesh);
                } else {
                    const at = model.findIndex(entry => entry.key === each.key);
                    if (at >= 0) {
                        model.splice(at, 1);
                    }
                    const numbers = meshNumbersOf(each.mesh);
                    cache.set(each.key, each.mesh);
                    if (numbers <= budget) {
                        model.push({ key: each.key, mesh: each.mesh, numbers });
                        while (model.length > capacity || model.reduce((sum, entry) => sum + entry.numbers, 0) > budget) {
                            model.shift();
                        }
                    }
                }
                expect([cache.size, cache.weight]).toEqual([model.length, model.reduce((sum, entry) => sum + entry.numbers, 0)]);
            }
        }), { seed: SEED + 10, numRuns: 300 });
    });
});

describe("the meshing options of a drawing, written out as text", () => {
    const meshingOf = fc.record({ precision: fc.constantFrom(0.01, 0.1), angularDeflection: fc.constantFrom(0.1, 0.5), relativeDeflection: fc.boolean(), allowQualityDecrease: fc.boolean(), forceFaceDeflection: fc.boolean() });
    const lookOf = fc.record({ faceColour: fc.constantFrom("#ff0000", "#00ff00"), edgeColour: fc.constantFrom("#ffffff", "#000000"), faceOpacity: fc.constantFrom(0.5, 1), drawEdges: fc.boolean(), edgeContrast: fc.option(fc.constantFrom(0.2, 0.8), { nil: undefined }) });

    it("should change with every option that changes a mesh and with none that only changes the look", () => {
        // Act & Assert
        fc.assert(fc.property(meshingOf, meshingOf, lookOf, lookOf, (first, second, firstLook, secondLook) => {
            const same = JSON.stringify(first) === JSON.stringify(second);
            expect(designMeshingTextOf({ ...first, ...firstLook }) === designMeshingTextOf({ ...second, ...secondLook })).toBe(same);
        }), { seed: SEED + 13, numRuns: 300 });
    });
});

describe("a design build redrawn with other meshing options", () => {
    const options: DesignPlanOptions = { drawFaces: true, drawEdges: true, faceColour: "#ff0000", faceOpacity: 1, edgeColour: "#ffffff", edgeWidth: 2, edgeOpacity: 1, precision: 0.01, meshing: "angular 0.5" };
    const build = { parts: [{ id: "bolt", shapeHash: "b1" }], components: [{ path: "bolt0", part: "bolt", world: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }] };
    const memoryOf = (meshing: string | undefined): DesignDrawMemory<DesignMesh> => {
        const plan = designDrawPlanOf(build, options, undefined);
        return { precision: options.precision, ...(meshing === undefined ? {} : { meshing }), signature: plan.signature, placements: plan.placements, meshes: new Map([["b1", { faceList: [], edgeList: [] }]]) };
    };

    it("should only move the parts when the drawing it replaces was meshed with the same text, and mesh them again otherwise", () => {
        // Act
        const results = [memoryOf("angular 0.5"), memoryOf("angular 0.1"), memoryOf(undefined)].map(memory => designDrawPlanOf(build, options, memory).posesOnly);

        // Assert
        expect(results).toEqual([true, false, false]);
    });

    it("should take no mesh from a drawing meshed with other text, asking for every part again", async () => {
        // Arrange
        const plan = designDrawPlanOf(build, options, undefined);
        const asked: string[][] = [];

        // Act
        await designMeshesOf(plan, options, memoryOf("angular 0.1"), "fine", new DesignMeshCache<DesignMesh>(), parts => {
            asked.push(parts.map(part => part.id));
            return Promise.resolve(parts.map((): DesignMesh => ({ faceList: [], edgeList: [] })));
        });

        // Assert
        expect(asked).toEqual([["bolt"]]);
    });
});

describe("the meshes of a design build's parts, reused across builds", () => {
    const options: DesignPlanOptions = { drawFaces: true, drawEdges: true, faceColour: "#ff0000", faceOpacity: 1, edgeColour: "#ffffff", edgeWidth: 2, edgeOpacity: 1, precision: 0.01 };
    const partsOf = fc.uniqueArray(fc.record({ id: fc.constantFrom("a", "b", "c", "d", "e", "f"), shapeHash: fc.option(fc.constantFrom("s1", "s2", "s3"), { nil: undefined }) }), { selector: part => part.id, maxLength: 6 })
        .map(parts => parts.map((part, at) => part.shapeHash === undefined ? { id: part.id, shape: { hash: at } } : { id: part.id, shapeHash: part.shapeHash }));

    it("should mesh again only the parts without a shape hash when the same parts are drawn again with the same meshing", async () => {
        // Act & Assert
        await fc.assert(fc.asyncProperty(partsOf, async parts => {
            const cache = new DesignMeshCache<DesignMesh>();
            const asked: string[][] = [];
            const mesh = (wanted: { id: string }[]): Promise<DesignMesh[]> => {
                asked.push(wanted.map(part => part.id));
                return Promise.resolve(wanted.map((): DesignMesh => ({ faceList: [], edgeList: [] })));
            };
            const first = await designMeshesOf(designDrawPlanOf({ parts }, options, undefined), options, undefined, "fine", cache, mesh);
            const second = await designMeshesOf(designDrawPlanOf({ parts }, options, undefined), options, undefined, "fine", cache, mesh);
            const withoutHash = parts.filter(part => !("shapeHash" in part)).map(part => part.id);
            expect(asked.slice(1)).toEqual(withoutHash.length === 0 ? [] : [withoutHash]);
            expect(parts.flatMap(part => "shapeHash" in part ? [part] : []).every(part => second.get(part.id) === cache.get(`${part.shapeHash}|fine`))).toBe(true);
            expect([...first.keys()]).toEqual(parts.map(part => part.id));
        }), { seed: SEED + 11, numRuns: 150 });
    });
});
