import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { KernelSteps } from "@bitbybit-dev/base";
import { setKernelStepSink } from "@bitbybit-dev/base";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";

const PLATE_ID = "11111111-1111-4111-8111-111111111111";
const POST_ID = "22222222-2222-4222-8222-222222222222";
const PAIR_ID = "33333333-3333-4333-8333-333333333333";

const square = (id: string, width: number | string, depth: number | string): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on: { plane: "XY" },
    pen: [{ type: "hLine", length: width }, { type: "vLine", length: depth }, { type: "hLine", length: `-(${width})` }, { type: "close" }],
});

const plate: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    id: PLATE_ID,
    features: [square("base", 40, 20), { id: "plate", type: "extrude", profile: "base", distance: 10 }],
    parts: [{ id: "plate", body: "plate", connectors: [{ id: "top", on: { of: "plate", role: "end" }, origin: [20, 10, 10] }] }],
};

const post: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    id: POST_ID,
    parameters: { height: 6 },
    features: [square("base", 4, 4), { id: "post", type: "extrude", profile: "base", distance: "height" }, { id: "edge", type: "chamfer", body: "post", distance: 0.5, edges: { between: [{ of: "post", role: "end" }, { of: "post", role: "side" }], count: 4 } }],
    parts: [{ id: "post", body: "post", connectors: [{ id: "bottom", on: { of: "post", role: "start" } }] }],
};

const pair: Models.OCCT.DesignAssemblyDocument = {
    schemaVersion: 1,
    kind: "assembly",
    id: PAIR_ID,
    components: [
        { id: "plate", source: { document: PLATE_ID, part: "plate" } },
        { id: "short", source: { document: POST_ID, part: "post" } },
        { id: "again", source: { document: POST_ID, part: "post" } },
        { id: "tall", source: { document: POST_ID, part: "post", parameters: { height: 9 } } },
    ],
    joints: [
        { id: "shortOnPlate", type: "fastened", component: "short", connector: "bottom", to: { component: "plate", connector: "top" } },
        { id: "againOnPlate", type: "fastened", component: "again", connector: "bottom", to: { component: "plate", connector: "top" } },
        { id: "tallOnPlate", type: "fastened", component: "tall", connector: "bottom", to: { component: "plate", connector: "top" } },
    ],
};

describe("how far a design build has come", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    afterEach(() => {
        setKernelStepSink();
    });

    it("should report each feature of a part document as a step of the build, from none done", () => {
        // Arrange
        const steps: KernelSteps[] = [];
        setKernelStepSink(report => steps.push(report));

        // Act
        occt.design.build({ document: post });

        // Assert
        expect(steps).toEqual([{ done: 0, total: 3 }, { done: 1, total: 3 }, { done: 2, total: 3 }, { done: 3, total: 3 }]);
    });

    it("should expect the features of each document an assembly reaches, adding a document's features again for each further set of values it builds", () => {
        // Arrange
        const steps: KernelSteps[] = [];
        setKernelStepSink(report => steps.push(report));

        // Act
        const built = occt.design.build({ document: pair, documents: [plate, post] });

        // Assert
        expect(built.report.every(entry => entry.status === "ok")).toBe(true);
        expect(steps[0]).toEqual({ done: 0, total: 5 });
        expect(steps.at(-1)).toEqual({ done: 8, total: 8 });
        expect(steps.map(report => report.done)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        expect(steps.every(report => report.done <= report.total)).toBe(true);
    });
});
