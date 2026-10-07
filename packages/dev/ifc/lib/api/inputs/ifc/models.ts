import type { Base } from "../base-inputs";
import { lengthUnitEnum } from "./pointers-and-enums";

/**
 * A model to read, for the methods that only look at it, such as `model.summary` and
 * `spatial.storeys`.
 */
export class ModelDto<T> {
    constructor(model?: T) {
        if (model !== undefined) { this.model = model; }
    }
    /**
     * The model to read, as `model.create` or `model.read` returned it.
     * @default undefined
     */
    model!: T;
}
/**
 * What `model.create` starts a new model with: a project, its site and one building, in the length
 * unit every later length is given in.
 */
export class CreateModelDto {
    constructor(name?: string, siteName?: string, buildingName?: string, lengthUnit?: lengthUnitEnum, seed?: string, author?: string, organization?: string) {
        if (name !== undefined) { this.name = name; }
        if (siteName !== undefined) { this.siteName = siteName; }
        if (buildingName !== undefined) { this.buildingName = buildingName; }
        if (lengthUnit !== undefined) { this.lengthUnit = lengthUnit; }
        if (seed !== undefined) { this.seed = seed; }
        if (author !== undefined) { this.author = author; }
        if (organization !== undefined) { this.organization = organization; }
    }
    /**
     * The project's name.
     * @default Project
     */
    name?: string | undefined = "Project";
    /**
     * The site's name.
     * @default Site
     */
    siteName?: string | undefined = "Site";
    /**
     * What the one building the model starts with is called.
     * @default Building
     */
    buildingName?: string | undefined = "Building";
    /**
     * The unit every length of the model is given and written in.
     * @default millimetre
     */
    lengthUnit?: lengthUnitEnum | undefined = lengthUnitEnum.millimetre;
    /**
     * Any text the model's GlobalIds are derived from, so running the same calls again writes the
     * same file. Leave it out for random GlobalIds, unique to this model.
     * @default undefined
     * @optional true
     */
    seed?: string | undefined;
    /**
     * Who the file's header names as its author.
     * @default undefined
     * @optional true
     */
    author?: string | undefined;
    /**
     * The organization the file's header names.
     * @default undefined
     * @optional true
     */
    organization?: string | undefined;
}
/**
 * The contents of an IFC file for `model.read`, as text or bytes.
 */
export class ReadModelDto {
    constructor(data?: string | Uint8Array | ArrayBuffer) {
        if (data !== undefined) { this.data = data; }
    }
    /**
     * The file's contents: the text of an `.ifc` file, or its bytes, such as what
     * `await file.arrayBuffer()` gives for a file a user picked.
     * @default undefined
     */
    data!: string | Uint8Array | ArrayBuffer;
}
/**
 * A model to write for `model.write`, with the file name and time its header records.
 */
export class WriteModelDto<T> {
    constructor(model?: T, fileName?: string, timeStamp?: string) {
        if (model !== undefined) { this.model = model; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (timeStamp !== undefined) { this.timeStamp = timeStamp; }
    }
    /**
     * The model whose entities the file holds.
     * @default undefined
     */
    model!: T;
    /**
     * The file name the header records.
     * @default model.ifc
     */
    fileName?: string | undefined = "model.ifc";
    /**
     * When the file was written, as ISO 8601 such as `2026-10-06T12:00:00`. Left out, the current
     * time; give one to write the same file every time.
     * @default undefined
     * @optional true
     */
    timeStamp?: string | undefined;
}
/**
 * A model and a filter for `model.elements`, which lists the elements of one type, optionally on one
 * storey.
 */
export class ElementsDto<T> {
    constructor(model?: T, type?: string, storey?: string) {
        if (model !== undefined) { this.model = model; }
        if (type !== undefined) { this.type = type; }
        if (storey !== undefined) { this.storey = storey; }
    }
    /**
     * The model to list from.
     * @default undefined
     */
    model!: T;
    /**
     * The IFC type to list, its subtypes included, such as `IfcWall`, `IfcBuildingElement` for walls,
     * slabs, doors and the like, or `IfcElement` for every element, openings included.
     * @default IfcElement
     */
    type?: string | undefined = "IfcElement";
    /**
     * Only the elements this storey contains, by GlobalId or by the id it was added with. Leave it
     * out for every storey.
     * @default undefined
     * @optional true
     */
    storey?: string | undefined;
}
/**
 * A model and one of its objects, by GlobalId or by the id it was added with, for `model.element`,
 * `model.remove`, `properties.getSets` and `quantities.get`.
 */
export class ElementDto<T> {
    constructor(model?: T, element?: string) {
        if (model !== undefined) { this.model = model; }
        if (element !== undefined) { this.element = element; }
    }
    /**
     * The model the object is in.
     * @default undefined
     */
    model!: T;
    /**
     * The object, by GlobalId or by the id it was added with.
     * @default undefined
     */
    element!: string;
}
/**
 * One attribute of an object to set for `model.setAttribute`, such as a wall's `Name` or `Tag`.
 */
export class SetAttributeDto<T> {
    constructor(model?: T, element?: string, attribute?: string, value?: string | number | boolean) {
        if (model !== undefined) { this.model = model; }
        if (element !== undefined) { this.element = element; }
        if (attribute !== undefined) { this.attribute = attribute; }
        if (value !== undefined) { this.value = value; }
    }
    /**
     * The model the object is in.
     * @default undefined
     */
    model!: T;
    /**
     * The object, by GlobalId or by the id it was added with.
     * @default undefined
     */
    element!: string;
    /**
     * The attribute's name, as the IFC schema spells it, such as `Name`, `Description` or `Tag`.
     * @default Name
     */
    attribute?: string | undefined = "Name";
    /**
     * The new value: a text, a number, true or false, or the name of an enumeration value for an
     * attribute that takes one.
     * @default undefined
     */
    value!: string | number | boolean;
}
/**
 * An object's attribute to read for `model.getAttribute`.
 */
export class GetAttributeDto<T> {
    constructor(model?: T, element?: string, attribute?: string) {
        if (model !== undefined) { this.model = model; }
        if (element !== undefined) { this.element = element; }
        if (attribute !== undefined) { this.attribute = attribute; }
    }
    /**
     * The model the object is in.
     * @default undefined
     */
    model!: T;
    /**
     * The object, by GlobalId or by the id it was added with.
     * @default undefined
     */
    element!: string;
    /**
     * The attribute's name, as the IFC schema spells it, such as `Name`, `Description` or `Tag`.
     * @default Name
     */
    attribute?: string | undefined = "Name";
}
/**
 * A model and an id for `model.globalIdOf`, which says which GlobalId the id stands for.
 */
export class GlobalIdOfDto<T> {
    constructor(model?: T, id?: string) {
        if (model !== undefined) { this.model = model; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * The model the id belongs to; ids of different models stand for different GlobalIds.
     * @default undefined
     */
    model!: T;
    /**
     * Any text used as an id, or a GlobalId, which stands for itself.
     * @default undefined
     */
    id!: string;
}
/**
 * How far to move an element and how far to turn it, for `model.move`.
 */
export class MoveElementDto<T> {
    constructor(model?: T, element?: string, translation?: Base.Vector3, rotation?: number) {
        if (model !== undefined) { this.model = model; }
        if (element !== undefined) { this.element = element; }
        if (translation !== undefined) { this.translation = translation; }
        if (rotation !== undefined) { this.rotation = rotation; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The element or space, by GlobalId or by the id it was added with.
     * @default undefined
     */
    element!: string;
    /**
     * How far to move it, as `[x, y, z]` in the plan of its storey: X and Y in plan, Z up.
     * @default [0, 0, 0]
     */
    translation?: Base.Vector3 | undefined = [0, 0, 0];
    /**
     * How far to turn it, in degrees counterclockwise seen from above, about the vertical through
     * its own origin; it turns before it moves.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    rotation?: number | undefined = 0;
}
