import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, vectorToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, isReference, ref } from "../step/values";
import type { Frame3, ModelReader, SlabOpeningSpec } from "./build-types";
import { VERTICAL_COSINE, VOIDING } from "./constants";
import { bodyContext } from "./contexts";
import { polylinePoints } from "./curves";
import type { EntityWriter } from "./entity-writer";
import { normalize3, placedOnPlan } from "./math";
import { openingMargin } from "./openings";
import { cleanOutline, edgesCross, isInsideOrOn } from "./outlines";
import { absoluteFrame, directionOf, objectPlacementOf } from "./placement";
import { firstItem, representationOf, unwrapClippings } from "./representations";
import { frameOf } from "./solids";
import { describeObject } from "./spatial";

const ARBITRARY_PROFILES = ["IfcArbitraryClosedProfileDef", "IfcArbitraryProfileDefWithVoids"];

function extrudedSolidOf(reader: ModelReader, slab: number): number {
    const body = representationOf(reader, slab, "Body");
    if (body === undefined) {
        throw new Error(`${describeObject(reader, slab)} has no Body representation to cut`);
    }
    const [solid] = unwrapClippings(reader, firstItem(reader, body));
    if (reader.entity(solid).type !== "IfcExtrudedAreaSolid") {
        throw new Error(`${describeObject(reader, slab)} has a body this library does not cut: an ${reader.entity(solid).type}, where an outline extruded up or down is expected`);
    }
    return solid;
}

function verticalSpan(reader: ModelReader, slab: number, solid: number, frame: Frame3): [number, number] {
    const direction = vectorToWorld(frame, normalize3(directionOf(reader, reader.attribute(solid, "ExtrudedDirection"), [0, 0, 1])));
    const depth = reader.attribute(solid, "Depth");
    if (typeof depth !== "number" || Math.abs(frame.z[2]) < VERTICAL_COSINE || Math.abs(direction[2]) < VERTICAL_COSINE) {
        throw new Error(`${describeObject(reader, slab)} is not extruded straight up or down, so this library does not cut it`);
    }
    const far = frame.origin[2] + direction[2] * depth;
    return [Math.min(frame.origin[2], far), Math.max(frame.origin[2], far)];
}

function outlineOf(reader: ModelReader, solid: number, frame: Frame3): Base.Point2[] | undefined {
    const profile = reader.attribute(solid, "SweptArea");
    if (!isReference(profile) || !ARBITRARY_PROFILES.includes(reader.entity(profile.ref).type)) {
        return undefined;
    }
    const outer = reader.attribute(profile.ref, "OuterCurve");
    const points = isReference(outer) ? polylinePoints(reader, outer.ref) : undefined;
    return points?.map((point) => placedOnPlan(frame, point));
}

export function createSlabOpening(tx: IfcTransaction, writer: EntityWriter, spec: SlabOpeningSpec, tolerance: number): number {
    const placement = objectPlacementOf(tx, spec.slab);
    if (absoluteFrame(tx, placement).z[2] < VERTICAL_COSINE) {
        throw new Error(`${describeObject(tx, spec.slab)} is not level, so this library does not cut it`);
    }
    const solid = extrudedSolidOf(tx, spec.slab);
    const frame = frameOf(tx, tx.attribute(solid, "Position"));
    const [bottom, top] = verticalSpan(tx, spec.slab, solid, frame);
    const outline = wound2(cleanOutline(spec.outline, tolerance, "opening's outline"), true);
    const slabOutline = outlineOf(tx, solid, frame);
    if (slabOutline && (!outline.every((point) => isInsideOrOn(point, slabOutline, tolerance)) || edgesCross(outline, slabOutline, tolerance))) {
        throw new Error(`The opening's outline reaches outside ${describeObject(tx, spec.slab)}`);
    }
    const margin = openingMargin(top - bottom);
    const openingPlacement = writer.localPlacement(placement, { ...WORLD_AXES, origin: [0, 0, top + margin] });
    const cut = writer.extrusion(writer.profile({ outer: outline, holes: [] }), WORLD_AXES, top - bottom + 2 * margin, [0, 0, -1]);
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [cut]);
    const opening = writer.create("IfcOpeningElement", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name ?? null,
        ObjectPlacement: ref(openingPlacement),
        Representation: ref(writer.productShape([body])),
        PredefinedType: enumValue("OPENING"),
    });
    writer.create(VOIDING.relationship, { GlobalId: tx.globalId(undefined), [VOIDING.relating]: ref(spec.slab), [VOIDING.related]: ref(opening) });
    return opening;
}
