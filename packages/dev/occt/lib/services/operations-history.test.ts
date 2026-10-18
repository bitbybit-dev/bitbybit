import { describe, it, expect, beforeAll } from "vitest";
import type { TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import * as Inputs from "../api/inputs";
import type * as Models from "../api/models";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT operations with history", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const areaOf = (shape: TopoDS_Shape, face: number): number => occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFace({ shape, index: face }) });
    const centreOf = (shape: TopoDS_Shape, face: number): Inputs.Base.Point3 => occt.shapes.face.getFaceCenterOfMass({ shape: occt.shapes.face.getFace({ shape, index: face }) });
    const areasOf = (shape: TopoDS_Shape, faces: number[]): number[] => faces.map(face => areaOf(shape, face)).sort((a, b) => a - b);
    const faceCount = (shape: TopoDS_Shape): number => occt.shapes.face.getFaces({ shape }).length;
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    const reached = (histories: Models.OCCT.ShapeHistory[]): number =>
        new Set(histories.flatMap(history => [
            ...history.faces.flat(), ...history.facesFromFaces.flat(), ...history.facesFromEdges.flat(),
            ...history.facesFromVertices.flat(), ...history.firstFaces, ...history.lastFaces,
        ])).size;
    const cube = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5] });
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };

    describe("offsetWithHistory and offsetAdvWithHistory", () => {
        it("should give every face of a box its offset and the rounded joins to its edges and corners", () => {
            // Arrange
            const box = cube();

            // Act
            const { shape, history } = occt.operations.offsetWithHistory({ shape: box, distance: 1, tolerance: 1e-7 });

            // Assert
            expect(faceCount(shape)).toBe(26);
            expect(history.faces.every(faces => faces.length === 1)).toBe(true);
            expect(new Set(history.faces.flat()).size).toBe(6);
            history.faces.flat().forEach(face => expect(areaOf(shape, face)).toBeCloseTo(100, 6));
            expect(reached([history])).toBe(26);
        });

        it("should extend the faces to sharp corners with intersection joins", () => {
            // Arrange
            const box = cube();

            // Act
            const { shape, history } = occt.operations.offsetAdvWithHistory({ shape: box, distance: 1, tolerance: 1e-7, joinType: Inputs.OCCT.joinTypeEnum.intersection, removeIntEdges: false });

            // Assert
            expect(faceCount(shape)).toBe(6);
            expect(areasOf(shape, history.faces.flat())).toEqual(Array(6).fill(expect.closeTo(144, 6)));
        });

        it("should refuse a distance of 0 and a wire", () => {
            // Arrange
            const square = occt.shapes.wire.createSquareWire({ size: 4, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const none = thrownBy(() => occt.operations.offsetWithHistory({ shape: cube(), distance: 0, tolerance: 1e-7 }));
            const wire = thrownBy(() => occt.operations.offsetAdvWithHistory({ shape: square, distance: 1, tolerance: 1e-7, joinType: Inputs.OCCT.joinTypeEnum.arc, removeIntEdges: false }));

            // Assert
            expect(none.property).toBe("distance");
            expect(wire.property).toBe("shape");
        });
    });

    describe("splitShapeWithShapesWithHistory", () => {
        it("should give the faces a cut crosses their two halves and the others one face", () => {
            // Arrange
            const box = cube();
            const knife = occt.shapes.face.createRectangleFace({ width: 20, length: 20, center: [5, 5, 5], direction: [1, 0, 0] });

            // Act
            const { shape, histories } = occt.operations.splitShapeWithShapesWithHistory({ shape: box, shapes: [knife], localFuzzyTolerance: 1e-7, nonDestructive: false });

            // Assert
            expect(occt.shapes.solid.getSolids({ shape })).toHaveLength(2);
            expect(histories).toHaveLength(2);
            const pieces = histories[0]!.faces.map(faces => areasOf(shape, faces));
            expect(pieces.filter(areas => areas.length === 2 && areas.every(area => Math.abs(area - 50) < 1e-6))).toHaveLength(4);
            expect(pieces.filter(areas => areas.length === 1 && Math.abs(areas[0]! - 100) < 1e-6)).toHaveLength(2);
        });
    });

    describe("rotatedExtrudeWithHistory", () => {
        it("should name the twisted sides, the bottom and the top", () => {
            // Arrange
            const square = occt.shapes.face.createSquareFace({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const { shape, history } = occt.operations.rotatedExtrudeWithHistory({ shape: square, height: 20, angle: 90, makeSolid: true });

            // Assert
            expect(volumeOf(shape)).toBeCloseTo(volumeOf(occt.operations.rotatedExtrude({ shape: square, height: 20, angle: 90, makeSolid: true })), 6);
            expect(new Set(history.facesFromEdges.flat()).size).toBe(4);
            expect(history.firstFaces).toHaveLength(1);
            expect(history.lastFaces).toHaveLength(1);
            expect(areaOf(shape, history.firstFaces[0]!)).toBeCloseTo(25, 6);
            expect(centreOf(shape, history.lastFaces[0]!)[1]).toBeCloseTo(20, 6);
            expect(reached([history])).toBe(faceCount(shape));
        });

        it("should sweep a wire as it sweeps the outline of a face, and refuse a face with a hole", () => {
            // Arrange
            const outline = occt.shapes.wire.createSquareWire({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] });
            const holed = occt.shapes.face.createFaceFromWires({ shapes: [outline, occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, -1, 0] })], planar: true });

            // Act
            const { shape, history } = occt.operations.rotatedExtrudeWithHistory({ shape: outline, height: 20, angle: 90, makeSolid: true });
            const refusal = thrownBy(() => occt.operations.rotatedExtrude({ shape: holed, height: 20, angle: 90, makeSolid: true }));

            // Assert
            expect(volumeOf(shape)).toBeCloseTo(volumeOf(occt.operations.rotatedExtrude({ shape: occt.shapes.face.createSquareFace({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] }), height: 20, angle: 90, makeSolid: true })), 6);
            expect(history.facesFromEdges.map(faces => faces.length)).toEqual([1, 1, 1, 1]);
            expect(refusal.property).toBe("shape");
            expect(refusal.message).toBe("`shape` is a face with 1 hole(s), and a twisted sweep follows one outline: give a face without holes, or its outer wire.");
        });
    });

    describe("pipeWireCylindricalWithHistory and pipePolylineWireNGonWithHistory", () => {
        const options = { makeSolid: true, trihedronEnum: Inputs.OCCT.geomFillTrihedronEnum.isCorrectedFrenet, forceApproxC1: false };

        it("should name the tube along each edge of its path and the two caps", () => {
            // Arrange
            const path = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [0, 10, 0] });

            // Act
            const { shape, history } = occt.operations.pipeWireCylindricalWithHistory({ shape: path, radius: 0.5, ...options });

            // Assert
            expect(history.facesFromEdges).toHaveLength(1);
            expect(areasOf(shape, history.facesFromEdges[0]!)).toEqual([expect.closeTo(10 * Math.PI, 6)]);
            expect(areasOf(shape, [...history.firstFaces, ...history.lastFaces])).toEqual([0.25 * Math.PI, 0.25 * Math.PI].map(area => expect.closeTo(area, 6)));
            expect(centreOf(shape, history.lastFaces[0]!)[1]).toBeCloseTo(10, 6);
            expect(reached([history])).toBe(faceCount(shape));
        });

        it("should name the flat sides of a hexagonal bar along its path", () => {
            // Arrange
            const path = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [0, 10, 0] });

            // Act
            const { shape, history } = occt.operations.pipePolylineWireNGonWithHistory({ shape: path, radius: 0.5, nrCorners: 6, ...options });

            // Assert
            expect(areasOf(shape, history.facesFromEdges[0]!)).toEqual(Array(6).fill(expect.closeTo(5, 6)));
            expect(areasOf(shape, history.lastFaces)).toEqual([expect.closeTo(3 * Math.sqrt(3) / 8, 6)]);
            expect(reached([history])).toBe(faceCount(shape));
        });
    });

    describe("unifySameDomainWithHistory", () => {
        it("should send both halves of a face two fused boxes split to the one face they merge into", () => {
            // Arrange
            const fused = occt.booleans.union({ shapes: [cube(), occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [15, 5, 5] })], keepEdges: true });

            // Act
            const { shape, history } = occt.shapes.shape.unifySameDomainWithHistory({ shape: fused, unifyEdges: true, unifyFaces: true, concatBSplines: false });

            // Assert
            expect(faceCount(fused)).toBe(10);
            expect(faceCount(shape)).toBe(6);
            expect(history.faces.every(faces => faces.length === 1)).toBe(true);
            const merged = [...new Set(history.faces.flat())];
            expect(merged).toHaveLength(6);
            expect(merged.filter(face => Math.abs(areaOf(shape, face) - 200) < 1e-6)).toHaveLength(4);
        });
    });

    describe("sewFacesWithHistory", () => {
        it("should follow each face into the shell and a long edge into both pieces a T-junction cuts it into", () => {
            // Arrange
            const wall = occt.shapes.face.createRectangleFace({ width: 20, length: 10, center: [10, 0, 5], direction: [0, 1, 0] });
            const left = occt.shapes.face.createRectangleFace({ width: 10, length: 10, center: [5, 5, 0], direction: [0, 0, 1] });
            const right = occt.shapes.face.createRectangleFace({ width: 10, length: 10, center: [15, 5, 0], direction: [0, 0, 1] });
            const edges = occt.shapes.edge.getEdges({ shape: wall });
            const long = edges.findIndex(edge => Math.abs(occt.shapes.edge.getEdgeLength({ shape: edge }) - 20) < 1e-9 && Math.abs(occt.shapes.edge.pointOnEdgeAtParam({ shape: edge, param: 0.5 })[2]) < 1e-9);

            // Act
            const { shape, histories } = occt.shapes.shell.sewFacesWithHistory({ shapes: [wall, left, right], tolerance: 1e-7 });

            // Assert
            expect(histories).toHaveLength(3);
            expect(histories.map(history => history.faces.flat().length)).toEqual([1, 1, 1]);
            const pieces = histories[0]!.edges[long]!;
            const sewnEdges = occt.shapes.edge.getEdges({ shape });
            expect(pieces).toHaveLength(2);
            pieces.forEach(piece => expect(occt.shapes.edge.getEdgeLength({ shape: sewnEdges[piece]! })).toBeCloseTo(10, 9));
        });
    });
});
