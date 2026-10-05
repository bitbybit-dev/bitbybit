import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import initOpenCascade from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { VectorHelperService } from "./api/vector-helper.service";
import { ShapesHelperService } from "./api/shapes-helper.service";

const SERVICES = [
    "base", "iteratorService", "converterService", "entitiesService", "geomService",
    "shapeGettersService", "transformsService", "enumService", "verticesService", "booleansService",
    "edgesService", "wiresService", "facesService", "shellsService", "solidsService",
    "operationsService", "filletsService", "meshingService", "dimensionsService", "dxfService",
] as const;

describe("OccHelper", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
    }, 120_000);

    it("should hand out every service, fully built", () => {
        for (const name of SERVICES) {
            expect(occHelper[name], `${name} was not built`).not.toBeUndefined();
        }
    });

    describe("the services that refer to each other", () => {
        it("should resolve the ring to the same instance OccHelper holds", () => {
            expect(occHelper.wiresService.operationsService).toBe(occHelper.operationsService);
        });

        it("should give the wires service a working operations service, not an empty one", () => {
            // Act
            const throughTheRing = occHelper.wiresService.operationsService;

            // Assert
            expect(typeof throughTheRing.boundingBoxOfShape).toBe("function");
        });
    });

    describe("surfaceFromFace", () => {
        it("should refuse a shape that carries no surface", () => {
            // Arrange
            const notAFace = occHelper.entitiesService.makeVertex([0, 0, 0]);

            expect(() => occHelper.surfaceFromFace({ shape: notAFace })).toThrow();
        });
    });
});
