import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { readKernelException } from "../../kernel-exception";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import { Frame, GeometryHelper, InputError } from "@bitbybit-dev/base";

describe("OCCT frames and placements", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const close = (values: number[], digits = 9): unknown[] => values.map(value => expect.closeTo(value, digits));
    const baseFrames = new Frame(new GeometryHelper());
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
    const pointedCone = (): TopoDS_Shape => {
        const cone = occt.shapes.solid.createCone({ radius1: 2, radius2: 0, height: 5, angle: 360, center: [0, 0, 0], direction: [0, 0, 1] });
        const [side] = occt.select.faces.ofType({ shape: cone, type: Inputs.OCCT.surfaceTypeEnum.cone });
        return occt.shapes.face.getFace({ shape: cone, index: side! });
    };
    const rising = (): TopoDS_Shape => occt.shapes.wire.interpolatePoints({ points: [[0, 0, 0], [3, 1, 1], [5, 4, 3], [4, 7, 6], [1, 8, 8]], periodic: false, tolerance: 1e-7 });
    const cylinderWall = (): TopoDS_Shape => {
        const cylinder = occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });
        const [wall] = occt.select.faces.ofType({ shape: cylinder, type: Inputs.OCCT.surfaceTypeEnum.cylinder });
        return occt.shapes.face.getFace({ shape: cylinder, index: wall! });
    };

    describe("on faces", () => {
        it("should sit a frame on a face where pointOnUV and normalOnUV put the point and the normal", () => {
            // Arrange
            const wall = cylinderWall();

            // Act
            const frame = occt.shapes.face.frameOnUV({ shape: wall, paramU: 0.25, paramV: 0.5 });

            // Assert
            expect(frame.origin).toEqual(close(occt.shapes.face.pointOnUV({ shape: wall, paramU: 0.25, paramV: 0.5 })));
            expect(frame.normal).toEqual(close(occt.shapes.face.normalOnUV({ shape: wall, paramU: 0.25, paramV: 0.5 })));
            expect(frame.normal[0] * frame.direction[0] + frame.normal[1] * frame.direction[1] + frame.normal[2] * frame.direction[2]).toBeCloseTo(0, 12);
        });

        it("should sit frames at several places of a face in one call, in order", () => {
            // Arrange
            const wall = cylinderWall();

            // Act
            const frames = occt.shapes.face.framesOnUVs({ shape: wall, paramsUV: [[0, 0], [0.5, 1]] });

            // Assert
            expect(frames).toHaveLength(2);
            expect(frames[1]).toEqual(occt.shapes.face.frameOnUV({ shape: wall, paramU: 0.5, paramV: 1 }));
        });

        it.each([
            { name: "a sphere, poles included", face: (): TopoDS_Shape => occt.shapes.face.getFace({ shape: occt.shapes.solid.createSphere({ radius: 3, center: [0, 0, 0] }), index: 0 }) },
            { name: "a square whose UV range starts away from zero", face: (): TopoDS_Shape => occt.shapes.face.createSquareFace({ size: 10, center: [2, 1, 0], direction: [0, 0, 1] }) },
        ])("should sit a frame at each point subdivideToPoints gives on $name, with the same options", ({ face }) => {
            // Arrange
            const division = { shape: face(), nrDivisionsU: 5, nrDivisionsV: 4, shiftHalfStepU: true, removeStartEdgeU: false, removeEndEdgeU: true, shiftHalfStepV: false, removeStartEdgeV: true, removeEndEdgeV: false };

            // Act
            const frames = occt.shapes.face.subdivideToFrames(division);

            // Assert
            const points = occt.shapes.face.subdivideToPoints(division);
            expect(frames).toHaveLength(12);
            expect(frames.map(frame => frame.origin)).toEqual(points.map(point => close(point)));
        });

        it("should turn each frame of a subdivision as frameOnUV does, facing the way subdivideToNormals does", () => {
            // Arrange
            const wall = cylinderWall();
            const division = { shape: wall, nrDivisionsU: 3, nrDivisionsV: 3, shiftHalfStepU: false, removeStartEdgeU: false, removeEndEdgeU: false, shiftHalfStepV: false, removeStartEdgeV: false, removeEndEdgeV: false };

            // Act
            const frames = occt.shapes.face.subdivideToFrames(division);

            // Assert
            const middle = occt.shapes.face.frameOnUV({ shape: wall, paramU: 0.5, paramV: 0.5 });
            expect(frames.map(frame => frame.normal)).toEqual(occt.shapes.face.subdivideToNormals(division).map(normal => close(normal)));
            expect(frames[4]).toEqual({ origin: close(middle.origin), normal: close(middle.normal), direction: close(middle.direction) });
        });

        it("should sit frames at the places of a face nearest points, coming to its edge from beyond it", () => {
            // Arrange
            const square = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const above = occt.shapes.face.frameNearestPoint({ shape: square, point: [1, 2, 7] });
            const beyond = occt.shapes.face.framesNearestPoints({ shape: square, points: [[20, 1, 0], [1, 2, 7]] });

            // Assert
            expect(above.origin).toEqual(close([1, 2, 0]));
            expect(Math.abs(above.normal[2])).toBeCloseTo(1, 12);
            expect(beyond[0]!.origin).toEqual(close([5, 1, 0]));
            expect(beyond[1]).toEqual(above);
        });
    });

    describe("at a face's singular point and with inputs it cannot use", () => {
        it("should read the frame at a cone's point from just inside the face, as normalOnUV reads the normal there", () => {
            // Arrange
            const cone = pointedCone();

            // Act
            const atPoint = occt.shapes.face.frameOnUV({ shape: cone, paramU: 0.5, paramV: 1 });
            const justBelow = occt.shapes.face.frameOnUV({ shape: cone, paramU: 0.5, paramV: 0.95 });

            // Assert
            expect(atPoint.origin).toEqual(close([0, 0, 5], 7));
            expect(atPoint.normal).toEqual(close(occt.shapes.face.normalOnUV({ shape: cone, paramU: 0.5, paramV: 1 }), 7));
            expect(atPoint.normal).toEqual(close(justBelow.normal, 7));
            expect(atPoint.normal).toEqual(close([-5 / Math.sqrt(29), 0, 2 / Math.sqrt(29)], 7));
        });

        it("should give a frame at every point of a subdivision running through a cone's point", () => {
            // Arrange
            const cone = pointedCone();
            const subdivision = { shape: cone, nrDivisionsU: 3, nrDivisionsV: 3, shiftHalfStepU: false, removeStartEdgeU: false, removeEndEdgeU: false, shiftHalfStepV: false, removeStartEdgeV: false, removeEndEdgeV: false };

            // Act
            const frames = occt.shapes.face.subdivideToFrames(subdivision);

            // Assert
            const points = occt.shapes.face.subdivideToPoints(subdivision);
            const normals = occt.shapes.face.subdivideToNormals(subdivision);
            expect(frames).toHaveLength(points.length);
            frames.forEach((frame, index) => {
                expect(frame.origin).toEqual(close(points[index]!, 7));
                expect(frame.normal).toEqual(close(normals[index]!, 7));
            });
        });

        it("should refuse U and V pairs that are not two numbers and points that are not three, naming them", () => {
            // Arrange
            const wall = cylinderWall();

            // Act
            const pairs = thrownBy(() => occt.shapes.face.framesOnUVs({ shape: wall, paramsUV: loose<[number, number][]>([[0.5, 0.5], [0.5]]) }));
            const points = thrownBy(() => occt.shapes.face.framesNearestPoints({ shape: wall, points: loose<Inputs.Base.Point3[]>([[1, 2, 3], [1, 2]]) }));
            const point = thrownBy(() => occt.shapes.face.frameNearestPoint({ shape: wall, point: loose<Inputs.Base.Point3>([1, 2]) }));
            const parameter = thrownBy(() => occt.shapes.face.frameOnUV({ shape: wall, paramU: Number.NaN, paramV: 0.5 }));

            // Assert
            expect(pairs.property).toBe("paramsUV");
            expect(pairs.message).toContain("at position 1");
            expect(thrownBy(() => occt.shapes.face.framesOnUVs({ shape: wall, paramsUV: loose<[number, number][]>("uv") })).message).toBe("`paramsUV` is not a list of U and V pairs.");
            expect(thrownBy(() => occt.shapes.face.framesNearestPoints({ shape: wall, points: loose<Inputs.Base.Point3[]>(7) })).message).toBe("`points` is not a list of points.");
            expect(points.property).toBe("points");
            expect(points.message).toContain("at position 1");
            expect(point.property).toBe("point");
            expect(parameter.property).toBe("paramU");
        });
    });

    describe("on curves", () => {
        it("should sit frames on an edge that follow it as asked", () => {
            // Arrange
            const circle = occt.shapes.edge.createCircleEdge({ radius: 5, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const across = occt.shapes.edge.frameOnEdgeAtParam({ shape: circle, param: 0.25, kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });
            const bending = occt.shapes.edge.frameOnEdgeAtParam({ shape: circle, param: 0.25, kind: Inputs.OCCT.curveFrameEnum.frenet, up: [0, 0, 1] });
            const byLength = occt.shapes.edge.frameOnEdgeAtLength({ shape: circle, length: 5 * Math.PI / 2, kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });
            const several = occt.shapes.edge.framesOnEdgeAtParams({ shape: circle, params: [0.25, 0], kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });
            const severalByLength = occt.shapes.edge.framesOnEdgeAtLengths({ shape: circle, lengths: [5 * Math.PI / 2], kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });

            // Assert
            expect(across.origin).toEqual(close(occt.shapes.edge.pointOnEdgeAtParam({ shape: circle, param: 0.25 })));
            expect(across.normal).toEqual(close(occt.shapes.edge.tangentOnEdgeAtParam({ shape: circle, param: 0.25 }).map(value => value / 5)));
            expect(across.direction).toEqual(close([0, 0, 1]));
            expect(Math.abs(bending.normal[2])).toBeCloseTo(1, 12);
            expect(byLength.origin).toEqual(close(across.origin, 6));
            expect(several[0]).toEqual(across);
            expect(severalByLength[0]!.origin).toEqual(close(across.origin, 6));
        });

        it("should follow a reversed edge from where it starts in its own direction, as startPointOnEdge reads it", () => {
            // Arrange
            const line = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
            const reversed = occt.shapes.edge.reversedEdge({ shape: line });

            // Act
            const quarter = occt.shapes.edge.frameOnEdgeAtParam({ shape: reversed, param: 0.25, kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });
            const start = occt.shapes.edge.frameOnEdgeAtParam({ shape: reversed, param: 0, kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });

            // Assert
            expect(quarter.origin).toEqual(close([7.5, 0, 0]));
            expect(quarter.normal).toEqual(close([-1, 0, 0]));
            expect(start.origin).toEqual(close(occt.shapes.edge.startPointOnEdge({ shape: reversed })));
        });

        it("should put a Frenet frame's direction along the curve and its Y axis toward where the curve bends", () => {
            // Arrange
            const circle = occt.shapes.edge.createCircleEdge({ radius: 5, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const frame = occt.shapes.edge.frameOnEdgeAtParam({ shape: circle, param: 0.25, kind: Inputs.OCCT.curveFrameEnum.frenet, up: [0, 0, 1] });

            // Assert
            expect(frame.origin).toEqual(close([0, 5, 0]));
            expect(frame.direction).toEqual(close([-1, 0, 0]));
            expect(frame.normal).toEqual(close([0, 0, 1]));
            expect(baseFrames.yDirection({ frame })).toEqual(close([0, -1, 0]));
        });

        it("should make one frame as a list of one makes it, rotation-minimizing unless asked otherwise", () => {
            // Arrange
            const curve = rising();

            // Act
            const one = occt.shapes.wire.frameOnWireAtParam({ shape: curve, param: 0.7 });
            const listOfOne = occt.shapes.wire.framesOnWireAtParams({ shape: curve, params: [0.7] });
            const asked = occt.shapes.wire.frameOnWireAtParam({ shape: curve, param: 0.7, kind: Inputs.OCCT.curveFrameEnum.rotationMinimizing, up: [0, 0, 1] });
            const oneByLength = occt.shapes.wire.frameOnWireAtLength({ shape: curve, length: 3 });
            const listByLength = occt.shapes.wire.framesOnWireAtLengths({ shape: curve, lengths: [3] });

            // Assert
            expect(one).toEqual(listOfOne[0]);
            expect(one).toEqual(asked);
            expect(oneByLength).toEqual(listByLength[0]);
        });

        it("should carry a rotation-minimizing frame from the curve's start whatever else is asked for", () => {
            // Arrange
            const curve = rising();

            // Act
            const alone = occt.shapes.wire.framesOnWireAtParams({ shape: curve, params: [0.3] })[0]!;
            const withOthers = occt.shapes.wire.framesOnWireAtParams({ shape: curve, params: [1, 0.3, 0, 0.8] })[1]!;

            // Assert
            expect(withOthers.origin).toEqual(close(alone.origin, 9));
            expect(withOthers.direction).toEqual(close(alone.direction, 7));
        });

        it("should turn the first rotation-minimizing frame as fromPointAndNormal turns one where up runs along the curve", () => {
            // Arrange
            const upright = occt.shapes.edge.line({ start: [1, 2, 0], end: [1, 2, 10] });

            // Act
            const frame = occt.shapes.edge.frameOnEdgeAtParam({ shape: upright, param: 0.5, kind: Inputs.OCCT.curveFrameEnum.rotationMinimizing, up: [0, 0, 1] });

            // Assert
            expect(frame.normal).toEqual(close([0, 0, 1]));
            expect(frame.direction).toEqual(close(baseFrames.fromPointAndNormal({ origin: frame.origin, normal: frame.normal }).direction));
        });

        it("should refuse where a Frenet frame or a level one has no way to point", () => {
            // Arrange
            const line = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });

            // Act
            const straight = messageOf(() => occt.shapes.edge.frameOnEdgeAtParam({ shape: line, param: 0.5, kind: Inputs.OCCT.curveFrameEnum.frenet, up: [0, 0, 1] }));
            const alongUp = messageOf(() => occt.shapes.edge.frameOnEdgeAtParam({ shape: line, param: 0.5, kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [2, 0, 0] }));

            // Assert
            expect(straight).toContain("runs straight");
            expect(alongUp).toContain("the up vector runs along the curve");
        });

        it("should refuse values off the curve and inputs it cannot use, naming them", () => {
            // Arrange
            const line = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
            const wire = occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] });

            // Act
            const param = thrownBy(() => occt.shapes.edge.frameOnEdgeAtParam({ shape: line, param: 1.2 }));
            const length = thrownBy(() => occt.shapes.wire.frameOnWireAtLength({ shape: wire, length: 25 }));
            const lengths = thrownBy(() => occt.shapes.edge.framesOnEdgeAtLengths({ shape: line, lengths: [1, -1] }));
            const kind = thrownBy(() => occt.shapes.edge.frameOnEdgeAtParam({ shape: line, param: 0.5, kind: loose<Inputs.OCCT.curveFrameEnum>("twisting") }));
            const up = thrownBy(() => occt.shapes.wire.framesOnWireAtParams({ shape: wire, params: [0.5], up: [0, 0, 0] }));

            // Assert
            expect(param.property).toBe("param");
            expect(length.property).toBe("length");
            expect(length.message).toBe("`length` holds 25, past the end of the curve, which is 20 long.");
            expect(lengths.property).toBe("lengths");
            expect(thrownBy(() => occt.shapes.edge.framesOnEdgeAtParams({ shape: line, params: loose<number[]>("0.5") })).message).toBe("`params` is not a list of numbers.");
            expect(kind.property).toBe("kind");
            expect(up.property).toBe("up");
        });

        it("should sit frames on a wire, the ends of a spread at its ends", () => {
            // Arrange
            const wire = occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] });

            // Act
            const middle = occt.shapes.wire.frameOnWireAtParam({ shape: wire, param: 0.25, kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });
            const atLength = occt.shapes.wire.frameOnWireAtLength({ shape: wire, length: 15, kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });
            const atParams = occt.shapes.wire.framesOnWireAtParams({ shape: wire, params: [0.25], kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });
            const atLengths = occt.shapes.wire.framesOnWireAtLengths({ shape: wire, lengths: [15], kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });
            const spread = occt.shapes.wire.framesAlongWire({ shape: wire, count: 5, kind: Inputs.OCCT.curveFrameEnum.rotationMinimizing, up: [0, 0, 1] });

            // Assert
            expect(middle.origin).toEqual(close(occt.shapes.wire.pointOnWireAtParam({ shape: wire, param: 0.25 })));
            expect(middle.normal).toEqual(close([1, 0, 0]));
            expect(atLength.origin).toEqual(close([10, 5, 0], 6));
            expect(atLength.normal).toEqual(close([0, 1, 0]));
            expect(atParams[0]).toEqual(middle);
            expect(atLengths[0]).toEqual(atLength);
            expect(spread).toHaveLength(5);
            expect(spread[0]!.origin).toEqual(close([0, 0, 0], 6));
            expect(spread[4]!.origin).toEqual(close([10, 10, 0], 6));
            spread.forEach(frame => expect(frame.direction).toEqual(close([0, 0, 1], 6)));
        });

        it("should spread frames evenly around a closed wire without repeating the first", () => {
            // Arrange
            const circle = occt.shapes.wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 0, 1] });
            const gap = (a: Inputs.Base.Point3, b: Inputs.Base.Point3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

            // Act
            const frames = occt.shapes.wire.framesAlongWire({ shape: circle, count: 4, kind: Inputs.OCCT.curveFrameEnum.rotationMinimizing, up: [0, 0, 1] });

            // Assert
            expect(frames).toHaveLength(4);
            expect(frames[0]!.origin).toEqual(close(occt.shapes.wire.startPointOnWire({ shape: circle }), 6));
            frames.forEach((frame, i) => expect(gap(frame.origin, frames[(i + 1) % 4]!.origin)).toBeCloseTo(5 * Math.SQRT2, 6));
        });

        it("should end a closed wire's spread on its first frame when the end is kept", () => {
            // Arrange
            const circle = occt.shapes.wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const frames = occt.shapes.wire.framesAlongWire({ shape: circle, count: 4, kind: Inputs.OCCT.curveFrameEnum.rotationMinimizing, up: [0, 0, 1], skipEndOnClosed: false });

            // Assert
            expect(frames[3]!.origin).toEqual(close(frames[0]!.origin, 6));
            expect(Math.hypot(frames[1]!.origin[0] - frames[0]!.origin[0], frames[1]!.origin[1] - frames[0]!.origin[1])).toBeCloseTo(5 * Math.sqrt(3), 6);
        });

        it("should refuse a spread of fewer than two frames along a wire", () => {
            // Arrange
            const wire = occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0]] });

            // Act
            const act = (): unknown => occt.shapes.wire.framesAlongWire({ shape: wire, count: 1, kind: Inputs.OCCT.curveFrameEnum.perpendicular, up: [0, 0, 1] });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "InputError", property: "count" }));
        });
    });

    describe("of shapes", () => {
        it("should find a box's principal axes, moments ascending", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 10, length: 30, height: 20, center: [1, 2, 3], originOnCenter: true });

            // Act
            const { frame, moments } = occt.operations.principalFrame({ shape: box });

            // Assert
            expect(frame.origin).toEqual(close([1, 2, 3], 7));
            expect(frame.direction).toEqual(close([0, 0, 1]));
            expect(frame.normal).toEqual(close([1, 0, 0]));
            expect(moments).toEqual(close([6000 * (100 + 400) / 12, 6000 * (100 + 900) / 12, 6000 * (400 + 900) / 12], 3));
        });

        it("should fit a box around a turned shape, longest side first", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 10, length: 30, height: 20, center: [0, 0, 0], originOnCenter: true });
            const turned = occt.transforms.rotate({ shape: box, axis: [0, 0, 1], angle: 30 });

            // Act
            const { frame, halfSizes } = occt.operations.orientedBoundingBox({ shape: turned });

            // Assert
            expect(halfSizes).toEqual(close([15, 10, 5], 6));
            expect(frame.direction).toEqual(close([0, 0, 1], 6));
            expect(frame.origin).toEqual(close([0, 0, 0], 6));
        });
    });

    describe("the axes of a turned box", () => {
        it("should point the oriented box's normal along its shortest side and its Y axis along the middle one", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 10, length: 30, height: 20, center: [0, 0, 0], originOnCenter: true });
            const turned = occt.transforms.rotate({ shape: box, axis: [0, 0, 1], angle: 30 });

            // Act
            const { frame } = occt.operations.orientedBoundingBox({ shape: turned });

            // Assert
            const turn = 30 * Math.PI / 180;
            expect(frame.normal).toEqual(close([Math.cos(turn), Math.sin(turn), 0], 6));
            expect(baseFrames.yDirection({ frame })).toEqual(close([Math.sin(turn), -Math.cos(turn), 0], 6));
        });

        it("should refuse a missing shape", () => {
            // Act
            const principal = thrownBy(() => occt.operations.principalFrame({ shape: loose<TopoDS_Shape>(undefined) }));
            const oriented = thrownBy(() => occt.operations.orientedBoundingBox({ shape: loose<TopoDS_Shape>(null) }));

            // Assert
            expect(principal.property).toBe("shape");
            expect(oriented.property).toBe("shape");
        });
    });

    describe("moving and placing", () => {
        const corners = (shape: TopoDS_Shape): [Inputs.Base.Point3, Inputs.Base.Point3] => {
            const box = occt.operations.boundingBoxOfShape({ shape });
            return [box.min, box.max];
        };

        it("should move a shape from the world frame, or from a given frame, onto another", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 1, length: 3, height: 2, center: [0.5, 1, 1.5], originOnCenter: true });
            const to: Inputs.Base.Frame = { origin: [10, 0, 0], normal: [1, 0, 0], direction: [0, 1, 0] };

            // Act
            const moved = occt.transforms.orient({ shape: box, to });
            const back = occt.transforms.orient({ shape: moved, from: to, to: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } });

            // Assert
            expect(corners(moved)[1]).toEqual(close([13, 1, 2], 6));
            expect(corners(back)[1]).toEqual(close([1, 2, 3], 6));
        });

        it("should place a copy on every frame and by every matrix, sharing the geometry", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0.5, 0.5, 0.5], originOnCenter: true });
            const frames: Inputs.Base.Frame[] = [0, 1, 2].map(step => ({ origin: [10 * step, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] }));

            // Act
            const onFrames = occt.transforms.placeOnFrames({ shape: box, frames });
            const byMatrices = occt.transforms.placeByMatrices({ shape: box, matrices: [[[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 5, 1]]] });

            // Assert
            const copies = occt.shapes.compound.getShapesOfCompound({ shape: onFrames });
            expect(copies).toHaveLength(3);
            expect(copies.map(copy => corners(copy)[0])).toEqual([[0, 0, 0], [10, 0, 0], [20, 0, 0]].map(point => close(point, 6)));
            expect(copies.every(copy => copy.IsPartner(box))).toBe(true);
            expect(corners(byMatrices)[0]).toEqual(close([0, 0, 5], 6));
        });

        it("should refuse a placement that scales or mirrors, naming its position", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0], originOnCenter: true });
            const still: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

            // Act
            const scaled = thrownBy(() => occt.transforms.placeByMatrices({ shape: box, matrices: [[still], [[2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1]]] }));
            const mirrored = thrownBy(() => occt.transforms.placeByMatrices({ shape: box, matrices: [[[-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]]] }));
            const malformed = thrownBy(() => occt.transforms.placeByMatrices({ shape: box, matrices: loose<Inputs.Base.TransformMatrixes[]>([[still], [[1, 2, 3]]]) }));

            // Assert
            expect(scaled.property).toBe("matrices");
            expect(scaled.message).toBe("`matrices` holds a placement at position 1 that is not a turn and a move: it scales or shears.");
            expect(mirrored.message).toContain("it mirrors");
            expect(malformed.message).toContain("at position 1");
        });

        it("should place by the matrices the frame service gives exactly where it places on the frames themselves", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 1, length: 2, height: 3, center: [0.5, 1, 1.5], originOnCenter: true });
            const frames = baseFrames.polar({ frame: baseFrames.create({ origin: [1, 2, 3], normal: [1, 1, 1], direction: [1, 0, 0] }), count: 5, radius: 8 });

            // Act
            const onFrames = occt.shapes.compound.getShapesOfCompound({ shape: occt.transforms.placeOnFrames({ shape: box, frames }) });
            const byMatrices = occt.shapes.compound.getShapesOfCompound({
                shape: occt.transforms.placeByMatrices({ shape: box, matrices: frames.map(frame => baseFrames.toMatrix({ frame })) }),
            });

            // Assert
            expect(byMatrices).toHaveLength(5);
            byMatrices.forEach((copy, index) => {
                expect(corners(copy)[0]).toEqual(close(corners(onFrames[index]!)[0], 9));
                expect(corners(copy)[1]).toEqual(close(corners(onFrames[index]!)[1], 9));
            });
            expect(corners(onFrames[1]!)[0]).not.toEqual(close(corners(onFrames[0]!)[0], 3));
        });

        it("should place copies from a given frame as orient moves the shape from it, and as the frame service carries points", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 1, length: 2, height: 3, center: [4, 1, 1.5], originOnCenter: true });
            const from = baseFrames.rotate({ frame: baseFrames.xy({ origin: [4, 0, 0] }), axis: Inputs.Frame.frameAxisEnum.z, angle: 30 });
            const frames = [baseFrames.zx({ origin: [0, 5, 0] }), baseFrames.create({ origin: [-3, 0, 2], normal: [0, 1, 1], direction: [1, 0, 0] })];

            // Act
            const copies = occt.shapes.compound.getShapesOfCompound({ shape: occt.transforms.placeOnFrames({ shape: box, frames, from }) });

            // Assert
            copies.forEach((copy, index) => {
                const oriented = occt.transforms.orient({ shape: box, from, to: frames[index]! });
                expect(corners(copy)).toEqual([close(corners(oriented)[0], 9), close(corners(oriented)[1], 9)]);
                const carried = baseFrames.pointsToWorld({ frame: frames[index]!, points: [baseFrames.pointToLocal({ frame: from, point: [4, 1, 1.5] })] })[0]!;
                const centre = occt.operations.boundingBoxOfShape({ shape: copy }).center;
                expect(centre).toEqual(close(carried, 9));
            });
        });

        it("should refuse frames it cannot use, naming them", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0], originOnCenter: true });
            const world: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };

            // Act
            const to = thrownBy(() => occt.transforms.orient({ shape: box, to: { ...world, normal: [0, 0, 0] } }));
            const from = thrownBy(() => occt.transforms.orient({ shape: box, to: world, from: { ...world, direction: [0, 0, 2] } }));
            const frames = thrownBy(() => occt.transforms.placeOnFrames({ shape: box, frames: [world, loose<Inputs.Base.Frame>({ origin: [0, 0, 0] })] }));
            const shape = thrownBy(() => occt.transforms.orient({ shape: loose<TopoDS_Shape>(undefined), to: world }));

            // Assert
            expect(to.property).toBe("to");
            expect(from.property).toBe("from");
            expect(frames.message).toContain("`frames` at position 1 is not a frame");
            expect(shape.property).toBe("shape");
        });
    });
});
