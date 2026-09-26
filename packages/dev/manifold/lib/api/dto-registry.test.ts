import { describe, it, expect, beforeAll } from "vitest";
import { ManifoldService } from "./manifold-service";
import { manifoldDtoRegistry } from "./dto-registry";
import { validateInputs } from "@bitbybit-dev/base";
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
