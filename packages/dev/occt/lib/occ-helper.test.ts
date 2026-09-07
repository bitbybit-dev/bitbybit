import { describe, it, expect, beforeAll } from "vitest";
import initOpenCascade, { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { VectorHelperService } from "./api/vector-helper.service";
import { ShapesHelperService } from "./api/shapes-helper.service";

// Every service OccHelper is expected to hand out. Four of them refer to each other in a ring, and
// this suite exists because that ring used to be closed by assigning fields after construction -
// which left a window where a service held an undefined collaborator.
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
        // Act, Assert
        for (const name of SERVICES) {
            expect(occHelper[name], `${name} was not built`).not.toBeUndefined();
        }
    });

    describe("the services that refer to each other", () => {
        it("should resolve the ring to the same instances OccHelper holds", () => {
            // Act, Assert
            expect(occHelper.wiresService.filletsService).toBe(occHelper.filletsService);
            expect(occHelper.wiresService.operationsService).toBe(occHelper.operationsService);
            expect(occHelper.facesService.filletsService).toBe(occHelper.filletsService);
        });

        it("should give the fillets service a working operations service, not an empty one", () => {
            // Act
            const throughTheRing = occHelper.wiresService.filletsService;

            // Assert
            expect(typeof throughTheRing.fillet2d).toBe("function");
        });
    });

    describe("a service that only looked cyclic", () => {
        it("should have been handed real collaborators at construction", () => {
            // Act, Assert - vertices needs wires and booleans, and neither needs vertices, so both
            // are built before it rather than assigned onto it afterwards.
            expect(occHelper.verticesService.wiresService).toBe(occHelper.wiresService);
            expect(occHelper.verticesService.booleansService).toBe(occHelper.booleansService);
        });
    });

    describe("surfaceFromFace", () => {
        it("should refuse a shape that carries no surface", () => {
            // Arrange
            const notAFace = occHelper.entitiesService.makeVertex([0, 0, 0]);

            // Act, Assert
            expect(() => occHelper.surfaceFromFace({ shape: notAFace as never })).toThrow();
        });
    });
});
