import type { Base } from "../base-inputs";

/**
 * What every element `elements.add` and `elements.addShape` add shares: the model, the storey it
 * stands on, its class, names, placement and material.
 */
export abstract class ElementSharedDto<T> {
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The storey the element stands on, by GlobalId or by the id it was added with.
     * @default undefined
     */
    storey!: string;
    /**
     * An id of your own for the element. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the element, which other tools show.
     * @default Element
     */
    name?: string | undefined = "Element";
    /**
     * The IFC class of the element, any kind of IfcElement that is not abstract, such as
     * `IfcBuildingElementProxy`, `IfcFurniture` or `IfcPipeFitting`.
     * @default IfcBuildingElementProxy
     */
    type?: string | undefined = "IfcBuildingElementProxy";
    /**
     * The predefined type of a class that has one, as IFC writes it, such as `NOTDEFINED`; left
     * out, `NOTDEFINED`, or `USERDEFINED` when `objectType` is given.
     * @default undefined
     * @optional true
     */
    predefinedType?: string | undefined;
    /**
     * What the element is, in words, when no predefined type says it, such as `Bracket`.
     * @default undefined
     * @optional true
     */
    objectType?: string | undefined;
    /**
     * Where the body's origin stands, as `[x, y, z]` in the storey's plan, z up from its floor.
     * @default [0, 0, 0]
     */
    position?: Base.Point3 | undefined = [0, 0, 0];
    /**
     * How far the body turns about the vertical, in degrees, counterclockwise seen from above.
     * @default 0
     * @minimum -360
     * @maximum 360
     * @step 15
     */
    rotation?: number | undefined = 0;
    /**
     * The name of a material the model holds, given to the element.
     * @default undefined
     * @optional true
     */
    material?: string | undefined;
}

/**
 * An element to add for `elements.add`: any kind of element, its body given as exact boundary
 * representations or triangle meshes, standing on a storey.
 */
export class AddElementDto<T> extends ElementSharedDto<T> {
    constructor(model?: T, storey?: string, body?: Base.Recipe, id?: string, name?: string, type?: string, predefinedType?: string, objectType?: string, position?: Base.Point3, rotation?: number, material?: string) {
        super();
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (body !== undefined) { this.body = body; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (type !== undefined) { this.type = type; }
        if (predefinedType !== undefined) { this.predefinedType = predefinedType; }
        if (objectType !== undefined) { this.objectType = objectType; }
        if (position !== undefined) { this.position = position; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (material !== undefined) { this.material = material; }
    }
    /**
     * The element's body: a recipe whose roots are brep steps, written as advanced breps, or
     * triangle steps, written as triangulated face sets, such as `occt.recipes.describe` gives.
     * @default undefined
     */
    body!: Base.Recipe;
}

/**
 * An element to add for `elements.addShape`: any kind of element whose body is an OpenCascade shape,
 * standing on a storey.
 */
export class AddShapeElementDto<T, S> extends ElementSharedDto<T> {
    constructor(model?: T, storey?: string, shape?: S, millimetresPerUnit?: number, id?: string, name?: string, type?: string, predefinedType?: string, objectType?: string, position?: Base.Point3, rotation?: number, material?: string) {
        super();
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (shape !== undefined) { this.shape = shape; }
        if (millimetresPerUnit !== undefined) { this.millimetresPerUnit = millimetresPerUnit; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (type !== undefined) { this.type = type; }
        if (predefinedType !== undefined) { this.predefinedType = predefinedType; }
        if (objectType !== undefined) { this.objectType = objectType; }
        if (position !== undefined) { this.position = position; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (material !== undefined) { this.material = material; }
    }
    /**
     * The element's body: a solid, several, a shell or faces, described exactly.
     * @default undefined
     */
    shape!: S;
    /**
     * How many millimetres one unit of the shape's coordinates is.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    millimetresPerUnit?: number | undefined = 1;
}
