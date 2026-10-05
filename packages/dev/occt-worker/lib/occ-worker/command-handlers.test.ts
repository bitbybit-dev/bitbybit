import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import initOpenCascade, { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService, OccHelper, ShapesHelperService, VectorHelperService } from "@bitbybit-dev/occt";
import { CommandContext, getCommandHandler, hasCommandHandler } from "./command-handlers";
import { CacheHelper } from "./cache-helper";
import { ShapeResolver } from "./shape-resolver";
import { ReservedFunctions, CACHE_THRESHOLD, MAX_RETAINED_TRIANGLES } from "./constants";

describe("the reserved command handlers", () => {
    let occt: BitbybitOcctModule;
    let openCascade: OCCTService;
    let cacheHelper: CacheHelper;
    let pending: [string, unknown][];
    let context: CommandContext;

    const run = (functionName: string, inputs: Record<string, unknown>) =>
        getCommandHandler(functionName)!(inputs, context);

    const cacheDocument = (hash: string): void => {
        const box = openCascade.shapes.solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
        const part = openCascade.assembly.manager.createPart({ id: "box", shape: box, name: "Box" });
        const node = openCascade.assembly.manager.createInstanceNode({ id: "inst", partId: "box", name: "Instance" });
        const structure = openCascade.assembly.manager.combineStructure({ parts: [part], nodes: [node], clearDocument: false });
        cacheHelper.addToCache(hash, openCascade.assembly.manager.buildAssemblyDocument({ structure }));
        box.delete();
    };

    const cacheVertex = (hash: string): void => {
        const point = new occt.gp_Pnt(0, 0, 0);
        const vertex = new occt.BRepBuilderAPI_MakeVertex(point);
        cacheHelper.addToCache(hash, vertex.Vertex());
        vertex.delete();
        point.delete();
    };

    beforeAll(async () => {
        occt = await initOpenCascade();
        openCascade = new OCCTService(occt, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt));
    });

    beforeEach(() => {
        cacheHelper = new CacheHelper();
        pending = [];
        openCascade.plugins = { dependencies: {} };
        context = {
            openCascade,
            kernel: occt,
            setMeshRetention: (triangles) => occt.SetMeshRetention(triangles),
            cacheHelper,
            shapeResolver: new ShapeResolver(cacheHelper),
            addPendingDependency: (key, value) => pending.push([key, value]),
        };
    });

    afterEach(() => {
        occt.SetMeshRetention(0);
    });

    const cacheBox = (hash: string): void => {
        cacheHelper.addToCache(hash, openCascade.shapes.solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] }));
    };

    const meshBox = (hash: string): void => {
        run(ReservedFunctions.SHAPE_TO_MESH, { shape: { type: "occ-shape", hash }, precision: 0.1, adjustYtoZ: false });
    };

    describe("hasCommandHandler", () => {
        it("should know the reserved function names", () => {
            expect(hasCommandHandler(ReservedFunctions.SHAPE_TO_MESH)).toBe(true);
        });

        it("should not claim a kernel method as its own", () => {
            expect(hasCommandHandler("shapes.solid.createSphere")).toBe(false);
        });
    });

    describe("getCommandHandler", () => {
        it("should answer with nothing for a name it does not handle", () => {
            expect(getCommandHandler("shapes.solid.createSphere")).toBeUndefined();
        });
    });

    describe("shapeToMesh", () => {
        it("should mesh the shape the cache holds", () => {
            // Arrange
            cacheVertex("shape-1");

            // Act
            const result = run(ReservedFunctions.SHAPE_TO_MESH, { shape: { type: "occ-shape", hash: "shape-1" }, precision: 0.01, adjustYtoZ: false });

            // Assert
            expect(result.handled).toBe(true);
            expect(result.result).toMatchObject({ pointsList: [[0, 0, 0]] });
        });

        it("should say which shape is missing when the cache no longer holds it", () => {
            expect(() => run(ReservedFunctions.SHAPE_TO_MESH, { shape: { type: "occ-shape", hash: "gone" } }))
                .toThrow("Shape with hash gone not found in cache");
        });
    });

    describe("shapesToMeshes", () => {
        it("should mesh every shape the cache holds", () => {
            // Arrange
            cacheVertex("shape-1");
            cacheVertex("shape-2");

            // Act
            const result = run(ReservedFunctions.SHAPES_TO_MESHES, {
                shapes: [{ type: "occ-shape", hash: "shape-1" }, { type: "occ-shape", hash: "shape-2" }],
                precision: 0.01,
                adjustYtoZ: false,
            });

            // Assert
            expect(result.result).toHaveLength(2);
        });

        it("should refuse a call naming no shapes", () => {
            expect(() => run(ReservedFunctions.SHAPES_TO_MESHES, { shapes: [] })).toThrow("No shapes detected");
        });

        it("should refuse a call whose shapes are not a list", () => {
            expect(() => run(ReservedFunctions.SHAPES_TO_MESHES, { shapes: "one shape" })).toThrow("No shapes detected");
        });

        it("should refuse a call with no shapes member at all", () => {
            expect(() => run(ReservedFunctions.SHAPES_TO_MESHES, {})).toThrow("No shapes detected");
        });
    });

    describe("docToMesh", () => {
        it("should mesh the document the cache holds", () => {
            // Arrange
            cacheDocument("doc-1");

            // Act
            const result = run(ReservedFunctions.DOC_TO_MESH, { document: { type: "occ-entity", hash: "doc-1" }, precision: 0.01, adjustYtoZ: false });

            // Assert
            expect(result.handled).toBe(true);
            expect(result.result).toHaveProperty("faceList");
        });

        it("should say which document is missing when the cache no longer holds it", () => {
            expect(() => run(ReservedFunctions.DOC_TO_MESH, { document: { type: "occ-entity", hash: "gone" } }))
                .toThrow("Entity with hash gone not found in cache");
        });
    });

    describe("docToMeshes", () => {
        it("should mesh every free shape of the document the cache holds", () => {
            // Arrange
            cacheDocument("doc-1");

            // Act
            const result = run(ReservedFunctions.DOC_TO_MESHES, { document: { type: "occ-entity", hash: "doc-1" }, precision: 0.01, adjustYtoZ: false });

            // Assert
            expect(result.result).toHaveLength(1);
        });
    });

    describe("deleteShape", () => {
        it("should forget the shape it was given", () => {
            // Arrange
            cacheHelper.addToCache("shape-1", { hash: "shape-1" });

            // Act
            const result = run(ReservedFunctions.DELETE_SHAPE, { shape: { hash: "shape-1" } });

            // Assert
            expect(cacheHelper.checkCache("shape-1")).toBeNull();
            expect(result).toEqual({ handled: true, result: {} });
        });
    });

    describe("deleteShapes", () => {
        it("should forget every shape it was given", () => {
            // Arrange
            cacheHelper.addToCache("shape-1", { hash: "shape-1" });
            cacheHelper.addToCache("shape-2", { hash: "shape-2" });

            // Act
            const result = run(ReservedFunctions.DELETE_SHAPES, { shapes: [{ hash: "shape-1" }, { hash: "shape-2" }] });

            // Assert
            expect(cacheHelper.checkCache("shape-1")).toBeNull();
            expect(cacheHelper.checkCache("shape-2")).toBeNull();
            expect(result).toEqual({ handled: true, result: {} });
        });
    });

    describe("deleteDocument", () => {
        it("should forget the document it was given", () => {
            // Arrange
            cacheHelper.addToCache("doc-1", { hash: "doc-1" });

            // Act
            const result = run(ReservedFunctions.DELETE_DOCUMENT, { document: { hash: "doc-1" } });

            // Assert
            expect(cacheHelper.checkCache("doc-1")).toBeNull();
            expect(result).toEqual({ handled: true, result: {} });
        });
    });

    describe("startedTheRun", () => {
        it("should keep the cache while it is a manageable size", () => {
            // Arrange
            cacheHelper.usedHashes = { one: 1 };

            // Act
            const result = run(ReservedFunctions.STARTED_THE_RUN, {});

            // Assert
            expect(cacheHelper.usedHashes).toEqual({ one: 1 });
            expect(result).toEqual({ handled: true, result: {} });
        });

        it("should drop the whole cache once it has outgrown the run, with the meshes it kept", () => {
            // Arrange
            run(ReservedFunctions.SET_MESH_RETENTION, { triangles: 100 });
            cacheBox("box");
            meshBox("box");
            const keptBefore = occt.KeptMeshFaces();
            cacheHelper.usedHashes = Object.fromEntries(Array.from({ length: CACHE_THRESHOLD + 1 }, (_, index) => [index, index]));

            // Act
            run(ReservedFunctions.STARTED_THE_RUN, {});

            // Assert
            expect(keptBefore).toBe(6);
            expect(cacheHelper.usedHashes).toEqual({});
            expect(occt.KeptMeshFaces()).toBe(0);
            expect(occt.MeshRetentionBudget()).toBe(100);
        });
    });

    describe("setMeshRetention", () => {
        it("should keep the meshes of cached shapes under the budget and say what it keeps", () => {
            // Arrange
            cacheBox("box");

            // Act
            const set = run(ReservedFunctions.SET_MESH_RETENTION, { triangles: 100 });
            meshBox("box");
            const after = run(ReservedFunctions.SET_MESH_RETENTION, { triangles: 100 });

            // Assert
            expect(set).toEqual({ handled: true, result: { budget: 100, faces: 0, triangles: 0 } });
            expect(after).toEqual({ handled: true, result: { budget: 100, faces: 6, triangles: 12 } });
        });

        it("should keep nothing and free what it kept at 0", () => {
            // Arrange
            run(ReservedFunctions.SET_MESH_RETENTION, { triangles: 100 });
            cacheBox("box");
            meshBox("box");

            // Act
            const off = run(ReservedFunctions.SET_MESH_RETENTION, { triangles: 0 });
            meshBox("box");

            // Assert
            expect(off).toEqual({ handled: true, result: { budget: 0, faces: 0, triangles: 0 } });
            expect(occt.KeptMeshFaces()).toBe(0);
        });

        it("should take the largest budget the kernel counts to", () => {
            // Act
            const result = run(ReservedFunctions.SET_MESH_RETENTION, { triangles: MAX_RETAINED_TRIANGLES });

            // Assert
            expect(result).toEqual({ handled: true, result: { budget: 2147483647, faces: 0, triangles: 0 } });
        });

        it("should refuse a budget that is not a whole number of triangles from 0", () => {
            // Act
            const refusals = [-1, 1.5, "10", undefined, 2 ** 31].map(triangles => {
                try {
                    run(ReservedFunctions.SET_MESH_RETENTION, { triangles });
                    return "taken";
                } catch (error) {
                    return error instanceof Error ? error.message : "not an error";
                }
            });

            // Assert
            expect(new Set(refusals)).toEqual(new Set(["setMeshRetention: triangles must be a whole number from 0 to 2147483647."]));
            expect(occt.MeshRetentionBudget()).toBe(0);
        });
    });

    describe("cleanAllCache", () => {
        it("should free the meshes it kept and keep the budget", () => {
            // Arrange
            run(ReservedFunctions.SET_MESH_RETENTION, { triangles: 100 });
            cacheBox("box");
            meshBox("box");

            // Act
            run(ReservedFunctions.CLEAN_ALL_CACHE, {});

            // Assert
            expect(occt.KeptMeshFaces()).toBe(0);
            expect(occt.MeshRetentionBudget()).toBe(100);
        });

        it("should drop the whole cache", () => {
            // Arrange
            cacheHelper.addToCache("shape-1", { hash: "shape-1" });

            // Act
            const result = run(ReservedFunctions.CLEAN_ALL_CACHE, {});

            // Assert
            expect(cacheHelper.argCache).toEqual({});
            expect(result).toEqual({ handled: true, result: {} });
        });
    });

    describe("addOc", () => {
        it("should hand every dependency to the kernel's plugins", () => {
            // Arrange
            const plugins = { dependencies: {} as Record<string, unknown> };
            openCascade.plugins = plugins;

            // Act
            const result = run(ReservedFunctions.ADD_OC, { drawing: "a-plugin" });

            // Assert
            expect(plugins.dependencies).toEqual({ drawing: "a-plugin" });
            expect(result).toEqual({ handled: true, result: undefined });
        });

        it("should hold every dependency back while the kernel takes none", () => {
            // Arrange
            delete (openCascade as Partial<OCCTService>).plugins;

            // Act
            const result = run(ReservedFunctions.ADD_OC, { drawing: "a-plugin" });

            // Assert
            expect(pending).toEqual([["drawing", "a-plugin"]]);
            expect(result).toEqual({ handled: true, result: undefined });
        });
    });

    describe("saveShapeSTEP", () => {
        it("should export the shape the cache holds", () => {
            // Arrange
            cacheVertex("shape-1");

            // Act
            const result = run(ReservedFunctions.SAVE_SHAPE_STEP, { shape: { type: "occ-shape", hash: "shape-1" }, fileName: "part.step", adjustYtoZ: false });

            // Assert
            expect(result.handled).toBe(true);
            expect(result.result).toContain("ISO-10303-21");
        });
    });
});
