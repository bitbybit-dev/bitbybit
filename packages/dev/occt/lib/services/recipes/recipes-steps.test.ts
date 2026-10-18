import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Base } from "@bitbybit-dev/base";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTAssemblyManager } from "../assembly/manager";
import { OCCTRecipes } from "./recipes";
import type { RecipeKernelReport } from "./recipe-types";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SQUARE = [0, 0, 4, 0, 4, 2, 0, 2];
const BOX: Base.RecipeNode[] = [
    { op: "polygon", points: [0, 8], holes: [] },
    { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 3 },
];

function moved(x: number, y = 0, z = 0): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

function recipeOf(nodes: Base.RecipeNode[], roots: Base.RecipeRoot[], f64: number[] = SQUARE): Base.Recipe {
    return { format: "bitbybit.recipe", version: 1, millimetresPerUnit: 1, tolerance: 1e-7, buffers: { f64: new Float64Array(f64), i32: new Int32Array() }, nodes, roots };
}

function rootOf(node: number, matrix: Base.TransformMatrix = IDENTITY): Base.RecipeRoot {
    return { node, matrix, tag: {} };
}

describe("OCCTRecipes steps", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let recipes: OCCTRecipes;
    const shapes: TopoDS_Shape[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
        recipes = new OCCTRecipes(occt, occHelper, new OCCTAssemblyManager(occt, occHelper));
    });

    afterEach(() => {
        shapes.splice(0).forEach((shape) => shape.delete());
    });

    function built(recipe: Base.Recipe, emptyWhenFailed = false): TopoDS_Shape[] {
        const result = recipes.build({ recipe, emptyWhenFailed });
        shapes.push(...result);
        return result;
    }

    function volumeOf(shape: TopoDS_Shape): number {
        return occHelper.solidsService.getSolidVolume({ shape });
    }

    function solidsIn(shape: TopoDS_Shape): number {
        const solids = occHelper.shapeGettersService.getSolids({ shape });
        solids.forEach((solid) => solid.delete());
        return solids.length;
    }

    function facesIn(shape: TopoDS_Shape): number {
        const faces = occHelper.shapeGettersService.getFaces({ shape });
        faces.forEach((face) => face.delete());
        return faces.length;
    }

    describe("union and intersection", () => {
        it("should join two overlapping boxes into one solid of the space either fills", () => {
            // Act
            const [joined] = built(recipeOf([...BOX, { op: "transform", of: 1, matrix: moved(2) }, { op: "union", of: [1, 2] }], [rootOf(3)]));

            // Assert
            expect(joined!.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SOLID);
            expect(volumeOf(joined!)).toBeCloseTo(36, 9);
            expect(facesIn(joined!)).toBe(6);
        });

        it("should keep the space every solid fills", () => {
            // Act
            const [common, ofThree] = built(recipeOf([
                ...BOX,
                { op: "transform", of: 1, matrix: moved(2) },
                { op: "transform", of: 1, matrix: moved(3) },
                { op: "intersection", of: [1, 2] },
                { op: "intersection", of: [1, 2, 3] },
            ], [rootOf(4), rootOf(5)]));

            // Assert
            expect(volumeOf(common!)).toBeCloseTo(12, 9);
            expect(volumeOf(ofThree!)).toBeCloseTo(6, 9);
        });

        it("should give nothing for solids that do not meet", () => {
            // Act
            const [none] = built(recipeOf([...BOX, { op: "transform", of: 1, matrix: moved(10) }, { op: "intersection", of: [1, 2] }], [rootOf(3)]));

            // Assert
            expect(solidsIn(none!)).toBe(0);
        });
    });

    describe("revolve", () => {
        it("should turn a profile beside its axis by a quarter and by a whole turn, as Pappus measures them", () => {
            // Arrange
            const recipe = recipeOf([
                { op: "polygon", points: [0, 8], holes: [] },
                { op: "revolve", profile: 0, origin: [0, 0], direction: [0, 1], angle: Math.PI / 2 },
                { op: "revolve", profile: 0, origin: [0, 0], direction: [0, 1], angle: 2 * Math.PI },
            ], [rootOf(1), rootOf(2)], [1, 0, 2, 0, 2, 1, 1, 1]);

            // Act
            const [quarter, whole] = built(recipe);
            const box = occHelper.operationsService.boundingBoxOfShape({ shape: quarter! });

            // Assert
            expect(volumeOf(quarter!)).toBeCloseTo(0.75 * Math.PI, 9);
            expect(volumeOf(whole!)).toBeCloseTo(3 * Math.PI, 9);
            expect(whole!.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SOLID);
            expect(box.min[2]).toBeCloseTo(-2, 6);
            expect(box.max[2]).toBeCloseTo(0, 6);
        });

        it("should fail only the root of a profile that lies on both sides of its axis", () => {
            // Arrange
            const recipe = recipeOf([
                { op: "polygon", points: [0, 8], holes: [] },
                { op: "revolve", profile: 0, origin: [0, 0], direction: [0, 1], angle: Math.PI },
                { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 },
            ], [rootOf(1), rootOf(2)], [-1, 0, 1, 0, 1, 1, -1, 1]);

            // Act
            const [failed, extruded] = built(recipe, true);
            const act = (): TopoDS_Shape[] => built(recipe);

            // Assert
            expect(solidsIn(failed!)).toBe(0);
            expect(volumeOf(extruded!)).toBeCloseTo(2, 9);
            expect(act).toThrow("The recipe could not build node 1, which root 0 places: the profile lies on both sides of the axis it turns about.");
        });
    });

    describe("loft", () => {
        it("should join a profile placed by three frames with straight sides into one solid", () => {
            // Arrange
            const facingX = (x: number): number[] => [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, x, 0, 0, 1];
            const recipe = recipeOf([{ op: "polygon", points: [0, 8], holes: [] }, { op: "loft", profiles: [0], frames: [8, 48] }], [rootOf(1)], [...SQUARE, ...facingX(0), ...facingX(1), ...facingX(3)]);

            // Act
            const [lofted] = built(recipe);
            const box = occHelper.operationsService.boundingBoxOfShape({ shape: lofted! });

            // Assert
            expect(lofted!.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SOLID);
            expect(volumeOf(lofted!)).toBeCloseTo(24, 9);
            box.min.forEach((value, index) => expect(value).toBeCloseTo([0, 0, 0][index]!, 6));
            box.max.forEach((value, index) => expect(value).toBeCloseTo([3, 4, 2][index]!, 6));
        });

        it("should taper from one square to another as a frustum", () => {
            // Arrange
            const recipe = recipeOf([
                { op: "polygon", points: [0, 8], holes: [] },
                { op: "polygon", points: [8, 8], holes: [] },
                { op: "loft", profiles: [0, 1], frames: [16, 32] },
            ], [rootOf(2)], [0, 0, 2, 0, 2, 2, 0, 2, 0, 0, 1, 0, 1, 1, 0, 1, ...IDENTITY, ...moved(0, 0, 1)]);

            // Act
            const [frustum] = built(recipe);

            // Assert
            expect(volumeOf(frustum!)).toBeCloseTo(7 / 3, 9);
        });

        it("should cut the loft of a profile's hole out of the loft of its boundary", () => {
            // Arrange
            const recipe = recipeOf([{ op: "polygon", points: [0, 8], holes: [[8, 8]] }, { op: "loft", profiles: [0], frames: [16, 32] }],
                [rootOf(1)], [0, 0, 4, 0, 4, 4, 0, 4, 1, 1, 3, 1, 3, 3, 1, 3, ...IDENTITY, ...moved(0, 0, 2)]);

            // Act
            const [tube] = built(recipe);

            // Assert
            expect(tube!.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SOLID);
            expect(volumeOf(tube!)).toBeCloseTo(24, 9);
            expect(facesIn(tube!)).toBe(10);
        });

        it("should fail a loft whose frames leave its sections in one plane rather than build a solid of no volume", () => {
            // Arrange
            const recipe = recipeOf([{ op: "polygon", points: [0, 8], holes: [] }, { op: "loft", profiles: [0], frames: [8, 32] }], [rootOf(1)], [...SQUARE, ...IDENTITY, ...moved(1)]);

            // Act
            const act = (): TopoDS_Shape[] => built(recipe);
            const [empty] = built(recipe, true);

            // Assert
            expect(act).toThrow("The recipe could not build node 1, which root 0 places: the loft is no thicker than the precision of a shape: its frames leave its sections in one plane.");
            expect(solidsIn(empty!)).toBe(0);
        });
    });

    describe("steps the kernel does not know", () => {
        it("should fail only the roots resting on such a step, the others built", () => {
            // Arrange
            const nodes = [...BOX, { op: "sweep", path: [0, 8] }, { op: "extrude", profile: 2, direction: [0, 0, 1], depth: 1 }, { op: "difference", of: 1, tools: [2] }];
            const roots = [1, 2, 3, 4].map((node) => ({ node, matrix: IDENTITY }));

            // Act
            const result = occt.BuildRecipes(JSON.stringify({ tolerance: 1e-7, nodes, roots }), new Float64Array(SQUARE), new Int32Array(), false, false, 100000);
            shapes.push(...result.shapes.filter((shape): shape is TopoDS_Shape => shape !== null));
            const reports = (JSON.parse(result.report) as RecipeKernelReport).roots;

            // Assert
            expect(volumeOf(result.shapes[0]!)).toBeCloseTo(24, 9);
            expect(result.shapes.slice(1)).toEqual([null, null, null]);
            const failed = { built: false, node: 2, reason: "'sweep' is not a step this kernel builds; a newer kernel may build it" };
            expect(reports).toEqual([{ built: true }, failed, failed, failed]);
        });
    });
});
