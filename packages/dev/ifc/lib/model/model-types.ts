import type { IfcSchema } from "../schema/schema";
import type { IfcEntity, IfcFileHeader, IfcValue } from "../step/step-types";
import type { IdMap } from "./id-map";
import type { IfcSource } from "./source";

/**
 * An IFC model at one moment: a schema, a file header and its entities. A model never changes:
 * every method that edits one returns a new model, which shares with the old one everything the
 * edit did not touch, so the old model can still be read, written or edited another way.
 * @beta
 */
export interface IfcModel {
    /**
     * The schema the model's file names, such as `IFC4`.
     */
    readonly schemaName: string;
    /**
     * Whether the model can be changed: false for a file whose schema is read through another's,
     * such as an `IFC2X3` file read through `IFC4`, which can be shown and queried but not edited.
     */
    readonly editable: boolean;
    /**
     * The file header the model was read or created with.
     */
    readonly header: IfcFileHeader;
    /**
     * How many entities the model holds.
     */
    readonly size: number;
    /**
     * Whether the model holds an entity with this express id.
     * @param id - The express id
     * @returns True when the entity is there
     */
    has(id: number): boolean;
    /**
     * The entity with this express id.
     * @param id - The express id
     * @returns The entity, or undefined when the model holds none with this id
     */
    get(id: number): IfcEntity | undefined;
    /**
     * The entity with this express id, which must be there.
     * @param id - The express id
     * @returns The entity
     */
    entity(id: number): IfcEntity;
    /**
     * The type of the entity with this express id, in the schema's spelling.
     * @param id - The express id
     * @returns The type, or undefined when there is no such entity or its type is one the schema
     * does not define
     */
    typeOf(id: number): string | undefined;
    /**
     * One attribute of an entity, by the attribute's name in the schema.
     * @param id - The express id of the entity
     * @param name - The attribute name, such as `Name`
     * @returns The value, or null when the attribute is unset
     */
    attribute(id: number, name: string): IfcValue;
    /**
     * The express ids of every entity: those of the file the model was read from in file order,
     * then those created since, in ascending order.
     * @returns The ids
     */
    ids(): readonly number[];
    /**
     * Every entity of a type, in ascending order of express id.
     * @param type - The entity type, such as `IfcWall`, in any case
     * @param includeSubtypes - Whether entities of its subtypes count too; true when left out
     * @returns The entities
     */
    byType(type: string, includeSubtypes?: boolean): IfcEntity[];
    /**
     * The object with this GlobalId.
     * @param globalId - The GlobalId
     * @returns The express id of the object, or undefined when the model holds none with it
     */
    byGlobalId(globalId: string): number | undefined;
    /**
     * The entities that refer to an entity.
     * @param id - The express id of the entity referred to
     * @returns The express ids of the entities that refer to it, in ascending order
     */
    referencesTo(id: number): readonly number[];
}

export type IfcOverlay = IdMap<IfcEntity | null>;

export type IfcAttributes = Readonly<Record<string, IfcValue | undefined>>;

export interface SnapshotParts {
    readonly schema: IfcSchema;
    readonly header: IfcFileHeader;
    readonly headerExtras: readonly string[];
    readonly source: IfcSource | undefined;
    readonly overlay: IfcOverlay;
    readonly nextId: number;
    readonly seededIds: boolean;
}

export interface TrieNode<V> {
    owner: object | undefined;
    readonly children: (TrieNode<V> | undefined)[];
    readonly values: (V | undefined)[];
}

export type FilePart = string | Uint8Array;

export interface GlobalIdOwners {
    readonly first: Map<string, number>;
    readonly more: Map<string, number[]>;
}

export interface SourceUsers {
    readonly offsets: Int32Array;
    readonly users: Int32Array;
}
