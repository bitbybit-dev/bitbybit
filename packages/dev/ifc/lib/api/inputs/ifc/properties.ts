/**
 * One property of a property set: its name, its value and, when the value needs one, its IFC type.
 * Used by `properties.addSet` and `properties.setValues`.
 */
export class PropertyDto {
    constructor(name?: string, value?: string | number | boolean, type?: string) {
        if (name !== undefined) { this.name = name; }
        if (value !== undefined) { this.value = value; }
        if (type !== undefined) { this.type = type; }
    }
    /**
     * The property's name, such as `IsExternal` or `FireRating`.
     * @default Property
     */
    name?: string | undefined = "Property";
    /**
     * The property's value: a text, a number, or true or false.
     * @default undefined
     */
    value!: string | number | boolean;
    /**
     * The IFC type to write the value as, such as `IfcLengthMeasure`. Left out, it follows the value:
     * a label, an integer, a real or a boolean.
     * @default undefined
     * @optional true
     */
    type?: string | undefined;
}
/**
 * A property set to attach to elements for `properties.addSet`, such as `Pset_WallCommon` with its
 * `IsExternal` and `LoadBearing`.
 */
export class AddPropertySetDto<T> {
    constructor(model?: T, elements?: string[], name?: string, properties?: PropertyDto[]) {
        if (model !== undefined) { this.model = model; }
        if (elements !== undefined) { this.elements = elements; }
        if (name !== undefined) { this.name = name; }
        if (properties !== undefined) { this.properties = properties; }
    }
    /**
     * The model the elements are in.
     * @default undefined
     */
    model!: T;
    /**
     * The elements, types or other objects the set describes, each by GlobalId or by the id it was
     * added with; one set is shared by all of them.
     * @default undefined
     */
    elements!: string[];
    /**
     * The set's name. Names starting with `Pset_` are reserved for the sets the IFC standard defines.
     * @default Properties
     */
    name?: string | undefined = "Properties";
    /**
     * The properties, each name once.
     * @default undefined
     */
    properties!: PropertyDto[];
}
/**
 * Values to set in one property set of one object for `properties.setValues`; the set is made when
 * the object has none of that name.
 */
export class SetPropertyValuesDto<T> {
    constructor(model?: T, element?: string, name?: string, properties?: PropertyDto[]) {
        if (model !== undefined) { this.model = model; }
        if (element !== undefined) { this.element = element; }
        if (name !== undefined) { this.name = name; }
        if (properties !== undefined) { this.properties = properties; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The element, type or other object, by GlobalId or by the id it was added with.
     * @default undefined
     */
    element!: string;
    /**
     * The name of the property set, such as `Pset_WallCommon`.
     * @default Properties
     */
    name?: string | undefined = "Properties";
    /**
     * The properties to set, each name once; a property the set already holds takes the new value.
     * @default undefined
     */
    properties!: PropertyDto[];
}
/**
 * Properties to take out of one property set of one object for `properties.removeValues`.
 */
export class RemovePropertyValuesDto<T> {
    constructor(model?: T, element?: string, name?: string, names?: string[]) {
        if (model !== undefined) { this.model = model; }
        if (element !== undefined) { this.element = element; }
        if (name !== undefined) { this.name = name; }
        if (names !== undefined) { this.names = names; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The element, type or other object, by GlobalId or by the id it was added with.
     * @default undefined
     */
    element!: string;
    /**
     * The name of the property set, such as `Pset_WallCommon`.
     * @default Properties
     */
    name?: string | undefined = "Properties";
    /**
     * The names of the properties to take out; the set goes when none are left.
     * @default undefined
     */
    names!: string[];
}
/**
 * One property set of one object to take away, for `properties.removeSet`.
 */
export class RemovePropertySetDto<T> {
    constructor(model?: T, element?: string, name?: string) {
        if (model !== undefined) { this.model = model; }
        if (element !== undefined) { this.element = element; }
        if (name !== undefined) { this.name = name; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The element, type or other object, by GlobalId or by the id it was added with.
     * @default undefined
     */
    element!: string;
    /**
     * The name of the property set, such as `Pset_WallCommon`.
     * @default Properties
     */
    name?: string | undefined = "Properties";
}
/**
 * A property set as `properties.getSets` reads it back.
 */
export class PropertySetInfoDto {
    /**
     * What the set is called, such as `Pset_WallCommon`.
     * @default ""
     */
    name = "";
    /**
     * Its single values by property name, such as `{ IsExternal: true }`.
     * @default {}
     */
    properties: Record<string, string | number | boolean> = {};
}
/**
 * The model and the elements to measure for `quantities.compute`, every one it can when left out.
 */
export class ComputeQuantitiesDto<T> {
    constructor(model?: T, elements?: string[]) {
        if (model !== undefined) { this.model = model; }
        if (elements !== undefined) { this.elements = elements; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The elements to measure, each by GlobalId or by the id it was added with. Left out, every element
     * of a kind this library measures.
     * @default undefined
     * @optional true
     */
    elements?: string[] | undefined;
}
/**
 * A quantity set as `quantities.get` reads it back: its name and each quantity's value by name.
 */
export class QuantitySetInfoDto {
    /**
     * What the set is called, such as `Qto_WallBaseQuantities`.
     * @default ""
     */
    name = "";
    /**
     * Each quantity's value by its name, such as `{ NetVolume: 5.2 }`: lengths in the model's length
     * unit, areas and volumes in its area and volume units.
     * @default {}
     */
    quantities: Record<string, number> = {};
}
