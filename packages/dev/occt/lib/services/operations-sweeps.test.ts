import { describe, it, expect, beforeAll, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import * as Inputs from "../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT evolved and scaled sweeps", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const squareSpine = (): TopoDS_Shape => occt.shapes.wire.createSquareWire({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
    const post = (across: number): TopoDS_Shape => occt.shapes.edge.line({ start: [0, across, 0], end: [0, across, 5] });
    const upright = (): TopoDS_Shape => occt.shapes.edge.line({ start: [0, 0, 0], end: [0, 10, 0] });
    const ring = (): TopoDS_Shape => occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
    const areaOf = (shape: TopoDS_Shape): number => occt.shapes.face.getFaces({ shape }).reduce((sum, face) => sum + occt.shapes.face.getFaceArea({ shape: face }), 0);
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    const sectionAreasOf = (shape: TopoDS_Shape, heights: number[]): number[] =>
        occt.operations.sliceByFrames({ shape, frames: heights.map((y): Inputs.Base.Frame => ({ origin: [0, y, 0], normal: [0, 1, 0], direction: [1, 0, 0] })) }).map(areaOf);
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };
    const loose = <T>(value: unknown): T => value as T;
    const point = (): TopoDS_Shape => occt.shapes.vertex.vertexFromXYZ({ x: 0, y: 0, z: 0 });
    const refusalOf = (action: () => unknown): unknown => {
        try {
            action();
        } catch (error) {
            return error;
        }
        return undefined;
    };

    describe("sweepEvolved", () => {
        it("should raise a wall on the spine, inside it or outside it by where the profile stands across it", () => {
            // Arrange
            const spine = squareSpine();

            // Act
            const on = occt.operations.sweepEvolved({ spine, profile: post(0), makeSolid: false });
            const inside = occt.operations.sweepEvolved({ spine, profile: post(1), makeSolid: false });
            const outside = occt.operations.sweepEvolved({ spine, profile: post(-1), makeSolid: false });

            // Assert
            const onBox = occt.operations.boundingBoxOfShape({ shape: on });
            expect(areaOf(on)).toBeCloseTo(200, 6);
            expect([onBox.min[1], onBox.max[1]]).toEqual([0, 5].map(y => expect.closeTo(y, 6)));
            expect(areaOf(inside)).toBeCloseTo(4 * 8 * 5, 6);
            expect(occt.operations.boundingBoxOfShape({ shape: inside }).size[0]).toBeCloseTo(8, 6);
            expect(areaOf(outside)).toBeCloseTo(200 + 10 * Math.PI, 6);
            expect(occt.operations.boundingBoxOfShape({ shape: outside }).size[0]).toBeCloseTo(12, 6);
        });

        it("should close a closed profile into one solid wall by default", () => {
            // Arrange
            const profile = occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] });

            // Act
            const wall = occt.operations.sweepEvolved({ spine: squareSpine(), profile });

            // Assert
            expect(occt.shapes.solid.getSolids({ shape: wall })).toHaveLength(1);
            expect(volumeOf(wall)).toBeCloseTo(100 - 64, 6);
        });

        it("should cap a wall round a closed spine into a solid by default", () => {
            // Arrange
            const spine = squareSpine();

            // Act
            const onSpine = occt.operations.sweepEvolved({ spine, profile: post(0) });
            const inside = occt.operations.sweepEvolved({ spine, profile: post(1) });

            // Assert
            expect(occt.shapes.shape.getShapeType({ shape: onSpine })).toBe(Inputs.OCCT.shapeTypeEnum.solid);
            expect(volumeOf(onSpine)).toBeCloseTo(10 * 10 * 5, 6);
            expect(volumeOf(inside)).toBeCloseTo(8 * 8 * 5, 6);
        });

        it("should sweep along the boundary of a face", () => {
            // Arrange
            const spine = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const wall = occt.operations.sweepEvolved({ spine, profile: post(0), makeSolid: false });

            // Assert
            expect(areaOf(wall)).toBeCloseTo(200, 6);
        });

        it("should refuse a spine out of plane, a curve or a point as the spine, and a face or a point as the profile as input errors naming each", () => {
            // Arrange
            const bent = occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [10, 0, 0], [10, 5, 10], [0, 0, 10]] });
            const circle = occt.shapes.edge.createCircleEdge({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
            const face = occt.shapes.face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [1, 0, 0] });

            // Act
            const refusals = [
                refusalOf(() => occt.operations.sweepEvolved({ spine: bent, profile: post(0) })),
                refusalOf(() => occt.operations.sweepEvolved({ spine: loose(circle), profile: post(0) })),
                refusalOf(() => occt.operations.sweepEvolved({ spine: loose(point()), profile: post(0) })),
                refusalOf(() => occt.operations.sweepEvolved({ spine: squareSpine(), profile: loose(face) })),
                refusalOf(() => occt.operations.sweepEvolved({ spine: squareSpine(), profile: loose(point()) })),
            ];

            // Assert
            expect(refusals).toEqual([
                expect.objectContaining({ name: "InputError", property: "spine", message: "`spine` does not lie in a plane, and an evolved sweep follows a flat spine: give a wire or a face that lies in one plane." }),
                expect.objectContaining({ name: "InputError", property: "spine", message: "`spine` is an edge, and an evolved sweep follows a wire or a planar face." }),
                expect.objectContaining({ name: "InputError", property: "spine", message: "`spine` is a vertex, and an evolved sweep follows a wire or a planar face." }),
                expect.objectContaining({ name: "InputError", property: "profile", message: "`profile` is a face, and an evolved sweep moves an edge or a wire along the spine." }),
                expect.objectContaining({ name: "InputError", property: "profile", message: "`profile` is a vertex, and an evolved sweep moves an edge or a wire along the spine." }),
            ]);
        });

        it("should refuse a curved face as the spine as an input error naming it, as it refuses a wire out of plane", () => {
            // Arrange
            const roundSide = occt.shapes.face.getFace({ shape: occt.shapes.solid.createCylinder({ radius: 5, height: 5, center: [0, 0, 0], direction: [0, 1, 0] }), index: 0 });

            // Act
            const refused = refusalOf(() => occt.operations.sweepEvolved({ spine: roundSide, profile: post(0) }));

            // Assert
            expect(refused).toEqual(expect.objectContaining({ name: "InputError", property: "spine", message: "`spine` does not lie in a plane, and an evolved sweep follows a flat spine: give a wire or a face that lies in one plane." }));
        });

        it("should refuse a missing spine or profile", () => {
            // Arrange
            const spine = squareSpine();

            // Act
            const noSpine = thrownBy(() => occt.operations.sweepEvolved({ spine: loose(undefined), profile: post(0) }));
            const noProfile = thrownBy(() => occt.operations.sweepEvolved({ spine, profile: loose(null) }));

            // Assert
            expect(noSpine.message).toBe("`spine` is missing or empty, as an operation that failed can leave it.");
            expect(noProfile.message).toBe("`profile` is missing or empty, as an operation that failed can leave it.");
        });
    });

    describe("pipe placed off its path", () => {
        const RAIL_HALF = 290;
        const RAIL_RISE = 370;
        const RAIL_BEND = 60;
        const RAIL_FOOT = 20;
        const RAIL_RADIUS = 14;
        const BEYOND_REACH = 30;
        const CIRCLE = Math.PI * RAIL_RADIUS * RAIL_RADIUS;
        const lengthOf = (farLeg: number): number => (RAIL_RISE - RAIL_BEND + RAIL_FOOT) + 2 * (RAIL_HALF - RAIL_BEND) + (RAIL_RISE - RAIL_BEND + farLeg) + Math.PI * RAIL_BEND;
        const rail = (farLeg = RAIL_FOOT): TopoDS_Shape => {
            const across = RAIL_BEND * Math.SQRT1_2;
            const top = RAIL_RISE - RAIL_BEND;
            const { edge } = occt.shapes;
            return occt.shapes.wire.combineEdgesAndWiresIntoAWire({ shapes: [
                edge.line({ start: [0, -RAIL_HALF, -RAIL_FOOT], end: [0, -RAIL_HALF, top] }),
                edge.arcThroughThreePoints({ start: [0, -RAIL_HALF, top], middle: [0, -RAIL_HALF + RAIL_BEND - across, top + across], end: [0, -RAIL_HALF + RAIL_BEND, RAIL_RISE] }),
                edge.line({ start: [0, -RAIL_HALF + RAIL_BEND, RAIL_RISE], end: [0, RAIL_HALF - RAIL_BEND, RAIL_RISE] }),
                edge.arcThroughThreePoints({ start: [0, RAIL_HALF - RAIL_BEND, RAIL_RISE], middle: [0, RAIL_HALF - RAIL_BEND + across, top + across], end: [0, RAIL_HALF, top] }),
                edge.line({ start: [0, RAIL_HALF, top], end: [0, RAIL_HALF, -farLeg] }),
            ] });
        };
        const circleAt = (center: Inputs.Base.Point3, direction: Inputs.Base.Vector3): TopoDS_Shape => occt.shapes.wire.createCircleWire({ radius: RAIL_RADIUS, center, direction });
        const circleBelowTheStart = (below: number): TopoDS_Shape => circleAt([0, -RAIL_HALF, -RAIL_FOOT - below], [0, 0, 1]);
        const squareBelowTheStart = (side: number, below: number): TopoDS_Shape => occt.shapes.wire.createSquareWire({ size: side, center: [0, -RAIL_HALF, -RAIL_FOOT - below], direction: [0, 0, 1] });
        const extentsOf = (shape: TopoDS_Shape): { min: Inputs.Base.Point3; max: Inputs.Base.Point3; farFoot: number } => {
            const points = occt.shapeToMesh({ shape, precision: 0.05, adjustYtoZ: false }).faceList.flatMap(face => face.vertexCoordVec);
            const least = (axis: 0 | 1 | 2): number => points.reduce((found, point) => Math.min(found, point[axis]), Number.POSITIVE_INFINITY);
            const most = (axis: 0 | 1 | 2): number => points.reduce((found, point) => Math.max(found, point[axis]), Number.NEGATIVE_INFINITY);
            const farFoot = points.filter(point => point[1] > 0).reduce((found, point) => Math.min(found, point[2]), Number.POSITIVE_INFINITY);
            return { min: [least(0), least(1), least(2)], max: [most(0), most(1), most(2)], farFoot };
        };
        const expectTheRail = (pipe: TopoDS_Shape, area: number, farLeg = RAIL_FOOT, halfWidth = RAIL_RADIUS, behindTheStart = 0): void => {
            const box = extentsOf(pipe);
            expect(Math.abs(volumeOf(pipe) / (area * lengthOf(farLeg)) - 1)).toBeLessThan(0.005);
            expect(box.max[2]).toBeCloseTo(RAIL_RISE + halfWidth, 0);
            expect(-box.min[1]).toBeCloseTo(RAIL_HALF + halfWidth, 0);
            expect(box.max[1]).toBeLessThan(RAIL_HALF + halfWidth + 0.5);
            expect(box.min[2]).toBeGreaterThan(-RAIL_FOOT - 6);
            expect(box.farFoot).toBeCloseTo(-farLeg + behindTheStart, 1);
        };
        const insideOut = expect.objectContaining({ name: "KernelOperationError", code: "occt.pipe.insideOut" });

        it("should sweep the whole path from a profile just off its start, at any small offset, the profile keeping its offset along the path to the far end", () => {
            // Arrange
            const path = rail();
            const offsets = [0.001, 0.01, 1, 5];

            // Act
            const pipes = offsets.map(below => occt.operations.pipe({ shape: path, shapes: [circleBelowTheStart(below)] }));
            const longerFarLeg = occt.operations.pipe({ shape: rail(RAIL_FOOT + 5), shapes: [circleBelowTheStart(1.1e-5)] });
            const square = occt.operations.pipe({ shape: path, shapes: [squareBelowTheStart(20, 0.001)] });

            // Assert
            pipes.forEach((pipe, index) => expectTheRail(pipe, CIRCLE, RAIL_FOOT, RAIL_RADIUS, offsets[index]));
            expectTheRail(longerFarLeg, CIRCLE, RAIL_FOOT + 5);
            expectTheRail(square, 400, RAIL_FOOT, 10);
        });

        it("should keep every placement OCCT already made right: on the start, across the bar, up a leg, on the end of a shorter far leg", () => {
            // Arrange
            const shorter = RAIL_FOOT - 5;

            // Act
            const onTheStart = occt.operations.pipe({ shape: rail(), shapes: [circleBelowTheStart(0)] });
            const reversed = occt.operations.pipe({ shape: rail(), shapes: [occt.shapes.wire.reversedWire({ shape: circleBelowTheStart(0) })] });
            const acrossTheBar = occt.operations.pipe({ shape: rail(), shapes: [circleAt([0, 0, RAIL_RISE], [0, 1, 0])] });
            const upALeg = occt.operations.pipe({ shape: rail(), shapes: [circleAt([0, -RAIL_HALF, 80], [0, 0, 1])] });
            const onTheFarEnd = occt.operations.pipe({ shape: rail(shorter), shapes: [circleAt([0, RAIL_HALF, -shorter], [0, 0, 1])] });

            // Assert
            [onTheStart, reversed, acrossTheBar, upALeg].forEach(pipe => expectTheRail(pipe, CIRCLE));
            expectTheRail(onTheFarEnd, CIRCLE, shorter);
        });

        it("should sweep a profile at each end of the path once, from end to end", () => {
            // Arrange
            const atTheFarEnd = circleAt([0, RAIL_HALF, -RAIL_FOOT - 0.001], [0, 0, 1]);

            // Act
            const pipe = occt.operations.pipe({ shape: rail(), shapes: [circleBelowTheStart(0.001), atTheFarEnd] });

            // Assert
            expectTheRail(pipe, CIRCLE);
        });

        it("should report the caps of a pipe whose profile sits just off the start", () => {
            // Arrange
            const path = rail();

            // Act
            const { shape, histories } = occt.operations.pipeWithHistory({ shape: path, shapes: [circleBelowTheStart(0.001)] });

            // Assert
            expectTheRail(shape, CIRCLE);
            expect(histories).toHaveLength(1);
            expect(histories[0]!.firstFaces).toHaveLength(1);
            expect(histories[0]!.lastFaces).toHaveLength(1);
        });

        it("should refuse the inside-out sweep OCCT makes of a profile drawn far from its path", () => {
            // Arrange
            const path = occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [0, 0, 10], [100, 0, 10]] });
            const far = occt.shapes.wire.createCircleWire({ radius: 3, center: [50, 0, -200], direction: [1, 0, 0] });

            // Act
            const refusal = refusalOf(() => occt.operations.pipe({ shape: path, shapes: [far] }));

            // Assert
            expect(refusal).toEqual(insideOut);
        });

        it("should refuse a pipe that came out inside out, its profile placed at the far end of a path that comes back to the profile's plane", () => {
            // Arrange
            const path = rail();
            const profile = circleBelowTheStart(BEYOND_REACH);

            // Act
            const refusals = [
                refusalOf(() => occt.operations.pipe({ shape: path, shapes: [profile] })),
                refusalOf(() => occt.operations.pipeWithHistory({ shape: path, shapes: [profile] })),
            ];

            // Assert
            expect(refusals).toEqual([insideOut, insideOut]);
        });

        it("should refuse a pipe whose profile stands along its path, which sweeps no volume, and sweep the same profile turned across it", () => {
            // Arrange
            const line = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [0, 50, 0] });
            const standing = occt.shapes.wire.createSquareWire({ size: 5, center: [0, 0, 0], direction: [1, 0, 0] });
            const across = occt.shapes.wire.createSquareWire({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const refusal = refusalOf(() => occt.operations.pipe({ shape: line, shapes: [standing] }));
            const swept = occt.operations.pipe({ shape: line, shapes: [across] });

            // Assert
            expect(refusal).toEqual(expect.objectContaining({ name: "KernelOperationError", code: "occt.pipe.alongPath" }));
            expect(volumeOf(swept)).toBeCloseTo(25 * 50, 6);
        });

        it("should integrate a pipe's volume once to judge both whether it came out inside out and whether it holds none", () => {
            // Arrange
            const line = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [0, 50, 0] });
            const across = occt.shapes.wire.createSquareWire({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] });
            const integrations = vi.spyOn(kernel, "VolumePropertiesOfEach");

            // Act
            let calls: number;
            try {
                occt.operations.pipe({ shape: line, shapes: [across] });
            } finally {
                calls = integrations.mock.calls.length;
                integrations.mockRestore();
            }

            // Assert
            expect(calls).toBe(1);
        });

        it("should keep the sweep of an open profile placed at the far end, a shell with no inside to judge", () => {
            // Arrange
            const path = rail();
            const z = -RAIL_FOOT - BEYOND_REACH;
            const profile = occt.shapes.edge.arcThroughThreePoints({ start: [-RAIL_RADIUS, -RAIL_HALF, z], middle: [0, -RAIL_HALF + RAIL_RADIUS, z], end: [RAIL_RADIUS, -RAIL_HALF, z] });

            // Act
            const swept = occt.operations.pipe({ shape: path, shapes: [profile] });

            // Assert
            expect(occt.shapes.solid.getSolids({ shape: swept })).toHaveLength(0);
            expect(occt.shapes.face.getFaces({ shape: swept }).length).toBeGreaterThan(0);
        });
    });

    describe("pipeWithScaling", () => {
        it("should grow the profile evenly between two places, holding a frustum's volume", () => {
            // Arrange
            const spine = upright();

            // Act
            const horn = occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 1], scales: [1, 2], makeSolid: true });

            // Assert
            const [low, middle, high] = sectionAreasOf(horn, [1, 5, 9]);
            expect(volumeOf(horn)).toBeCloseTo(70 * Math.PI / 3, 3);
            expect(low).toBeCloseTo(Math.PI * 1.1 ** 2, 3);
            expect(middle).toBeCloseTo(Math.PI * 1.5 ** 2, 3);
            expect(high).toBeCloseTo(Math.PI * 1.9 ** 2, 3);
        });

        it("should pass through every scale at its place, smoothly between them", () => {
            // Arrange
            const spine = upright();

            // Act
            const bulge = occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 0.5, 1], scales: [1, 2, 1], makeSolid: true });

            // Assert
            const [nearStart, middle, nearEnd] = sectionAreasOf(bulge, [0.1, 5, 9.9]);
            expect(middle).toBeCloseTo(4 * Math.PI, 3);
            expect(nearStart).toBeCloseTo(nearEnd!, 3);
        });

        it("should narrow to half by default and leave an open shell when no solid is asked for", () => {
            // Arrange
            const spine = upright();

            // Act
            const tapered = occt.operations.pipeWithScaling({ spine, profile: ring() });
            const tube = occt.operations.pipeWithScaling({ spine, profile: ring(), scales: [1, 1], makeSolid: false });

            // Assert
            expect(volumeOf(tapered)).toBeCloseTo(Math.PI * 10 * (1 + 0.5 + 0.25) / 3, 3);
            expect(occt.shapes.shape.getShapeType({ shape: tube })).toBe(Inputs.OCCT.shapeTypeEnum.shell);
            expect(areaOf(tube)).toBeCloseTo(20 * Math.PI, 3);
        });

        it("should refuse scales of 0 or less and places outside 0 to 1", () => {
            // Arrange
            const spine = upright();

            // Act
            const flat = thrownBy(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 1], scales: [1, 0] }));
            const past = thrownBy(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 1.5], scales: [1, 2] }));
            const notList = thrownBy(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: loose(1), scales: [1, 2] }));

            // Assert
            expect(flat.message).toBe("`scales` holds 0 at position 1; each is a finite number above 0.");
            expect(past.message).toBe("`params` holds 1.5 at position 1; each is a finite number from 0 to 1.");
            expect(notList.message).toBe("`params` is not a list of numbers.");
        });

        it("should refuse a scale nearer 0 than 1e-100, which shrinks the profile to a point, as an input error at its position", () => {
            // Arrange
            const spine = upright();

            // Act
            const refused = refusalOf(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 1], scales: [1, 1e-300] }));

            // Assert
            expect(refused).toEqual(expect.objectContaining({ name: "InputError", property: "scales[1]", message: "`scales[1]` is 1e-300, and a scale factor has to be a finite number at least 1e-100 away from 0; nearer 0 the shape shrinks to a point." }));
        });

        it("should throw the kernel's refusal of places that do not run from 0 to 1 in order and of a scale that dips to 0 read into errors", () => {
            // Arrange
            const spine = upright();

            // Act
            const late = refusalOf(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0.1, 1], scales: [1, 1] }));
            const back = refusalOf(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 0.5, 0.4, 1], scales: [1, 1, 1, 1] }));
            const dip = refusalOf(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 0.1, 0.9, 1], scales: [1, 0.05, 0.05, 1] }));

            // Assert
            expect(late).toStrictEqual(new Error("Standard_DomainError: PipeWithScaling: the places run from 0 at the spine's start to 1 at its end"));
            expect(back).toStrictEqual(new Error("Standard_DomainError: PipeWithScaling: the places must increase along the spine"));
            expect(dip).toStrictEqual(new Error("Standard_DomainError: PipeWithScaling: the smooth scale through these places drops to 0 or below between them"));
        });

        it("should throw the kernel's refusal of a solid from an open profile read into an error", () => {
            // Arrange
            const line = occt.shapes.edge.line({ start: [1, 0, 0], end: [2, 0, 0] });

            // Act
            const open = refusalOf(() => occt.operations.pipeWithScaling({ spine: upright(), profile: line, makeSolid: true }));

            // Assert
            expect(open).toStrictEqual(new Error("Standard_DomainError: PipeWithScaling: the pipe cannot be closed into a solid; the profile must be closed"));
        });

        it("should refuse places and scales of different lengths, fewer than two places, and a point as the spine or the profile as input errors naming each", () => {
            // Arrange
            const spine = upright();

            // Act
            const refusals = [
                refusalOf(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 1], scales: [1] })),
                refusalOf(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 0.5, 1], scales: [1, 2] })),
                refusalOf(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0], scales: [1] })),
                refusalOf(() => occt.operations.pipeWithScaling({ spine: loose(point()), profile: ring() })),
                refusalOf(() => occt.operations.pipeWithScaling({ spine, profile: loose(point()) })),
            ];

            // Assert
            expect(refusals).toEqual([
                expect.objectContaining({ name: "InputError", property: "scales", message: "`scales` holds 1 and `params` 2: give one scale for each place along the spine." }),
                expect.objectContaining({ name: "InputError", property: "scales", message: "`scales` holds 2 and `params` 3: give one scale for each place along the spine." }),
                expect.objectContaining({ name: "InputError", property: "params", message: "`params` holds fewer than two places, and a scaled pipe needs at least two, the spine's start at 0 and its end at 1." }),
                expect.objectContaining({ name: "InputError", property: "spine", message: "`spine` is a vertex, and a scaled pipe follows an edge or a wire." }),
                expect.objectContaining({ name: "InputError", property: "profile", message: "`profile` is a vertex, and a scaled pipe moves an edge or a wire along the spine." }),
            ]);
        });
    });
});
