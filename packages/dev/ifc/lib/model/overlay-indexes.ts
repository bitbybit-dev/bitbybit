import { ROOT_ENTITY } from "../schema/constants";
import type { IfcSchema } from "../schema/schema";
import type { IfcEntity } from "../step/step-types";
import { referencesIn } from "../step/values";
import type { IfcOverlay } from "./model-types";

function addTo<K>(map: Map<K, Set<number>>, key: K, id: number): void {
    const set = map.get(key);
    if (set) {
        set.add(id);
    } else {
        map.set(key, new Set([id]));
    }
}

function removeFrom<K>(map: Map<K, Set<number>>, key: K, id: number): void {
    const set = map.get(key);
    if (set?.delete(id) && set.size === 0) {
        map.delete(key);
    }
}

export class OverlayIndexes {
    private readonly schema: IfcSchema;
    private readonly types = new Map<string, Set<number>>();
    private readonly globalIds = new Map<string, Set<number>>();
    private readonly users = new Map<number, Set<number>>();
    private readonly rooted = new Map<string, boolean>();

    constructor(schema: IfcSchema, overlay: IfcOverlay) {
        this.schema = schema;
        overlay.forEach((entity) => {
            if (entity) {
                this.add(entity);
            }
        });
    }

    globalIdOf(entity: IfcEntity): string | undefined {
        let isRoot = this.rooted.get(entity.type);
        if (isRoot === undefined) {
            isRoot = this.schema.isSubtypeOf(entity.type, ROOT_ENTITY);
            this.rooted.set(entity.type, isRoot);
        }
        const globalId = entity.args[0];
        return isRoot && typeof globalId === "string" ? globalId : undefined;
    }

    add(entity: IfcEntity): void {
        addTo(this.types, entity.type, entity.id);
        const globalId = this.globalIdOf(entity);
        if (globalId !== undefined) {
            addTo(this.globalIds, globalId, entity.id);
        }
        for (const target of new Set(entity.args.flatMap((arg) => referencesIn(arg)))) {
            addTo(this.users, target, entity.id);
        }
    }

    remove(entity: IfcEntity): void {
        removeFrom(this.types, entity.type, entity.id);
        const globalId = this.globalIdOf(entity);
        if (globalId !== undefined) {
            removeFrom(this.globalIds, globalId, entity.id);
        }
        for (const target of new Set(entity.args.flatMap((arg) => referencesIn(arg)))) {
            removeFrom(this.users, target, entity.id);
        }
    }

    idsOfType(type: string): ReadonlySet<number> | undefined {
        return this.types.get(type);
    }

    ownersOfGlobalId(globalId: string): ReadonlySet<number> | undefined {
        return this.globalIds.get(globalId);
    }

    usersOf(id: number): ReadonlySet<number> | undefined {
        return this.users.get(id);
    }
}
