import type * as Models from "../lib/api/models";

export const DRILLED_BRACKET: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    parameters: {
        width: { value: 40, min: 1 },
        depth: { value: 20, min: 1 },
        height: { value: 8, min: 0.5 },
        radius: { value: 3, min: 0 },
        hole: { value: 4, min: 0.1 },
    },
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, start: [0, 0], pen: [{ type: "hLine", length: "width" }, { type: "vLine", length: "depth" }, { type: "hLine", length: "-(width)" }, { type: "close" }] },
        { id: "plate", type: "extrude", profile: "base", distance: "height" },
        { id: "corners", type: "fillet", body: "plate", radius: "radius", edges: { between: [{ of: "plate", role: "side" }, { of: "plate", role: "side" }], count: 4 } },
        {
            id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end", count: 1 }, diameter: "hole",
            at: [{ id: "left", x: "width / 4", y: "depth / 2" }, { id: "right", x: "3 * width / 4", y: "depth / 2" }],
        },
    ],
};

export const SESSION_EDITS = 50;

export const PAST_CAPACITY_EDITS = 120;
