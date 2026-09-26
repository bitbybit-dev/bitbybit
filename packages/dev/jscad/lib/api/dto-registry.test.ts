import { describe, it, expect, beforeAll } from "vitest";
import { Jscad } from "./jscad-service";
import { jscadDtoRegistry } from "./dto-registry";
import { getJscad } from "./__test__/kernel";
import { resolveInputs } from "@bitbybit-dev/base";
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
});
