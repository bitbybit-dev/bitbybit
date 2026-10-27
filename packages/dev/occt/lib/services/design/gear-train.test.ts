import { beforeAll, describe, expect, it } from "vitest";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";

const GEAR_ID = "33333333-3333-4333-8333-333333333333";
const DRIVER_PITCH = 360 / 20;

const gearPart: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    id: GEAR_ID,
    parameters: {
        module: { value: 2, unit: "mm", min: 0.1 },
        teeth: { value: 20, unit: "none", min: 3, step: 1 },
        width: { value: 6, unit: "mm", min: 0.1 },
        bore: { value: 6, unit: "mm", min: 0.1 },
        backlash: { value: 0.1, unit: "mm", min: 0 },
    },
    features: [
        {
            id: "profile",
            type: "sketch",
            on: { plane: "XZ" },
            loops: [
                { pen: [{ type: "gear", id: "teeth", centre: [0, 0], module: "module", teeth: "teeth", backlash: "backlash" }] },
                { pen: [{ type: "circle", id: "bore", centre: [0, 0], radius: "bore / 2" }] },
            ],
        },
        { id: "gear", type: "extrude", profile: "profile", distance: "width" },
    ],
    parts: [{ id: "gear", body: "gear", connectors: [{ id: "axis", on: { of: "gear", role: "start" } }] }],
};

const train = (centreDistance: number): Models.OCCT.DesignAssemblyDocument => ({
    schemaVersion: 1,
    kind: "assembly",
    parameters: { turn: 0 },
    components: [
        { id: "driver", source: { document: GEAR_ID, part: "gear" } },
        { id: "driven", source: { document: GEAR_ID, part: "gear", parameters: { teeth: 30 } } },
    ],
    joints: [
        { id: "driverAxle", type: "revolute", component: "driver", connector: "axis", to: { frame: { origin: [0, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] } }, angle: "turn" },
        { id: "drivenAxle", type: "revolute", component: "driven", connector: "axis", to: { frame: { origin: [centreDistance, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] } }, angle: "180 / 30 - turn * 20 / 30" },
    ],
});

describe("OCCT design: a gear train of gear part documents", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const worstOverlap = (centreDistance: number, shares: readonly number[]): number => {
        const document = train(centreDistance);
        const overlaps = shares.map(share => {
            const clashes = occt.design.clashes({ document, documents: [gearPart], parameters: { turn: share * DRIVER_PITCH } });
            return clashes.reduce((worst, clash) => Math.max(worst, clash.volume), 0);
        });
        return Math.max(...overlaps);
    };

    it("should turn two gears on revolute joints half the module times their teeth together apart without a clash through a pitch, which repeats through the whole turn", () => {
        // Act
        const worst = worstOverlap(50, [0, 0.25, 0.5, 0.75, 1]);

        // Assert
        expect(worst).toBe(0);
    }, 180_000);

    it("should clash when the joints hold them a millimetre closer than that", () => {
        // Act
        const worst = worstOverlap(49, [0]);

        // Assert
        expect(worst).toBeGreaterThan(1);
    }, 180_000);
});
