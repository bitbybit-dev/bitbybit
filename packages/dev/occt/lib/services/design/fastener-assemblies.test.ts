import { beforeAll, describe, expect, it } from "vitest";
import fc from "fast-check";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { Inputs as BaseInputs } from "@bitbybit-dev/base";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import { handlesIn } from "../../../../__test__/embind-ledger";

type Part = Models.OCCT.DesignPartDocument;
type Assembly = Models.OCCT.DesignAssemblyDocument;

const PLATE_ID = "0b6c2f9e-1a2b-4c3d-8e4f-5a6b7c8d9e01";
const SCREW_ID = "0b6c2f9e-1a2b-4c3d-8e4f-5a6b7c8d9e02";
const BASE_ID = "0b6c2f9e-1a2b-4c3d-8e4f-5a6b7c8d9e03";
const SLIDE_ID = "0b6c2f9e-1a2b-4c3d-8e4f-5a6b7c8d9e04";
const SEED = 20261018;
const METRIC_SIZES = Object.values(BaseInputs.Engineering.isoThreadSizeEnum);

const diameterOf = (size: string): number => Number(size.slice(1));

const tappedPlate = (size: string): Part => {
    const nominal = diameterOf(size);
    return {
        schemaVersion: 1,
        id: PLATE_ID,
        parameters: { side: 8 * nominal, thickness: 2 * nominal, depth: 1.5 * nominal, spacing: 2 * nominal },
        features: [
            { id: "outline", type: "sketch", on: { plane: "XY" }, start: ["-side / 2", "-side / 2"], pen: [{ type: "hLine", length: "side" }, { type: "vLine", length: "side" }, { type: "hLine", length: "-side" }, { type: "close" }] },
            { id: "plate", type: "extrude", profile: "outline", distance: "thickness" },
            { id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end", count: 1 }, at: [{ id: "left", x: "-spacing", y: 0 }, { id: "right", x: "spacing", y: 0 }], fastener: { size, fit: "tapped" }, depth: "depth" },
        ],
        parts: [{ id: "plate", body: "plate", connectors: [{ id: "bolt", on: { of: "plate", role: "end" }, axis: { of: "holes", role: "wall" } }] }],
    };
};

const capScrew = (size: string): Part => ({
    schemaVersion: 1,
    id: SCREW_ID,
    parameters: { length: diameterOf(size) },
    features: [{ id: "part", type: "operation", operation: "occt.parts.mechanical.fasteners.iso.socketHeadCapScrew", params: { size, length: { expr: "length" } } }],
    parts: [{ id: "screw", body: "part", connectors: [{ id: "seat", on: { of: "part", role: "seat" }, axis: { of: "part", role: "thread" } }] }],
});

const screwedDown: Assembly = {
    schemaVersion: 1,
    kind: "assembly",
    components: [
        { id: "plate", source: { document: PLATE_ID, part: "plate" } },
        { id: "screws", source: { document: SCREW_ID, part: "screw" }, replicate: { connector: "seat", to: { component: "plate", connector: "bolt" } } },
    ],
};

const square = (id: string, size: number): Models.OCCT.DesignSketchFeature => ({
    id, type: "sketch", on: { plane: "XY" }, start: [-size / 2, -size / 2],
    pen: [{ type: "hLine", length: size }, { type: "vLine", length: size }, { type: "hLine", length: -size }, { type: "close" }],
});

const baseBlock: Part = {
    schemaVersion: 1,
    id: BASE_ID,
    features: [square("outline", 20), { id: "block", type: "extrude", profile: "outline", distance: 4 }],
    parts: [{ id: "block", body: "block", connectors: [{ id: "top", on: { of: "block", role: "end" } }] }],
};

const slideBlock: Part = {
    schemaVersion: 1,
    id: SLIDE_ID,
    features: [square("outline", 6), { id: "slide", type: "extrude", profile: "outline", distance: 2 }],
    parts: [{ id: "slide", body: "slide", connectors: [{ id: "bottom", on: { of: "slide", role: "start" } }] }],
};

const slider = (offset: string | number, limits: [string | number, string | number]): Assembly => ({
    schemaVersion: 1,
    kind: "assembly",
    parameters: { lift: 0 },
    configurations: [{ id: "raised", values: { lift: 2 } }],
    components: [
        { id: "base", source: { document: BASE_ID, part: "block" } },
        { id: "slide", source: { document: SLIDE_ID, part: "slide" } },
    ],
    joints: [{ id: "rail", type: "slider", component: "slide", connector: "bottom", to: { component: "base", connector: "top" }, offset, limits: { offset: limits } }],
});

describe("OCCT design: fastener assemblies and joints at their limits", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        occt = new OCCTService(await createBitbybitOcct());
    }, 120_000);

    const freed = (built: Models.OCCT.DesignBuildResult<unknown>): void => {
        handlesIn(built).forEach(handle => { handle.delete(); });
    };

    const slideStatus = (document: Assembly, parameters: Record<string, number> = {}, configuration?: string): Models.OCCT.DesignFeatureReport => {
        const built = occt.design.build({ document, documents: [baseBlock, slideBlock], parameters, ...(configuration === undefined ? {} : { configuration }) });
        freed(built);
        return built.report.find(entry => entry.id === "slide")!;
    };

    describe("socket head cap screws replicated into the tapped holes of their own size", () => {
        it.each(METRIC_SIZES)("should seat an %s screw in each hole with its thread resting in the tapped thread, clashing with nothing", size => {
            // Arrange
            const documents = [tappedPlate(size), capScrew(size)];

            // Act
            const clashes = occt.design.clashes({ document: screwedDown, documents });
            const built = occt.design.build({ document: screwedDown, documents });
            freed(built);

            // Assert
            expect(clashes).toEqual([]);
            expect(built.components!.map(component => component.path)).toEqual(["plate", "screws.left", "screws.right"]);
            expect(built.bom!.map(line => line.quantity)).toEqual([1, 2]);
        });
    });

    describe("standard parts in an exported assembly", () => {
        it("should hand the assembly document every placed screw as a part, its placement baked, though the kernel moved the screw by a location", () => {
            // Arrange
            const documents = [tappedPlate("M6"), capScrew("M6")];
            const built = occt.design.build({ document: screwedDown, documents });
            const screw = built.parts.find(part => part.id.startsWith("screw"))!;

            // Act
            const document = occt.assembly.manager.buildAssemblyDocument({ structure: built.structure! });
            const tree = occt.assembly.query.getAssemblyHierarchy({ document });
            const placed = built.structure!.parts.map(part => part.shape.Location());
            const identities = placed.map(location => location.IsIdentity());
            placed.forEach(location => { location.delete(); });
            const screwLocation = screw.shape.Location();
            const located = !screwLocation.IsIdentity();
            screwLocation.delete();
            freed(built);
            document.delete();

            // Assert
            expect(located).toBe(true);
            expect(identities).toEqual([true, true]);
            expect(tree.nodes.filter(node => node.nodeType === "instance-part").map(node => node.name).sort()).toEqual(["plate", "screws left", "screws right"].sort());
        });
    });

    describe("a boolean input an expression gives", () => {
        const hexBolt = (full: boolean): Part => ({
            schemaVersion: 1,
            id: SCREW_ID,
            parameters: { full: { type: "boolean", value: full }, length: 30 },
            features: [{ id: "part", type: "operation", operation: "occt.parts.mechanical.fasteners.iso.hexBolt", params: { size: "M8", length: { expr: "length" }, fullyThreaded: { expr: "full" } } }],
            parts: [{ id: "bolt", body: "part" }],
        });

        it("should take a boolean parameter as true or false where the operation's input is a boolean, and make a different bolt of each", () => {
            // Arrange
            const threaded = hexBolt(true);
            const plain = hexBolt(false);

            // Act
            const builds = [occt.design.build({ document: threaded }), occt.design.build({ document: plain })];
            const shapes = builds.map(built => built.parts[0]?.shapeHash);
            builds.forEach(freed);

            // Assert
            expect(builds.map(built => [built.issues, built.report.filter(entry => entry.status !== "ok")])).toEqual([[[], []], [[], []]]);
            expect(shapes[0]).not.toBe(shapes[1]);
        });
    });

    describe("a slider held within its limits", () => {
        it("should take an offset at its limit however the two are written, as 0.1 + 0.2 and 0.3 are the same length", () => {
            // Act
            const summed = slideStatus(slider("0.1 + 0.2", [0, 0.3]));
            const scaled = slideStatus(slider("3 * 0.1", [0, 0.3]));

            // Assert
            expect([summed.status, summed.messages]).toEqual(["ok", []]);
            expect([scaled.status, scaled.messages]).toEqual(["ok", []]);
        });

        it("should hand back an offset at its limit as the limit, take limits whose least is above the most only by rounding, and refuse an offset a millionth past, showing it", () => {
            // Arrange
            const offsetOf = (document: Assembly): number => {
                const built = occt.design.build({ document, documents: [baseBlock, slideBlock] });
                freed(built);
                return built.joints!.find(joint => joint.path === "rail")!.offset;
            };

            // Act
            const atLimit = offsetOf(slider("0.1 + 0.2", [0, 0.3]));
            const roundedLimits = slideStatus(slider(0.3, ["0.1 + 0.2", 0.3]));
            const past = slideStatus(slider("0.3 + 1e-6", [0, 0.3]));

            // Assert
            expect(atLimit).toBe(0.3);
            expect(roundedLimits.status).toBe("ok");
            expect(past.messages).toEqual(["/joints/0/offset: 0.300001 is outside the joint's limits, 0 to 0.3"]);
        });

        it("should place the slide wherever the offset a parameter drives lies within its limits, ends included, and refuse it beyond them at the offset", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: -8, max: 8 }), fc.integer({ min: -8, max: 8 }), fc.integer({ min: 0, max: 8 }), (offset, least, span) => {
                const report = slideStatus(slider("lift", [least / 2, (least + span) / 2]), { lift: offset / 2 });
                const inside = offset >= least && offset <= least + span;
                expect(report.status).toBe(inside ? "ok" : "failed");
                expect(report.messages).toEqual(inside ? [] : [`/joints/0/offset: ${offset / 2} is outside the joint's limits, ${least / 2} to ${(least + span) / 2}`]);
            }), { seed: SEED, numRuns: 10 });
        });

        it("should refuse a constant offset beyond its limits before building, as a problem of the document", () => {
            // Act
            const issues = occt.design.validate({ document: slider(-0.5, [0, 1]), documents: [baseBlock, slideBlock] });

            // Assert
            expect(issues.map(issue => `${issue.path}: ${issue.message}`)).toEqual(["/joints/0/offset: -0.5 is outside the joint's limits, 0 to 1"]);
        });

        it("should pose the slide by a configuration and let a value given to the build win over it", () => {
            // Arrange
            const document = slider("lift", [0, 3]);
            const liftOf = (parameters: Record<string, number>, configuration?: string): number => {
                const built = occt.design.build({ document, documents: [baseBlock, slideBlock], parameters, ...(configuration === undefined ? {} : { configuration }) });
                freed(built);
                return built.joints!.find(joint => joint.path === "rail")!.offset;
            };

            // Act
            const lifts = [liftOf({}), liftOf({}, "raised"), liftOf({ lift: 3 }, "raised")];

            // Assert
            expect(lifts).toEqual([0, 2, 3]);
            expect(slideStatus(document, { lift: 4 }, "raised").status).toBe("failed");
        });
    });
});
