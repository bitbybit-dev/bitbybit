import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { checkRecipe, InputError } from "@bitbybit-dev/base";
import type { Base } from "@bitbybit-dev/base";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTService } from "../../occ-service";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTAssemblyManager } from "../assembly/manager";
import { OCCTRecipes } from "./recipes";

const RELATIVE = 1e-6;
const ORIGIN: Base.Point3 = [0, 0, 0];
const UP: Base.Vector3 = [0, 1, 0];

describe("OCCTRecipes.describe and the exact brep step", () => {
    let occ: BitbybitOcctModule;
    let occt: OCCTService;
    const shapes: TopoDS_Shape[] = [];

    beforeAll(async () => {
        occ = await createBitbybitOcct();
        occt = new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ));
    });

    afterEach(() => {
        shapes.splice(0).forEach((shape) => shape.delete());
    });

    function kept<T extends TopoDS_Shape>(shape: T): T {
        shapes.push(shape);
        return shape;
    }

    function volumeOf(shape: TopoDS_Shape): number {
        const solids = occt.shapes.solid.getSolids({ shape });
        const volume = solids.reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
        solids.forEach((solid) => solid.delete());
        return volume;
    }

    function rebuilt(shape: TopoDS_Shape): { recipe: Base.Recipe; again: TopoDS_Shape } {
        const recipe = occt.recipes.describe({ shape });
        const [again] = occt.recipes.build({ recipe });
        return { recipe, again: kept(again!) };
    }

    it("should describe a box as eight vertices, twelve line edges and six plane faces, and build it back", () => {
        // Arrange
        const box = kept(occt.shapes.solid.createBox({ width: 1, length: 2, height: 3, center: ORIGIN }));

        // Act
        const { recipe, again } = rebuilt(box);

        // Assert
        expect(checkRecipe(recipe)).toEqual([]);
        const node = recipe.nodes[0]!;
        if (node.op !== "brep") {
            throw new Error("not a brep step");
        }
        expect(node.vertices[1]).toBe(8 * 3);
        expect(node.edges).toHaveLength(12);
        expect(node.curves.every((curve) => curve.kind === "line")).toBe(true);
        expect(node.surfaces.map((surface) => surface.kind)).toEqual(Array(6).fill("plane"));
        expect(node.closed).toBe(true);
        expect(volumeOf(again)).toBeCloseTo(6, 9);
    });

    it.each([
        ["cylinder", (s: OCCTService): TopoDS_Shape => s.shapes.solid.createCylinder({ radius: 2, height: 5, center: ORIGIN, direction: UP }), Math.PI * 4 * 5, "cylinder"],
        ["cone", (s: OCCTService): TopoDS_Shape => s.shapes.solid.createCone({ radius1: 2, radius2: 1, height: 3, angle: 360, center: ORIGIN, direction: UP }), Math.PI * 3 * (4 + 2 + 1) / 3, "cone"],
        ["sphere", (s: OCCTService): TopoDS_Shape => s.shapes.solid.createSphere({ radius: 2, center: ORIGIN }), (4 / 3) * Math.PI * 8, "sphere"],
        ["torus", (s: OCCTService): TopoDS_Shape => s.shapes.solid.createTorus({ majorRadius: 3, minorRadius: 1, center: ORIGIN, direction: UP }), 2 * Math.PI * Math.PI * 3 * 1, "torus"],
    ])("should keep a %s's surface as it is and build back its volume", (_name, make, volume, kind) => {
        // Arrange
        const shape = kept(make(occt));

        // Act
        const { recipe, again } = rebuilt(shape);

        // Assert
        const node = recipe.nodes[0]!;
        expect(node.op === "brep" && node.surfaces.map((surface) => surface.kind)).toContain(kind);
        expect(volumeOf(again) / volume).toBeCloseTo(1, 6);
    });

    it("should build back a filleted box, whose rounds are surfaces of other kinds, to its volume and face count", () => {
        // Arrange
        const box = kept(occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: ORIGIN }));
        const filleted = kept(occt.fillets.filletEdges({ shape: box, radius: 0.5 }));

        // Act
        const { again } = rebuilt(filleted);

        // Assert
        expect(Math.abs(volumeOf(again) / volumeOf(filleted) - 1)).toBeLessThan(RELATIVE * 10);
        const facesBefore = occt.shapes.face.getFaces({ shape: filleted });
        const facesAfter = occt.shapes.face.getFaces({ shape: again });
        expect(facesAfter).toHaveLength(facesBefore.length);
        [...facesBefore, ...facesAfter].forEach((face) => face.delete());
    });

    it("should build back two solids of a compound as two solids, neither a cavity of the other", () => {
        // Arrange
        const first = kept(occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: ORIGIN }));
        const second = kept(occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [3, 0, 0] }));
        const compound = kept(occt.shapes.compound.makeCompound({ shapes: [first, second] }));

        // Act
        const { again } = rebuilt(compound);

        // Assert
        const solids = occt.shapes.solid.getSolids({ shape: again });
        expect(solids).toHaveLength(2);
        solids.forEach((solid) => solid.delete());
        expect(volumeOf(again)).toBeCloseTo(2, 9);
    });

    it("should record the unit it is given, and refuse a unit that is not a length above zero", () => {
        // Arrange
        const box = kept(occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: ORIGIN }));

        // Act
        const recipe = occt.recipes.describe({ shape: box, millimetresPerUnit: 1000 });
        const zero = (): unknown => occt.recipes.describe({ shape: box, millimetresPerUnit: 0 });

        // Assert
        expect(recipe.millimetresPerUnit).toBe(1000);
        expect(zero).toThrow(InputError);
    });

    it("should name a null shape, and say a kernel without the describer cannot describe", () => {
        // Arrange
        const older = Object.create(occ, { DescribeShapeExact: { value: undefined } }) as BitbybitOcctModule;
        const helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ);
        const olderRecipes = new OCCTRecipes(older, helper, new OCCTAssemblyManager(older, helper));
        const box = kept(occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: ORIGIN }));

        // Act
        const nullShape = (): unknown => occt.recipes.describe({ shape: new occ.TopoDS_Shape() });
        const tooOld = (): unknown => olderRecipes.describe({ shape: box });

        // Assert
        expect(nullShape).toThrow("DescribeShapeExact: the shape is null");
        expect(tooOld).toThrow("This OpenCascade kernel cannot describe shapes exactly; a newer kernel can.");
    });
});
