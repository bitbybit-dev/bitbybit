import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";
import { runAssembly } from "./assembly";
import { itemKeyOf } from "./identity";
import { libraryOf } from "./library";
import { DesignCache } from "./cache";

type Part = Models.OCCT.DesignPartDocument;
type Assembly = Models.OCCT.DesignAssemblyDocument;

const PLATE_ID = "11111111-1111-4111-8111-111111111111";
const POST_ID = "22222222-2222-4222-8222-222222222222";
const PAIR_ID = "33333333-3333-4333-8333-333333333333";
const RIG_ID = "44444444-4444-4444-8444-444444444444";
const STACK_ID = "55555555-5555-4555-8555-555555555555";
const TOWER_ID = "66666666-6666-4666-8666-666666666666";

const square = (id: string, width: number | string, depth: number | string): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on: { plane: "XY" },
    pen: [{ type: "hLine", length: width }, { type: "vLine", length: depth }, { type: "hLine", length: typeof width === "number" ? -width : `-(${width})` }, { type: "close" }],
});

const plate: Part = {
    schemaVersion: 1,
    id: PLATE_ID,
    features: [square("base", 40, 20), { id: "plate", type: "extrude", profile: "base", distance: 10 }],
    parts: [{
        id: "plate",
        name: "Plate",
        body: "plate",
        appearance: { color: "#336699" },
        properties: { partNumber: "PL-40" },
        connectors: [
            { id: "top", on: { of: "plate", role: "end" }, origin: [20, 10, 10] },
            { id: "corner", on: { of: "plate", role: "end" }, origin: [5, 5, 10] },
            { id: "bottom", on: { of: "plate", role: "start" }, origin: [20, 10, 0] },
        ],
    }],
};

const post: Part = {
    schemaVersion: 1,
    id: POST_ID,
    parameters: { height: { value: 6, min: 1 }, size: 4 },
    configurations: [{ id: "short", values: { height: 3 } }],
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, start: ["-size / 2", "-size / 2"], pen: [{ type: "hLine", length: "size" }, { type: "vLine", length: "size" }, { type: "hLine", length: "-size" }, { type: "close" }] },
        { id: "post", type: "extrude", profile: "base", distance: "height" },
    ],
    parts: [{ id: "post", name: "Post", body: "post", properties: { partNumber: "PO-{height}" }, connectors: [{ id: "bottom", on: { of: "post", role: "start" } }, { id: "top", on: { of: "post", role: "end" } }] }],
};

const pair: Assembly = {
    schemaVersion: 1,
    kind: "assembly",
    id: PAIR_ID,
    parameters: { tall: 9, capped: true },
    components: [
        { id: "plate", source: { document: PLATE_ID, part: "plate" } },
        { id: "middle", name: "Middle post", source: { document: POST_ID, part: "post" } },
        { id: "corner", source: { document: POST_ID, part: "post", parameters: { height: "tall" } }, properties: { position: "C{tall}" } },
        { id: "stacked", source: { document: POST_ID, part: "post" }, suppressed: "!capped" },
    ],
    joints: [
        { id: "middleOnPlate", type: "fastened", component: "middle", connector: "bottom", to: { component: "plate", connector: "top" } },
        { id: "cornerOnPlate", type: "revolute", component: "corner", connector: "bottom", to: { component: "plate", connector: "corner" }, angle: 45, limits: { angle: [0, 90] } },
        { id: "stackedOnMiddle", type: "slider", component: "stacked", connector: "bottom", to: { component: "middle", connector: "top" }, offset: 1, limits: { offset: [0, 5] } },
    ],
    connectors: [{ id: "foot", component: "plate", connector: "bottom" }, { id: "peak", component: "stacked", connector: "top" }],
};

const ONE_PLATE_ID = "77777777-7777-4777-8777-777777777777";

const colouredPlate = (faces: Models.OCCT.DesignFaceAppearance[], edges: Models.OCCT.DesignEdgeAppearance[]): Part => ({
    ...plate,
    parts: [{ id: "plate", name: "Plate", body: "plate", appearance: { color: "#336699", edgeColor: "#111111", faces, edges } }],
});

const onePlate: Assembly = {
    schemaVersion: 1,
    kind: "assembly",
    id: ONE_PLATE_ID,
    components: [{ id: "plate", source: { document: PLATE_ID, part: "plate" } }],
};

const glbBaseColours = (glb: Uint8Array): number[][] => {
    const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
    const json: unknown = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + view.getUint32(12, true))));
    const materials = typeof json === "object" && json !== null && "materials" in json && Array.isArray(json.materials) ? json.materials : [];
    return materials.flatMap((material: unknown) => {
        const factor = typeof material === "object" && material !== null && "pbrMetallicRoughness" in material
            && typeof material.pbrMetallicRoughness === "object" && material.pbrMetallicRoughness !== null && "baseColorFactor" in material.pbrMetallicRoughness
            ? material.pbrMetallicRoughness.baseColorFactor : undefined;
        return Array.isArray(factor) ? [factor.map((value: unknown) => typeof value === "number" ? Math.round(value * 1000) / 1000 : Number.NaN)] : [];
    });
};

const glbMaterials = (glb: Uint8Array): Record<string, unknown>[] => {
    const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
    const json: unknown = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + view.getUint32(12, true))));
    const materials = typeof json === "object" && json !== null && "materials" in json && Array.isArray(json.materials) ? json.materials : [];
    return materials.filter((material: unknown): material is Record<string, unknown> => typeof material === "object" && material !== null);
};

const rounded = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(rounded);
    }
    if (typeof value === "number") {
        return Math.round(value * 1000) / 1000;
    }
    if (typeof value === "object" && value !== null) {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rounded(entry)]));
    }
    return value;
};

const linear = (channel: number): number => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const PLATE = `plate-${itemKeyOf(PLATE_ID, "plate", {})}`;
const POST_6 = `post-${itemKeyOf(POST_ID, "post", { height: 6, size: 4 })}`;
const POST_9 = `post-${itemKeyOf(POST_ID, "post", { height: 9, size: 4 })}`;

describe("design assemblies", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        const helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    const placedBox = (built: Models.OCCT.DesignBuildResult<TopoDS_Shape>, path: string): { min: number[]; max: number[] } => {
        const component = built.components!.find(entry => entry.path === path)!;
        const part = built.parts.find(entry => entry.id === component.part)!;
        const moved = occt.transforms.transformByMatrix({ shape: part.shape, transformation: component.world });
        const box = occt.analysis.measure.tightBoundingBox({ shape: moved });
        return { min: box.min.map(value => Number(value.toFixed(6))), max: box.max.map(value => Number(value.toFixed(6))) };
    };

    describe("replicating components onto connector sets", () => {
        const drilled: Part = {
            ...plate,
            features: [...plate.features, { id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [{ id: "left", x: -10, y: 0 }, { id: "right", x: 10, y: 0 }], diameter: 4 }],
            parts: [{ ...plate.parts![0]!, connectors: [...plate.parts![0]!.connectors!, { id: "bolt", on: { of: "plate", role: "end" }, axis: { of: "holes", role: "wall" } }] }],
        };
        const pinned = (replicate: Models.OCCT.DesignReplicate, extra: Partial<Assembly> = {}): Assembly => ({
            schemaVersion: 1,
            kind: "assembly",
            components: [{ id: "plate", source: { document: PLATE_ID, part: "plate" } }, { id: "pins", name: "Pin", source: { document: POST_ID, part: "post" }, replicate }],
            ...extra,
        });

        it("should place a component once on every member of a set, each fastened as a joint would, and count each in the bill of materials", () => {
            // Act
            const built = occt.design.build({ document: pinned({ connector: "bottom", to: { component: "plate", connector: "bolt" } }), documents: [drilled, post] });

            // Assert
            expect(built.components!.map(component => [component.path, component.name])).toEqual([["plate", "plate"], ["pins.left", "Pin left"], ["pins.right", "Pin right"]]);
            expect(placedBox(built, "pins.left")).toEqual({ min: [8, 8, 10], max: [12, 12, 16] });
            expect(placedBox(built, "pins.right")).toEqual({ min: [28, 8, 10], max: [32, 12, 16] });
            expect(built.joints!.map(joint => [joint.path, joint.type, joint.component, joint.to])).toEqual([["pins.left", "fastened", "pins.left", "plate"], ["pins.right", "fastened", "pins.right", "plate"]]);
            expect(built.bom!.map(line => [line.part, line.quantity])).toEqual([[PLATE, 1], [POST_6, 2]]);
        });

        it("should place one occurrence on a connector named alone, and lift it by its offset", () => {
            // Act
            const built = occt.design.build({ document: pinned({ connector: "bottom", to: { component: "plate", connector: "bolt.right" }, offset: 2 }), documents: [drilled, post] });

            // Assert
            expect(built.components!.map(component => component.path)).toEqual(["plate", "pins"]);
            expect(placedBox(built, "pins")).toEqual({ min: [28, 8, 12], max: [32, 12, 18] });
        });

        it("should count every replica toward the occurrence limit, before building anything", () => {
            // Arrange
            const idOf = (level: number): string => `00000000-0000-4000-8000-${String(level).padStart(12, "0")}`;
            const levels: Assembly[] = Array.from({ length: 15 }, (_, level) => ({
                schemaVersion: 1,
                kind: "assembly",
                id: idOf(level),
                components: ["a", "b"].map(id => ({ id, source: level === 0 ? { document: POST_ID, part: "post" } : { document: idOf(level - 1) } })),
                connectors: [{ id: "foot", component: "a", connector: level === 0 ? "bottom" : "foot" }],
            }));
            const towers: Assembly = { schemaVersion: 1, kind: "assembly", components: [{ id: "plate", source: { document: PLATE_ID, part: "plate" } }, { id: "towers", source: { document: idOf(14) }, replicate: { connector: "foot", to: { component: "plate", connector: "bolt" } } }] };

            // Act
            const attempt = (): unknown => occt.design.build({ document: towers, documents: [drilled, post, ...levels] });

            // Assert
            expect(attempt).toThrow("/components: the assembly places more than 100000 occurrences through its levels");
        });

        it("should refuse a replicate onto what is not a set, by a connector the part lacks, with a frame, or joined to by name", () => {
            // Act
            const issuesOf = (document: Assembly): string[] => occt.design.validate({ document, documents: [drilled, post] }).map(issue => `${issue.path}: ${issue.message}`);
            const noSet = issuesOf(pinned({ connector: "bottom", to: { component: "plate", connector: "nut" } }));
            const noOwn = issuesOf(pinned({ connector: "side", to: { component: "plate", connector: "bolt" } }));
            const framed = issuesOf({ ...pinned({ connector: "bottom", to: { component: "plate", connector: "bolt" } }), components: [{ id: "plate", source: { document: PLATE_ID, part: "plate" } }, { id: "pins", source: { document: POST_ID, part: "post" }, at: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] }, replicate: { connector: "bottom", to: { component: "plate", connector: "bolt" } } }] });
            const joined = issuesOf(pinned({ connector: "bottom", to: { component: "plate", connector: "bolt" } }, { joints: [{ id: "onPin", type: "fastened", component: "plate", connector: "bottom", to: { component: "pins", connector: "top" } }] }));

            // Assert
            expect(noSet).toEqual(["/components/1/replicate/to/connector: \"nut\" is neither a connector nor a set of connectors of \"plate\": its connectors are top, corner, bottom, bolt.left, bolt.right"]);
            expect(noOwn).toEqual(["/components/1/replicate/connector: \"side\" is not a connector of the part \"pins\" places: its connectors are bottom, top"]);
            expect(framed).toEqual(["/components/1/replicate: a replicated component is placed on its set, not at a frame: give it at or replicate"]);
            expect(joined).toEqual(["/joints/0/to/component: \"pins\" is replicated, so it has no one place to be joined to"]);
        });
    });

    describe("building", () => {
        it("should join posts by their connectors, build each part once per parameter set, and count them in the bill of materials", () => {
            // Act
            const built = occt.design.build({ document: pair, documents: [plate, post] });

            // Assert
            expect(built.report.map(entry => [entry.id, entry.status])).toEqual([["plate", "ok"], ["middle", "ok"], ["corner", "ok"], ["stacked", "ok"]]);
            expect(built.parts.map(part => [part.id, part.name, part.document, part.parameters])).toEqual([
                [PLATE, "Plate", PLATE_ID, {}],
                [POST_6, "Post", POST_ID, { height: 6, size: 4 }],
                [POST_9, "Post", POST_ID, { height: 9, size: 4 }],
            ]);
            expect(placedBox(built, "middle")).toEqual({ min: [18, 8, 10], max: [22, 12, 16] });
            expect(placedBox(built, "stacked")).toEqual({ min: [18, 8, 17], max: [22, 12, 23] });
            const corner = placedBox(built, "corner");
            expect(corner.min[2]).toBeCloseTo(10, 6);
            expect(corner.max[2]).toBeCloseTo(19, 6);
            expect(corner.max[0]! - corner.min[0]!).toBeCloseTo(4 * Math.SQRT2, 6);
            expect(built.bom).toEqual([
                { part: PLATE, name: "Plate", quantity: 1, properties: { partNumber: "PL-40" } },
                { part: POST_6, name: "Post", quantity: 2, properties: { partNumber: "PO-6" } },
                { part: POST_9, name: "Post", quantity: 1, properties: { partNumber: "PO-9" } },
            ]);
            expect(built.components!.find(entry => entry.path === "corner")!.properties).toEqual({ position: "C9" });
            expect(built.components!.find(entry => entry.path === "middle")!.name).toBe("Middle post");
        });

        it("should report the units and up axis of the document built, millimetres and y when it leaves them out", () => {
            // Act
            const plain = occt.design.build({ document: pair, documents: [plate, post] });
            const stated = occt.design.build({ document: { ...pair, units: { length: "in" }, up: "z" }, documents: [{ ...plate, units: { length: "in" } }, { ...post, units: { length: "in" } }] });

            // Assert
            expect([plain.units, plain.up]).toEqual([{ length: "mm", angle: "deg" }, "y"]);
            expect([stated.units, stated.up]).toEqual([{ length: "in", angle: "deg" }, "z"]);
        });

        it("should name each item by its part and a key over the declared values it reads, whatever the order of the components, the configuration that set them or the edits outside them", () => {
            // Arrange
            const reordered: Assembly = { ...pair, components: [pair.components[3]!, pair.components[2]!, pair.components[0]!, pair.components[1]!] };
            const explicit: Assembly = { ...pair, components: pair.components.map(component => component.id === "middle" ? { ...component, source: { ...component.source, parameters: { height: 6 } } } : component) };
            const renamed: Part = { ...post, meta: { name: "Renamed post" }, parameters: { ...post.parameters, unused: 1 } };
            const short: Assembly = { schemaVersion: 1, kind: "assembly", components: [{ id: "a", source: { document: POST_ID, part: "post", configuration: "short" } }, { id: "b", source: { document: POST_ID, part: "post", parameters: { height: 3 } } }] };
            const unread: Assembly = { schemaVersion: 1, kind: "assembly", components: [{ id: "a", source: { document: POST_ID, part: "post", parameters: { unused: 1 } } }, { id: "b", source: { document: POST_ID, part: "post", parameters: { unused: 2 } } }] };
            const idsOf = (built: Models.OCCT.DesignBuildResult<TopoDS_Shape>): Record<string, string | undefined> => Object.fromEntries(built.components!.map(component => [component.path, component.part]));

            // Act
            const built = occt.design.build({ document: pair, documents: [plate, post] });
            const again = occt.design.build({ document: reordered, documents: [plate, post] });
            const same = occt.design.build({ document: explicit, documents: [plate, post] });
            const edited = occt.design.build({ document: pair, documents: [plate, renamed] });
            const configured = occt.design.build({ document: short, documents: [post] });
            const unreadValues = occt.design.build({ document: unread, documents: [renamed] });

            // Assert
            expect(idsOf(built)).toEqual({ plate: PLATE, middle: POST_6, corner: POST_9, stacked: POST_6 });
            expect(idsOf(again)).toEqual(idsOf(built));
            expect(idsOf(same)).toEqual(idsOf(built));
            expect(same.bom!.map(line => line.quantity)).toEqual([1, 2, 1]);
            expect(idsOf(edited)).toEqual(idsOf(built));
            expect(configured.parts.map(part => [part.name, part.parameters])).toEqual([["Post", { height: 3, size: 4 }]]);
            expect(configured.bom!.map(line => line.quantity)).toEqual([2]);
            expect(unreadValues.parts.map(part => part.id)).toEqual([POST_6]);
        });

        it("should build two revisions of one document placed together as two parts, each named by its version", () => {
            // Arrange
            const thicker: Part = { ...plate, features: [plate.features[0]!, { id: "plate", type: "extrude", profile: "base", distance: 12 }] };
            const both: Assembly = { schemaVersion: 1, kind: "assembly", components: [{ id: "old", source: { document: PLATE_ID, part: "plate", version: occt.design.versionOf({ document: plate }) } }, { id: "new", source: { document: PLATE_ID, part: "plate", version: occt.design.versionOf({ document: thicker }) } }] };

            // Act
            const built = occt.design.build({ document: both, documents: [plate, thicker] });

            // Assert
            expect(built.parts.map(part => part.id)).toEqual([`${PLATE}-${occt.design.versionOf({ document: plate }).slice(0, 8)}`, `${PLATE}-${occt.design.versionOf({ document: thicker }).slice(0, 8)}`]);
            expect(placedBox(built, "old").max[2]).toBe(10);
            expect(placedBox(built, "new").max[2]).toBe(12);
            expect(built.bom!.map(line => line.quantity)).toEqual([1, 1]);
        });

        it("should key an item by values written as constant expressions and by values only its connectors read, and not by a name that only looks like one", () => {
            // Arrange
            const configured: Part = { ...post, configurations: [{ id: "short", values: { height: "3" } }, { id: "tall", values: { height: "2 * 5" } }] };
            const railed: Part = { ...post, parameters: { ...post.parameters, pos: 0 }, parts: [{ ...post.parts![0]!, connectors: [{ id: "slot", on: { of: "post", role: "end" }, origin: ["pos", 0, 0] }] }] };
            const named: Part = { ...post, parameters: { ...post.parameters, extrude: 1 } };

            // Act
            const keyOf = (document: Part, parameters: Record<string, number> = {}, configuration?: string): string => occt.design.build({ document, parameters, ...(configuration === undefined ? {} : { configuration }) }).parts[0]!.itemKey;
            const short = occt.design.build({ document: configured, configuration: "short" }).parts[0]!;
            const tall = occt.design.build({ document: configured, configuration: "tall" }).parts[0]!;

            // Assert
            expect([short.parameters, tall.parameters]).toEqual([{ height: 3, size: 4 }, { height: 10, size: 4 }]);
            expect(short.itemKey).not.toBe(tall.itemKey);
            expect(keyOf(railed, { pos: 10 })).not.toBe(keyOf(railed, { pos: 50 }));
            expect(keyOf(named, { extrude: 1 })).toBe(keyOf(named, { extrude: 2 }));
        });

        it("should give a part a build key that tells revisions apart where the item key does not", () => {
            // Arrange
            const revised: Part = { ...post, features: [post.features[0]!, { id: "post", type: "extrude", profile: "base", distance: "height + 1" }] };

            // Act
            const first = occt.design.build({ document: post }).parts[0]!;
            const second = occt.design.build({ document: revised }).parts[0]!;

            // Assert
            expect(second.itemKey).toBe(first.itemKey);
            expect(second.buildKey).not.toBe(first.buildKey);
            expect(second.shapeHash).not.toBe(first.shapeHash);
        });

        it("should report two different parts that share a part number, so its template tells them apart", () => {
            // Arrange
            const numbered: Part = { ...post, parts: [{ ...post.parts![0]!, properties: { partNumber: "PO" } }] };
            const both: Assembly = { schemaVersion: 1, kind: "assembly", components: [{ id: "a", source: { document: POST_ID, part: "post" } }, { id: "b", source: { document: POST_ID, part: "post", parameters: { height: 9 } } }] };

            // Act
            const built = occt.design.build({ document: both, documents: [numbered] });

            // Assert
            expect(built.issues).toEqual([{ path: "/components/1/source/part", message: `"${POST_9}" and "${POST_6}" are different parts with the part number "PO": its template needs the values that tell them apart` }]);
        });

        it("should move a component by the values its joint lets move, within the joint's limits, and report each joint with its axis in world coordinates", () => {
            // Arrange
            const moving: Assembly = {
                ...pair,
                parameters: { tall: 9, capped: true, turn: 90, lift: 3 },
                joints: pair.joints!.map(joint => joint.id === "cornerOnPlate" ? { ...joint, angle: "turn" } : joint.id === "stackedOnMiddle" ? { ...joint, offset: "lift" } : joint),
            };
            const rounded = (values: number[]): number[] => values.map(value => Number(value.toFixed(6)) + 0);

            // Act
            const built = occt.design.build({ document: moving, documents: [plate, post] });
            const tooFar = occt.design.build({ document: moving, documents: [plate, post], parameters: { turn: 120 } });
            const tooHigh = occt.design.build({ document: moving, documents: [plate, post], parameters: { lift: 6 } });

            // Assert
            expect(built.joints!.map(joint => [joint.path, joint.type, joint.component, joint.to, joint.angle, joint.offset, joint.limits])).toEqual([
                ["middleOnPlate", "fastened", "middle", "plate", 0, 0, {}],
                ["cornerOnPlate", "revolute", "corner", "plate", 90, 0, { angle: [0, 90] }],
                ["stackedOnMiddle", "slider", "stacked", "middle", 0, 3, { offset: [0, 5] }],
            ]);
            expect(rounded(built.joints![2]!.frame.origin)).toEqual([20, 10, 16]);
            expect(rounded(built.joints![2]!.frame.normal)).toEqual([0, 0, 1]);
            expect(placedBox(built, "stacked")).toEqual({ min: [18, 8, 19], max: [22, 12, 25] });
            expect(placedBox(built, "corner")).toEqual({ min: [3, 3, 10], max: [7, 7, 19] });
            expect(tooFar.report.find(entry => entry.id === "corner")).toMatchObject({ status: "failed", messages: ["/joints/1/angle: 120 is outside the joint's limits, 0 to 90"] });
            expect(tooHigh.report.find(entry => entry.id === "stacked")).toMatchObject({ status: "failed", messages: ["/joints/2/offset: 6 is outside the joint's limits, 0 to 5"] });
        });

        it("should skip the components joined to one whose joint was refused, and those joined to them, saying why", () => {
            // Arrange
            const chained: Assembly = {
                ...pair,
                parameters: { ...pair.parameters, turn: 120 },
                components: [...pair.components, { id: "topper", source: { document: POST_ID, part: "post" } }, { id: "flag", source: { document: POST_ID, part: "post" } }],
                joints: [
                    ...pair.joints!.map(joint => joint.id === "cornerOnPlate" ? { ...joint, angle: "turn" } : joint),
                    { id: "topperOnCorner", type: "fastened", component: "topper", connector: "bottom", to: { component: "corner", connector: "top" } },
                    { id: "flagOnTopper", type: "fastened", component: "flag", connector: "bottom", to: { component: "topper", connector: "top" } },
                ],
            };

            // Act
            const built = occt.design.build({ document: chained, documents: [plate, post] });

            // Assert
            expect(built.report.map(entry => [entry.id, entry.status, entry.messages])).toEqual([
                ["plate", "ok", []],
                ["middle", "ok", []],
                ["corner", "failed", ["/joints/1/angle: 120 is outside the joint's limits, 0 to 90"]],
                ["stacked", "ok", []],
                ["topper", "skipped", ["the component \"corner\" failed earlier"]],
                ["flag", "skipped", ["the component \"topper\" failed earlier"]],
            ]);
            expect(built.components!.map(component => component.path)).toEqual(["plate", "middle", "stacked"]);
        });

        it("should refuse limits whose expressions put the least above the most", () => {
            // Arrange
            const crossed: Assembly = {
                ...pair,
                parameters: { tall: 9, capped: true, low: 10, high: 0 },
                joints: pair.joints!.map(joint => joint.id === "cornerOnPlate" ? { ...joint, angle: 5, limits: { angle: ["low", "high"] } } : joint),
            };

            // Act
            const built = occt.design.build({ document: crossed, documents: [plate, post] });

            // Assert
            expect(built.report.find(entry => entry.id === "corner")).toMatchObject({ status: "failed", messages: ["/joints/1/limits/angle: the least, 10, is more than the most, 0"] });
        });

        it("should turn and slide a cylindrical joint at once", () => {
            // Arrange
            const twisting: Assembly = {
                ...pair,
                joints: pair.joints!.map(joint => joint.id === "stackedOnMiddle" ? { ...joint, type: "cylindrical", angle: 30, offset: 2, limits: { angle: [-45, 45], offset: [0, 5] } } : joint),
            };

            // Act
            const built = occt.design.build({ document: twisting, documents: [plate, post] });

            // Assert
            const stacked = placedBox(built, "stacked");
            expect(stacked.min[2]).toBeCloseTo(18, 6);
            expect(stacked.max[2]).toBeCloseTo(24, 6);
            expect(stacked.max[0]! - stacked.min[0]!).toBeCloseTo(4 * (Math.cos(Math.PI / 6) + Math.sin(Math.PI / 6)), 6);
            expect(built.joints![2]).toMatchObject({ type: "cylindrical", angle: 30, offset: 2, limits: { angle: [-45, 45], offset: [0, 5] } });
        });

        it("should name a sub-assembly's joints below it and give their axes where the sub-assembly is placed", () => {
            // Arrange
            const rig: Assembly = {
                schemaVersion: 1,
                kind: "assembly",
                id: RIG_ID,
                components: [{ id: "right", source: { document: PAIR_ID }, at: { origin: [100, 0, 0], normal: [0, 0, 1], direction: [0, 1, 0] } }],
            };
            const rounded = (values: number[]): number[] => values.map(value => Number(value.toFixed(6)) + 0);

            // Act
            const built = occt.design.build({ document: rig, documents: [plate, post, pair] });

            // Assert
            expect(built.joints!.map(joint => [joint.path, joint.component, joint.to])).toEqual([
                ["right/middleOnPlate", "right/middle", "right/plate"],
                ["right/cornerOnPlate", "right/corner", "right/plate"],
                ["right/stackedOnMiddle", "right/stacked", "right/middle"],
            ]);
            expect(rounded(built.joints![2]!.frame.origin)).toEqual([90, 20, 16]);
            expect(rounded(built.joints![2]!.frame.direction)).toEqual(rounded([...built.joints![0]!.frame.direction]));
        });

        it("should hand back the structure the assembly builders take, so the assembly exports to STEP with one product per part", () => {
            // Arrange
            const built = occt.design.build({ document: pair, documents: [plate, post] });

            // Act
            const document = occt.assembly.manager.buildAssemblyDocument({ structure: built.structure! });
            const parts = occt.assembly.query.getDocumentParts({ document });
            const step = occt.assembly.manager.exportDocumentToStep({ document, fileName: "pair.step", author: "", organization: "", compress: false, tryDownload: false });
            const reread = occt.io.loadSTEPorIGES({ filetext: new TextDecoder().decode(step), fileName: "pair.step", adjustZtoY: false })!;

            // Assert
            expect(built.structure!.parts.map(part => [part.id, part.name])).toEqual([[PLATE, "Plate"], [POST_6, "Post"], [POST_9, "Post"]]);
            expect(built.structure!.parts[0]!.colorRgba).toEqual({ r: 0x33 / 255, g: 0x66 / 255, b: 0x99 / 255, a: 1 });
            expect(built.structure!.nodes.map(node => [node.id, node.type, node.parentId, node.partId])).toEqual([["/", "assembly", undefined, undefined], ["plate", "instance", "/", PLATE], ["middle", "instance", "/", POST_6], ["corner", "instance", "/", POST_9], ["stacked", "instance", "/", POST_6]]);
            expect(parts.length).toBeGreaterThanOrEqual(3);
            expect(occt.shapes.solid.getSolids({ shape: reread })).toHaveLength(4);
        });

        it("should hand the colours of listed faces and edges to the structure, leaving out those that repeat the part's", () => {
            // Arrange
            const topEdges: Models.OCCT.DesignEdgeReference = { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 };
            const bottomEdges: Models.OCCT.DesignEdgeReference = { between: [{ of: "plate", role: "start" }, { of: "plate", role: "side" }], count: 4 };
            const coloured = colouredPlate([
                { faces: { of: "plate", role: "end" }, color: "#ff0000" },
                { faces: { of: "plate", role: "start" }, color: "#336699" },
                { faces: { of: "plate", role: "start" }, opacity: 0.5 },
            ], [{ edges: topEdges, color: "#00ff00" }, { edges: bottomEdges }]);

            // Act
            const built = occt.design.build({ document: onePlate, documents: [coloured] });

            // Assert
            const part = built.parts[0]!;
            const [top, bottom] = part.appearance!.faces.map(entry => entry.indexes);
            expect(built.structure!.parts[0]).toEqual(expect.objectContaining({
                colorRgba: { r: 0x33 / 255, g: 0x66 / 255, b: 0x99 / 255, a: 1 },
                edgeColorRgba: { r: 0x11 / 255, g: 0x11 / 255, b: 0x11 / 255, a: 1 },
                faceColors: [{ indexes: top, colorRgba: { r: 1, g: 0, b: 0, a: 1 } }, { indexes: bottom, colorRgba: { r: 0x33 / 255, g: 0x66 / 255, b: 0x99 / 255, a: 0.5 } }],
                edgeColors: [{ indexes: part.appearance!.edges![0]!.indexes, colorRgba: { r: 0, g: 1, b: 0, a: 1 } }],
            }));
            expect(part.appearance!.edges![0]!.indexes).toHaveLength(4);
        });

        it("should hand a part's finish and its faces' to the structure, the emission capped at 1", () => {
            // Arrange
            const finished: Part = {
                ...plate,
                parts: [{ id: "plate", name: "Plate", body: "plate", appearance: {
                    color: "#336699", metallic: 0.3, roughness: 0.6, emissive: "#ff8000", emissiveStrength: 2,
                    faces: [{ faces: { of: "plate", role: "end" }, metallic: 0.9 }, { faces: { of: "plate", role: "start" }, color: "#336699" }],
                } }],
            };

            // Act
            const built = occt.design.build({ document: onePlate, documents: [finished] });

            // Assert
            const top = built.parts[0]!.appearance!.faces[0]!.indexes;
            const glow = { r: 1, g: 0x80 / 255, b: 0 };
            expect(built.structure!.parts[0]).toEqual(expect.objectContaining({
                colorRgba: { r: 0x33 / 255, g: 0x66 / 255, b: 0x99 / 255, a: 1 },
                metallic: 0.3,
                roughness: 0.6,
                emissiveRgb: glow,
                faceColors: [{ indexes: top, colorRgba: { r: 0x33 / 255, g: 0x66 / 255, b: 0x99 / 255, a: 1 }, metallic: 0.9, roughness: 0.6, emissiveRgb: glow }],
            }));
        });

        it("should leave out the finish of a part that has no colour to carry it", () => {
            // Arrange
            const colourless: Part = { ...plate, parts: [{ id: "plate", name: "Plate", body: "plate", appearance: { metallic: 0.3, faces: [] } }] };

            // Act
            const built = occt.design.build({ document: onePlate, documents: [colourless] });

            // Assert
            expect(Object.keys(built.structure!.parts[0]!).sort()).toEqual(["id", "name", "shape"]);
        });

        it("should carry a part's finish into its glTF material", () => {
            // Arrange
            const finished: Part = { ...plate, parts: [{ id: "plate", name: "Plate", body: "plate", appearance: { color: "#336699", metallic: 0.25, roughness: 0.75, emissive: "#ff8000", emissiveStrength: 0.5, faces: [] } }] };
            const built = occt.design.build({ document: onePlate, documents: [finished] });

            // Act
            const document = occt.assembly.manager.buildAssemblyDocument({ structure: built.structure! });
            const glb = occt.assembly.manager.exportDocumentToGltf({ document, meshDeflection: 0.1, meshAngle: 0.5, internalVerticesMode: false, controlSurfaceDeflection: false, mergeFaces: false, forceUVExport: false, fileName: "plate.glb", tryDownload: false });

            // Assert
            expect(glbMaterials(glb).map(material => rounded({ pbr: material["pbrMetallicRoughness"], emissive: material["emissiveFactor"] }))).toContainEqual({
                pbr: { baseColorFactor: rounded([linear(0x33 / 255), linear(0x66 / 255), linear(0x99 / 255), 1]), metallicFactor: 0.25, roughnessFactor: 0.75 },
                emissive: rounded([0.5, 0.5 * linear(0x80 / 255), 0]),
            });
        });

        it("should keep a variant's id across an edit to its source that keeps its values, with a new shape hash", () => {
            // Arrange
            const thicker: Part = { ...plate, features: [plate.features[0]!, { id: "plate", type: "extrude", profile: "base", distance: 12 }] };

            // Act
            const before = occt.design.build({ document: onePlate, documents: [plate] });
            const after = occt.design.build({ document: onePlate, documents: [thicker] });

            // Assert
            expect(after.parts[0]!.id).toBe(before.parts[0]!.id);
            expect(after.parts[0]!.shapeHash).not.toBe(before.parts[0]!.shapeHash);
        });

        it("should give a part without listed colours or properties none, and no structure keys for them", () => {
            // Arrange
            const bare: Part = { ...post, parts: [{ ...post.parts![0]!, properties: {} }] };

            // Act
            const built = occt.design.build({ document: pair, documents: [plate, bare] });

            // Assert
            expect(Object.keys(built.structure!.parts[0]!).sort()).toEqual(["colorRgba", "id", "name", "properties", "shape"]);
            expect(Object.keys(built.structure!.parts[1]!).sort()).toEqual(["id", "name", "shape"]);
        });

        it("should give the assembly a root in its structure that carries its name and properties, and write them into STEP with the parts'", () => {
            // Arrange
            const numbered: Assembly = { ...pair, meta: { name: "Post pair" }, properties: { partNumber: "PAIR-{tall}", stocked: true } };
            const built = occt.design.build({ document: numbered, documents: [plate, post] });

            // Act
            const document = occt.assembly.manager.buildAssemblyDocument({ structure: built.structure! });
            const step = new TextDecoder().decode(occt.assembly.manager.exportDocumentToStep({ document, fileName: "pair.step", author: "", organization: "", compress: false, tryDownload: false }));

            // Assert
            expect(built.properties).toEqual({ partNumber: "PAIR-9", stocked: true });
            expect(built.structure!.nodes[0]).toEqual({ id: "/", type: "assembly", name: "Post pair", properties: { partNumber: "PAIR-9", stocked: true } });
            expect(built.structure!.parts[0]!.properties).toEqual({ partNumber: "PL-40" });
            expect(step).toMatch(/DESCRIPTIVE_REPRESENTATION_ITEM\('partNumber','PAIR-9'\)/);
            expect(step).toMatch(/DESCRIPTIVE_REPRESENTATION_ITEM\('stocked','true'\)/);
            expect(step).toMatch(/DESCRIPTIVE_REPRESENTATION_ITEM\('partNumber','PL-40'\)/);
            document.delete();
        });

        it("should refuse the reserved property name bomTreatment", () => {
            // Act
            const issues = occt.design.validate({ document: { ...pair, properties: { bomTreatment: "phantom" } }, documents: [plate, post] });

            // Assert
            expect(issues).toEqual([{ path: "/properties/bomTreatment", message: "\"bomTreatment\" is reserved for a later version of the format" }]);
        });

        it("should colour the listed faces in the document, its glTF and the STEP read back", () => {
            // Arrange
            const coloured = colouredPlate([{ faces: { of: "plate", role: "end" }, color: "#ff0000" }], []);
            const built = occt.design.build({ document: onePlate, documents: [coloured] });
            const top = built.parts[0]!.appearance!.faces[0]!.indexes;
            const others = [0, 1, 2, 3, 4, 5].filter(face => !top.includes(face));

            // Act
            const document = occt.assembly.manager.buildAssemblyDocument({ structure: built.structure! });
            const meshed = occt.docToMesh({ document, precision: 0.1, adjustYtoZ: false });
            const step = occt.assembly.manager.exportDocumentToStep({ document, fileName: "plate.step", author: "", organization: "", compress: false, tryDownload: false });
            const reread = occt.assembly.manager.loadStepToDoc({ stepData: step });
            const rereadMeshed = occt.docToMesh({ document: reread, precision: 0.1, adjustYtoZ: false });
            const glb = occt.assembly.manager.exportDocumentToGltf({ document, meshDeflection: 0.1, meshAngle: 0.5, internalVerticesMode: false, controlSurfaceDeflection: false, mergeFaces: false, forceUVExport: false, fileName: "plate.glb", tryDownload: false });

            // Assert
            expect(meshed.colorGroups).toEqual({ "#ff0000ff": top, "#336699ff": others });
            expect(rereadMeshed.colorGroups).toEqual(meshed.colorGroups);
            expect(glbBaseColours(glb)).toContainEqual([1, 0, 0, 1]);
        });

        it("should place sub-assemblies at frames and count their parts through every level", () => {
            // Arrange
            const rig: Assembly = {
                schemaVersion: 1,
                kind: "assembly",
                id: RIG_ID,
                components: [
                    { id: "left", source: { document: PAIR_ID, parameters: { tall: 12 } } },
                    { id: "right", source: { document: PAIR_ID }, at: { origin: [100, 0, 0], normal: [0, 0, 1], direction: [0, 1, 0] } },
                ],
            };

            // Act
            const built = occt.design.build({ document: rig, documents: [plate, post, pair] });

            // Assert
            expect(built.components!.map(entry => [entry.path, entry.parent, entry.assembly === true])).toEqual([
                ["left", undefined, true], ["left/plate", "left", false], ["left/middle", "left", false], ["left/corner", "left", false], ["left/stacked", "left", false],
                ["right", undefined, true], ["right/plate", "right", false], ["right/middle", "right", false], ["right/corner", "right", false], ["right/stacked", "right", false],
            ]);
            expect(placedBox(built, "right/plate")).toEqual({ min: [80, 0, 0], max: [100, 40, 10] });
            expect(placedBox(built, "right/middle")).toEqual({ min: [88, 18, 10], max: [92, 22, 16] });
            expect(built.bom!.map(line => [line.part, line.quantity, line.properties["partNumber"]])).toEqual([[PLATE, 2, "PL-40"], [POST_6, 4, "PO-6"], [expect.stringMatching(/^post-[0-9a-f]{16}$/), 1, "PO-12"], [POST_9, 1, "PO-9"]]);
            expect(built.structure!.nodes.filter(node => node.type === "assembly").map(node => node.id)).toEqual(["/", "left", "right"]);
            expect(built.structure!.nodes.find(node => node.id === "right/plate")!.parentId).toBe("right");
        });

        it("should export nested, turned sub-assemblies to STEP with every solid where its world matrix puts it", () => {
            // Arrange
            const rig: Assembly = {
                schemaVersion: 1,
                kind: "assembly",
                id: RIG_ID,
                components: [
                    { id: "left", source: { document: PAIR_ID, parameters: { tall: 12 } }, at: { origin: [0, -50, 5], normal: [1, 0, 0], direction: [0, 1, 0] } },
                    { id: "right", source: { document: PAIR_ID }, at: { origin: [100, 0, 0], normal: [0, 0, 1], direction: [0, 1, 0] } },
                ],
            };
            const built = occt.design.build({ document: rig, documents: [plate, post, pair] });
            const text = (box: { min: number[]; max: number[] }): string => [...box.min, ...box.max].map(value => String(Number(value.toFixed(3)))).join(",");
            const expected = built.components!.filter(component => component.part !== undefined).map(component => text(placedBox(built, component.path))).sort();

            // Act
            const document = occt.assembly.manager.buildAssemblyDocument({ structure: built.structure! });
            const step = occt.assembly.manager.exportDocumentToStep({ document, fileName: "rig.step", author: "", organization: "", compress: false, tryDownload: false });
            const reread = occt.io.loadSTEPorIGES({ filetext: new TextDecoder().decode(step), fileName: "rig.step", adjustZtoY: false })!;
            const found = occt.shapes.solid.getSolids({ shape: reread }).map(solid => {
                const box = occt.analysis.measure.tightBoundingBox({ shape: solid });
                return text({ min: box.min, max: box.max });
            }).sort();

            // Assert
            expect(expected).toHaveLength(8);
            expect(found).toEqual(expected);
        });

        it("should leave out a suppressed component and skip what is fastened to it, building the rest", () => {
            // Arrange
            const thin: Assembly = {
                ...pair,
                parameters: { ...pair.parameters, bare: true },
                components: pair.components.map(component => component.id === "middle" ? { ...component, suppressed: "bare" } : component),
            };

            // Act
            const built = occt.design.build({ document: thin, documents: [plate, post] });

            // Assert
            expect(built.report.map(entry => [entry.id, entry.status])).toEqual([["plate", "ok"], ["middle", "suppressed"], ["corner", "ok"], ["stacked", "skipped"]]);
            expect(built.report[3]!.messages).toEqual(["the component \"middle\" was suppressed"]);
            expect(built.bom!.map(line => [line.part, line.quantity, line.properties["partNumber"]])).toEqual([[PLATE, 1, "PL-40"], [POST_9, 1, "PO-9"]]);
        });

        it("should fasten sub-assemblies by the connectors they publish, through every level, and fasten parts to them", () => {
            // Arrange
            const stack: Assembly = {
                schemaVersion: 1,
                kind: "assembly",
                id: STACK_ID,
                components: [
                    { id: "lower", source: { document: PAIR_ID } },
                    { id: "upper", source: { document: PAIR_ID } },
                ],
                joints: [{ id: "stacking", type: "fastened", component: "upper", connector: "foot", to: { component: "lower", connector: "peak" } }],
                connectors: [{ id: "summit", component: "upper", connector: "peak" }],
            };
            const tower: Assembly = {
                schemaVersion: 1,
                kind: "assembly",
                id: TOWER_ID,
                components: [
                    { id: "base", source: { document: STACK_ID }, at: { origin: [100, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } },
                    { id: "flag", source: { document: POST_ID, part: "post" } },
                ],
                joints: [{ id: "flagOnTop", type: "fastened", component: "flag", connector: "bottom", to: { component: "base", connector: "summit" } }],
            };

            // Act
            const built = occt.design.build({ document: tower, documents: [plate, post, pair, stack] });

            // Assert
            expect(built.report.filter(entry => entry.status !== "ok")).toEqual([]);
            expect(placedBox(built, "base/lower/plate")).toEqual({ min: [100, 0, 0], max: [140, 20, 10] });
            expect(placedBox(built, "base/upper/plate")).toEqual({ min: [100, 0, 23], max: [140, 20, 33] });
            expect(placedBox(built, "base/upper/middle")).toEqual({ min: [118, 8, 33], max: [122, 12, 39] });
            expect(placedBox(built, "flag")).toEqual({ min: [118, 8, 46], max: [122, 12, 52] });
            expect(built.bom!.map(line => [line.part, line.quantity])).toEqual([[PLATE, 2], [POST_6, 5], [POST_9, 2]]);
        });

        it("should leave out a sub-assembly that cannot be placed with everything inside it, and the parts only it used", () => {
            // Arrange
            const uncapped: Assembly = {
                schemaVersion: 1,
                kind: "assembly",
                id: STACK_ID,
                components: [
                    { id: "lower", source: { document: PAIR_ID } },
                    { id: "upper", source: { document: PAIR_ID, parameters: { capped: false, tall: 12 } } },
                ],
                joints: [{ id: "stacking", type: "fastened", component: "upper", connector: "peak", to: { component: "lower", connector: "peak" } }],
            };
            const missingTarget: Assembly = { ...uncapped, parameters: { bare: true }, components: [{ ...uncapped.components[0]!, suppressed: "bare" }, { ...uncapped.components[1]!, source: { document: PAIR_ID } }] };

            // Act
            const built = occt.design.build({ document: uncapped, documents: [plate, post, pair] });
            const early = occt.design.build({ document: missingTarget, documents: [plate, post, pair] });

            // Assert
            expect(built.report.find(entry => entry.id === "upper")).toMatchObject({ status: "failed", messages: ["/joints/0/connector: the connector \"peak\" was not placed in this build"] });
            expect(built.report.filter(entry => entry.id.startsWith("upper/")).map(entry => [entry.id, entry.status, entry.messages.at(-1)])).toEqual([
                ["upper/plate", "skipped", "the assembly \"upper\" failed"],
                ["upper/middle", "skipped", "the assembly \"upper\" failed"],
                ["upper/corner", "skipped", "the assembly \"upper\" failed"],
                ["upper/stacked", "suppressed", undefined],
            ]);
            expect(built.components!.map(component => component.path)).toEqual(["lower", "lower/plate", "lower/middle", "lower/corner", "lower/stacked"]);
            expect(built.parts.map(part => part.id)).toEqual([PLATE, POST_6, POST_9]);
            expect(built.structure!.parts.map(part => part.id)).toEqual([PLATE, POST_6, POST_9]);
            expect(early.report.map(entry => [entry.id, entry.status])).toEqual([["lower", "suppressed"], ["upper", "skipped"]]);
            expect(early.report[1]!.messages).toEqual(["the component \"lower\" was suppressed"]);
            expect(early.components).toEqual([]);
            expect(early.parts).toEqual([]);
        });

        it("should fail a component whose source refuses its values or whose frame has no direction across its normal, saying where, and pass on its source's problems", () => {
            // Arrange
            const TWIN_ID = "77777777-7777-4777-8777-777777777777";
            const twin: Part = {
                schemaVersion: 1,
                id: TWIN_ID,
                parameters: { capped: false },
                features: [square("base", 10, 10), { id: "block", type: "extrude", profile: "base", distance: 5 }, { id: "cap", type: "extrude", profile: "base", distance: 1, suppressed: "!capped" }],
                parts: [{ id: "block", body: "block" }, { id: "cap", body: "cap" }],
            };
            const odd: Assembly = {
                schemaVersion: 1,
                kind: "assembly",
                components: [
                    { id: "low", source: { document: POST_ID, part: "post", parameters: { height: 0 } } },
                    { id: "upright", source: { document: POST_ID, part: "post" }, at: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [0, 0, -2] } },
                    { id: "block", source: { document: TWIN_ID, part: "block" } },
                ],
            };

            // Act
            const built = occt.design.build({ document: odd, documents: [post, twin] });

            // Assert
            expect(built.report.map(entry => [entry.id, entry.status])).toEqual([["low", "failed"], ["upright", "failed"], ["block", "ok"]]);
            expect(built.report[0]!.messages[0]).toMatch(/^\/components\/0\/source\/parameters: \/parameters\/height: /);
            expect(built.report[1]!.messages).toEqual(["/components/1/at/direction: the direction lies along the normal: the x axis needs a direction across it"]);
            expect(built.issues.map(issue => issue.path)).toEqual(["/documents/1/parts/1/body"]);
            expect(built.issues[0]!.message).toMatch(/^the body "cap" /);
        });

        it("should refuse an assembly that would place more occurrences than the limit, before building anything", () => {
            // Arrange
            const idOf = (level: number): string => `00000000-0000-4000-8000-${String(level).padStart(12, "0")}`;
            const levels: Assembly[] = Array.from({ length: 16 }, (_, level) => ({
                schemaVersion: 1,
                kind: "assembly",
                id: idOf(level),
                components: ["a", "b"].map(id => ({ id, source: level === 0 ? { document: POST_ID, part: "post" } : { document: idOf(level - 1) } })),
            }));

            // Act
            const attempt = (): unknown => occt.design.build({ document: levels[15]!, documents: [post, ...levels] });

            // Assert
            expect(attempt).toThrow("/components: the assembly places more than 100000 occurrences through its levels");
        });

        it("should reuse every feature of an assembly on its next build, even one with more outcomes than the cache holds", () => {
            // Arrange
            class CountingCache extends DesignCache {
                hits = 0;
                override take(hash: string): ReturnType<DesignCache["take"]> {
                    const found = super.take(hash);
                    this.hits += found === undefined ? 0 : 1;
                    return found;
                }
            }
            const variants: Assembly = {
                schemaVersion: 1,
                kind: "assembly",
                components: Array.from({ length: 140 }, (_, index) => ({ id: `p${index}`, source: { document: POST_ID, part: "post", parameters: { height: index + 1, size: 1 + index / 100 } } })),
            };
            const cache = new CountingCache(256);
            const library = libraryOf<Models.OCCT.DesignDocument>([post]).library;
            runAssembly(variants, {}, library, { occt, occ: kernel, cache });
            const before = cache.hits;

            // Act
            runAssembly(variants, {}, library, { occt, occ: kernel, cache });

            // Assert
            expect(before).toBe(0);
            expect(cache.hits).toBe(280);
        });

        it("should free the parts it built when something other than a document problem stops an assembly", () => {
            // Arrange
            const variants: Assembly = { schemaVersion: 1, kind: "assembly", components: [1, 2, 3].map(height => ({ id: `p${height}`, source: { document: POST_ID, part: "post", parameters: { height } } })) };
            const clones: TopoDS_Shape[] = [];
            const prototype = kernel.TopoDS_Shape.prototype as { clone: () => TopoDS_Shape };
            const clone = prototype.clone;
            prototype.clone = function (this: TopoDS_Shape): TopoDS_Shape {
                const made = clone.call(this);
                clones.push(made);
                return made;
            };
            let volumes = 0;
            occt.shapes.solid.getSolidVolume = (): number => {
                volumes++;
                if (volumes === 3) {
                    throw new Error("the kernel gave up");
                }
                return 1;
            };

            // Act
            let thrown: unknown;
            try {
                runAssembly(variants, {}, libraryOf<Models.OCCT.DesignDocument>([post]).library, { occt, occ: kernel, cache: new DesignCache(256) });
            } catch (error) {
                thrown = error;
            } finally {
                prototype.clone = clone;
                Reflect.deleteProperty(occt.shapes.solid, "getSolidVolume");
            }

            // Assert
            expect((thrown as Error).message).toBe("the kernel gave up");
            expect(clones.length).toBeGreaterThanOrEqual(2);
            expect(clones.every(shape => shape.isDeleted())).toBe(true);
        });

        it("should trim the cache once an assembly is built, keeping what it used and freeing what it no longer does", () => {
            // Arrange
            const of = (heights: number[]): Assembly => ({ schemaVersion: 1, kind: "assembly", components: heights.map(height => ({ id: `p${height}`, source: { document: POST_ID, part: "post", parameters: { height, size: height } } })) });
            const cache = new DesignCache(4);
            const library = libraryOf<Models.OCCT.DesignDocument>([post]).library;
            runAssembly(of([1, 2, 3]), {}, library, { occt, occ: kernel, cache });

            // Act
            runAssembly(of([4, 5, 6]), {}, library, { occt, occ: kernel, cache });

            // Assert
            expect(cache.size).toBe(6);
        });

        it("should refuse a document that is not given, has changed since its version, or is written as code", () => {
            // Arrange
            const pinned: Assembly = { ...pair, components: [{ id: "plate", source: { document: PLATE_ID, part: "plate", version: occt.design.versionOf({ document: plate }) } }], joints: [], connectors: [] };
            const edited: Part = { ...plate, parts: [{ ...plate.parts![0]!, name: "Edited plate" }] };
            const described: Part = { ...plate, meta: { description: "Described", revision: "r7" } };

            // Act
            const missing = (): unknown => occt.design.build({ document: pair, documents: [plate] });
            const changed = (): unknown => occt.design.build({ document: pinned, documents: [edited] });
            const kept = occt.design.build({ document: pinned, documents: [plate] });
            const keptAfterMeta = occt.design.build({ document: pinned, documents: [described] });
            const code = (): unknown => occt.design.toTypeScript({ document: pair, documents: [plate, post] });

            // Assert
            expect(missing).toThrow(InputError);
            expect(missing).toThrow(`/components/1/source/document: "${POST_ID}" is not among the documents given`);
            expect(changed).toThrow(`/components/0/source/version: the document "${PLATE_ID}" has changed since this version`);
            expect(kept.report.map(entry => entry.status)).toEqual(["ok"]);
            expect(keptAfterMeta.report.map(entry => entry.status)).toEqual(["ok"]);
            expect(code).toThrow("An assembly document is not written as TypeScript yet");
        });
    });
});
