import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTService } from "../occ-service";
import { readKernelException } from "../kernel-exception";
import * as Inputs from "../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT sections and splitting", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const across = (normal: Inputs.Base.Vector3, origin: Inputs.Base.Point3): Inputs.Base.Frame => ({ origin, normal, direction: normal[0] === 0 ? [1, 0, 0] : [0, 1, 0] });
    const level = (y: number): Inputs.Base.Frame => across([0, 1, 0], [0, y, 0]);
    const cube = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 5, 0] });
    const holedCube = (): TopoDS_Shape => occt.booleans.difference({
        shape: cube(),
        shapes: [occt.shapes.solid.createCylinder({ radius: 3, height: 20, center: [0, -5, 0], direction: [0, 1, 0] })],
        keepEdges: false,
    });
    const square = (): TopoDS_Shape => occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
    const areaOf = (shape: TopoDS_Shape): number => occt.shapes.face.getFaces({ shape }).reduce((sum, face) => sum + occt.shapes.face.getFaceArea({ shape: face }), 0);
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    const lengthOf = (shape: TopoDS_Shape): number => occt.shapes.edge.getEdges({ shape }).reduce((sum, edge) => sum + occt.shapes.edge.getEdgeLength({ shape: edge }), 0);
    const countOf = (shape: TopoDS_Shape, kind: "faces" | "wires" | "solids"): number =>
        kind === "faces" ? occt.shapes.face.getFaces({ shape }).length : kind === "wires" ? occt.shapes.wire.getWires({ shape }).length : occt.shapes.solid.getSolids({ shape }).length;
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

    describe("sectionWires", () => {
        it("should join the outline a plane cuts from a cube into one closed wire", () => {
            // Arrange
            const plane = occt.shapes.face.createSquareFace({ size: 20, center: [0, 3, 0], direction: [0, 1, 0] });

            // Act
            const wires = occt.operations.sectionWires({ shapeA: cube(), shapeB: plane, tolerance: 1e-7 });

            // Assert
            expect(wires).toHaveLength(1);
            expect(occt.shapes.wire.isWireClosed({ shape: wires[0]! })).toBe(true);
            expect(occt.shapes.edge.getEdges({ shape: wires[0]! })).toHaveLength(4);
            expect(occt.shapes.wire.getWireLength({ shape: wires[0]! })).toBeCloseTo(40, 9);
            expect(occt.operations.boundingBoxOfShape({ shape: wires[0]! }).center[1]).toBeCloseTo(3, 9);
        });

        it("should give the outline and the rim of a hole as separate closed wires, with the default tolerance", () => {
            // Arrange
            const plane = occt.shapes.face.createSquareFace({ size: 20, center: [0, 5, 0], direction: [0, 1, 0] });

            // Act
            const wires = occt.operations.sectionWires({ shapeA: holedCube(), shapeB: plane });

            // Assert
            const lengths = wires.map(wire => occt.shapes.wire.getWireLength({ shape: wire })).sort((a, b) => a - b);
            expect(lengths).toHaveLength(2);
            expect(lengths[0]).toBeCloseTo(6 * Math.PI, 6);
            expect(lengths[1]).toBeCloseTo(40, 9);
            expect(wires.every(wire => occt.shapes.wire.isWireClosed({ shape: wire }))).toBe(true);
        });

        it("should give no wires where the shapes do not meet", () => {
            // Arrange
            const far = occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [50, 50, 50] });

            // Act
            const wires = occt.operations.sectionWires({ shapeA: cube(), shapeB: far });

            // Assert
            expect(wires).toEqual([]);
        });

        it("should refuse a missing shape and a negative tolerance", () => {
            // Arrange
            const shape = cube();

            // Act
            const missing = thrownBy(() => occt.operations.sectionWires({ shapeA: shape, shapeB: loose(undefined) }));
            const negative = thrownBy(() => occt.operations.sectionWires({ shapeA: shape, shapeB: shape, tolerance: -1 }));

            // Assert
            expect(missing.message).toBe("`shapeB` is missing or empty, as an operation that failed can leave it.");
            expect(negative.message).toBe("`tolerance` must be a finite number 0 or more; it is -1.");
        });
    });

    describe("sliceByFrames", () => {
        it("should give the faces inside the solid plane by plane, in the order of the frames", () => {
            // Arrange
            const frames = [level(2.5), level(20), across([1, 0, 0], [0, 0, 0]), level(7.5), level(7.5)];

            // Act
            const slices = occt.operations.sliceByFrames({ shape: holedCube(), frames, makeFaces: true, tolerance: 1e-7 });

            // Assert
            const ring = 100 - 9 * Math.PI;
            expect(slices).toHaveLength(5);
            expect(countOf(slices[0]!, "faces")).toBe(1);
            expect(areaOf(slices[0]!)).toBeCloseTo(ring, 6);
            expect(countOf(slices[1]!, "faces")).toBe(0);
            expect(countOf(slices[2]!, "faces")).toBe(2);
            expect(areaOf(slices[2]!)).toBeCloseTo(40, 6);
            expect(areaOf(slices[3]!)).toBeCloseTo(ring, 6);
            expect(areaOf(slices[4]!)).toBeCloseTo(ring, 6);
            expect(occt.operations.boundingBoxOfShape({ shape: slices[3]! }).center[1]).toBeCloseTo(7.5, 9);
        });

        it("should give the section wires instead of faces when asked", () => {
            // Arrange
            const shape = holedCube();

            // Act
            const [slice] = occt.operations.sliceByFrames({ shape, frames: [level(5)], makeFaces: false });

            // Assert
            const lengths = occt.shapes.wire.getWires({ shape: slice! }).map(wire => occt.shapes.wire.getWireLength({ shape: wire })).sort((a, b) => a - b);
            expect(countOf(slice!, "faces")).toBe(0);
            expect(lengths[0]).toBeCloseTo(6 * Math.PI, 6);
            expect(lengths[1]).toBeCloseTo(40, 9);
        });

        it("should make faces by default and give nothing for no frames", () => {
            // Arrange
            const shape = cube();

            // Act
            const slices = occt.operations.sliceByFrames({ shape, frames: [level(4)] });
            const none = occt.operations.sliceByFrames({ shape, frames: [] });

            // Assert
            expect(countOf(slices[0]!, "faces")).toBe(1);
            expect(areaOf(slices[0]!)).toBeCloseTo(100, 9);
            expect(none).toEqual([]);
        });

        it("should give a face crossed by a plane a wire but no face", () => {
            // Arrange
            const frames = [across([1, 0, 0], [0, 0, 0])];

            // Act
            const [faces] = occt.operations.sliceByFrames({ shape: square(), frames, makeFaces: true });
            const [wires] = occt.operations.sliceByFrames({ shape: square(), frames, makeFaces: false });

            // Assert
            expect(countOf(faces!, "faces")).toBe(0);
            expect(countOf(wires!, "wires")).toBe(1);
            expect(lengthOf(wires!)).toBeCloseTo(10, 9);
        });

        it("should refuse frames that are not frames and a tolerance that is not a number", () => {
            // Arrange
            const shape = cube();

            // Act
            const notList = thrownBy(() => occt.operations.sliceByFrames({ shape, frames: loose(level(1)) }));
            const flat = thrownBy(() => occt.operations.sliceByFrames({ shape, frames: [level(1), { origin: [0, 0, 0], normal: [0, 0, 0], direction: [1, 0, 0] }] }));
            const nan = thrownBy(() => occt.operations.sliceByFrames({ shape, frames: [level(1)], tolerance: Number.NaN }));

            // Assert
            expect(notList.message).toBe("`frames` is not a list of frames.");
            expect(flat.message).toBe("`frames` at position 1 is not a frame: its `normal` has no length.");
            expect(nan.message).toBe("`tolerance` must be a finite number 0 or more; it is NaN.");
        });
    });

    describe("splitByFrame", () => {
        it("should put the piece the normal points to in front and the rest behind", () => {
            // Arrange
            const frame = across([1, 0, 0], [-2, 0, 0]);

            // Act
            const { front, back } = occt.operations.splitByFrame({ shape: cube(), frame });

            // Assert
            expect(volumeOf(front)).toBeCloseTo(700, 9);
            expect(volumeOf(back)).toBeCloseTo(300, 9);
            expect(occt.operations.boundingBoxOfShape({ shape: front }).min[0]).toBeCloseTo(-2, 6);
            expect(occt.operations.boundingBoxOfShape({ shape: back }).max[0]).toBeCloseTo(-2, 6);
        });

        it("should leave a shape the plane misses whole on the side its normal says", () => {
            // Arrange
            const behind = across([1, 0, 0], [-10, 0, 0]);
            const facingAway = across([-1, 0, 0], [-10, 0, 0]);

            // Act
            const inFront = occt.operations.splitByFrame({ shape: cube(), frame: behind });
            const atBack = occt.operations.splitByFrame({ shape: cube(), frame: facingAway });

            // Assert
            expect(volumeOf(inFront.front)).toBeCloseTo(1000, 9);
            expect(countOf(inFront.back, "solids")).toBe(0);
            expect(countOf(atBack.front, "solids")).toBe(0);
            expect(volumeOf(atBack.back)).toBeCloseTo(1000, 9);
        });

        it("should split faces and edges when the shape has no solids", () => {
            // Arrange
            const frame = across([1, 0, 0], [-2, 0, 0]);
            const line = occt.shapes.edge.line({ start: [-5, 0, 0], end: [5, 0, 0] });

            // Act
            const faces = occt.operations.splitByFrame({ shape: square(), frame });
            const edges = occt.operations.splitByFrame({ shape: line, frame });

            // Assert
            expect(areaOf(faces.front)).toBeCloseTo(70, 9);
            expect(areaOf(faces.back)).toBeCloseTo(30, 9);
            expect(lengthOf(edges.front)).toBeCloseTo(7, 9);
            expect(lengthOf(edges.back)).toBeCloseTo(3, 9);
        });

        it("should refuse a frame whose direction runs along its normal and a missing shape", () => {
            // Arrange
            const shape = cube();

            // Act
            const along = thrownBy(() => occt.operations.splitByFrame({ shape, frame: { origin: [0, 0, 0], normal: [1, 0, 0], direction: [2, 0, 0] } }));
            const missing = thrownBy(() => occt.operations.splitByFrame({ shape: loose(undefined), frame: level(1) }));

            // Assert
            expect(along.message).toBe("`frame` is not a frame: its `direction` runs along its `normal` or has no length.");
            expect(missing.message).toBe("`shape` is missing or empty, as an operation that failed can leave it.");
        });
    });

    describe("splitFaceByWires", () => {
        it("should cut a face in two along a line and cut out the region a loop encloses", () => {
            // Arrange
            const line = occt.shapes.edge.line({ start: [0, 0, -6], end: [0, 0, 6] });
            const circle = occt.shapes.wire.createCircleWire({ radius: 1, center: [-2.5, 0, 0], direction: [0, 1, 0] });

            // Act
            const halves = occt.operations.splitFaceByWires({ shape: square(), wires: [line] });
            const pieces = occt.operations.splitFaceByWires({ shape: square(), wires: [line, circle] });

            // Assert
            const areas = pieces.map(piece => occt.shapes.face.getFaceArea({ shape: piece }));
            expect(halves.map(half => occt.shapes.face.getFaceArea({ shape: half }))).toEqual([50, 50].map(area => expect.closeTo(area, 9)));
            expect(pieces).toHaveLength(3);
            expect(areas.reduce((sum, area) => sum + area, 0)).toBeCloseTo(100, 6);
            expect(areas.some(area => Math.abs(area - Math.PI) < 1e-6)).toBe(true);
        });

        it("should give the face back whole when there are no cutters", () => {
            // Arrange
            const face = square();

            // Act
            const pieces = occt.operations.splitFaceByWires({ shape: face, wires: [] });

            // Assert
            expect(pieces).toHaveLength(1);
            expect(occt.shapes.face.getFaceArea({ shape: pieces[0]! })).toBeCloseTo(100, 9);
        });

        it("should refuse a shape that is not a face and a missing cutter", () => {
            // Arrange
            const line = occt.shapes.edge.line({ start: [0, 0, -6], end: [0, 0, 6] });

            // Act
            const notFace = kernelMessage(() => occt.operations.splitFaceByWires({ shape: loose(cube()), wires: [line] }));
            const missing = thrownBy(() => occt.operations.splitFaceByWires({ shape: square(), wires: [loose(undefined)] }));

            // Assert
            expect(notFace).toBe("Standard_DomainError: SplitFaceByWires: the shape is not a face");
            expect(missing.message).toBe("`wires` holds a missing or empty shape at position 0, as an operation that failed can leave it.");
        });
    });

    describe("slice and sliceInStepPattern", () => {
        it("should give one compound per solid holding its section faces, from the bottom of the shape up", () => {
            // Arrange
            const pair = occt.shapes.compound.makeCompound({ shapes: [holedCube(), occt.shapes.solid.createBox({ width: 2, length: 2, height: 10, center: [20, 5, 0] })] });

            // Act
            const slices = occt.operations.slice({ shape: pair, step: 2.5, direction: [0, 1, 0] });

            // Assert
            const perSolid = occt.shapes.compound.getShapesOfCompound({ shape: slices });
            const ringAreas = occt.shapes.face.getFaces({ shape: perSolid[0]! }).map(face => occt.shapes.face.getFaceArea({ shape: face }));
            const postAreas = occt.shapes.face.getFaces({ shape: perSolid[1]! }).map(face => occt.shapes.face.getFaceArea({ shape: face }));
            expect(perSolid).toHaveLength(2);
            expect(ringAreas).toEqual(Array.from({ length: 5 }, () => expect.closeTo(100 - 9 * Math.PI, 6)));
            expect(postAreas).toEqual(Array.from({ length: 5 }, () => expect.closeTo(4, 9)));
        });

        it("should slice along a direction and turn the faces square to it", () => {
            // Arrange
            const shape = holedCube();

            // Act
            const slices = occt.operations.slice({ shape, step: 3, direction: [1, 0, 0] });

            // Assert
            const faces = occt.shapes.face.getFaces({ shape: slices });
            const normals = faces.map(face => occt.shapes.face.normalOnUV({ shape: face, paramU: 0.5, paramV: 0.5 }));
            const chord = (x: number): number => 2 * Math.sqrt(9 - x * x);
            expect(faces).toHaveLength(6);
            expect(areaOf(slices)).toBeCloseTo(4 * 100 - 10 * chord(-2) - 10 * chord(1), 5);
            expect(normals.every(normal => Math.abs(Math.abs(normal[0]) - 1) < 1e-9)).toBe(true);
        });

        it("should keep each face once where a step pattern cuts at the same level twice", () => {
            // Arrange
            const post = occt.shapes.solid.createBox({ width: 1, length: 1, height: 5, center: [0, 0, 0] });

            // Act
            const slices = occt.operations.sliceInStepPattern({ shape: post, steps: [2, -1], direction: [0, 1, 0] });

            // Assert
            const heights = occt.shapes.face.getFaces({ shape: slices }).map(face => occt.shapes.face.getFaceCenterOfMass({ shape: face })[1]);
            expect([...heights].sort((a, b) => a - b)).toEqual([-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map(y => expect.closeTo(y, 5)));
        });

        it("should leave out a solid that no plane crosses", () => {
            // Arrange
            const tall = occt.shapes.solid.createBox({ width: 2, length: 2, height: 10, center: [0, 5, 0] });
            const thin = occt.shapes.solid.createBox({ width: 2, length: 2, height: 0.2, center: [10, 3.5, 0] });
            const pair = occt.shapes.compound.makeCompound({ shapes: [tall, thin] });

            // Act
            const slices = occt.operations.slice({ shape: pair, step: 1, direction: [0, 1, 0] });

            // Assert
            const perSolid = occt.shapes.compound.getShapesOfCompound({ shape: slices });
            expect(perSolid).toHaveLength(1);
            expect(occt.shapes.face.getFaces({ shape: perSolid[0]! })).toHaveLength(11);
        });

        it("should give an empty compound for a shape too thin to slice", () => {
            // Arrange
            const point = occt.shapes.vertex.vertexFromXYZ({ x: 1, y: 2, z: 3 });

            // Act
            const slices = occt.operations.slice({ shape: point, step: 0.1, direction: [0, 1, 0] });

            // Assert
            expect(occt.shapes.compound.getShapesOfCompound({ shape: slices })).toEqual([]);
        });
    });
});
