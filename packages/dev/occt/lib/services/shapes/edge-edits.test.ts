import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { readKernelException } from "../../kernel-exception";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";

describe("OCCT edge edits: split, extend and blend", () => {
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
    const unit = (vector: Inputs.Base.Vector3): Inputs.Base.Vector3 => {
        const length = Math.hypot(...vector);
        return [vector[0] / length, vector[1] / length, vector[2] / length];
    };
    const segment = (start: Inputs.Base.Point3, end: Inputs.Base.Point3): TopoDS_Edge => occt.shapes.edge.line({ start, end });
    const ends = (edge: TopoDS_Edge): Inputs.Base.Point3[] => [occt.shapes.edge.startPointOnEdge({ shape: edge }), occt.shapes.edge.endPointOnEdge({ shape: edge })];
    const lengthOf = (edge: TopoDS_Edge): number => occt.shapes.edge.getEdgeLength({ shape: edge });
    const halfCircle = (): TopoDS_Edge => occt.shapes.edge.arcThroughThreePoints({ start: [5, 0, 0], middle: [0, 5, 0], end: [-5, 0, 0] });
    const quarterArc = (): TopoDS_Edge => occt.shapes.edge.arcThroughThreePoints({ start: [5, 0, 0], middle: [5 * Math.SQRT1_2, 5 * Math.SQRT1_2, 0], end: [0, 5, 0] });
    const splineEdge = (): TopoDS_Edge => occt.shapes.edge.getEdges({ shape: occt.shapes.wire.interpolatePoints({ points: [[0, 0, 0], [3, 2, 0], [6, -1, 0], [9, 1, 0]], periodic: false, tolerance: 1e-7 }) })[0]!;

    describe("splitEdgeAtParams and splitEdgeAtLengths", () => {
        it("should cut a half circle in the middle into two arcs of the same circle", () => {
            // Arrange
            const arc = halfCircle();

            // Act
            const pieces = occt.shapes.edge.splitEdgeAtParams({ shape: arc, params: [0.5] });

            // Assert
            expect(pieces).toHaveLength(2);
            expect(pieces.map(lengthOf)).toEqual(close([2.5 * Math.PI, 2.5 * Math.PI]));
            expect(ends(pieces[0]!)).toEqual([close([5, 0, 0]), close([0, 5, 0])]);
            expect(ends(pieces[1]!)).toEqual([close([0, 5, 0]), close([-5, 0, 0])]);
            pieces.forEach(piece => {
                expect(occt.analysis.curves.curveType({ shape: piece })).toBe(Inputs.OCCT.curveTypeEnum.circle);
                expect(occt.shapes.edge.getCircularEdgeRadius({ shape: piece })).toBeCloseTo(5, 9);
            });
        });

        it("should sort the places, skip the ends and repeats, and give one piece more than the places inside", () => {
            // Arrange
            const line = segment([0, 0, 0], [10, 0, 0]);

            // Act
            const pieces = occt.shapes.edge.splitEdgeAtParams({ shape: line, params: [0.7, 0.2, 0.2, 0, 1] });
            const whole = occt.shapes.edge.splitEdgeAtParams({ shape: line, params: [] });

            // Assert
            expect(pieces.map(lengthOf)).toEqual(close([2, 5, 3]));
            expect(ends(pieces[1]!)).toEqual([close([2, 0, 0]), close([7, 0, 0])]);
            expect(whole.map(lengthOf)).toEqual(close([10]));
        });

        it("should keep the direction of a reversed edge in its pieces", () => {
            // Arrange
            const backwards = occt.shapes.edge.reversedEdge({ shape: segment([0, 0, 0], [10, 0, 0]) });

            // Act
            const [first, second] = occt.shapes.edge.splitEdgeAtParams({ shape: backwards, params: [0.25] });

            // Assert
            expect(ends(first!)).toEqual([close([10, 0, 0]), close([7.5, 0, 0])]);
            expect(ends(second!)).toEqual([close([7.5, 0, 0]), close([0, 0, 0])]);
        });

        it("should cut at lengths along the curve, a B-spline into a third and two thirds of its length", () => {
            // Arrange
            const spline = splineEdge();
            const length = lengthOf(spline);
            const line = segment([0, 0, 0], [10, 0, 0]);

            // Act
            const splinePieces = occt.shapes.edge.splitEdgeAtLengths({ shape: spline, lengths: [length / 3] });
            const linePieces = occt.shapes.edge.splitEdgeAtLengths({ shape: line, lengths: [3, 10, 15, 3] });

            // Assert
            expect(splinePieces.map(piece => lengthOf(piece) / length)).toEqual(close([1 / 3, 2 / 3], 6));
            expect(linePieces.map(lengthOf)).toEqual(close([3, 7]));
        });

        it("should refuse a wire, a fraction past the end and a negative length", () => {
            // Arrange
            const wire = occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] });
            const line = segment([0, 0, 0], [10, 0, 0]);

            // Act
            const notAnEdge = thrownBy(() => occt.shapes.edge.splitEdgeAtParams({ shape: loose(wire), params: [0.5] }));
            const pastTheEnd = thrownBy(() => occt.shapes.edge.splitEdgeAtParams({ shape: line, params: [1.2] }));
            const negative = thrownBy(() => occt.shapes.edge.splitEdgeAtLengths({ shape: line, lengths: [-2] }));

            // Assert
            expect(notAnEdge.message).toBe("`shape` is not an edge; a wire is cut by `shapes.wire.splitWireAtParams` and its siblings.");
            expect(pastTheEnd.message).toBe("`params` holds 1.2 at position 0; each is a finite number from 0 to 1.");
            expect(negative.message).toBe("`lengths` holds -2 at position 0; each is a finite number 0 or more.");
        });
    });

    describe("extendEdge", () => {
        it("should lengthen a line at both ends and keep it a line", () => {
            // Arrange
            const line = segment([0, 0, 0], [10, 0, 0]);

            // Act
            const longer = occt.shapes.edge.extendEdge({ shape: line, atStart: 2, atEnd: 3 });
            const byDefault = occt.shapes.edge.extendEdge({ shape: line });

            // Assert
            expect(ends(longer)).toEqual([close([-2, 0, 0]), close([13, 0, 0])]);
            expect(lengthOf(longer)).toBeCloseTo(15, 9);
            expect(occt.analysis.curves.curveType({ shape: longer })).toBe(Inputs.OCCT.curveTypeEnum.line);
            expect(ends(byDefault)).toEqual([close([0, 0, 0]), close([11, 0, 0])]);
        });

        it("should grow an arc by the angles the lengths make on its radius, keeping it an arc", () => {
            // Arrange
            const arc = quarterArc();

            // Act
            const longer = occt.shapes.edge.extendEdge({ shape: arc, atStart: 1.25 * Math.PI, atEnd: 2.5 * Math.PI });

            // Assert
            expect(ends(longer)).toEqual([close([5 * Math.SQRT1_2, -5 * Math.SQRT1_2, 0]), close([-5, 0, 0])]);
            expect(lengthOf(longer)).toBeCloseTo(6.25 * Math.PI, 9);
            expect(occt.shapes.edge.getCircularEdgeRadius({ shape: longer })).toBeCloseTo(5, 9);
        });

        it("should carry a B-spline on to the point that far along its end tangent, from the same start", () => {
            // Arrange
            const spline = splineEdge();
            const [start, end] = ends(spline);
            const direction = unit(occt.shapes.edge.tangentOnEdgeAtParam({ shape: spline, param: 1 }));

            // Act
            const longer = occt.shapes.edge.extendEdge({ shape: spline, atStart: 0, atEnd: 2 });

            // Assert
            expect(ends(longer)).toEqual([close(start!), close(end!.map((coordinate, axis) => coordinate + 2 * direction[axis]!), 7)]);
            expect(lengthOf(longer)).toBeGreaterThan(lengthOf(spline) + 2 - 1e-9);
        });

        it("should keep a reversed edge running the same way", () => {
            // Arrange
            const backwards = occt.shapes.edge.reversedEdge({ shape: segment([0, 0, 0], [10, 0, 0]) });

            // Act
            const longer = occt.shapes.edge.extendEdge({ shape: backwards, atStart: 2, atEnd: 3 });

            // Assert
            expect(ends(longer)).toEqual([close([12, 0, 0]), close([-3, 0, 0])]);
        });

        it("should refuse negative and missing lengths, and a wire", () => {
            // Arrange
            const line = segment([0, 0, 0], [10, 0, 0]);
            const wire = occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] });

            // Act
            const negative = thrownBy(() => occt.shapes.edge.extendEdge({ shape: line, atStart: -1 }));
            const notANumber = thrownBy(() => occt.shapes.edge.extendEdge({ shape: line, atEnd: NaN }));
            const notAnEdge = messageOf(() => occt.shapes.edge.extendEdge({ shape: loose(wire) }));

            // Assert
            expect(negative.message).toBe("`atStart` must be a finite number 0 or more; it is -1.");
            expect(notANumber.message).toBe("`atEnd` must be a finite number 0 or more; it is NaN.");
            expect(notAnEdge).toBe("Standard_DomainError: ExtendCurve: the shape is not an edge");
        });
    });

    describe("blendBetweenEdges", () => {
        it("should leave the end of the first edge and reach the start of the second along their tangents", () => {
            // Arrange
            const from = segment([0, 0, 0], [10, 0, 0]);
            const to = segment([20, 5, 0], [30, 5, 0]);

            // Act
            const blend = occt.shapes.edge.blendBetweenEdges({ from, to });

            // Assert
            expect(ends(blend)).toEqual([close([10, 0, 0]), close([20, 5, 0])]);
            expect(unit(occt.shapes.edge.tangentOnEdgeAtParam({ shape: blend, param: 0 }))).toEqual(close([1, 0, 0]));
            expect(unit(occt.shapes.edge.tangentOnEdgeAtParam({ shape: blend, param: 1 }))).toEqual(close([1, 0, 0]));
            expect(occt.analysis.curves.curveType({ shape: blend })).toBe(Inputs.OCCT.curveTypeEnum.bezier);
        });

        it("should match each arc's curvature at its end when asked, bending toward the arc's center, and not otherwise", () => {
            // Arrange
            const from = quarterArc();
            const to = occt.shapes.edge.arcThroughThreePoints({ start: [-6, 5, 0], middle: [-6 - Math.SQRT2, 3 + Math.SQRT2, 0], end: [-8, 3, 0] });

            // Act
            const quintic = occt.shapes.edge.blendBetweenEdges({ from, to, matchCurvature: true });
            const cubic = occt.shapes.edge.blendBetweenEdges({ from, to, matchCurvature: false });

            // Assert
            const [leaving, arriving] = occt.analysis.curves.curvaturesAtParams({ shape: quintic, params: [0, 1] });
            const [cubicLeaving] = occt.analysis.curves.curvaturesAtParams({ shape: cubic, params: [0] });
            expect([leaving!.curvature, arriving!.curvature]).toEqual(close([0.2, 0.5], 7));
            expect(leaving!.center).toEqual(close([0, 0, 0], 6));
            expect(arriving!.center).toEqual(close([-6, 3, 0], 6));
            expect(Math.abs(cubicLeaving!.curvature - 0.2)).toBeGreaterThan(1e-3);
        });

        it("should swing wider with a larger bulge", () => {
            // Arrange
            const from = segment([0, 0, 0], [10, 0, 0]);
            const to = segment([20, 5, 0], [30, 5, 0]);

            // Act
            const tight = occt.shapes.edge.blendBetweenEdges({ from, to, bulge: 1 });
            const wide = occt.shapes.edge.blendBetweenEdges({ from, to, bulge: 2 });

            // Assert
            expect(lengthOf(wide)).toBeGreaterThan(lengthOf(tight));
            expect(ends(wide)).toEqual([close([10, 0, 0]), close([20, 5, 0])]);
        });

        it("should refuse a bulge of 0, a flag that is not true or false, and edges that already meet", () => {
            // Arrange
            const from = segment([0, 0, 0], [10, 0, 0]);
            const touching = segment([10, 0, 0], [20, 5, 0]);

            // Act
            const noBulge = thrownBy(() => occt.shapes.edge.blendBetweenEdges({ from, to: touching, bulge: 0 }));
            const notAFlag = thrownBy(() => occt.shapes.edge.blendBetweenEdges({ from, to: touching, matchCurvature: loose("yes") }));
            const meeting = messageOf(() => occt.shapes.edge.blendBetweenEdges({ from, to: touching }));

            // Assert
            expect(noBulge.message).toBe("`bulge` must be a finite number above 0; it is 0.");
            expect(notAFlag.message).toBe("`matchCurvature` must be true or false; it is yes.");
            expect(meeting).toBe("Standard_DomainError: BlendCurves: the edges already meet");
        });
    });
});
