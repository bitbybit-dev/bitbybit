import { WORLD_AXES, composeAxes } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/polygons";
import type * as Inputs from "../api/inputs";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, ref, textValue } from "../step/values";
import type { ModelReader, SpaceSpec } from "./build-types";
import { AGGREGATION, VERTICAL_COSINE } from "./constants";
import { bodyContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { extrudedBodyOf } from "./measure";
import { cleanOutline, measuredFrom } from "./outlines";
import { absoluteFrame, directionOf, objectPlacementOf } from "./placement";
import { appendToRelationship, relatingOf } from "./relationships";
import { length3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

const SPACE = "IfcSpace";

export function createSpace(tx: IfcTransaction, writer: EntityWriter, spec: SpaceSpec, tolerance: number): number {
    if (!(spec.height > 0)) {
        throw new Error(`A space's height must be more than zero, got ${spec.height}`);
    }
    const outline = wound2(cleanOutline(spec.outline, tolerance, "outline"), true);
    const anchor = outline[0]!;
    const placement = writer.localPlacement(objectPlacementOf(tx, spec.storey), { ...WORLD_AXES, origin: [anchor[0], anchor[1], spec.baseOffset] });
    const solid = writer.extrusion(writer.profile({ outer: measuredFrom(outline, anchor), holes: [] }), WORLD_AXES, spec.height);
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [solid]);
    const space = writer.create(SPACE, {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name ?? null,
        ObjectPlacement: ref(placement),
        Representation: ref(writer.productShape([body])),
        LongName: spec.longName ?? null,
        CompositionType: enumValue("ELEMENT"),
        PredefinedType: enumValue(spec.predefinedType),
    });
    appendToRelationship(tx, writer, AGGREGATION, spec.storey, [space]);
    return space;
}

function extentOf(reader: ModelReader, space: number): [number, number] {
    const extruded = extrudedBodyOf(reader, space);
    const frame = extruded === undefined ? undefined : composeAxes(absoluteFrame(reader, objectPlacementOf(reader, space)), extruded.frame);
    const direction = extruded === undefined ? undefined : directionOf(reader, reader.attribute(extruded.solid, "ExtrudedDirection"), [0, 0, 1]);
    const upright = frame !== undefined && direction !== undefined && frame.z[2] >= VERTICAL_COSINE && direction[2] / length3(direction) >= VERTICAL_COSINE;
    return extruded && upright ? [extruded.shape.area, extruded.depth] : [0, 0];
}

export function spacesOf(reader: ModelReader, storey: number | undefined): Inputs.IFC.SpaceInfoDto[] {
    return reader.byType(SPACE)
        .map((entity) => ({ id: entity.id, storey: relatingOf(reader, AGGREGATION, entity.id) }))
        .filter((space) => storey === undefined || space.storey === storey)
        .map(({ id, storey: holder }) => {
            const [area, height] = extentOf(reader, id);
            return {
                globalId: textValue(reader.attribute(id, "GlobalId")) ?? "",
                name: textValue(reader.attribute(id, "Name")) ?? "",
                longName: textValue(reader.attribute(id, "LongName")) ?? "",
                storey: holder === undefined ? "" : textValue(reader.attribute(holder, "GlobalId")) ?? "",
                area,
                height,
            };
        });
}
