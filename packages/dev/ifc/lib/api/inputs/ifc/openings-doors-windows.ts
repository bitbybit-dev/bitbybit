import type { Base } from "../base-inputs";
import { doorOperationEnum } from "./pointers-and-enums";

/**
 * A rectangular opening to cut through a wall for `openings.add`, measured along the wall from
 * its start.
 */
export class AddOpeningDto<T> {
    constructor(model?: T, wall?: string, id?: string, name?: string, offset?: number, sill?: number, width?: number, height?: number) {
        if (model !== undefined) { this.model = model; }
        if (wall !== undefined) { this.wall = wall; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (offset !== undefined) { this.offset = offset; }
        if (sill !== undefined) { this.sill = sill; }
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
    }
    /**
     * The model the wall is in.
     * @default undefined
     */
    model!: T;
    /**
     * The wall to cut, by GlobalId or by the id it was added with.
     * @default undefined
     */
    wall!: string;
    /**
     * An id of your own for the opening. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the opening, which other tools show; it need not be unique.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * How far along the wall's axis, from its start, the opening begins. Left out, 1 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     */
    offset?: number | undefined;
    /**
     * How high above the wall's base the opening's bottom is.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    sill?: number | undefined = 0;
    /**
     * The opening's width, along the wall. Left out, 1 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    width?: number | undefined;
    /**
     * How high the opening is, from its sill up. Left out, 2 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    height?: number | undefined;
}
/**
 * Where to move an opening to, or what size to make it, for `openings.edit`. Everything left out stays
 * as it is.
 */
export class EditOpeningDto<T> {
    constructor(model?: T, opening?: string, offset?: number, sill?: number, width?: number, height?: number) {
        if (model !== undefined) { this.model = model; }
        if (opening !== undefined) { this.opening = opening; }
        if (offset !== undefined) { this.offset = offset; }
        if (sill !== undefined) { this.sill = sill; }
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The opening, or the door or window in it, by GlobalId or by the id it was added with.
     * @default undefined
     */
    opening!: string;
    /**
     * How far along the wall's axis, from its start, the opening now begins.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     */
    offset?: number | undefined;
    /**
     * How high above the wall's base the opening's bottom now is.
     * @default undefined
     * @optional true
     * @minimum -Infinity
     * @maximum Infinity
     */
    sill?: number | undefined;
    /**
     * The opening's new width, along the wall; an opening with a door or window in it keeps their size.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    width?: number | undefined;
    /**
     * The opening's new height; an opening with a door or window in it keeps their size.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    height?: number | undefined;
}
/**
 * An opening to cut through a slab for `openings.addInSlab`: an outline in the plan of the slab's
 * storey, cut through the slab's whole thickness.
 */
export class AddSlabOpeningDto<T> {
    constructor(model?: T, slab?: string, id?: string, name?: string, outline?: Base.Point2[]) {
        if (model !== undefined) { this.model = model; }
        if (slab !== undefined) { this.slab = slab; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (outline !== undefined) { this.outline = outline; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * The slab to cut, by GlobalId or by the id it was added with.
     * @default undefined
     */
    slab!: string;
    /**
     * An id of your own for the opening. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the opening, which other tools show; it need not be unique.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * The opening's outline, as `[x, y]` points in the storey's plan, inside the slab's outline or on
     * it; either winding works.
     * @default undefined
     */
    outline!: Base.Point2[];
}
/**
 * A door type to add for `doors.addType`: a lining around one panel, which every door of the type
 * shares, so the geometry is written once however many doors there are.
 */
export class AddDoorTypeDto<T> {
    constructor(model?: T, id?: string, name?: string, width?: number, height?: number, liningThickness?: number, liningDepth?: number, panelThickness?: number, operation?: doorOperationEnum) {
        if (model !== undefined) { this.model = model; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
        if (liningThickness !== undefined) { this.liningThickness = liningThickness; }
        if (liningDepth !== undefined) { this.liningDepth = liningDepth; }
        if (panelThickness !== undefined) { this.panelThickness = panelThickness; }
        if (operation !== undefined) { this.operation = operation; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * An id of your own for the type, by which doors refer to it. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * The type's name.
     * @default Door
     */
    name?: string | undefined = "Door";
    /**
     * The overall width, lining included; the opening a door of this type cuts is this wide. Left out, 900 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    width?: number | undefined;
    /**
     * The overall height, lining included. Left out, 2.1 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    height?: number | undefined;
    /**
     * The width of the lining's sides and head; twice it must be less than `width`. Left out, 50 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    liningThickness?: number | undefined;
    /**
     * How deep the lining is, across the wall; the door is centred in the wall's thickness. Left out, 100 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    liningDepth?: number | undefined;
    /**
     * The panel's thickness, no more than `liningDepth`. Left out, 40 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    panelThickness?: number | undefined;
    /**
     * How the door opens, recorded for other tools to draw its swing.
     * @default singleSwingLeft
     */
    operation?: doorOperationEnum | undefined = doorOperationEnum.singleSwingLeft;
}
/**
 * A window type to add for `windows.addType`: a frame around one pane of glass, which every window
 * of the type shares.
 */
export class AddWindowTypeDto<T> {
    constructor(model?: T, id?: string, name?: string, width?: number, height?: number, frameThickness?: number, frameDepth?: number, glassThickness?: number) {
        if (model !== undefined) { this.model = model; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
        if (frameThickness !== undefined) { this.frameThickness = frameThickness; }
        if (frameDepth !== undefined) { this.frameDepth = frameDepth; }
        if (glassThickness !== undefined) { this.glassThickness = glassThickness; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * An id of your own for the type, by which windows refer to it. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * The type's name.
     * @default Window
     */
    name?: string | undefined = "Window";
    /**
     * The overall width, frame included; the opening a window of this type cuts is this wide. Left out, 1.2 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    width?: number | undefined;
    /**
     * The overall height, frame included. Left out, 1.2 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    height?: number | undefined;
    /**
     * The width of the frame's members; twice it must be less than both `width` and `height`. Left out, 60 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    frameThickness?: number | undefined;
    /**
     * How deep the frame is, across the wall; the window is centred in the wall's thickness. Left out, 80 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    frameDepth?: number | undefined;
    /**
     * The thickness of the glass, no more than `frameDepth`. Left out, 24 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    glassThickness?: number | undefined;
}
/**
 * A door to place in a wall for `doors.add`: a door type and where along the wall it goes. The door
 * cuts its own opening, as wide and high as its type.
 */
export class AddDoorDto<T> {
    constructor(model?: T, wall?: string, doorType?: string, id?: string, name?: string, offset?: number, sill?: number) {
        if (model !== undefined) { this.model = model; }
        if (wall !== undefined) { this.wall = wall; }
        if (doorType !== undefined) { this.doorType = doorType; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (offset !== undefined) { this.offset = offset; }
        if (sill !== undefined) { this.sill = sill; }
    }
    /**
     * The model the wall is in.
     * @default undefined
     */
    model!: T;
    /**
     * The wall the door goes into, by GlobalId or by the id it was added with.
     * @default undefined
     */
    wall!: string;
    /**
     * The door type, added before with `doors.addType`, by GlobalId or by its id.
     * @default undefined
     */
    doorType!: string;
    /**
     * An id of your own for the door. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the door, which other tools show; it need not be unique.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * How far along the wall's axis, from its start, the door begins. Left out, 1 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     */
    offset?: number | undefined;
    /**
     * How high above the wall's base the door's bottom is.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     */
    sill?: number | undefined = 0;
}
/**
 * A window to place in a wall for `windows.add`: a window type and where along the wall it goes.
 * The window cuts its own opening, as wide and high as its type.
 */
export class AddWindowDto<T> {
    constructor(model?: T, wall?: string, windowType?: string, id?: string, name?: string, offset?: number, sill?: number) {
        if (model !== undefined) { this.model = model; }
        if (wall !== undefined) { this.wall = wall; }
        if (windowType !== undefined) { this.windowType = windowType; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (offset !== undefined) { this.offset = offset; }
        if (sill !== undefined) { this.sill = sill; }
    }
    /**
     * The model the wall is in.
     * @default undefined
     */
    model!: T;
    /**
     * The wall the window goes into, by GlobalId or by the id it was added with.
     * @default undefined
     */
    wall!: string;
    /**
     * The window type, added before with `windows.addType`, by GlobalId or by its id.
     * @default undefined
     */
    windowType!: string;
    /**
     * An id of your own for the window. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the window, which other tools show; it need not be unique.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * How far along the wall's axis, from its start, the window begins. Left out, 1 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     */
    offset?: number | undefined;
    /**
     * How high above the wall's base the window's bottom is. Left out, 900 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum -Infinity
     * @maximum Infinity
     */
    sill?: number | undefined;
}
