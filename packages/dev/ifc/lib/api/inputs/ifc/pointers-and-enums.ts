import type { IfcValue } from "../../../step/step-types";

/**
 * A handle to an IFC model held by the library, not the model's data itself. Pass it to the next
 * call that reads or changes the model; a change returns a new handle and leaves this one as it was.
 */
export type IfcModelPointer = { hash: number, type: "ifc-model" };

/**
 * One attribute value as a model holds it, as `model.getAttribute` returns it: a text, a number,
 * true or false, `null` when the attribute is unset, `{ enum }` for an enumeration value,
 * `{ type, value }` for a typed value, `{ ref }` for a reference to another entity, or a list of
 * these.
 */
export type IfcAttributeValue = IfcValue;

/**
 * The length unit a new model is written in. Every length a method takes or returns is in this unit.
 */
export enum lengthUnitEnum {
    /**
     * Lengths in millimetres, as most building models are written.
     */
    millimetre = "millimetre",
    /**
     * Lengths in centimetres.
     */
    centimetre = "centimetre",
    /**
     * Lengths in metres.
     */
    metre = "metre",
}

/**
 * Which side of its axis a wall's layers lie on, looking from the wall's start to its end: centred on
 * the axis, to its left, or to its right.
 */
export enum wallAlignmentEnum {
    /**
     * The layers are centred on the axis.
     */
    center = "center",
    /**
     * The layers lie to the left of the axis.
     */
    left = "left",
    /**
     * The layers lie to the right of the axis.
     */
    right = "right",
}

/**
 * Where on a wall another wall meets it: at its start, at its end, or somewhere along its length.
 */
export enum wallEndEnum {
    /**
     * At the start of its axis.
     */
    start = "start",
    /**
     * At the end of its axis.
     */
    end = "end",
    /**
     * Somewhere along its length, as the stem of a T meets the wall it ends against.
     */
    along = "along",
}

/**
 * What kind of wall it is, as IFC classifies walls.
 */
export enum wallPredefinedTypeEnum {
    /**
     * A straight wall of constant thickness, the common case.
     */
    standard = "STANDARD",
    /**
     * A wall of solid construction, such as masonry.
     */
    solidWall = "SOLIDWALL",
    /**
     * A wall that divides a space without carrying load.
     */
    partitioning = "PARTITIONING",
    /**
     * A wall that resists lateral forces.
     */
    shear = "SHEAR",
    /**
     * A low wall along the edge of a roof or balcony.
     */
    parapet = "PARAPET",
    /**
     * A wall that can be moved, such as a folding partition.
     */
    movable = "MOVABLE",
    /**
     * A wall that carries pipes, such as a service wall.
     */
    plumbingWall = "PLUMBINGWALL",
    /**
     * No kind is given.
     */
    notDefined = "NOTDEFINED",
}

/**
 * The shape of a roof over a rectangle: flat, sloping one way, two slopes meeting at a ridge, or four
 * slopes meeting at a ridge or a point.
 */
export enum roofKindEnum {
    /**
     * Flat, one level slab.
     */
    flat = "flat",
    /**
     * One slope, rising from the outline's first side to the opposite side.
     */
    monoPitch = "monoPitch",
    /**
     * Two slopes rising from the first side and the opposite side to a ridge between them.
     */
    gable = "gable",
    /**
     * Four slopes rising from every side, to a ridge along the longer sides or, over a square, to a
     * point.
     */
    hip = "hip",
}

/**
 * What kind of member it is, as IFC classifies the linear parts of frames, roofs and facades.
 */
export enum memberPredefinedTypeEnum {
    /**
     * A diagonal that stiffens a frame.
     */
    brace = "BRACE",
    /**
     * The top or bottom edge of a truss.
     */
    chord = "CHORD",
    /**
     * A horizontal tie between two rafters.
     */
    collar = "COLLAR",
    /**
     * A member of no more particular kind.
     */
    member = "MEMBER",
    /**
     * A vertical between panes of a window or a curtain wall.
     */
    mullion = "MULLION",
    /**
     * A flat member, such as a gusset.
     */
    plate = "PLATE",
    /**
     * A vertical support, such as a fence post.
     */
    post = "POST",
    /**
     * A horizontal member that carries roof covering across rafters.
     */
    purlin = "PURLIN",
    /**
     * A sloping member that carries a roof.
     */
    rafter = "RAFTER",
    /**
     * A sloping member that carries the treads of a stair.
     */
    stringer = "STRINGER",
    /**
     * A member that takes compression along its length.
     */
    strut = "STRUT",
    /**
     * A vertical member of a framed wall.
     */
    stud = "STUD",
    /**
     * Not said.
     */
    notDefined = "NOTDEFINED",
}

/**
 * What kind of space it is, as IFC classifies spaces.
 */
export enum spacePredefinedTypeEnum {
    /**
     * A room or an area of a storey.
     */
    space = "SPACE",
    /**
     * A parking bay.
     */
    parking = "PARKING",
    /**
     * The gross floor area of a storey, measured around its outside.
     */
    gfa = "GFA",
    /**
     * An enclosed space inside the building.
     */
    internal = "INTERNAL",
    /**
     * A space outside the building, such as a terrace.
     */
    external = "EXTERNAL",
    /**
     * Not said.
     */
    notDefined = "NOTDEFINED",
}

/**
 * What kind of slab it is, as IFC classifies slabs.
 */
export enum slabPredefinedTypeEnum {
    /**
     * A floor slab.
     */
    floor = "FLOOR",
    /**
     * A roof slab.
     */
    roof = "ROOF",
    /**
     * A landing of a stair.
     */
    landing = "LANDING",
    /**
     * A slab on the ground, at the base of the building.
     */
    baseSlab = "BASESLAB",
    /**
     * No kind is given.
     */
    notDefined = "NOTDEFINED",
}

/**
 * How a single-panel door opens, as IFC names its operation types. The door's geometry is the same
 * panel for each; the operation is what other tools read to draw its swing.
 */
export enum doorOperationEnum {
    /**
     * One panel swinging, hinged on the left.
     */
    singleSwingLeft = "SINGLE_SWING_LEFT",
    /**
     * One panel swinging, hinged on the right.
     */
    singleSwingRight = "SINGLE_SWING_RIGHT",
    /**
     * One panel swinging both ways, hinged on the left.
     */
    doubleSwingLeft = "DOUBLE_SWING_LEFT",
    /**
     * One panel swinging both ways, hinged on the right.
     */
    doubleSwingRight = "DOUBLE_SWING_RIGHT",
    /**
     * One panel sliding to the left.
     */
    slidingToLeft = "SLIDING_TO_LEFT",
    /**
     * One panel sliding to the right.
     */
    slidingToRight = "SLIDING_TO_RIGHT",
    /**
     * One panel folding to the left.
     */
    foldingToLeft = "FOLDING_TO_LEFT",
    /**
     * One panel folding to the right.
     */
    foldingToRight = "FOLDING_TO_RIGHT",
    /**
     * A revolving door.
     */
    revolving = "REVOLVING",
    /**
     * A door that rolls up.
     */
    rollingUp = "ROLLINGUP",
    /**
     * No kind is given.
     */
    notDefined = "NOTDEFINED",
}

/**
 * The handle a door type carries on both faces of its panel, on the side away from its hinges.
 */
export enum doorHandleEnum {
    /**
     * No handle.
     */
    none = "none",
    /**
     * A lever handle at hand height.
     */
    lever = "lever",
    /**
     * A long upright pull bar, as on an entrance door.
     */
    pullBar = "pullBar",
}

/**
 * The shape of the section a column or beam is extruded from: a rectangle, a circle or an I section.
 */
export enum profileKindEnum {
    /**
     * A rectangle of `width` by `depth`.
     */
    rectangle = "rectangle",
    /**
     * A circle of `radius`.
     */
    circle = "circle",
    /**
     * An I section of `width` and `depth`, with `webThickness` and `flangeThickness`.
     */
    iShape = "iShape",
}
