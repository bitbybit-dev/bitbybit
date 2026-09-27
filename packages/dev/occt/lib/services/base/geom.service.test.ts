import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTEdge, OCCTWire } from "../shapes";
import * as Inputs from "../../api/inputs";

describe("OCCT geom service unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let edge: OCCTEdge;
    let wire: OCCTWire;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        edge = new OCCTEdge(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
    });

    const closeTo12 = (points: number[][]): unknown[] => points.map(point => point.map(value => expect.closeTo(value, 12)));
    const polyline = () => wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 0, 10]] });

    describe("pointsAtLengths", () => {
        it("should land each point its distance along a straight edge", () => {
            // Arrange
            const line = edge.line({ start: [0, 0, 0], end: [10, 0, 0] });

            // Act
            const points = occHelper.geomService.pointsAtLengths(line, [0, 2.5]);

            // Assert
            expect(points).toEqual(closeTo12([[0, 0, 0], [2.5, 0, 0]]));
        });

        it("should measure along the arc, not across it", () => {
            // Arrange
            const circle = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const points = occHelper.geomService.pointsAtLengths(circle, [Math.PI, 2 * Math.PI]);

            // Assert
            expect(points).toEqual(closeTo12([[0, 2, 0], [-2, 0, 0]]));
        });

        it("should run on past a wire's corner, and answer in the order the lengths were given", () => {
            // Arrange
            const corner = polyline();

            // Act
            const points = occHelper.geomService.pointsAtLengths(corner, [20, 15, 0, 10]);

            // Assert
            expect(points).toEqual(closeTo12([[10, 0, 10], [10, 0, 5], [0, 0, 0], [10, 0, 0]]));
        });

        it("should refuse a shape that is neither an edge nor a wire", () => {
            // Arrange
            const face = occHelper.facesService.createSquareFace({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const act = () => occHelper.geomService.pointsAtLengths(face, [1]);

            // Assert
            expect(act).toThrow("Points can only be sampled along an edge or a wire that has some length.");
        });
    });

    describe("pointsAtNormalizedParameters", () => {
        it("should map 0 and 1 onto a wire's ends and the rest linearly onto its parameters", () => {
            // Arrange
            const corner = polyline();

            // Act
            const points = occHelper.geomService.pointsAtNormalizedParameters(corner, [0, 0.25, 0.5, 1]);

            // Assert
            expect(points).toEqual(closeTo12([[0, 0, 0], [5, 0, 0], [10, 0, 0], [10, 0, 10]]));
        });
    });

    describe("divisions", () => {
        const divide = (nrOfDivisions: number, removeStartPoint = false, removeEndPoint = false): Inputs.OCCT.DivideDto<unknown> & { nrOfDivisions: number, removeStartPoint: boolean, removeEndPoint: boolean } =>
            ({ shape: undefined, nrOfDivisions, removeStartPoint, removeEndPoint });

        it("should space the values evenly from 0 to the total", () => {
            // Act
            const values = occHelper.geomService.divisions(divide(4), 10);

            // Assert
            expect(values).toEqual([0, 2.5, 5, 7.5, 10]);
        });

        it("should end exactly on the total, however it rounds", () => {
            // Act
            const values = occHelper.geomService.divisions(divide(3), 0.9);

            // Assert
            expect(values[3]).toBe(0.9);
        });

        it("should leave out the first and the last when asked", () => {
            // Act
            const values = occHelper.geomService.divisions(divide(4, true, true), 10);

            // Assert
            expect(values).toEqual([2.5, 5, 7.5]);
        });

        it("should refuse fewer than one division, naming the input", () => {
            // Act
            let refusal: unknown;
            try {
                occHelper.geomService.divisions(divide(0), 10);
            } catch (failure) {
                refusal = failure;
            }

            // Assert
            expect(refusal).toMatchObject({ name: "InputError", property: "nrOfDivisions", message: "`nrOfDivisions` must be at least 1, and is 0." });
        });
    });

    describe("properties of many shapes in one call", () => {
        it("should measure each edge and wire along its curve, with the centre of its edges", () => {
            // Arrange
            const line = edge.line({ start: [0, 0, 0], end: [10, 0, 0] });

            // Act
            const measured = occHelper.geomService.lengthsAndCentres([line, polyline()]);

            // Assert
            expect(measured.map(each => each.mass)).toEqual([10, 20].map(value => expect.closeTo(value, 12)));
            expect(measured.map(each => each.centre)).toEqual(closeTo12([[5, 0, 0], [7.5, 0, 2.5]]));
        });

        it("should give the area and centroid of each shape's faces", () => {
            // Arrange
            const square = occHelper.facesService.createSquareFace({ size: 2, center: [1, 1, 1], direction: [0, 1, 0] });
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0.5, 1, 1.5]);

            // Act
            const measured = occHelper.geomService.areasAndCentres([square, box]);

            // Assert
            expect(measured.map(each => each.mass)).toEqual([4, 22].map(value => expect.closeTo(value, 12)));
            expect(measured.map(each => each.centre)).toEqual(closeTo12([[1, 1, 1], [0.5, 1, 1.5]]));
        });

        it("should give the volume and centre of mass of each shape's solids", () => {
            // Arrange
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0.5, 1, 1.5]);
            const cube = occHelper.entitiesService.bRepPrimAPIMakeBox(2, 2, 2, [5, 0, 0]);

            // Act
            const measured = occHelper.geomService.volumesAndCentres([box, cube]);

            // Assert
            expect(measured.map(each => each.mass)).toEqual([6, 8].map(value => expect.closeTo(value, 12)));
            expect(measured.map(each => each.centre)).toEqual(closeTo12([[0.5, 1, 1.5], [5, 0, 0]]));
        });
    });
});
