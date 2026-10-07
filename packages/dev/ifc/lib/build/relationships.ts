import type { IfcTransaction } from "../model/transaction";
import type { IfcValue } from "../step/step-types";
import { isList, isReference, ref } from "../step/values";
import type { ModelReader, RelationshipRoles } from "./build-types";
import type { EntityWriter } from "./entity-writer";

const SCANNED_LIST_LENGTH = 32;
const listMembers = new WeakMap<readonly IfcValue[], ReadonlySet<number>>();

function listHolds(list: readonly IfcValue[], id: number): boolean {
    if (list.length < SCANNED_LIST_LENGTH) {
        return list.some((item) => isReference(item) && item.ref === id);
    }
    let members = listMembers.get(list);
    if (!members) {
        members = new Set(list.filter(isReference).map((item) => item.ref));
        listMembers.set(list, members);
    }
    return members.has(id);
}

function refersTo(reader: ModelReader, relationship: number, attribute: string, id: number): boolean {
    const value = reader.attribute(relationship, attribute);
    return isReference(value) ? value.ref === id : isList(value) && listHolds(value, id);
}

function relationshipsWhere(reader: ModelReader, roles: RelationshipRoles, attribute: string, id: number): number[] {
    return reader.referencesTo(id).filter((user) => reader.get(user)?.type === roles.relationship && refersTo(reader, user, attribute, id));
}

export function relatingOf(reader: ModelReader, roles: RelationshipRoles, part: number): number | undefined {
    const relationship = relationshipsWhere(reader, roles, roles.related, part)[0];
    if (relationship === undefined) {
        return undefined;
    }
    const whole = reader.attribute(relationship, roles.relating);
    return isReference(whole) ? whole.ref : undefined;
}

export function relationshipsOf(reader: ModelReader, roles: RelationshipRoles, whole: number): number[] {
    return relationshipsWhere(reader, roles, roles.relating, whole);
}

export function relate(tx: IfcTransaction, writer: EntityWriter, roles: RelationshipRoles, whole: number, parts: readonly number[]): number {
    return writer.create(roles.relationship, { GlobalId: tx.globalId(undefined), [roles.relating]: ref(whole), [roles.related]: parts.map(ref) });
}

export function appendToRelationship(tx: IfcTransaction, writer: EntityWriter, roles: RelationshipRoles, whole: number, parts: readonly number[]): number {
    const existing = relationshipsOf(tx, roles, whole)[0];
    if (existing === undefined) {
        return relate(tx, writer, roles, whole, parts);
    }
    const current = tx.attribute(existing, roles.related);
    tx.update(existing, { [roles.related]: [...(isList(current) ? current : []), ...parts.map(ref)] });
    return existing;
}

export function detach(tx: IfcTransaction, roles: RelationshipRoles, part: number): number[] {
    const emptied: number[] = [];
    for (const relationship of relationshipsWhere(tx, roles, roles.related, part)) {
        const current = tx.attribute(relationship, roles.related);
        const remaining = isList(current) ? current.filter((item) => !(isReference(item) && item.ref === part)) : [];
        if (remaining.length) {
            tx.update(relationship, { [roles.related]: remaining });
            continue;
        }
        const whole = tx.attribute(relationship, roles.relating);
        tx.delete(relationship);
        if (isReference(whole)) {
            emptied.push(whole.ref);
        }
    }
    return emptied;
}

export function relatedOf(reader: ModelReader, roles: RelationshipRoles, whole: number): number[] {
    return relationshipsOf(reader, roles, whole).flatMap((relationship) => {
        const value = reader.attribute(relationship, roles.related);
        return (isList(value) ? value : [value]).filter(isReference).map((item) => item.ref);
    });
}
