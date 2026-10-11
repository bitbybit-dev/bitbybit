import { describe, it, expect, beforeAll } from "vitest";
import type { ManifoldService } from "./manifold-service";
import { manifoldDtoRegistry } from "./dto-registry";
import type { InputIssue } from "@bitbybit-dev/base";
import { resolveInputs, validateInputs } from "@bitbybit-dev/base";
import { getManifold } from "./__test__/kernel";

const methodAt = (root: object, path: string): unknown => path.split(".").reduce<unknown>((owner, segment) => (owner === null || owner === undefined ? undefined : Reflect.get(owner, segment)), root);

describe("the Manifold operation registry", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        manifold = await getManifold();
    });

    it("should name a kernel method for every listed path", () => {
        // Act
        const missing = Object.keys(manifoldDtoRegistry).filter((path) => typeof methodAt(manifold, path) !== "function");

        // Assert
        expect(missing).toEqual([]);
    });

    it("should list only DTO classes that construct with no arguments", () => {
        // Act
        const built = Object.values(manifoldDtoRegistry).flatMap((entry) => [...(entry.dto ? [new entry.dto()] : []), ...Object.values(entry.nested ?? {}).map((Nested) => new Nested())]);

        // Assert
        expect(built.every((dto) => typeof dto === "object")).toBe(true);
    });
    it("should find nothing wrong with the defaults of the DTO each operation takes", () => {
        // Act
        const issues = Object.entries(manifoldDtoRegistry).flatMap(([path, entry]) => (entry.dto ? validateInputs(manifoldDtoRegistry, path, new entry.dto()) : [])
            .filter((found) => found.code !== "required")
            .map((found) => `${path} ${found.property} ${found.code}`));

        // Assert
        expect(issues).toEqual([]);
    });
});

const M = { hash: 1, type: "manifold-shape" };
const issuesOf = (path: string, inputs: object): InputIssue[] => validateInputs(manifoldDtoRegistry, path, resolveInputs(manifoldDtoRegistry, path, inputs));

const constraintRows: [path: string, what: string, inputs: object, issues: InputIssue[]][] = [
    ["manifold.transforms.translate", "report the manifold and vector it requires when the call leaves them out", {}, [
        { property: "manifold", code: "required", message: "is required" },
        { property: "vector", code: "required", message: "is required" },
    ]],
    ["manifold.transforms.translate", "report a vector of two coordinates where three are needed", { manifold: M, vector: [1, 0] }, [{ property: "vector", code: "arity", params: { expected: 3, actual: 2 }, message: "must have 3 numbers, not 2" }]],
    ["manifold.shapes.sphere", "report a radius that is not a number", { radius: Number.NaN }, [{ property: "radius", code: "not-a-number", message: "is not a number (NaN)" }]],
    ["manifold.shapes.sphere", "pass a radius exactly at its inclusive minimum", { radius: 0 }, []],
    ["crossSection.operations.revolve", "report a revolution below its exclusive minimum", { crossSection: M, revolveDegrees: -90 }, [{ property: "revolveDegrees", code: "minimum", params: { limit: 0, exclusive: true, actual: -90 }, message: "must be above 0" }]],
    ["crossSection.operations.revolve", "report a revolution exactly at its exclusive minimum", { crossSection: M, revolveDegrees: 0 }, [{ property: "revolveDegrees", code: "minimum", params: { limit: 0, exclusive: true, actual: 0 }, message: "must be above 0" }]],
    ["crossSection.operations.revolve", "pass a revolution just above its exclusive minimum", { crossSection: M, revolveDegrees: 1e-9 }, []],
    ["crossSection.operations.offset", "report a miter limit below a minimum that is not 0", { crossSection: M, miterLimit: 1.5 }, [{ property: "miterLimit", code: "minimum", params: { limit: 2, exclusive: false, actual: 1.5 }, message: "must be at least 2" }]],
    ["crossSection.operations.offset", "report a join type it does not know", { crossSection: M, joinType: "Rounded" }, [{ property: "joinType", code: "enum", params: { allowed: ["Square", "Round", "Miter", "Bevel"] }, message: "must be one of Square, Round, Miter, Bevel" }]],
    ["crossSection.crossSectionFromPoints", "report a fill rule it does not know", { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]], fillRule: "Everything" }, [{ property: "fillRule", code: "enum", params: { allowed: ["EvenOdd", "NonZero", "Positive", "Negative"] }, message: "must be one of EvenOdd, NonZero, Positive, Negative" }]],
];

describe("what the generated Manifold constraints refuse", () => {
    it.each(constraintRows)("%s should %s", (path, _what, inputs, issues) => {
        // Act
        const found = issuesOf(path, inputs);

        // Assert
        expect(found).toEqual(issues);
    });
});
