import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { InputError, KernelOperationError } from "@bitbybit-dev/base";
import type { Base } from "@bitbybit-dev/base";
import type { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTAssemblyManager } from "../assembly/manager";
import { OCCTAssemblyQuery } from "../assembly/query";
import { OCCTService } from "../../occ-service";
import { OCCTRecipes } from "./recipes";
import * as Inputs from "../../api/inputs";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const MIRROR: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const BOX: Base.RecipeNode[] = [
    { op: "polygon", points: [0, 8], holes: [] },
    { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 3 },
];
const WALL_WITH_OPENINGS: Base.RecipeNode[] = [
    ...BOX,
    { op: "polygon", points: [8, 6], holes: [] },
    { op: "extrude", profile: 2, direction: [0, 0, 1], depth: 3 },
    { op: "polygon", points: [14, 8], holes: [] },
    { op: "extrude", profile: 4, direction: [0, 0, 1], depth: 3 },
    { op: "voids", host: 1, openings: [3, 5] },
];
const WALL_BUFFER = [0, 0, 4, 0, 4, 2, 0, 2, 0, 0, 1, 0, 2, 0, 1, 0.5, 2, 0.5, 2, 1.5, 1, 1.5];

function moved(x: number, y = 0, z = 0): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

function recipeOf(nodes: Base.RecipeNode[], roots: Base.RecipeRoot[], f64: number[] = [0, 0, 4, 0, 4, 2, 0, 2], millimetresPerUnit = 1): Base.Recipe {
    return { format: "bitbybit.recipe", version: 1, millimetresPerUnit, tolerance: 1e-7, buffers: { f64: new Float64Array(f64), i32: new Int32Array() }, nodes, roots };
}

function rootOf(node: number, matrix: Base.TransformMatrix = IDENTITY, tag: Record<string, Base.RecipeTagValue> = {}): Base.RecipeRoot {
    return { node, matrix, tag };
}

describe("OCCTRecipes", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let recipes: OCCTRecipes;
    let manager: OCCTAssemblyManager;
    let query: OCCTAssemblyQuery;
    const shapes: TopoDS_Shape[] = [];
    const documents: Handle_TDocStd_Document[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        manager = new OCCTAssemblyManager(occt, occHelper);
        query = new OCCTAssemblyQuery(occt, occHelper);
        recipes = new OCCTRecipes(occt, occHelper, manager);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        shapes.splice(0).forEach((shape) => shape.delete());
        documents.splice(0).forEach((document) => document.delete());
    });

    function built(recipe: Base.Recipe, options: { adjustZtoY?: boolean, emptyWhenFailed?: boolean, facetedMeshes?: boolean, maxTriangles?: number } = {}): TopoDS_Shape[] {
        const result = recipes.build({ recipe, ...options });
        shapes.push(...result);
        return result;
    }

    function volumeOf(shape: TopoDS_Shape): number {
        return occHelper.solidsService.getSolidVolume({ shape });
    }

    function boxOf(shape: TopoDS_Shape): { min: Base.Point3, max: Base.Point3 } {
        const box = new occt.Bnd_Box();
        occt.BRepBndLib_AddToBox(shape, box);
        const low = occt.GetBndBoxCornerMin(box);
        const high = occt.GetBndBoxCornerMax(box);
        const result = { min: [low.X(), low.Y(), low.Z()] as Base.Point3, max: [high.X(), high.Y(), high.Z()] as Base.Point3 };
        [box, low, high].forEach((value) => value.delete());
        return result;
    }

    function documentOf(recipe: Base.Recipe, options: { name?: string, groupBy?: string, emptyWhenFailed?: boolean, facetedMeshes?: boolean } = {}): Handle_TDocStd_Document {
        const document = recipes.buildDocument({ recipe, ...options });
        documents.push(document);
        return document;
    }

    function stepOf(document: Handle_TDocStd_Document): string {
        return new TextDecoder().decode(manager.exportDocumentToStep({ document, fileName: "recipe.step", author: "Tester", organization: "Tests", compress: false, tryDownload: false }));
    }

    describe("build", () => {
        it("should build each root as a shape placed by its matrix", () => {
            // Act
            const [box, movedBox] = built(recipeOf(BOX, [rootOf(1), rootOf(1, moved(10, 20, 30))]));

            // Assert
            expect(volumeOf(box!)).toBeCloseTo(24, 9);
            expect(boxOf(movedBox!).min.map((value) => Math.round(value * 1e6) / 1e6)).toEqual([10, 20, 30]);
        });

        it("should build a recipe whose buffers arrived as lists of numbers, as JSON carries them", () => {
            // Arrange
            const recipe = recipeOf(BOX, [rootOf(1)]);
            const parsed = JSON.parse(JSON.stringify({ ...recipe, buffers: { f64: [...recipe.buffers.f64], i32: [...recipe.buffers.i32] } })) as Base.Recipe;

            // Act
            const [solid] = built(parsed);
            const document = documentOf(parsed);

            // Assert
            expect(volumeOf(solid!)).toBeCloseTo(24, 9);
            expect(query.getAssemblyHierarchy({ document }).nodes.length).toBeGreaterThan(1);
        });

        it("should build a circle as a true circle, not a polygon", () => {
            // Act
            const [cylinder] = built(recipeOf([{ op: "circle", center: [0, 0], radius: 1 }, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 2 }], [rootOf(1)]));

            // Assert
            expect(volumeOf(cylinder!)).toBeCloseTo(2 * Math.PI, 9);
        });

        it("should turn the recipe's Z axis into Y by a rotation when asked", () => {
            // Act
            const [turned] = built(recipeOf(BOX, [rootOf(1)]), { adjustZtoY: true });
            const { min, max } = boxOf(turned!);

            // Assert
            [min[1], max[1], min[2], max[2]].forEach((value, index) => expect(value).toBeCloseTo([0, 3, -2, 0][index]!, 6));
            expect(volumeOf(turned!)).toBeCloseTo(24, 9);
        });

        it("should give back an empty compound for a root that cannot be built when asked, and build the others", () => {
            // Arrange
            const recipe = recipeOf([...BOX, { op: "polygon", points: [8, 6], holes: [] }, { op: "extrude", profile: 2, direction: [0, 0, 1], depth: 1 }], [rootOf(3), rootOf(1)], [0, 0, 4, 0, 4, 2, 0, 2, 0, 0, 1, 0, 2, 0]);

            // Act
            const [failed, box] = built(recipe, { emptyWhenFailed: true });

            // Assert
            expect(failed!.ShapeType()).toBe(occt.TopAbs_ShapeEnum.COMPOUND);
            expect(occHelper.shapeGettersService.getSolids({ shape: failed! })).toEqual([]);
            expect(volumeOf(box!)).toBeCloseTo(24, 9);
        });

        it("should stop on a root that cannot be built, naming the step that failed, the root and why", () => {
            // Arrange
            const recipe = recipeOf([...BOX, { op: "polygon", points: [8, 6], holes: [] }, { op: "extrude", profile: 2, direction: [0, 0, 1], depth: 1 }], [rootOf(1), rootOf(3)], [0, 0, 4, 0, 4, 2, 0, 2, 0, 0, 1, 0, 2, 0]);

            // Act
            const act = (): TopoDS_Shape[] => built(recipe);

            // Assert
            expect(act).toThrow(KernelOperationError);
            expect(act).toThrow("The recipe could not build node 2, which root 1 places: the outline encloses no area.");
            try {
                act();
            } catch (error) {
                expect((error as KernelOperationError).code).toBe("occt.recipe.failed");
                expect((error as KernelOperationError).details).toEqual({ node: 2, root: 1, reason: "the outline encloses no area" });
            }
        });

        it("should stop on an opening that could not be cut, naming the step where its failure began, the root and why", () => {
            // Arrange
            const recipe = recipeOf(WALL_WITH_OPENINGS, [rootOf(1), rootOf(6)], WALL_BUFFER);

            // Act
            const act = (): TopoDS_Shape[] => built(recipe);

            // Assert
            expect(act).toThrow("The recipe could not build node 2, which root 1 places: the outline encloses no area.");
            try {
                act();
            } catch (error) {
                expect((error as KernelOperationError).details).toEqual({ node: 2, root: 1, reason: "the outline encloses no area" });
            }
        });

        it("should cut a host by the openings that were built and leave the one that was not uncut when asked", () => {
            // Arrange
            const recipe = recipeOf(WALL_WITH_OPENINGS, [rootOf(1), rootOf(6), rootOf(6, moved(10))], WALL_BUFFER);

            // Act
            const [box, wall, movedWall] = built(recipe, { emptyWhenFailed: true });

            // Assert
            expect(volumeOf(box!)).toBeCloseTo(24, 9);
            expect(volumeOf(wall!)).toBeCloseTo(21, 9);
            expect(volumeOf(movedWall!)).toBeCloseTo(21, 9);
            expect(boxOf(movedWall!).min[0]).toBeCloseTo(10, 6);
        });

        it("should fail a triangle mesh larger than the limit and build it within the limit", () => {
            // Arrange
            const tetrahedron = recipeOf([{ op: "triangles", positions: [0, 12], indices: [0, 12] }], [rootOf(0)], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
            tetrahedron.buffers.i32 = new Int32Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2]);

            // Act
            const [solid] = built(tetrahedron, { facetedMeshes: true, maxTriangles: 4 });
            const act = (): TopoDS_Shape[] => built(tetrahedron, { facetedMeshes: true, maxTriangles: 3 });

            // Assert
            expect(solid!.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SOLID);
            expect(volumeOf(solid!)).toBeCloseTo(1 / 6, 12);
            expect(act).toThrow("the mesh holds 4 triangles, more than the 3 a faceted solid is built from");
        });

        it("should keep a triangle mesh's triangles by default, as a shape that measures, bounds and draws", () => {
            // Arrange
            const tetrahedron = recipeOf([{ op: "triangles", positions: [0, 12], indices: [0, 12] }], [rootOf(0, moved(10))], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
            tetrahedron.buffers.i32 = new Int32Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2]);

            // Act
            const [kept] = built(tetrahedron, { maxTriangles: 0 });
            const box = occHelper.operationsService.boundingBoxOfShape({ shape: kept! });
            const mesh = new OCCTService(occt, occHelper).shapeToMesh({ shape: kept!, precision: 0.01 });

            // Assert
            expect(kept!.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SHELL);
            expect(volumeOf(kept!)).toBeCloseTo(1 / 6, 12);
            box.min.forEach((value, index) => expect(value).toBeCloseTo([10, 0, 0][index]!, 6));
            box.max.forEach((value, index) => expect(value).toBeCloseTo([11, 1, 1][index]!, 6));
            expect(mesh.faceList).toHaveLength(1);
            expect(mesh.faceList[0]!.numberOfTriangles).toBe(4);
        });

        it("should draw kept triangles a root turns and moves where it puts them, their normals turned with them", () => {
            // Arrange
            const quarterTurn: Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 10, 0, 0, 1];
            const tetrahedron = recipeOf([{ op: "triangles", positions: [0, 12], indices: [0, 12] }], [rootOf(0, quarterTurn)], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
            tetrahedron.buffers.i32 = new Int32Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2]);

            // Act
            const [kept] = built(tetrahedron);
            const face = new OCCTService(occt, occHelper).shapeToMesh({ shape: kept!, precision: 0.01 }).faceList[0]!;

            // Assert
            const points = Array.from({ length: face.vertexCoord.length / 3 }, (_, at) => face.vertexCoord.slice(at * 3, at * 3 + 3));
            const normals = Array.from({ length: face.normalCoord.length / 3 }, (_, at) => face.normalCoord.slice(at * 3, at * 3 + 3));
            expect(Math.min(...points.map((point) => point[0]!))).toBeCloseTo(9, 9);
            expect(Math.max(...points.map((point) => point[0]!))).toBeCloseTo(10, 9);
            expect(Math.max(...points.map((point) => point[1]!))).toBeCloseTo(1, 9);
            for (let at = 0; at < face.triIndexes.length; at += 3) {
                const [a, b, c] = [face.triIndexes[at]!, face.triIndexes[at + 1]!, face.triIndexes[at + 2]!].map((index) => points[index]!);
                const u = [b![0]! - a![0]!, b![1]! - a![1]!, b![2]! - a![2]!];
                const v = [c![0]! - a![0]!, c![1]! - a![1]!, c![2]! - a![2]!];
                const facing = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
                const length = Math.hypot(...facing);
                const normal = normals[face.triIndexes[at]!]!;
                expect((facing[0]! * normal[0]! + facing[1]! * normal[1]! + facing[2]! * normal[2]!) / length).toBeCloseTo(1, 9);
            }
        });

        it("should move, turn and mirror kept triangles through the transforms, the triangles going with the shape", () => {
            // Arrange
            const tetrahedron = recipeOf([{ op: "triangles", positions: [0, 12], indices: [0, 12] }], [rootOf(0)], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
            tetrahedron.buffers.i32 = new Int32Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2]);
            const [kept] = built(tetrahedron);

            // Act
            const translated = occHelper.transformsService.translate({ shape: kept!, translation: [5, 0, 0] });
            const rotated = occHelper.transformsService.rotate({ shape: kept!, axis: [0, 0, 1], angle: 90 });
            const mirrored = occHelper.transformsService.mirrorAlongNormal({ shape: kept!, origin: [2, 0, 0], normal: [1, 0, 0] });
            shapes.push(translated, rotated, mirrored);

            // Assert
            const expected: [TopoDS_Shape, Base.Point3, Base.Point3][] = [
                [translated, [5, 0, 0], [6, 1, 1]],
                [rotated, [-1, 0, 0], [0, 1, 1]],
                [mirrored, [3, 0, 0], [4, 1, 1]],
            ];
            for (const [shape, min, max] of expected) {
                const box = boxOf(shape);
                box.min.forEach((value, index) => expect(value).toBeCloseTo(min[index]!, 6));
                box.max.forEach((value, index) => expect(value).toBeCloseTo(max[index]!, 6));
                expect(volumeOf(shape)).toBeCloseTo(1 / 6, 9);
            }
        });

        it("should stretch kept triangles by a matrix, and mirror them too, every normal along its triangle", () => {
            // Arrange
            const tetrahedron = recipeOf([{ op: "triangles", positions: [0, 12], indices: [0, 12] }], [rootOf(0)], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
            tetrahedron.buffers.i32 = new Int32Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2]);
            const [kept] = built(tetrahedron);

            // Act
            const stretched = occHelper.transformsService.transformByMatrix({ shape: kept!, transformation: [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] });
            const mirrored = occHelper.transformsService.transformByMatrix({ shape: kept!, transformation: [-2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] });
            shapes.push(stretched, mirrored);

            // Assert
            for (const [shape, min, max] of [[stretched, [0, 0, 0], [2, 1, 1]], [mirrored, [-2, 0, 0], [0, 1, 1]]] as [TopoDS_Shape, Base.Point3, Base.Point3][]) {
                const box = boxOf(shape);
                box.min.forEach((value, index) => expect(value).toBeCloseTo(min[index]!, 6));
                box.max.forEach((value, index) => expect(value).toBeCloseTo(max[index]!, 6));
                expect(volumeOf(shape)).toBeCloseTo(1 / 3, 9);
                const face = new OCCTService(occt, occHelper).shapeToMesh({ shape, precision: 0.01 }).faceList[0]!;
                const points = Array.from({ length: face.vertexCoord.length / 3 }, (_, at) => face.vertexCoord.slice(at * 3, at * 3 + 3));
                const normals = Array.from({ length: face.normalCoord.length / 3 }, (_, at) => face.normalCoord.slice(at * 3, at * 3 + 3));
                for (let at = 0; at < face.triIndexes.length; at += 3) {
                    const [a, b, c] = [face.triIndexes[at]!, face.triIndexes[at + 1]!, face.triIndexes[at + 2]!].map((index) => points[index]!);
                    const u = [b![0]! - a![0]!, b![1]! - a![1]!, b![2]! - a![2]!];
                    const v = [c![0]! - a![0]!, c![1]! - a![1]!, c![2]! - a![2]!];
                    const facing = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
                    const normal = normals[face.triIndexes[at]!]!;
                    expect((facing[0]! * normal[0]! + facing[1]! * normal[1]! + facing[2]! * normal[2]!) / Math.hypot(...facing) / Math.hypot(...normal)).toBeCloseTo(1, 9);
                }
            }
        });

        it("should refuse to cut a mesh it kept as triangles, naming facetedMeshes, and cut one built faceted", () => {
            // Arrange
            const tetrahedron = recipeOf([{ op: "triangles", positions: [0, 12], indices: [0, 12] }], [rootOf(0)], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
            tetrahedron.buffers.i32 = new Int32Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2]);
            const [kept] = built(tetrahedron);
            const [faceted] = built(tetrahedron, { facetedMeshes: true });
            const tool = occHelper.solidsService.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 1], originOnCenter: true });
            shapes.push(tool);

            // Act
            const act = (): TopoDS_Shape => occHelper.booleansService.difference({ shape: kept!, shapes: [tool], keepEdges: false, strategy: Inputs.OCCT.booleanStrategyEnum.allAtOnce });
            const cut = occHelper.booleansService.difference({ shape: faceted!, shapes: [tool], keepEdges: false, strategy: Inputs.OCCT.booleanStrategyEnum.allAtOnce });
            shapes.push(cut);

            // Assert
            expect(act).toThrow(expect.objectContaining({ code: "occt.boolean.tessellated" }));
            expect(volumeOf(cut)).toBeCloseTo(1 / 6 - 1 / 48, 9);
        });

        it("should hand the kernel the steps and the roots' placements, leaving the tags out, and an endless triangle limit as the largest it takes", () => {
            // Arrange
            const spy = vi.spyOn(occt, "BuildRecipes");

            // Act
            built(recipeOf(BOX, [rootOf(1, moved(1), { globalId: "abc", name: "Box" })]), { maxTriangles: Number.POSITIVE_INFINITY, adjustZtoY: true });

            // Assert
            const [text, f64, i32, adjustZtoY, facetedMeshes, maxTriangles] = spy.mock.calls[0]!;
            expect(JSON.parse(text as string)).toEqual({ tolerance: 1e-7, nodes: BOX, roots: [{ node: 1, matrix: moved(1) }] });
            expect(f64).toBeInstanceOf(Float64Array);
            expect(i32).toBeInstanceOf(Int32Array);
            expect(adjustZtoY).toBe(true);
            expect(facetedMeshes).toBe(false);
            expect(maxTriangles).toBe(2147483647);
        });

        it("should refuse a recipe that does not hold together before calling the kernel", () => {
            // Arrange
            const spy = vi.spyOn(occt, "BuildRecipes");

            // Act
            const act = (): TopoDS_Shape[] => built(recipeOf(BOX, [rootOf(0)]));

            // Assert
            expect(act).toThrow(InputError);
            expect(spy).not.toHaveBeenCalled();
        });

        it("should refuse a triangle limit below 0 or not a number", () => {
            // Act
            const negative = (): TopoDS_Shape[] => built(recipeOf(BOX, [rootOf(1)]), { maxTriangles: -1 });
            const notANumber = (): TopoDS_Shape[] => built(recipeOf(BOX, [rootOf(1)]), { maxTriangles: Number.NaN });

            // Assert
            expect(negative).toThrow(InputError);
            expect(notANumber).toThrow("`maxTriangles` is NaN");
        });

        it("should say that a kernel without the recipe builder is too old for it", () => {
            // Arrange
            const older = Object.assign(Object.create(occt) as BitbybitOcctModule, { BuildRecipes: undefined });
            const onOlder = new OCCTRecipes(older, occHelper, manager);

            // Act
            const act = (): TopoDS_Shape[] => onOlder.build({ recipe: recipeOf(BOX, [rootOf(1)]) });

            // Assert
            expect(act).toThrow("This build of the Bitbybit OCCT Kernel cannot build recipes; a newer one can.");
        });

        it("should pass on what the kernel throws that is not a C++ exception as it was", () => {
            // Arrange
            const thrown = new RangeError("out of memory");
            vi.spyOn(occt, "BuildRecipes").mockImplementation(() => {
                throw thrown;
            });

            // Act
            const act = (): TopoDS_Shape[] => built(recipeOf(BOX, [rootOf(1)]));

            // Assert
            expect(act).toThrow(thrown);
        });

        it("should give nothing back for a recipe without roots", () => {
            // Act
            const result = built(recipeOf(BOX, []));

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe("buildDocument", () => {
        it("should build products named after their roots, placing a shared step once per root and a mirrored root apart", () => {
            // Arrange
            const recipe = recipeOf(BOX, [
                rootOf(1, IDENTITY, { globalId: "g1", name: "Left", type: "IfcColumn" }),
                rootOf(1, moved(10), { globalId: "g2", name: "Right", type: "IfcColumn" }),
                rootOf(1, MIRROR, { globalId: "g3", name: "Mirrored", type: "IfcColumn" }),
            ]);

            // Act
            const document = documentOf(recipe, { name: "Columns" });
            const parts = query.getDocumentParts({ document }).filter((part) => part.type === "part");
            const names = query.getAssemblyHierarchy({ document }).nodes.map((node) => node.name);

            // Assert
            expect(parts.map((part) => [part.name, part.instanceCount])).toEqual([["IfcColumn 1", 2], ["Mirrored", 1]]);
            expect(names).toEqual(expect.arrayContaining(["Columns", "Left", "Right", "Mirrored"]));
        });

        it("should write each product's tags as its STEP properties and its colour, and the recipe's metres as millimetres", () => {
            // Arrange
            const recipe = recipeOf(BOX, [rootOf(1, IDENTITY, { globalId: "2O2Fr$t4X7Zf8NOew3FLOH", name: "Slab", rgba: [1, 0, 0, 1] })], undefined, 1000);

            // Act
            const step = stepOf(documentOf(recipe, { name: "Floors" }));
            const read = manager.loadStepToDoc({ stepData: step });
            documents.push(read);
            const [part] = query.getDocumentParts({ document: read }).filter((info) => info.type === "part");
            const shape = query.getShapeFromLabel({ document: read, label: part!.label });
            shapes.push(shape);

            // Assert
            expect(step).toContain("PRODUCT('Floors'");
            expect(step).toContain("PRODUCT('Slab'");
            expect(step).toContain("PROPERTY_DEFINITION('globalId'");
            expect(step).toContain("'2O2Fr$t4X7Zf8NOew3FLOH'");
            expect(step).toContain("DRAUGHTING_PRE_DEFINED_COLOUR('red')");
            expect(boxOf(shape).max[0]).toBeCloseTo(4000, 6);
            expect(volumeOf(shape)).toBeCloseTo(24e9, 0);
        });

        it("should write a mesh it keeps as tessellated geometry, and one asked for faceted as a faceted solid", () => {
            // Arrange
            const tetrahedron = recipeOf([{ op: "triangles", positions: [0, 12], indices: [0, 12] }], [rootOf(0, IDENTITY, { name: "Chair" })], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
            tetrahedron.buffers.i32 = new Int32Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2]);

            // Act
            const tessellated = stepOf(documentOf(tetrahedron));
            const faceted = stepOf(documentOf(tetrahedron, { facetedMeshes: true }));
            const read = manager.loadStepToDoc({ stepData: tessellated });
            documents.push(read);
            const [part] = query.getDocumentParts({ document: read }).filter((info) => info.type === "part");
            const readBack = query.getShapeFromLabel({ document: read, label: part!.label });
            shapes.push(readBack);

            // Assert
            expect(tessellated).toMatch(/TRIANGULATED_FACE|TESSELLATED_SHELL/);
            expect(tessellated).not.toContain("ADVANCED_FACE");
            expect(volumeOf(readBack)).toBeCloseTo(1 / 6, 6);
            expect(faceted).not.toMatch(/TRIANGULATED_FACE|TESSELLATED_SHELL/);
            expect(faceted).toContain("MANIFOLD_SOLID_BREP");
        });

        it("should leave a root that cannot be built out of the document when asked, else stop naming the first root built on it", () => {
            // Arrange
            const recipe = recipeOf([...BOX, { op: "polygon", points: [8, 6], holes: [] }, { op: "extrude", profile: 2, direction: [0, 0, 1], depth: 1 }],
                [rootOf(1, IDENTITY, { name: "Kept" }), rootOf(3, moved(1), { name: "Flat" }), rootOf(3, moved(2), { name: "Flat too" })], [0, 0, 4, 0, 4, 2, 0, 2, 0, 0, 1, 0, 2, 0]);

            // Act
            const document = documentOf(recipe, { emptyWhenFailed: true });
            const names = query.getAssemblyHierarchy({ document }).nodes.map((node) => node.name);
            const act = (): Handle_TDocStd_Document => documentOf(recipe);

            // Assert
            expect(names).toContain("Kept");
            expect(names).not.toContain("Flat");
            expect(act).toThrow("The recipe could not build node 2, which root 1 places: the outline encloses no area.");
        });

        it("should keep a part whose opening could not be cut when asked, else stop naming where the opening's failure began", () => {
            // Arrange
            const recipe = recipeOf(WALL_WITH_OPENINGS, [rootOf(1, IDENTITY, { name: "Box" }), rootOf(6, moved(10), { name: "Wall" })], WALL_BUFFER);

            // Act
            const document = documentOf(recipe, { emptyWhenFailed: true });
            const names = query.getAssemblyHierarchy({ document }).nodes.map((node) => node.name);
            const act = (): Handle_TDocStd_Document => documentOf(recipe);

            // Assert
            expect(names).toEqual(expect.arrayContaining(["Box", "Wall"]));
            expect(act).toThrow("The recipe could not build node 2, which root 1 places: the outline encloses no area.");
        });

        it("should name the root of a part that cannot be built when a part placed twice comes before it", () => {
            // Arrange
            const recipe = recipeOf([...BOX, { op: "polygon", points: [8, 6], holes: [] }, { op: "extrude", profile: 2, direction: [0, 0, 1], depth: 1 }],
                [rootOf(1, IDENTITY, { name: "Kept" }), rootOf(1, moved(5), { name: "Kept again" }), rootOf(3, moved(1), { name: "Flat" })], [0, 0, 4, 0, 4, 2, 0, 2, 0, 0, 1, 0, 2, 0]);

            // Act
            const act = (): Handle_TDocStd_Document => documentOf(recipe);

            // Assert
            expect(act).toThrow("The recipe could not build node 2, which root 2 places: the outline encloses no area.");
        });
    });
});
