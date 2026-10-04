import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, Handle_TDocStd_Document, MeshBuffers, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
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

    function kernelJson(shape: TopoDS_Shape, precision: number, adjustYtoZ: boolean, computeMetadata = false): unknown {
        return JSON.parse(occt.ShapeToMeshJson(shape, precision, adjustYtoZ, computeMetadata, false, true, false));
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

    it.each([
        ["a box", () => service.shapes.solid.createBox({ width: 10, length: 6, height: 4, center: [1, 2, 3] }), false],
        ["a box drilled through, with reversed faces", drilledBox, false],
        ["a sphere with its degenerate poles", () => service.shapes.solid.createSphere({ radius: 5, center: [1, 2, 3] }), false],
        ["a cone turned from Y up to Z up", () => service.shapes.solid.createCone({ radius1: 4, radius2: 1, height: 6, angle: 360, center: [0, 0, 0], direction: [0, 1, 0] }), true],
    ] as [string, () => TopoDS_Shape, boolean][])("describes %s with its metadata exactly as the kernel's JSON does", (_name, make, adjustYtoZ) => {
        // Arrange
        const shape = make();

        // Act
        const mesh = service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ, computeMetadata: true, keepMeshData: false, allowQualityDecrease: true, forceFaceDeflection: false });

        // Assert
        expect(JSON.stringify(mesh)).toBe(JSON.stringify(kernelJson(shape, 0.1, adjustYtoZ, true)));
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

    it("reads the metadata from the kernel's buffers too", () => {
        // Arrange
        const json = vi.spyOn(occt, "ShapeToMeshJson");
        const shape = service.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] });

        // Act
        const mesh = service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: false, computeMetadata: true });

        // Assert
        expect(json).not.toHaveBeenCalled();
        expect(mesh.faceList[0]!.surfaceType).toBe("Plane");
        expect(mesh.faceList[0]!.adjacentFaces).toHaveLength(4);
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
        expect(mesh).toEqual({ error: "ShapeToMeshJson: the precision must be a finite number of at least 1e-7" });
    });

    function triangles(mesh: Inputs.OCCT.DecomposedMeshDto): number {
        return mesh.faceList.reduce((count, face) => count + face.triIndexes.length / 3, 0);
    }

    it("meshes a curved face finer at a smaller angular deflection, and at 0.5 radians by default", () => {
        // Arrange
        const cylinder = service.shapes.solid.createCylinder({ radius: 10, height: 10, center: [0, 0, 0], direction: [0, 1, 0] });

        // Act
        const plain = service.shapeToMesh({ shape: cylinder, precision: 5 });
        const half = service.shapeToMesh({ shape: cylinder, precision: 5, angularDeflection: 0.5 });
        const tenth = service.shapeToMesh({ shape: cylinder, precision: 5, angularDeflection: 0.1 });

        // Assert
        expect(triangles(half)).toBe(triangles(plain));
        expect(triangles(tenth)).toBeGreaterThan(3 * triangles(half));
    });

    it("meshes a small and a large sphere alike with a relative deflection", () => {
        // Arrange
        const small = service.shapes.solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const large = service.shapes.solid.createSphere({ radius: 20, center: [0, 0, 0] });

        // Act
        const smallRelative = service.shapeToMesh({ shape: small, precision: 0.01, relativeDeflection: true });
        const largeRelative = service.shapeToMesh({ shape: large, precision: 0.01, relativeDeflection: true });
        const smallAbsolute = service.shapeToMesh({ shape: small, precision: 0.01 });
        const largeAbsolute = service.shapeToMesh({ shape: large, precision: 0.01 });

        // Assert
        expect(triangles(largeRelative)).toBe(triangles(smallRelative));
        expect(triangles(largeAbsolute)).toBeGreaterThan(10 * triangles(smallAbsolute));
    });

    it.each([0, 0.0005, 4, Number.NaN])("refuses an angular deflection of %s before meshing", (angularDeflection) => {
        // Arrange
        const buffers = vi.spyOn(occt, "ShapeToMeshBuffers");

        // Act
        const act = (): Inputs.OCCT.DecomposedMeshDto => service.shapeToMesh({ shape: box(), precision: 0.1, angularDeflection });

        // Assert
        expect(act).toThrow(`\`angularDeflection\` must be a finite number from 0.001 to ${Math.PI}; it is ${String(angularDeflection)}.`);
        expect(buffers).not.toHaveBeenCalled();
    });

    it("passes the angle and the relative deflection on for each of several shapes", () => {
        // Arrange
        const buffers = vi.spyOn(occt, "ShapeToMeshBuffers");

        // Act
        service.shapesToMeshes({ shapes: [box(), box()], precision: 0.1, angularDeflection: 0.2, relativeDeflection: true });

        // Assert
        expect(buffers.mock.calls.map(call => call.slice(7))).toEqual([[0.2, true], [0.2, true]]);
    });

    it("asks a kernel whose buffer call predates the angle for seven arguments only", () => {
        // Arrange
        const original = occt.ShapeToMeshBuffers.bind(occt);
        const received: number[] = [];
        const older = Object.defineProperty((...args: unknown[]): MeshBuffers => {
            received.push(args.length);
            return (original as (...all: unknown[]) => MeshBuffers)(...args, 0.5, false);
        }, "length", { value: 7 });
        const kept: unknown = Reflect.get(occt, "ShapeToMeshBuffers");
        Reflect.set(occt, "ShapeToMeshBuffers", older);
        restores.push(() => Reflect.set(occt, "ShapeToMeshBuffers", kept));

        // Act
        const mesh = service.shapeToMesh({ shape: box(), precision: 0.1, angularDeflection: 0.2 });

        // Assert
        expect(received).toEqual([7]);
        expect(mesh.faceList).toHaveLength(6);
    });

    it("meshes through the kernel's JSON when the kernel predates document and metadata buffers", () => {
        // Arrange
        const original: unknown = Reflect.get(occt, "DocumentToMeshBuffers");
        Reflect.set(occt, "DocumentToMeshBuffers", undefined);
        restores.push(() => Reflect.set(occt, "DocumentToMeshBuffers", original));
        const buffers = vi.spyOn(occt, "ShapeToMeshBuffers");
        const json = vi.spyOn(occt, "ShapeToMeshJson");
        const shape = drilledBox();

        // Act
        const mesh = service.shapeToMesh({ shape, precision: 0.1, adjustYtoZ: false });

        // Assert
        expect(json).toHaveBeenCalledTimes(1);
        expect(buffers).not.toHaveBeenCalled();
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
        service.shapeToMesh({ shape, precision: 0.3, adjustYtoZ: true, computeMetadata: false, keepMeshData: false, allowQualityDecrease: false, forceFaceDeflection: true, angularDeflection: 0.25, relativeDeflection: true });
        service.shapeToMesh({ shape, precision: 0.4, adjustYtoZ: false, computeMetadata: true, keepMeshData: true, allowQualityDecrease: true, forceFaceDeflection: false });

        // Assert
        expect(buffers.mock.calls).toEqual([
            [shape, 0.3, true, false, false, false, true, 0.25, true],
            [shape, 0.4, false, true, true, true, false, 0.5, false],
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

describe("MeshingService documents", () => {
    let occt: BitbybitOcctModule;
    let service: OCCTService;
    const documents: Handle_TDocStd_Document[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        service = new OCCTService(occt, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        while (documents.length) documents.pop()!.delete();
    });

    function twoPartDocument(): Handle_TDocStd_Document {
        const manager = service.assembly.manager;
        const box = service.shapes.solid.createBox({ width: 2, length: 3, height: 4, center: [0, 0, 0] });
        const ball = service.shapes.solid.createSphere({ radius: 1.5, center: [0, 0, 0] });
        const parts = [
            manager.createPart({ id: "box", shape: box, name: "Box", colorRgba: { r: 1, g: 0, b: 0, a: 1 } }),
            manager.createPart({ id: "ball", shape: ball, name: "Ball" }),
        ];
        const nodes = [
            manager.createInstanceNode({ id: "box-1", partId: "box", name: "Box 1", translation: [5, 0, 0] }),
            manager.createInstanceNode({ id: "ball-1", partId: "ball", name: "Ball 1", translation: [0, 5, 0] }),
        ];
        const document = manager.buildAssemblyDocument({ structure: manager.combineStructure({ parts, nodes, clearDocument: false }) });
        documents.push(document);
        return document;
    }

    function captureDocumentBuffers(change?: (handle: MeshBuffers) => void): MeshBuffers[] {
        const handles: MeshBuffers[] = [];
        const original = occt.DocumentToMeshBuffers.bind(occt);
        vi.spyOn(occt, "DocumentToMeshBuffers").mockImplementation((...args) => {
            const handle = original(...args);
            change?.(handle);
            handles.push(handle);
            return handle;
        });
        return handles;
    }

    it.each([
        [false, false],
        [true, false],
        [true, true],
    ])("meshes a document as one mesh exactly as the kernel's JSON does (metadata %s, Z up %s)", (computeMetadata, adjustYtoZ) => {
        // Arrange
        const document = twoPartDocument();

        // Act
        const mesh = service.docToMesh({ document, precision: 0.1, adjustYtoZ, computeMetadata });

        // Assert
        expect(JSON.stringify(mesh)).toBe(JSON.stringify(JSON.parse(occt.DocumentToMeshJson(document.get(), 0.1, adjustYtoZ, computeMetadata, false, true, false))));
    });

    it.each([false, true])("meshes each free shape of a document exactly as the kernel's JSON does (metadata %s)", (computeMetadata) => {
        // Arrange
        const document = twoPartDocument();

        // Act
        const meshes = service.docToMeshes({ document, precision: 0.1, adjustYtoZ: false, computeMetadata });

        // Assert
        expect(JSON.stringify(meshes)).toBe(JSON.stringify(JSON.parse(occt.DocumentToMeshesJson(document.get(), 0.1, false, computeMetadata, false, true, false))));
        expect(meshes).toHaveLength(occt.DocumentFreeShapeCount(document.get()));
    });

    it("colours every face of a part given a colour, in one mesh and in each free shape's own", () => {
        // Arrange
        const document = twoPartDocument();

        // Act
        const mesh = service.docToMesh({ document, precision: 0.1, adjustYtoZ: false });
        const meshes = service.docToMeshes({ document, precision: 0.1, adjustYtoZ: false });

        // Assert
        expect(mesh.colorGroups).toEqual({ "#ff0000ff": [0, 1, 2, 3, 4, 5] });
        expect(meshes.map(each => each.colorGroups)).toEqual([{ "#ff0000ff": [0, 1, 2, 3, 4, 5] }]);
    });

    it("reads a document from the kernel's buffers instead of its JSON, and deletes every result", () => {
        // Arrange
        const document = twoPartDocument();
        const one = vi.spyOn(occt, "DocumentToMeshJson");
        const each = vi.spyOn(occt, "DocumentToMeshesJson");
        const handles = captureDocumentBuffers();

        // Act
        service.docToMesh({ document, precision: 0.1, adjustYtoZ: false });
        service.docToMeshes({ document, precision: 0.1, adjustYtoZ: false });

        // Assert
        expect(one).not.toHaveBeenCalled();
        expect(each).not.toHaveBeenCalled();
        expect(handles.length).toBe(1 + occt.DocumentFreeShapeCount(document.get()));
        expect(handles.every(handle => handle.isDeleted())).toBe(true);
    });

    it("asks the kernel for every free shape by its index, and for all of them as -1", () => {
        // Arrange
        const document = twoPartDocument();
        const buffers = vi.spyOn(occt, "DocumentToMeshBuffers");

        // Act
        service.docToMesh({ document, precision: 0.2, adjustYtoZ: true, computeMetadata: true, keepMeshData: false, allowQualityDecrease: false, forceFaceDeflection: true });
        service.docToMeshes({ document, precision: 0.3, adjustYtoZ: false });

        // Assert
        const count = occt.DocumentFreeShapeCount(document.get());
        expect(buffers.mock.calls.map(call => call.slice(1))).toEqual([
            [-1, 0.2, true, true, false, false, true, 0.5, false],
            ...Array.from({ length: count }, (_, index) => [index, 0.3, false, false, false, true, false, 0.5, false]),
        ]);
    });

    it("meshes a document at the angular deflection and relative deflection given", () => {
        // Arrange
        const document = twoPartDocument();
        const buffers = vi.spyOn(occt, "DocumentToMeshBuffers");

        // Act
        const coarse = service.docToMesh({ document, precision: 1 });
        const fine = service.docToMesh({ document, precision: 1, angularDeflection: 0.1, relativeDeflection: true });

        // Assert
        const count = (mesh: Inputs.OCCT.DecomposedMeshDto): number => mesh.faceList.reduce((sum, face) => sum + face.triIndexes.length / 3, 0);
        expect(count(fine)).toBeGreaterThan(count(coarse));
        expect(buffers.mock.calls.map(call => call.slice(8))).toEqual([[0.5, false], [0.1, true]]);
        expect(() => service.docToMeshes({ document, precision: 1, angularDeflection: 0 })).toThrow("`angularDeflection` must be a finite number from 0.001");
    });

    it("falls back to the kernel's JSON when meshing a document into buffers fails, and still deletes the result", () => {
        // Arrange
        const document = twoPartDocument();
        const handles = captureDocumentBuffers();
        const one = vi.spyOn(occt, "DocumentToMeshJson");
        const each = vi.spyOn(occt, "DocumentToMeshesJson");

        // Act
        const mesh = service.docToMesh({ document, precision: 0, adjustYtoZ: false });
        const meshes = service.docToMeshes({ document, precision: 0, adjustYtoZ: false });

        // Assert
        const reason = ": the precision must be a finite number of at least 1e-7";
        expect(one).toHaveBeenCalledTimes(1);
        expect(each).toHaveBeenCalledTimes(1);
        expect(mesh).toEqual({ error: `DocumentToMeshJson${reason}` });
        expect(meshes).toEqual(Array.from({ length: occt.DocumentFreeShapeCount(document.get()) }, () => ({ error: `DocumentToMeshesJson${reason}` })));
        expect(handles.every(handle => handle.isDeleted())).toBe(true);
    });

    it("meshes a document through the kernel's JSON when the kernel predates document buffers", () => {
        // Arrange
        const document = twoPartDocument();
        const original: unknown = Reflect.get(occt, "DocumentToMeshBuffers");
        Reflect.set(occt, "DocumentToMeshBuffers", undefined);
        const each = vi.spyOn(occt, "DocumentToMeshesJson");

        // Act
        const meshes = service.docToMeshes({ document, precision: 0.1, adjustYtoZ: false });
        Reflect.set(occt, "DocumentToMeshBuffers", original);

        // Assert
        expect(each).toHaveBeenCalledTimes(1);
        expect(meshes).toHaveLength(occt.DocumentFreeShapeCount(document.get()));
    });
});
