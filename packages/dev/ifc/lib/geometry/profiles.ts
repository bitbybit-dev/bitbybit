import type { Base } from "@bitbybit-dev/base";
import { wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";
import { axisPlacementFrame } from "../build/placement";
import type { ModelSnapshot } from "../model/snapshot";
import { isList, isReference } from "../step/values";
import type { CurveSampler } from "./curves";
import { UnsupportedGeometryError } from "./errors";
import type { ProfileRegion } from "./geometry-types";
import { placedOnPlan } from "../build/math";

function finiteAttribute(model: ModelSnapshot, id: number, name: string): number {
    const value = model.attribute(id, name);
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new UnsupportedGeometryError(`#${id} has no finite ${name}`);
    }
    return value;
}

function placed(model: ModelSnapshot, profile: number, points: Base.Point2[]): Base.Point2[] {
    const position = model.attribute(profile, "Position");
    if (!isReference(position)) {
        return points;
    }
    const frame = axisPlacementFrame(model, position.ref);
    return points.map((point) => placedOnPlan(frame, point));
}

function iShape(model: ModelSnapshot, profile: number): Base.Point2[] {
    const width = finiteAttribute(model, profile, "OverallWidth") / 2;
    const depth = finiteAttribute(model, profile, "OverallDepth") / 2;
    const web = finiteAttribute(model, profile, "WebThickness") / 2;
    const flange = finiteAttribute(model, profile, "FlangeThickness");
    return [
        [-width, -depth], [width, -depth], [width, -depth + flange], [web, -depth + flange], [web, depth - flange], [width, depth - flange],
        [width, depth], [-width, depth], [-width, depth - flange], [-web, depth - flange], [-web, -depth + flange], [-width, -depth + flange],
    ];
}

export function profileRegion(model: ModelSnapshot, profile: number, curves: CurveSampler): ProfileRegion {
    const type = model.entity(profile).type;
    switch (type) {
        case "IfcArbitraryClosedProfileDef":
        case "IfcArbitraryProfileDefWithVoids": {
            const outer = model.attribute(profile, "OuterCurve");
            if (!isReference(outer)) {
                throw new UnsupportedGeometryError(`#${profile} has no outer curve`);
            }
            const inner = type === "IfcArbitraryProfileDefWithVoids" ? model.attribute(profile, "InnerCurves") : null;
            const holes = (isList(inner) ? inner : []).filter(isReference).map((curve) => wound2(curves.outline(curve.ref), false));
            return { kind: "polygon", outer: wound2(curves.outline(outer.ref), true), holes };
        }
        case "IfcRectangleProfileDef": {
            const x = finiteAttribute(model, profile, "XDim") / 2;
            const y = finiteAttribute(model, profile, "YDim") / 2;
            return { kind: "polygon", outer: wound2(placed(model, profile, [[-x, -y], [x, -y], [x, y], [-x, y]]), true), holes: [] };
        }
        case "IfcIShapeProfileDef":
            return { kind: "polygon", outer: wound2(placed(model, profile, iShape(model, profile)), true), holes: [] };
        case "IfcCircleProfileDef": {
            const [center] = placed(model, profile, [[0, 0]]);
            return { kind: "circle", center: center!, radius: finiteAttribute(model, profile, "Radius") };
        }
        default:
            throw new UnsupportedGeometryError(`An ${type} profile is not supported yet`);
    }
}
