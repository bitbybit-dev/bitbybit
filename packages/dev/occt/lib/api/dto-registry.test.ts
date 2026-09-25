import { describe, it, expect, beforeAll } from "vitest";
import { resolveInputs, withDefaults } from "@bitbybit-dev/base";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { OCCTService } from "../occ-service";
import { VectorHelperService } from "./vector-helper.service";
import { ShapesHelperService } from "./shapes-helper.service";
import { occtDtoRegistry } from "./dto-registry";
import * as Inputs from "./inputs";

const methodAt = (root: object, path: string): unknown => path.split(".").reduce<unknown>((owner, segment) => (owner === null || owner === undefined ? undefined : Reflect.get(owner, segment)), root);

describe("the OCCT operation registry", () => {
    let service: OCCTService;

    beforeAll(async () => {
        const occ = await createBitbybitOcct();
        service = new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ));
    });

    it("should name a kernel method for every listed path", () => {
        // Act
        const missing = Object.keys(occtDtoRegistry).filter((path) => typeof methodAt(service, path) !== "function");

        // Assert
        expect(missing).toEqual([]);
    });

    it("should list only DTO classes that construct with no arguments", () => {
        // Act
        const built = Object.values(occtDtoRegistry).flatMap((entry) => (entry.dto ? [new entry.dto()] : []));

        // Assert
        expect(built.every((dto) => typeof dto === "object")).toBe(true);
    });

    it("should resolve a call that leaves defaults out to the fully spelled DTO", () => {
        // Act
        const resolved = resolveInputs(occtDtoRegistry, "shapes.solid.createBox", { width: 4 });

        // Assert
        expect(resolved).toEqual({ ...new Inputs.OCCT.BoxDto(), width: 4 });
    });

    it("should let a kernel used in the same thread build from a call that leaves defaults out", () => {
        // Arrange
        const kernel = withDefaults(service, occtDtoRegistry);

        // Act
        const box = kernel.shapes.solid.createBox({ width: 4 } as Inputs.OCCT.BoxDto);
        const volume = kernel.shapes.solid.getSolidVolume({ shape: box });

        // Assert
        expect(volume).toBeCloseTo(4 * 2 * 3);
    });
});
