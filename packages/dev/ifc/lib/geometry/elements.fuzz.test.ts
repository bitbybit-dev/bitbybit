import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { Recipes, type Base } from "@bitbybit-dev/base";
import { cross3, dot3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { IFCService } from "../api/ifc-service";
import type { IfcModel } from "../model/model-types";
import { formatReal } from "../step/numbers";
import { productRows, withContext } from "../__test__/geometry-fixtures";

const SEED = 1066;
const RUNS = 1500;
const ifc = new IFCService();
const RECIPES = new Recipes();
const PRODUCT = "0YvctVUKr0kugbFTf53O9L";
const OTHER_PRODUCT = "1YvctVUKr0kugbFTf53O9L";
const NO_DIRECTION = "A direction needs a finite length above zero";
const NO_SQUARE_X = "A frame's X direction has no part square to its Z axis";
const FRAME_REFUSALS = [NO_DIRECTION, NO_SQUARE_X];
const BUILT_ABOVE_SINE = 1e-8;
const ROUNDING = 4e-16;
const AXIS_SLACK = 1e-12;
const PROJECT_ROWS = [
    "#90=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);",
    "#91=IFCUNITASSIGNMENT((#90));",
    "#92=IFCPROJECT('2YvctVUKr0kugbFTf53O9L',$,'Project',$,$,$,$,(#3),#91);",
];
const COSINE_OF_A_HALF_TURN_AS_EXPORTERS_WRITE_IT: Base.Vector3 = [-1, 1.2246467991473532e-16, 0];
const AXIS_ALONG_THREE_WAYS: Base.Vector3 = [1, 2, 3];
const HINT_ALONG_THE_AXIS_BUT_FOR_ROUNDING: Base.Vector3 = [2, 4, 6.000000000001];

type Direction = Base.Vector3 | undefined;

function unit(vector: Base.Vector3): Base.Vector3 | undefined {
    const largest = Math.max(...vector.map(Math.abs));
    if (!(largest > 0)) {
        return undefined;
    }
    const scaled = vector.map((value) => value / largest);
    const size = Math.hypot(...scaled);
    return [scaled[0]! / size, scaled[1]! / size, scaled[2]! / size];
}

function gap(a: readonly number[], b: readonly number[]): number {
    return Math.hypot(...a.map((value, index) => value - b[index]!));
}

interface BuiltAxes {
    readonly x: Base.Vector3;
    readonly z: Base.Vector3;
    readonly sine: number;
}

function axesIfcBuilds(axis: Direction, refDirection: Direction): BuiltAxes | undefined {
    const z = axis === undefined ? [0, 0, 1] as Base.Vector3 : unit(axis);
    if (z === undefined) {
        return undefined;
    }
    const isAlongX = z[1] === 0 && z[2] === 0;
    const hint = refDirection === undefined ? (isAlongX ? [0, 1, 0] as Base.Vector3 : [1, 0, 0] as Base.Vector3) : unit(refDirection);
    if (hint === undefined) {
        return undefined;
    }
    const across = cross3(z, hint);
    const x = unit(cross3(across, z));
    return x === undefined ? undefined : { x, z, sine: Math.hypot(...across) };
}

function ratios(direction: Base.Vector3): string {
    return direction.map(formatReal).join(",");
}

function placedProduct(axis: Direction, refDirection: Direction): string[] {
    return [
        ...PROJECT_ROWS,
        "#10=IFCCARTESIANPOINT((100.,200.,300.));",
        ...(axis === undefined ? [] : [`#11=IFCDIRECTION((${ratios(axis)}));`]),
        ...(refDirection === undefined ? [] : [`#12=IFCDIRECTION((${ratios(refDirection)}));`]),
        `#13=IFCAXIS2PLACEMENT3D(#10,${axis === undefined ? "$" : "#11"},${refDirection === undefined ? "$" : "#12"});`,
        "#14=IFCLOCALPLACEMENT($,#13);",
        "#20=IFCBLOCK(#2,1000.,500.,250.);",
        ...productRows(30, PRODUCT, "#20", "#14"),
    ];
}

function fileWithPlacement(axis: Direction, refDirection: Direction): IfcModel {
    return withContext(placedProduct(axis, refDirection));
}

function axesOf(matrix: Base.TransformMatrix): { x: Base.Vector3; y: Base.Vector3; z: Base.Vector3 } {
    return { x: [matrix[0], matrix[1], matrix[2]], y: [matrix[4], matrix[5], matrix[6]], z: [matrix[8], matrix[9], matrix[10]] };
}

function isOrthonormalRightHanded(matrix: Base.TransformMatrix): boolean {
    const { x, y, z } = axesOf(matrix);
    const errors = [dot3(x, x) - 1, dot3(y, y) - 1, dot3(z, z) - 1, dot3(x, y), dot3(y, z), dot3(z, x), gap(cross3(x, y), z)].map(Math.abs);
    return errors.every((error) => error <= AXIS_SLACK);
}

const component = fc.oneof(
    fc.double({ min: -10, max: 10, noNaN: true }),
    fc.constantFrom(0, 1, -1, 1e-16, -1.2246467991473532e-16, 6.123233995736766e-17, 1e-300, 1e300, 0.5, -0.25),
);
const written3 = fc.tuple(component, component, component);
const axisOrNone = fc.option(written3, { nil: undefined });

function isBuiltAsIfcBuildsIt(axis: Direction, refDirection: Direction): boolean {
    const model = fileWithPlacement(axis, refDirection);
    const recipe = ifc.geometry.recipe({ model });
    const problems = ifc.geometry.unsupported({ model, elements: [PRODUCT] });
    const expected = axesIfcBuilds(axis, refDirection);
    if (RECIPES.check({ recipe }).length !== 0) {
        return false;
    }
    if (recipe.roots.length === 0) {
        return problems.length === 1 && FRAME_REFUSALS.includes(problems[0]!.message) && (expected === undefined || expected.sine < BUILT_ABOVE_SINE);
    }
    const built = axesOf(recipe.roots[0]!.matrix);
    return expected !== undefined
        && isOrthonormalRightHanded(recipe.roots[0]!.matrix)
        && gap(built.z, expected.z) <= AXIS_SLACK
        && (expected.sine < BUILT_ABOVE_SINE || gap(built.x, expected.x) <= ROUNDING / expected.sine + AXIS_SLACK);
}

describe("placements read from other tools' files, with directions of every length and slant", () => {
    it("should build a product with the axes IFC builds from a RefDirection the file writes, or report it as a frame it cannot square, and never throw", () => {
        // Arrange
        const written = fc.oneof(fc.tuple(axisOrNone, written3), fc.constant<[Direction, Direction]>([undefined, undefined]));
        const property = fc.property(written, ([axis, refDirection]) => isBuiltAsIfcBuildsIt(axis, refDirection));

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should build every product whose axis has a length when its RefDirection is left to IFC's default, X square to the axis", () => {
        // Arrange
        const property = fc.property(written3, (axis) => isBuiltAsIfcBuildsIt(axis, undefined) && ifc.geometry.recipe({ model: fileWithPlacement(axis, undefined) }).roots.length === (unit(axis) === undefined ? 0 : 1));

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should report a product whose X direction lies along its axis but for rounding, naming the X direction, and build none", () => {
        // Arrange
        const model = fileWithPlacement(AXIS_ALONG_THREE_WAYS, HINT_ALONG_THE_AXIS_BUT_FOR_ROUNDING);

        // Act
        const recipe = ifc.geometry.recipe({ model });
        const problems = ifc.geometry.unsupported({ model, elements: [PRODUCT] });

        // Assert
        expect(recipe.roots).toEqual([]);
        expect(problems.map((problem) => problem.message)).toEqual([NO_SQUARE_X]);
    });

    it("should still build every other product of a file when one product's placement cannot be squared", () => {
        // Arrange
        const rows = [...placedProduct(AXIS_ALONG_THREE_WAYS, HINT_ALONG_THE_AXIS_BUT_FOR_ROUNDING), ...productRows(40, OTHER_PRODUCT, "#20")];

        // Act
        const recipe = ifc.geometry.recipe({ model: withContext(rows) });

        // Assert
        expect(recipe.roots.map((root) => root.tag["globalId"])).toEqual([OTHER_PRODUCT]);
    });

    it("should build a product placed by directions of any length as it builds one placed by unit directions", () => {
        // Arrange
        const lengthened = fileWithPlacement([0, 0, 2], [3, 0, 0]);

        // Act
        const built = axesOf(ifc.geometry.recipe({ model: lengthened }).roots[0]!.matrix);

        // Assert
        expect(built).toEqual({ x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] });
    });

    it("should build a product whose axis is the X axis turned a half turn, as exporters write it, with RefDirection left to IFC's default", () => {
        // Arrange
        const model = fileWithPlacement(COSINE_OF_A_HALF_TURN_AS_EXPORTERS_WRITE_IT, undefined);

        // Act
        const recipe = ifc.geometry.recipe({ model });
        const problems = ifc.geometry.unsupported({ model, elements: [PRODUCT] });

        // Assert
        expect(problems).toEqual([]);
        expect(gap(axesOf(recipe.roots[0]!.matrix).x, [0, 1, 0])).toBeLessThanOrEqual(AXIS_SLACK);
        expect(gap(axesOf(recipe.roots[0]!.matrix).z, [-1, 0, 0])).toBeLessThanOrEqual(AXIS_SLACK);
    });
});
