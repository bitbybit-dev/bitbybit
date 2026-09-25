import { describe, it, expect, beforeAll } from "vitest";
import { Jscad } from "./jscad-service";
import { jscadDtoRegistry } from "./dto-registry";
import { getJscad } from "./__test__/kernel";

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
});
