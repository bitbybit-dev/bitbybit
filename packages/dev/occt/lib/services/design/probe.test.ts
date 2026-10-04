import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";
import { DesignCache } from "./cache";
import { probeRounding } from "./probe";

type Document = Models.OCCT.DesignPartDocument;

const plate = (extra: Models.OCCT.DesignFeature[], parameters: NonNullable<Document["parameters"]> = { width: 40, depth: 20, height: 10 }): Document => ({
    schemaVersion: 1,
    parameters,
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: [
            { type: "hLine", id: "bottom", length: "width" },
            { type: "vLine", id: "right", length: "depth" },
            { type: "hLine", id: "top", length: "-(width)" },
            { type: "close", id: "left" },
        ] },
        { id: "plate", type: "extrude", profile: "base", distance: "height" },
        ...extra,
    ],
});

const top: Models.OCCT.DesignFaceReference = { of: "plate", role: "end", filter: { select: "facing", direction: [0, 0, 1] }, count: 1 };

const topEdges = (count: number): Models.OCCT.DesignEdgeReference => ({ between: [top, { of: "plate", role: "side" }], count });

describe("OCCT design fillet probe", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        const helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    it("should find the edges a fillet rounds and the largest radius that builds", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 2, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } }]);

        // Act
        const probe = occt.design.probeFillet({ document, feature: "round" });

        // Assert
        expect(probe.feature).toBe("round");
        expect(probe.type).toBe("fillet");
        expect(probe.between[0]).toHaveLength(1);
        expect(probe.between[1]).toHaveLength(4);
        expect(probe.edges).toHaveLength(4);
        expect(probe.edges.every(edge => edge.type === Inputs.OCCT.curveTypeEnum.line)).toBe(true);
        expect(probe.edges.map(edge => edge.length).sort((a, b) => a - b)).toEqual([20, 20, 40, 40].map(length => expect.closeTo(length, 6)));
        expect(probe.edges.every(edge => Math.abs(edge.midpoint[2] - 10) < 1e-6)).toBe(true);
        expect(probe.count).toBe(4);
        expect(probe.value).toBe(2);
        expect(probe.builds).toBe(true);
        expect(probe.attempts[0]).toEqual({ value: 2, builds: true, ms: expect.any(Number) });
        expect(probe.attempts.every(entry => entry.ms >= 0)).toBe(true);
        expect(probe.attempts.length).toBeLessThanOrEqual(16);
        expect(probe.largest).toBeGreaterThan(9.7);
        expect(probe.largest).toBeLessThan(10);
        expect(probe.smallestFailing).toBeGreaterThan(probe.largest!);
        expect(probe.smallestFailing! - probe.largest!).toBeLessThanOrEqual(probe.smallestFailing! * 0.02);
        expect(probe.attempts.length).toBeLessThan(16);
        expect(probe.messages).toEqual([]);
    });

    it("should list the edges a reference finds when its count is wrong", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 2, edges: topEdges(3) }]);

        // Act
        const probe = occt.design.probeFillet({ document, feature: "round" });

        // Assert
        expect(probe.count).toBe(3);
        expect(probe.edges).toHaveLength(4);
        expect(probe.edges.every(edge => Math.abs(edge.midpoint[2] - 10) < 1e-6)).toBe(true);
        expect(probe.messages).toEqual([`/features/2/edges: the reference expects 3 edges and finds 4 (${probe.edges.map(edge => edge.index).join(", ")})`]);
        expect(probe.builds).toBe(true);
    });

    it("should report a face reference whose count is wrong and still probe the edges", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 2, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side", count: 3 }], count: 4 } }]);

        // Act
        const probe = occt.design.probeFillet({ document, feature: "round", maxAttempts: 1 });

        // Assert
        expect(probe.messages).toEqual([`/features/2/edges/between/1: the reference expects 3 faces and finds 4 (${probe.between[1].join(", ")})`]);
        expect(probe.edges).toHaveLength(4);
    });

    it("should search down from a radius that does not build", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 50, edges: topEdges(4) }]);

        // Act
        const probe = occt.design.probeFillet({ document, feature: "round" });

        // Assert
        expect(probe.value).toBe(50);
        expect(probe.builds).toBe(false);
        expect(probe.attempts[0]!.value).toBe(50);
        expect(probe.attempts[0]!.builds).toBe(false);
        expect(probe.attempts[0]!.message).toEqual(expect.any(String));
        expect(probe.largest).toBeGreaterThan(0);
        expect(probe.smallestFailing).toBeGreaterThan(probe.largest!);
        expect(probe.attempts.filter(entry => !entry.builds).every(entry => typeof entry.message === "string" && entry.message.length > 0)).toBe(true);
    });

    it("should probe a chamfer by its distance", () => {
        // Arrange
        const document = plate([{ id: "bevel", type: "chamfer", body: "plate", distance: 1, edges: topEdges(4) }]);

        // Act
        const probe = occt.design.probeFillet({ document, feature: "bevel" });

        // Assert
        expect(probe.type).toBe("chamfer");
        expect(probe.value).toBe(1);
        expect(probe.builds).toBe(true);
        expect(probe.largest).toBeGreaterThan(1);
        expect(probe.smallestFailing).toBeGreaterThan(probe.largest!);
    });

    it("should build the features before it with the parameter values given", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: "corner", edges: topEdges(4) }], { width: 40, depth: 20, height: 10, corner: 1 });

        // Act
        const probe = occt.design.probeFillet({ document, feature: "round", parameters: { corner: 3, depth: 4 } });

        // Assert
        expect(probe.value).toBe(3);
        expect(probe.builds).toBe(false);
        expect(probe.largest).toBeLessThan(2);
    });

    it("should report a reference that finds no faces without trying any value", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 1, edges: { between: [{ of: "plate", role: "rim" }, { of: "plate", role: "side" }], count: 2 } }]);

        // Act
        const probe = occt.design.probeFillet({ document, feature: "round" });

        // Assert
        expect(probe.between[0]).toEqual([]);
        expect(probe.between[1]).toHaveLength(4);
        expect(probe.edges).toEqual([]);
        expect(probe.attempts).toEqual([]);
        expect(probe.builds).toBe(false);
        expect(probe.messages).toEqual(["/features/2/edges/between/0: the reference finds no faces"]);
    });

    it("should report a face reference to a suppressed feature", () => {
        // Arrange
        const document = plate([
            { id: "hole", type: "hole", body: "plate", on: top, diameter: 4, at: [[10, 10]], suppressed: true },
            { id: "round", type: "fillet", body: "plate", radius: 0.5, edges: { between: [{ of: "hole", role: "wall" }, { of: "plate", role: "end" }], count: 1 } },
        ]);

        // Act
        const probe = occt.design.probeFillet({ document, feature: "round" });

        // Assert
        expect(probe.messages).toEqual(["/features/3/edges/between/0: \"hole\" is suppressed, so it made no faces"]);
        expect(probe.attempts).toEqual([]);
    });

    it("should report a radius that cannot be evaluated and still search", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: "1 / (height - 10)", edges: topEdges(4) }]);

        // Act
        const probe = occt.design.probeFillet({ document, feature: "round", maxAttempts: 4 });

        // Assert
        expect(probe.value).toBeUndefined();
        expect(probe.builds).toBe(false);
        expect(probe.messages).toHaveLength(1);
        expect(probe.messages[0]).toMatch(/^\/features\/2\/radius: /);
        expect(probe.attempts).toHaveLength(4);
        expect(probe.largest).toBeGreaterThan(0);
    });

    it("should trim the design cache to what the probe used, as a build does", () => {
        // Arrange
        const cache = new DesignCache(0);
        const context = { occt, occ: kernel, cache };
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 1, edges: topEdges(4) }]);

        // Act
        probeRounding(document, { configuration: undefined, overrides: { width: 40 } }, context, "round", 1);
        const first = cache.size;
        probeRounding(document, { configuration: undefined, overrides: { width: 50 } }, context, "round", 1);
        const second = cache.size;

        // Assert
        expect(first).toBe(2);
        expect(second).toBe(2);
        cache.clear();
    });

    it("should stop after maxAttempts tries", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 2, edges: topEdges(4) }]);

        // Act
        const probe = occt.design.probeFillet({ document, feature: "round", maxAttempts: 1 });

        // Assert
        expect(probe.attempts).toEqual([{ value: 2, builds: true, ms: expect.any(Number) }]);
        expect(probe.largest).toBe(2);
        expect(probe.smallestFailing).toBeUndefined();
    });

    it("should refuse a body that did not build before the feature, saying why", () => {
        // Arrange
        const document = plate([
            { id: "huge", type: "fillet", body: "plate", radius: 50, edges: topEdges(4) },
            { id: "round", type: "fillet", body: "plate", radius: 1, edges: topEdges(4) },
        ]);

        // Act
        const probe = (): Models.OCCT.DesignFilletProbe => occt.design.probeFillet({ document, feature: "round" });

        // Assert
        expect(probe).toThrow(InputError);
        expect(probe).toThrow(/^The body "plate" did not build before "round", so it has no edges to probe: "huge": /);
    });

    it("should refuse a body whose feature is suppressed", () => {
        // Arrange
        const document: Document = {
            schemaVersion: 1,
            features: [
                { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 10 }, { type: "vLine", length: 10 }, { type: "hLine", length: -10 }, { type: "close" }] },
                { id: "plate", type: "extrude", profile: "base", distance: 2, suppressed: true },
                { id: "round", type: "fillet", body: "plate", radius: 1, edges: topEdges(4) },
            ],
        };

        // Act
        const probe = (): Models.OCCT.DesignFilletProbe => occt.design.probeFillet({ document, feature: "round" });

        // Assert
        expect(probe).toThrow("The body \"plate\" is suppressed before \"round\", so it has no edges to probe.");
    });

    it("should refuse a feature that is missing or is not a fillet or chamfer", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 2, edges: topEdges(4) }]);

        // Act
        const missing = (): Models.OCCT.DesignFilletProbe => occt.design.probeFillet({ document, feature: "nothing" });
        const extrude = (): Models.OCCT.DesignFilletProbe => occt.design.probeFillet({ document, feature: "plate" });

        // Assert
        expect(missing).toThrow("The document has no feature \"nothing\".");
        expect(extrude).toThrow("\"plate\" is a extrude feature; only a fillet or a chamfer is probed.");
    });

    it("should refuse an assembly, a document with problems and maxAttempts out of range", () => {
        // Arrange
        const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 2, edges: topEdges(4) }]);
        const assembly: Models.OCCT.DesignAssemblyDocument = { schemaVersion: 1, kind: "assembly", components: [] };

        // Act
        const ofAssembly = (): Models.OCCT.DesignFilletProbe => occt.design.probeFillet({ document: assembly, feature: "round" });
        const broken = (): Models.OCCT.DesignFilletProbe => occt.design.probeFillet({ document: plate([{ id: "round", type: "fillet", body: "nothing", radius: 2, edges: topEdges(4) }]), feature: "round" });
        const none = (): Models.OCCT.DesignFilletProbe => occt.design.probeFillet({ document, feature: "round", maxAttempts: 0 });
        const many = (): Models.OCCT.DesignFilletProbe => occt.design.probeFillet({ document, feature: "round", maxAttempts: 65 });
        const half = (): Models.OCCT.DesignFilletProbe => occt.design.probeFillet({ document, feature: "round", maxAttempts: 2.5 });

        // Assert
        expect(ofAssembly).toThrow("A fillet is probed in a part document; an assembly document has no features.");
        expect(broken).toThrow(/^The design document has a problem: /);
        expect(none).toThrow("maxAttempts is a whole number from 1 to 64, not 0.");
        expect(many).toThrow("maxAttempts is a whole number from 1 to 64, not 65.");
        expect(half).toThrow("maxAttempts is a whole number from 1 to 64, not 2.5.");
    });
});
