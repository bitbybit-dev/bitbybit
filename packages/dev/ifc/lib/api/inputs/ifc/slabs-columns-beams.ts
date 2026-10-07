import type { Base } from "../base-inputs";
import { memberPredefinedTypeEnum, profileKindEnum, roofKindEnum, slabPredefinedTypeEnum } from "./pointers-and-enums";

/**
 * A slab to add for `slabs.add`: an outline in a storey's plan, with optional holes, extruded down
 * from its top by its thickness.
 */
export class AddSlabDto<T> {
    constructor(model?: T, storey?: string, id?: string, name?: string, outline?: Base.Point2[], holes?: Base.Point2[][], thickness?: number, layerSet?: string, topOffset?: number, predefinedType?: slabPredefinedTypeEnum) {
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (outline !== undefined) { this.outline = outline; }
        if (holes !== undefined) { this.holes = holes; }
        if (thickness !== undefined) { this.thickness = thickness; }
        if (layerSet !== undefined) { this.layerSet = layerSet; }
        if (topOffset !== undefined) { this.topOffset = topOffset; }
        if (predefinedType !== undefined) { this.predefinedType = predefinedType; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The storey the slab belongs to, by GlobalId or by the id it was added with.
     * @default undefined
     */
    storey!: string;
    /**
     * An id of your own for the slab. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the slab, which other tools show; it need not be unique.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * The outline, as `[x, y]` points in the storey's plan, without the first repeated at the end;
     * either winding works.
     * @default undefined
     */
    outline!: Base.Point2[];
    /**
     * Holes through the slab, each an outline like `outline`, inside it.
     * @default undefined
     * @optional true
     */
    holes?: Base.Point2[][] | undefined;
    /**
     * The slab's thickness, used when no `layerSet` is given. Left out, 200 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    thickness?: number | undefined;
    /**
     * The name of the layer set the slab is made of, its first layer at the top; its layers set the
     * thickness.
     * @default undefined
     * @optional true
     */
    layerSet?: string | undefined;
    /**
     * How high the slab's top is above the storey's floor.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    topOffset?: number | undefined = 0;
    /**
     * What kind of slab it is.
     * @default floor
     */
    predefinedType?: slabPredefinedTypeEnum | undefined = slabPredefinedTypeEnum.floor;
}
/**
 * The section shared by `columns.add`, `beams.add` and `members.add`: its kind and the sizes that kind reads, a
 * rectangle's `width` and `depth`, a circle's `radius`, or an I section's `width`, `depth`,
 * `webThickness` and `flangeThickness`.
 */
export abstract class MemberSharedDto<T> {
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The storey the member belongs to, by GlobalId or by the id it was added with.
     * @default undefined
     */
    storey!: string;
    /**
     * An id of your own for the member. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the column, beam or member, which other tools show; it need not be unique.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * The section's shape.
     * @default rectangle
     */
    profile?: profileKindEnum | undefined = profileKindEnum.rectangle;
    /**
     * The section's size along its X: a rectangle's width, or an I section's flange width. Left out, 300 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    width?: number | undefined;
    /**
     * The section's size along its Y: a rectangle's depth, or an I section's overall depth. Left out, 300 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    depth?: number | undefined;
    /**
     * A circular section's radius. Left out, 150 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    radius?: number | undefined;
    /**
     * An I section's web thickness. Left out, 10 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    webThickness?: number | undefined;
    /**
     * An I section's flange thickness. Left out, 15 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    flangeThickness?: number | undefined;
    /**
     * How far the section turns about the member's own axis, in degrees.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    rotation?: number | undefined = 0;
    /**
     * The name of the member's material, added before with `materials.add`.
     * @default undefined
     * @optional true
     */
    material?: string | undefined;
}
/**
 * A column to add for `columns.add`: a section standing upright on a point of a storey's plan.
 */
export class AddColumnDto<T> extends MemberSharedDto<T> {
    constructor(model?: T, storey?: string, position?: Base.Point2, height?: number, baseOffset?: number, id?: string, name?: string, profile?: profileKindEnum, width?: number, depth?: number, radius?: number, webThickness?: number, flangeThickness?: number, rotation?: number, material?: string) {
        super();
        if (position !== undefined) { this.position = position; }
        if (height !== undefined) { this.height = height; }
        if (baseOffset !== undefined) { this.baseOffset = baseOffset; }
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (profile !== undefined) { this.profile = profile; }
        if (width !== undefined) { this.width = width; }
        if (depth !== undefined) { this.depth = depth; }
        if (radius !== undefined) { this.radius = radius; }
        if (webThickness !== undefined) { this.webThickness = webThickness; }
        if (flangeThickness !== undefined) { this.flangeThickness = flangeThickness; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (material !== undefined) { this.material = material; }
    }
    /**
     * Where the column stands, as `[x, y]` in the storey's plan; the section is centred on it.
     * @default [0, 0]
     */
    position?: Base.Point2 | undefined = [0, 0];
    /**
     * How tall the column is, from its base up. Left out, 3 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    height?: number | undefined;
    /**
     * How far above the storey's floor the column starts.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    baseOffset?: number | undefined = 0;
}
/**
 * A beam to add for `beams.add`: a section swept straight from `start` to `end`, centred on that
 * line, with its Y up when the beam is not vertical.
 */
export class AddBeamDto<T> extends MemberSharedDto<T> {
    constructor(model?: T, storey?: string, start?: Base.Point3, end?: Base.Point3, id?: string, name?: string, profile?: profileKindEnum, width?: number, depth?: number, radius?: number, webThickness?: number, flangeThickness?: number, rotation?: number, material?: string) {
        super();
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (profile !== undefined) { this.profile = profile; }
        if (width !== undefined) { this.width = width; }
        if (depth !== undefined) { this.depth = depth; }
        if (radius !== undefined) { this.radius = radius; }
        if (webThickness !== undefined) { this.webThickness = webThickness; }
        if (flangeThickness !== undefined) { this.flangeThickness = flangeThickness; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (material !== undefined) { this.material = material; }
    }
    /**
     * Where the beam's axis starts, as `[x, y, z]` in the storey: X and Y in plan, Z up from the
     * storey's floor.
     * @default undefined
     */
    start!: Base.Point3;
    /**
     * Where the beam's axis ends.
     * @default undefined
     */
    end!: Base.Point3;
}
/**
 * A member to add for `members.add`: a section swept straight from `start` to `end`, such as a brace,
 * a rafter, a stud or a mullion.
 */
export class AddMemberDto<T> extends MemberSharedDto<T> {
    constructor(model?: T, storey?: string, start?: Base.Point3, end?: Base.Point3, id?: string, name?: string, profile?: profileKindEnum, width?: number, depth?: number, radius?: number, webThickness?: number, flangeThickness?: number, rotation?: number, material?: string, predefinedType?: memberPredefinedTypeEnum) {
        super();
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (profile !== undefined) { this.profile = profile; }
        if (width !== undefined) { this.width = width; }
        if (depth !== undefined) { this.depth = depth; }
        if (radius !== undefined) { this.radius = radius; }
        if (webThickness !== undefined) { this.webThickness = webThickness; }
        if (flangeThickness !== undefined) { this.flangeThickness = flangeThickness; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (material !== undefined) { this.material = material; }
        if (predefinedType !== undefined) { this.predefinedType = predefinedType; }
    }
    /**
     * Where the member's axis starts, as `[x, y, z]` in the storey: X and Y in plan, Z up from the
     * storey's floor.
     * @default undefined
     */
    start!: Base.Point3;
    /**
     * Where the member's axis ends.
     * @default undefined
     */
    end!: Base.Point3;
    /**
     * What kind of member it is.
     * @default member
     */
    predefinedType?: memberPredefinedTypeEnum | undefined = memberPredefinedTypeEnum.member;
}
/**
 * A roof to add for `roofs.add`: a flat, mono-pitch, gable or hip roof over a rectangle in a storey's
 * plan, written as an `IfcRoof` whose parts are sloping slabs.
 */
export class AddRoofDto<T> {
    constructor(model?: T, storey?: string, id?: string, name?: string, outline?: Base.Point2[], kind?: roofKindEnum, pitch?: number, thickness?: number, layerSet?: string, overhang?: number, baseOffset?: number) {
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (outline !== undefined) { this.outline = outline; }
        if (kind !== undefined) { this.kind = kind; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (thickness !== undefined) { this.thickness = thickness; }
        if (layerSet !== undefined) { this.layerSet = layerSet; }
        if (overhang !== undefined) { this.overhang = overhang; }
        if (baseOffset !== undefined) { this.baseOffset = baseOffset; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The storey the roof stands on, by GlobalId or by the id it was added with.
     * @default undefined
     */
    storey!: string;
    /**
     * An id of your own for the roof. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the roof, which other tools show; it need not be unique.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * The rectangle's four corners in the storey's plan, such as the walls' outer faces. A mono-pitch
     * roof rises from the first side; a gable's ridge runs along it.
     * @default undefined
     */
    outline!: Base.Point2[];
    /**
     * The roof's shape.
     * @default gable
     */
    kind?: roofKindEnum | undefined = roofKindEnum.gable;
    /**
     * The slope of a sloping roof, in degrees from level, more than 0 and at most 89.
     * @default 30
     * @minimum 0
     * @maximum 89
     */
    pitch?: number | undefined = 30;
    /**
     * The roof's thickness, used when no `layerSet` is given. Left out, 200 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    thickness?: number | undefined;
    /**
     * The name of the layer set the roof is made of; its layers set the thickness.
     * @default undefined
     * @optional true
     */
    layerSet?: string | undefined;
    /**
     * How far the roof reaches past the outline on every side, measured level.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     */
    overhang?: number | undefined = 0;
    /**
     * How high above the storey's floor the roof's underside meets the outline, such as the height of
     * the walls under it.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    baseOffset?: number | undefined = 0;
}
