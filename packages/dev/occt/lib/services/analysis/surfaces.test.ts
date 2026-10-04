import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT surface analysis", () => {
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
    const faceOfType = (shape: TopoDS_Shape, type: Inputs.OCCT.surfaceTypeEnum): TopoDS_Face => {
        const [index] = occt.select.faces.ofType({ shape, type });
        return occt.shapes.face.getFace({ shape, index: index! });
    };
    const cylinderWall = (): TopoDS_Face => faceOfType(occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] }), Inputs.OCCT.surfaceTypeEnum.cylinder);
    const ball = (): TopoDS_Face => occt.shapes.face.getFace({ shape: occt.shapes.solid.createSphere({ radius: 3, center: [0, 0, 0] }), index: 0 });
    const meshFaceWithoutSurface = (): TopoDS_Shape => {
        const stl = "solid t\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid t\n";
        return kernel.ReadStlFromBytes(new TextEncoder().encode(stl), false);
    };
    const trimmedPlaneFace = (): TopoDS_Shape => {
        const top = occt.shapes.face.getFace({ shape: occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5], originOnCenter: true }), index: 5 });
        const lines = kernel.WriteBREPToString(top, true).split("\n");
        const surfaceRecord = lines.findIndex(line => line.startsWith("Surfaces")) + Number(lines[lines.findIndex(line => line.startsWith("Fa")) + 1]!.trim().split(/\s+/)[2]);
        lines[surfaceRecord] = `10 -100 100 -100 100\n${lines[surfaceRecord]}`;
        return kernel.ReadBREPFromString(lines.join("\n"));
    };

    describe("closestPoints", () => {
        it("should find the nearest point of a cylinder wall with its (u, v) as fractions of the face's bounds", () => {
            // Arrange
            const wall = cylinderWall();

            // Act
            const [beside] = occt.analysis.surfaces.closestPoints({ shape: wall, points: [[0, 10, 2.5]] });

            // Assert
            expect(beside!.point).toEqual(close([0, 2, 2.5]));
            expect(beside!.distance).toBeCloseTo(8, 9);
            expect(beside!.u).toBeCloseTo(0.25, 9);
            expect(beside!.v).toBeCloseTo(0.5, 9);
            expect(beside!.normal).toEqual(close([0, 1, 0]));
            expect(beside!.isOnBoundary).toBe(false);
        });

        it("should give (u, v) the face samplers take back to the same point", () => {
            // Arrange
            const wall = cylinderWall();
            const points: Inputs.Base.Point3[] = [[3, -4, 1], [-1, -1, 4.5], [0.5, 2, 0.2]];

            // Act
            const nearest = occt.analysis.surfaces.closestPoints({ shape: wall, points });

            // Assert
            expect(nearest).toHaveLength(3);
            nearest.forEach(found => expect(occt.shapes.face.pointOnUV({ shape: wall, paramU: found.u, paramV: found.v })).toEqual(close(found.point)));
            nearest.forEach(found => expect(Math.hypot(found.point[0], found.point[1])).toBeCloseTo(2, 9));
        });

        it("should bring a point beyond the face to its boundary", () => {
            // Arrange
            const wall = cylinderWall();

            // Act
            const [above] = occt.analysis.surfaces.closestPoints({ shape: wall, points: [[0, 10, 7]] });

            // Assert
            expect(above!.point).toEqual(close([0, 2, 5]));
            expect(above!.distance).toBeCloseTo(Math.hypot(8, 2), 9);
            expect(above!.v).toBeCloseTo(1, 9);
            expect(above!.isOnBoundary).toBe(true);
        });

        it("should give nothing for no points", () => {
            // Act
            const nearest = occt.analysis.surfaces.closestPoints({ shape: cylinderWall(), points: [] });

            // Assert
            expect(nearest).toEqual([]);
        });

        it("should refuse points that are not points, and a shape that is no face", () => {
            // Arrange
            const wall = cylinderWall();
            const box = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0], originOnCenter: true });

            // Act
            const notAList = thrownBy(() => occt.analysis.surfaces.closestPoints({ shape: wall, points: loose<Inputs.Base.Point3[]>("0, 0, 0") }));
            const notAPoint = thrownBy(() => occt.analysis.surfaces.closestPoints({ shape: wall, points: [[0, 0, 0], [0, Number.NaN, 0]] }));
            const missing = thrownBy(() => occt.analysis.surfaces.closestPoints({ shape: loose<TopoDS_Face>(undefined), points: [[0, 0, 0]] }));
            const solid = messageOf(() => occt.analysis.surfaces.closestPoints({ shape: loose<TopoDS_Face>(box), points: [[0, 0, 0]] }));

            // Assert
            expect(notAList.message).toBe("`points` is not a list of points.");
            expect(notAPoint.message).toBe("`points` holds something other than a point at position 1; each is three finite numbers.");
            expect(missing.property).toBe("shape");
            expect(solid).toBe("Standard_DomainError: ClosestPointsOnFace: the shape is not a face");
        });
    });

    describe("curvaturesOnUVs", () => {
        it("should read a ball of radius 3 as bending by 1/3 every way, its normal outward", () => {
            // Arrange
            const face = ball();

            // Act
            const [side] = occt.analysis.surfaces.curvaturesOnUVs({ shape: face, paramsUV: [[0.25, 0.5]] });

            // Assert
            expect(side!.point).toEqual(close([0, 3, 0]));
            expect(side!.normal).toEqual(close([0, 1, 0]));
            expect([side!.maxCurvature, side!.minCurvature, side!.meanCurvature]).toEqual(close([1 / 3, 1 / 3, 1 / 3]));
            expect(side!.gaussianCurvature).toBeCloseTo(1 / 9, 9);
            expect(side!.isUmbilic).toBe(true);
            expect(side!.isDefined).toBe(true);
        });

        it("should read a reversed ball as bending the other way, with the same Gaussian curvature", () => {
            // Arrange
            const inward = occt.shapes.face.reversedFace({ shape: ball() });

            // Act
            const [side] = occt.analysis.surfaces.curvaturesOnUVs({ shape: inward, paramsUV: [[0.25, 0.5]] });

            // Assert
            expect(side!.normal).toEqual(close([0, -1, 0]));
            expect([side!.maxCurvature, side!.minCurvature]).toEqual(close([-1 / 3, -1 / 3]));
            expect(side!.gaussianCurvature).toBeCloseTo(1 / 9, 9);
        });

        it("should read a cylinder of radius 2 as bending by 1/2 around it and not at all along it", () => {
            // Arrange
            const wall = cylinderWall();

            // Act
            const [middle] = occt.analysis.surfaces.curvaturesOnUVs({ shape: wall, paramsUV: [[0.5, 0.5]] });

            // Assert
            expect([middle!.maxCurvature, middle!.minCurvature, middle!.meanCurvature, middle!.gaussianCurvature]).toEqual(close([0.5, 0, 0.25, 0]));
            expect(Math.abs(middle!.minDirection[2])).toBeCloseTo(1, 9);
            expect(middle!.maxDirection[2]).toBeCloseTo(0, 9);
            expect(middle!.isUmbilic).toBe(false);
        });

        it("should read the middle of the face by default, one pair after another otherwise", () => {
            // Arrange
            const face = ball();

            // Act
            const byDefault = occt.analysis.surfaces.curvaturesOnUVs({ shape: face });
            const two = occt.analysis.surfaces.curvaturesOnUVs({ shape: face, paramsUV: [[0, 0.5], [0.5, 0.5]] });

            // Assert
            expect(byDefault).toHaveLength(1);
            expect(byDefault[0]!.point).toEqual(close([-3, 0, 0]));
            expect(two.map(found => found.point)).toEqual([close([3, 0, 0]), close([-3, 0, 0])]);
        });

        it("should refuse (u, v) values that are not pairs of numbers", () => {
            // Arrange
            const face = ball();

            // Act
            const notAList = thrownBy(() => occt.analysis.surfaces.curvaturesOnUVs({ shape: face, paramsUV: loose<[number, number][]>(0.5) }));
            const notAPair = thrownBy(() => occt.analysis.surfaces.curvaturesOnUVs({ shape: face, paramsUV: [[0.5, 0.5], loose<[number, number]>([0.5])] }));

            // Assert
            expect(notAList.message).toBe("`paramsUV` is not a list of U and V pairs.");
            expect(notAPair.message).toBe("`paramsUV` holds something other than a U and V pair at position 1; each is two finite numbers.");
        });
    });

    describe("surfaceType", () => {
        it("should tell the analytic surfaces apart", () => {
            // Arrange
            const cylinder = occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });
            const cone = occt.shapes.solid.createCone({ radius1: 2, radius2: 1, height: 3, angle: 360, center: [0, 0, 0], direction: [0, 0, 1] });
            const torus = occt.shapes.solid.createTorus({ majorRadius: 5, minorRadius: 1, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const cylinderFaces = occt.shapes.face.getFaces({ shape: cylinder }).map(face => occt.analysis.surfaces.surfaceType({ shape: face }));
            const coneFaces = occt.shapes.face.getFaces({ shape: cone }).map(face => occt.analysis.surfaces.surfaceType({ shape: face }));
            const ballFace = occt.analysis.surfaces.surfaceType({ shape: ball() });
            const torusFace = occt.analysis.surfaces.surfaceType({ shape: occt.shapes.face.getFace({ shape: torus, index: 0 }) });

            // Assert
            expect(cylinderFaces.sort()).toEqual(["cylinder", "plane", "plane"]);
            expect(coneFaces.sort()).toEqual(["cone", "plane", "plane"]);
            expect(ballFace).toBe(Inputs.OCCT.surfaceTypeEnum.sphere);
            expect(torusFace).toBe(Inputs.OCCT.surfaceTypeEnum.torus);
        });

        it("should agree with the face selector on every face of a part", () => {
            // Arrange
            const part = occt.booleans.difference({
                shape: occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5], originOnCenter: true }),
                shapes: [occt.shapes.solid.createSphere({ radius: 4, center: [10, 10, 10] })],
                keepEdges: false,
            });

            // Act
            const types = occt.shapes.face.getFaces({ shape: part }).map(face => occt.analysis.surfaces.surfaceType({ shape: face }));

            // Assert
            types.forEach((type, index) => expect(occt.select.faces.ofType({ shape: part, type })).toContain(index));
        });

        it("should read a B-spline face made through points", () => {
            // Arrange
            const face = occt.shapes.face.fromPointGrid({ points: [[[0, 0, 0], [0, 5, 1], [0, 10, 0]], [[5, 0, 1], [5, 5, 2], [5, 10, 1]], [[10, 0, 0], [10, 5, 1], [10, 10, 0]]] });

            // Act
            const type = occt.analysis.surfaces.surfaceType({ shape: face });

            // Assert
            expect(type).toBe(Inputs.OCCT.surfaceTypeEnum.bspline);
        });

        it("should read the surfaces a free-form curve sweeps as surfaces of revolution and of extrusion", () => {
            // Arrange
            const [curve] = occt.shapes.edge.getEdges({ shape: occt.shapes.wire.interpolatePoints({ points: [[1, 0, 0], [2, 1, 0], [1.5, 2, 0], [2, 3, 0]], periodic: false, tolerance: 1e-7 }) });
            const revolved = occt.operations.revolve({ shape: curve!, angle: 180, direction: [0, 1, 0] });
            const extruded = occt.operations.extrude({ shape: curve!, direction: [0, 0, 5] });

            // Act
            const types = [revolved, extruded].map(face => occt.analysis.surfaces.surfaceType({ shape: loose<TopoDS_Face>(face) }));

            // Assert
            expect(types).toEqual([Inputs.OCCT.surfaceTypeEnum.revolution, Inputs.OCCT.surfaceTypeEnum.extrusion]);
        });

        it("should read a surface trimmed to a rectangle as the surface it trims, as the face selector does", () => {
            // Arrange
            const trimmed = trimmedPlaneFace();

            // Act
            const type = occt.analysis.surfaces.surfaceType({ shape: loose<TopoDS_Face>(trimmed) });

            // Assert
            expect(kernel.GetFaceSurfaceType(kernel.CastToFace(trimmed))).toBe("trimmed");
            expect(type).toBe(Inputs.OCCT.surfaceTypeEnum.plane);
            expect(occt.select.faces.ofType({ shape: trimmed, type: Inputs.OCCT.surfaceTypeEnum.plane })).toEqual([0]);
        });

        it("should read a face that carries only a mesh as other", () => {
            // Arrange
            const mesh = meshFaceWithoutSurface();

            // Act
            const type = occt.analysis.surfaces.surfaceType({ shape: loose<TopoDS_Face>(mesh) });

            // Assert
            expect(kernel.GetFaceSurfaceType(kernel.CastToFace(mesh))).toBe("unknown");
            expect(type).toBe(Inputs.OCCT.surfaceTypeEnum.other);
        });

        it("should refuse a shape that is not a face, and a missing one", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0], originOnCenter: true });

            // Act
            const solid = thrownBy(() => occt.analysis.surfaces.surfaceType({ shape: loose<TopoDS_Face>(box) }));
            const missing = thrownBy(() => occt.analysis.surfaces.surfaceType({ shape: loose<TopoDS_Face>(undefined) }));

            // Assert
            expect(solid.message).toBe("`shape` is a solid, not a face.");
            expect(solid.property).toBe("shape");
            expect(missing.property).toBe("shape");
        });
    });
});
