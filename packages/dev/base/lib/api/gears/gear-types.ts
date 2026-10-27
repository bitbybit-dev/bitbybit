import type * as Inputs from "../inputs";

type Point2 = Inputs.Base.Point2;

/**
 * The teeth of an involute spur gear, every value given: the shape `spurGearSizes` and
 * `spurGearOutline` read.
 */
export interface SpurGearSpec {
    /** The pitch circle's diameter divided by the number of teeth, in model units. */
    readonly module: number;
    /** How many teeth the gear has, a whole number of at least 3. */
    readonly teeth: number;
    /** The angle at which meshing teeth push on each other, in degrees, between 0 and 45. */
    readonly pressureAngle: number;
    /** How far the teeth are moved out from the pitch circle, as a share of the module. */
    readonly profileShift: number;
    /** How much thinner each tooth is at the pitch circle than a tight fit, in model units. */
    readonly backlash: number;
    /** How far the teeth reach above the pitch circle, as a share of the module. */
    readonly addendum: number;
    /** How deep the gaps reach below the pitch circle, as a share of the module. */
    readonly dedendum: number;
    /** The radius that rounds the bottom of each gap, as a share of the module; it shrinks to fit. */
    readonly rootFillet: number;
}

/**
 * The teeth of an involute ring gear, cut on the inside of a ring, every value given: the shape
 * `ringGearSizes` and `ringGearOutline` read.
 */
export interface RingGearSpec {
    /** The pitch circle's diameter divided by the number of teeth, in model units. */
    readonly module: number;
    /** How many teeth the ring has; their tips must stay outside the base circle. */
    readonly teeth: number;
    /** The angle at which meshing teeth push on each other, in degrees, between 0 and 45. */
    readonly pressureAngle: number;
    /** How much thinner each tooth is at the pitch circle than a tight fit, in model units. */
    readonly backlash: number;
    /** How far the teeth reach in from the pitch circle toward the centre, as a share of the module. */
    readonly addendum: number;
    /** How deep the gaps reach out beyond the pitch circle, as a share of the module. */
    readonly dedendum: number;
    /** The radius that rounds the bottom of each gap, as a share of the module; it shrinks to fit. */
    readonly rootFillet: number;
}

/**
 * The circles of a gear, from `spurGearSizes` or `ringGearSizes`.
 */
export interface GearSizes {
    /** The radius of the circle meshing gears roll on. */
    readonly pitchRadius: number;
    /** The radius of the circle the flanks unwind from. */
    readonly baseRadius: number;
    /**
     * The radius the tips of the teeth reach: beyond the pitch circle on a spur gear, inside it on
     * a ring gear.
     */
    readonly tipRadius: number;
    /**
     * The radius the bottoms of the gaps reach: inside the pitch circle on a spur gear, beyond it
     * on a ring gear.
     */
    readonly rootRadius: number;
    /** Half the angle a tooth spans at the pitch circle, in radians. */
    readonly halfToothAngle: number;
}

/**
 * The part of a tooth a move of a gear outline draws: the arc across its tip, a flank, or the
 * rounded gap at its root.
 */
export type GearPart = "tip" | "flank" | "root";

/**
 * One move of a gear outline from where the previous one ended: a straight line, an arc through a
 * point, or a cubic Bezier curve by its two control points.
 */
export type GearMove =
    | { readonly kind: "line"; readonly to: Inputs.Base.Point2; readonly part: GearPart }
    | { readonly kind: "arc"; readonly through: Inputs.Base.Point2; readonly to: Inputs.Base.Point2; readonly part: GearPart }
    | { readonly kind: "cubic"; readonly control1: Inputs.Base.Point2; readonly control2: Inputs.Base.Point2; readonly to: Inputs.Base.Point2; readonly part: GearPart };

/**
 * A closed gear outline from `spurGearOutline` or `ringGearOutline`: the point it starts at and the
 * moves that lead back to it.
 */
export interface GearOutline {
    /**
     * Where the outline starts: at the foot of the first flank, on the root circle of a spur gear
     * and the tip circle of a ring gear.
     */
    readonly start: Inputs.Base.Point2;
    /** The moves, counterclockwise, the last one ending at the start. */
    readonly moves: readonly GearMove[];
}

export interface LineFlankPiece {
    readonly kind: "line";
    readonly from: Point2;
    readonly to: Point2;
    readonly part: GearPart;
}

export interface ArcFlankPiece {
    readonly kind: "arc";
    readonly from: Point2;
    readonly through: Point2;
    readonly to: Point2;
    readonly part: GearPart;
}

export interface CubicFlankPiece {
    readonly kind: "cubic";
    readonly from: Point2;
    readonly control1: Point2;
    readonly control2: Point2;
    readonly to: Point2;
    readonly part: GearPart;
}

export type FlankPiece = LineFlankPiece | ArcFlankPiece | CubicFlankPiece;

export interface GearSharedSpec {
    readonly module: number;
    readonly pressureAngle: number;
    readonly addendum: number;
}

export interface ArcThrough {
    readonly from: Point2;
    readonly through: Point2;
    readonly to: Point2;
}

export interface FilletPlace {
    readonly flankPoint: Point2;
    readonly circlePoint: Point2;
    readonly centre: Point2;
    readonly onLine: boolean;
    readonly roll: number;
}

export interface ToothCircles {
    readonly top: number;
    readonly topPart: GearPart;
    readonly gap: number;
    readonly gapPart: GearPart;
}

export interface GearTeeth extends GearSharedSpec {
    readonly teeth: number;
    readonly backlash: number;
    readonly dedendum: number;
    readonly rootFillet: number;
}

/**
 * Two external spur gears in mesh, every value given: the shape `gearPair` reads.
 */
export interface GearPairSpec {
    /** The module both gears share, in model units. */
    readonly module: number;
    /** How many teeth the first gear has. */
    readonly teethA: number;
    /** How many teeth the second gear has. */
    readonly teethB: number;
    /** The pressure angle both gears share, in degrees. */
    readonly pressureAngle: number;
    /** The first gear's profile shift, as a share of the module. */
    readonly profileShiftA: number;
    /** The second gear's profile shift, as a share of the module. */
    readonly profileShiftB: number;
    /** How far the teeth reach above the pitch circle, as a share of the module. */
    readonly addendum: number;
    /** How deep the gaps reach below the pitch circle, as a share of the module. */
    readonly dedendum: number;
}

/**
 * Two external spur gears in mesh, from `gearPair`.
 */
export interface GearPairSizes {
    /** How far apart their centres sit, in model units, profile shifts included. */
    readonly centreDistance: number;
    /** The pressure angle at which they work at that distance, in degrees. */
    readonly workingPressureAngle: number;
    /**
     * How many pairs of teeth are in contact on average, counted only along the line of action
     * between the two base circles, where both flanks are involutes; above 1.2 runs smoothly.
     */
    readonly contactRatio: number;
    /** How many turns the first gear makes for one turn of the second. */
    readonly ratio: number;
    /**
     * Whether a gear's tips reach past where the line of action touches the other's base circle,
     * so they would cut into that gear's flank below its involute; the contact ratio leaves that part out.
     */
    readonly interferes: boolean;
    /**
     * How much the profile shifts call for each gear's tips to be shortened, in model units: the
     * shifts times the module less how far the centres moved apart, 0 when that is not more.
     * Taking it off both tips restores the clearance of the same gears unshifted.
     */
    readonly tipShortening: number;
    /**
     * The gap between each gear's tips and the other's roots, in model units, with the tips as
     * `addendum` and the shifts make them; below 0 the tips run into the roots.
     */
    readonly clearance: number;
}

export interface GearMesh {
    readonly centreDistance: number;
    readonly contactRatio: number;
    readonly interferes: boolean;
}

/**
 * A spur gear meshing inside a ring gear, every value given: the shape `internalGearPair` reads.
 */
export interface InternalGearPairSpec {
    /** The module both gears share, in model units. */
    readonly module: number;
    /** How many teeth the spur gear has. */
    readonly pinionTeeth: number;
    /** How many teeth the ring has. */
    readonly ringTeeth: number;
    /** The pressure angle both gears share, in degrees. */
    readonly pressureAngle: number;
    /** How far the teeth reach beyond the pitch circles, as a share of the module. */
    readonly addendum: number;
}

/**
 * A spur gear meshing inside a ring gear, from `internalGearPair`.
 */
export interface InternalGearPairSizes {
    /** How far the spur gear's centre sits from the ring's, in model units. */
    readonly centreDistance: number;
    /**
     * How many pairs of teeth are in contact on average, counted only along the line of action
     * beyond where it touches the spur gear's base circle, where both flanks are involutes.
     */
    readonly contactRatio: number;
    /** How many turns the spur gear makes for one turn of the ring. */
    readonly ratio: number;
    /**
     * Whether the teeth interfere: the ring's tips reach below the spur gear's base circle, or the
     * spur gear's tips catch the ring's on the way out of mesh, as they do when the two have
     * nearly as many teeth.
     */
    readonly interferes: boolean;
}

/**
 * A planetary gear set by its sun and planets, every value given: the shape `planetarySet` reads.
 */
export interface PlanetarySetSpec {
    /** The module all its gears share, in model units. */
    readonly module: number;
    /** How many teeth the sun has. */
    readonly sunTeeth: number;
    /** How many teeth each planet has. */
    readonly planetTeeth: number;
    /** How many planets run round the sun, evenly spaced. */
    readonly planets: number;
    /** The pressure angle all its gears share, in degrees. */
    readonly pressureAngle: number;
    /** How far the teeth reach beyond the pitch circles, as a share of the module. */
    readonly addendum: number;
}

/**
 * A planetary gear set, from `planetarySet`: the ring that fits it, where the planets sit and how
 * every gear is turned to mesh, the sun at rotation 0.
 */
export interface PlanetarySet {
    /** How many teeth the ring has: the sun's and twice a planet's. */
    readonly ringTeeth: number;
    /** How far each planet's centre sits from the sun's, in model units. */
    readonly centreDistance: number;
    /** How many turns the sun makes for one turn of the carrier while the ring holds still. */
    readonly ratio: number;
    /** Whether evenly spaced planets mesh with both the sun and the ring. */
    readonly assemblable: boolean;
    /** Whether neighbouring planets keep clear of each other's tips. */
    readonly planetsClear: boolean;
    /**
     * Whether a mesh interferes, as `gearPair` judges the sun with a planet and `internalGearPair`
     * a planet in the ring.
     */
    readonly interferes: boolean;
    /** Where each planet's centre sits, on the XY plane around the sun. */
    readonly planetCentres: Inputs.Base.Point3[];
    /** How far each planet is turned about its own centre to mesh, in degrees. */
    readonly planetRotations: number[];
    /** How far the ring is turned about the sun's centre to mesh with the planets, in degrees. */
    readonly ringRotation: number;
}

/**
 * The teeth of an involute rack, every value given: the shape `rackSizes` and `rackOutline` read.
 */
export interface RackSpec {
    /** The module of the gears it meshes with, in model units. */
    readonly module: number;
    /** How many teeth the rack has. */
    readonly teeth: number;
    /** The pressure angle, in degrees: the angle of each flank from square to the pitch line. */
    readonly pressureAngle: number;
    /** How much thinner each tooth is at the pitch line than a tight fit, in model units. */
    readonly backlash: number;
    /** How far the teeth reach above the pitch line, as a share of the module. */
    readonly addendum: number;
    /** How deep the gaps reach below the pitch line, as a share of the module. */
    readonly dedendum: number;
    /** The radius that rounds the bottom of each gap, as a share of the module; it shrinks to fit. */
    readonly rootFillet: number;
    /** How far the back of the rack lies below the pitch line, in model units. */
    readonly height: number;
}

/**
 * The lines of a rack, from `rackSizes`.
 */
export interface RackSizes {
    /** The distance from one tooth to the next along the pitch line. */
    readonly pitch: number;
    /** The rack's length: its teeth times the pitch. */
    readonly length: number;
    /** How far the tips stand above the pitch line. */
    readonly tipHeight: number;
    /** How deep the gaps reach below the pitch line. */
    readonly rootDepth: number;
    /** How thick each tooth is at the pitch line. */
    readonly toothThickness: number;
}

/**
 * The part of a rack a move of its outline draws: a tooth's tip, flank or rounded root, the back,
 * or one of its two ends.
 */
export type RackPart = GearPart | "back" | "side";

/**
 * One move of a rack outline: a straight line or an arc through a point.
 */
export type RackMove =
    | { readonly kind: "line"; readonly to: Inputs.Base.Point2; readonly part: RackPart }
    | { readonly kind: "arc"; readonly through: Inputs.Base.Point2; readonly to: Inputs.Base.Point2; readonly part: RackPart };

/**
 * A closed rack outline from `rackOutline`: the point it starts at and the moves that lead back to it.
 */
export interface RackOutline {
    /** Where the outline starts: the back's corner at the rack's start. */
    readonly start: Inputs.Base.Point2;
    /** The moves, counterclockwise, the last one ending at the start. */
    readonly moves: readonly RackMove[];
}

/**
 * The teeth of an involute helical gear, every value given: the shape `helicalGearSizes` and
 * `helicalGearOutline` read. Its module, pressure angle, profile shift, heights and root fillet are
 * measured square to the teeth, as the cutter that makes them is.
 */
export interface HelicalGearSpec extends SpurGearSpec {
    /** The angle the teeth lean from the axis, in degrees: positive for a right hand, negative for a left. */
    readonly helixAngle: number;
}

/**
 * The circles of a helical gear's section square to its axis, from `helicalGearSizes`.
 */
export interface HelicalGearSizes extends GearSizes {
    /** The module of that section: the pitch circle's diameter divided by the number of teeth. */
    readonly transverseModule: number;
    /** The pressure angle in that section, in degrees. */
    readonly transversePressureAngle: number;
    /**
     * How far the teeth turn about the axis for each model unit along it, in degrees: counterclockwise
     * looking back along the axis for a right hand.
     */
    readonly twist: number;
}

/**
 * The teeth of a straight bevel gear, every value given: the shape `bevelGearSizes` and
 * `bevelGearOutline` read. Its module and heights are measured at the back, the gear's outer end.
 */
export interface BevelGearSpec {
    /** The outer pitch circle's diameter divided by the number of teeth, in model units. */
    readonly module: number;
    /** How many teeth the gear has, a whole number of at least 3. */
    readonly teeth: number;
    /** How many teeth the gear it meshes with has, which sets the cone it rolls on. */
    readonly mateTeeth: number;
    /** The angle between the two gears' axes, in degrees, between 0 and 180. */
    readonly shaftAngle: number;
    /** The angle at which meshing teeth push on each other, in degrees, between 0 and 45. */
    readonly pressureAngle: number;
    /** How much thinner each tooth is at the outer pitch circle than a tight fit, in model units. */
    readonly backlash: number;
    /** How far the teeth reach above the pitch cone at the back, as a share of the module. */
    readonly addendum: number;
    /** How deep the gaps reach below the pitch cone at the back, as a share of the module. */
    readonly dedendum: number;
    /** The radius that rounds the bottom of each gap at the back, as a share of the module. */
    readonly rootFillet: number;
}

/**
 * The cones and the outer circles of a straight bevel gear, from `bevelGearSizes`.
 */
export interface BevelGearSizes {
    /** The radius of the outer pitch circle, where the pitch cone meets the back. */
    readonly pitchRadius: number;
    /** The radius the tips reach at the back. */
    readonly tipRadius: number;
    /** The radius the bottoms of the gaps reach at the back. */
    readonly rootRadius: number;
    /** The half angle of the cone the gear rolls on, in degrees. */
    readonly pitchConeAngle: number;
    /** The half angle of the cone through the tips, in degrees. */
    readonly tipConeAngle: number;
    /** The half angle of the cone through the bottoms of the gaps, in degrees. */
    readonly rootConeAngle: number;
    /** The distance from the apex, where the two axes meet, to the outer pitch circle. */
    readonly coneDistance: number;
    /** How far the outer pitch circle's plane lies from the apex along the axis. */
    readonly apexDistance: number;
    /** The teeth of the spur gear whose outline the back shows, the number of teeth over the cosine of the pitch cone angle. */
    readonly virtualTeeth: number;
}
