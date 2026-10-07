import type { Base } from "../base-inputs";
import { wallAlignmentEnum, wallEndEnum, wallPredefinedTypeEnum } from "./pointers-and-enums";

/**
 * A straight wall to add for `walls.add`: an axis from `start` to `end` on a storey, a height, and
 * either a `thickness` or the layer set it is made of.
 */
export class AddWallDto<T> {
    constructor(model?: T, storey?: string, id?: string, name?: string, start?: Base.Point2, end?: Base.Point2, height?: number, thickness?: number, layerSet?: string, alignment?: wallAlignmentEnum, baseOffset?: number, wallType?: string, predefinedType?: wallPredefinedTypeEnum) {
        if (model !== undefined) { this.model = model; }
        if (storey !== undefined) { this.storey = storey; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (height !== undefined) { this.height = height; }
        if (thickness !== undefined) { this.thickness = thickness; }
        if (layerSet !== undefined) { this.layerSet = layerSet; }
        if (alignment !== undefined) { this.alignment = alignment; }
        if (baseOffset !== undefined) { this.baseOffset = baseOffset; }
        if (wallType !== undefined) { this.wallType = wallType; }
        if (predefinedType !== undefined) { this.predefinedType = predefinedType; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The storey the wall stands on, by GlobalId or by the id it was added with.
     * @default undefined
     */
    storey!: string;
    /**
     * An id of your own, such as `north-wall`, by which later calls refer to the wall; the model
     * turns it into a GlobalId. Left out, one is generated.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the wall, which other tools show; it need not be unique.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * The start of the wall's axis, as `[x, y]` in the storey's plan.
     * @default undefined
     */
    start!: Base.Point2;
    /**
     * The end of the wall's axis, as `[x, y]` in the storey's plan.
     * @default undefined
     */
    end!: Base.Point2;
    /**
     * The wall's height, up from its base. Left out, 3 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    height?: number | undefined;
    /**
     * The wall's thickness, used when no `layerSet` is given; the wall is then one layer without a
     * material. Left out, 200 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    thickness?: number | undefined;
    /**
     * The name of the layer set the wall is made of, added before with `materials.addLayerSet`; its
     * layers set the thickness.
     * @default undefined
     * @optional true
     */
    layerSet?: string | undefined;
    /**
     * Which side of the axis the wall's layers lie on, looking from `start` to `end`. Walls drawn
     * counterclockwise around a plan with `right` stand outside the outline.
     * @default center
     */
    alignment?: wallAlignmentEnum | undefined = wallAlignmentEnum.center;
    /**
     * How far above the storey's floor the wall starts.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    baseOffset?: number | undefined = 0;
    /**
     * The wall type the wall is an occurrence of, by GlobalId or by the id it was added with.
     * @default undefined
     * @optional true
     */
    wallType?: string | undefined;
    /**
     * What kind of wall it is, for a wall without a `wallType`; a wall of a type is the kind its
     * type says.
     * @default standard
     */
    predefinedType?: wallPredefinedTypeEnum | undefined = wallPredefinedTypeEnum.standard;
}
/**
 * Two walls for `walls.connect`, which works out where they meet and trims both, or for
 * `walls.disconnect`, which takes the join away.
 */
export class ConnectWallsDto<T> {
    constructor(model?: T, wall?: string, other?: string) {
        if (model !== undefined) { this.model = model; }
        if (wall !== undefined) { this.wall = wall; }
        if (other !== undefined) { this.other = other; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * One wall, by GlobalId or by the id it was added with.
     * @default undefined
     */
    wall!: string;
    /**
     * The other wall, by GlobalId or by the id it was added with.
     * @default undefined
     */
    other!: string;
}
/**
 * A wall and a plane to clip it with for `walls.clipByPlane`, which removes the part of the wall on
 * the side the plane's normal points to.
 */
export class ClipWallDto<T> {
    constructor(model?: T, wall?: string, origin?: Base.Point3, normal?: Base.Vector3) {
        if (model !== undefined) { this.model = model; }
        if (wall !== undefined) { this.wall = wall; }
        if (origin !== undefined) { this.origin = origin; }
        if (normal !== undefined) { this.normal = normal; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The wall, by GlobalId or by the id it was added with.
     * @default undefined
     */
    wall!: string;
    /**
     * A point on the plane, as `[x, y, z]` in the wall's storey: X and Y in plan, Z up from the
     * storey's floor.
     * @default undefined
     */
    origin!: Base.Point3;
    /**
     * The plane's normal, pointing to the side that is removed; `[0, 0, 1]` cuts the top off level.
     * @default [0, 0, 1]
     */
    normal?: Base.Vector3 | undefined = [0, 0, 1];
}
/**
 * A wall and a roof to clip it under, for `walls.clipByRoof`.
 */
export class ClipWallByRoofDto<T> {
    constructor(model?: T, wall?: string, roof?: string) {
        if (model !== undefined) { this.model = model; }
        if (wall !== undefined) { this.wall = wall; }
        if (roof !== undefined) { this.roof = roof; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The wall, by GlobalId or by the id it was added with.
     * @default undefined
     */
    wall!: string;
    /**
     * The roof, by GlobalId or by the id it was added with.
     * @default undefined
     */
    roof!: string;
}
/**
 * A wall type to add for `walls.addType`: a named kind of wall made of a layer set, which walls are
 * then occurrences of.
 */
export class AddWallTypeDto<T> {
    constructor(model?: T, id?: string, name?: string, layerSet?: string, predefinedType?: wallPredefinedTypeEnum) {
        if (model !== undefined) { this.model = model; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (layerSet !== undefined) { this.layerSet = layerSet; }
        if (predefinedType !== undefined) { this.predefinedType = predefinedType; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * An id of your own for the type, by which walls refer to it. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * The type's name.
     * @default Wall type
     */
    name?: string | undefined = "Wall type";
    /**
     * The name of the layer set walls of this type are made of.
     * @default undefined
     */
    layerSet!: string;
    /**
     * What kind of wall the type is.
     * @default standard
     */
    predefinedType?: wallPredefinedTypeEnum | undefined = wallPredefinedTypeEnum.standard;
}
/**
 * A wall of a model, for `walls.parameters`.
 */
export class WallDto<T> {
    constructor(model?: T, wall?: string) {
        if (model !== undefined) { this.model = model; }
        if (wall !== undefined) { this.wall = wall; }
    }
    /**
     * The model to read the wall from.
     * @default undefined
     */
    model!: T;
    /**
     * The wall, by GlobalId or by the id it was added with.
     * @default undefined
     */
    wall!: string;
}
/**
 * What to change about a wall for `walls.edit`. Everything left out stays as it is.
 */
export class EditWallDto<T> {
    constructor(model?: T, wall?: string, start?: Base.Point2, end?: Base.Point2, height?: number, baseOffset?: number, thickness?: number, layerSet?: string, alignment?: wallAlignmentEnum) {
        if (model !== undefined) { this.model = model; }
        if (wall !== undefined) { this.wall = wall; }
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (height !== undefined) { this.height = height; }
        if (baseOffset !== undefined) { this.baseOffset = baseOffset; }
        if (thickness !== undefined) { this.thickness = thickness; }
        if (layerSet !== undefined) { this.layerSet = layerSet; }
        if (alignment !== undefined) { this.alignment = alignment; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The wall, by GlobalId or by the id it was added with.
     * @default undefined
     */
    wall!: string;
    /**
     * The new start of the wall's axis, as `[x, y]` in its storey's plan. Openings keep their offset
     * from the start.
     * @default undefined
     * @optional true
     */
    start?: Base.Point2 | undefined;
    /**
     * The new end of the wall's axis, as `[x, y]` in its storey's plan.
     * @default undefined
     * @optional true
     */
    end?: Base.Point2 | undefined;
    /**
     * The new height, up from the wall's base.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    height?: number | undefined;
    /**
     * How far above its storey's floor the wall now starts; openings keep their sill above the
     * wall's base.
     * @default undefined
     * @optional true
     * @minimum -Infinity
     * @maximum Infinity
     */
    baseOffset?: number | undefined;
    /**
     * A new thickness, as one layer without a material; used when no `layerSet` is given.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    thickness?: number | undefined;
    /**
     * The name of the layer set the wall is now made of. A wall of a type keeps its type's layers.
     * @default undefined
     * @optional true
     */
    layerSet?: string | undefined;
    /**
     * Which side of the axis the layers now lie on. Left out, a wall keeps its side as its thickness
     * changes: a wall aligned right stays aligned right.
     * @default undefined
     * @optional true
     */
    alignment?: wallAlignmentEnum | undefined;
}
/**
 * One join of a wall, as `walls.parameters` lists it.
 */
export class WallJoinInfoDto {
    /**
     * The GlobalId of the wall it is joined to.
     * @default ""
     */
    other = "";
    /**
     * Where on this wall the join is.
     * @default start
     */
    at: wallEndEnum = wallEndEnum.start;
    /**
     * Where on the other wall the join is.
     * @default start
     */
    otherAt: wallEndEnum = wallEndEnum.start;
}
/**
 * A wall's parameters as `walls.parameters` reads them back from the model, whichever tool wrote it.
 * Lengths are in the model's length unit, and points in the plan of the wall's storey.
 */
export class WallParametersDto {
    /**
     * The GlobalId that identifies the wall.
     * @default ""
     */
    globalId = "";
    /**
     * The wall's name, or an empty text when it has none.
     * @default ""
     */
    name = "";
    /**
     * The GlobalId of the storey that contains the wall, or an empty text when none does.
     * @default ""
     */
    storey = "";
    /**
     * The start of the wall's axis, as `[x, y]`.
     * @default [0, 0]
     */
    start: Base.Point2 = [0, 0];
    /**
     * The end of the wall's axis, as `[x, y]`.
     * @default [0, 0]
     */
    end: Base.Point2 = [0, 0];
    /**
     * The wall's height, up from its base.
     * @default 0
     */
    height = 0;
    /**
     * How far above its storey's floor the wall starts.
     * @default 0
     */
    baseOffset = 0;
    /**
     * The wall's thickness, all its layers together.
     * @default 0
     */
    thickness = 0;
    /**
     * How far the layers' first face lies left of the axis, looking from start to end: 0 aligned left,
     * minus the thickness aligned right.
     * @default 0
     */
    offset = 0;
    /**
     * Which side of the axis the layers lie on, or an empty text when they lie at an offset none of
     * the alignments describe.
     * @default ""
     */
    alignment: wallAlignmentEnum | "" = "";
    /**
     * The name of the layer set the wall is made of.
     * @default ""
     */
    layerSet = "";
    /**
     * The GlobalId of the wall's type, or an empty text when it has none.
     * @default ""
     */
    wallType = "";
    /**
     * Each join of the wall: the other wall, and where on each wall the join is.
     * @default []
     */
    joins: WallJoinInfoDto[] = [];
    /**
     * The GlobalIds of the openings cut through it, filled or not.
     * @default []
     */
    openings: string[] = [];
    /**
     * How many planes clip the wall.
     * @default 0
     */
    clippings = 0;
}
