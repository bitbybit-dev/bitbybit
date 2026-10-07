import type { IfcSchema } from "../schema/schema";
import type { IfcEntity, IfcFileHeader } from "../step/step-types";
import { EntityLookup } from "./entity-lookup";
import type { IfcModel, IfcOverlay, SnapshotParts } from "./model-types";
import { OverlayIndexes } from "./overlay-indexes";
import type { IfcSource } from "./source";

const NO_IDS: readonly number[] = [];
const ascending = (a: number, b: number): number => a - b;

export class ModelSnapshot extends EntityLookup implements IfcModel {
    readonly schema: IfcSchema;
    readonly header: IfcFileHeader;
    readonly headerExtras: readonly string[];
    readonly source: IfcSource | undefined;
    readonly overlay: IfcOverlay;
    readonly nextId: number;
    readonly seededIds: boolean;
    private indexes: OverlayIndexes | undefined;
    private projectGlobalId: string | undefined;

    constructor(parts: SnapshotParts) {
        super();
        this.schema = parts.schema;
        this.header = parts.header;
        this.headerExtras = parts.headerExtras;
        this.source = parts.source;
        this.overlay = parts.overlay;
        this.nextId = parts.nextId;
        this.seededIds = parts.seededIds;
    }

    get parts(): SnapshotParts {
        return { schema: this.schema, header: this.header, headerExtras: this.headerExtras, source: this.source, overlay: this.overlay, nextId: this.nextId, seededIds: this.seededIds };
    }

    get schemaName(): string {
        return this.header.schemaIdentifiers[0]?.trim().toUpperCase() || this.schema.name;
    }

    get editable(): boolean {
        return this.schemaName === this.schema.name;
    }

    get size(): number {
        return this.ids().length;
    }

    get keySeed(): string {
        if (this.projectGlobalId === undefined) {
            const globalId = this.byType("IfcProject")[0]?.args[0];
            this.projectGlobalId = typeof globalId === "string" ? globalId : "";
        }
        return this.projectGlobalId;
    }

    has(id: number): boolean {
        const changed = this.overlay.get(id);
        if (changed !== undefined) {
            return changed !== null;
        }
        return this.source?.has(id) ?? false;
    }

    get(id: number): IfcEntity | undefined {
        const changed = this.overlay.get(id);
        if (changed !== undefined) {
            return changed ?? undefined;
        }
        return this.source?.get(id);
    }

    peek(id: number): IfcEntity {
        const changed = this.overlay.get(id);
        const entity = changed === undefined ? this.source?.peek(id) : changed;
        if (!entity) {
            throw new Error(`The model has no entity #${id}`);
        }
        return entity;
    }

    referenceList(id: number): readonly number[] | undefined {
        return this.overlay.get(id) === undefined ? this.source?.referenceList(id) : undefined;
    }

    typeOf(id: number): string | undefined {
        const changed = this.overlay.get(id);
        if (changed !== undefined) {
            return changed?.type;
        }
        return this.source?.typeOf(id);
    }

    ids(): readonly number[] {
        const ids: number[] = [];
        const source = this.source;
        if (source) {
            for (const id of source.index.ids) {
                if (this.overlay.get(id) !== null) {
                    ids.push(id);
                }
            }
        }
        this.overlay.forEach((entity, id) => {
            if (entity && !source?.has(id)) {
                ids.push(id);
            }
        });
        return ids;
    }

    byType(type: string, includeSubtypes = true): IfcEntity[] {
        const names = includeSubtypes ? this.schema.subtypesOf(type) : [this.schema.entityName(type)].filter((name): name is string => name !== undefined);
        const indexes = this.overlayIndexes();
        const ids: number[] = [];
        for (const name of names) {
            for (const id of this.source?.idsOfType(name) ?? NO_IDS) {
                if (!this.overlay.has(id)) {
                    ids.push(id);
                }
            }
            indexes.idsOfType(name)?.forEach((id) => ids.push(id));
        }
        return ids.sort(ascending).map((id) => this.entity(id));
    }

    globalIdOwners(globalId: string): number[] {
        const owners = [...(this.overlayIndexes().ownersOfGlobalId(globalId) ?? NO_IDS)];
        for (const id of this.source?.ownersOfGlobalId(globalId) ?? NO_IDS) {
            if (!this.overlay.has(id)) {
                owners.push(id);
            }
        }
        return owners.sort(ascending);
    }

    byGlobalId(globalId: string): number | undefined {
        return this.globalIdOwners(globalId)[0];
    }

    referencesTo(id: number): readonly number[] {
        const users = [...(this.overlayIndexes().usersOf(id) ?? NO_IDS)];
        for (const user of this.source?.usersOf(id) ?? NO_IDS) {
            if (!this.overlay.has(user)) {
                users.push(user);
            }
        }
        return users.sort(ascending);
    }

    overlayIndexes(): OverlayIndexes {
        if (!this.indexes) {
            this.indexes = new OverlayIndexes(this.schema, this.overlay);
        }
        return this.indexes;
    }

    releaseIndexes(): OverlayIndexes | undefined {
        const indexes = this.indexes;
        this.indexes = undefined;
        return indexes;
    }

    adoptIndexes(indexes: OverlayIndexes): void {
        this.indexes = indexes;
    }
}
