import type { Base } from "@bitbybit-dev/base";
import { containerOf } from "../build/spatial";
import { relatingOf } from "../build/relationships";
import { AGGREGATION } from "../build/constants";
import type { ModelSnapshot } from "../model/snapshot";
import { textValue } from "../step/values";

const PROJECT = "IfcProject";
const SPATIAL_ELEMENT = "IfcSpatialElement";
const IFC_PREFIX = "Ifc";
const UNCOUNTED = new Set(["Furniture", "Equipment"]);
const MAX_NESTING = 64;

function pluralOf(words: string): string {
    const parts = words.split(" ");
    const last = parts[parts.length - 1] ?? words;
    if (UNCOUNTED.has(last.charAt(0).toUpperCase() + last.slice(1))) {
        return words;
    }
    if (/[^aeiou]y$/.test(words)) {
        return `${words.slice(0, -1)}ies`;
    }
    return /(s|x|ch|sh)$/.test(words) ? `${words}es` : `${words}s`;
}

function wordsOf(type: string): string {
    const bare = type.startsWith(IFC_PREFIX) ? type.slice(IFC_PREFIX.length) : type;
    const words = bare.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
}

export function classLabelOf(type: string): string {
    return pluralOf(wordsOf(type));
}

export class RecipeGroups {
    private readonly groups: Base.RecipeGroup[] = [];
    private readonly ofObject = new Map<number, number | undefined>();
    private readonly ofClass = new Map<string, number>();

    constructor(private readonly model: ModelSnapshot, private readonly isByClass: boolean) {
    }

    groupOf(element: number): number | undefined {
        return this.groupAt(element, 0);
    }

    list(): Base.RecipeGroup[] {
        return this.groups;
    }

    private groupAt(element: number, depth: number): number | undefined {
        const whole = relatingOf(this.model, AGGREGATION, element);
        if (whole !== undefined && !this.isSpatial(whole) && depth < MAX_NESTING) {
            return this.wholeGroup(whole, depth);
        }
        const container = containerOf(this.model, element) ?? whole;
        const structure = container === undefined ? undefined : this.spatialGroup(container, depth);
        return this.isByClass ? this.classGroup(structure, this.model.entity(element).type) : structure;
    }

    private isSpatial(object: number): boolean {
        return this.model.schema.isSubtypeOf(this.model.entity(object).type, SPATIAL_ELEMENT);
    }

    private add(group: Base.RecipeGroup): number {
        this.groups.push(group);
        return this.groups.length - 1;
    }

    private nameOf(object: number): string {
        return textValue(this.model.attribute(object, "Name"))?.trim() || wordsOf(this.model.entity(object).type);
    }

    private tagOf(object: number): Record<string, Base.RecipeTagValue> {
        return {
            globalId: textValue(this.model.attribute(object, "GlobalId")) ?? "",
            type: this.model.entity(object).type,
            name: textValue(this.model.attribute(object, "Name")) ?? "",
        };
    }

    private spatialGroup(structure: number, depth: number): number | undefined {
        if (this.ofObject.has(structure)) {
            return this.ofObject.get(structure);
        }
        if (this.model.schema.isSubtypeOf(this.model.entity(structure).type, PROJECT) || depth >= MAX_NESTING) {
            this.ofObject.set(structure, undefined);
            return undefined;
        }
        const holder = relatingOf(this.model, AGGREGATION, structure);
        const parent = holder === undefined ? undefined : this.spatialGroup(holder, depth + 1);
        const group = this.add({ name: this.nameOf(structure), ...(parent === undefined ? {} : { parent }), tag: this.tagOf(structure) });
        this.ofObject.set(structure, group);
        return group;
    }

    private wholeGroup(whole: number, depth: number): number {
        const known = this.ofObject.get(whole);
        if (known !== undefined) {
            return known;
        }
        const parent = this.groupAt(whole, depth + 1);
        const group = this.add({ name: this.nameOf(whole), ...(parent === undefined ? {} : { parent }), tag: this.tagOf(whole) });
        this.ofObject.set(whole, group);
        return group;
    }

    private classGroup(structure: number | undefined, type: string): number {
        const key = `${structure ?? "top"}:${type}`;
        const known = this.ofClass.get(key);
        if (known !== undefined) {
            return known;
        }
        const group = this.add({ name: classLabelOf(type), ...(structure === undefined ? {} : { parent: structure }), tag: { type } });
        this.ofClass.set(key, group);
        return group;
    }
}
