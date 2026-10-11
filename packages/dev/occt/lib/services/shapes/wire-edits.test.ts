import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";

describe("OCCT wire edits: split and open offset", () => {
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
    const openSquare = (): TopoDS_Wire => occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]] });
    const groundL = (): TopoDS_Wire => occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 0, 10]] });
    const lengthOf = (wire: TopoDS_Shape): number => occt.shapes.wire.getWireLength({ shape: loose(wire) });
    const ends = (wire: TopoDS_Shape): Inputs.Base.Point3[] => [occt.shapes.wire.startPointOnWire({ shape: loose(wire) }), occt.shapes.wire.endPointOnWire({ shape: loose(wire) })];
    const floorFacing = (normal: Inputs.Base.Vector3): TopoDS_Face => occt.shapes.face.createSquareFace({ size: 40, center: [0, 0, 0], direction: normal });

    describe("splitWireAtParams and splitWireAtLengths", () => {
        it("should cut an open square at lengths into wires, a piece across a corner holding an edge on each side", () => {
            // Arrange
            const wire = openSquare();

            // Act
            const pieces = occt.shapes.wire.splitWireAtLengths({ shape: wire, lengths: [15, 5, 15, 0, 30] });

            // Assert
            expect(pieces.map(lengthOf)).toEqual(close([5, 10, 15]));
            expect(ends(pieces[1]!)).toEqual([close([5, 0, 0]), close([10, 5, 0])]);
            expect(occt.shapes.edge.getEdges({ shape: pieces[1]! })).toHaveLength(2);
        });

        it("should cut at fractions where each edge takes an equal share", () => {
            // Arrange
            const wire = openSquare();

            // Act
            const halves = occt.shapes.wire.splitWireAtParams({ shape: wire, params: [0.5] });

            // Assert
            expect(halves.map(lengthOf)).toEqual(close([15, 15]));
            expect(ends(halves[0]!)).toEqual([close([0, 0, 0]), close([10, 5, 0])]);
        });

        it("should cut a closed wire into pieces from its start, the corners given by the edges' shares", () => {
            // Arrange
            const square = occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]] });

            // Act
            const pieces = occt.shapes.wire.splitWireAtParams({ shape: square, params: [0.25, 0.75] });

            // Assert
            expect(pieces.map(lengthOf)).toEqual(close([10, 20, 10]));
            expect(ends(pieces[1]!)).toEqual([close([10, 0, 0]), close([0, 10, 0])]);
        });

        it("should cut an edge as a wire of that one edge and give wires back", () => {
            // Arrange
            const edge = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });

            // Act
            const pieces = occt.shapes.wire.splitWireAtParams({ shape: loose(edge), params: [0.5] });

            // Assert
            expect(pieces.map(piece => occt.shapes.shape.getShapeType({ shape: piece }))).toEqual([Inputs.OCCT.shapeTypeEnum.wire, Inputs.OCCT.shapeTypeEnum.wire]);
            expect(pieces.map(lengthOf)).toEqual(close([5, 5]));
        });

        it("should refuse a face, a fraction past the end and a missing wire", () => {
            // Arrange
            const face = floorFacing([0, 1, 0]);

            // Act
            const notACurve = thrownBy(() => occt.shapes.wire.splitWireAtParams({ shape: loose(face), params: [0.5] }));
            const pastTheEnd = thrownBy(() => occt.shapes.wire.splitWireAtParams({ shape: openSquare(), params: [2] }));
            const missing = thrownBy(() => occt.shapes.wire.splitWireAtLengths({ shape: loose(undefined), lengths: [1] }));

            // Assert
            expect(notACurve.message).toBe("`shape` is not an edge or a wire.");
            expect(pastTheEnd.message).toBe("`params` holds 2 at position 0; each is a finite number from 0 to 1.");
            expect(missing.message).toBe("`shape` is missing or empty, as an operation that failed can leave it.");
        });
    });

    describe("offsetOpen", () => {
        it("should draw the offset of a path on the ground plane to its right, seen from above", () => {
            // Arrange
            const path = groundL();

            // Act
            const offset = occt.shapes.wire.offsetOpen({ shape: path, distance: 1 });

            // Assert
            expect(ends(offset)).toEqual([close([0, 0, 1]), close([9, 0, 10])]);
            expect(lengthOf(offset)).toBeCloseTo(18, 9);
        });

        it("should put a negative distance on the left, rounding the outer corner with an arc by default", () => {
            // Arrange
            const path = groundL();

            // Act
            const offset = occt.shapes.wire.offsetOpen({ shape: path, distance: -1 });

            // Assert
            expect(ends(offset)).toEqual([close([0, 0, -1]), close([11, 0, 10])]);
            expect(lengthOf(offset)).toBeCloseTo(20 + Math.PI / 2, 9);
        });

        it("should meet at a sharp corner with the intersection join", () => {
            // Arrange
            const path = groundL();

            // Act
            const offset = occt.shapes.wire.offsetOpen({ shape: path, distance: -1, joinType: Inputs.OCCT.joinTypeEnum.intersection });

            // Assert
            expect(lengthOf(offset)).toBeCloseTo(22, 9);
            expect(occt.operations.distancesToShapeFromPoints({ shape: offset, points: [[11, 0, -1]] })[0]).toBeCloseTo(0, 9);
        });

        it("should offset a straight edge in the plane of a face, to the right seen from the side the face looks to", () => {
            // Arrange
            const edge = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });

            // Act
            const seenFromAbove = occt.shapes.wire.offsetOpen({ shape: edge, face: floorFacing([0, 1, 0]), distance: 1 });
            const seenFromBelow = occt.shapes.wire.offsetOpen({ shape: edge, face: floorFacing([0, -1, 0]), distance: 1 });
            const leftFromAbove = occt.shapes.wire.offsetOpen({ shape: edge, face: floorFacing([0, 1, 0]), distance: -1 });
            const reversedFloor = occt.shapes.wire.offsetOpen({ shape: edge, face: occt.shapes.face.reversedFace({ shape: floorFacing([0, 1, 0]) }), distance: 1 });

            // Assert
            expect(ends(seenFromAbove)).toEqual([close([0, 0, 1]), close([10, 0, 1])]);
            expect(ends(seenFromBelow)).toEqual([close([0, 0, -1]), close([10, 0, -1])]);
            expect(ends(leftFromAbove)).toEqual([close([0, 0, -1]), close([10, 0, -1])]);
            expect(ends(reversedFloor)).toEqual([close([0, 0, -1]), close([10, 0, -1])]);
        });

        it("should keep a path's own plane when the face lies in it, and offset an arc edge without one", () => {
            // Arrange
            const path = groundL();
            const arc = occt.shapes.edge.arcThroughThreePoints({ start: [5, 0, 0], middle: [0, 5, 0], end: [-5, 0, 0] });

            // Act
            const onFloor = occt.shapes.wire.offsetOpen({ shape: path, face: floorFacing([0, 1, 0]), distance: 1 });
            const inside = occt.shapes.wire.offsetOpen({ shape: arc, distance: 1 });
            const byDefault = occt.shapes.wire.offsetOpen({ shape: arc });

            // Assert
            expect(ends(onFloor)).toEqual([close([0, 0, 1]), close([9, 0, 10])]);
            expect(ends(inside)).toEqual([close([4, 0, 0]), close([-4, 0, 0])]);
            expect(lengthOf(inside)).toBeCloseTo(4 * Math.PI, 9);
            expect(lengthOf(byDefault)).toBeCloseTo(4.8 * Math.PI, 9);
        });

        it("should fail on a straight edge with no face to give it a plane", () => {
            // Arrange
            const edge = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });

            // Act
            const act = (): TopoDS_Wire => occt.shapes.wire.offsetOpen({ shape: edge, distance: 1 });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "KernelOperationError", code: "occt.offset.failed" }));
        });

        it("should refuse a curved face, a path off the face's plane, a solid, a wrong join type and a face that is not one", () => {
            // Arrange
            const path = groundL();
            const cylinder = occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });
            const [side] = occt.select.faces.ofType({ shape: cylinder, type: Inputs.OCCT.surfaceTypeEnum.cylinder });
            const wall = occt.shapes.face.getFace({ shape: cylinder, index: side! });
            const upright = occt.shapes.face.createSquareFace({ size: 40, center: [0, 0, 0], direction: [1, 0, 0] });

            // Act
            const curved = thrownBy(() => occt.shapes.wire.offsetOpen({ shape: path, face: wall, distance: 1 }));
            const across = thrownBy(() => occt.shapes.wire.offsetOpen({ shape: path, face: upright, distance: 1 }));
            const solid = thrownBy(() => occt.shapes.wire.offsetOpen({ shape: loose(cylinder), distance: 1 }));
            const join = thrownBy(() => occt.shapes.wire.offsetOpen({ shape: path, distance: 1, joinType: loose("round") }));
            const notAFace = thrownBy(() => occt.shapes.wire.offsetOpen({ shape: path, face: loose(path), distance: 1 }));

            // Assert
            expect(curved.message).toBe("`face` is not flat; an open wire is offset in a plane.");
            expect(across.message).toBe("`shape` does not lie in the plane of `face`.");
            expect(solid.message).toBe("`shape` is not an edge or a wire.");
            expect(join.message).toBe("`joinType` is round, which is none of arc, intersection, tangent.");
            expect(notAFace.message).toBe("`face` is not a face.");
        });
    });
});
