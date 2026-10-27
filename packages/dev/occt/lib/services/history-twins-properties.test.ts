import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import type { TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { OCCTService } from "../occ-service";
import * as Inputs from "../api/inputs";
import type * as Models from "../api/models";
import { HistoryOracles, outcomeOf, refusalParity } from "../__test__/history-oracles";

const SEED = 20261018;
const ON_THE_SURFACE = 1e-5;

type ToolKind = "sphere" | "cylinder" | "box";
type BooleanKind = "union" | "difference" | "intersection";

interface Tool {
    kind: ToolKind;
    x: number;
    y: number;
    z: number;
    size: number;
}

describe("OCCT history twins against their plain operations", () => {
    let occt: OCCTService;
    let oracles: HistoryOracles;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(kernel));
        oracles = new HistoryOracles(occt);
    }, 120_000);

    const cube = (size: number): TopoDS_Shape => occt.shapes.solid.createBox({ width: size, length: size, height: size, center: [0, 0, 0] });
    const toolOf = (tool: Tool): TopoDS_Shape => {
        switch (tool.kind) {
            case "sphere":
                return occt.shapes.solid.createSphere({ radius: tool.size, center: [tool.x, tool.y, tool.z] });
            case "cylinder":
                return occt.shapes.solid.createCylinder({ radius: tool.size, height: 10, center: [tool.x, tool.y - 5, tool.z], direction: [0, 1, 0] });
            default:
                return occt.shapes.solid.createBox({ width: tool.size, length: tool.size, height: tool.size, center: [tool.x, tool.y, tool.z] });
        }
    };
    const plainBoolean = (kind: BooleanKind, shapes: TopoDS_Shape[], keepEdges: boolean): TopoDS_Shape => {
        switch (kind) {
            case "union":
                return occt.booleans.union({ shapes, keepEdges });
            case "difference":
                return occt.booleans.difference({ shape: shapes[0]!, shapes: shapes.slice(1), keepEdges });
            default:
                return occt.booleans.intersection({ shapes, keepEdges });
        }
    };
    const twinBoolean = (kind: BooleanKind, shapes: TopoDS_Shape[], keepEdges: boolean): Models.OCCT.ShapeWithHistories<TopoDS_Shape> => {
        switch (kind) {
            case "union":
                return occt.booleans.unionWithHistory({ shapes, keepEdges });
            case "difference":
                return occt.booleans.differenceWithHistory({ shape: shapes[0]!, shapes: shapes.slice(1), keepEdges });
            default:
                return occt.booleans.intersectionWithHistory({ shapes, keepEdges });
        }
    };
    const sameGeometry = (plain: TopoDS_Shape, twin: TopoDS_Shape): string[] => {
        const faces = [oracles.counts(plain).faces, oracles.counts(twin).faces];
        const volumes = [oracles.volume(plain), oracles.volume(twin)];
        return [
            ...(faces[0] === faces[1] ? [] : [`the plain result has ${faces[0]} faces and the twin's ${faces[1]}`]),
            ...(Math.abs(volumes[0]! - volumes[1]!) <= 1e-6 * Math.max(1, Math.abs(volumes[0]!)) ? [] : [`the plain result holds ${volumes[0]} and the twin's ${volumes[1]}`]),
        ];
    };

    const snapped = fc.oneof(fc.constantFrom(-5, -2.5, 0, 2.5, 5), fc.double({ min: -6, max: 6, noNaN: true }));
    const tools: fc.Arbitrary<Tool> = fc.record({
        kind: fc.constantFrom<ToolKind>("sphere", "cylinder", "box"),
        x: snapped,
        y: snapped,
        z: snapped,
        size: fc.oneof(fc.constantFrom(2.5, 5, 10), fc.double({ min: 0.5, max: 8, noNaN: true })),
    });

    describe("booleans of a box with a ball, a rod or a box anywhere about it", () => {
        it("should build what the plain boolean builds and follow every face to pieces of itself", () => {
            fc.assert(fc.property(tools, fc.constantFrom<BooleanKind>("union", "difference", "intersection"), fc.boolean(), (tool, kind, keepEdges) => {
                // Arrange
                const shapes = [cube(10), toolOf(tool)];

                // Act
                const plain = outcomeOf(() => plainBoolean(kind, shapes, keepEdges));
                const twin = outcomeOf(() => twinBoolean(kind, shapes, keepEdges));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                if (plain.value !== undefined && twin.value !== undefined) {
                    const made = twin.value;
                    expect(sameGeometry(plain.value, made.shape)).toEqual([]);
                    expect(made.histories.flatMap((history, at) => oracles.indexViolations(history, shapes[at]!, made.shape))).toEqual([]);
                    expect(made.histories.flatMap((history, at) => oracles.successorViolations(history, shapes[at]!, made.shape, ON_THE_SURFACE))).toEqual([]);
                    expect(oracles.reached(made.histories)).toBe(oracles.counts(made.shape).faces);
                }
            }), { seed: SEED, numRuns: 40 });
        });
    });

    describe("fillets and chamfers of boxes of any proportions", () => {
        const proportions = fc.record({
            width: fc.double({ min: 0.5, max: 40, noNaN: true }),
            length: fc.double({ min: 0.5, max: 40, noNaN: true }),
            height: fc.double({ min: 0.5, max: 40, noNaN: true }),
        });
        const edgeChoices = fc.option(fc.uniqueArray(fc.integer({ min: 0, max: 11 }), { minLength: 1, maxLength: 12 }), { nil: undefined });

        it("should round and bevel what the plain call does and name a face along every edge it was given", () => {
            fc.assert(fc.property(proportions, fc.double({ min: 0.01, max: 0.45, noNaN: true }), edgeChoices, fc.boolean(), (size, fraction, indexes, rounds) => {
                // Arrange
                const shape = occt.shapes.solid.createBox({ ...size, center: [0, 0, 0] });
                const radius = fraction * Math.min(size.width, size.length, size.height);

                // Act
                const plain = outcomeOf(() => rounds ? occt.fillets.filletEdges({ shape, radius, indexes }) : occt.fillets.chamferEdges({ shape, distance: radius, indexes }));
                const twin = outcomeOf(() => rounds ? occt.fillets.filletEdgesWithHistory({ shape, radius, indexes }) : occt.fillets.chamferEdgesWithHistory({ shape, distance: radius, indexes }));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                if (plain.value !== undefined && twin.value !== undefined) {
                    const { shape: made, history } = twin.value;
                    const given = indexes ?? Array.from({ length: 12 }, (_, edge) => edge);
                    expect(sameGeometry(plain.value, made)).toEqual([]);
                    expect(oracles.indexViolations(history, shape, made)).toEqual([]);
                    expect(oracles.successorViolations(history, shape, made, ON_THE_SURFACE * Math.max(1, radius))).toEqual([]);
                    expect(given.filter(edge => history.facesFromEdges[edge]!.length === 0)).toEqual([]);
                    expect(oracles.reached([history])).toBe(oracles.counts(made).faces);
                }
            }), { seed: SEED, numRuns: 25 });
        });

        it("should put the round along a box edge exactly r(sqrt 2 - 1) from the edge it replaces, and a bevel of d at d / sqrt 2", () => {
            fc.assert(fc.property(fc.double({ min: 1, max: 30, noNaN: true }), fc.double({ min: 0.02, max: 0.4, noNaN: true }), fc.integer({ min: 0, max: 11 }), fc.boolean(), (side, fraction, edge, rounds) => {
                // Arrange
                const shape = cube(side);
                const size = fraction * side;
                const replaced = occt.shapes.edge.getEdge({ shape, index: edge });

                // Act
                const { shape: made, history } = rounds
                    ? occt.fillets.filletEdgesWithHistory({ shape, radius: size, indexes: [edge] })
                    : occt.fillets.chamferEdgesWithHistory({ shape, distance: size, indexes: [edge] });

                // Assert
                const along = history.facesFromEdges[edge]!;
                const expected = rounds ? size * (Math.SQRT2 - 1) : size / Math.SQRT2;
                expect(along).toHaveLength(1);
                const face = occt.shapes.face.getFace({ shape: made, index: along[0]! });
                const [onFace, onEdge] = occt.operations.closestPointsBetweenTwoShapes({ shape1: face, shape2: replaced });
                expect(Math.hypot(onFace[0] - onEdge[0], onFace[1] - onEdge[1], onFace[2] - onEdge[2])).toBeCloseTo(expected, 6);
            }), { seed: SEED, numRuns: 25 });
        });
    });

    describe("offsets of boxes", () => {
        it("should offset as the plain call does and move every face exactly the distance it was asked to", () => {
            fc.assert(fc.property(fc.double({ min: 1, max: 30, noNaN: true }), fc.oneof(fc.double({ min: -0.45, max: -0.01, noNaN: true }), fc.double({ min: 0.01, max: 2, noNaN: true })), fc.constantFrom(Inputs.OCCT.joinTypeEnum.arc, Inputs.OCCT.joinTypeEnum.intersection), (side, fraction, joinType) => {
                // Arrange
                const shape = cube(side);
                const distance = fraction * side;
                const inputs = { shape, distance, tolerance: 1e-7, joinType, removeIntEdges: false };

                // Act
                const plain = outcomeOf(() => occt.operations.offsetAdv(inputs));
                const twin = outcomeOf(() => occt.operations.offsetAdvWithHistory(inputs));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                if (plain.value !== undefined && twin.value !== undefined) {
                    const { shape: made, history } = twin.value;
                    const sources = occt.shapes.face.getFaces({ shape });
                    const results = occt.shapes.face.getFaces({ shape: made });
                    const moved = history.faces.flatMap((successors, source) => successors.map(successor => oracles.distanceTo(sources[source]!, occt.shapes.face.getFaceCenterOfMass({ shape: results[successor]! }))));
                    expect(sameGeometry(plain.value, made)).toEqual([]);
                    expect(oracles.indexViolations(history, shape, made)).toEqual([]);
                    expect(moved).toEqual(Array(6).fill(expect.closeTo(Math.abs(distance), 6)));
                    expect(oracles.reached([history])).toBe(oracles.counts(made).faces);
                }
            }), { seed: SEED, numRuns: 25 });
        });
    });

    describe("thick solids of boxes", () => {
        it("should hollow a box as the plain call does, from either side of its faces, and send the face it opens to the rim", () => {
            fc.assert(fc.property(fc.double({ min: 2, max: 30, noNaN: true }), fc.oneof(fc.double({ min: -0.3, max: -0.02, noNaN: true }), fc.double({ min: 0.02, max: 0.5, noNaN: true })), fc.integer({ min: 0, max: 5 }), (side, fraction, removed) => {
                // Arrange
                const shape = cube(side);
                const shapes = [occt.shapes.face.getFace({ shape, index: removed })];
                const offset = fraction * side;

                // Act
                const plain = outcomeOf(() => occt.operations.makeThickSolidByJoin({ shape, shapes, offset }));
                const twin = outcomeOf(() => occt.operations.makeThickSolidByJoinWithHistory({ shape, shapes, offset }));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                if (plain.value !== undefined && twin.value !== undefined) {
                    const { shape: made, history } = twin.value;
                    expect(sameGeometry(plain.value, made)).toEqual([]);
                    expect(oracles.indexViolations(history, shape, made)).toEqual([]);
                    const rim = offset < 0 ? side * side - Math.pow(side + 2 * offset, 2) : Math.pow(side + 2 * offset, 2) - side * side - (4 - Math.PI) * offset * offset;
                    const rims = history.faces[removed]!.map(face => occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFace({ shape: made, index: face }) }));
                    expect(rims).toEqual([expect.closeTo(rim, 4)]);
                    expect(oracles.reached([history])).toBe(oracles.counts(made).faces);
                }
            }), { seed: SEED, numRuns: 20 });
        });
    });

    describe("merging the faces of boxes fused side by side", () => {
        it("should merge as the plain call does and send every face to the one face that holds it", () => {
            fc.assert(fc.property(fc.double({ min: -4, max: 4, noNaN: true }), fc.constantFrom(0, 2, -3), fc.boolean(), (shift, lift, concatBSplines) => {
                // Arrange
                const pair = [cube(10), occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [10, lift, shift] })];
                const shape = occt.booleans.union({ shapes: pair, keepEdges: true });
                const inputs = { shape, unifyEdges: true, unifyFaces: true, concatBSplines };

                // Act
                const plain = outcomeOf(() => occt.shapes.shape.unifySameDomain(inputs));
                const twin = outcomeOf(() => occt.shapes.shape.unifySameDomainWithHistory(inputs));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                const { shape: made, history } = twin.value!;
                expect(sameGeometry(plain.value!, made)).toEqual([]);
                expect(oracles.indexViolations(history, shape, made)).toEqual([]);
                expect(history.faces.map(successors => successors.length)).toEqual(Array(oracles.counts(shape).faces).fill(1));
                expect(oracles.successorViolations(history, shape, made, ON_THE_SURFACE)).toEqual([]);
                expect(oracles.reached([history])).toBe(oracles.counts(made).faces);
            }), { seed: SEED, numRuns: 15 });
        });
    });

    describe("sewing the faces of a box", () => {
        it("should sew a shell and a solid as the plain calls do, from the faces in any order and a gap the tolerance spans", () => {
            const orders = fc.shuffledSubarray([0, 1, 2, 3, 4, 5], { minLength: 6, maxLength: 6 });
            fc.assert(fc.property(fc.double({ min: 0.5, max: 50, noNaN: true }), orders, fc.constantFrom(0, 5e-4), (side, order, gap) => {
                // Arrange
                const faces = occt.shapes.face.getFaces({ shape: cube(side) });
                const loosened = occt.transforms.translate({ shape: faces[0]!, translation: [0, 0, gap] });
                const shapes = order.map(at => at === 0 ? loosened : faces[at]!);
                const tolerance = gap === 0 ? 1e-7 : 1e-3;

                // Act
                const plainShell = outcomeOf(() => occt.shapes.shell.sewFaces({ shapes, tolerance }));
                const twinShell = outcomeOf(() => occt.shapes.shell.sewFacesWithHistory({ shapes, tolerance }));
                const plainSolid = outcomeOf(() => occt.shapes.solid.fromFaces({ shapes, tolerance }));
                const twinSolid = outcomeOf(() => occt.shapes.solid.fromFacesWithHistory({ shapes, tolerance }));

                // Assert
                expect([...refusalParity(plainShell, twinShell), ...refusalParity(plainSolid, twinSolid)]).toEqual([]);
                expect(oracles.area(plainShell.value!)).toBeCloseTo(oracles.area(twinShell.value!.shape), 6);
                expect(Math.abs(oracles.volume(twinSolid.value!.shape) - side * side * side)).toBeLessThan(2 * gap * side * side + 1e-6);
                expect(oracles.volume(plainSolid.value!)).toBeCloseTo(oracles.volume(twinSolid.value!.shape), 9);
                const solid = twinSolid.value!;
                expect(solid.histories.map(history => history.faces.flat().length)).toEqual(Array(6).fill(1));
                expect(solid.histories.flatMap((history, at) => oracles.successorViolations(history, shapes[at]!, solid.shape, ON_THE_SURFACE * side + 2 * gap))).toEqual([]);
            }), { seed: SEED, numRuns: 15 });
        });
    });

    describe("splitting a box by a plane through it at any angle", () => {
        it("should cut the pieces the plain split cuts and follow every face to pieces of itself", () => {
            const directions = fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true })).filter(([x, y, z]) => Math.hypot(x, y, z) > 0.1);
            fc.assert(fc.property(directions, fc.double({ min: -4, max: 4, noNaN: true }), (direction, along) => {
                // Arrange
                const shape = cube(10);
                const knife = occt.shapes.face.createSquareFace({ size: 40, center: [along, 0, 0], direction });
                const inputs = { shape, shapes: [knife], localFuzzyTolerance: 1e-7, nonDestructive: false };

                // Act
                const plain = outcomeOf(() => occt.operations.splitShapeWithShapes(inputs));
                const twin = outcomeOf(() => occt.operations.splitShapeWithShapesWithHistory(inputs));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                if (plain.value !== undefined && twin.value !== undefined) {
                    const made = twin.value;
                    expect(occt.shapes.solid.getSolids({ shape: made.shape })).toHaveLength(plain.value.length);
                    expect(oracles.volume(made.shape)).toBeCloseTo(1000, 6);
                    expect(oracles.indexViolations(made.histories[0]!, shape, made.shape)).toEqual([]);
                    expect(oracles.successorViolations(made.histories[0]!, shape, made.shape, ON_THE_SURFACE)).toEqual([]);
                }
            }), { seed: SEED, numRuns: 15 });
        });
    });

    describe("what the twins found at their edges", () => {
        it("should leave the twin of a union of a box and a rod that shares its top and bottom pointing every face at pieces of itself", () => {
            // Arrange
            const shapes = [cube(10), occt.shapes.solid.createCylinder({ radius: 2.5, height: 10, center: [-2.5, -5, 0], direction: [0, 1, 0] })];

            // Act
            const made = occt.booleans.unionWithHistory({ shapes, keepEdges: false });

            // Assert
            expect(sameGeometry(occt.booleans.union({ shapes, keepEdges: false }), made.shape)).toEqual([]);
            expect(made.histories.flatMap((history, at) => oracles.successorViolations(history, shapes[at]!, made.shape, ON_THE_SURFACE))).toEqual([]);
            expect(oracles.reached(made.histories)).toBe(oracles.counts(made.shape).faces);
        });

        it.fails("should leave a box that holds a ball touching its walls to within rounding error with its own six faces, and lead the ball to none - it still keeps a sliver of the ball until the union takes a fuzzy value", () => {
            // Arrange
            const roundingError = -2.2204460492503135e-15;
            const shapes = [cube(10), occt.shapes.solid.createSphere({ radius: 5, center: [roundingError, 0, 0] })];

            // Act
            const kept = occt.booleans.unionWithHistory({ shapes, keepEdges: true });
            const merged = occt.booleans.unionWithHistory({ shapes, keepEdges: false });

            // Assert
            expect([oracles.counts(kept.shape).faces, oracles.counts(merged.shape).faces]).toEqual([6, 6]);
            expect([kept.histories[1]!.faces, merged.histories[1]!.faces]).toEqual([[[]], [[]]]);
        });

        it.fails("should leave no sliver face where a ball pokes out of a box by less than the kernel's tolerance - it still leaves two until the union takes a fuzzy value", () => {
            // Arrange
            const belowTolerance = 1e-9;
            const shapes = [cube(10), occt.shapes.solid.createSphere({ radius: 5, center: [belowTolerance, 0, 0] })];

            // Act
            const fused = occt.booleans.union({ shapes, keepEdges: true });

            // Assert
            expect(occt.shapes.face.getFaces({ shape: fused }).map(face => occt.shapes.face.getFaceArea({ shape: face }))).toEqual(Array(6).fill(expect.closeTo(100, 6)));
        });

        it("should refuse, or give a valid solid, when it rounds every edge of a box with a radius past half its side", () => {
            // Arrange
            const shape = cube(10);

            // Act
            const rounded = outcomeOf(() => occt.fillets.filletEdges({ shape, radius: 5.5 }));

            // Assert
            expect(rounded.value === undefined || occt.shapeFix.isValid({ shape: rounded.value })).toBe(true);
        });
    });
});
