import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, MeshBuffers, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";

describe("MeshingService.shapeToMesh", () => {
    let occt: BitbybitOcctModule;
    let service: OCCTService;
    const restores: (() => void)[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        service = new OCCTService(occt, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        while (restores.length) restores.pop()!();
    });

    function kernelJson(shape: TopoDS_Shape, precision: number, adjustYtoZ: boolean): unknown {
        return JSON.parse(occt.ShapeToMeshJson(shape, precision, adjustYtoZ, false, false, true, false));
    }

    function captureBuffers(change?: (handle: MeshBuffers) => void): MeshBuffers[] {
        const handles: MeshBuffers[] = [];
        const original = occt.ShapeToMeshBuffers.bind(occt);
        vi.spyOn(occt, "ShapeToMeshBuffers").mockImplementation((...args) => {
            const handle = original(...args);
            change?.(handle);
            handles.push(handle);
            return handle;
        });
        return handles;
    }

    function box(): TopoDS_Shape {
        return service.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] });
    }

    function drilledBox(): TopoDS_Shape {
        const box = service.shapes.solid.createBox({ width: 20, length: 20, height: 10, center: [0, 0, 0] });
        const drill = service.shapes.solid.createCylinder({ radius: 4, height: 30, center: [0, -15, 0], direction: [0, 1, 0] });
        return service.booleans.difference({ shape: box, shapes: [drill], keepEdges: false });
    }

    it.each([
        ["a box", () => service.shapes.solid.createBox({ width: 10, length: 6, height: 4, center: [1, 2, 3] }), 0.5, false],
        ["a box drilled through, with reversed faces", drilledBox, 0.05, false],
        ["a sphere", () => service.shapes.solid.createSphere({ radius: 5, center: [1, 2, 3] }), 0.01, false],
        ["a cone turned from Y up to Z up", () => service.shapes.solid.createCone({ radius1: 4, radius2: 1, height: 6, angle: 360, center: [0, 0, 0], direction: [0, 1, 0] }), 0.1, true],
    ] as [string, () => TopoDS_Shape, number, boolean][])("describes %s exactly as the kernel's JSON does", (_name, make, precision, adjustYtoZ) => {
        // Arrange
        const shape = make();

        // Act
        const mesh = service.shapeToMesh({ shape, precision, adjustYtoZ, computeMetadata: false, keepMeshData: false, allowQualityDecrease: true, forceFaceDeflection: false });

        // Assert
        expect(JSON.stringify(mesh)).toBe(JSON.stringify(kernelJson(shape, precision, adjustYtoZ)));
    });

    it("reads the mesh from the kernel's buffers instead of its JSON", () => {
        // Arrange
        const json = vi.spyOn(occt, "ShapeToMeshJson");
        const shape = service.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] });

        // Act
        const mesh = service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: false });

        // Assert
        expect(json).not.toHaveBeenCalled();
        expect(mesh.faceList).toHaveLength(6);
    });

    it("keeps a request for metadata on the kernel's JSON, which carries it", () => {
        // Arrange
        const json = vi.spyOn(occt, "ShapeToMeshJson");
        const shape = service.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] });

        // Act
        const mesh = service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: false, computeMetadata: true });

        // Assert
        expect(json).toHaveBeenCalledTimes(1);
        expect(mesh.faceList[0]!.surfaceType).toBe("Plane");
    });

    it("leaves no triangulation on the shape unless asked to keep it", () => {
        // Arrange
        const shape = service.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] });
        const face = service.shapes.face.getFaces({ shape })[0]!;

        // Act
        service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: false, keepMeshData: false });
        const cleaned = occt.GetFaceTriangulation(face).IsNull();
        service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: false, keepMeshData: true });
        const kept = occt.GetFaceTriangulation(face).IsNull();

        // Assert
        expect(cleaned).toBe(true);
        expect(kept).toBe(false);
    });
    it("falls back to the kernel's JSON when meshing into buffers fails", () => {
        // Arrange
        const buffers = vi.spyOn(occt, "ShapeToMeshBuffers");
        const json = vi.spyOn(occt, "ShapeToMeshJson");
        const expected = kernelJson(box(), 0, false);
        json.mockClear();

        // Act
        const mesh = service.shapeToMesh({ shape: box(), precision: 0, adjustYtoZ: false });

        // Assert
        expect(buffers).toHaveBeenCalledTimes(1);
        expect(json).toHaveBeenCalledTimes(1);
        expect(mesh).toEqual(expected);
        expect(mesh).toEqual({ error: "BRepMesh_IncrementalMesh::initParameters : invalid parameter value" });
    });

    it("meshes through the kernel's JSON when the kernel predates mesh buffers", () => {
        // Arrange
        const original: unknown = Reflect.get(occt, "ShapeToMeshBuffers");
        Reflect.set(occt, "ShapeToMeshBuffers", undefined);
        restores.push(() => Reflect.set(occt, "ShapeToMeshBuffers", original));
        const json = vi.spyOn(occt, "ShapeToMeshJson");
        const shape = drilledBox();

        // Act
        const mesh = service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: false });

        // Assert
        expect(json).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(mesh)).toBe(JSON.stringify(kernelJson(drilledBox(), 0.1, false)));
    });

    it("deletes the kernel's result once its arrays are copied", () => {
        // Arrange
        const handles = captureBuffers();

        // Act
        const mesh = service.shapeToMesh({ shape: box(), precision: 0.1, adjustYtoZ: false });

        // Assert
        expect(mesh.faceList).toHaveLength(6);
        expect(handles.map(handle => handle.isDeleted())).toEqual([true]);
    });

    it("deletes the kernel's result when meshing failed", () => {
        // Arrange
        const handles = captureBuffers();

        // Act
        service.shapeToMesh({ shape: box(), precision: 0, adjustYtoZ: false });

        // Assert
        expect(handles.map(handle => handle.isDeleted())).toEqual([true]);
    });

    it("refuses an array of the wrong kind and still deletes the kernel's result", () => {
        // Arrange
        const handles = captureBuffers(handle => {
            handle.Normals = (): Float32Array => new Float32Array(3);
        });

        // Act
        const mesh = (): unknown => service.shapeToMesh({ shape: box(), precision: 0.1, adjustYtoZ: false });

        // Assert
        expect(mesh).toThrow("the kernel returned mesh data that is not a Float64Array");
        expect(handles.map(handle => handle.isDeleted())).toEqual([true]);
    });

    it("hands each meshing option to the kernel in its own place", () => {
        // Arrange
        const buffers = vi.spyOn(occt, "ShapeToMeshBuffers");
        const shape = box();

        // Act
        service.shapeToMesh({ shape, precision: 0.3, adjustYtoZ: true, keepMeshData: false, allowQualityDecrease: false, forceFaceDeflection: true });
        service.shapeToMesh({ shape, precision: 0.4, adjustYtoZ: false, keepMeshData: true, allowQualityDecrease: true, forceFaceDeflection: false });

        // Assert
        expect(buffers.mock.calls).toEqual([
            [shape, 0.3, true, false, false, true],
            [shape, 0.4, false, true, true, false],
        ]);
    });

    it("passes a coordinate too large for a number through as Infinity", () => {
        // Arrange
        const scale = new occt.gp_Trsf();
        const origin = new occt.gp_Pnt(0, 0, 0);
        scale.SetScale(origin, 10);
        const location = new occt.TopLoc_Location(scale);
        const vertex = service.shapes.vertex.vertexFromXYZ({ x: 1e308, y: 0, z: 0 }).Located(location);

        // Act
        const mesh = service.shapeToMesh({ shape: vertex, precision: 0.1, adjustYtoZ: false });

        // Assert
        expect(mesh.pointsList).toEqual([[Infinity, 0, 0]]);
    });

    it("meshes every shape of a list through the kernel's buffers", () => {
        // Arrange
        const json = vi.spyOn(occt, "ShapeToMeshJson");
        const shapes = [box(), drilledBox()];

        // Act
        const meshes = service.shapesToMeshes({ shapes, precision: 0.1, adjustYtoZ: false });

        // Assert
        expect(json).not.toHaveBeenCalled();
        expect(meshes.map(mesh => mesh.faceList.length)).toEqual([6, 7]);
    });
});
