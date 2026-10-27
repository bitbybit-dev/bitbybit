import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { add3, cross3, length3, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/polygons";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, ref } from "../step/values";
import type { MemberSpec, SlabSpec } from "./build-types";
import { VERTICAL_COSINE } from "./constants";
import { bodyContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { associateMaterial, associateNewMaterial, layerSetThickness, layerSetUsage } from "./materials";
import type { Frame3 } from "./build-types";
import { frameFrom, direction3Of } from "./math";
import { objectPlacementOf } from "./placement";
import { writeProfile } from "./profiles";
import { containIn } from "./spatial";
import { cleanHoles, cleanOutline, measuredFrom } from "./outlines";
import { radiansOf } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/scalars";

export function createSlab(tx: IfcTransaction, writer: EntityWriter, spec: SlabSpec, tolerance: number): number {
    const thickness = layerSetThickness(tx, spec.layerSet);
    if (!(thickness > 0)) {
        throw new Error("A slab's layers must add up to more than zero thickness");
    }
    const outer = wound2(cleanOutline(spec.outline, tolerance, "outline"), true);
    const holes = cleanHoles(outer, spec.holes, tolerance, "slab");
    const anchor = outer[0]!;
    const placement = writer.localPlacement(objectPlacementOf(tx, spec.storey), { ...WORLD_AXES, origin: [anchor[0], anchor[1], spec.topOffset] });
    const profile = writer.profile({ outer: measuredFrom(outer, anchor), holes: holes.map((hole) => measuredFrom(hole, anchor)) });
    const solid = writer.extrusion(profile, WORLD_AXES, thickness, [0, 0, -1]);
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [solid]);
    const slab = writer.create("IfcSlab", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name ?? null,
        ObjectPlacement: ref(placement),
        Representation: ref(writer.productShape([body])),
        PredefinedType: enumValue(spec.predefinedType),
    });
    containIn(tx, writer, spec.storey, slab);
    associateNewMaterial(tx, writer, [slab], layerSetUsage(writer, spec.layerSet, "AXIS3", "NEGATIVE", 0));
    return slab;
}

export function memberFrame(start: Base.Point3, end: Base.Point3, rotationDegrees: number): Frame3 {
    const along = subtract3(end, start);
    if (!(length3(along) > 0)) {
        throw new Error("A member's start and end must be apart");
    }
    const z = direction3Of(along);
    const horizontal: Base.Vector3 = Math.abs(z[2]) >= VERTICAL_COSINE ? [1, 0, 0] : direction3Of(cross3([0, 0, 1], z));
    const base = frameFrom(start, z, horizontal);
    const angle = radiansOf(rotationDegrees);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = add3(scale3(base.x, cos), scale3(base.y, sin));
    return frameFrom(start, z, x);
}

export function createMember(tx: IfcTransaction, writer: EntityWriter, kind: "IfcColumn" | "IfcBeam" | "IfcMember", spec: MemberSpec): number {
    const frame = memberFrame(spec.start, spec.end, spec.rotation);
    const placement = writer.localPlacement(objectPlacementOf(tx, spec.storey), frame);
    const solid = writer.extrusion(writeProfile(writer, spec.profile, undefined), WORLD_AXES, length3(subtract3(spec.end, spec.start)));
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [solid]);
    const member = writer.create(kind, {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name ?? null,
        ObjectPlacement: ref(placement),
        Representation: ref(writer.productShape([body])),
        PredefinedType: enumValue(spec.predefinedType),
    });
    containIn(tx, writer, spec.storey, member);
    if (spec.material !== undefined) {
        associateMaterial(tx, writer, [member], spec.material);
    }
    return member;
}
