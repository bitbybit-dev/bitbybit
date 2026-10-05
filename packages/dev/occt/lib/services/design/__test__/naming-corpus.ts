import type * as Models from "../../../api/models";
import type { BenchmarkCase, FaceIntent } from "./naming-benchmark";

type Part = Models.OCCT.DesignPartDocument;
type Feature = Models.OCCT.DesignFeature;
type Value = Models.OCCT.DesignNumber;

const UP: Models.OCCT.DesignPoint = [0, 0, 1];

const plane = (point: Models.OCCT.DesignPoint, normal: Models.OCCT.DesignPoint): FaceIntent => ({ plane: { point, normal } });

const rectanglePen = (width: Value, depth: Value, ids: [string?, string?, string?, string?] = []): Models.OCCT.DesignPenCommand[] => [
    { type: "hLine", ...(ids[0] === undefined ? {} : { id: ids[0] }), length: width },
    { type: "vLine", ...(ids[1] === undefined ? {} : { id: ids[1] }), length: depth },
    { type: "hLine", ...(ids[2] === undefined ? {} : { id: ids[2] }), length: typeof width === "number" ? -width : `-(${width})` },
    { type: "close", ...(ids[3] === undefined ? {} : { id: ids[3] }) },
];

const rectangle = (id: string, on: Models.OCCT.DesignSketchPlacement, start: [Value, Value], width: Value, depth: Value, ids: [string?, string?, string?, string?] = []): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on,
    start,
    pen: rectanglePen(width, depth, ids),
});

const block = (width: Value = 40, depth: Value = 20, height: Value = 10): Feature[] => [
    rectangle("base", { plane: "XY" }, [0, 0], width, depth, ["south", "east", "north", "west"]),
    { id: "block", type: "extrude", profile: "base", distance: height },
];

const top: Models.OCCT.DesignFaceReference = { of: "block", role: "end", count: 1 };

const appended = (document: Part, ...features: Feature[]): Part => ({ ...document, features: [...document.features, ...features] });

const replaced = (document: Part, id: string, change: (feature: Feature) => Feature): Part => ({ ...document, features: document.features.map(feature => feature.id === id ? change(feature) : feature) });

const slot = (id: string): Feature[] => [
    rectangle(`${id}Sketch`, { plane: "XY", offset: -1 }, [18, -1], 4, 22),
    { id, type: "extrude", profile: `${id}Sketch`, distance: 12, body: "block", join: "cut" },
];

const bossOnPad: BenchmarkCase = {
    id: "boss-on-pad",
    about: "A pad on the top face of a pad, with the base sketch, the base height and the second sketch's position changed: the classic case of the second sketch's support face renumbered.",
    document: {
        schemaVersion: 1,
        parameters: { width: 40, depth: 20, height: 10, bossX: 10 },
        features: [
            ...block("width", "depth", "height"),
            rectangle("top", { face: top, origin: ["bossX", 5, 0], direction: [1, 0, 0] }, [0, 0], 6, 6, ["south", "east", "north", "west"]),
            { id: "boss", type: "extrude", profile: "top", distance: 5, body: "block", join: "add" },
        ],
    },
    body: "block",
    references: [
        { id: "bossTop", faces: { of: "boss", role: "end", count: 1 }, intent: plane([0, 0, "height + 5"], UP) },
        { id: "blockTop", faces: top, intent: plane([0, 0, "height"], UP) },
        { id: "east", faces: { of: "block", role: "side", from: "base.east", count: 1 }, intent: plane(["width", 0, 0], [1, 0, 0]) },
        { id: "bossEdge", edges: { between: [{ of: "boss", role: "side", from: "top.south" }, { of: "boss", role: "end" }], count: 1 }, intent: { between: [plane([0, 5, 0], [0, -1, 0]), plane([0, 0, "height + 5"], UP)] } },
    ],
    variations: [
        { id: "as written" },
        { id: "wider", parameters: { width: 60 } },
        { id: "taller", parameters: { height: 15 } },
        { id: "boss moved", parameters: { bossX: 30 } },
        {
            id: "corner rounded in the base sketch",
            edit: document => replaced(document, "base", feature => feature.type === "sketch" ? { ...feature, pen: [...(feature.pen ?? []).slice(0, 2), { type: "filletCorner", radius: 3 }, ...(feature.pen ?? []).slice(2)] } : feature),
        },
    ],
};

const splitBySlot: BenchmarkCase = {
    id: "split-by-slot",
    about: "A slot cut across the top face splits it in two: a reference that counts one face and one that does not.",
    document: { schemaVersion: 1, parameters: { slotted: false }, features: [...block(), ...slot("slot").map(feature => feature.type === "extrude" ? { ...feature, suppressed: "!slotted" } : feature)] },
    body: "block",
    references: [
        { id: "topCounted", faces: top, intent: plane([0, 0, 10], UP) },
        { id: "topAll", faces: { of: "block", role: "end" }, intent: plane([0, 0, 10], UP) },
        { id: "west", faces: { of: "block", role: "side", from: "base.west", count: 1 }, intent: plane([0, 0, 0], [-1, 0, 0]) },
    ],
    variations: [{ id: "whole" }, { id: "slotted", parameters: { slotted: true } }],
};

const patternCount: BenchmarkCase = {
    id: "pattern-count",
    about: "Pins in a linear pattern whose count is a parameter: a reference to one copy and one to every copy.",
    document: {
        schemaVersion: 1,
        parameters: { count: 3 },
        features: [
            rectangle("pinSketch", { plane: "XY" }, [4, 8], 4, 4),
            { id: "pin", type: "extrude", profile: "pinSketch", distance: 6 },
            { id: "row", type: "linearPattern", body: "pin", direction: [1, 0, 0], spacing: 12, count: "count" },
        ],
    },
    body: "pin",
    references: [
        { id: "secondCopy", faces: { of: "pin", role: "end", copy: { of: "row", index: 2 }, count: 1 }, intent: { contains: [[30, 10, 6]] } },
        { id: "everyCopy", faces: { of: "pin", role: "end", copy: { of: "row", index: "all" } }, intent: plane([0, 0, 6], UP) },
    ],
    variations: [{ id: "three" }, { id: "five", parameters: { count: 5 } }, { id: "two", parameters: { count: 2 } }],
};

const holePositions: BenchmarkCase = {
    id: "hole-positions",
    about: "A row of holes named by position ids, with a position moved, removed and inserted before the referenced one.",
    document: {
        schemaVersion: 1,
        parameters: { bx: 20 },
        features: [...block(), { id: "holes", type: "hole", body: "block", on: top, at: [{ id: "a", x: 8, y: 10 }, { id: "b", x: "bx", y: 10 }, { id: "c", x: 32, y: 10 }], diameter: 4 }],
    },
    body: "block",
    references: [
        { id: "wallB", faces: { of: "holes", role: "wall", from: "b", count: 1 }, intent: { contains: [["bx + 2", 10, 5]] } },
        { id: "top", faces: top, intent: plane([0, 0, 10], UP) },
    ],
    variations: [
        { id: "as written" },
        { id: "b moved", parameters: { bx: 15 } },
        { id: "a removed", edit: document => replaced(document, "holes", feature => feature.type === "hole" ? { ...feature, at: feature.at.slice(1) } : feature) },
        { id: "d inserted first", edit: document => replaced(document, "holes", feature => feature.type === "hole" ? { ...feature, at: [{ id: "d", x: 14, y: 4 }, ...feature.at] } : feature) },
        { id: "b removed", edit: document => replaced(document, "holes", feature => feature.type === "hole" ? { ...feature, at: feature.at.filter(position => Array.isArray(position) || position.id !== "b") } : feature) },
    ],
};

const lShape = (pen: Models.OCCT.DesignPenCommand[]): Part => ({
    schemaVersion: 1,
    features: [{ id: "base", type: "sketch", on: { plane: "XY" }, start: [0, 0], pen }, { id: "block", type: "extrude", profile: "base", distance: 8 }],
});

const L_PEN: Models.OCCT.DesignPenCommand[] = [
    { type: "hLine", id: "s", length: 30 },
    { type: "vLine", id: "e", length: 10 },
    { type: "hLine", id: "n1", length: -15 },
    { type: "vLine", id: "step", length: 10 },
    { type: "hLine", id: "n2", length: -15 },
    { type: "close", id: "w" },
];

const commandEdits: BenchmarkCase = {
    id: "command-edits",
    about: "An L-shaped profile whose sketch gains commands before and after the referenced sides: names by command id against names by position.",
    document: lShape(L_PEN),
    body: "block",
    references: [
        { id: "step", faces: { of: "block", role: "side", from: "base.step", count: 1 }, intent: plane([15, 0, 0], [1, 0, 0]) },
        { id: "east", faces: { of: "block", role: "side", from: "base.e", count: 1 }, intent: plane([30, 0, 0], [1, 0, 0]) },
        { id: "stepTop", edges: { between: [{ of: "block", role: "side", from: "base.step" }, { of: "block", role: "end" }], count: 1 }, intent: { between: [plane([15, 0, 0], [1, 0, 0]), plane([0, 0, 8], UP)] } },
    ],
    variations: [
        { id: "as written" },
        { id: "a line split before the step", edit: () => lShape([L_PEN[0]!, L_PEN[1]!, { type: "hLine", id: "n1", length: -5 }, { type: "hLine", length: -10 }, ...L_PEN.slice(3)]) },
        { id: "a chamfer at the first corner", edit: () => lShape([L_PEN[0]!, { type: "chamferCorner", distance: 2 }, ...L_PEN.slice(1)]) },
        { id: "redrawn without ids", edit: () => lShape(L_PEN.map(command => Object.fromEntries(Object.entries(command).filter(([key]) => key !== "id")) as Models.OCCT.DesignPenCommand)) },
    ],
};

const edgeProbe: Models.OCCT.DesignEdgeReference = { between: [{ of: "block", role: "side", from: "base.south" }, { of: "block", role: "end" }], count: 1 };

const insertedBefore: BenchmarkCase = {
    id: "inserted-before",
    about: "Features inserted before the end of the history: a pocket away from a referenced edge, and a slot across it that splits it in two.",
    document: { schemaVersion: 1, features: block() },
    body: "block",
    references: [
        { id: "southTopCounted", edges: edgeProbe, intent: { between: [plane([0, 0, 0], [0, -1, 0]), plane([0, 0, 10], UP)] } },
        { id: "south", faces: { of: "block", role: "side", from: "base.south", count: 1 }, intent: plane([0, 0, 0], [0, -1, 0]) },
    ],
    variations: [
        { id: "as written" },
        {
            id: "pocket away from the edge",
            edit: document => appended(document, rectangle("dent", { face: top, origin: [30, 12, 0], direction: [1, 0, 0] }, [-2, -2], 4, 4), { id: "dip", type: "pocket", profile: "dent", body: "block", distance: 3 }),
        },
        { id: "slot across the edge", edit: document => appended(document, ...slot("slot")) },
    ],
};

const filletRadius: BenchmarkCase = {
    id: "fillet-radius",
    about: "A fillet whose radius changes, and the faces it shrinks: the round face and the faces beside it.",
    document: {
        schemaVersion: 1,
        parameters: { radius: 2 },
        features: [...block(), { id: "round", type: "fillet", body: "block", radius: "radius", edges: edgeProbe }],
    },
    body: "block",
    references: [
        { id: "round", faces: { of: "round", role: "round", count: 1 }, intent: { cylinder: { point: [0, "radius", "10 - radius"], direction: [1, 0, 0], radius: "radius" } } },
        { id: "top", faces: top, intent: plane([0, 0, 10], UP) },
        { id: "south", faces: { of: "block", role: "side", from: "base.south", count: 1 }, intent: plane([0, 0, 0], [0, -1, 0]) },
    ],
    variations: [{ id: "radius 2" }, { id: "radius 1", parameters: { radius: 1 } }, { id: "radius 4", parameters: { radius: 4 } }],
};

const mirrorCopy: BenchmarkCase = {
    id: "mirror-copy",
    about: "A body mirrored with its original kept, moved by a parameter: references to the original and to the copy.",
    document: {
        schemaVersion: 1,
        parameters: { x: 5 },
        features: [
            rectangle("base", { plane: "XY" }, ["x", 0], 10, 10),
            { id: "block", type: "extrude", profile: "base", distance: 5 },
            { id: "flip", type: "mirror", body: "block", plane: { origin: [0, 0, 0], normal: [1, 0, 0] }, keepOriginal: true },
        ],
    },
    body: "block",
    references: [
        { id: "original", faces: top, intent: { contains: [["x + 5", 5, 5]] } },
        { id: "copy", faces: { of: "block", role: "end", copy: { of: "flip", index: 1 }, count: 1 }, intent: { contains: [["-x - 5", 5, 5]] } },
    ],
    variations: [{ id: "near" }, { id: "far", parameters: { x: 12 } }],
};

const ON_XZ: Models.OCCT.DesignSketchPlacement = { frame: { origin: [0, 0, 0], normal: [0, -1, 0], direction: [1, 0, 0] } };

const casingPen = (outer: Models.OCCT.DesignPenCommand[]): Models.OCCT.DesignPenCommand[] => [
    { type: "hLine", id: "bottom", length: "outer - inner" },
    ...outer,
    { type: "hLine", id: "top", length: "inner - outer" },
    { type: "close", id: "inner" },
];

const casing = (outer: Models.OCCT.DesignPenCommand[]): Part => ({
    schemaVersion: 1,
    parameters: { inner: 30, outer: 34, length: 60 },
    features: [
        { id: "profile", type: "sketch", on: ON_XZ, start: ["inner", 0], pen: casingPen(outer) },
        { id: "casing", type: "revolve", profile: "profile", axis: { origin: [0, 0, 0], direction: [0, 0, 1] }, angle: 360 },
    ],
});

const revolvedCasing: BenchmarkCase = {
    id: "revolved-casing",
    about: "A revolved casing wall: thickness and length changed, and a groove drawn into the outer side of its profile.",
    document: casing([{ type: "vLine", id: "outer", length: "length" }]),
    body: "casing",
    references: [
        { id: "outerWall", faces: { of: "casing", role: "side", from: "profile.outer" }, intent: { cylinder: { point: [0, 0, 0], direction: UP, radius: "outer" } } },
        { id: "topRing", faces: { of: "casing", role: "side", from: "profile.top", count: 1 }, intent: plane([0, 0, "length"], UP) },
        { id: "innerWall", faces: { of: "casing", role: "side", from: "profile.inner", count: 1 }, intent: { cylinder: { point: [0, 0, 0], direction: UP, radius: "inner" } } },
    ],
    variations: [
        { id: "as written" },
        { id: "thicker", parameters: { outer: 38 } },
        { id: "longer", parameters: { length: 80 } },
        {
            id: "groove drawn into the outer side",
            edit: () => casing([
                { type: "vLine", id: "outer", length: "length / 2 - 2" },
                { type: "hLine", length: -2 },
                { type: "vLine", length: 4 },
                { type: "hLine", length: 2 },
                { type: "vLine", length: "length / 2 - 2" },
            ]),
        },
    ],
};

const slottedDisk: BenchmarkCase = {
    id: "slotted-disk",
    about: "A disk with a ring of slots whose count is a parameter, cutting its rim into pieces: the rim with and without a count.",
    document: {
        schemaVersion: 1,
        parameters: { slots: 6 },
        features: [
            { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "circle", id: "rim", centre: [0, 0], radius: 30 }] },
            { id: "disk", type: "extrude", profile: "base", distance: 5 },
            rectangle("slotSketch", { plane: "XY", offset: -1 }, [26, -2], 6, 4),
            { id: "tool", type: "extrude", profile: "slotSketch", distance: 7 },
            { id: "ring", type: "polarPattern", body: "tool", axis: { origin: [0, 0, 0], direction: UP }, count: "slots", angle: 360 },
            { id: "cut", type: "boolean", operation: "difference", body: "disk", tools: ["tool"] },
        ],
    },
    body: "disk",
    references: [
        { id: "rim", faces: { of: "disk", role: "side", from: "base.rim" }, intent: { cylinder: { point: [0, 0, 0], direction: UP, radius: 30 } } },
        { id: "rimCounted", faces: { of: "disk", role: "side", from: "base.rim", count: 1 }, intent: { cylinder: { point: [0, 0, 0], direction: UP, radius: 30 } } },
        { id: "bottom", faces: { of: "disk", role: "start", count: 1 }, intent: plane([0, 0, 0], [0, 0, -1]) },
    ],
    variations: [{ id: "six" }, { id: "eight", parameters: { slots: 8 } }, { id: "twelve", parameters: { slots: 12 } }],
};

const mergedTops: BenchmarkCase = {
    id: "merged-tops",
    about: "Two blocks joined side by side, then their coplanar faces merged by an operation without a history: the faces lose their lineage.",
    document: {
        schemaVersion: 1,
        parameters: { merged: false },
        features: [
            rectangle("aSketch", { plane: "XY" }, [0, 0], 10, 10),
            { id: "a", type: "extrude", profile: "aSketch", distance: 5 },
            rectangle("bSketch", { plane: "XY" }, [10, 0], 10, 10),
            { id: "b", type: "extrude", profile: "bSketch", distance: 5 },
            { id: "joined", type: "boolean", operation: "union", body: "a", tools: ["b"] },
            { id: "unified", type: "operation", operation: "occt.shapes.shape.unifySameDomain", params: { shape: { body: "a" }, unifyEdges: true, unifyFaces: true, concatBSplines: true }, body: "a", suppressed: "!merged" },
        ],
    },
    body: "a",
    references: [
        { id: "aTop", faces: { of: "a", role: "end", count: 1 }, intent: { contains: [[5, 5, 5]] } },
        { id: "bSide", faces: { of: "b", role: "side", count: 3 }, intent: { contains: [[15, 0, 2.5], [20, 5, 2.5], [15, 10, 2.5]] } },
    ],
    variations: [{ id: "separate" }, { id: "merged", parameters: { merged: true } }],
};

const pocketThrough: BenchmarkCase = {
    id: "pocket-through",
    about: "A pocket deepened until it goes through, so its floor stops existing: the reference should then fail, not find another face.",
    document: {
        schemaVersion: 1,
        parameters: { depth: 4 },
        features: [...block(), rectangle("dent", { face: top, origin: [20, 10, 0], direction: [1, 0, 0] }, [-3, -3], 6, 6), { id: "dip", type: "pocket", profile: "dent", body: "block", distance: "depth" }],
    },
    body: "block",
    references: [
        { id: "floor", faces: { of: "dip", role: "end", count: 1 }, intent: plane([0, 0, "10 - depth"], UP) },
        { id: "top", faces: top, intent: plane([0, 0, 10], UP) },
    ],
    variations: [{ id: "shallow" }, { id: "deep", parameters: { depth: 8 } }, { id: "through", parameters: { depth: 12 } }],
};

const washerLoops: BenchmarkCase = {
    id: "washer-loops",
    about: "One sketch of two loops, a square outline and a round bore: the bore resized and a corner chamfered in the outline.",
    document: {
        schemaVersion: 1,
        parameters: { bore: 4 },
        features: [
            { id: "base", type: "sketch", on: { plane: "XY" }, loops: [{ start: [-15, -15], pen: rectanglePen(30, 30, ["s", "e", "n", "w"]) }, { pen: [{ type: "circle", id: "bore", centre: [0, 0], radius: "bore" }] }] },
            { id: "washer", type: "extrude", profile: "base", distance: 3 },
        ],
    },
    body: "washer",
    references: [
        { id: "boreWall", faces: { of: "washer", role: "side", from: "base.bore", count: 1 }, intent: { cylinder: { point: [0, 0, 0], direction: UP, radius: "bore" } } },
        { id: "east", faces: { of: "washer", role: "side", from: "base.e", count: 1 }, intent: plane([15, 0, 0], [1, 0, 0]) },
    ],
    variations: [
        { id: "small bore" },
        { id: "large bore", parameters: { bore: 9 } },
        {
            id: "outline corner chamfered",
            edit: document => replaced(document, "base", feature => feature.type === "sketch" && feature.loops !== undefined ? { ...feature, loops: [{ ...feature.loops[0]!, pen: [feature.loops[0]!.pen[0]!, { type: "chamferCorner", distance: 3 }, ...feature.loops[0]!.pen.slice(1)] }, ...feature.loops.slice(1)] } : feature),
        },
    ],
};

const reorderedCuts: BenchmarkCase = {
    id: "reordered-cuts",
    about: "Two independent pockets whose order in the history is swapped.",
    document: {
        schemaVersion: 1,
        features: [
            ...block(),
            rectangle("leftSketch", { face: top, origin: [8, 10, 0], direction: [1, 0, 0] }, [-3, -3], 6, 6),
            { id: "left", type: "pocket", profile: "leftSketch", body: "block", distance: 3 },
            rectangle("rightSketch", { face: top, origin: [32, 10, 0], direction: [1, 0, 0] }, [-3, -3], 6, 6),
            { id: "right", type: "pocket", profile: "rightSketch", body: "block", distance: 5 },
        ],
    },
    body: "block",
    references: [
        { id: "leftFloor", faces: { of: "left", role: "end", count: 1 }, intent: plane([0, 0, 7], UP) },
        { id: "rightFloor", faces: { of: "right", role: "end", count: 1 }, intent: plane([0, 0, 5], UP) },
        { id: "top", faces: top, intent: plane([0, 0, 10], UP) },
    ],
    variations: [
        { id: "left first" },
        {
            id: "right first",
            edit: document => {
                const [base, extrude, leftSketch, left, rightSketch, right] = document.features as [Feature, Feature, Feature, Feature, Feature, Feature];
                return { ...document, features: [base, extrude, rightSketch, right, leftSketch, left] };
            },
        },
    ],
};

const tabbed = (east: Models.OCCT.DesignPenCommand[]): Part => ({
    schemaVersion: 1,
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, start: [0, 0], pen: [{ type: "hLine", id: "south", length: 40 }, ...east, { type: "hLine", id: "north", length: -40 }, { type: "close", id: "west" }] },
        { id: "block", type: "extrude", profile: "base", distance: 10 },
    ],
});

const filterDrift: BenchmarkCase = {
    id: "filter-drift",
    about: "A face picked by a filter (the side furthest along X) when the profile gains a tab beyond it: the filter moves to the tab while the face it meant still exists.",
    document: tabbed([{ type: "vLine", id: "east", length: 20 }]),
    body: "block",
    references: [
        { id: "byFilter", faces: { of: "block", role: "side", filter: { select: "extreme", direction: [1, 0, 0] }, count: 1 }, intent: plane([40, 0, 0], [1, 0, 0]) },
        { id: "byCommand", faces: { of: "block", role: "side", from: "base.east", count: 1 }, intent: plane([40, 0, 0], [1, 0, 0]) },
    ],
    variations: [
        { id: "as written" },
        {
            id: "tab drawn beyond the east side",
            edit: () => tabbed([
                { type: "vLine", id: "east", length: 8 },
                { type: "hLine", length: 5 },
                { type: "vLine", length: 4 },
                { type: "hLine", length: -5 },
                { type: "vLine", length: 8 },
            ]),
        },
    ],
};

const turnedAndMoved: BenchmarkCase = {
    id: "turned-and-moved",
    about: "A drilled block turned about its corner and moved by operations that keep no history of their own but keep every face as it was.",
    document: {
        schemaVersion: 1,
        parameters: { angle: 0, dx: 0 },
        features: [
            ...block(),
            { id: "holes", type: "hole", body: "block", on: top, at: [{ id: "a", x: 8, y: 10 }, { id: "b", x: 32, y: 10 }], diameter: 4 },
            { id: "turned", type: "operation", operation: "occt.transforms.rotate", params: { shape: { body: "block" }, axis: [0, 0, 1], angle: { expr: "angle" } }, body: "block" },
            { id: "moved", type: "operation", operation: "occt.transforms.translate", params: { shape: { body: "block" }, translation: [{ expr: "dx" }, 0, 0] }, body: "block" },
        ],
    },
    body: "block",
    references: [
        { id: "east", faces: { of: "block", role: "side", from: "base.east", count: 1 }, intent: plane(["dx + 40 * cos(angle)", "40 * sin(angle)", 0], ["cos(angle)", "sin(angle)", 0]) },
        { id: "wallB", faces: { of: "holes", role: "wall", from: "b", count: 1 }, intent: { contains: [["dx + 34 * cos(angle) - 10 * sin(angle)", "34 * sin(angle) + 10 * cos(angle)", 5]] } },
        { id: "top", faces: top, intent: plane([0, 0, 10], UP) },
    ],
    variations: [
        { id: "as written" },
        { id: "turned a quarter", parameters: { angle: 90 } },
        { id: "turned an eighth and moved", parameters: { angle: 45, dx: 25 } },
    ],
};

export const NAMING_CORPUS: readonly BenchmarkCase[] = [
    bossOnPad,
    splitBySlot,
    patternCount,
    holePositions,
    commandEdits,
    insertedBefore,
    filletRadius,
    mirrorCopy,
    revolvedCasing,
    slottedDisk,
    mergedTops,
    pocketThrough,
    washerLoops,
    reorderedCuts,
    filterDrift,
    turnedAndMoved,
];
