import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, relativeAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type { IfcTransaction } from "../model/transaction";
import { isReference } from "../step/values";
import type { Frame3, ModelReader } from "./build-types";
import { DEGREES_TO_RADIANS, FILLING } from "./constants";
import type { EntityWriter } from "./entity-writer";
import { absoluteFrame, movePlacement, objectPlacementOf, productsPlacedBy } from "./placement";
import { firstItem, representationOf, unwrapClippings } from "./representations";
import { relatingOf } from "./relationships";
import { describeObject } from "./spatial";
import { joinsOf } from "./walls";

const OPENING = "IfcOpeningElement";
const WALL = "IfcWall";
const ELEMENT = "IfcElement";
const SPATIAL_STRUCTURE = "IfcSpatialStructureElement";
const SPACE = "IfcSpace";

function refuseUnmovable(reader: ModelReader, element: number, placement: number): void {
    const type = reader.entity(element).type;
    const what = describeObject(reader, element);
    if (reader.schema.isSubtypeOf(type, OPENING) || relatingOf(reader, FILLING, element) !== undefined) {
        throw new Error(`${what} moves with its wall: use openings.edit`);
    }
    if (reader.schema.isSubtypeOf(type, SPATIAL_STRUCTURE) && !reader.schema.isSubtypeOf(type, SPACE)) {
        throw new Error(`${what} is part of the model's structure; a storey moves with spatial.setElevation`);
    }
    if (reader.schema.isSubtypeOf(type, WALL) && joinsOf(reader, element).length) {
        throw new Error(`${what} is joined to other walls; move it with walls.edit, which keeps its joins`);
    }
    if (reader.schema.isSubtypeOf(type, WALL) && clippingsOf(reader, element).length) {
        throw new Error(`${what} is clipped; move it with walls.edit, which keeps its clippings where they are`);
    }
    const sharer = productsPlacedBy(reader, placement).find((product) => product !== element);
    if (sharer !== undefined) {
        throw new Error(`${what} shares its placement with ${describeObject(reader, sharer)}, so it cannot move on its own`);
    }
    const parent = reader.attribute(placement, "PlacementRelTo");
    const host = isReference(parent) ? productsPlacedBy(reader, parent.ref).find((product) => reader.schema.isSubtypeOf(reader.entity(product).type, ELEMENT)) : undefined;
    if (host !== undefined) {
        throw new Error(`${what} is placed on ${describeObject(reader, host)} and moves with it`);
    }
}

function clippingsOf(reader: ModelReader, wall: number): number[] {
    const body = representationOf(reader, wall, "Body");
    return body === undefined ? [] : unwrapClippings(reader, firstItem(reader, body))[1];
}

function turned(vector: Base.Vector3, cos: number, sin: number): Base.Vector3 {
    return [vector[0] * cos - vector[1] * sin, vector[0] * sin + vector[1] * cos, vector[2]];
}

export function moveElement(tx: IfcTransaction, writer: EntityWriter, element: number, translation: Base.Vector3, turnDegrees: number): void {
    const placement = objectPlacementOf(tx, element);
    refuseUnmovable(tx, element, placement);
    const parent = tx.attribute(placement, "PlacementRelTo");
    const world = absoluteFrame(tx, placement);
    const angle = turnDegrees * DEGREES_TO_RADIANS;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const moved: Frame3 = {
        origin: [world.origin[0] + translation[0], world.origin[1] + translation[1], world.origin[2] + translation[2]],
        x: turned(world.x, cos, sin),
        y: turned(world.y, cos, sin),
        z: turned(world.z, cos, sin),
    };
    movePlacement(tx, writer, placement, relativeAxes(isReference(parent) ? absoluteFrame(tx, parent.ref) : WORLD_AXES, moved));
}
