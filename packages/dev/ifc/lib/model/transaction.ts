import { MAX_EXPRESS_ID } from "../step/constants";
import { encoderFor } from "../step/encoder";
import type { IfcEntity, IfcValue } from "../step/step-types";
import { DERIVED, isDerived, isList, isReference, referencesIn } from "../step/values";
import type { IfcSchema } from "../schema/schema";
import { PRUNABLE_TYPES } from "./constants";
import { EntityLookup } from "./entity-lookup";
import { automaticGlobalId, keyGlobalId, randomGlobalId, structureGlobalId } from "./guid";
import type { IfcAttributes } from "./model-types";
import { checkReferences } from "./references";
import { ModelSnapshot } from "./snapshot";

const ascending = (a: number, b: number): number => a - b;
const STYLED_ITEM = "IfcStyledItem";
const LAYER_ASSIGNMENT = "IfcPresentationLayerAssignment";

export class IfcTransaction extends EntityLookup {
    readonly base: ModelSnapshot;
    private readonly changes = new Map<number, IfcEntity | null>();
    private readonly changedUsers = new Map<number, Set<number>>();
    private readonly keySeed: string;
    private readonly usedGlobalIds = new Set<string>();
    private readonly dropCandidates = new Set<number>();
    private nextId: number;
    private issued = 0;
    private committed = false;

    constructor(base: ModelSnapshot, keySeed: string = base.keySeed) {
        super();
        if (!base.editable) {
            throw new Error(`This ${base.schemaName} file is read through the ${base.schema.name} schema, so it can be shown and queried but not changed`);
        }
        this.base = base;
        this.nextId = base.nextId;
        this.keySeed = keySeed;
    }

    get schema(): IfcSchema {
        return this.base.schema;
    }

    get(id: number): IfcEntity | undefined {
        if (this.changes.has(id)) {
            return this.changes.get(id) ?? undefined;
        }
        return this.base.get(id);
    }

    byType(type: string): IfcEntity[] {
        const found: IfcEntity[] = [];
        for (const entity of this.base.byType(type)) {
            if (!this.changes.has(entity.id)) {
                found.push(entity);
            }
        }
        for (const entity of this.changes.values()) {
            if (entity && this.schema.isSubtypeOf(entity.type, type)) {
                found.push(entity);
            }
        }
        return found.sort((a, b) => a.id - b.id);
    }

    referencesTo(id: number): readonly number[] {
        const users = this.base.referencesTo(id).filter((user) => !this.changes.has(user));
        users.push(...(this.changedUsers.get(id) ?? []));
        return users.sort(ascending);
    }

    argsFrom(type: string, attributes: IfcAttributes): IfcValue[] {
        const info = this.schema.entity(type);
        const unknown = Object.keys(attributes).filter((name) => !info.positions.has(name));
        if (unknown.length) {
            throw new Error(`${info.name} has no attribute ${unknown.join(", ")}`);
        }
        const misplaced = info.attributes.find((attribute) => attribute.derived && attributes[attribute.name] !== undefined && !isDerived(attributes[attribute.name]));
        if (misplaced) {
            throw new Error(`${info.name}.${misplaced.name} is derived and takes no value`);
        }
        return info.attributes.map((attribute) => (attribute.derived ? DERIVED : attributes[attribute.name] ?? null));
    }

    create(type: string, attributes: IfcAttributes = {}): number {
        this.assertOpen();
        const info = this.schema.entity(type);
        const id = this.nextId;
        if (id > MAX_EXPRESS_ID) {
            throw new Error(`The model has no express id left below ${MAX_EXPRESS_ID}`);
        }
        const args = encoderFor(this.schema).normalizeArguments(info.name, this.argsFrom(info.name, attributes), `#${id}`);
        this.nextId++;
        this.record(id, { id, type: info.name, args });
        return id;
    }

    update(id: number, attributes: IfcAttributes): void {
        this.assertOpen();
        const entity = this.entity(id);
        const info = this.schema.entity(entity.type);
        const encoder = encoderFor(this.schema);
        const args = [...entity.args];
        for (const [name, value] of Object.entries(attributes)) {
            const position = info.positions.get(name);
            if (position === undefined) {
                throw new Error(`${info.name} has no attribute ${name}`);
            }
            if (info.attributes[position]!.derived) {
                throw new Error(`${info.name}.${name} is derived and takes no value`);
            }
            args[position] = encoder.normalizeAttribute(info, position, value ?? null, `#${id}`);
        }
        this.record(id, { id, type: info.name, args });
    }

    delete(id: number): void {
        this.assertOpen();
        this.entity(id);
        this.record(id, null);
    }

    globalId(key: string | undefined): string {
        const globalId = key === undefined ? this.automaticGlobalId() : keyGlobalId(this.keySeed, key);
        this.claim(globalId, key === undefined ? `the GlobalId ${globalId}` : `the id '${key}'`);
        return globalId;
    }

    givenGlobalId(globalId: string): string {
        this.claim(globalId, `the GlobalId ${globalId}`);
        return globalId;
    }

    structureGlobalId(name: string): string {
        const globalId = structureGlobalId(this.keySeed, name);
        this.claim(globalId, `the GlobalId ${globalId}`);
        return globalId;
    }

    dropIfUnused(ids: readonly number[]): void {
        ids.forEach((id) => this.dropCandidates.add(id));
    }

    commit(): ModelSnapshot {
        this.assertOpen();
        this.committed = true;
        this.pruneUnused();
        const overlay = this.base.overlay.withChanges([...this.changes].map(([id, entity]) => [id, entity === null && !this.base.source?.has(id) ? undefined : entity] as const));
        const next = new ModelSnapshot({ ...this.base.parts, overlay, nextId: this.nextId });
        const inherited = this.base.releaseIndexes();
        if (inherited) {
            for (const [id, entity] of this.changes) {
                const before = this.base.overlay.get(id);
                if (before) {
                    inherited.remove(before);
                }
                if (entity) {
                    inherited.add(entity);
                }
            }
            next.adoptIndexes(inherited);
        }
        const changed = [...this.changes.keys()].filter((id) => this.changes.get(id) !== null);
        const deleted = [...this.changes.keys()].filter((id) => this.changes.get(id) === null);
        checkReferences(next, changed, deleted);
        this.checkGlobalIds(next, changed);
        return next;
    }

    private record(id: number, entity: IfcEntity | null): void {
        const before = this.changes.get(id);
        for (const target of new Set(before ? before.args.flatMap((arg) => referencesIn(arg)) : [])) {
            this.changedUsers.get(target)?.delete(id);
        }
        for (const target of new Set(entity ? entity.args.flatMap((arg) => referencesIn(arg)) : [])) {
            let users = this.changedUsers.get(target);
            if (!users) {
                users = new Set();
                this.changedUsers.set(target, users);
            }
            users.add(id);
        }
        this.changes.set(id, entity);
    }

    private automaticGlobalId(): string {
        return this.base.seededIds ? automaticGlobalId(this.keySeed, `${this.base.nextId}.${this.issued++}`) : randomGlobalId();
    }

    private claim(globalId: string, what: string): void {
        if (this.usedGlobalIds.has(globalId) || this.base.byGlobalId(globalId) !== undefined) {
            throw new Error(`The model already holds an object with ${what}`);
        }
        this.usedGlobalIds.add(globalId);
    }

    private assertOpen(): void {
        if (this.committed) {
            throw new Error("The transaction has been committed; start a new one from the model it made");
        }
    }

    private checkGlobalIds(next: ModelSnapshot, changed: readonly number[]): void {
        const indexes = next.overlayIndexes();
        for (const id of changed) {
            const globalId = indexes.globalIdOf(next.entity(id));
            const before = this.base.get(id);
            if (globalId === undefined || (before && indexes.globalIdOf(before) === globalId)) {
                continue;
            }
            const owners = next.globalIdOwners(globalId);
            if (owners.length > 1) {
                throw new Error(`#${owners[0]!} and #${owners[1]!} have the same GlobalId ${globalId}`);
            }
        }
    }

    private pruneUnused(): void {
        if (!this.dropCandidates.size) {
            return;
        }
        const removed = new Set<number>();
        const work = [...this.dropCandidates];
        while (work.length) {
            const id = work.pop()!;
            const entity = this.get(id);
            if (!entity || removed.has(id) || !PRUNABLE_TYPES.some((type) => this.schema.isSubtypeOf(entity.type, type))) {
                continue;
            }
            const users = this.referencesTo(id).filter((user) => !removed.has(user));
            if (!users.every((user) => this.onlyPresents(user, id, removed))) {
                continue;
            }
            users.forEach((user) => this.letGo(user, id, removed));
            removed.add(id);
            this.record(id, null);
            work.push(...entity.args.flatMap((arg) => referencesIn(arg)));
        }
    }

    private onlyPresents(user: number, id: number, removed: ReadonlySet<number>): boolean {
        const entity = this.get(user);
        if (!entity) {
            return false;
        }
        if (this.schema.isSubtypeOf(entity.type, STYLED_ITEM)) {
            const item = this.attribute(user, "Item");
            return isReference(item) && item.ref === id && this.referencesTo(user).every((other) => removed.has(other));
        }
        return this.schema.isSubtypeOf(entity.type, LAYER_ASSIGNMENT);
    }

    private letGo(user: number, id: number, removed: Set<number>): void {
        const entity = this.get(user)!;
        if (this.schema.isSubtypeOf(entity.type, STYLED_ITEM)) {
            removed.add(user);
            this.record(user, null);
            return;
        }
        const position = this.schema.entity(entity.type).positions.get("AssignedItems")!;
        const assigned = entity.args[position];
        const kept = (isList(assigned) ? assigned : []).filter((item) => !(isReference(item) && item.ref === id));
        if (!kept.length) {
            removed.add(user);
            this.record(user, null);
            return;
        }
        this.record(user, { ...entity, args: entity.args.map((arg, index) => (index === position ? kept : arg)) });
    }
}
