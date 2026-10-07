import { WORLD_AXES } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type * as Inputs from "../api/inputs";
import { isGlobalId, keyGlobalId } from "../model/guid";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, ref, textValue } from "../step/values";
import type { ModelReader } from "./build-types";
import { AGGREGATION, CONTAINMENT } from "./constants";
import type { EntityWriter } from "./entity-writer";
import type { Frame3 } from "./build-types";
import { absoluteFrame, movePlacement, objectPlacementOf, productsPlacedBy, relativeFrame } from "./placement";
import { appendToRelationship, relatingOf } from "./relationships";

const STOREY = "IfcBuildingStorey";
const MAX_STRUCTURE_DEPTH = 32;

function article(word: string): string {
    return /^[aeiou]/i.test(word) ? "an" : "a";
}

export function resolveObject(model: ModelSnapshot, idOrGlobalId: string, type: string, what: string): number {
    const held = isGlobalId(idOrGlobalId) ? model.byGlobalId(idOrGlobalId) : undefined;
    const id = held ?? model.byGlobalId(keyGlobalId(model.keySeed, idOrGlobalId));
    if (id === undefined) {
        throw new Error(`The model has no ${what} '${idOrGlobalId}'`);
    }
    const actual = model.typeOf(id)!;
    if (!model.schema.isSubtypeOf(actual, type)) {
        throw new Error(`'${idOrGlobalId}' is ${article(actual)} ${actual}, not ${article(what)} ${what}`);
    }
    return id;
}

export function describeObject(reader: ModelReader, id: number): string {
    const entity = reader.entity(id);
    const name = textValue(entity.args[2] ?? null) ?? "";
    const globalId = textValue(entity.args[0] ?? null) ?? "";
    return name ? `the ${entity.type} '${name}'` : globalId ? `the ${entity.type} ${globalId}` : `#${id}`;
}

export function onlyBuilding(model: ModelSnapshot): number {
    const buildings = model.byType("IfcBuilding");
    if (buildings.length !== 1) {
        throw new Error(`Storeys are added to the model's one building, and it has ${buildings.length}`);
    }
    return buildings[0]!.id;
}

export function containIn(tx: IfcTransaction, writer: EntityWriter, structure: number, element: number): void {
    appendToRelationship(tx, writer, CONTAINMENT, structure, [element]);
}

export function containerOf(reader: ModelReader, element: number): number | undefined {
    return relatingOf(reader, CONTAINMENT, element);
}

export function storeysOf(model: ModelSnapshot): Inputs.IFC.StoreyInfoDto[] {
    return model.byType("IfcBuildingStorey")
        .map((storey) => {
            const elevation = model.attribute(storey.id, "Elevation");
            return {
                globalId: textValue(model.attribute(storey.id, "GlobalId")) ?? "",
                name: textValue(model.attribute(storey.id, "Name")) ?? "",
                elevation: typeof elevation === "number" ? elevation : 0,
            };
        })
        .sort((a, b) => a.elevation - b.elevation);
}

export function addStorey(tx: IfcTransaction, writer: EntityWriter, building: number, id: string | undefined, name: string, elevation: number): number {
    const storey = writer.create("IfcBuildingStorey", {
        GlobalId: tx.globalId(id),
        Name: name,
        ObjectPlacement: ref(writer.localPlacement(objectPlacementOf(tx, building), { ...WORLD_AXES, origin: [0, 0, elevation] })),
        CompositionType: enumValue("ELEMENT"),
        Elevation: elevation,
    });
    appendToRelationship(tx, writer, AGGREGATION, building, [storey]);
    return storey;
}

export function storeyFrame(reader: ModelReader, storey: number): Frame3 {
    return absoluteFrame(reader, objectPlacementOf(reader, storey));
}

export function storeyOf(reader: ModelReader, element: number): number | undefined {
    let current: number | undefined = element;
    for (let step = 0; current !== undefined && step < MAX_STRUCTURE_DEPTH; step++) {
        const holder: number | undefined = containerOf(reader, current) ?? relatingOf(reader, AGGREGATION, current);
        if (holder !== undefined && reader.schema.isSubtypeOf(reader.entity(holder).type, STOREY)) {
            return holder;
        }
        current = holder;
    }
    return undefined;
}

export function setStoreyElevation(tx: IfcTransaction, writer: EntityWriter, storey: number, elevation: number): void {
    const placement = objectPlacementOf(tx, storey);
    const sharer = productsPlacedBy(tx, placement).find((product) => product !== storey);
    if (sharer !== undefined) {
        throw new Error(`${describeObject(tx, storey)} shares its placement with ${describeObject(tx, sharer)}, so it cannot move on its own`);
    }
    const frame = relativeFrame(tx, placement);
    const recorded = tx.attribute(storey, "Elevation");
    const rise = elevation - (typeof recorded === "number" ? recorded : frame.origin[2]);
    movePlacement(tx, writer, placement, { ...frame, origin: [frame.origin[0], frame.origin[1], frame.origin[2] + rise] });
    tx.update(storey, { Elevation: elevation });
}
