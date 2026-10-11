import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import type { BitbybitOcctModule, MeshBuffers, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";

type Point3 = Inputs.Base.Point3;

const analysisEnum = Inputs.OCCT.surfaceAnalysisEnum;

describe("MeshingService iso curves and surface analysis", () => {
    let occt: BitbybitOcctModule;
    let service: OCCTService;
    const restores: (() => void)[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        service = new OCCTService(occt, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        while (restores.length) {
            restores.pop()!();
        }
    });

    const cube = (): TopoDS_Shape => service.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });

    const drilledBox = (): TopoDS_Shape => {
        const box = service.shapes.solid.createBox({ width: 20, length: 20, height: 10, center: [0, 0, 0] });
        const drill = service.shapes.solid.createCylinder({ radius: 4, height: 30, center: [0, -15, 0], direction: [0, 1, 0] });
        return service.booleans.difference({ shape: box, shapes: [drill], keepEdges: false });
    };

    const distance = (a: Point3, b: Point3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

    const onDrilledBox = (p: Point3): boolean => {
        const inside = Math.abs(p[0]) <= 10 + 1e-9 && Math.abs(p[1]) <= 5 + 1e-9 && Math.abs(p[2]) <= 10 + 1e-9;
        const gap = Math.min(Math.abs(Math.abs(p[0]) - 10), Math.abs(Math.abs(p[1]) - 5), Math.abs(Math.abs(p[2]) - 10), Math.abs(Math.hypot(p[0], p[2]) - 4));
        return inside && gap < 1e-9;
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

    function withoutKernelFunction(name: string): void {
        const original: unknown = Reflect.get(occt, name);
        Reflect.set(occt, name, undefined);
        restores.push(() => Reflect.set(occt, name, original));
    }

    function captureBuffers(): MeshBuffers[] {
        const handles: MeshBuffers[] = [];
        const original = occt.ShapeToMeshBuffers.bind(occt);
        vi.spyOn(occt, "ShapeToMeshBuffers").mockImplementation((...args) => {
            const handle = original(...args);
            handles.push(handle);
            return handle;
        });
        return handles;
    }

    function analysisGiving(values: (nodes: number) => number[]) {
        const deletedWhenRead: boolean[] = [];
        const analysis = vi.spyOn(occt, "SurfaceAnalysisAtMeshNodes").mockImplementation((_shape, _quantity, _pull, buffers) => {
            deletedWhenRead.push(buffers.isDeleted());
            return Float64Array.from(values((buffers.Positions() as Float64Array).length / 3));
        });
        return { analysis, deletedWhenRead };
    }

    function faceNormals(mesh: Inputs.OCCT.DecomposedMeshDto): Point3[][] {
        return mesh.faceList.map(face => face.vertexCoordVec.map((_, node) => [face.normalCoord[3 * node]!, face.normalCoord[3 * node + 1]!, face.normalCoord[3 * node + 2]!] as Point3));
    }

    describe("iso curves", () => {
        it.each([
            [2, 3, 30, [-0.5, -1 / 3, 0, 1 / 3, 0.5]],
            [1, 0, 6, [0]],
            [0, 4, 24, [-0.6, -0.2, 0.2, 0.6]],
        ])("gives each face of a cube %i u and %i v iso curves, straight across it at even levels", (isoCurvesU, isoCurvesV, count, levels) => {
            // Arrange
            const shape = cube();

            // Act
            const mesh = service.shapeToMesh({ shape, precision: 0.1, isoCurvesU, isoCurvesV });

            // Assert
            const polylines = mesh.isoCurveList!;
            const interiorLevels = polylines.map(([start, end]) => {
                const fixed = [0, 1, 2].filter(axis => Math.abs(start![axis]! - end![axis]!) < 1e-12);
                return fixed.map(axis => start![axis]!).find(value => Math.abs(value) < 1 - 1e-9);
            });
            expect(polylines).toHaveLength(count);
            expect(polylines.every(polyline => polyline.length === 2)).toBe(true);
            expect(polylines.every(([start, end]) => [0, 1, 2].filter(axis => Math.abs(start![axis]! - end![axis]!) < 1e-12).length === 2)).toBe(true);
            expect(polylines.flat().every(point => Math.abs(Math.max(...point.map(Math.abs)) - 1) < 1e-12)).toBe(true);
            expect(interiorLevels.map(level => level!).sort((a, b) => a - b)).toEqual(levels.flatMap(level => Array<number>(6).fill(level)).map(level => expect.closeTo(level, 12)));
        });

        it("trims the iso curves to the faces, so a curve across a hole comes in two pieces", () => {
            // Arrange
            const shape = drilledBox();

            // Act
            const mesh = service.shapeToMesh({ shape, precision: 0.05, isoCurvesU: 1, isoCurvesV: 1 });

            // Assert
            const polylines = mesh.isoCurveList!;
            const onHole = (point: Point3): boolean => Math.abs(Math.hypot(point[0], point[2]) - 4) < 1e-9;
            const onOuterSide = (point: Point3): boolean => Math.abs(Math.abs(point[0]) - 10) < 1e-9 || Math.abs(Math.abs(point[2]) - 10) < 1e-9;
            const onTopOrBottom = polylines.filter(polyline => Math.abs(Math.abs(polyline[0]![1]) - 5) < 1e-9 && polyline.every(point => Math.abs(point[1] - polyline[0]![1]) < 1e-9));
            expect(polylines).toHaveLength(4 * 2 + 2 * 4 + 2);
            expect(polylines.flat().every(onDrilledBox)).toBe(true);
            expect(onTopOrBottom).toHaveLength(8);
            expect(onTopOrBottom.every(([start, end]) => (onHole(start!) && onOuterSide(end!)) || (onOuterSide(start!) && onHole(end!)))).toBe(true);
            expect(onTopOrBottom.flat().every(point => Math.hypot(point[0], point[2]) > 4 - 1e-9)).toBe(true);
        });

        it("puts every iso point of a ball on the ball, three meridians and two parallels", () => {
            // Arrange
            const center: Point3 = [1, 2, 3];
            const shape = service.shapes.solid.createSphere({ radius: 5, center });

            // Act
            const mesh = service.shapeToMesh({ shape, precision: 0.01, isoCurvesU: 3, isoCurvesV: 2 });

            // Assert
            const polylines = mesh.isoCurveList!;
            expect(polylines).toHaveLength(5);
            expect(polylines.every(polyline => polyline.length > 10)).toBe(true);
            expect(polylines.flat().every(point => Math.abs(distance(point, center) - 5) < 1e-9)).toBe(true);
        });

        it("swaps Y and Z of every iso point when the mesh is turned to Z up", () => {
            // Arrange
            const shape = service.shapes.solid.createCone({ radius1: 4, radius2: 1, height: 6, angle: 360, center: [1, 2, 3], direction: [0, 1, 0] });

            // Act
            const upright = service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: false, isoCurvesU: 2, isoCurvesV: 2 });
            const turned = service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: true, isoCurvesU: 2, isoCurvesV: 2 });

            // Assert
            expect(upright.isoCurveList!.length).toBeGreaterThan(0);
            expect(turned.isoCurveList).toEqual(upright.isoCurveList!.map(polyline => polyline.map(([x, y, z]) => [x, z, y])));
        });

        it("gives every shape of a list its own iso curves", () => {
            // Arrange
            const shapes = [cube(), drilledBox()];

            // Act
            const meshes = service.shapesToMeshes({ shapes, precision: 0.1, isoCurvesU: 1, isoCurvesV: 1 });

            // Assert
            expect(meshes.map(mesh => mesh.isoCurveList!.length)).toEqual([12, 18]);
        });

        it("leaves the iso curves out unless they are asked for", () => {
            // Arrange
            const polylines = vi.spyOn(occt, "IsoCurvePolylines");

            // Act
            const mesh = service.shapeToMesh({ shape: cube(), precision: 0.1 });

            // Assert
            expect(polylines).not.toHaveBeenCalled();
            expect("isoCurveList" in mesh).toBe(false);
        });

        it("hands the kernel both counts and the meshing precision", () => {
            // Arrange
            const polylines = vi.spyOn(occt, "IsoCurvePolylines");
            const shape = cube();

            // Act
            service.shapeToMesh({ shape, precision: 0.2, isoCurvesU: 3, isoCurvesV: 0 });

            // Assert
            expect(polylines).toHaveBeenCalledTimes(1);
            expect(polylines.mock.calls[0]![0]).toBe(shape);
            expect(polylines.mock.calls[0]!.slice(1)).toEqual([3, 0, 0.2]);
        });

        it("leaves the iso curves out on a kernel built without them", () => {
            // Arrange
            withoutKernelFunction("IsoCurvePolylines");

            // Act
            const mesh = service.shapeToMesh({ shape: cube(), precision: 0.1, isoCurvesU: 2, isoCurvesV: 2 });

            // Assert
            expect("isoCurveList" in mesh).toBe(false);
            expect(mesh.faceList).toHaveLength(6);
        });

        it("leaves the iso curves and the analysis out when the kernel meshes through JSON only", () => {
            // Arrange
            withoutKernelFunction("DocumentToMeshBuffers");
            const polylines = vi.spyOn(occt, "IsoCurvePolylines");
            const analysis = vi.spyOn(occt, "SurfaceAnalysisAtMeshNodes");
            const shape = cube();

            // Act
            const mesh = service.shapeToMesh({ shape, precision: 0.1, isoCurvesU: 2, isoCurvesV: 2, surfaceAnalysis: analysisEnum.gaussian });

            // Assert
            expect(polylines).not.toHaveBeenCalled();
            expect(analysis).not.toHaveBeenCalled();
            expect(JSON.stringify(mesh)).toBe(JSON.stringify(JSON.parse(occt.ShapeToMeshJson(shape, 0.1, false, false, false, true, false))));
        });

        it("gives no iso curves for a mesh that failed, which reports its failure as before", () => {
            // Arrange
            const polylines = vi.spyOn(occt, "IsoCurvePolylines");

            // Act
            const mesh = service.shapeToMesh({ shape: cube(), precision: 0, isoCurvesU: 2, isoCurvesV: 2 });

            // Assert
            expect(polylines).not.toHaveBeenCalled();
            expect(mesh).toEqual({ error: "ShapeToMeshJson: the precision must be a finite number of at least 1e-7" });
        });
    });

    describe("surface analysis, read by the kernel", () => {
        it.each([
            [analysisEnum.gaussian, 1 / 25],
            [analysisEnum.mean, 1 / 5],
            [analysisEnum.maxCurvature, 1 / 5],
            [analysisEnum.minCurvature, 1 / 5],
            [analysisEnum.minRadius, 5],
        ])("gives every vertex of a ball of radius 5 the same %s, poles included", (surfaceAnalysis, expected) => {
            // Arrange
            const shape = service.shapes.solid.createSphere({ radius: 5, center: [1, 2, 3] });

            // Act
            const mesh = service.shapeToMesh({ shape, precision: 0.05, surfaceAnalysis });

            // Assert
            const values = mesh.faceList.flatMap(face => face.analysisValues!);
            expect(values).toHaveLength(mesh.faceList.reduce((sum, face) => sum + face.vertexCoord.length / 3, 0));
            expect(values.every(value => Math.abs(value - expected) < 1e-9)).toBe(true);
        });

        it("gives a cylinder's wall its radius and its flat ends an infinite one", () => {
            // Arrange
            const shape = service.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const mesh = service.shapeToMesh({ shape, precision: 0.05, computeMetadata: true, surfaceAnalysis: analysisEnum.minRadius });

            // Assert
            const wall = mesh.faceList.filter(face => face.surfaceType === "Cylinder").flatMap(face => face.analysisValues!);
            const ends = mesh.faceList.filter(face => face.surfaceType === "Plane").flatMap(face => face.analysisValues!);
            expect(wall.length).toBeGreaterThan(0);
            expect(ends.length).toBeGreaterThan(0);
            expect(wall.every(value => Math.abs(value - 2) < 1e-9)).toBe(true);
            expect(ends.every(value => value === Infinity)).toBe(true);
        });

        it.each([
            [[0, 1, 0] as Point3, [-90, 0, 90]],
            [[1, 1, 0] as Point3, [-45, 0, 45]],
        ])("gives each vertex of a box its draft angle in degrees against the pull %j", (draftDirection, angles) => {
            // Arrange
            const shape = service.shapes.solid.createBox({ width: 3, length: 4, height: 5, center: [0, 0, 0] });
            const pull = draftDirection.map(value => value / Math.hypot(...draftDirection));

            // Act
            const mesh = service.shapeToMesh({ shape, precision: 0.1, surfaceAnalysis: analysisEnum.draftAngle, draftDirection });

            // Assert
            const rounded = (value: number): number => Math.round(value * 1e9) / 1e9 + 0;
            const expected = faceNormals(mesh).map(normals => normals.map(normal => rounded(Math.asin(normal[0] * pull[0]! + normal[1] * pull[1]! + normal[2] * pull[2]!) * 180 / Math.PI)));
            const values = mesh.faceList.map(face => face.analysisValues!.map(rounded));
            expect(values).toEqual(expected);
            expect([...new Set(values.flat())].sort((a, b) => a - b)).toEqual(angles);
        });

        it("measures draft angles in the model's own frame when the mesh is turned to Z up", () => {
            // Arrange
            const shape = service.shapes.solid.createBox({ width: 3, length: 4, height: 5, center: [0, 0, 0] });

            // Act
            const mesh = service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: true, surfaceAnalysis: analysisEnum.draftAngle, draftDirection: [0, 1, 0] });

            // Assert
            const expected = faceNormals(mesh).map(normals => normals.map(([, , z]) => Math.round(Math.asin(z) * 180 / Math.PI) + 0));
            expect(mesh.faceList.map(face => face.analysisValues!.map(value => Math.round(value) + 0))).toEqual(expected);
        });
    });

    describe("surface analysis, carried through the mesh", () => {
        it("reads the analysis from the buffers before freeing them, and splits it per face in vertex order", () => {
            // Arrange
            const handles = captureBuffers();
            const { analysis, deletedWhenRead } = analysisGiving(nodes => Array.from({ length: nodes }, (_, node) => node));
            const shape = cube();

            // Act
            const mesh = service.shapeToMesh({ shape, precision: 0.1, surfaceAnalysis: analysisEnum.gaussian });

            // Assert
            let node = 0;
            const expected = mesh.faceList.map(face => Array.from({ length: face.vertexCoord.length / 3 }, () => node++));
            expect(analysis).toHaveBeenCalledTimes(1);
            expect(analysis.mock.calls[0]![0]).toBe(shape);
            expect(analysis.mock.calls[0]![3]).toBe(handles[0]);
            expect(deletedWhenRead).toEqual([false]);
            expect(handles.map(handle => handle.isDeleted())).toEqual([true]);
            expect(mesh.faceList.map(face => face.analysisValues)).toEqual(expected);
            expect(Object.keys(mesh.faceList[0]!).reverse()[0]).toBe("analysisValues");
        });

        it.each([
            [analysisEnum.gaussian, "Gaussian"],
            [analysisEnum.mean, "Mean"],
            [analysisEnum.maxCurvature, "MaxCurvature"],
            [analysisEnum.minCurvature, "MinCurvature"],
            [analysisEnum.minRadius, "MinRadius"],
            [analysisEnum.draftAngle, "DraftAngle"],
        ] as const)("asks the kernel for %s as its %s quantity", (surfaceAnalysis, quantity) => {
            // Arrange
            const { analysis } = analysisGiving(nodes => Array<number>(nodes).fill(0));

            // Act
            service.shapeToMesh({ shape: cube(), precision: 0.1, surfaceAnalysis });

            // Assert
            expect(analysis.mock.calls[0]![1]).toBe(occt.BitbybitAnalysis_SurfaceQuantity[quantity]);
        });

        it("hands the kernel the pull direction as given for draft angles", () => {
            // Arrange
            const { analysis } = analysisGiving(nodes => Array<number>(nodes).fill(0));

            // Act
            service.shapeToMesh({ shape: cube(), precision: 0.1, surfaceAnalysis: analysisEnum.draftAngle, draftDirection: [0, 0, 2] });

            // Assert
            expect(analysis.mock.calls[0]![2]).toEqual([0, 0, 2]);
        });

        it("hands the kernel a pull of its own for the analyses that read none, whatever the direction given", () => {
            // Arrange
            const { analysis } = analysisGiving(nodes => Array<number>(nodes).fill(0));

            // Act
            service.shapeToMesh({ shape: cube(), precision: 0.1, surfaceAnalysis: analysisEnum.mean, draftDirection: [0, 0, 0] });

            // Assert
            expect(analysis.mock.calls[0]![2]).toEqual([0, 1, 0]);
        });

        it("turns the kernel's draft angles from radians into degrees and keeps NaN where there is none", () => {
            // Arrange
            const radians = [Math.PI / 2, -Math.PI / 6, NaN, 0];
            analysisGiving(nodes => Array.from({ length: nodes }, (_, node) => radians[node % 4]!));

            // Act
            const mesh = service.shapeToMesh({ shape: cube(), precision: 0.1, surfaceAnalysis: analysisEnum.draftAngle });

            // Assert
            const values = mesh.faceList.flatMap(face => face.analysisValues!);
            expect(values.slice(0, 8).map(value => Number.isNaN(value) ? "NaN" : Math.round(value * 1e9) / 1e9)).toEqual([90, -30, "NaN", 0, 90, -30, "NaN", 0]);
        });

        it("keeps the kernel's curvatures as they come, infinite radii included", () => {
            // Arrange
            analysisGiving(nodes => Array.from({ length: nodes }, (_, node) => node % 2 === 0 ? Infinity : 0.25));

            // Act
            const mesh = service.shapeToMesh({ shape: cube(), precision: 0.1, surfaceAnalysis: analysisEnum.minRadius });

            // Assert
            expect(mesh.faceList.flatMap(face => face.analysisValues!).slice(0, 4)).toEqual([Infinity, 0.25, Infinity, 0.25]);
        });

        it("leaves the analysis out for none, without asking the kernel", () => {
            // Arrange
            const analysis = vi.spyOn(occt, "SurfaceAnalysisAtMeshNodes");

            // Act
            const mesh = service.shapeToMesh({ shape: cube(), precision: 0.1, surfaceAnalysis: analysisEnum.none, draftDirection: [0, 0, 0] });

            // Assert
            expect(analysis).not.toHaveBeenCalled();
            expect(mesh.faceList.some(face => "analysisValues" in face)).toBe(false);
        });

        it("frees the buffers when the analysis fails, and lets the failure through", () => {
            // Arrange
            const handles = captureBuffers();
            vi.spyOn(occt, "SurfaceAnalysisAtMeshNodes").mockImplementation(() => {
                throw new Error("SurfaceAnalysisAtMeshNodes: the mesh buffers hold no mesh");
            });

            // Act
            const mesh = (): unknown => service.shapeToMesh({ shape: cube(), precision: 0.1, surfaceAnalysis: analysisEnum.gaussian });

            // Assert
            expect(mesh).toThrow("SurfaceAnalysisAtMeshNodes: the mesh buffers hold no mesh");
            expect(handles.map(handle => handle.isDeleted())).toEqual([true]);
        });

        it("leaves the analysis out on a kernel built without it", () => {
            // Arrange
            withoutKernelFunction("SurfaceAnalysisAtMeshNodes");

            // Act
            const mesh = service.shapeToMesh({ shape: cube(), precision: 0.1, surfaceAnalysis: analysisEnum.gaussian });

            // Assert
            expect(mesh.faceList).toHaveLength(6);
            expect(mesh.faceList.some(face => "analysisValues" in face)).toBe(false);
        });

        it("gives every shape of a list its own analysis", () => {
            // Arrange
            analysisGiving(nodes => Array<number>(nodes).fill(7));

            // Act
            const meshes = service.shapesToMeshes({ shapes: [cube(), cube()], precision: 0.1, surfaceAnalysis: analysisEnum.mean });

            // Assert
            expect(meshes.map(mesh => mesh.faceList.every(face => face.analysisValues!.every(value => value === 7)))).toEqual([true, true]);
        });
    });

    describe("refusals", () => {
        it.each([
            [{ isoCurvesU: -1 }, "isoCurvesU", "`isoCurvesU` must be a whole number from 0 to 1000; it is -1."],
            [{ isoCurvesV: 2.5 }, "isoCurvesV", "`isoCurvesV` must be a whole number from 0 to 1000; it is 2.5."],
            [{ isoCurvesU: 1001 }, "isoCurvesU", "`isoCurvesU` must be a whole number from 0 to 1000; it is 1001."],
            [{ isoCurvesV: NaN }, "isoCurvesV", "`isoCurvesV` must be a whole number from 0 to 1000; it is NaN."],
            [{ surfaceAnalysis: loose<Inputs.OCCT.surfaceAnalysisEnum>("zebra") }, "surfaceAnalysis", "`surfaceAnalysis` is zebra, which is none of none, gaussian, mean, maxCurvature, minCurvature, minRadius, draftAngle."],
            [{ surfaceAnalysis: analysisEnum.draftAngle, draftDirection: [0, 0, 0] as Point3 }, "draftDirection", "`draftDirection` is [0, 0, 0], which points nowhere."],
            [{ surfaceAnalysis: analysisEnum.draftAngle, draftDirection: loose<Point3>([0, 1]) }, "draftDirection", "`draftDirection` is not a direction: it needs three finite numbers."],
        ] as [Partial<Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape>>, string, string][])("refuses %j before meshing", (options, property, message) => {
            // Arrange
            const meshing = vi.spyOn(occt, "ShapeToMeshBuffers");

            // Act
            const error = thrownBy(() => service.shapeToMesh({ shape: cube(), precision: 0.1, ...options }));

            // Assert
            expect(error.property).toBe(property);
            expect(error.message).toBe(message);
            expect(meshing).not.toHaveBeenCalled();
        });

        it("refuses a count on any shape of a list", () => {
            // Arrange
            const shapes = [cube(), cube()];

            // Act
            const error = thrownBy(() => service.shapesToMeshes({ shapes, precision: 0.1, isoCurvesU: -2 }));

            // Assert
            expect(error.message).toBe("`isoCurvesU` must be a whole number from 0 to 1000; it is -2.");
        });
    });
});
