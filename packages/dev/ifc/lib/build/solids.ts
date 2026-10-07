import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type { IfcValue } from "../step/step-types";
import { isReference } from "../step/values";
import type { Frame3, ModelReader } from "./build-types";
import { axisPlacementFrame, directionOf } from "./placement";

export function frameOf(reader: ModelReader, placement: IfcValue): Frame3 {
    return isReference(placement) ? axisPlacementFrame(reader, placement.ref) : WORLD_AXES;
}

export function extrusionCorners(reader: ModelReader, item: number): Base.Point3[] {
    if (reader.entity(item).type !== "IfcExtrudedAreaSolid") {
        return [];
    }
    const profile = reader.attribute(item, "SweptArea");
    const depth = reader.attribute(item, "Depth");
    if (!isReference(profile) || reader.entity(profile.ref).type !== "IfcRectangleProfileDef" || typeof depth !== "number") {
        return [];
    }
    const xDim = reader.attribute(profile.ref, "XDim");
    const yDim = reader.attribute(profile.ref, "YDim");
    if (typeof xDim !== "number" || typeof yDim !== "number") {
        return [];
    }
    const profileFrame = frameOf(reader, reader.attribute(profile.ref, "Position"));
    const solidFrame = frameOf(reader, reader.attribute(item, "Position"));
    const direction = directionOf(reader, reader.attribute(item, "ExtrudedDirection"), [0, 0, 1]);
    const scale = depth / Math.hypot(direction[0], direction[1], direction[2]);
    const corners: Base.Point3[] = [];
    for (const x of [-xDim / 2, xDim / 2]) {
        for (const y of [-yDim / 2, yDim / 2]) {
            const base = pointToWorld(profileFrame, [x, y, 0]);
            corners.push(pointToWorld(solidFrame, base), pointToWorld(solidFrame, [base[0] + direction[0] * scale, base[1] + direction[1] * scale, direction[2] * scale]));
        }
    }
    return corners;
}
