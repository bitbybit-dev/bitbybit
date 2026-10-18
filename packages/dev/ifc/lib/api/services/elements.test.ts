import { describe, expect, it } from "vitest";
import type { Base } from "@bitbybit-dev/base";
import { signedVolumeOf } from "@bitbybit-dev/base/lib/api/services/helpers/mesh/mesh-measures";
import { IFCService } from "../ifc-service";
import type { IfcModel } from "../../model/model-types";
import { modelOf } from "./service-support";
import { cylinderBody, exactRecipe, hollowedBody, quarterCylinderBody } from "../../__test__/exact-bodies";
import { errorFrom } from "../../__test__/build-setup";
import { InputError, Recipes } from "@bitbybit-dev/base";

const RECIPES = new Recipes();

const ifc = new IFCService();
const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SEAM = [1, 0, 0, 1, 0, 2];
const placement = (z: number): Base.RecipeBrepPlacement => ({ origin: [0, 0, z], axis: [0, 0, 1], xDirection: [1, 0, 0] });

function cylinderNode(start = 0, scale = 1): Base.RecipeBrepNode {
    return {
        op: "brep",
        vertices: [start, SEAM.length],
        curves: [
            { kind: "circle", ...placement(0), radius: scale },
            { kind: "circle", ...placement(2 * scale), radius: scale },
            { kind: "line", origin: [scale, 0, 0], direction: [0, 0, 1] },
        ],
        surfaces: [{ kind: "cylinder", ...placement(0), radius: scale }, { kind: "plane", ...placement(0) }, { kind: "plane", ...placement(2 * scale) }],
        edges: [{ curve: 0, start: 0, end: 0 }, { curve: 1, start: 1, end: 1 }, { curve: 2, start: 0, end: 1 }],
        faces: [
            { surface: 0, sameSense: true, bounds: [{ outer: true, edges: [0, 2, 1, 2], forward: [true, true, false, false] }] },
            { surface: 1, sameSense: false, bounds: [{ outer: true, edges: [0], forward: [false] }] },
            { surface: 2, sameSense: true, bounds: [{ outer: true, edges: [1], forward: [true] }] },
        ],
        closed: true,
    };
}

function recipeOf(nodes: Base.RecipeNode[], f64: number[], millimetresPerUnit = 1, matrix: Base.TransformMatrix = IDENTITY, i32: number[] = []): Base.Recipe {
    return { format: "bitbybit.recipe", version: 1, millimetresPerUnit, tolerance: 0.001, buffers: { f64: new Float64Array(f64), i32: new Int32Array(i32) }, nodes, roots: [{ node: nodes.length - 1, matrix, tag: {} }] };
}

function storeyModel(): IfcModel {
    let model = ifc.model.create({ name: "Elements", seed: "elements" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    return ifc.materials.add({ model, name: "Steel", color: "#888888" });
}

function readBack(model: IfcModel, id: string): { recipe: Base.Recipe; brep: Base.RecipeBrepNode; matrix: Base.TransformMatrix } {
    const recipe = ifc.geometry.recipe({ model, elements: [id] });
    const root = recipe.roots[0]!;
    const node = recipe.nodes[root.node]!;
    if (node.op !== "brep") {
        throw new Error(`read back a ${node.op} step`);
    }
    return { recipe, brep: node, matrix: root.matrix };
}

function triplesOf(values: ArrayLike<number>): number[][] {
    return Array.from({ length: values.length / 3 }, (_, at) => [values[at * 3]!, values[at * 3 + 1]!, values[at * 3 + 2]!]);
}

function verticesOf(recipe: Base.Recipe, brep: Base.RecipeBrepNode): number[][] {
    const values = Array.from(recipe.buffers.f64.subarray(brep.vertices[0], brep.vertices[0] + brep.vertices[1]));
    return Array.from({ length: values.length / 3 }, (_, at) => values.slice(at * 3, at * 3 + 3).map((value) => Math.round(value * 1e6) / 1e6));
}

describe("IFCElements.add", () => {
    it("should write a closed brep as an advanced brep that reads back as the same faces, edges, curves and surfaces", () => {
        // Arrange
        const model = storeyModel();

        // Act
        const added = ifc.elements.add({ model, storey: "ground", id: "post", name: "Post", body: recipeOf([cylinderNode()], SEAM), material: "Steel" });
        const { recipe, brep } = readBack(added, "post");

        // Assert
        expect(RECIPES.check({ recipe })).toEqual([]);
        expect(brep.surfaces.map((surface) => surface.kind)).toEqual(["cylinder", "plane", "plane"]);
        expect(brep.curves.map((curve) => curve.kind)).toEqual(["circle", "line", "circle"]);
        expect(brep.faces.map((face) => face.sameSense)).toEqual([true, false, true]);
        expect(brep.solids).toEqual([{ outer: [0, 1, 2] }]);
        expect(verticesOf(recipe, brep)).toEqual([[1, 0, 0], [1, 0, 2]]);
        expect(recipe.roots[0]!.tag).toMatchObject({ type: "IfcBuildingElementProxy", name: "Post", rgba: [0x88 / 255, 0x88 / 255, 0x88 / 255, 1] });
        const text = ifc.model.write({ model: added, timeStamp: "2026-10-13T00:00:00" });
        expect(text).toMatch(/IFCADVANCEDBREP\(#\d+\)/);
        expect(text).toMatch(/IFCSHAPEREPRESENTATION\(#\d+,'Body','AdvancedBrep'/);
        expect(text).toMatch(/IFCBUILDINGELEMENTPROXY\('[^']+',\$,'Post',\$,\$,#\d+,#\d+,\$,\.NOTDEFINED\.\);/);
    });

    it("should place the body by the position and turn given, and scale it from its units into the model's", () => {
        // Arrange
        const model = storeyModel();
        const inMetres = recipeOf([cylinderNode(0, 0.5)], [0.5, 0, 0, 0.5, 0, 1], 1000);

        // Act
        const added = ifc.elements.add({ model, storey: "ground", id: "post", body: inMetres, position: [2000, 3000, 100], rotation: 90 });
        const { recipe, brep, matrix } = readBack(added, "post");

        // Assert
        expect(verticesOf(recipe, brep)).toEqual([[500, 0, 0], [500, 0, 1000]]);
        expect(brep.curves.find((curve) => curve.kind === "circle")).toMatchObject({ radius: 500 });
        expect(matrix.map((value) => Math.round(value * 1e9) / 1e9)).toEqual([0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 2000, 3000, 100, 1]);
    });

    it("should keep a root's own move and turn in the coordinates it writes", () => {
        // Arrange
        const model = storeyModel();
        const moved: Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1];

        // Act
        const added = ifc.elements.add({ model, storey: "ground", id: "post", body: recipeOf([cylinderNode()], SEAM, 1, moved) });
        const { recipe, brep } = readBack(added, "post");

        // Assert
        expect(verticesOf(recipe, brep)).toEqual([[10, 21, 30], [10, 21, 32]]);
        expect(brep.surfaces[0]).toMatchObject({ kind: "cylinder", origin: [10, 20, 30], axis: [0, 0, 1], xDirection: [0, 1, 0] });
    });

    it("should write a solid with cavities as its outside less each cavity, every one an advanced brep wound outward", () => {
        // Arrange
        const model = storeyModel();
        const tube = hollowedBody(cylinderBody(2, 6), cylinderBody(1, 4, 1));

        // Act
        const added = ifc.elements.add({ model, storey: "ground", id: "tube", body: exactRecipe(tube) });
        const recipe = ifc.geometry.recipe({ model: added, elements: ["tube"] });
        const root = recipe.nodes[recipe.roots[0]!.node]!;
        const text = ifc.model.write({ model: added, timeStamp: "2026-10-13T00:00:00" });

        // Assert
        expect(text).toMatch(/IFCSHAPEREPRESENTATION\(#\d+,'Body','SolidModel',\(#\d+\)\)/);
        expect(text).toMatch(/IFCCSGSOLID\(#\d+\)/);
        expect(text).toMatch(/IFCBOOLEANRESULT\(\.DIFFERENCE\.,#\d+,#\d+\)/);
        expect(text).not.toMatch(/WITHVOIDS/);
        expect(root.op).toBe("difference");
        if (root.op === "difference") {
            const [outer, cavity] = [recipe.nodes[root.of]!, recipe.nodes[root.tools[0]!]!];
            expect([outer.op, cavity.op]).toEqual(["brep", "brep"]);
            if (outer.op === "brep" && cavity.op === "brep") {
                expect(outer.faces.map((face) => face.sameSense)).toEqual([true, false, true]);
                expect(cavity.faces.map((face) => face.sameSense)).toEqual([true, false, true]);
                expect(cavity.faces[0]!.bounds[0]!.forward).toEqual([true, true, false, false]);
                expect(verticesOf(recipe, cavity)).toEqual([[1, 0, 1], [1, 0, 5]]);
            }
        }
    });

    it("should cut each of a solid's cavities in turn, and keep a plain advanced brep for a solid that has none", () => {
        // Arrange
        const model = storeyModel();
        const twice = hollowedBody(hollowedBody(cylinderBody(4, 6), cylinderBody(1, 1, 1)), cylinderBody(1, 1, 4));
        twice.node.solids = [{ outer: [0, 1, 2], voids: [[3, 4, 5], [6, 7, 8]] }];
        const plain = exactRecipe(cylinderBody(1, 2));

        // Act
        const carved = ifc.model.write({ model: ifc.elements.add({ model, storey: "ground", body: exactRecipe(twice) }), timeStamp: "2026-10-13T00:00:00" });
        const whole = ifc.model.write({ model: ifc.elements.add({ model, storey: "ground", body: plain }), timeStamp: "2026-10-13T00:00:00" });

        // Assert
        expect(carved.match(/IFCBOOLEANRESULT\(/g)).toHaveLength(2);
        expect(carved.match(/IFCADVANCEDBREP\(/g)).toHaveLength(3);
        expect(carved.match(/IFCCSGSOLID\(/g)).toHaveLength(1);
        expect(whole).not.toMatch(/IFCCSGSOLID|IFCBOOLEANRESULT/);
        expect(whole).toMatch(/IFCSHAPEREPRESENTATION\(#\d+,'Body','AdvancedBrep',\(#\d+\)\)/);
    });

    it("should write a solid bounded by a rational B-spline surface that reads back as the same solid", () => {
        // Arrange
        const model = storeyModel();
        const quarter = quarterCylinderBody(1000, 500);

        // Act
        const added = ifc.elements.add({ model, storey: "ground", id: "quarter", body: exactRecipe(quarter) });
        const { recipe, brep } = readBack(added, "quarter");

        // Assert
        expect(brep.surfaces.map((surface) => surface.kind)).toEqual(["bspline", "plane", "plane", "plane", "plane"]);
        expect(brep.faces.map((face) => face.sameSense)).toEqual([true, false, true, true, true]);
        expect(brep.solids).toEqual([{ outer: [0, 1, 2, 3, 4] }]);
        const side = brep.surfaces[0]!;
        expect(side.kind === "bspline" ? Array.from(recipe.buffers.f64.subarray(side.weights![0], side.weights![0] + side.weights![1])) : []).toEqual([1, 1, Math.SQRT1_2, Math.SQRT1_2, 1, 1]);
        expect(brep.curves.filter((curve) => curve.kind === "bspline")).toHaveLength(2);
    });

    it("should write a mesh as a triangulated face set, closed when its triangles meet edge to edge", () => {
        // Arrange
        const model = storeyModel();
        const tetrahedron = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1];
        const indices = [0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2];
        const body = recipeOf([{ op: "triangles", positions: [0, 12], indices: [0, 12] }], tetrahedron, 1, IDENTITY, indices);

        // Act
        const added = ifc.elements.add({ model, storey: "ground", id: "mesh", body, type: "IfcFurniture", objectType: "Stool" });
        const recipe = ifc.geometry.recipe({ model: added, elements: ["mesh"] });
        const node = recipe.nodes[recipe.roots[0]!.node]!;
        const text = ifc.model.write({ model: added, timeStamp: "2026-10-13T00:00:00" });

        // Assert
        expect(node.op).toBe("triangles");
        if (node.op === "triangles") {
            const positions = Array.from(recipe.buffers.f64.subarray(node.positions[0], node.positions[0] + node.positions[1]));
            const corners = Array.from(recipe.buffers.i32.subarray(node.indices[0], node.indices[0] + node.indices[1]));
            expect(signedVolumeOf(positions, corners)).toBeCloseTo(1 / 6, 12);
        }
        expect(text).toMatch(/IFCTRIANGULATEDFACESET\(#\d+,\$,\.T\.,/);
        expect(text).toMatch(/IFCFURNITURE\('[^']+',\$,'Element',\$,'Stool',#\d+,#\d+,\$,\.USERDEFINED\.\);/);
    });

    it("should refuse a class that is not an element or is abstract, a predefined type a class lacks, and a material the model has not", () => {
        // Arrange
        const model = storeyModel();
        const body = recipeOf([cylinderNode()], SEAM);

        // Act & Assert
        expect(() => ifc.elements.add({ model, storey: "ground", body, type: "IfcWallType" })).toThrow("'IfcWallType' is not a kind of element the model's schema can hold");
        expect(() => ifc.elements.add({ model, storey: "ground", body, type: "IfcBuildingElement" })).toThrow("'IfcBuildingElement' is not a kind of element");
        expect(() => ifc.elements.add({ model, storey: "ground", body, type: "IfcFurnishingElement", predefinedType: "CHAIR" })).toThrow("An IfcFurnishingElement has no predefined type to set");
        expect(() => ifc.elements.add({ model, storey: "ground", body, material: "Gold" })).toThrow("The model has no material named 'Gold'");
    });

    it("should refuse a body of other steps, of mixed kinds, placed by a scaling or mirroring matrix, or on a surface IFC's advanced faces do not take", () => {
        // Arrange
        const model = storeyModel();
        const extruded = recipeOf([{ op: "polygon", points: [0, 6], holes: [] }, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 }], [0, 0, 1, 0, 0, 1]);
        const mixed: Base.Recipe = { ...recipeOf([cylinderNode(), { op: "triangles", positions: [0, 9], indices: [0, 3] }], [...SEAM, 0, 0, 0], 1, IDENTITY, [0, 1, 2]), roots: [{ node: 0, matrix: IDENTITY, tag: {} }, { node: 1, matrix: IDENTITY, tag: {} }] };
        const scaled = recipeOf([cylinderNode()], SEAM, 1, [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1]);
        const mirrored = recipeOf([cylinderNode()], SEAM, 1, [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        const cone = cylinderNode();
        cone.surfaces[0] = { kind: "cone", ...placement(0), radius: 1, semiAngle: 0.2 };

        // Act & Assert
        expect(() => ifc.elements.add({ model, storey: "ground", body: extruded })).toThrow("Root 0 of the body is a extrude step");
        expect(() => ifc.elements.add({ model, storey: "ground", body: mixed })).toThrow("The body mixes AdvancedBrep and Tessellation items");
        expect(() => ifc.elements.add({ model, storey: "ground", body: scaled })).toThrow("scales or mirrors");
        expect(() => ifc.elements.add({ model, storey: "ground", body: mirrored })).toThrow("scales or mirrors");
        expect(() => ifc.elements.add({ model, storey: "ground", body: recipeOf([cone], SEAM) })).toThrow("A cone surface has no IFC4 form an advanced face takes");
    });

    it("should write the predefined type given, and none on a class that has no such attribute", () => {
        // Arrange
        const model = storeyModel();
        const body = recipeOf([cylinderNode()], SEAM);

        // Act
        const fitted = ifc.elements.add({ model, storey: "ground", body, type: "IfcPipeFitting", predefinedType: "BEND", name: "Bend" });
        const furnished = ifc.elements.add({ model, storey: "ground", body, type: "IfcFurnishingElement", name: "Shelf" });

        // Assert
        expect(ifc.model.write({ model: fitted, timeStamp: "2026-10-13T00:00:00" })).toMatch(/IFCPIPEFITTING\('[^']+',\$,'Bend',\$,\$,#\d+,#\d+,\$,\.BEND\.\);/);
        expect(ifc.model.write({ model: furnished, timeStamp: "2026-10-13T00:00:00" })).toMatch(/IFCFURNISHINGELEMENT\('[^']+',\$,'Shelf',\$,\$,#\d+,#\d+,\$\);/);
    });

    it("should write an open brep as a shell-based surface model whose rational patch keeps its weights", () => {
        // Arrange
        const model = storeyModel();
        const half = Math.SQRT1_2;
        const corners = [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1];
        const arc = (z: number): number[] => [1, 0, z, 1, 1, z, 0, 1, z];
        const f64 = [...corners, ...arc(0), 1, half, 1, 0, 1, ...arc(1), 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, half, half, 1, 1];
        const spline = (points: number): Base.RecipeBrepCurve => ({ kind: "bspline", degree: 2, points: [points, 9], weights: [21, 3], knots: [24, 2], multiplicities: [3, 3] });
        const patch: Base.RecipeBrepNode = {
            op: "brep",
            vertices: [0, 12],
            curves: [spline(12), spline(26), { kind: "line", origin: [1, 0, 0], direction: [0, 0, 1] }, { kind: "line", origin: [0, 1, 0], direction: [0, 0, 1] }],
            surfaces: [{ kind: "bspline", uDegree: 2, vDegree: 1, uCount: 3, vCount: 2, points: [35, 18], weights: [53, 6], uKnots: [24, 2], uMultiplicities: [3, 3], vKnots: [24, 2], vMultiplicities: [2, 2] }],
            edges: [{ curve: 0, start: 0, end: 1 }, { curve: 1, start: 2, end: 3 }, { curve: 2, start: 0, end: 2 }, { curve: 3, start: 1, end: 3 }],
            faces: [{ surface: 0, sameSense: true, bounds: [{ outer: true, edges: [0, 3, 1, 2], forward: [true, true, false, false] }] }],
            closed: false,
        };

        // Act
        const added = ifc.elements.add({ model, storey: "ground", id: "patch", body: recipeOf([patch], f64) });
        const recipe = ifc.geometry.recipe({ model: added, elements: ["patch"] });
        const node = recipe.nodes[recipe.roots[0]!.node]!;
        const text = ifc.model.write({ model: added, timeStamp: "2026-10-13T00:00:00" });

        // Assert
        expect(text).toMatch(/IFCSHAPEREPRESENTATION\(#\d+,'Body','SurfaceModel'/);
        expect(text).toMatch(/IFCSHELLBASEDSURFACEMODEL\(\(#\d+\)\)/);
        expect(text).toMatch(/IFCOPENSHELL\(\(#\d+\)\)/);
        expect(text).toMatch(/IFCRATIONALBSPLINESURFACEWITHKNOTS\(2,1,\(\(#\d+,#\d+\),\(#\d+,#\d+\),\(#\d+,#\d+\)\),\.UNSPECIFIED\.,\.F\.,\.F\.,\.F\.,\(3,3\),\(2,2\),\(0\.,1\.\),\(0\.,1\.\),\.UNSPECIFIED\.,\(\(1\.,1\.\),\(0\.7071067811865\d*,0\.7071067811865\d*\),\(1\.,1\.\)\)\)/);
        expect(text.match(/IFCRATIONALBSPLINECURVEWITHKNOTS\(2,/g)).toHaveLength(2);
        expect(node.op).toBe("triangles");
        if (node.op === "triangles") {
            const positions = recipe.buffers.f64.subarray(node.positions[0], node.positions[0] + node.positions[1]);
            const radii = triplesOf(positions).map(([x, y]) => Math.hypot(x!, y!));
            expect(Math.min(...radii)).toBeCloseTo(1, 9);
            expect(Math.max(...radii)).toBeCloseTo(1, 9);
            expect(Math.max(...triplesOf(positions).map(([, , z]) => z!))).toBeCloseTo(1, 12);
        }
    });

    it("should write spheres, tori, ellipses and plain B-splines with their sizes in the model's units", () => {
        // Arrange
        const model = storeyModel();
        const f64 = [1, 0, 0, 0, 1, 0, 0, 0, 0, 0.5, 0.5, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1];
        const node: Base.RecipeBrepNode = {
            op: "brep",
            vertices: [0, 6],
            curves: [{ kind: "ellipse", ...placement(0), xRadius: 1, yRadius: 0.5 }, { kind: "bspline", degree: 2, points: [6, 9], knots: [15, 2], multiplicities: [3, 3] }],
            surfaces: [
                { kind: "sphere", ...placement(0), radius: 2 },
                { kind: "torus", ...placement(0), majorRadius: 3, minorRadius: 0.25 },
                { kind: "bspline", uDegree: 1, vDegree: 1, uCount: 2, vCount: 2, points: [17, 12], uKnots: [15, 2], uMultiplicities: [2, 2], vKnots: [15, 2], vMultiplicities: [2, 2] },
            ],
            edges: [{ curve: 0, start: 0, end: 0 }, { curve: 1, start: 0, end: 1 }],
            faces: [
                { surface: 0, sameSense: true, bounds: [{ outer: true, edges: [0], forward: [true] }] },
                { surface: 1, sameSense: true, bounds: [{ outer: true, edges: [0], forward: [false] }] },
                { surface: 2, sameSense: false, bounds: [{ outer: true, edges: [1, 1], forward: [true, false] }] },
            ],
            closed: false,
        };

        // Act
        const added = ifc.elements.add({ model, storey: "ground", id: "sampler", body: recipeOf([node], f64, 1000) });
        const text = ifc.model.write({ model: added, timeStamp: "2026-10-13T00:00:00" });

        // Assert
        expect(text).toMatch(/IFCELLIPSE\(#\d+,1000\.,500\.\)/);
        expect(text).toMatch(/IFCSPHERICALSURFACE\(#\d+,2000\.\)/);
        expect(text).toMatch(/IFCTOROIDALSURFACE\(#\d+,3000\.,250\.\)/);
        expect(text).toMatch(/IFCBSPLINECURVEWITHKNOTS\(2,\(#\d+,#\d+,#\d+\),\.UNSPECIFIED\.,\.F\.,\.F\.,\(3,3\),\(0\.,1\.\),\.UNSPECIFIED\.\)/);
        expect(text).toMatch(/IFCBSPLINESURFACEWITHKNOTS\(1,1,\(\(#\d+,#\d+\),\(#\d+,#\d+\)\),/);
        expect(text).toMatch(/IFCADVANCEDFACE\(\(#\d+\),#\d+,\.F\.\)/);
        expect(text).toMatch(/IFCCARTESIANPOINT\(\(500\.,500\.,0\.\)\)/);
    });

    it("should write a curve or surface once however many edges or faces lie on it, and a face's hole as an inner bound", () => {
        // Arrange
        const model = storeyModel();
        const disc: Base.RecipeBrepNode = {
            op: "brep",
            vertices: [0, 6],
            curves: [{ kind: "circle", ...placement(0), radius: 1 }, { kind: "circle", ...placement(0), radius: 0.5 }],
            surfaces: [{ kind: "plane", ...placement(0) }],
            edges: [{ curve: 0, start: 0, end: 0 }, { curve: 1, start: 1, end: 1 }, { curve: 1, start: 1, end: 1 }],
            faces: [
                { surface: 0, sameSense: true, bounds: [{ outer: true, edges: [0], forward: [true] }, { outer: false, edges: [1], forward: [false] }] },
                { surface: 0, sameSense: true, bounds: [{ outer: true, edges: [2], forward: [true] }] },
            ],
            closed: false,
        };

        // Act
        const added = ifc.elements.add({ model, storey: "ground", id: "disc", body: recipeOf([disc], [1, 0, 0, 0.5, 0, 0]) });
        const recipe = ifc.geometry.recipe({ model: added, elements: ["disc"] });
        const node = recipe.nodes[recipe.roots[0]!.node]!;
        const text = ifc.model.write({ model: added, timeStamp: "2026-10-13T00:00:00" });

        // Assert
        expect(text.match(/IFCPLANE\(/g)).toHaveLength(1);
        expect(text.match(/IFCCIRCLE\(/g)).toHaveLength(2);
        expect(text.match(/IFCEDGECURVE\(/g)).toHaveLength(3);
        expect(text.match(/IFCFACEBOUND\(/g)).toHaveLength(1);
        expect(node.op).toBe("triangles");
        if (node.op === "triangles") {
            const points = triplesOf(recipe.buffers.f64.subarray(node.positions[0], node.positions[0] + node.positions[1]));
            const corners = triplesOf(recipe.buffers.i32.subarray(node.indices[0], node.indices[0] + node.indices[1]));
            const area = corners.reduce((sum, [a, b, c]) => {
                const [p, q, r] = [points[a!]!, points[b!]!, points[c!]!];
                return sum + Math.abs((q[0]! - p[0]!) * (r[1]! - p[1]!) - (q[1]! - p[1]!) * (r[0]! - p[0]!)) / 2;
            }, 0);
            expect(area).toBeCloseTo(Math.PI, 1);
            expect(area).toBeLessThan(Math.PI);
        }
    });

    it("should refuse a body with no roots", () => {
        // Arrange
        const model = storeyModel();
        const empty: Base.Recipe = { ...recipeOf([cylinderNode()], SEAM), roots: [] };

        // Act & Assert
        expect(() => ifc.elements.add({ model, storey: "ground", body: empty })).toThrow("The body has no roots to write");
    });

    it("should refuse a rotation too large to turn by with an InputError naming the rotation, before anything is written", () => {
        // Arrange
        const model = storeyModel();
        const rotationBeyondRadians = 1e308;

        // Act
        const error = errorFrom(() => ifc.elements.add({ model, storey: "ground", body: recipeOf([cylinderNode()], SEAM), rotation: rotationBeyondRadians }));

        // Assert
        expect(error).toBeInstanceOf(InputError);
        expect(error).toMatchObject({ property: "rotation", message: "The rotation in degrees is too large to turn by, got 1e+308: give the same turn within 360 degrees" });
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const model = storeyModel();
        const before = modelOf(model).size;

        // Act
        ifc.elements.add({ model, storey: "ground", body: recipeOf([cylinderNode()], SEAM) });

        // Assert
        expect(modelOf(model).size).toBe(before);
    });
});
