import type { Base } from "../base-inputs";
import { spacePredefinedTypeEnum } from "./pointers-and-enums";

/**
 * A storey to add to the model's building for `spatial.addStorey`, at its elevation above the
 * building's origin.
 */
export class AddStoreyDto<T> {
    constructor(model?: T, id?: string, name?: string, elevation?: number) {
        if (model !== undefined) { this.model = model; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (elevation !== undefined) { this.elevation = elevation; }
    }
    /**
     * The model to change, which must have exactly one building; it stays as it was, and the call
     * returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * An id of your own, such as `ground`, by which later calls refer to the storey; the model turns
     * it into a GlobalId. Left out, one is generated.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * What the storey is called, such as `Ground floor`.
     * @default Storey
     */
    name?: string | undefined = "Storey";
    /**
     * How high the storey's floor is above the building's origin.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    elevation?: number | undefined = 0;
}
/**
 * A material to add for `materials.add`, which layer sets, columns and beams then name.
 */
export class AddMaterialDto<T> {
    constructor(model?: T, name?: string, category?: string, color?: string, transparency?: number) {
        if (model !== undefined) { this.model = model; }
        if (name !== undefined) { this.name = name; }
        if (category !== undefined) { this.category = category; }
        if (color !== undefined) { this.color = color; }
        if (transparency !== undefined) { this.transparency = transparency; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The material's name, unique in the model, by which layer sets and members refer to it.
     * @default Material
     */
    name?: string | undefined = "Material";
    /**
     * A broad category such as `concrete`, `steel`, `brick` or `timber`.
     * @default undefined
     * @optional true
     */
    category?: string | undefined;
    /**
     * The colour the material is shown with, as hex such as `#b5651d`. Leave it out for none.
     * @default undefined
     * @optional true
     */
    color?: string | undefined;
    /**
     * How see-through the material is shown, from 0 for opaque to 1 for invisible; used with
     * `color`.
     * @default 0
     * @minimum 0
     * @maximum 1
     */
    transparency?: number | undefined = 0;
}
/**
 * One layer of a layer set: its material, by name, and its thickness. Used by `materials.addLayerSet`.
 */
export class MaterialLayerDto {
    constructor(material?: string, thickness?: number, name?: string) {
        if (material !== undefined) { this.material = material; }
        if (thickness !== undefined) { this.thickness = thickness; }
        if (name !== undefined) { this.name = name; }
    }
    /**
     * The name of the layer's material, added before with `materials.add`. Leave it out for a layer
     * without one.
     * @default undefined
     * @optional true
     */
    material?: string | undefined;
    /**
     * How thick the layer is, across the wall or down through the slab. Left out, 100 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     */
    thickness?: number | undefined;
    /**
     * The layer's own name, such as `Insulation`.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
}
/**
 * A named stack of material layers for `materials.addLayerSet`, which walls and slabs are then made
 * of; a wall's first layer is on its right face, looking from its start to its end, and a slab's
 * is at its top.
 */
export class AddLayerSetDto<T> {
    constructor(model?: T, name?: string, layers?: MaterialLayerDto[]) {
        if (model !== undefined) { this.model = model; }
        if (name !== undefined) { this.name = name; }
        if (layers !== undefined) { this.layers = layers; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The layer set's name, unique in the model, by which walls, wall types and slabs refer to it.
     * @default Layers
     */
    name?: string | undefined = "Layers";
    /**
     * The layers, in order; their thicknesses add up to the thickness of what is made of them.
     * @default undefined
     */
    layers!: MaterialLayerDto[];
}
/**
 * A storey as `spatial.storeys` and `model.summary` list it: its GlobalId, name and elevation.
 */
export class StoreyInfoDto {
    /**
     * The GlobalId that identifies the storey.
     * @default ""
     */
    globalId = "";
    /**
     * What the storey is called.
     * @default ""
     */
    name = "";
    /**
     * How high its floor is above the building's origin, in the model's length unit.
     * @default 0
     */
    elevation = 0;
}
/**
 * A storey and its new elevation for `spatial.setElevation`.
 */
export class SetStoreyElevationDto<T> {
    constructor(model?: T, storey?: string, elevation?: number) {
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (elevation !== undefined) { this.elevation = elevation; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The storey, by GlobalId or by the id it was added with.
     * @default undefined
     */
    storey!: string;
    /**
     * How high its floor is now above the building's origin; everything on the storey moves with it.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    elevation?: number | undefined = 0;
}
/**
 * A space to add for `spaces.add`: a room or an area of a storey, an outline in the storey's plan
 * extruded up to its height.
 */
export class AddSpaceDto<T> {
    constructor(model?: T, storey?: string, id?: string, name?: string, longName?: string, outline?: Base.Point2[], height?: number, baseOffset?: number, predefinedType?: spacePredefinedTypeEnum) {
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (longName !== undefined) { this.longName = longName; }
        if (outline !== undefined) { this.outline = outline; }
        if (height !== undefined) { this.height = height; }
        if (baseOffset !== undefined) { this.baseOffset = baseOffset; }
        if (predefinedType !== undefined) { this.predefinedType = predefinedType; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The storey the space belongs to, by GlobalId or by the id it was added with.
     * @default undefined
     */
    storey!: string;
    /**
     * An id of your own for the space. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * The space's short name or number, such as `1.04`.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * The space's full name, such as `Kitchen`.
     * @default undefined
     * @optional true
     */
    longName?: string | undefined;
    /**
     * The outline, as `[x, y]` points in the storey's plan, without the first repeated at the end;
     * either winding works.
     * @default undefined
     */
    outline!: Base.Point2[];
    /**
     * How high the space reaches, up from its base. Left out, 3 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    height?: number | undefined;
    /**
     * How far above the storey's floor the space starts.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    baseOffset?: number | undefined = 0;
    /**
     * What kind of space it is.
     * @default space
     */
    predefinedType?: spacePredefinedTypeEnum | undefined = spacePredefinedTypeEnum.space;
}
/**
 * A model and, optionally, a storey, for `spaces.list`.
 */
export class SpacesDto<T> {
    constructor(model?: T, storey?: string) {
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
    }
    /**
     * The model to list the spaces of.
     * @default undefined
     */
    model!: T;
    /**
     * Only the spaces of this storey, by GlobalId or by the id it was added with. Leave it out for
     * every storey.
     * @default undefined
     * @optional true
     */
    storey?: string | undefined;
}
/**
 * A space as `spaces.list` describes it: its number and name, its storey, and its area and height.
 */
export class SpaceInfoDto {
    /**
     * The GlobalId that identifies the space.
     * @default ""
     */
    globalId = "";
    /**
     * Its short name or number, or an empty text when it has none.
     * @default ""
     */
    name = "";
    /**
     * Its full name, or an empty text when it has none.
     * @default ""
     */
    longName = "";
    /**
     * The GlobalId of the storey it belongs to, or an empty text when it belongs to none.
     * @default ""
     */
    storey = "";
    /**
     * The area of its outline, in the square of the model's length unit; 0 when its body is not an
     * outline extruded up.
     * @default 0
     */
    area = 0;
    /**
     * How high it reaches; 0 when its body is not an outline extruded up.
     * @default 0
     */
    height = 0;
}
/**
 * An element as `model.elements` and `model.element` describe it.
 */
export class ElementInfoDto {
    /**
     * The GlobalId that identifies the element.
     * @default ""
     */
    globalId = "";
    /**
     * Its IFC type, such as `IfcWall`.
     * @default ""
     */
    type = "";
    /**
     * Its name, or an empty text when it has none.
     * @default ""
     */
    name = "";
    /**
     * The GlobalId of the storey that contains it, or an empty text when none does.
     * @default ""
     */
    storey = "";
}
/**
 * What a model holds, as `model.summary` describes it.
 */
export class ModelSummaryDto {
    /**
     * The schema the model's file names, such as `IFC4`.
     * @default ""
     */
    schema = "";
    /**
     * Whether the model can be changed: false for an `IFC2X3` file, which is read through `IFC4`
     * to be shown and queried.
     * @default true
     */
    editable = true;
    /**
     * What the project is called.
     * @default ""
     */
    project = "";
    /**
     * How many millimetres one length unit of the model is.
     * @default 1
     */
    millimetresPerUnit = 1;
    /**
     * How many entities the model holds, geometry and relationships included.
     * @default 0
     */
    entities = 0;
    /**
     * The storeys, lowest first.
     * @default []
     */
    storeys: StoreyInfoDto[] = [];
    /**
     * How many elements of each IFC type the model holds, such as `{ IfcWall: 8 }`.
     * @default {}
     */
    elementCounts: Record<string, number> = {};
}
