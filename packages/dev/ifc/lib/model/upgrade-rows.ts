import type { IfcSchema } from "../schema/schema";
import type { IfcAttributeInfo, IfcEntityInfo } from "../schema/schema-types";
import type { IfcEntity, IfcEnumerationValue, IfcValue } from "../step/step-types";
import { enumValue, isEnumeration, isList, isReference, referencesIn, ref } from "../step/values";
import { automaticGlobalId, randomGlobalId } from "./guid";
import type { ModelSnapshot } from "./snapshot";
import type { DateParts, StyleSuccessor } from "./upgrade-types";

const CALENDAR_DATE = "IFCCALENDARDATE";
const LOCAL_TIME = "IFCLOCALTIME";
const DATE_AND_TIME = "IFCDATEANDTIME";
const TIME_OFFSET = "IFCCOORDINATEDUNIVERSALTIMEOFFSET";
const DATE_ROWS: ReadonlySet<string> = new Set([CALENDAR_DATE, LOCAL_TIME, DATE_AND_TIME, TIME_OFFSET]);
const USER_DEFINED = "USERDEFINED";
const NOT_DEFINED = "NOTDEFINED";
const STRING = "STRING";
const BEHIND = "BEHIND";
const VIRTUAL = "VIRTUAL";
const MIDNIGHT = "00:00:00";
const YEAR_DIGITS = 4;
const TWO_DIGITS = 2;
const SPACE_BOUNDARY = "IfcRelSpaceBoundary";
const BOUNDED_BY = "RelatedBuildingElement";
const VIRTUAL_ELEMENT = "IfcVirtualElement";
const VIRTUAL_ELEMENT_NAME = "Virtual boundary";
const NAMED_BY: readonly string[] = ["ElementType", "ObjectType"];
const DROPPED_TRAILING: ReadonlyMap<string, number> = new Map([
    ["IfcLShapeProfileDef", 2],
    ["IfcTShapeProfileDef", 1],
    ["IfcUShapeProfileDef", 1],
    ["IfcCShapeProfileDef", 1],
    ["IfcDistributionControlElement", 1],
    ["IfcTransportElement", 2],
]);

const DIRECTION = "IfcDirection";
const TRUE_NORTH = "TrueNorth";
const PREDEFINED_TYPE = "PredefinedType";
const SPATIAL = 3;
const TYPE_PRODUCT_ATTRIBUTES = 8;
const RESTYLED: ReadonlyMap<string, StyleSuccessor> = new Map([
    ["IfcDoorStyle", { type: "IfcDoorType", kind: "DOOR", operation: 0 }],
    ["IfcWindowStyle", { type: "IfcWindowType", kind: "WINDOW", operation: 1 }],
]);
const PRECEDENCE = 2;
const FACETED_BREPS: ReadonlySet<string> = new Set(["IfcFacetedBrep", "IfcFacetedBrepWithVoids"]);
const SURFACE_MODEL = "SurfaceModel";
const SHELL_SURFACE_MODEL = "IfcShellBasedSurfaceModel";
const SHAPE_REPRESENTATION = "IfcShapeRepresentation";
const PRESENTATION: readonly string[] = ["IfcStyledItem", "IfcPresentationLayerAssignment"];
const OWNER_HISTORY = "IfcOwnerHistory";
const DATED_ACTIONS: ReadonlySet<string> = new Set(["ADDED", "MODIFIED", "DELETED"]);

function twoDigits(value: number): string {
    return String(Math.trunc(value)).padStart(TWO_DIGITS, "0");
}

function secondsText(value: number): string {
    const [whole, fraction] = String(value).split(".");
    return `${whole!.padStart(TWO_DIGITS, "0")}${fraction === undefined ? "" : `.${fraction}`}`;
}

function numberIn(args: readonly IfcValue[] | undefined, index: number, id: number): number {
    const value = args?.[index];
    if (typeof value !== "number") {
        throw new Error(`#${id} is an IFC2X3 date or time without the number IFC4's text needs, so the file cannot be upgraded`);
    }
    return value;
}

function optionalNumberIn(args: readonly IfcValue[] | undefined, index: number): number {
    const value = args?.[index];
    return typeof value === "number" ? value : 0;
}

function dateTextFor(type: IfcAttributeInfo["type"], parts: DateParts): string | undefined {
    switch (type) {
        case "IfcDate": return parts.date;
        case "IfcDateTime": return parts.date === undefined ? undefined : `${parts.date}T${parts.time ?? MIDNIGHT}`;
        default: return undefined;
    }
}

export class Ifc2x3Rows {
    readonly created: [number, IfcEntity][] = [];
    private nextId: number;
    private issued = 0;

    constructor(private readonly model: ModelSnapshot) {
        this.nextId = model.nextId;
    }

    get next(): number {
        return this.nextId;
    }

    private get schema(): IfcSchema {
        return this.model.schema;
    }

    isDate(id: number): boolean {
        return DATE_ROWS.has(this.model.source?.rawTypeOf(id)?.toUpperCase() ?? "");
    }

    restyled(entity: IfcEntity): IfcEntity {
        const successor = RESTYLED.get(entity.type);
        if (successor === undefined) {
            return entity;
        }
        const own = entity.args.slice(TYPE_PRODUCT_ATTRIBUTES);
        return { id: entity.id, type: successor.type, args: [...entity.args.slice(0, TYPE_PRODUCT_ATTRIBUTES), null, enumValue(successor.kind), own[successor.operation] ?? null, own[PRECEDENCE] ?? null, null] };
    }

    surfaced(entity: IfcEntity): IfcEntity {
        if (!FACETED_BREPS.has(entity.type)) {
            return entity;
        }
        const users = this.model.referencesTo(entity.id);
        const representations = users.filter((user) => this.model.typeOf(user) === SHAPE_REPRESENTATION);
        const presentations = users.filter((user) => PRESENTATION.some((type) => this.schema.isSubtypeOf(this.model.typeOf(user) ?? "", type)));
        if (!representations.length || representations.length + presentations.length !== users.length || representations.some((user) => this.model.attribute(user, "RepresentationType") !== SURFACE_MODEL)) {
            return entity;
        }
        const [outer, voids] = entity.args;
        return { id: entity.id, type: SHELL_SURFACE_MODEL, args: [[outer ?? null, ...(isList(voids) ? voids : [])]] };
    }

    given(info: IfcEntityInfo, args: readonly IfcValue[]): readonly IfcValue[] {
        const dropped = DROPPED_TRAILING.get(info.name) ?? 0;
        return dropped > 0 && args.length === info.attributes.length + dropped ? args.slice(0, info.attributes.length) : args;
    }

    missing(info: IfcEntityInfo, entity: IfcEntity, attribute: IfcAttributeInfo): IfcValue | undefined {
        if (Array.isArray(attribute.type) && attribute.type[1] === 0) {
            return [];
        }
        const boundary = entity.args[info.positions.get("PhysicalOrVirtualBoundary") ?? -1];
        if (!this.schema.isSubtypeOf(info.name, SPACE_BOUNDARY) || attribute.name !== BOUNDED_BY || !isEnumeration(boundary) || boundary.enum !== VIRTUAL) {
            return undefined;
        }
        const id = this.nextId++;
        const owner = entity.args[info.positions.get("OwnerHistory") ?? -1] ?? null;
        const values: Readonly<Record<string, IfcValue>> = { GlobalId: this.globalId(), OwnerHistory: owner, Name: VIRTUAL_ELEMENT_NAME };
        const element = this.schema.entity(VIRTUAL_ELEMENT);
        this.created.push([id, { id, type: element.name, args: element.attributes.map((each) => values[each.name] ?? null) }]);
        return ref(id);
    }

    converted(attribute: IfcAttributeInfo, entity: IfcEntity, value: IfcValue): IfcValue | undefined {
        if (isList(value) && value.length === 0 && attribute.optional && Array.isArray(attribute.type) && attribute.type[1] > 0) {
            return null;
        }
        const north = attribute.name === TRUE_NORTH && attribute.type === DIRECTION && isReference(value) ? this.flatNorth(value.ref) : undefined;
        if (north !== undefined) {
            return north;
        }
        if (isReference(value) && this.isDate(value.ref)) {
            const text = dateTextFor(attribute.type, this.partsOf(value.ref));
            if (text === undefined) {
                throw new Error(`#${entity.id} ${attribute.name} refers to the IFC2X3 date or time #${value.ref}, which IFC4 has no place for there, so the file cannot be upgraded`);
            }
            return text;
        }
        return isEnumeration(value) && typeof attribute.type === "string" ? this.enumerationFor(attribute.type, value) : undefined;
    }

    completed(info: IfcEntityInfo, entity: IfcEntity, args: IfcValue[]): IfcValue[] {
        const leftover = args.flatMap((value) => referencesIn(value)).find((id) => this.isDate(id));
        if (leftover !== undefined) {
            throw new Error(`#${entity.id} refers to the IFC2X3 date or time #${leftover} where IFC4 takes no text, so the file cannot be upgraded`);
        }
        const renamed = info.attributes.findIndex((_, index) => {
            const before = entity.args[index];
            const after = args[index];
            return isEnumeration(before) && isEnumeration(after) && after.enum === USER_DEFINED && before.enum !== USER_DEFINED;
        });
        const token = entity.args[renamed];
        const slots = NAMED_BY.map((name) => info.positions.get(name)).filter((position) => position !== undefined);
        const slot = slots.find((position) => args[position] === null);
        const named = [...args];
        if (isEnumeration(token) && slot !== undefined) {
            named[slot] = token.enum;
        }
        const predefined = info.positions.get(PREDEFINED_TYPE);
        const kind = predefined === undefined ? undefined : named[predefined];
        const kinds = predefined === undefined ? undefined : this.enumerationTokens(info.attributes[predefined]!.type);
        if (predefined !== undefined && isEnumeration(kind) && kind.enum === USER_DEFINED && kinds?.includes(NOT_DEFINED) && slots.every((position) => named[position] === null)) {
            named[predefined] = enumValue(NOT_DEFINED);
        }
        return info.name === OWNER_HISTORY ? this.dated(info, named) : named;
    }

    private dated(info: IfcEntityInfo, args: IfcValue[]): IfcValue[] {
        const action = args[info.positions.get("ChangeAction")!];
        const modified = info.positions.get("LastModifiedDate")!;
        if (!isEnumeration(action) || !DATED_ACTIONS.has(action.enum) || args[modified] !== null) {
            return args;
        }
        const dated = [...args];
        dated[modified] = args[info.positions.get("CreationDate")!] ?? null;
        return dated;
    }

    private enumerationTokens(spec: IfcAttributeInfo["type"]): readonly string[] | undefined {
        const type = typeof spec === "string" ? this.schema.type(spec) : undefined;
        return type !== undefined && "e" in type ? type.e : undefined;
    }

    private flatNorth(direction: number): IfcValue | undefined {
        const ratios = this.model.attribute(direction, "DirectionRatios");
        if (!isList(ratios) || ratios.length !== SPATIAL) {
            return undefined;
        }
        const [x, y] = ratios;
        if (typeof x !== "number" || typeof y !== "number" || (x === 0 && y === 0)) {
            return null;
        }
        const id = this.nextId++;
        this.created.push([id, { id, type: DIRECTION, args: [[x, y]] }]);
        return ref(id);
    }

    private enumerationFor(typeName: string, value: IfcEnumerationValue): IfcValue | undefined {
        const tokens = this.enumerationTokens(typeName);
        if (tokens === undefined) {
            return this.schema.underlying(typeName) === STRING ? value.enum : undefined;
        }
        if (tokens.includes(value.enum)) {
            return undefined;
        }
        const fallback = [USER_DEFINED, NOT_DEFINED].find((token) => tokens.includes(token));
        return fallback === undefined ? undefined : enumValue(fallback);
    }

    private partsOf(id: number): DateParts {
        const args = this.model.source?.rawArguments(id);
        switch (this.model.source?.rawTypeOf(id)?.toUpperCase()) {
            case CALENDAR_DATE:
                return { date: `${String(numberIn(args, 2, id)).padStart(YEAR_DIGITS, "0")}-${twoDigits(numberIn(args, 1, id))}-${twoDigits(numberIn(args, 0, id))}` };
            case LOCAL_TIME: {
                const zone = args?.[3];
                return { time: `${twoDigits(numberIn(args, 0, id))}:${twoDigits(optionalNumberIn(args, 1))}:${secondsText(optionalNumberIn(args, 2))}${isReference(zone) ? this.offsetOf(zone.ref) : ""}` };
            }
            case DATE_AND_TIME: {
                const [date, time] = [args?.[0], args?.[1]];
                return { ...(isReference(date) ? this.partsOf(date.ref) : {}), ...(isReference(time) ? this.partsOf(time.ref) : {}) };
            }
            default:
                return {};
        }
    }

    private offsetOf(id: number): string {
        const args = this.model.source?.rawArguments(id);
        const sense = args?.[2];
        return `${isEnumeration(sense) && sense.enum === BEHIND ? "-" : "+"}${twoDigits(numberIn(args, 0, id))}:${twoDigits(optionalNumberIn(args, 1))}`;
    }

    private globalId(): string {
        return this.model.seededIds ? automaticGlobalId(this.model.keySeed, `${this.model.nextId}.${this.issued++}`) : randomGlobalId();
    }
}
