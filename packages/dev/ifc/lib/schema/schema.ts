import type { CompactSchema, CompactType, IfcAttributeInfo, IfcEntityInfo, IfcTypeSpec, SelectContents } from "./schema-types";

export const SIMPLE_TYPES: ReadonlySet<string> = new Set(["REAL", "INTEGER", "NUMBER", "STRING", "BOOLEAN", "LOGICAL", "BINARY"]);

export class IfcSchema {
    readonly name: string;
    readonly release: string;
    private readonly table: CompactSchema;
    private readonly entityNames: ReadonlyMap<string, string>;
    private readonly typeNames: ReadonlyMap<string, string>;
    private readonly infos = new Map<string, IfcEntityInfo>();
    private subtypeLists: Map<string, string[]> | undefined;
    private readonly selects = new Map<string, SelectContents>();

    constructor(table: CompactSchema) {
        this.table = table;
        this.name = table.name;
        this.release = table.release;
        this.entityNames = new Map(Object.keys(table.entities).flatMap((name) => [[name, name], [name.toUpperCase(), name]]));
        this.typeNames = new Map(Object.keys(table.types).map((name) => [name.toUpperCase(), name]));
    }

    entityName(name: string): string | undefined {
        return this.entityNames.get(name) ?? this.entityNames.get(name.toUpperCase());
    }

    typeName(name: string): string | undefined {
        return this.typeNames.get(name.toUpperCase());
    }

    hasEntity(name: string): boolean {
        return this.entityNames.has(name.toUpperCase());
    }

    type(name: string): CompactType | undefined {
        const canonical = this.typeName(name);
        return canonical === undefined ? undefined : this.table.types[canonical];
    }

    entity(name: string): IfcEntityInfo {
        const canonical = this.entityName(name);
        if (canonical === undefined) {
            throw new Error(`${this.name} has no entity named ${name}`);
        }
        const known = this.infos.get(canonical);
        if (known) {
            return known;
        }
        const info = this.build(canonical);
        this.infos.set(canonical, info);
        return info;
    }

    isSubtypeOf(name: string, ancestor: string): boolean {
        const target = this.entityName(ancestor);
        for (let current: string | null | undefined = this.entityName(name); current; current = this.table.entities[current]?.p) {
            if (current === target) {
                return true;
            }
        }
        return false;
    }

    subtypesOf(name: string): readonly string[] {
        const canonical = this.entityName(name);
        if (canonical === undefined) {
            return [];
        }
        if (!this.subtypeLists) {
            this.subtypeLists = new Map();
            for (const entity of Object.keys(this.table.entities)) {
                for (let current: string | null | undefined = entity; current; current = this.table.entities[current]?.p) {
                    const list = this.subtypeLists.get(current) ?? [];
                    list.push(entity);
                    this.subtypeLists.set(current, list);
                }
            }
        }
        return this.subtypeLists.get(canonical) ?? [];
    }

    selectContents(select: string): SelectContents {
        const known = this.selects.get(select);
        if (known) {
            return known;
        }
        const entities: string[] = [];
        const valueTypes = new Set<string>();
        const seen = new Set<string>();
        const visit = (name: string): void => {
            if (seen.has(name)) {
                return;
            }
            seen.add(name);
            const entity = this.entityName(name);
            if (entity !== undefined) {
                entities.push(entity);
                return;
            }
            const type = this.type(name);
            if (type && "s" in type) {
                type.s.forEach(visit);
            } else if (type) {
                valueTypes.add(this.typeName(name)!);
            }
        };
        visit(select);
        const contents: SelectContents = { entities, valueTypes };
        this.selects.set(select, contents);
        return contents;
    }

    underlying(spec: IfcTypeSpec): IfcTypeSpec {
        let current = spec;
        for (;;) {
            if (typeof current !== "string") {
                return current;
            }
            const type = this.type(current);
            if (!type || !("t" in type)) {
                return current;
            }
            current = type.t;
        }
    }

    private build(name: string): IfcEntityInfo {
        const chain: string[] = [];
        for (let current: string | null | undefined = name; current; current = this.table.entities[current]?.p) {
            chain.unshift(current);
        }
        const derived = new Set<string>();
        for (const link of chain) {
            this.table.entities[link]?.d?.forEach((attribute) => derived.add(attribute));
        }
        const attributes: IfcAttributeInfo[] = [];
        for (const link of chain) {
            for (const attribute of this.table.entities[link]!.a) {
                attributes.push({ name: attribute[0], type: attribute[1], optional: attribute[2] === 1, derived: derived.has(attribute[0]) });
            }
        }
        const entity = this.table.entities[name]!;
        return {
            name,
            supertype: entity.p,
            abstract: entity.abs === 1,
            attributes,
            positions: new Map(attributes.map((attribute, index) => [attribute.name, index])),
        };
    }
}
