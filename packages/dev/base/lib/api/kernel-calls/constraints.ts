/**
 * What a value has to be for a DTO property to accept it. `point` is a point of either two or three
 * coordinates. `opaque` is anything the table cannot
 * check further - a kernel's shape, a generic value, a typed array - and only its presence is
 * checked, when it is required.
 */
export type ValueKind = "number" | "boolean" | "string" | "color" | "point" | "point2" | "point3" | "vector2" | "vector3" | "list" | "oneOf" | "opaque";

/**
 * The constraint on one DTO property: its kind, whether it has to be there, the kind of the items
 * of a list, and the values a `oneOf` accepts.
 */
export type PropertyConstraint = {
    readonly kind: ValueKind;
    readonly required?: boolean;
    readonly items?: PropertyConstraint;
    readonly values?: readonly string[];
    readonly bounds?: NumberBounds;
};

/**
 * The range a number has to fall in. A bound left out is open; an exclusive bound excludes the
 * limit itself, so `{ min: 0, exclusiveMin: true }` asks for a number above 0.
 */
export type NumberBounds = {
    readonly min?: number;
    readonly max?: number;
    readonly exclusiveMin?: boolean;
    readonly exclusiveMax?: boolean;
};

/**
 * The constraints on every property of one DTO, by property name.
 */
export type DtoConstraints = Readonly<Record<string, PropertyConstraint>>;

const kind = (value: ValueKind): PropertyConstraint => ({ kind: value });

/**
 * The building blocks of a constraint table, as the generated tables spell them.
 */
export const constraintKinds = {
    number: kind("number"),
    boolean: kind("boolean"),
    string: kind("string"),
    color: kind("color"),
    point: kind("point"),
    point2: kind("point2"),
    point3: kind("point3"),
    vector2: kind("vector2"),
    vector3: kind("vector3"),
    opaque: kind("opaque"),
    list: (items: PropertyConstraint): PropertyConstraint => ({ kind: "list", items }),
    oneOf: (values: readonly string[]): PropertyConstraint => ({ kind: "oneOf", values }),
    required: (constraint: PropertyConstraint): PropertyConstraint => ({ ...constraint, required: true }),
    between: (constraint: PropertyConstraint, bounds: NumberBounds): PropertyConstraint => ({ ...constraint, bounds }),
};
