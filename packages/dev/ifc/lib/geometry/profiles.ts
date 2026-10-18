import type { Base } from "@bitbybit-dev/base";
import { roundedCorners2, wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/polygons";
import { axisPlacementFrame } from "../build/placement";
import { radiansPerUnit } from "../build/project";
import type { ModelSnapshot } from "../model/snapshot";
import { isList, isReference } from "../step/values";
import { arcSegments, type CurveSampler } from "./curves";
import { UnsupportedGeometryError } from "./errors";
import type { ProfileCorner, ProfileRegion } from "./geometry-types";
import { placedOnPlan } from "../build/math";
import { operatorMatrix } from "./operators";
import { dot2, length2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { movedCoordinate } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";

const FULL_TURN = 2 * Math.PI;
const SIMILARITY_TOLERANCE = 1e-9;
const MIRROR_ABOUT_Y: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SCHEMA_WITHOUT_EDGE_RADII = "IFC2X3";

function finiteAttribute(model: ModelSnapshot, id: number, name: string): number {
    const value = model.attribute(id, name);
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new UnsupportedGeometryError(`#${id} has no finite ${name}`);
    }
    return value;
}

function optionalAttribute(model: ModelSnapshot, id: number, name: string): number {
    const value = model.attribute(id, name);
    return value === null ? 0 : finiteAttribute(model, id, name);
}

function slopeRise(model: ModelSnapshot, id: number, name: string): number {
    const slope = optionalAttribute(model, id, name);
    return slope === 0 ? 0 : Math.tan(slope * radiansPerUnit(model));
}

function refuseSlope(model: ModelSnapshot, id: number, name: string): void {
    if (optionalAttribute(model, id, name) !== 0) {
        throw new UnsupportedGeometryError(`#${id} has a ${name}, which is not supported yet`);
    }
}

function placed(model: ModelSnapshot, profile: number, points: Base.Point2[]): Base.Point2[] {
    const position = model.attribute(profile, "Position");
    if (!isReference(position)) {
        return points;
    }
    const frame = axisPlacementFrame(model, position.ref);
    return points.map((point) => placedOnPlan(frame, point));
}

function rounded(corners: readonly ProfileCorner[]): Base.Point2[] {
    return roundedCorners2(corners.map((corner) => corner.point), corners.map((corner) => corner.radius), arcSegments);
}

const corner = (x: number, y: number, radius = 0): ProfileCorner => ({ point: [x, y], radius });

function iShape(model: ModelSnapshot, profile: number): ProfileCorner[] {
    const x = finiteAttribute(model, profile, "OverallWidth") / 2;
    const y = finiteAttribute(model, profile, "OverallDepth") / 2;
    const web = finiteAttribute(model, profile, "WebThickness") / 2;
    const flange = finiteAttribute(model, profile, "FlangeThickness");
    const fillet = optionalAttribute(model, profile, "FilletRadius");
    const edge = optionalAttribute(model, profile, "FlangeEdgeRadius");
    const rise = (x - web) * slopeRise(model, profile, "FlangeSlope");
    return [
        corner(-x, -y), corner(x, -y), corner(x, -y + flange, edge), corner(web, -y + flange + rise, fillet),
        corner(web, y - flange - rise, fillet), corner(x, y - flange, edge), corner(x, y), corner(-x, y),
        corner(-x, y - flange, edge), corner(-web, y - flange - rise, fillet), corner(-web, -y + flange + rise, fillet), corner(-x, -y + flange, edge),
    ];
}

function lShape(model: ModelSnapshot, profile: number): ProfileCorner[] {
    refuseSlope(model, profile, "LegSlope");
    const depth = finiteAttribute(model, profile, "Depth");
    const width = model.attribute(profile, "Width") === null ? depth : finiteAttribute(model, profile, "Width");
    const [x, y] = [width / 2, depth / 2];
    const thickness = finiteAttribute(model, profile, "Thickness");
    const fillet = optionalAttribute(model, profile, "FilletRadius");
    const edge = optionalAttribute(model, profile, "EdgeRadius");
    return [corner(-x, -y), corner(x, -y), corner(x, -y + thickness, edge), corner(-x + thickness, -y + thickness, fillet), corner(-x + thickness, y, edge), corner(-x, y)];
}

function uShape(model: ModelSnapshot, profile: number): ProfileCorner[] {
    const y = finiteAttribute(model, profile, "Depth") / 2;
    const x = finiteAttribute(model, profile, "FlangeWidth") / 2;
    const web = finiteAttribute(model, profile, "WebThickness");
    const flange = finiteAttribute(model, profile, "FlangeThickness");
    const fillet = optionalAttribute(model, profile, "FilletRadius");
    const edge = optionalAttribute(model, profile, "EdgeRadius");
    const slope = slopeRise(model, profile, "FlangeSlope");
    const [atWeb, atTip] = [(x - web) * slope, x * slope];
    return [
        corner(-x, -y), corner(x, -y), corner(x, -y + flange - atTip, edge), corner(-x + web, -y + flange + atWeb, fillet),
        corner(-x + web, y - flange - atWeb, fillet), corner(x, y - flange + atTip, edge), corner(x, y), corner(-x, y),
    ];
}

function tShape(model: ModelSnapshot, profile: number): ProfileCorner[] {
    refuseSlope(model, profile, "WebSlope");
    refuseSlope(model, profile, "FlangeSlope");
    const y = finiteAttribute(model, profile, "Depth") / 2;
    const x = finiteAttribute(model, profile, "FlangeWidth") / 2;
    const web = finiteAttribute(model, profile, "WebThickness") / 2;
    const flange = finiteAttribute(model, profile, "FlangeThickness");
    const fillet = optionalAttribute(model, profile, "FilletRadius");
    const flangeEdge = optionalAttribute(model, profile, "FlangeEdgeRadius");
    const webEdge = optionalAttribute(model, profile, "WebEdgeRadius");
    return [
        corner(web, -y, webEdge), corner(web, y - flange, fillet), corner(x, y - flange, flangeEdge), corner(x, y),
        corner(-x, y), corner(-x, y - flange, flangeEdge), corner(-web, y - flange, fillet), corner(-web, -y, webEdge),
    ];
}

function rectangle(model: ModelSnapshot, profile: number, inset: number, radius: number): ProfileCorner[] {
    const x = finiteAttribute(model, profile, "XDim") / 2 - inset;
    const y = finiteAttribute(model, profile, "YDim") / 2 - inset;
    return [corner(-x, -y, radius), corner(x, -y, radius), corner(x, y, radius), corner(-x, y, radius)];
}

function cShape(model: ModelSnapshot, profile: number): ProfileCorner[] {
    const y = finiteAttribute(model, profile, "Depth") / 2;
    const x = finiteAttribute(model, profile, "Width") / 2;
    const wall = finiteAttribute(model, profile, "WallThickness");
    const girth = finiteAttribute(model, profile, "Girth");
    const inner = optionalAttribute(model, profile, "InternalFilletRadius");
    const outer = inner > 0 ? inner + wall : 0;
    return [
        corner(-x, -y, outer), corner(x, -y, outer), corner(x, -y + girth), corner(x - wall, -y + girth), corner(x - wall, -y + wall, inner), corner(-x + wall, -y + wall, inner),
        corner(-x + wall, y - wall, inner), corner(x - wall, y - wall, inner), corner(x - wall, y - girth), corner(x, y - girth), corner(x, y, outer), corner(-x, y, outer),
    ];
}

function zShape(model: ModelSnapshot, profile: number): ProfileCorner[] {
    const y = finiteAttribute(model, profile, "Depth") / 2;
    const x = finiteAttribute(model, profile, "FlangeWidth");
    const web = finiteAttribute(model, profile, "WebThickness") / 2;
    const flange = finiteAttribute(model, profile, "FlangeThickness");
    const fillet = optionalAttribute(model, profile, "FilletRadius");
    const edge = optionalAttribute(model, profile, "EdgeRadius");
    return [
        corner(-web, -y), corner(x, -y), corner(x, -y + flange, edge), corner(web, -y + flange, fillet),
        corner(web, y), corner(-x, y), corner(-x, y - flange, edge), corner(-web, y - flange, fillet),
    ];
}

function asymmetricIShape(model: ModelSnapshot, profile: number): ProfileCorner[] {
    const bottom = finiteAttribute(model, profile, "BottomFlangeWidth") / 2;
    const top = finiteAttribute(model, profile, "TopFlangeWidth") / 2;
    const y = finiteAttribute(model, profile, "OverallDepth") / 2;
    const web = finiteAttribute(model, profile, "WebThickness") / 2;
    const bottomFlange = finiteAttribute(model, profile, "BottomFlangeThickness");
    const topFlange = model.attribute(profile, "TopFlangeThickness") === null ? bottomFlange : finiteAttribute(model, profile, "TopFlangeThickness");
    const bottomFillet = optionalAttribute(model, profile, "BottomFlangeFilletRadius");
    const topFillet = optionalAttribute(model, profile, "TopFlangeFilletRadius");
    const hasEdges = model.schemaName !== SCHEMA_WITHOUT_EDGE_RADII;
    const bottomEdge = hasEdges ? optionalAttribute(model, profile, "BottomFlangeEdgeRadius") : 0;
    const topEdge = hasEdges ? optionalAttribute(model, profile, "TopFlangeEdgeRadius") : 0;
    const bottomRise = hasEdges ? (bottom - web) * slopeRise(model, profile, "BottomFlangeSlope") : 0;
    const topRise = hasEdges ? (top - web) * slopeRise(model, profile, "TopFlangeSlope") : 0;
    return [
        corner(-bottom, -y), corner(bottom, -y), corner(bottom, -y + bottomFlange, bottomEdge), corner(web, -y + bottomFlange + bottomRise, bottomFillet),
        corner(web, y - topFlange - topRise, topFillet), corner(top, y - topFlange, topEdge), corner(top, y), corner(-top, y),
        corner(-top, y - topFlange, topEdge), corner(-web, y - topFlange - topRise, topFillet), corner(-web, -y + bottomFlange + bottomRise, bottomFillet), corner(-bottom, -y + bottomFlange, bottomEdge),
    ];
}

function trapezium(model: ModelSnapshot, profile: number): ProfileCorner[] {
    const x = finiteAttribute(model, profile, "BottomXDim") / 2;
    const top = finiteAttribute(model, profile, "TopXDim");
    const offset = finiteAttribute(model, profile, "TopXOffset");
    const y = finiteAttribute(model, profile, "YDim") / 2;
    return [corner(-x, -y), corner(x, -y), corner(offset + top - x, y), corner(offset - x, y)];
}

function ellipse(model: ModelSnapshot, profile: number): ProfileCorner[] {
    const a = finiteAttribute(model, profile, "SemiAxis1");
    const b = finiteAttribute(model, profile, "SemiAxis2");
    const segments = arcSegments(FULL_TURN);
    return Array.from({ length: segments }, (_, at) => corner(a * Math.cos((FULL_TURN * at) / segments), b * Math.sin((FULL_TURN * at) / segments)));
}

function onPlan(matrix: Base.TransformMatrix, [x, y]: Base.Point2): Base.Point2 {
    return [movedCoordinate(matrix, x, y, 0, 0), movedCoordinate(matrix, x, y, 0, 1)];
}

function isSimilarity(matrix: Base.TransformMatrix): boolean {
    const x: Base.Vector2 = [matrix[0], matrix[1]];
    const y: Base.Vector2 = [matrix[4], matrix[5]];
    const scale = length2(x);
    return Math.abs(length2(y) - scale) <= SIMILARITY_TOLERANCE * scale && Math.abs(dot2(x, y)) <= SIMILARITY_TOLERANCE * scale * scale;
}

function circlePoints(center: Base.Point2, radius: number): Base.Point2[] {
    const segments = arcSegments(FULL_TURN);
    return Array.from({ length: segments }, (_, at) => [center[0] + radius * Math.cos((FULL_TURN * at) / segments), center[1] + radius * Math.sin((FULL_TURN * at) / segments)]);
}

function transformedRegion(region: ProfileRegion, matrix: Base.TransformMatrix): ProfileRegion {
    switch (region.kind) {
        case "composite":
            return { kind: "composite", parts: region.parts.map((part) => transformedRegion(part, matrix)) };
        case "circle":
            if (isSimilarity(matrix)) {
                const scale = length2([matrix[0], matrix[1]]);
                return { kind: "circle", center: onPlan(matrix, region.center), radius: region.radius * scale, innerRadius: region.innerRadius * scale };
            }
            return transformedRegion({ kind: "polygon", outer: circlePoints(region.center, region.radius), holes: region.innerRadius > 0 ? [circlePoints(region.center, region.innerRadius)] : [] }, matrix);
        default:
            return {
                ...region,
                outer: wound2(region.outer.map((point) => onPlan(matrix, point)), true),
                holes: region.holes.map((hole) => wound2(hole.map((point) => onPlan(matrix, point)), false)),
            };
    }
}

function derived(model: ModelSnapshot, profile: number, curves: CurveSampler): ProfileRegion {
    const parent = model.attribute(profile, "ParentProfile");
    if (!isReference(parent)) {
        throw new UnsupportedGeometryError(`#${profile} has no parent profile`);
    }
    if (model.schema.isSubtypeOf(model.entity(profile).type, "IfcMirroredProfileDef")) {
        return transformedRegion(profileRegion(model, parent.ref, curves), MIRROR_ABOUT_Y);
    }
    const operator = model.attribute(profile, "Operator");
    if (!isReference(operator)) {
        throw new UnsupportedGeometryError(`#${profile} has no transformation operator`);
    }
    return transformedRegion(profileRegion(model, parent.ref, curves), operatorMatrix(model, operator.ref));
}

function composite(model: ModelSnapshot, profile: number, curves: CurveSampler): ProfileRegion {
    const profiles = model.attribute(profile, "Profiles");
    const parts = (isList(profiles) ? profiles : []).filter(isReference).map((part) => profileRegion(model, part.ref, curves));
    if (!parts.length) {
        throw new UnsupportedGeometryError(`#${profile} combines no profiles`);
    }
    return { kind: "composite", parts };
}

function polygon(model: ModelSnapshot, profile: number, outer: readonly ProfileCorner[], holes: readonly (readonly ProfileCorner[])[] = []): ProfileRegion {
    return {
        kind: "polygon",
        outer: wound2(placed(model, profile, rounded(outer)), true),
        holes: holes.map((hole) => wound2(placed(model, profile, rounded(hole)), false)),
    };
}

function circle(model: ModelSnapshot, profile: number, innerRadius: number): ProfileRegion {
    const [center] = placed(model, profile, [[0, 0]]);
    return { kind: "circle", center: center!, radius: finiteAttribute(model, profile, "Radius"), innerRadius };
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
            const plane = curves.planeOf(outer.ref);
            const holes = (isList(inner) ? inner : []).filter(isReference).map((curve) => wound2(curves.outline(curve.ref, plane), false));
            const region: ProfileRegion = { kind: "polygon", outer: wound2(curves.outline(outer.ref, plane), true), holes };
            return plane === undefined ? region : { ...region, plane };
        }
        case "IfcRectangleProfileDef":
            return polygon(model, profile, rectangle(model, profile, 0, 0));
        case "IfcRoundedRectangleProfileDef":
            return polygon(model, profile, rectangle(model, profile, 0, finiteAttribute(model, profile, "RoundingRadius")));
        case "IfcRectangleHollowProfileDef": {
            const wall = finiteAttribute(model, profile, "WallThickness");
            const outer = rectangle(model, profile, 0, optionalAttribute(model, profile, "OuterFilletRadius"));
            return polygon(model, profile, outer, [rectangle(model, profile, wall, optionalAttribute(model, profile, "InnerFilletRadius"))]);
        }
        case "IfcIShapeProfileDef":
            return polygon(model, profile, iShape(model, profile));
        case "IfcLShapeProfileDef":
            return polygon(model, profile, lShape(model, profile));
        case "IfcUShapeProfileDef":
            return polygon(model, profile, uShape(model, profile));
        case "IfcTShapeProfileDef":
            return polygon(model, profile, tShape(model, profile));
        case "IfcCShapeProfileDef":
            return polygon(model, profile, cShape(model, profile));
        case "IfcZShapeProfileDef":
            return polygon(model, profile, zShape(model, profile));
        case "IfcAsymmetricIShapeProfileDef":
            return polygon(model, profile, asymmetricIShape(model, profile));
        case "IfcTrapeziumProfileDef":
            return polygon(model, profile, trapezium(model, profile));
        case "IfcEllipseProfileDef":
            return polygon(model, profile, ellipse(model, profile));
        case "IfcDerivedProfileDef":
        case "IfcMirroredProfileDef":
            return derived(model, profile, curves);
        case "IfcCompositeProfileDef":
            return composite(model, profile, curves);
        case "IfcCircleProfileDef":
            return circle(model, profile, 0);
        case "IfcCircleHollowProfileDef": {
            const inner = finiteAttribute(model, profile, "Radius") - finiteAttribute(model, profile, "WallThickness");
            if (!(inner > 0)) {
                throw new UnsupportedGeometryError(`#${profile} has a wall as thick as its radius`);
            }
            return circle(model, profile, inner);
        }
        default:
            throw new UnsupportedGeometryError(`An ${type} profile is not supported yet`);
    }
}
