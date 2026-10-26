import { Base } from "../base-inputs";

/**
 * The teeth of an involute spur gear, shared by `engineering.mechanical.gears.spurGearSizes` and
 * `engineering.mechanical.gears.spurGearOutline`: their size, their shape and how loosely they fit.
 */
export abstract class SpurGearSharedDto {
    /**
     * The size of the teeth: the pitch circle's diameter divided by the number of teeth, in
     * model units. Gears mesh only with gears of the same module.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    module?: number | undefined = 0.2;
    /**
     * How many teeth the gear has, at least 3.
     * @default 20
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    teeth?: number | undefined = 20;
    /**
     * The angle at which meshing teeth push on each other, in degrees; 20 is the common
     * standard, and meshing gears share it.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * How far the teeth are moved out from the pitch circle, as a share of the module. Positive
     * values give thicker teeth that small gears need, negative values thinner ones.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.05
     */
    profileShift?: number | undefined = 0;
    /**
     * How much thinner each tooth is at the pitch circle than a tight fit, in model units; two
     * meshing gears leave the sum of their backlash between their teeth.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    backlash?: number | undefined = 0;
    /**
     * How far the teeth reach above the pitch circle, as a share of the module.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    addendum?: number | undefined = 1;
    /**
     * How deep the gaps reach below the pitch circle, as a share of the module; more than
     * `addendum` leaves room for the tips of the mating gear.
     * @default 1.25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    dedendum?: number | undefined = 1.25;
    /**
     * The radius that rounds the bottom of each gap, as a share of the module. It shrinks to
     * fit a narrow gap, and 0 leaves a sharp corner.
     * @default 0.38
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    rootFillet?: number | undefined = 0.38;
}

/**
 * The teeth of a spur gear for `engineering.mechanical.gears.spurGearSizes`.
 */
export class SpurGearSizesDto extends SpurGearSharedDto {
    constructor(module?: number, teeth?: number, pressureAngle?: number, profileShift?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number) {
        super();
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (profileShift !== undefined) { this.profileShift = profileShift; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
    }
}

/**
 * The teeth of a spur gear for `engineering.mechanical.gears.spurGearOutline`, with how far it is turned and
 * how finely its curves become points.
 */
export class SpurGearOutlineDto extends SpurGearSharedDto {
    constructor(rotation?: number, segments?: number, module?: number, teeth?: number, pressureAngle?: number, profileShift?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number) {
        super();
        if (rotation !== undefined) { this.rotation = rotation; }
        if (segments !== undefined) { this.segments = segments; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (profileShift !== undefined) { this.profileShift = profileShift; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
    }
    /**
     * How far the gear is turned about its centre, in degrees. At 0 a tooth points along +X.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    rotation?: number | undefined = 0;
    /**
     * How many straight pieces stand for each curve of the outline: each tip, flank piece and
     * root.
     * @default 8
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    segments?: number | undefined = 8;
}

/**
 * The teeth of an involute ring gear, cut on the inside of a ring, shared by
 * `engineering.mechanical.gears.ringGearSizes` and `engineering.mechanical.gears.ringGearOutline`: their size, their
 * shape and how loosely they fit.
 */
export abstract class RingGearSharedDto {
    /**
     * The size of the teeth: the pitch circle's diameter divided by the number of teeth, in
     * model units. It meshes only with gears of the same module.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    module?: number | undefined = 0.2;
    /**
     * How many teeth the ring has; about 34 at least at 20 degrees, so that the tips of its
     * teeth stay outside the base circle.
     * @default 40
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    teeth?: number | undefined = 40;
    /**
     * The angle at which meshing teeth push on each other, in degrees; 20 is the common
     * standard, and meshing gears share it.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * How much thinner each tooth is at the pitch circle than a tight fit, in model units; two
     * meshing gears leave the sum of their backlash between their teeth.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    backlash?: number | undefined = 0;
    /**
     * How far the teeth reach in from the pitch circle toward the centre, as a share of the
     * module.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    addendum?: number | undefined = 1;
    /**
     * How deep the gaps reach out beyond the pitch circle, as a share of the module; more than
     * `addendum` leaves room for the tips of the mating gear.
     * @default 1.25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    dedendum?: number | undefined = 1.25;
    /**
     * The radius that rounds the bottom of each gap, as a share of the module. It shrinks to
     * fit a narrow gap, and 0 leaves a sharp corner.
     * @default 0.38
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    rootFillet?: number | undefined = 0.38;
}

/**
 * The teeth of a ring gear for `engineering.mechanical.gears.ringGearSizes`.
 */
export class RingGearSizesDto extends RingGearSharedDto {
    constructor(module?: number, teeth?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number) {
        super();
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
    }
}

/**
 * The teeth of a ring gear for `engineering.mechanical.gears.ringGearOutline`, with how far it is turned and
 * how finely its curves become points.
 */
export class RingGearOutlineDto extends RingGearSharedDto {
    constructor(rotation?: number, segments?: number, module?: number, teeth?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number) {
        super();
        if (rotation !== undefined) { this.rotation = rotation; }
        if (segments !== undefined) { this.segments = segments; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
    }
    /**
     * How far the ring is turned about its centre, in degrees. At 0 a tooth points along +X.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    rotation?: number | undefined = 0;
    /**
     * How many straight pieces stand for each curve of the outline: each tip, flank piece and
     * root.
     * @default 8
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    segments?: number | undefined = 8;
}

/**
 * The teeth of an involute rack, shared by `engineering.mechanical.gears.rackSizes` and
 * `engineering.mechanical.gears.rackOutline`: their size and shape, how loosely they fit and how deep the
 * rack is.
 */
export abstract class RackSharedDto {
    /**
     * The module of the gears the rack meshes with, in model units.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    module?: number | undefined = 0.2;
    /**
     * How many teeth the rack has, at least 1.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    teeth?: number | undefined = 10;
    /**
     * The angle of each flank from square to the pitch line, in degrees; it matches the gears'.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * How much thinner each tooth is at the pitch line than a tight fit, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    backlash?: number | undefined = 0;
    /**
     * How far the teeth reach above the pitch line, as a share of the module.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    addendum?: number | undefined = 1;
    /**
     * How deep the gaps reach below the pitch line, as a share of the module.
     * @default 1.25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    dedendum?: number | undefined = 1.25;
    /**
     * The radius that rounds the bottom of each gap, as a share of the module; it shrinks to
     * fit.
     * @default 0.38
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    rootFillet?: number | undefined = 0.38;
    /**
     * How far the back of the rack lies below the pitch line, in model units, beyond the gaps.
     * @default 0.6
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    height?: number | undefined = 0.6;
}

/**
 * The teeth of a rack for `engineering.mechanical.gears.rackSizes`.
 */
export class RackSizesDto extends RackSharedDto {
    constructor(module?: number, teeth?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, height?: number) {
        super();
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (height !== undefined) { this.height = height; }
    }
}

/**
 * The teeth of a rack for `engineering.mechanical.gears.rackOutline`, with how finely its curves become
 * points.
 */
export class RackOutlineDto extends RackSharedDto {
    constructor(segments?: number, module?: number, teeth?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, height?: number) {
        super();
        if (segments !== undefined) { this.segments = segments; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (height !== undefined) { this.height = height; }
    }
    /**
     * How many straight pieces stand for each rounded root.
     * @default 8
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    segments?: number | undefined = 8;
}

/**
 * The teeth of an involute helical gear, shared by `engineering.mechanical.gears.helicalGearSizes` and
 * `engineering.mechanical.gears.helicalGearOutline`: their size and lean, their shape and how loosely they
 * fit, measured square to the teeth.
 */
export abstract class HelicalGearSharedDto {
    /**
     * The normal module: the tooth size measured square to the teeth, in model units, as the
     * cutter's module. Only gears of one module mesh.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    module?: number | undefined = 0.2;
    /**
     * How many teeth the gear has, at least 3.
     * @default 20
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    teeth?: number | undefined = 20;
    /**
     * The teeth's lean from the axis in degrees: positive for a right hand, negative for a left.
     * Two external helical gears mesh at one angle in opposite hands.
     * @default 15
     * @minimum -45
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 1
     */
    helixAngle?: number | undefined = 15;
    /**
     * The angle at which meshing teeth push on each other, in degrees, measured square to the
     * teeth; 20 is the common standard, and meshing gears share it.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * How far the teeth are moved out from the pitch circle, as a share of the module. Positive
     * values give thicker teeth that small gears need, negative values thinner ones.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.05
     */
    profileShift?: number | undefined = 0;
    /**
     * How much thinner each tooth is round the pitch circle than a tight fit, in model units; two
     * meshing gears leave the sum of their backlash between their teeth.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    backlash?: number | undefined = 0;
    /**
     * How far the teeth reach above the pitch circle, as a share of the module.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    addendum?: number | undefined = 1;
    /**
     * How deep the gaps reach below the pitch circle, as a share of the module; more than
     * `addendum` leaves room for the tips of the mating gear.
     * @default 1.25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    dedendum?: number | undefined = 1.25;
    /**
     * The radius that rounds the bottom of each gap, as a share of the module. It shrinks to
     * fit a narrow gap, and 0 leaves a sharp corner.
     * @default 0.38
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    rootFillet?: number | undefined = 0.38;
}

/**
 * The teeth of a helical gear for `engineering.mechanical.gears.helicalGearSizes`.
 */
export class HelicalGearSizesDto extends HelicalGearSharedDto {
    constructor(module?: number, teeth?: number, helixAngle?: number, pressureAngle?: number, profileShift?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number) {
        super();
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (helixAngle !== undefined) { this.helixAngle = helixAngle; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (profileShift !== undefined) { this.profileShift = profileShift; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
    }
}

/**
 * The teeth of a helical gear for `engineering.mechanical.gears.helicalGearOutline`, with how far it is turned
 * and how finely its curves become points.
 */
export class HelicalGearOutlineDto extends HelicalGearSharedDto {
    constructor(rotation?: number, segments?: number, module?: number, teeth?: number, helixAngle?: number, pressureAngle?: number, profileShift?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number) {
        super();
        if (rotation !== undefined) { this.rotation = rotation; }
        if (segments !== undefined) { this.segments = segments; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (helixAngle !== undefined) { this.helixAngle = helixAngle; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (profileShift !== undefined) { this.profileShift = profileShift; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
    }
    /**
     * How far the gear is turned about its centre, in degrees. At 0 a tooth points along +X.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    rotation?: number | undefined = 0;
    /**
     * How many straight pieces stand for each curve of the outline: each tip, flank piece and
     * root.
     * @default 8
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    segments?: number | undefined = 8;
}

/**
 * The teeth of a straight bevel gear, shared by `engineering.mechanical.gears.bevelGearSizes` and
 * `engineering.mechanical.gears.bevelGearOutline`: their size at the back, the gear they mesh with and the
 * angle between the two, their shape and how loosely they fit.
 */
export abstract class BevelGearSharedDto {
    /**
     * The tooth size at the back, the gear's outer end: the outer pitch diameter divided by the
     * teeth, in model units. Only gears of one module mesh.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    module?: number | undefined = 0.2;
    /**
     * How many teeth the gear has, at least 3.
     * @default 20
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    teeth?: number | undefined = 20;
    /**
     * How many teeth the gear it meshes with has. With `shaftAngle` it sets the cone the gear
     * rolls on.
     * @default 20
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    mateTeeth?: number | undefined = 20;
    /**
     * The angle between the two gears' axes, in degrees; 90 turns a drive through a right angle.
     * @default 90
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 180
     * @exclusiveMaximum true
     * @step 1
     */
    shaftAngle?: number | undefined = 90;
    /**
     * The angle at which meshing teeth push on each other, in degrees; 20 is the common
     * standard, and meshing gears share it.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * How much thinner each tooth is at the outer pitch circle than a tight fit, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    backlash?: number | undefined = 0;
    /**
     * How far the teeth reach above the pitch cone at the back, as a share of the module.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    addendum?: number | undefined = 1;
    /**
     * How deep the gaps reach below the pitch cone at the back, as a share of the module.
     * @default 1.25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    dedendum?: number | undefined = 1.25;
    /**
     * The radius that rounds the bottom of each gap at the back, as a share of the module; it
     * shrinks to fit a narrow gap.
     * @default 0.38
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    rootFillet?: number | undefined = 0.38;
}

/**
 * The teeth of a bevel gear for `engineering.mechanical.gears.bevelGearSizes`.
 */
export class BevelGearSizesDto extends BevelGearSharedDto {
    constructor(module?: number, teeth?: number, mateTeeth?: number, shaftAngle?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number) {
        super();
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (mateTeeth !== undefined) { this.mateTeeth = mateTeeth; }
        if (shaftAngle !== undefined) { this.shaftAngle = shaftAngle; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
    }
}

/**
 * The teeth of a bevel gear for `engineering.mechanical.gears.bevelGearOutline`, with how far it is turned and
 * how finely its curves become points.
 */
export class BevelGearOutlineDto extends BevelGearSharedDto {
    constructor(rotation?: number, segments?: number, module?: number, teeth?: number, mateTeeth?: number, shaftAngle?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number) {
        super();
        if (rotation !== undefined) { this.rotation = rotation; }
        if (segments !== undefined) { this.segments = segments; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (mateTeeth !== undefined) { this.mateTeeth = mateTeeth; }
        if (shaftAngle !== undefined) { this.shaftAngle = shaftAngle; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
    }
    /**
     * How far the gear is turned about its centre, in degrees. At 0 a tooth points along +X.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    rotation?: number | undefined = 0;
    /**
     * How many straight pieces stand for each curve of the outline: each tip, flank piece and
     * root.
     * @default 8
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    segments?: number | undefined = 8;
}

/**
 * Two external spur gears in mesh, for `engineering.mechanical.gears.gearPair`: the module, pressure
 * angle and tooth heights they share, their teeth and their profile shifts.
 */
export class GearPairDto {
    constructor(module?: number, teethA?: number, teethB?: number, pressureAngle?: number, profileShiftA?: number, profileShiftB?: number, addendum?: number, dedendum?: number) {
        if (module !== undefined) { this.module = module; }
        if (teethA !== undefined) { this.teethA = teethA; }
        if (teethB !== undefined) { this.teethB = teethB; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (profileShiftA !== undefined) { this.profileShiftA = profileShiftA; }
        if (profileShiftB !== undefined) { this.profileShiftB = profileShiftB; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
    }
    /**
     * The module both gears share, in model units.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    module?: number | undefined = 0.2;
    /**
     * How many teeth the first gear has, at least 3.
     * @default 20
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    teethA?: number | undefined = 20;
    /**
     * How many teeth the second gear has, at least 3.
     * @default 30
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    teethB?: number | undefined = 30;
    /**
     * The pressure angle both gears share, in degrees.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * The first gear's profile shift, as a share of the module. Shifts that pull a tip inside its
     * base circle, or work the pair past 45 degrees, are refused.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.05
     */
    profileShiftA?: number | undefined = 0;
    /**
     * The second gear's profile shift, as a share of the module. Shifts that pull a tip inside its
     * base circle, or work the pair past 45 degrees, are refused.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.05
     */
    profileShiftB?: number | undefined = 0;
    /**
     * How far the teeth of both reach above their pitch circles, as a share of the module.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    addendum?: number | undefined = 1;
    /**
     * How deep the gaps of both reach below their pitch circles, as a share of the module; it
     * sets the clearance between each gear's tips and the other's roots.
     * @default 1.25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    dedendum?: number | undefined = 1.25;
}

/**
 * A spur gear meshing inside a ring gear, for `engineering.mechanical.gears.internalGearPair`: the module and
 * pressure angle they share and their teeth.
 */
export class InternalGearPairDto {
    constructor(module?: number, pinionTeeth?: number, ringTeeth?: number, pressureAngle?: number, addendum?: number) {
        if (module !== undefined) { this.module = module; }
        if (pinionTeeth !== undefined) { this.pinionTeeth = pinionTeeth; }
        if (ringTeeth !== undefined) { this.ringTeeth = ringTeeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (addendum !== undefined) { this.addendum = addendum; }
    }
    /**
     * The module both gears share, in model units.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    module?: number | undefined = 0.2;
    /**
     * How many teeth the spur gear has, at least 3. Fewer than about 20 interfere with a
     * standard ring of any size.
     * @default 24
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    pinionTeeth?: number | undefined = 24;
    /**
     * The ring's teeth: more than the spur gear's, and enough to keep their tips outside its base
     * circle, 34 at 20 degrees with an addendum of 1.
     * @default 60
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    ringTeeth?: number | undefined = 60;
    /**
     * The pressure angle both gears share, in degrees.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * How far the teeth of both reach beyond their pitch circles, as a share of the module.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    addendum?: number | undefined = 1;
}

/**
 * A planetary gear set, for `engineering.mechanical.gears.planetarySet`: the module and pressure angle its
 * gears share, the sun's and a planet's teeth and how many planets run round the sun.
 */
export class PlanetarySetDto {
    constructor(module?: number, sunTeeth?: number, planetTeeth?: number, planets?: number, pressureAngle?: number, addendum?: number) {
        if (module !== undefined) { this.module = module; }
        if (sunTeeth !== undefined) { this.sunTeeth = sunTeeth; }
        if (planetTeeth !== undefined) { this.planetTeeth = planetTeeth; }
        if (planets !== undefined) { this.planets = planets; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (addendum !== undefined) { this.addendum = addendum; }
    }
    /**
     * The module all its gears share, in model units.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    module?: number | undefined = 0.2;
    /**
     * How many teeth the sun has, at least 3.
     * @default 24
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    sunTeeth?: number | undefined = 24;
    /**
     * How many teeth each planet has, at least 3. A planet meshes inside the ring, so fewer than
     * about 20 interfere with it.
     * @default 24
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    planetTeeth?: number | undefined = 24;
    /**
     * How many planets run round the sun, evenly spaced.
     * @default 4
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    planets?: number | undefined = 4;
    /**
     * The pressure angle all its gears share, in degrees.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * How far the teeth reach beyond their pitch circles, as a share of the module.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    addendum?: number | undefined = 1;
}

/**
 * A diametral pitch and the unit to give the module in, for
 * `engineering.mechanical.gears.moduleFromDiametralPitch`, which turns an inch gear's size into
 * the module the gear methods take.
 */
export class ModuleFromDiametralPitchDto {
    constructor(diametralPitch?: number, unit?: Base.unitOfLengthEnum) {
        if (diametralPitch !== undefined) { this.diametralPitch = diametralPitch; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * How many teeth the gear has per inch of its pitch circle's diameter; a larger pitch means
     * smaller teeth.
     * @default 10
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    diametralPitch?: number | undefined = 10;
    /**
     * The unit to give the module in, the model's.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
}
