import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT iso curves and flat patterns", () => {
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
    const lengthsOf = (edges: TopoDS_Edge[]): number[] => edges.map(edge => occt.shapes.edge.getEdgeLength({ shape: edge }));
    const faceOfType = (shape: TopoDS_Shape, type: Inputs.OCCT.surfaceTypeEnum): TopoDS_Face => {
        const [index] = occt.select.faces.ofType({ shape, type });
        return occt.shapes.face.getFace({ shape, index: index! });
    };
    const cylinderWall = (): TopoDS_Face => faceOfType(occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] }), Inputs.OCCT.surfaceTypeEnum.cylinder);
    const drilledTop = (): TopoDS_Face => {
        const drilled = occt.booleans.difference({
            shape: occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5], originOnCenter: true }),
            shapes: [occt.shapes.solid.createCylinder({ radius: 2, height: 20, center: [5, 5, -5], direction: [0, 0, 1] })],
            keepEdges: false,
        });
        const [top] = occt.select.faces.facing({ shape: drilled, direction: [0, 0, 1], angle: 0 });
        return occt.shapes.face.getFace({ shape: drilled, index: top! });
    };
    const sortedPoints = (points: Inputs.Base.Point3[]): Inputs.Base.Point3[] => [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

    describe("isoCurves", () => {
        it("should stop an iso curve at a hole and go on past it, in pieces along the curve", () => {
            // Arrange
            const top = drilledTop();

            // Act
            const middle = occt.shapes.face.isoCurves({ shape: top, isU: true, params: [0.5] });

            // Assert
            const firstEnd = occt.shapes.edge.endPointOnEdge({ shape: middle[0]! });
            const secondStart = occt.shapes.edge.startPointOnEdge({ shape: middle[1]! });
            expect(lengthsOf(middle)).toEqual(close([3, 3]));
            expect(Math.hypot(secondStart[0] - firstEnd[0], secondStart[1] - firstEnd[1], secondStart[2] - firstEnd[2])).toBeCloseTo(4, 9);
        });

        it("should give one whole curve where it misses the hole, the boundary at 0, and nothing outside 0 to 1", () => {
            // Arrange
            const top = drilledTop();

            // Act
            const beside = occt.shapes.face.isoCurves({ shape: top, isU: false, params: [0.1] });
            const boundary = occt.shapes.face.isoCurves({ shape: top, isU: true, params: [0] });
            const outside = occt.shapes.face.isoCurves({ shape: top, isU: true, params: [1.5] });

            // Assert
            expect(lengthsOf(beside)).toEqual(close([10]));
            expect(lengthsOf(boundary)).toEqual(close([10]));
            expect(outside).toEqual([]);
        });

        it("should give a cylinder's exact lines along it and circles around it", () => {
            // Arrange
            const wall = cylinderWall();

            // Act
            const along = occt.shapes.face.isoCurves({ shape: wall, isU: true, params: [0.25] });
            const around = occt.shapes.face.isoCurves({ shape: wall, isU: false, params: [0.5] });

            // Assert
            expect(lengthsOf(along)).toEqual(close([5]));
            expect(lengthsOf(around)).toEqual(close([4 * Math.PI]));
            expect(occt.select.edges.ofType({ shape: along[0]!, type: Inputs.OCCT.curveTypeEnum.line })).toEqual([0]);
            expect(occt.select.edges.ofType({ shape: around[0]!, type: Inputs.OCCT.curveTypeEnum.circle })).toEqual([0]);
        });

        it("should give the curves value after value, u curves by default, and none for values a period away", () => {
            // Arrange
            const wall = cylinderWall();

            // Act
            const two = occt.shapes.face.isoCurves({ shape: wall, params: [0.25, 0.75] });
            const wrapped = occt.shapes.face.isoCurves({ shape: wall, params: [1.25, -0.75] });

            // Assert
            expect(occt.shapes.edge.getEdgesCentersOfMass({ shapes: two })).toEqual([close([0, 2, 2.5]), close([0, -2, 2.5])]);
            expect(wrapped).toEqual([]);
        });

        it("should refuse values that are not numbers, and a shape that is not a face", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0], originOnCenter: true });

            // Act
            const notANumber = thrownBy(() => occt.shapes.face.isoCurves({ shape: cylinderWall(), params: [0.5, Number.NaN] }));
            const notAList = thrownBy(() => occt.shapes.face.isoCurves({ shape: cylinderWall(), params: loose<number[]>(0.5) }));
            const missing = thrownBy(() => occt.shapes.face.isoCurves({ shape: loose<TopoDS_Face>(undefined), params: [0.5] }));
            const solid = messageOf(() => occt.shapes.face.isoCurves({ shape: loose<TopoDS_Face>(box), params: [0.5] }));

            // Assert
            expect(notANumber.message).toBe("`params` holds NaN at position 1; each is a finite number.");
            expect(notAList.message).toBe("`params` is not a list of numbers.");
            expect(missing.property).toBe("shape");
            expect(solid).toBe("Standard_DomainError: IsoCurvesOnFace: the shape is not a face");
        });
    });

    describe("unroll", () => {
        it("should lay a cylinder's wall out flat on the ground plane, facing +Y, as long as its circumference", () => {
            // Arrange
            const wall = cylinderWall();

            // Act
            const pattern = occt.shapes.face.unroll({ shape: wall });

            // Assert
            const box = occt.analysis.measure.tightBoundingBox({ shape: pattern });
            expect(occt.shapes.face.getFaceArea({ shape: pattern })).toBeCloseTo(20 * Math.PI, 6);
            expect(box.min).toEqual(close([0, 0, 0], 6));
            expect(box.max).toEqual(close([4 * Math.PI, 0, 5], 6));
            expect(occt.shapes.face.normalOnUV({ shape: pattern, paramU: 0.5, paramV: 0.5 })).toEqual(close([0, 1, 0]));
            expect(lengthsOf(occt.shapes.edge.getEdges({ shape: pattern })).sort((a, b) => a - b)).toEqual(close([5, 5, 4 * Math.PI, 4 * Math.PI], 6));
        });

        it("should put each point of the kernel's development, (x, y) on the XY plane, at (x, 0, y)", () => {
            // Arrange
            const wall = cylinderWall();
            const development = kernel.UnrollFace(wall, 1e-4);

            // Act
            const pattern = occt.shapes.face.unroll({ shape: wall, tolerance: 1e-4 });

            // Assert
            const developed = occt.shapes.vertex.getVerticesAsPoints({ shape: development }).map(([x, y]): Inputs.Base.Point3 => [x, 0, y]);
            expect(sortedPoints(occt.shapes.vertex.getVerticesAsPoints({ shape: pattern }))).toEqual(sortedPoints(developed).map(point => close(point, 6)));
        });

        it("should lay a pointed cone out as a sector of its slant height, keeping area and outline", () => {
            // Arrange
            const cone = occt.shapes.solid.createCone({ radius1: 3, radius2: 0, height: 4, angle: 360, center: [0, 0, 0], direction: [0, 0, 1] });
            const side = faceOfType(cone, Inputs.OCCT.surfaceTypeEnum.cone);

            // Act
            const sector = occt.shapes.face.unroll({ shape: side });

            // Assert
            const outline = lengthsOf(occt.shapes.edge.getEdges({ shape: sector })).reduce((sum, length) => sum + length, 0);
            expect(occt.shapes.face.getFaceArea({ shape: sector })).toBeCloseTo(15 * Math.PI, 4);
            expect(outline).toBeCloseTo(6 * Math.PI + 10, 4);
            expect(occt.shapes.face.normalOnUV({ shape: sector, paramU: 0.5, paramV: 0.5 })).toEqual(close([0, 1, 0]));
        });

        it("should lay a flat face onto the ground plane unchanged in size", () => {
            // Arrange
            const standing = occt.shapes.face.createRectangleFace({ width: 4, length: 6, center: [1, 2, 3], direction: [1, 0, 0] });

            // Act
            const lying = occt.shapes.face.unroll({ shape: standing });

            // Assert
            const box = occt.analysis.measure.tightBoundingBox({ shape: lying });
            expect(occt.shapes.face.getFaceArea({ shape: lying })).toBeCloseTo(24, 9);
            expect(box.size[1]).toBeCloseTo(0, 9);
            expect([box.size[0], box.size[2]].sort((a, b) => a - b)).toEqual(close([4, 6]));
        });

        it("should refuse a surface that does not unroll without stretching, a tolerance of 0 and a missing face", () => {
            // Arrange
            const ball = occt.shapes.face.getFace({ shape: occt.shapes.solid.createSphere({ radius: 3, center: [0, 0, 0] }), index: 0 });

            // Act
            const stretched = messageOf(() => occt.shapes.face.unroll({ shape: ball }));
            const tolerance = thrownBy(() => occt.shapes.face.unroll({ shape: cylinderWall(), tolerance: 0 }));
            const missing = thrownBy(() => occt.shapes.face.unroll({ shape: loose<TopoDS_Face>(undefined) }));

            // Assert
            expect(stretched).toBe("Standard_DomainError: UnrollFace: the face is not a plane, a cylinder or a cone, which unroll without stretching");
            expect(tolerance.message).toBe("`tolerance` must be a finite number above 0; it is 0.");
            expect(missing.property).toBe("shape");
        });
    });
});
