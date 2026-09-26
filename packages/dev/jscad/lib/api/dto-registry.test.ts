import { describe, it, expect, beforeAll } from "vitest";
import { Jscad } from "./jscad-service";
import { jscadDtoRegistry } from "./dto-registry";
import { jscadDtoRules } from "./validation";
import { getJscad } from "./__test__/kernel";
import { InputIssue, resolveInputs, validateInputs } from "@bitbybit-dev/base";
import * as Inputs from "./inputs";

const methodAt = (root: object, path: string): unknown => path.split(".").reduce<unknown>((owner, segment) => (owner === null || owner === undefined ? undefined : Reflect.get(owner, segment)), root);

describe("the JSCAD operation registry", () => {
    let jscad: Jscad;

    beforeAll(async () => {
        ({ jscad } = await getJscad());
    });

    it("should name a kernel method for every listed path", () => {
        // Act
        const missing = Object.keys(jscadDtoRegistry).filter((path) => typeof methodAt(jscad, path) !== "function");

        // Assert
        expect(missing).toEqual([]);
    });

    it("should list only DTO classes that construct with no arguments", () => {
        // Act
        const built = Object.values(jscadDtoRegistry).flatMap((entry) => [...(entry.dto ? [new entry.dto()] : []), ...Object.values(entry.nested ?? {}).map((Nested) => new Nested())]);

        // Assert
        expect(built.every((dto) => typeof dto === "object")).toBe(true);
    });
    it("should give a DTO the defaults its shared parent declares, and let its constructor fill them", () => {
        // Act
        const byDefault = new Inputs.JSCAD.CuboidCentersDto();
        const given = new Inputs.JSCAD.CuboidCentersDto([[0, 0, 0]], 2, 3, 4);

        // Assert
        expect([byDefault.width, byDefault.length, byDefault.height]).toEqual([1, 1, 1]);
        expect([given.width, given.length, given.height]).toEqual([2, 3, 4]);
    });

    it("should fill a property inherited from the shared parent when a call leaves it out", () => {
        // Act
        const inputs = resolveInputs(jscadDtoRegistry, "shapes.cuboidsOnCenterPoints", { centers: [[0, 0, 0]], width: 2 });

        // Assert
        expect(inputs).toEqual({ centers: [[0, 0, 0]], width: 2, length: 1, height: 1 });
    });
    it("should find nothing wrong with the defaults of the DTO each operation takes", () => {
        // Act
        const issues = Object.entries(jscadDtoRegistry).flatMap(([path, entry]) => (entry.dto ? validateInputs(jscadDtoRegistry, path, new entry.dto(), jscadDtoRules) : [])
            .filter((found) => found.code !== "required")
            .map((found) => `${path} ${found.property} ${found.code}`));

        // Assert
        expect(issues).toEqual([]);
    });
});

const A_SOLID = { polygons: [], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] };
const issuesOf = (path: string, inputs: object): InputIssue[] => validateInputs(jscadDtoRegistry, path, resolveInputs(jscadDtoRegistry, path, inputs), jscadDtoRules);

const constraintRows: [path: string, what: string, inputs: object, issues: InputIssue[]][] = [
    ["booleans.intersect", "report the meshes it requires when the call leaves them out", {}, [{ property: "meshes", code: "required", message: "is required" }]],
    ["shapes.cube", "report a size that is not a number", { size: Number.NaN }, [{ property: "size", code: "not-a-number", message: "is not a number (NaN)" }]],
    ["shapes.cube", "report a size below its inclusive minimum", { size: -1 }, [{ property: "size", code: "minimum", params: { limit: 0, exclusive: false, actual: -1 }, message: "must be at least 0" }]],
    ["shapes.cube", "pass a size exactly at its inclusive minimum", { size: 0 }, []],
    ["shapes.cube", "report a center of two coordinates where three are needed", { center: [0, 0] }, [{ property: "center", code: "arity", params: { expected: 3, actual: 2 }, message: "must have 3 numbers, not 2" }]],
    ["polygon.circle", "report a center of three coordinates where two are needed", { center: [0, 0, 0] }, [{ property: "center", code: "arity", params: { expected: 2, actual: 3 }, message: "must have 2 numbers, not 3" }]],
    ["polygon.createFromPoints", "pass points of two and of three coordinates alike", { points: [[0, 0], [1, 0, 0], [1, 1]] }, []],
    ["polygon.createFromPoints", "report a point of a single coordinate", { points: [[0, 0], [1, 0, 0], [1]] }, [{ property: "points", code: "arity", params: { expected: [2, 3], actual: 1, index: 2 }, message: "item 2 must have 2 or 3 numbers, not 1" }]],
    ["text.createVectorText", "report an alignment it does not know", { text: "a", align: "justify" }, [{ property: "align", code: "enum", params: { allowed: ["left", "center", "right"] }, message: "must be one of left, center, right" }]],
    ["hulls.isConvex", "pass a solid it is given", { mesh: A_SOLID }, []],
];

describe("what the generated JSCAD constraints refuse", () => {
    it.each(constraintRows)("%s should %s", (path, _what, inputs, issues) => {
        // Act
        const found = issuesOf(path, inputs);

        // Assert
        expect(found).toEqual(issues);
    });
});
