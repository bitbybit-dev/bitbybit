import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import type { TopoDS_Edge, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { OCCTService } from "../occ-service";
import * as Inputs from "../api/inputs";
import { HistoryOracles, outcomeOf, refusalParity } from "../__test__/history-oracles";

const SEED = 20261018;
const ON_THE_SURFACE = 1e-5;

type ProfileKind = "square" | "circle" | "rectangle" | "hexagon";

interface Profile {
    kind: ProfileKind;
    size: number;
    asFace: boolean;
}

describe("OCCT sweep and feature twins against their plain operations", () => {
    let occt: OCCTService;
    let oracles: HistoryOracles;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(kernel));
        oracles = new HistoryOracles(occt);
    }, 120_000);

    const outlineOf = (profile: Profile, center: Inputs.Base.Point3, direction: Inputs.Base.Vector3): TopoDS_Wire => {
        switch (profile.kind) {
            case "square":
                return occt.shapes.wire.createSquareWire({ size: profile.size, center, direction });
            case "circle":
                return occt.shapes.wire.createCircleWire({ radius: profile.size / 2, center, direction });
            case "rectangle":
                return occt.shapes.wire.createRectangleWire({ width: profile.size, length: profile.size / 3, center, direction });
            default:
                return occt.shapes.wire.createNGonWire({ radius: profile.size / 2, nrCorners: 6, center, direction });
        }
    };
    const sketchOf = (profile: Profile, center: Inputs.Base.Point3, direction: Inputs.Base.Vector3): TopoDS_Shape => {
        const outline = outlineOf(profile, center, direction);
        return profile.asFace ? occt.shapes.face.createFaceFromWire({ shape: outline, planar: true }) : outline;
    };
    const areaOfProfile = (profile: Profile): number => {
        switch (profile.kind) {
            case "square":
                return profile.size * profile.size;
            case "circle":
                return Math.PI * profile.size * profile.size / 4;
            case "rectangle":
                return profile.size * profile.size / 3;
            default:
                return 3 * Math.sqrt(3) / 2 * Math.pow(profile.size / 2, 2);
        }
    };
    const profiles: fc.Arbitrary<Profile> = fc.record({
        kind: fc.constantFrom<ProfileKind>("square", "circle", "rectangle", "hexagon"),
        size: fc.oneof(fc.constantFrom(1, 10), fc.double({ min: 0.01, max: 200, noNaN: true })),
        asFace: fc.boolean(),
    });
    const directions = fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }))
        .filter(([x, y, z]) => Math.hypot(x, y, z) > 0.2);
    const unit = ([x, y, z]: [number, number, number]): Inputs.Base.Vector3 => {
        const length = Math.hypot(x, y, z);
        return [x / length, y / length, z / length];
    };
    const perimeterOfProfile = (profile: Profile): number => {
        switch (profile.kind) {
            case "square":
                return 4 * profile.size;
            case "circle":
                return Math.PI * profile.size;
            case "rectangle":
                return 2 * (profile.size + profile.size / 3);
            default:
                return 3 * profile.size;
        }
    };
    const centreOf = (shape: TopoDS_Shape, face: number): Inputs.Base.Point3 => occt.shapes.face.getFaceCenterOfMass({ shape: occt.shapes.face.getFace({ shape, index: face }) });
    const along = (point: Inputs.Base.Point3, direction: Inputs.Base.Vector3): number => point[0] * direction[0] + point[1] * direction[1] + point[2] * direction[2];

    describe("extrusions of faces and wires along any direction", () => {
        it("should sweep what the plain extrusion sweeps, with its bottom on the profile and its top a length further on", () => {
            fc.assert(fc.property(profiles, directions, fc.double({ min: 0.01, max: 100, noNaN: true }), (profile, raw, length) => {
                // Arrange
                const direction = unit(raw);
                const shape = sketchOf(profile, [0, 0, 0], direction);
                const vector: Inputs.Base.Vector3 = [direction[0] * length, direction[1] * length, direction[2] * length];

                // Act
                const plain = outcomeOf(() => occt.operations.extrude({ shape, direction: vector }));
                const twin = outcomeOf(() => occt.operations.extrudeWithHistory({ shape, direction: vector }));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                const { shape: made, history } = twin.value!;
                const edges = occt.shapes.edge.getEdges({ shape }).length;
                const measure = (swept: TopoDS_Shape): number => profile.asFace ? oracles.volume(swept) : oracles.area(swept);
                const expected = (profile.asFace ? areaOfProfile(profile) : perimeterOfProfile(profile)) * length;
                expect(measure(made) / measure(plain.value!)).toBeCloseTo(1, 9);
                expect(measure(made) / expected).toBeCloseTo(1, 6);
                expect(oracles.indexViolations(history, shape, made)).toEqual([]);
                expect(history.facesFromEdges.map(faces => faces.length)).toEqual(Array(edges).fill(1));
                expect(history.firstFaces.map(face => along(centreOf(made, face), direction) / length)).toEqual(profile.asFace ? [expect.closeTo(0, 6)] : []);
                expect(history.lastFaces.map(face => along(centreOf(made, face), direction) / length)).toEqual(profile.asFace ? [expect.closeTo(1, 6)] : []);
                expect(oracles.reached([history])).toBe(oracles.counts(made).faces);
            }), { seed: SEED, numRuns: 25 });
        });
    });

    describe("revolutions about the Y axis", () => {
        it("should revolve what the plain revolution does, by any angle either way, naming its two ends only when it stops short of a turn", () => {
            const angles = fc.oneof(fc.constantFrom(360, -360, 720, 180, -90, 1), fc.double({ min: -400, max: 400, noNaN: true }).filter(angle => Math.abs(angle) > 0.5));
            fc.assert(fc.property(profiles, angles, fc.double({ min: 0.6, max: 5, noNaN: true }), (profile, angle, offset) => {
                // Arrange
                const shape = sketchOf(profile, [offset * profile.size, 0, 0], [0, 0, 1]);

                // Act
                const plain = outcomeOf(() => occt.operations.revolve({ shape, angle, direction: [0, 1, 0], copy: false }));
                const twin = outcomeOf(() => occt.operations.revolveWithHistory({ shape, angle, direction: [0, 1, 0], copy: false }));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                const { shape: made, history } = twin.value!;
                const turned = Math.min(Math.abs(angle), 360) * Math.PI / 180;
                const ends = profile.asFace && Math.abs(angle) < 360 ? 1 : 0;
                expect(oracles.indexViolations(history, shape, made)).toEqual([]);
                expect([history.firstFaces.length, history.lastFaces.length]).toEqual([ends, ends]);
                expect(oracles.reached([history])).toBe(oracles.counts(made).faces);
                const swept = profile.asFace ? oracles.volume(made) / areaOfProfile(profile) : oracles.area(made) / perimeterOfProfile(profile);
                expect(swept / (offset * profile.size * turned)).toBeCloseTo(1, 6);
            }), { seed: SEED, numRuns: 25 });
        });
    });

    describe("twisted extrusions", () => {
        it("should twist what the plain call twists and lead a face profile to the bottom it lies on", () => {
            fc.assert(fc.property(fc.constantFrom<ProfileKind>("square", "rectangle", "hexagon", "circle"), fc.double({ min: 0.5, max: 20, noNaN: true }), fc.double({ min: -360, max: 360, noNaN: true }), fc.double({ min: 1, max: 60, noNaN: true }), (kind, size, angle, height) => {
                // Arrange
                const shape = sketchOf({ kind, size, asFace: true }, [0, 0, 0], [0, 1, 0]);

                // Act
                const plain = outcomeOf(() => occt.operations.rotatedExtrude({ shape, height, angle, makeSolid: true }));
                const twin = outcomeOf(() => occt.operations.rotatedExtrudeWithHistory({ shape, height, angle, makeSolid: true }));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                if (plain.value !== undefined && twin.value !== undefined) {
                    const { shape: made, history } = twin.value;
                    expect(oracles.volume(made)).toBeCloseTo(oracles.volume(plain.value), 6);
                    expect(oracles.volume(made) / (areaOfProfile({ kind, size, asFace: true }) * height)).toBeCloseTo(1, 3);
                    expect(oracles.indexViolations(history, shape, made)).toEqual([]);
                    expect(history.faces).toEqual([history.firstFaces]);
                    expect(history.firstFaces.map(face => centreOf(made, face)[1])).toEqual([expect.closeTo(0, 6)]);
                    expect(history.lastFaces.map(face => centreOf(made, face)[1])).toEqual([expect.closeTo(height, 6)]);
                }
            }), { seed: SEED, numRuns: 12 });
        });
    });

    describe("lofts through circles", () => {
        const sections = fc.array(fc.record({ radius: fc.double({ min: 0.2, max: 10, noNaN: true }), rise: fc.double({ min: 0.2, max: 10, noNaN: true }) }), { minLength: 2, maxLength: 5 });

        it("should loft what the plain loft lofts, through edges as through wires, naming a side per section edge and its two caps", () => {
            fc.assert(fc.property(sections, fc.boolean(), fc.boolean(), (rings, asEdges, advanced) => {
                // Arrange
                const heights = rings.reduce<number[]>((sum, ring) => [...sum, (sum[sum.length - 1] ?? 0) + ring.rise], []);
                const shapes: (TopoDS_Wire | TopoDS_Edge)[] = rings.map((ring, at) => asEdges
                    ? occt.shapes.edge.createCircleEdge({ radius: ring.radius, center: [0, heights[at]!, 0], direction: [0, 1, 0] })
                    : occt.shapes.wire.createCircleWire({ radius: ring.radius, center: [0, heights[at]!, 0], direction: [0, 1, 0] }));
                const inputs = { ...new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>(), shapes, makeSolid: true, straight: true };

                // Act
                const plain = outcomeOf(() => advanced ? occt.operations.loftAdvanced(inputs) : occt.operations.loft({ shapes, makeSolid: true }));
                const twin = outcomeOf(() => advanced ? occt.operations.loftAdvancedWithHistory(inputs) : occt.operations.loftWithHistory({ shapes, makeSolid: true }));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                const { shape: made, histories } = twin.value!;
                expect(oracles.volume(made)).toBeCloseTo(oracles.volume(plain.value!), 6);
                expect(histories).toHaveLength(rings.length);
                expect(histories.map(history => history.facesFromEdges.flat().length > 0)).toEqual(Array(rings.length).fill(true));
                expect(histories.flatMap((history, at) => oracles.indexViolations(history, shapes[at]!, made))).toEqual([]);
                expect(histories[0]!.firstFaces.map(face => centreOf(made, face)[1])).toEqual([expect.closeTo(heights[0]!, 6)]);
                expect(histories[rings.length - 1]!.lastFaces.map(face => centreOf(made, face)[1])).toEqual([expect.closeTo(heights[rings.length - 1]!, 6)]);
                expect(oracles.reached(histories)).toBe(oracles.counts(made).faces);
            }), { seed: SEED, numRuns: 20 });
        });
    });

    describe("round tubes along polylines", () => {
        const paths = fc.array(fc.tuple(fc.double({ min: -10, max: 10, noNaN: true }), fc.double({ min: 1, max: 10, noNaN: true }), fc.double({ min: -10, max: 10, noNaN: true })), { minLength: 1, maxLength: 3 });

        it("should build the tube the plain call builds, or refuse it alike, naming a wall per edge and its two caps", () => {
            fc.assert(fc.property(paths, fc.double({ min: 0.05, max: 2, noNaN: true }), fc.integer({ min: 3, max: 8 }), fc.boolean(), (steps, radius, nrCorners, round) => {
                // Arrange
                const points = steps.reduce<Inputs.Base.Point3[]>((placed, [dx, dy, dz]) => {
                    const last = placed[placed.length - 1]!;
                    return [...placed, [last[0] + dx, last[1] + dy, last[2] + dz]];
                }, [[0, 0, 0]]);
                const shape = occt.shapes.wire.createPolylineWire({ points });
                const options = { radius, makeSolid: true, trihedronEnum: Inputs.OCCT.geomFillTrihedronEnum.isCorrectedFrenet, forceApproxC1: false };

                // Act
                const plain = outcomeOf(() => round ? occt.operations.pipeWireCylindrical({ shape, ...options }) : occt.operations.pipePolylineWireNGon({ shape, nrCorners, ...options }));
                const twin = outcomeOf(() => round ? occt.operations.pipeWireCylindricalWithHistory({ shape, ...options }) : occt.operations.pipePolylineWireNGonWithHistory({ shape, nrCorners, ...options }));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                if (plain.value !== undefined && twin.value !== undefined) {
                    const { shape: made, history } = twin.value;
                    expect(oracles.volume(made)).toBeCloseTo(oracles.volume(plain.value), 6);
                    expect(oracles.indexViolations(history, shape, made)).toEqual([]);
                    expect(history.facesFromEdges.map(faces => faces.length > 0)).toEqual(Array(steps.length).fill(true));
                    expect([history.firstFaces.length, history.lastFaces.length]).toEqual([1, 1]);
                    expect(oracles.reached([history])).toBe(oracles.counts(made).faces);
                }
            }), { seed: SEED, numRuns: 20 });
        });
    });

    describe("drafts of the sides of a box", () => {
        it("should tilt a side as the plain draft does, by any small angle either way", () => {
            fc.assert(fc.property(fc.double({ min: 1, max: 40, noNaN: true }), fc.double({ min: -15, max: 15, noNaN: true }).filter(angle => Math.abs(angle) > 0.05), fc.integer({ min: 0, max: 3 }), (side, angle, wall) => {
                // Arrange
                const shape = occt.shapes.solid.createBox({ width: side, length: side, height: side, center: [0, side / 2, 0] });
                const sides = occt.shapes.face.getFaces({ shape }).filter(face => Math.abs(occt.shapes.face.normalOnUV({ shape: face, paramU: 0.5, paramV: 0.5 })[1]) < 1e-9);
                const faces = [sides[wall]!];
                const inputs = { shape, faces, direction: [0, 1, 0] as Inputs.Base.Vector3, angle, neutralPlaneOrigin: [0, 0, 0] as Inputs.Base.Point3, neutralPlaneDirection: [0, 1, 0] as Inputs.Base.Vector3, flag: true };

                // Act
                const plain = outcomeOf(() => occt.draft.draftAngle(inputs));
                const twin = outcomeOf(() => occt.draft.draftAngleWithHistory(inputs));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                const { shape: made, history } = twin.value!;
                const wedge = side * side * side * Math.tan(Math.abs(angle) * Math.PI / 180) / 2;
                expect(oracles.volume(made) / oracles.volume(plain.value!)).toBeCloseTo(1, 9);
                expect(oracles.indexViolations(history, shape, made)).toEqual([]);
                expect(history.faces.map(successors => successors.length)).toEqual(Array(6).fill(1));
                expect(Math.abs(oracles.volume(made) - side * side * side) / wedge).toBeCloseTo(1, 6);
            }), { seed: SEED, numRuns: 15 });
        });
    });

    describe("what the twins found at their edges", () => {
        it("should follow a ruled loft through four circles as the plain loft builds it, crediting each circle with its whole column of bands as OCCT does, rather than throw from the kernel", () => {
            // Arrange
            const shapes = [1, 2, 3, 4].map(height => occt.shapes.wire.createCircleWire({ radius: 1, center: [0, height, 0], direction: [0, 1, 0] }));
            const inputs = { ...new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>(), shapes, makeSolid: true, straight: true };

            // Act
            const plain = outcomeOf(() => occt.operations.loftAdvanced(inputs));
            const twin = outcomeOf(() => occt.operations.loftAdvancedWithHistory(inputs));

            // Assert
            expect(oracles.volume(plain.value!)).toBeCloseTo(3 * Math.PI, 6);
            expect(refusalParity(plain, twin)).toEqual([]);
            expect(twin.value?.histories.map(history => history.facesFromEdges.flat().length)).toEqual([3, 3, 3, 3]);
        });

        it("should lead a face twisted up to the bottom it lies on", () => {
            // Arrange
            const shape = occt.shapes.face.createSquareFace({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const { shape: made, history } = occt.operations.rotatedExtrudeWithHistory({ shape, height: 20, angle: 90, makeSolid: true });

            // Assert
            expect(history.faces).toEqual([history.firstFaces]);
            expect(history.faces[0]!.map(face => occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFace({ shape: made, index: face }) }))).toEqual([expect.closeTo(25, 9)]);
        });

        it("should name the cap a draft up to a ceiling ends in as where it ends", () => {
            // Arrange
            const shape = occt.shapes.wire.createSquareWire({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] });
            const stopShape = occt.shapes.face.createSquareFace({ size: 40, center: [0, 3, 0], direction: [0, 1, 0] });

            // Act
            const { shape: made, history } = occt.draft.makeDraftToShapeWithHistory({ shape, direction: [0, 1, 0], angle: 5, stopShape, keepOut: false, internal: false });

            // Assert
            expect(oracles.reached([history])).toBe(oracles.counts(made).faces);
            expect(history.lastFaces.map(face => centreOf(made, face)[1])).toEqual([expect.closeTo(3, 9)]);
        });

        it("should start a twisted extrusion on the plane of its profile, not the kernel's tolerance below it", () => {
            // Arrange
            const shape = occt.shapes.face.createSquareFace({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const { shape: made, history } = occt.operations.rotatedExtrudeWithHistory({ shape, height: 20, angle: 90, makeSolid: true });

            // Assert
            expect([...history.firstFaces, ...history.lastFaces].map(face => centreOf(made, face)[1])).toEqual([expect.closeTo(0, 9), expect.closeTo(20, 9)]);
        });
    });

    describe("holes drilled into a plate", () => {
        it("should drill what the plain call drills and give every hole its own wall", () => {
            const spots = fc.uniqueArray(fc.tuple(fc.integer({ min: -3, max: 3 }), fc.integer({ min: -3, max: 3 })), { minLength: 1, maxLength: 5, selector: ([x, z]) => `${x},${z}` });
            fc.assert(fc.property(spots, fc.double({ min: 0.2, max: 2, noNaN: true }), fc.double({ min: 0, max: 8, noNaN: true }), (where, diameter, depth) => {
                // Arrange
                const shape = occt.shapes.solid.createBox({ width: 30, length: 30, height: 5, center: [0, 2.5, 0] });
                const frames: Inputs.Base.Frame[] = where.map(([x, z]) => ({ origin: [4 * x, 5, 4 * z], normal: [0, 1, 0], direction: [1, 0, 0] }));
                const inputs = { shape, frames, diameter, depth, tipAngle: 0 };

                // Act
                const plain = outcomeOf(() => occt.features.holes(inputs));
                const twin = outcomeOf(() => occt.features.holesWithHistory(inputs));

                // Assert
                expect(refusalParity(plain, twin)).toEqual([]);
                const { shape: made, histories } = twin.value!;
                const drilled = Math.PI * diameter * diameter / 4 * (depth === 0 ? 5 : Math.min(depth, 5)) * where.length;
                expect(oracles.volume(made) / oracles.volume(plain.value!)).toBeCloseTo(1, 9);
                expect(oracles.volume(made) / (30 * 30 * 5 - drilled)).toBeCloseTo(1, 6);
                expect(histories).toHaveLength(where.length + 1);
                expect(histories.slice(1).map(hole => hole.faces.flat().length > 0)).toEqual(Array(where.length).fill(true));
                expect(oracles.successorViolations(histories[0]!, shape, made, ON_THE_SURFACE)).toEqual([]);
                expect(oracles.reached(histories)).toBe(oracles.counts(made).faces);
            }), { seed: SEED, numRuns: 15 });
        });
    });
});
