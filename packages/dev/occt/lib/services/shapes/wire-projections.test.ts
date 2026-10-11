import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { readKernelException } from "../../kernel-exception";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";

describe("OCCT wires projected and wrapped onto shapes", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const close = (values: readonly number[], digits = 9): unknown[] => values.map(value => expect.closeTo(value, digits));
    const loose = <T>(value: unknown): T => value as T;
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };
    const messageOf = (action: () => unknown): string => {
        try {
            action();
        } catch (error) {
            const read = readKernelException(kernel, error);
            return read instanceof Error ? read.message : String(read);
        }
        return "nothing thrown";
    };
    const floor = (): TopoDS_Face => occt.shapes.face.createSquareFace({ size: 40, center: [0, 0, 0], direction: [0, 1, 0] });
    const circleAbove = (radius: number, center: Inputs.Base.Point3): TopoDS_Wire => occt.shapes.wire.createCircleWire({ radius, center, direction: [0, 1, 0] });
    const wiresIn = (shape: TopoDS_Shape): TopoDS_Wire[] => occt.shapes.wire.getWires({ shape });
    const lengthOf = (wire: TopoDS_Wire): number => occt.shapes.wire.getWireLength({ shape: wire });
    const samplesOf = (wire: TopoDS_Wire): Inputs.Base.Point3[] => occt.shapes.wire.divideWireByEqualDistanceToPoints({ shape: wire, nrOfDivisions: 12, removeStartPoint: false, removeEndPoint: false });
    const ends = (wire: TopoDS_Wire): Inputs.Base.Point3[] => [occt.shapes.wire.startPointOnWire({ shape: wire }), occt.shapes.wire.endPointOnWire({ shape: wire })];
    const cylinderWall = (): TopoDS_Face => {
        const cylinder = occt.shapes.solid.createCylinder({ radius: 1, height: 5, center: [0, 0, 0], direction: [0, 1, 0] });
        const [side] = occt.select.faces.ofType({ shape: cylinder, type: Inputs.OCCT.surfaceTypeEnum.cylinder });
        return occt.shapes.face.getFace({ shape: cylinder, index: side! });
    };

    describe("projectNormal", () => {
        it("should lay a circle above a ball onto it along the ball's normals, as one closed wire", () => {
            // Arrange
            const ball = occt.shapes.solid.createSphere({ radius: 5, center: [0, 0, 0] });
            const circle = circleAbove(1, [0, 10, 0]);

            // Act
            const projected = occt.shapes.wire.projectNormal({ wires: [circle], shape: ball });

            // Assert
            const [wire] = wiresIn(projected);
            expect(wiresIn(projected)).toHaveLength(1);
            expect(occt.shapes.wire.isWireClosed({ shape: wire! })).toBe(true);
            samplesOf(wire!).forEach(point => {
                expect(Math.hypot(...point)).toBeCloseTo(5, 3);
                expect(Math.hypot(point[0], point[2])).toBeCloseTo(5 / Math.sqrt(101), 3);
            });
        });

        it("should give one wire per curve, and drop the curves farther than the greatest distance", () => {
            // Arrange
            const low = circleAbove(1, [-5, 3, 0]);
            const high = circleAbove(2, [5, 7, 0]);

            // Act
            const everything = occt.shapes.wire.projectNormal({ wires: [low, high], shape: floor(), tolerance: 1e-4, maxDistance: 0 });
            const nearOnly = occt.shapes.wire.projectNormal({ wires: [low, high], shape: floor(), tolerance: 1e-4, maxDistance: 5 });

            // Assert
            expect(wiresIn(everything).map(lengthOf).sort((a, b) => a - b)).toEqual(close([2 * Math.PI, 4 * Math.PI], 4));
            expect(wiresIn(nearOnly).map(lengthOf)).toEqual(close([2 * Math.PI], 4));
            wiresIn(everything).forEach(wire => samplesOf(wire).forEach(point => expect(point[1]).toBeCloseTo(0, 9)));
        });

        it("should give an empty compound for a curve beyond the faces' edges", () => {
            // Arrange
            const beyond = circleAbove(1, [30, 3, 0]);

            // Act
            const projected = occt.shapes.wire.projectNormal({ wires: [beyond], shape: floor() });

            // Assert
            expect(wiresIn(projected)).toEqual([]);
        });

        it("should refuse a tolerance of 0, a negative greatest distance, a missing wire and a target without faces", () => {
            // Arrange
            const circle = circleAbove(1, [0, 3, 0]);

            // Act
            const noTolerance = thrownBy(() => occt.shapes.wire.projectNormal({ wires: [circle], shape: floor(), tolerance: 0 }));
            const negative = thrownBy(() => occt.shapes.wire.projectNormal({ wires: [circle], shape: floor(), maxDistance: -1 }));
            const missing = thrownBy(() => occt.shapes.wire.projectNormal({ wires: [loose(undefined)], shape: floor() }));
            const noFaces = messageOf(() => occt.shapes.wire.projectNormal({ wires: [circle], shape: circleAbove(2, [0, 0, 0]) }));

            // Assert
            expect(noTolerance.message).toBe("`tolerance` must be a finite number above 0; it is 0.");
            expect(negative.message).toBe("`maxDistance` must be a finite number 0 or more; it is -1.");
            expect(missing.message).toBe("`wires` holds a missing or empty shape at position 0, as an operation that failed can leave it.");
            expect(noFaces).toBe("Standard_DomainError: ProjectNormal: the shape to project onto has no faces");
        });
    });

    describe("projectConical", () => {
        it("should cast a square from a point twice as high as it onto the floor at twice its size", () => {
            // Arrange
            const square = occt.shapes.wire.createSquareWire({ size: 2, center: [0, 10, 0], direction: [0, 1, 0] });

            // Act
            const shadow = occt.shapes.wire.projectConical({ wire: square, shape: floor(), from: [0, 20, 0] });

            // Assert
            const [wire] = wiresIn(shadow);
            expect(wiresIn(shadow)).toHaveLength(1);
            expect(lengthOf(wire!)).toBeCloseTo(16, 9);
            occt.shapes.vertex.getVerticesAsPoints({ shape: wire! }).forEach(corner => expect(corner.map(Math.abs)).toEqual(close([2, 0, 2])));
        });

        it("should cast from ten above the origin by default", () => {
            // Arrange
            const square = occt.shapes.wire.createSquareWire({ size: 2, center: [0, 5, 0], direction: [0, 1, 0] });

            // Act
            const shadow = occt.shapes.wire.projectConical({ wire: square, shape: floor() });

            // Assert
            expect(wiresIn(shadow).map(lengthOf)).toEqual(close([16]));
        });

        it("should give an empty compound when the lines from the point miss the shape", () => {
            // Arrange
            const aside = occt.shapes.wire.createSquareWire({ size: 2, center: [100, 10, 0], direction: [0, 1, 0] });

            // Act
            const shadow = occt.shapes.wire.projectConical({ wire: aside, shape: floor(), from: [0, 20, 0] });

            // Assert
            expect(wiresIn(shadow)).toEqual([]);
        });

        it("should refuse a point on the wire and a point that is not one", () => {
            // Arrange
            const square = occt.shapes.wire.createSquareWire({ size: 2, center: [0, 10, 0], direction: [0, 1, 0] });

            // Act
            const onTheWire = messageOf(() => occt.shapes.wire.projectConical({ wire: square, shape: floor(), from: [1, 10, 0] }));
            const notAPoint = thrownBy(() => occt.shapes.wire.projectConical({ wire: square, shape: floor(), from: loose([0, NaN, 0]) }));

            // Assert
            expect(onTheWire).toBe("Standard_DomainError: ProjectConical: the point lies on the shape to project");
            expect(notAPoint.message).toBe("`from` is not a point: it needs three finite numbers.");
        });
    });

    describe("wrapWiresOnFace", () => {
        it("should wrap a drawing's X around a cylinder and its Z along the axis, as the development lays them out", () => {
            // Arrange
            const wall = cylinderWall();
            const uRange = occt.shapes.face.getUMaxBound({ shape: wall }) - occt.shapes.face.getUMinBound({ shape: wall });
            const vMin = occt.shapes.face.getVMinBound({ shape: wall });
            const vRange = occt.shapes.face.getVMaxBound({ shape: wall }) - vMin;
            const around = occt.shapes.wire.createLineWire({ start: [0, 0, 1], end: [Math.PI, 0, 1] });
            const along = occt.shapes.wire.createLineWire({ start: [0, 0, 1], end: [0, 0, 4] });

            // Act
            const [halfTurn, upright] = occt.shapes.wire.wrapWiresOnFace({ wires: [around, along], face: wall });

            // Assert
            expect(ends(halfTurn!)).toEqual([
                close(occt.shapes.face.pointOnUV({ shape: wall, paramU: 0, paramV: (1 - vMin) / vRange }), 6),
                close(occt.shapes.face.pointOnUV({ shape: wall, paramU: Math.PI / uRange, paramV: (1 - vMin) / vRange }), 6),
            ]);
            expect(lengthOf(halfTurn!)).toBeCloseTo(Math.PI, 4);
            samplesOf(halfTurn!).forEach(point => expect(Math.hypot(point[0], point[2])).toBeCloseTo(1, 4));
            expect(ends(upright!)).toEqual([
                close(occt.shapes.face.pointOnUV({ shape: wall, paramU: 0, paramV: (1 - vMin) / vRange }), 6),
                close(occt.shapes.face.pointOnUV({ shape: wall, paramU: 0, paramV: (4 - vMin) / vRange }), 6),
            ]);
            expect(lengthOf(upright!)).toBeCloseTo(3, 6);
        });

        it("should keep the length of a band wrapped once around, closing it, whatever height the drawing lies at", () => {
            // Arrange
            const wall = cylinderWall();
            const band = occt.shapes.wire.createPolygonWire({ points: [[0, 0, 1], [2 * Math.PI, 0, 1], [2 * Math.PI, 0, 2], [0, 0, 2]] });
            const raisedBand = occt.shapes.wire.createPolygonWire({ points: [[0, 3, 1], [2 * Math.PI, 3, 1], [2 * Math.PI, 3, 2], [0, 3, 2]] });

            // Act
            const [wrapped, wrappedRaised] = occt.shapes.wire.wrapWiresOnFace({ wires: [band, raisedBand], face: wall, tolerance: 1e-4 });

            // Assert
            expect(lengthOf(wrapped!)).toBeCloseTo(4 * Math.PI + 2, 4);
            expect(occt.shapes.wire.isWireClosed({ shape: wrapped! })).toBe(true);
            expect(samplesOf(wrappedRaised!)).toEqual(samplesOf(wrapped!).map(point => close(point, 6)));
        });

        it("should wrap an edge as a wire of that one edge", () => {
            // Arrange
            const wall = cylinderWall();
            const edge = occt.shapes.edge.line({ start: [0, 0, 1], end: [Math.PI / 2, 0, 1] });

            // Act
            const wrapped = occt.shapes.wire.wrapWiresOnFace({ wires: [edge], face: wall });

            // Assert
            expect(wrapped).toHaveLength(1);
            expect(lengthOf(wrapped[0]!)).toBeCloseTo(Math.PI / 2, 4);
        });

        it("should refuse a tolerance of 0, wires that are not a list, and a face that does not unroll", () => {
            // Arrange
            const around = occt.shapes.wire.createLineWire({ start: [0, 0, 1], end: [1, 0, 1] });
            const ball = occt.shapes.face.getFaces({ shape: occt.shapes.solid.createSphere({ radius: 3, center: [0, 0, 0] }) })[0]!;

            // Act
            const noTolerance = thrownBy(() => occt.shapes.wire.wrapWiresOnFace({ wires: [around], face: cylinderWall(), tolerance: 0 }));
            const notAList = thrownBy(() => occt.shapes.wire.wrapWiresOnFace({ wires: loose(around), face: cylinderWall() }));
            const sphere = messageOf(() => occt.shapes.wire.wrapWiresOnFace({ wires: [around], face: ball }));

            // Assert
            expect(noTolerance.message).toBe("`tolerance` must be a finite number above 0; it is 0.");
            expect(notAList.message).toBe("`wires` is not a list of shapes.");
            expect(sphere).toBe("Standard_DomainError: WrapOnFace: the face is not a plane, a cylinder or a cone, which unroll without stretching");
        });
    });
});
