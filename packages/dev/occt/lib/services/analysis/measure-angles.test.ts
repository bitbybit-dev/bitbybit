import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT angles and bends", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const close = (values: number[], digits = 9): unknown[] => values.map(value => expect.closeTo(value, digits));
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
    const tenBox = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5], originOnCenter: true });
    const faceFacing = (shape: TopoDS_Shape, direction: Inputs.Base.Vector3): TopoDS_Shape => {
        const [index] = occt.select.faces.facing({ shape, direction, angle: 0 });
        return occt.shapes.face.getFace({ shape, index: index! });
    };
    const edgeCentredAt = (shape: TopoDS_Shape, centre: Inputs.Base.Point3): number => {
        const [index] = occt.select.edges.inSphere({ shape, center: centre, radius: 1e-6 });
        return index!;
    };
    const lShape = (): TopoDS_Shape => occt.booleans.difference({
        shape: tenBox(),
        shapes: [occt.shapes.solid.createBox({ width: 10, length: 10, height: 20, center: [10, 5, 10], originOnCenter: true })],
        keepEdges: false,
    });
    const drilledBox = (): TopoDS_Shape => occt.booleans.difference({
        shape: tenBox(),
        shapes: [occt.shapes.solid.createCylinder({ radius: 1.5, height: 20, center: [5, 5, -5], direction: [0, 0, 1] })],
        keepEdges: false,
    });

    describe("angleBetween", () => {
        it("should read a box's top at 90 degrees from its side and 180 from its bottom", () => {
            // Arrange
            const box = tenBox();
            const top = faceFacing(box, [0, 0, 1]);

            // Act
            const toSide = occt.analysis.measure.angleBetween({ shapeA: top, shapeB: faceFacing(box, [1, 0, 0]) });
            const toBottom = occt.analysis.measure.angleBetween({ shapeA: top, shapeB: faceFacing(box, [0, 0, -1]) });

            // Assert
            expect(toSide.angle).toBeCloseTo(90, 9);
            expect(toSide.directionA).toEqual(close([0, 0, 1]));
            expect(toSide.directionB).toEqual(close([1, 0, 0]));
            expect(toBottom.angle).toBeCloseTo(180, 9);
            expect(toBottom.directionB).toEqual(close([0, 0, -1]));
        });

        it("should read an edge rising above a face at 0 degrees from the face's normal, and reversed at 180", () => {
            // Arrange
            const top = faceFacing(tenBox(), [0, 0, 1]);
            const rising = occt.shapes.edge.line({ start: [5, 5, 11], end: [5, 5, 15] });
            const falling = occt.shapes.edge.line({ start: [5, 5, 15], end: [5, 5, 11] });

            // Act
            const up = occt.analysis.measure.angleBetween({ shapeA: rising, shapeB: top });
            const down = occt.analysis.measure.angleBetween({ shapeA: falling, shapeB: top });

            // Assert
            expect(up.angle).toBeCloseTo(0, 9);
            expect(up.pointA).toEqual(close([5, 5, 11]));
            expect(up.pointB).toEqual(close([5, 5, 10]));
            expect(down.angle).toBeCloseTo(180, 9);
        });

        it("should read a slope 30 degrees off a face's plane at 60 degrees from its normal, and edges by their tangents", () => {
            // Arrange
            const top = faceFacing(tenBox(), [0, 0, 1]);
            const slope = occt.shapes.edge.line({ start: [5, 5, 11], end: [5 + 2 * Math.cos(Math.PI / 6), 5, 11 + 2 * Math.sin(Math.PI / 6)] });
            const rising = occt.shapes.edge.line({ start: [5, 5, 11], end: [5, 5, 15] });

            // Act
            const toFace = occt.analysis.measure.angleBetween({ shapeA: top, shapeB: slope });
            const toEdge = occt.analysis.measure.angleBetween({ shapeA: slope, shapeB: rising });

            // Assert
            expect(toFace.angle).toBeCloseTo(60, 9);
            expect(toEdge.angle).toBeCloseTo(60, 9);
            expect(toEdge.directionA).toEqual(close([Math.cos(Math.PI / 6), 0, Math.sin(Math.PI / 6)]));
        });

        it("should refuse a shape that is neither a face nor an edge, and a missing one", () => {
            // Arrange
            const top = faceFacing(tenBox(), [0, 0, 1]);

            // Act
            const solid = messageOf(() => occt.analysis.measure.angleBetween({ shapeA: tenBox(), shapeB: top }));
            const missing = thrownBy(() => occt.analysis.measure.angleBetween({ shapeA: top, shapeB: loose<TopoDS_Shape>(undefined) }));

            // Assert
            expect(solid).toBe("Standard_DomainError: AngleBetween: the first shape is not a face or an edge");
            expect(missing.property).toBe("shapeB");
        });
    });

    describe("dihedralAngle", () => {
        it("should read every edge of a box as convex at 90 degrees", () => {
            // Arrange
            const box = tenBox();

            // Act
            const angles = Array.from({ length: 12 }, (_, index) => occt.analysis.measure.dihedralAngle({ shape: box, index }));

            // Assert
            angles.forEach(found => {
                expect(found.angle).toBeCloseTo(90, 9);
                expect(found.isConvex).toBe(true);
            });
        });

        it("should name the two faces with the normals that belong to them", () => {
            // Arrange
            const box = tenBox();
            const index = edgeCentredAt(box, [10, 5, 10]);

            // Act
            const found = occt.analysis.measure.dihedralAngle({ shape: box, index });

            // Assert
            const normalOf = (faceIndex: number): Inputs.Base.Vector3 => occt.shapes.face.normalOnUV({ shape: occt.shapes.face.getFace({ shape: box, index: faceIndex }), paramU: 0.5, paramV: 0.5 });
            expect(found.point).toEqual(close([10, 5, 10]));
            expect(found.normalA).toEqual(close(normalOf(found.faceIndexA)));
            expect(found.normalB).toEqual(close(normalOf(found.faceIndexB)));
            expect([found.normalA, found.normalB].sort((first, second) => second[0] - first[0])).toEqual([close([1, 0, 0]), close([0, 0, 1])]);
        });

        it("should read the inner edge of an L as concave at 270 degrees and its outer corners at 90", () => {
            // Arrange
            const shape = lShape();

            // Act
            const inner = occt.analysis.measure.dihedralAngle({ shape, index: edgeCentredAt(shape, [5, 5, 5]) });
            const outer = occt.analysis.measure.dihedralAngle({ shape, index: edgeCentredAt(shape, [0, 5, 10]) });

            // Assert
            expect(inner.angle).toBeCloseTo(270, 9);
            expect(inner.isConvex).toBe(false);
            expect(outer.angle).toBeCloseTo(90, 9);
            expect(outer.isConvex).toBe(true);
        });

        it("should read the angle a share of the way along the edge as it runs, and at the middle by default", () => {
            // Arrange
            const box = tenBox();
            const edge = occt.shapes.edge.getEdge({ shape: box, index: 4 });
            const start = occt.shapes.edge.startPointOnEdge({ shape: edge });
            const end = occt.shapes.edge.endPointOnEdge({ shape: edge });

            // Act
            const quarter = occt.analysis.measure.dihedralAngle({ shape: box, index: 4, param: 0.25 });
            const byDefault = occt.analysis.measure.dihedralAngle({ shape: box, index: 4 });

            // Assert
            expect(quarter.point).toEqual(close([0, 1, 2].map(axis => start[axis]! + 0.25 * (end[axis]! - start[axis]!))));
            expect(byDefault.point).toEqual(close([0, 1, 2].map(axis => (start[axis]! + end[axis]!) / 2)));
        });

        it("should read the circular rim of a cylinder as convex at 90 degrees", () => {
            // Arrange
            const cylinder = occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });
            const [rim] = occt.select.edges.ofType({ shape: cylinder, type: Inputs.OCCT.curveTypeEnum.circle });

            // Act
            const found = occt.analysis.measure.dihedralAngle({ shape: cylinder, index: rim!, param: 0.3 });

            // Assert
            expect(found.angle).toBeCloseTo(90, 9);
            expect(Math.hypot(found.point[0], found.point[1])).toBeCloseTo(2, 9);
        });

        it("should refuse an index past the last edge, saying how many there are", () => {
            // Arrange
            const vertex = occt.shapes.vertex.vertexFromPoint({ point: [0, 0, 0] });

            // Act
            const past = thrownBy(() => occt.analysis.measure.dihedralAngle({ shape: tenBox(), index: 12 }));
            const none = thrownBy(() => occt.analysis.measure.dihedralAngle({ shape: vertex, index: 0 }));

            // Assert
            expect(past.message).toBe("`index` is 12, past the shape's last edge: its edges are numbered from 0 to 11.");
            expect(past.property).toBe("index");
            expect(none.message).toBe("`index` is 0, past the shape's last edge: the shape has no edges.");
        });

        it.each([
            { name: "a negative index", inputs: { index: -1 }, property: "index" },
            { name: "a fractional index", inputs: { index: 1.5 }, property: "index" },
            { name: "a place past the end", inputs: { param: 1.5 }, property: "param" },
            { name: "a place that is not a number", inputs: { param: Number.NaN }, property: "param" },
        ])("should refuse $name", ({ inputs, property }) => {
            // Act
            const error = thrownBy(() => occt.analysis.measure.dihedralAngle({ shape: tenBox(), ...inputs }));

            // Assert
            expect(error.property).toBe(property);
        });

        it("should refuse an edge that does not join two faces", () => {
            // Arrange
            const square = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const free = messageOf(() => occt.analysis.measure.dihedralAngle({ shape: square, index: 0 }));

            // Assert
            expect(free).toBe("Standard_DomainError: DihedralAngle: the edge does not join two faces");
        });
    });

    describe("minCurvatureRadius", () => {
        it("should find a ball's radius on its face, and nothing that bends on a box", () => {
            // Arrange
            const ball = occt.shapes.solid.createSphere({ radius: 3, center: [1, 2, 3] });

            // Act
            const round = occt.analysis.measure.minCurvatureRadius({ shape: ball });
            const flat = occt.analysis.measure.minCurvatureRadius({ shape: tenBox() });

            // Assert
            expect(round.radius).toBeCloseTo(3, 9);
            expect(round.support).toBe(Inputs.OCCT.shapeTypeEnum.face);
            expect(round.index).toBe(0);
            expect(Math.hypot(round.point[0] - 1, round.point[1] - 2, round.point[2] - 3)).toBeCloseTo(3, 9);
            expect(flat).toEqual({ radius: Infinity, point: [0, 0, 0], support: Inputs.OCCT.shapeTypeEnum.unknown, index: -1 });
        });

        it("should find a circle's radius on its edge", () => {
            // Arrange
            const circle = occt.shapes.edge.createCircleEdge({ radius: 4, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const found = occt.analysis.measure.minCurvatureRadius({ shape: circle });

            // Assert
            expect(found.radius).toBeCloseTo(4, 9);
            expect(found.support).toBe(Inputs.OCCT.shapeTypeEnum.edge);
            expect(found.index).toBe(0);
        });

        it("should find a drilled hole as the tightest concave bend, and nothing concave on a ball", () => {
            // Arrange
            const part = drilledBox();

            // Act
            const concave = occt.analysis.measure.minCurvatureRadius({ shape: part, concaveOnly: true });
            const onBall = occt.analysis.measure.minCurvatureRadius({ shape: occt.shapes.solid.createSphere({ radius: 3, center: [0, 0, 0] }), concaveOnly: true });

            // Assert
            expect(concave.radius).toBeCloseTo(1.5, 9);
            expect(concave.support).toBe(Inputs.OCCT.shapeTypeEnum.face);
            expect(occt.select.faces.ofType({ shape: part, type: Inputs.OCCT.surfaceTypeEnum.cylinder })).toContain(concave.index);
            expect(onBall.radius).toBe(Infinity);
        });

        it("should read a torus's inner bend at the samples nearest its inside equator", () => {
            // Arrange
            const torus = occt.shapes.solid.createTorus({ majorRadius: 5, minorRadius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
            const nearestSampleAngle = 7 * Math.PI / 8;

            // Act
            const tube = occt.analysis.measure.minCurvatureRadius({ shape: torus, samples: 8 });
            const inside = occt.analysis.measure.minCurvatureRadius({ shape: torus, samples: 8, concaveOnly: true });

            // Assert
            expect(tube.radius).toBeCloseTo(1, 9);
            expect(inside.radius).toBeCloseTo((5 + Math.cos(nearestSampleAngle)) / -Math.cos(nearestSampleAngle), 5);
        });

        it("should refuse a sample count that is not a whole number of 1 or more, and a missing shape", () => {
            // Act
            const none = thrownBy(() => occt.analysis.measure.minCurvatureRadius({ shape: tenBox(), samples: 0 }));
            const fractional = thrownBy(() => occt.analysis.measure.minCurvatureRadius({ shape: tenBox(), samples: 2.5 }));
            const missing = thrownBy(() => occt.analysis.measure.minCurvatureRadius({ shape: loose<TopoDS_Shape>(undefined) }));

            // Assert
            expect(none.message).toBe("`samples` must be a whole number 1 or more; it is 0.");
            expect(fractional.property).toBe("samples");
            expect(missing.property).toBe("shape");
        });
    });
});
