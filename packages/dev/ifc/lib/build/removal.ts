import type { IfcTransaction } from "../model/transaction";
import type { IfcValue } from "../step/step-types";
import { isList, isReference, referencesIn } from "../step/values";
import type { ModelReader } from "./build-types";
import { AGGREGATION, CONTAINMENT, TYPE_DEFINITION } from "./constants";
import type { EntityWriter } from "./entity-writer";
import { fillingsOf, openingsOf } from "./openings";
import { relatedOf } from "./relationships";
import { describeObject } from "./spatial";
import { readableWall } from "./wall-geometry";
import { joinsOf, regenerateWall } from "./walls";

const RELATIONSHIP = "IfcRelationship";
const KEPT_STRUCTURE = ["IfcProject", "IfcSite", "IfcBuilding"];
const SPATIAL_ELEMENT = "IfcSpatialElement";
const TYPE_OBJECT = "IfcTypeObject";
const WALL = "IfcWall";

function partsOf(reader: ModelReader, whole: number): number[] {
    return relatedOf(reader, AGGREGATION, whole);
}

function counted(count: number, what: string): string {
    return `${count} ${what}${count === 1 ? "" : "s"}`;
}

function refuseKept(reader: ModelReader, object: number): void {
    const type = reader.entity(object).type;
    if (KEPT_STRUCTURE.some((kept) => reader.schema.isSubtypeOf(type, kept))) {
        throw new Error(`${describeObject(reader, object)} is part of the model's structure and is not removed`);
    }
    if (reader.schema.isSubtypeOf(type, SPATIAL_ELEMENT)) {
        const held = relatedOf(reader, CONTAINMENT, object).length + partsOf(reader, object).length;
        if (held) {
            throw new Error(`${describeObject(reader, object)} still holds ${counted(held, "object")}; remove them first`);
        }
    }
    if (reader.schema.isSubtypeOf(type, TYPE_OBJECT)) {
        const occurrences = relatedOf(reader, TYPE_DEFINITION, object).length;
        if (occurrences) {
            throw new Error(`${describeObject(reader, object)} is the type of ${counted(occurrences, "element")}; remove them first`);
        }
    }
}

function removalOf(reader: ModelReader, object: number): Set<number> {
    refuseKept(reader, object);
    const removing = new Set<number>();
    const work = [object];
    while (work.length) {
        const id = work.pop()!;
        if (removing.has(id)) {
            continue;
        }
        removing.add(id);
        work.push(...openingsOf(reader, id), ...fillingsOf(reader, id));
        if (!reader.schema.isSubtypeOf(reader.entity(id).type, SPATIAL_ELEMENT)) {
            work.push(...partsOf(reader, id));
        }
    }
    return removing;
}

function unlink(tx: IfcTransaction, id: number, removing: ReadonlySet<number>): number[] {
    const freed: number[] = [];
    for (const user of [...tx.referencesTo(id)]) {
        const entity = tx.get(user);
        if (!entity || removing.has(user) || !tx.schema.isSubtypeOf(entity.type, RELATIONSHIP)) {
            continue;
        }
        const changes: [string, IfcValue][] = [];
        let emptied = false;
        tx.schema.entity(entity.type).attributes.forEach((attribute, index) => {
            const value = entity.args[index] ?? null;
            const goes = (item: IfcValue): boolean => isReference(item) && removing.has(item.ref);
            if (goes(value)) {
                emptied = true;
            } else if (isList(value) && value.some(goes)) {
                const remaining = value.filter((item) => !goes(item));
                emptied ||= remaining.length === 0;
                changes.push([attribute.name, remaining]);
            }
        });
        if (emptied) {
            freed.push(...entity.args.flatMap((arg) => referencesIn(arg)));
            tx.delete(user);
        } else if (changes.length) {
            tx.update(user, Object.fromEntries(changes));
        }
    }
    return freed;
}

export function removeObject(tx: IfcTransaction, writer: EntityWriter, object: number, tolerance: number, parallelTolerance: number): void {
    const removing = removalOf(tx, object);
    const trimmed = new Set<number>();
    for (const id of removing) {
        if (tx.schema.isSubtypeOf(tx.entity(id).type, WALL)) {
            joinsOf(tx, id).filter((join) => join.theirs !== "ATPATH" && !removing.has(join.other)).forEach((join) => trimmed.add(join.other));
        }
    }
    const freed: number[] = [];
    for (const id of removing) {
        freed.push(...unlink(tx, id, removing), ...tx.entity(id).args.flatMap((arg) => referencesIn(arg)));
    }
    removing.forEach((id) => tx.delete(id));
    tx.dropIfUnused(freed.filter((id) => !removing.has(id)));
    for (const wall of trimmed) {
        if (readableWall(tx, wall)?.body !== undefined) {
            regenerateWall(tx, writer, wall, tolerance, parallelTolerance);
        }
    }
}
