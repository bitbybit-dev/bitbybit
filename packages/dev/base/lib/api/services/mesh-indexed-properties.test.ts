import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { BaseBitByBit } from "./base-bitbybit";

type Vec = Inputs.Base.Point3;
type Triangle = Inputs.Base.Triangle3;
type Indexed = Inputs.Base.IndexedMesh;

interface Turn {
    axis: Vec;
    angle: number;
}

interface Piece {
    mesh: Triangle[];
    centre: Vec;
    volume: number;
}

const base = new BaseBitByBit();
const SEED = 20261018;
const RUNS = 100;

const plus = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const minus = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const times = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const dotOf = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crossOf = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lengthOf = (a: Vec): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: Vec): Vec => times(a, 1 / lengthOf(a));

const turned = ({ axis, angle }: Turn, vector: Vec): Vec => {
    const k = unit(axis);
    return plus(plus(times(vector, Math.cos(angle)), times(crossOf(k, vector), Math.sin(angle))), times(k, dotOf(k, vector) * (1 - Math.cos(angle))));
};

const normalOf = ([a, b, c]: readonly Vec[]): Vec => crossOf(minus(b!, a!), minus(c!, a!));

const cornerAt = (indexed: Indexed, index: number): Vec => [indexed.positions[index * 3]!, indexed.positions[index * 3 + 1]!, indexed.positions[index * 3 + 2]!];

const trianglesOf = (indexed: Indexed): number[][] => Array.from({ length: indexed.indices.length / 3 }, (_, at) => indexed.indices.slice(at * 3, at * 3 + 3));

const volumeOf = (triangles: readonly (readonly Vec[])[]): number => {
    const origin = triangles[0]?.[0] ?? [0, 0, 0];
    return triangles.reduce((sum, [a, b, c]) => sum + dotOf(minus(a!, origin), crossOf(minus(b!, origin), minus(c!, origin))), 0) / 6;
};

const BOX_CORNERS: Vec[] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const BOX_FACES = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];

const boxOf = (centre: Vec, size: Vec, turn: Turn): Piece => {
    const corners = BOX_CORNERS.map(corner => plus(centre, turned(turn, [corner[0] * size[0] / 2, corner[1] * size[1] / 2, corner[2] * size[2] / 2])));
    return { mesh: BOX_FACES.map(face => face.map(index => corners[index]!) as Triangle), centre, volume: size[0] * size[1] * size[2] };
};

const direction = fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }))
    .filter(vector => lengthOf(vector) > 0.1);
const turnArbitrary: fc.Arbitrary<Turn> = fc.record({ axis: direction, angle: fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }) });
const scaleArbitrary = fc.integer({ min: -4, max: 4 }).map(exponent => 10 ** exponent);

const pieceArbitrary: fc.Arbitrary<Piece> = fc.oneof(
    fc.record({ size: fc.tuple(fc.double({ min: 0.1, max: 3, noNaN: true }), fc.double({ min: 0.1, max: 3, noNaN: true }), fc.double({ min: 0.1, max: 3, noNaN: true })), turn: turnArbitrary })
        .map(({ size, turn }) => boxOf([0, 0, 0], size, turn)),
    fc.record({ radius: fc.double({ min: 0.2, max: 3, noNaN: true }), detail: fc.integer({ min: 0, max: 2 }) })
        .map(({ radius, detail }) => ({ mesh: base.mesh.icosphere({ radius, detail, center: [0, 0, 0] }), centre: [0, 0, 0] as Vec, volume: Number.NaN })),
    fc.record({ sides: fc.integer({ min: 3, max: 24 }), bottomRadius: fc.double({ min: 0.2, max: 2, noNaN: true }), topRadius: fc.double({ min: 0.2, max: 2, noNaN: true }), height: fc.double({ min: 0.2, max: 3, noNaN: true }), direction })
        .map(({ sides, bottomRadius, topRadius, height, direction: along }) => ({ mesh: base.mesh.frustum({ sides, bottomRadius, topRadius, height, direction: along, center: [0, 0, 0] }), centre: times(unit(along), height / 2), volume: Number.NaN })),
);

const placed = (piece: Piece, offset: Vec, scale: number): Piece => ({
    mesh: piece.mesh.map(triangle => triangle.map(corner => plus(times(corner, scale), offset)) as Triangle),
    centre: plus(times(piece.centre, scale), offset),
    volume: piece.volume * scale ** 3,
});

const weld = (mesh: Triangle[], scale = 1): Indexed => base.mesh.toIndexed({ mesh, tolerance: 1e-9 * scale });

const edgeUses = (indexed: Indexed): Map<string, number> => {
    const uses = new Map<string, number>();
    trianglesOf(indexed).forEach(([a, b, c]) => [[a!, b!], [b!, c!], [c!, a!]].forEach(([from, to]) => {
        if (from !== to) {
            uses.set(`${from}>${to}`, (uses.get(`${from}>${to}`) ?? 0) + 1);
        }
    }));
    return uses;
};

const unpairedEdges = (indexed: Indexed): string[] => {
    const uses = edgeUses(indexed);
    return [...uses.entries()].filter(([key, count]) => {
        const [from, to] = key.split(">");
        return count !== 1 || uses.get(`${to}>${from}`) !== 1;
    }).map(([key]) => key);
};

const firstKeptScan = (corners: readonly Vec[], tolerance: number): { kept: Vec[], indexes: number[] } => {
    const kept: Vec[] = [];
    const indexes = corners.map(corner => {
        const found = tolerance > 0 ? kept.findIndex(other => corner.every((value, axis) => Math.abs(value - other[axis]!) < tolerance)) : -1;
        return found >= 0 ? found : kept.push(corner) - 1;
    });
    return { kept, indexes };
};

const nearCopies = fc.record({
    seeds: fc.array(fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true })), { minLength: 1, maxLength: 8 }),
    copies: fc.array(fc.tuple(fc.nat(), fc.integer({ min: 0, max: 2 }), fc.constantFrom(0, 0.5, 1 - 1e-12, 1, 1 + 1e-12, 2, -0.5, -1, -1 - 1e-12, 7.9, 8, 8.1)), { minLength: 2, maxLength: 40 }),
    tolerance: fc.oneof(fc.constantFrom(0, 1e-12, 1e-9, 1e-7, 1e-3, 0.1), fc.double({ min: 1e-10, max: 0.1, noNaN: true })),
    reach: fc.constantFrom(1, 1e3, 1e6),
}).map(({ seeds, copies, tolerance, reach }) => {
    const corners = copies.map(([pick, axis, share]) => {
        const seed = seeds[pick % seeds.length]!;
        const copy: Vec = [seed[0] * reach, seed[1] * reach, seed[2] * reach];
        copy[axis] = copy[axis]! + share * tolerance;
        return copy;
    });
    const padded = [...corners, ...corners.slice(0, (3 - corners.length % 3) % 3)];
    return { mesh: Array.from({ length: padded.length / 3 }, (_, at) => padded.slice(at * 3, at * 3 + 3) as Triangle), tolerance };
});

const shuffled = <T>(items: readonly T[], keys: readonly number[]): T[] => items.map((item, index) => ({ item, key: keys[index % keys.length]! + index * 1e-9 })).sort((a, b) => a.key - b.key).map(({ item }) => item);

const facing = (triangle: readonly number[]): string => {
    const [a, b, c] = triangle;
    const turns = [[a, b, c], [b, c, a], [c, a, b]].map(order => order.join(","));
    return turns.sort()[0]!;
};

const icosahedronVolume = (radius: number): number => {
    const edge = radius / Math.sin(2 * Math.PI / 5);
    return 5 / 12 * (3 + Math.sqrt(5)) * edge ** 3;
};

const frustumVolume = (sides: number, bottomRadius: number, topRadius: number, height: number): number => {
    const areaOf = (radius: number): number => sides / 2 * radius * radius * Math.sin(2 * Math.PI / sides);
    const bottom = areaOf(bottomRadius);
    const top = areaOf(topRadius);
    return height / 3 * (bottom + top + Math.sqrt(bottom * top));
};

describe("indexed meshes against independent oracles", () => {
    describe("toIndexed", () => {
        it("should keep the first of every corners that agree within the tolerance in each coordinate, exactly as a plain scan does", () => {
            // Act & Assert
            fc.assert(fc.property(nearCopies, ({ mesh, tolerance }) => {
                const indexed = base.mesh.toIndexed({ mesh, tolerance });
                const expected = firstKeptScan(mesh.flat(), tolerance);
                expect(indexed.positions).toEqual(expected.kept.flat());
                expect(indexed.indices).toEqual(expected.indexes);
            }), { seed: SEED, numRuns: 300 });
        });

        it("should agree with a plain scan for corners on the grid's cell walls and as far out as its arithmetic stays exact", () => {
            // Act & Assert
            fc.assert(fc.property(
                fc.oneof(fc.constantFrom(1e-3, 1e-7, 0.1, 2 ** -10), fc.double({ min: 1e-9, max: 1, noNaN: true })),
                fc.constantFrom(1, 1e3, 2 ** 40, 2 ** 46, 2 ** 47, 2 ** 49, 2 ** 50, 2 ** 51),
                fc.array(fc.tuple(fc.integer({ min: -3, max: 3 }), fc.integer({ min: 0, max: 2 }), fc.constantFrom(-1.5, -1, -1 + 1e-12, -0.5, 0, 0.5, 1 - 1e-12, 1, 1.5), fc.integer({ min: -2, max: 2 })), { minLength: 2, maxLength: 30 }),
                (tolerance, cells, picks) => {
                    const wall = 8 * tolerance * Math.round(cells / 8);
                    const corners = picks.map(([cell, axis, share, steps]): Vec => {
                        const corner: Vec = [wall, -wall, wall / 2];
                        corner[axis] = corner[axis]! + cell * 8 * tolerance + share * tolerance;
                        corner[axis] = corner[axis] + steps * Math.abs(corner[axis]) * Number.EPSILON;
                        return corner;
                    });
                    const padded = [...corners, ...corners.slice(0, (3 - corners.length % 3) % 3)];
                    const mesh = Array.from({ length: padded.length / 3 }, (_, at) => padded.slice(at * 3, at * 3 + 3) as Triangle);
                    const indexed = base.mesh.toIndexed({ mesh, tolerance });
                    const expected = firstKeptScan(mesh.flat(), tolerance);
                    expect(indexed.indices).toEqual(expected.indexes);
                },
            ), { seed: SEED, numRuns: 400 });
        });

        it("should give back the triangles it was given with a tolerance of 0, and corners less than the tolerance away with any other", () => {
            // Act & Assert
            fc.assert(fc.property(nearCopies, ({ mesh, tolerance }) => {
                expect(base.mesh.fromIndexed({ mesh: base.mesh.toIndexed({ mesh, tolerance: 0 }) })).toEqual(mesh);
                const welded = base.mesh.fromIndexed({ mesh: base.mesh.toIndexed({ mesh, tolerance }) });
                welded.forEach((triangle, at) => triangle.forEach((corner, index) => corner.forEach((value, axis) => {
                    const given = mesh[at]![index]![axis]!;
                    expect(value === given || Math.abs(value - given) < tolerance).toBe(true);
                })));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should give an indexed mesh back renumbered when its triangles are indexed again", () => {
            // Act & Assert
            fc.assert(fc.property(pieceArbitrary, (piece) => {
                const indexed = weld(piece.mesh);
                const again = base.mesh.toIndexed({ mesh: base.mesh.fromIndexed({ mesh: indexed }), tolerance: 1e-9 });
                expect(again.positions.length).toBeLessThanOrEqual(indexed.positions.length);
                expect(base.mesh.fromIndexed({ mesh: again })).toEqual(base.mesh.fromIndexed({ mesh: indexed }));
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("icosphere and frustum", () => {
        it("should close an icosphere of any detail, every edge run once each way, every triangle facing away from its centre", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 0, max: 3 }), scaleArbitrary, fc.tuple(fc.double({ min: -1e3, max: 1e3, noNaN: true }), fc.double({ min: -1e3, max: 1e3, noNaN: true }), fc.double({ min: -1e3, max: 1e3, noNaN: true })), (detail, radius, center) => {
                const mesh = base.mesh.icosphere({ radius, detail, center });
                const indexed = weld(mesh, Math.max(radius, ...center.map(Math.abs)));
                expect(mesh).toHaveLength(20 * 4 ** detail);
                expect(indexed.positions.length / 3).toBe(10 * 4 ** detail + 2);
                expect(unpairedEdges(indexed)).toEqual([]);
                mesh.forEach(triangle => expect(dotOf(normalOf(triangle), minus(triangle[0], center))).toBeGreaterThan(0));
                mesh.flat().forEach(corner => expect(Math.abs(lengthOf(minus(corner, center)) - radius)).toBeLessThanOrEqual(1e-12 * Math.max(radius, ...center.map(Math.abs))));
            }), { seed: SEED, numRuns: 40 });
        });

        it("should give an icosahedron the volume of its edge's formula, and each finer icosphere more, below the ball's", () => {
            // Act & Assert
            fc.assert(fc.property(scaleArbitrary, (radius) => {
                const volumes = [0, 1, 2, 3].map(detail => base.mesh.signedVolume({ mesh: base.mesh.icosphere({ radius, detail, center: [0, 0, 0] }) }));
                expect(Math.abs(volumes[0]! - icosahedronVolume(radius))).toBeLessThanOrEqual(1e-12 * radius ** 3);
                volumes.slice(1).forEach((volume, index) => expect(volume).toBeGreaterThan(volumes[index]!));
                expect(volumes[3]).toBeLessThan(4 / 3 * Math.PI * radius ** 3);
                expect(volumes[3]).toBeGreaterThan(0.99 * 4 / 3 * Math.PI * radius ** 3);
            }), { seed: SEED, numRuns: 40 });
        });

        it("should close a frustum of any number of sides, either end a point included, outward with its prismatoid volume", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 3, max: 64 }), fc.double({ min: 0, max: 3, noNaN: true }), fc.double({ min: 0, max: 3, noNaN: true }), fc.double({ min: 0.01, max: 5, noNaN: true }), direction, fc.constantFrom(0, 1, 2), (sides, first, second, height, along, pointed) => {
                const bottomRadius = pointed === 1 ? 0 : first + 0.01;
                const topRadius = pointed === 2 ? 0 : second + 0.01;
                const mesh = base.mesh.frustum({ sides, bottomRadius, topRadius, height, direction: along, center: [1, 2, 3] });
                const indexed = weld(mesh, 10);
                const volume = base.mesh.signedVolume({ mesh });
                const expected = frustumVolume(sides, bottomRadius, topRadius, height);
                expect(Math.abs(volume - expected)).toBeLessThanOrEqual(1e-12 * Math.max(1, expected) * sides);
                expect(unpairedEdges({ positions: indexed.positions, indices: trianglesOf(indexed).filter(([a, b, c]) => a !== b && b !== c && c !== a).flat() })).toEqual([]);
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("frustum along a world axis", () => {
        it("should place a frustum along X the same whether its direction carries noise of 1e-12 to 1e-300 off the axis or none", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 3, max: 12 }), fc.constantFrom(1e-12, 1e-15, 1e-20, 1e-100, 1e-300), fc.integer({ min: -1, max: 1 }), fc.integer({ min: -1, max: 1 }), (sides, noise, ySign, zSign) => {
                const exact = base.mesh.frustum({ sides, direction: [1, 0, 0] });
                const disturbed = base.mesh.frustum({ sides, direction: [1, ySign * noise, zSign * noise] });
                disturbed.forEach((triangle, at) => triangle.forEach((corner, index) => expect(lengthOf(minus(corner, exact[at]![index]!))).toBeLessThanOrEqual(1e-9)));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should place a three-sided frustum along X the same whether its direction leans a hair into Y or into Z", () => {
            // Act
            const intoY = base.mesh.frustum({ sides: 3, direction: [1, 1e-15, 0] });
            const intoZ = base.mesh.frustum({ sides: 3, direction: [1, 0, 1e-15] });

            // Assert
            intoY.forEach((triangle, at) => triangle.forEach((corner, index) => expect(lengthOf(minus(corner, intoZ[at]![index]!))).toBeLessThanOrEqual(1e-9)));
        });
    });

    describe("signedVolume", () => {
        it("should measure any box, turned and moved however far, as the product of its sides, and the box wound inward as its negative", () => {
            // Act & Assert
            fc.assert(fc.property(fc.tuple(fc.double({ min: 0.01, max: 10, noNaN: true }), fc.double({ min: 0.01, max: 10, noNaN: true }), fc.double({ min: 0.01, max: 10, noNaN: true })), turnArbitrary, fc.constantFrom(0, 1e3, 1e6), direction, (size, turn, far, toward) => {
                const box = boxOf(times(toward, far), size, turn);
                const volume = base.mesh.signedVolume({ mesh: box.mesh });
                const inward = base.mesh.signedVolume({ mesh: box.mesh.map(([a, b, c]): Triangle => [a, c, b]) });
                const tolerance = 1e-12 * Math.max(1, far) ** 2 * Math.max(...size);
                expect(Math.abs(volume - box.volume)).toBeLessThanOrEqual(tolerance);
                expect(Math.abs(inward + box.volume)).toBeLessThanOrEqual(tolerance);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should measure a closed mesh the same wherever it is moved, and by the cube of a scale", () => {
            // Act & Assert
            fc.assert(fc.property(pieceArbitrary, fc.tuple(fc.double({ min: -1e4, max: 1e4, noNaN: true }), fc.double({ min: -1e4, max: 1e4, noNaN: true }), fc.double({ min: -1e4, max: 1e4, noNaN: true })), fc.double({ min: 1e-3, max: 1e3, noNaN: true }), (piece, offset, scale) => {
                const here = base.mesh.signedVolume({ mesh: piece.mesh });
                const there = base.mesh.signedVolume({ mesh: placed(piece, offset, scale).mesh });
                expect(Math.abs(there - here * scale ** 3)).toBeLessThanOrEqual(1e-9 * Math.abs(here) * scale ** 3 * (1 + lengthOf(offset) / scale));
                expect(Math.abs(here - volumeOf(piece.mesh))).toBeLessThanOrEqual(1e-12 * Math.abs(here) * piece.mesh.length);
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("smoothNormals", () => {
        it("should give every point a triangle with area touches a normal of length 1 pointing out of a closed convex mesh, and an unused point a normal of 0", () => {
            // Act & Assert
            fc.assert(fc.property(pieceArbitrary, (piece) => {
                const welded = weld(piece.mesh);
                const withUnused: Indexed = { positions: [...welded.positions, 9, 9, 9], indices: welded.indices };
                const { normals } = base.mesh.smoothNormals({ mesh: withUnused });
                const count = welded.positions.length / 3;
                Array.from({ length: count }, (_, index) => {
                    const normal: Vec = [normals![index * 3]!, normals![index * 3 + 1]!, normals![index * 3 + 2]!];
                    expect(Math.abs(lengthOf(normal) - 1)).toBeLessThanOrEqual(1e-12);
                    expect(dotOf(normal, minus(cornerAt(welded, index), piece.centre))).toBeGreaterThan(0);
                    return normal;
                });
                expect(normals!.slice(count * 3)).toEqual([0, 0, 0]);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should turn its normals with the mesh, so no world axis decides them", () => {
            // Act & Assert
            fc.assert(fc.property(pieceArbitrary, turnArbitrary, (piece, turn) => {
                const welded = weld(piece.mesh);
                const turnedMesh: Indexed = { positions: Array.from({ length: welded.positions.length / 3 }, (_, index) => turned(turn, cornerAt(welded, index))).flat(), indices: welded.indices };
                const normals = base.mesh.smoothNormals({ mesh: welded }).normals!;
                const turnedNormals = base.mesh.smoothNormals({ mesh: turnedMesh }).normals!;
                Array.from({ length: welded.positions.length / 3 }, (_, index) => {
                    const expected = turned(turn, [normals[index * 3]!, normals[index * 3 + 1]!, normals[index * 3 + 2]!]);
                    expect(lengthOf(minus([turnedNormals[index * 3]!, turnedNormals[index * 3 + 1]!, turnedNormals[index * 3 + 2]!], expected))).toBeLessThanOrEqual(1e-9);
                    return expected;
                });
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("creasedNormals", () => {
        it("should split the corners two triangles share only when they turn from each other by more than the angle", () => {
            // Act & Assert
            fc.assert(fc.property(fc.double({ min: 0.5, max: 179, noNaN: true }), fc.double({ min: 0, max: 180, noNaN: true }), turnArbitrary, (bend, angle, turn) => {
                fc.pre(Math.abs(bend - angle) > 1e-6);
                const folded: Vec = [Math.cos(bend * Math.PI / 180), 0, Math.sin(bend * Math.PI / 180)];
                const corners: Vec[] = [[0, 0, 0], [0, 1, 0], [-1, 0.5, 0], [folded[0], folded[1] + 0.5, folded[2]]];
                const hinge: Indexed = { positions: corners.map(corner => turned(turn, corner)).flat(), indices: [0, 1, 2, 1, 0, 3] };
                const creased = base.mesh.creasedNormals({ mesh: hinge, angle });
                expect(creased.positions.length / 3).toBe(bend > angle ? 6 : 4);
                Array.from({ length: creased.positions.length / 3 }, (_, index) => expect(Math.abs(lengthOf([creased.normals![index * 3]!, creased.normals![index * 3 + 1]!, creased.normals![index * 3 + 2]!]) - 1)).toBeLessThanOrEqual(1e-12));
            }), { seed: SEED, numRuns: 300 });
        });

        it("should smooth across every edge at 180 degrees with the normals smoothNormals gives", () => {
            // Act & Assert
            fc.assert(fc.property(pieceArbitrary, (piece) => {
                const welded = weld(piece.mesh);
                const creased = base.mesh.creasedNormals({ mesh: welded, angle: 180 });
                const smooth = base.mesh.smoothNormals({ mesh: welded }).normals!;
                const sources = Array.from({ length: creased.positions.length / 3 }, (_, index) => {
                    const corner: Vec = [creased.positions[index * 3]!, creased.positions[index * 3 + 1]!, creased.positions[index * 3 + 2]!];
                    return Array.from({ length: welded.positions.length / 3 }, (_unused, source) => source).find(source => lengthOf(minus(cornerAt(welded, source), corner)) === 0)!;
                });
                expect(creased.positions.length).toBe(welded.positions.length);
                sources.forEach((source, index) => expect(lengthOf(minus([creased.normals![index * 3]!, creased.normals![index * 3 + 1]!, creased.normals![index * 3 + 2]!], [smooth[source * 3]!, smooth[source * 3 + 1]!, smooth[source * 3 + 2]!]))).toBeLessThanOrEqual(1e-12));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should keep every triangle on the points its corners stood on, wherever they are split", () => {
            // Act & Assert
            fc.assert(fc.property(pieceArbitrary, fc.double({ min: 0, max: 180, noNaN: true }), (piece, angle) => {
                const welded = weld(piece.mesh);
                const creased = base.mesh.creasedNormals({ mesh: welded, angle });
                expect(base.mesh.fromIndexed({ mesh: creased })).toEqual(base.mesh.fromIndexed({ mesh: welded }));
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("windingPieces and orientConsistently", () => {
        const soupArbitrary = fc.array(fc.record({ piece: pieceArbitrary, flips: fc.array(fc.boolean(), { minLength: 1, maxLength: 400 }) }), { minLength: 1, maxLength: 4 })
            .chain(parts => fc.array(fc.double({ min: 0, max: 1, noNaN: true }), { minLength: 1, maxLength: 64 }).map(keys => ({ parts, keys })))
            .map(({ parts, keys }) => {
                const meshes = parts.map(({ piece, flips }, index) => {
                    const indexed = weld(placed(piece, [index * 10, 0, 0], 1).mesh, 10);
                    const triangles = trianglesOf(indexed).filter(([a, b, c]) => a !== b && b !== c && c !== a);
                    const areas = triangles.map(triangle => lengthOf(normalOf(triangle.map(corner => cornerAt(indexed, corner)))));
                    const total = areas.reduce((sum, area) => sum + area, 0);
                    let flippedArea = 0;
                    const flipped = triangles.map((triangle, at) => {
                        const flip = flips[at % flips.length]! && flippedArea + areas[at]! < 0.4 * total;
                        flippedArea += flip ? areas[at]! : 0;
                        return { triangle, flip };
                    });
                    return { indexed, flipped };
                });
                let offset = 0;
                const positions: number[] = [];
                const tagged = meshes.flatMap(({ indexed, flipped }, piece) => {
                    const shift = offset;
                    offset += indexed.positions.length / 3;
                    positions.push(...indexed.positions);
                    return flipped.map(({ triangle, flip }) => ({
                        piece,
                        original: triangle.map(corner => corner + shift),
                        given: (flip ? [triangle[0]!, triangle[2]!, triangle[1]!] : triangle).map(corner => corner + shift),
                    }));
                });
                return { positions, triangles: shuffled(tagged, keys), count: meshes.length };
            });

        it("should find each separate piece of a shuffled soup and the triangles that make each piece wind one way", () => {
            // Act & Assert
            fc.assert(fc.property(soupArbitrary, ({ positions, triangles, count }) => {
                const indices = triangles.flatMap(({ given }) => given);
                const { turnOver, pieces, count: found } = base.mesh.windingPieces({ mesh: { positions, indices } });
                expect(found).toBe(count);
                const truthOf = new Map<number, number>();
                const foundOf = new Map<number, number>();
                triangles.forEach(({ piece }, at) => {
                    expect(truthOf.get(pieces[at]!) ?? piece).toBe(piece);
                    expect(foundOf.get(piece) ?? pieces[at]).toBe(pieces[at]);
                    truthOf.set(pieces[at]!, piece);
                    foundOf.set(piece, pieces[at]!);
                });
                const mended = triangles.flatMap(({ given }, at) => (turnOver[at] ? [given[0]!, given[2]!, given[1]!] : given));
                expect(unpairedEdges({ positions, indices: mended })).toEqual([]);
            }), { seed: SEED, numRuns: 60 });
        });

        it("should turn back the triangles written inside out, a minority of each piece's area, leaving every piece facing out", () => {
            // Act & Assert
            fc.assert(fc.property(soupArbitrary, ({ positions, triangles }) => {
                const oriented = base.mesh.orientConsistently({ mesh: { positions, indices: triangles.flatMap(({ given }) => given) } });
                expect(oriented.positions).toEqual(positions);
                trianglesOf(oriented).forEach((triangle, at) => expect(facing(triangle)).toBe(facing(triangles[at]!.original)));
                expect(base.mesh.orientConsistently({ mesh: oriented })).toEqual(oriented);
            }), { seed: SEED, numRuns: 60 });
        });
    });
});
