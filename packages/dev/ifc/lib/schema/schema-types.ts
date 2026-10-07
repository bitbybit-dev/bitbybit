export type IfcAggregateKind = "LIST" | "SET" | "ARRAY" | "BAG";

export type IfcTypeSpec = string | IfcAggregateSpec;

export type IfcAggregateSpec = readonly [IfcAggregateKind, number, number | null, IfcTypeSpec];

export type CompactAttribute = readonly [string, IfcTypeSpec] | readonly [string, IfcTypeSpec, 1];

export type CompactInverse = readonly [string, IfcTypeSpec, string];

export interface CompactEntity {
    readonly p: string | null;
    readonly a: readonly CompactAttribute[];
    readonly abs?: 1;
    readonly d?: readonly string[];
    readonly i?: readonly CompactInverse[];
}

export interface CompactDefinedType {
    readonly t: IfcTypeSpec;
}

export interface CompactEnumerationType {
    readonly e: readonly string[];
}

export interface CompactSelectType {
    readonly s: readonly string[];
}

export type CompactType = CompactDefinedType | CompactEnumerationType | CompactSelectType;

export interface CompactSchema {
    readonly name: string;
    readonly release: string;
    readonly types: Readonly<Record<string, CompactType>>;
    readonly entities: Readonly<Record<string, CompactEntity>>;
}

export interface IfcAttributeInfo {
    readonly name: string;
    readonly type: IfcTypeSpec;
    readonly optional: boolean;
    readonly derived: boolean;
}

export interface IfcEntityInfo {
    readonly name: string;
    readonly supertype: string | null;
    readonly abstract: boolean;
    readonly attributes: readonly IfcAttributeInfo[];
    readonly positions: ReadonlyMap<string, number>;
}

export interface SelectContents {
    readonly entities: readonly string[];
    readonly valueTypes: ReadonlySet<string>;
}
