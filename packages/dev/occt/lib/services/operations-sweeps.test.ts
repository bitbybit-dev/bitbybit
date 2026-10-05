import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTService } from "../occ-service";
import { readKernelException } from "../kernel-exception";
import * as Inputs from "../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT evolved and scaled sweeps", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const squareSpine = (): TopoDS_Shape => occt.shapes.wire.createSquareWire({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
    const post = (across: number): TopoDS_Shape => occt.shapes.edge.line({ start: [0, across, 0], end: [0, across, 5] });
    const upright = (): TopoDS_Shape => occt.shapes.edge.line({ start: [0, 0, 0], end: [0, 10, 0] });
    const ring = (): TopoDS_Shape => occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
    const areaOf = (shape: TopoDS_Shape): number => occt.shapes.face.getFaces({ shape }).reduce((sum, face) => sum + occt.shapes.face.getFaceArea({ shape: face }), 0);
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    const sectionAreasOf = (shape: TopoDS_Shape, heights: number[]): number[] =>
        occt.operations.sliceByFrames({ shape, frames: heights.map((y): Inputs.Base.Frame => ({ origin: [0, y, 0], normal: [0, 1, 0], direction: [1, 0, 0] })) }).map(areaOf);
    const kernelMessage = (action: () => unknown): string => {
        try {
            action();
        } catch (error) {
            const read = readKernelException(kernel, error);
            return read instanceof Error ? read.message : String(read);
        }
        return "nothing thrown";
    };
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

        it("should pass on the kernel's refusal of a spine out of plane, a curve as the spine and a face as the profile", () => {
            // Arrange
            const bent = occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [10, 0, 0], [10, 5, 10], [0, 0, 10]] });
            const circle = occt.shapes.edge.createCircleEdge({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
            const face = occt.shapes.face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [1, 0, 0] });

            // Act
            const outOfPlane = kernelMessage(() => occt.operations.sweepEvolved({ spine: bent, profile: post(0) }));
            const notWire = kernelMessage(() => occt.operations.sweepEvolved({ spine: loose(circle), profile: post(0) }));
            const faceProfile = kernelMessage(() => occt.operations.sweepEvolved({ spine: squareSpine(), profile: loose(face) }));

            // Assert
            expect(outOfPlane).toBe("Standard_DomainError: SweepEvolved: the spine does not lie in a plane");
            expect(notWire).toBe("Standard_DomainError: SweepEvolved: the spine is not a wire or a planar face");
            expect(faceProfile).toBe("Standard_DomainError: SweepEvolved: the profile is not an edge or a wire");
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

        it("should pass on the kernel's refusal of places that do not run from 0 to 1 in order, of mismatched lists and of a scale that dips to 0", () => {
            // Arrange
            const spine = upright();

            // Act
            const late = kernelMessage(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0.1, 1], scales: [1, 1] }));
            const short = kernelMessage(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 1], scales: [1] }));
            const back = kernelMessage(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 0.5, 0.4, 1], scales: [1, 1, 1, 1] }));
            const dip = kernelMessage(() => occt.operations.pipeWithScaling({ spine, profile: ring(), params: [0, 0.1, 0.9, 1], scales: [1, 0.05, 0.05, 1] }));

            // Assert
            expect(late).toBe("Standard_DomainError: PipeWithScaling: the places run from 0 at the spine's start to 1 at its end");
            expect(short).toBe("Standard_DomainError: PipeWithScaling: give at least two places along the spine, each with a scale");
            expect(back).toBe("Standard_DomainError: PipeWithScaling: the places must increase along the spine");
            expect(dip).toBe("Standard_DomainError: PipeWithScaling: the smooth scale through these places drops to 0 or below between them");
        });

        it("should pass on the kernel's refusal of a solid from an open profile", () => {
            // Arrange
            const line = occt.shapes.edge.line({ start: [1, 0, 0], end: [2, 0, 0] });

            // Act
            const open = kernelMessage(() => occt.operations.pipeWithScaling({ spine: upright(), profile: line, makeSolid: true }));

            // Assert
            expect(open).toBe("Standard_DomainError: PipeWithScaling: the pipe cannot be closed into a solid; the profile must be closed");
        });
    });
});
