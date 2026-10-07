import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { add2, cross2, length2, scale2, subtract2 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";
import * as Inputs from "../api/inputs";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, ref } from "../step/values";
import type { Frame3, RoofPlane, RoofSpec } from "./build-types";
import { AGGREGATION, DEGREES_TO_RADIANS } from "./constants";
import { bodyContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { associateNewMaterial, layerSetThickness, layerSetUsage } from "./materials";
import { normalize2 } from "./math";
import { cleanOutline } from "./outlines";
import { objectPlacementOf } from "./placement";
import { relate } from "./relationships";
import { containIn } from "./spatial";

const RECTANGLE_CORNERS = 4;
const RIGHT_ANGLE_COSINE = 1e-6;
const MAX_PITCH_DEGREES = 89;
const ROOF_TYPES: Readonly<Record<Inputs.IFC.roofKindEnum, string>> = {
    [Inputs.IFC.roofKindEnum.flat]: "FLAT_ROOF",
    [Inputs.IFC.roofKindEnum.monoPitch]: "SHED_ROOF",
    [Inputs.IFC.roofKindEnum.gable]: "GABLE_ROOF",
    [Inputs.IFC.roofKindEnum.hip]: "HIP_ROOF",
};

function rectangle(points: readonly Base.Point2[], tolerance: number): Base.Point2[] {
    const corners = cleanOutline(points, tolerance, "roof's outline");
    if (corners.length !== RECTANGLE_CORNERS) {
        throw new Error(`A roof's outline is a rectangle of ${RECTANGLE_CORNERS} corners, got ${corners.length}`);
    }
    corners.forEach((corner, index) => {
        const before = normalize2(subtract2(corner, corners[(index + RECTANGLE_CORNERS - 1) % RECTANGLE_CORNERS]!));
        const after = normalize2(subtract2(corners[(index + 1) % RECTANGLE_CORNERS]!, corner));
        if (Math.abs(before[0] * after[0] + before[1] * after[1]) > RIGHT_ANGLE_COSINE) {
            throw new Error(`A roof's outline is a rectangle, and its corner ${index} is not a right angle`);
        }
    });
    return corners;
}

function expanded(corners: readonly Base.Point2[], overhang: number): Base.Point2[] {
    const along = normalize2(subtract2(corners[1]!, corners[0]!));
    const across = normalize2(subtract2(corners[3]!, corners[0]!));
    const out = (point: Base.Point2, alongSign: number, acrossSign: number): Base.Point2 => add2(point, add2(scale2(along, alongSign * overhang), scale2(across, acrossSign * overhang)));
    return [out(corners[0]!, -1, -1), out(corners[1]!, 1, -1), out(corners[2]!, 1, 1), out(corners[3]!, -1, 1)];
}

function eavesPlane(corners: readonly Base.Point2[], from: number, outline: readonly Base.Point2[]): RoofPlane {
    const start = corners[from]!;
    const along = normalize2(subtract2(corners[(from + 1) % RECTANGLE_CORNERS]!, start));
    const across = normalize2(subtract2(corners[(from + RECTANGLE_CORNERS - 1) % RECTANGLE_CORNERS]!, start));
    return { origin: start, along, inward: across, outline };
}

function gablePlanes(q: readonly Base.Point2[]): RoofPlane[] {
    const middle = (a: Base.Point2, b: Base.Point2): Base.Point2 => scale2(add2(a, b), 1 / 2);
    const ridgeStart = middle(q[0]!, q[3]!);
    const ridgeEnd = middle(q[1]!, q[2]!);
    return [eavesPlane(q, 0, [q[0]!, q[1]!, ridgeEnd, ridgeStart]), eavesPlane(q, 2, [q[2]!, q[3]!, ridgeStart, ridgeEnd])];
}

function hipPlanes(q: readonly Base.Point2[], tolerance: number): RoofPlane[] {
    const corners = length2(subtract2(q[1]!, q[0]!)) >= length2(subtract2(q[2]!, q[1]!)) ? q : [q[1]!, q[2]!, q[3]!, q[0]!];
    const along = normalize2(subtract2(corners[1]!, corners[0]!));
    const across = normalize2(subtract2(corners[3]!, corners[0]!));
    const half = length2(subtract2(corners[3]!, corners[0]!)) / 2;
    const ridgeStart = add2(corners[0]!, add2(scale2(along, half), scale2(across, half)));
    const ridgeEnd = add2(corners[1]!, add2(scale2(along, -half), scale2(across, half)));
    const pointed = !(length2(subtract2(ridgeEnd, ridgeStart)) > tolerance);
    const tops: Base.Point2[][] = [pointed ? [ridgeStart] : [ridgeEnd, ridgeStart], [ridgeEnd], pointed ? [ridgeStart] : [ridgeStart, ridgeEnd], [ridgeStart]];
    return corners.map((corner, index) => eavesPlane(corners, index, [corner, corners[(index + 1) % RECTANGLE_CORNERS]!, ...tops[index]!]));
}

function planesOf(spec: RoofSpec, q: readonly Base.Point2[], tolerance: number): RoofPlane[] {
    switch (spec.kind) {
        case Inputs.IFC.roofKindEnum.monoPitch:
            return [eavesPlane(q, 0, q)];
        case Inputs.IFC.roofKindEnum.gable:
            return gablePlanes(q);
        case Inputs.IFC.roofKindEnum.hip:
            return hipPlanes(q, tolerance);
        default:
            return [{ origin: q[0]!, along: [1, 0], inward: [0, 1], outline: q }];
    }
}

function planeFrame(plane: RoofPlane, height: number, slope: number): Frame3 {
    const along = cross2(plane.along, plane.inward) > 0 ? plane.along : scale2(plane.along, -1);
    const cos = Math.cos(slope);
    const sin = Math.sin(slope);
    const up: Base.Vector3 = [plane.inward[0] * cos, plane.inward[1] * cos, sin];
    const x: Base.Vector3 = [along[0], along[1], 0];
    return { origin: [plane.origin[0], plane.origin[1], height], x, y: up, z: [x[1] * up[2], -x[0] * up[2], x[0] * up[1] - x[1] * up[0]] };
}

function inPlane(plane: RoofPlane, frame: Frame3, slope: number, point: Base.Point2): Base.Point2 {
    const offset = subtract2(point, plane.origin);
    return [offset[0] * frame.x[0] + offset[1] * frame.x[1], (offset[0] * plane.inward[0] + offset[1] * plane.inward[1]) / Math.cos(slope)];
}

export function createRoof(tx: IfcTransaction, writer: EntityWriter, spec: RoofSpec, tolerance: number): number {
    const flat = spec.kind === Inputs.IFC.roofKindEnum.flat;
    if (!flat && !(spec.pitch > 0 && spec.pitch <= MAX_PITCH_DEGREES)) {
        throw new Error(`A sloped roof's pitch is more than 0 and at most ${MAX_PITCH_DEGREES} degrees, got ${spec.pitch}`);
    }
    const thickness = layerSetThickness(tx, spec.layerSet);
    if (!(thickness > 0)) {
        throw new Error("A roof's layers must add up to more than zero thickness");
    }
    if (!(spec.overhang >= 0)) {
        throw new Error(`A roof's overhang is zero or more, got ${spec.overhang}`);
    }
    const slope = flat ? 0 : spec.pitch * DEGREES_TO_RADIANS;
    const outer = expanded(rectangle(spec.outline, tolerance), spec.overhang);
    const eaves = spec.baseOffset - spec.overhang * Math.tan(slope);
    const placement = writer.localPlacement(objectPlacementOf(tx, spec.storey), WORLD_AXES);
    const roof = writer.create("IfcRoof", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name ?? null,
        ObjectPlacement: ref(placement),
        PredefinedType: enumValue(ROOF_TYPES[spec.kind]),
    });
    containIn(tx, writer, spec.storey, roof);
    const parts = planesOf(spec, outer, tolerance).map((plane) => {
        const frame = planeFrame(plane, flat ? spec.baseOffset : eaves, slope);
        const outline = wound2(plane.outline.map((point) => inPlane(plane, frame, slope, point)), true);
        const solid = writer.extrusion(writer.profile({ outer: outline, holes: [] }), WORLD_AXES, thickness);
        const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [solid]);
        return writer.create("IfcSlab", {
            GlobalId: tx.globalId(undefined),
            Name: spec.name ?? null,
            ObjectPlacement: ref(writer.localPlacement(placement, frame)),
            Representation: ref(writer.productShape([body])),
            PredefinedType: enumValue("ROOF"),
        });
    });
    relate(tx, writer, AGGREGATION, roof, parts);
    associateNewMaterial(tx, writer, parts, layerSetUsage(writer, spec.layerSet, "AXIS3", "POSITIVE", 0));
    return roof;
}
