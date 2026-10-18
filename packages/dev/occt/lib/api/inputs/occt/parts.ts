import type { Base } from "@bitbybit-dev/base";
import { Engineering } from "@bitbybit-dev/base/lib/api/inputs/engineering-inputs";

/**
 * The teeth of an involute spur gear, shared by `parts.mechanical.gears.spurGearProfile` and
 * `parts.mechanical.gears.spurGear`: their size, their shape, how loosely they fit and where the gear lies.
 */
export abstract class SpurGearSharedDto {
    /**
     * The size of the teeth: the pitch circle's diameter divided by the number of teeth, in model
     * units. Gears mesh only with gears of the same module.
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
     * @maximum 1000
     * @step 1
     */
    teeth?: number | undefined = 20;
    /**
     * The angle at which meshing teeth push on each other, in degrees; 20 is the common standard, and
     * meshing gears share it.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * How far the teeth are moved out from the pitch circle, as a share of the module. Positive values
     * give thicker teeth that small gears need, negative values thinner ones.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.05
     */
    profileShift?: number | undefined = 0;
    /**
     * How much thinner each tooth is at the pitch circle than a tight fit, in model units; two meshing
     * gears leave the sum of their backlash between their teeth.
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
     * How deep the gaps reach below the pitch circle, as a share of the module; more than `addendum`
     * leaves room for the tips of the mating gear.
     * @default 1.25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    dedendum?: number | undefined = 1.25;
    /**
     * The radius that rounds the bottom of each gap, as a share of the module. It shrinks to fit a
     * narrow gap, and 0 leaves a sharp corner.
     * @default 0.38
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    rootFillet?: number | undefined = 0.38;
    /**
     * How far the gear is turned about its centre, in degrees. At 0 a tooth points along the frame's
     * direction.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    rotation?: number | undefined = 0;
    /**
     * The frame the gear lies in: its centre at the origin, a tooth along the direction, its face
     * toward the normal. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * The teeth and the frame of a spur gear for `parts.mechanical.gears.spurGearProfile`, which draws the gear's
 * outline, with whether the outline becomes a face.
 */
export class SpurGearProfileDto extends SpurGearSharedDto {
    constructor(makeFace?: boolean, module?: number, teeth?: number, pressureAngle?: number, profileShift?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, rotation?: number, frame?: Base.Frame) {
        super();
        if (makeFace !== undefined) { this.makeFace = makeFace; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (profileShift !== undefined) { this.profileShift = profileShift; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * When true, the outline becomes a face whose normal is the frame's normal; when false it stays a
     * closed wire.
     * @default true
     */
    makeFace?: boolean | undefined = true;
}
/**
 * The teeth and the frame of a spur gear for `parts.mechanical.gears.spurGear` and its twin with face roles,
 * with how thick the gear is and the hole through its middle.
 */
export class SpurGearDto extends SpurGearSharedDto {
    constructor(width?: number, bore?: number, hub?: number, hubLength?: number, keyway?: boolean, module?: number, teeth?: number, pressureAngle?: number, profileShift?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, rotation?: number, frame?: Base.Frame) {
        super();
        if (width !== undefined) { this.width = width; }
        if (bore !== undefined) { this.bore = bore; }
        if (hub !== undefined) { this.hub = hub; }
        if (hubLength !== undefined) { this.hubLength = hubLength; }
        if (keyway !== undefined) { this.keyway = keyway; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (profileShift !== undefined) { this.profileShift = profileShift; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * How thick the gear is along the frame's normal, in model units.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    width?: number | undefined = 1;
    /**
     * The diameter of the hole through the middle of the gear, in model units; 0 leaves the gear
     * whole. It must stay inside the root circle.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    bore?: number | undefined = 0;
    /**
     * The diameter of a hub standing out from the gear's end face, in model units, between the
     * bore and the root circle; 0 leaves no hub.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    hub?: number | undefined = 0;
    /**
     * How far the hub stands out beyond the gear's end face along the normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    hubLength?: number | undefined = 0;
    /**
     * When true, a DIN 6885 keyway is cut along the bore, sized for a shaft of the bore's diameter
     * in millimetres, toward the tooth at rotation 0.
     * @default false
     */
    keyway?: boolean | undefined = false;
}
/**
 * The teeth of an involute rack, shared by `parts.mechanical.gears.rackProfile` and `parts.mechanical.gears.rack`: their
 * size and shape, how loosely they fit, how deep the rack is and where it lies.
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
     * @maximum 1000
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
     * The radius that rounds the bottom of each gap, as a share of the module; it shrinks to fit.
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
    /**
     * The frame the rack lies in: the first tooth's middle at the origin, the rack along the
     * direction, its face toward the normal. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * The teeth and the frame of a rack for `parts.mechanical.gears.rackProfile`, which draws its outline, with
 * whether the outline becomes a face.
 */
export class RackProfileDto extends RackSharedDto {
    constructor(makeFace?: boolean, module?: number, teeth?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, height?: number, frame?: Base.Frame) {
        super();
        if (makeFace !== undefined) { this.makeFace = makeFace; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (height !== undefined) { this.height = height; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * When true, the outline becomes a face whose normal is the frame's normal; when false it stays a
     * closed wire.
     * @default true
     */
    makeFace?: boolean | undefined = true;
}
/**
 * The teeth and the frame of a rack for `parts.mechanical.gears.rack` and its twin with face roles, with how
 * thick the rack is.
 */
export class RackDto extends RackSharedDto {
    constructor(width?: number, module?: number, teeth?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, height?: number, frame?: Base.Frame) {
        super();
        if (width !== undefined) { this.width = width; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (height !== undefined) { this.height = height; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * How thick the rack is along the frame's normal, in model units.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    width?: number | undefined = 1;
}
/**
 * The teeth of an involute ring gear, cut on the inside of a ring, shared by
 * `parts.mechanical.gears.ringGearProfile` and `parts.mechanical.gears.ringGear`: their size, their shape, how loosely they
 * fit, how thick the ring is outside them and where the ring lies.
 */
export abstract class RingGearSharedDto {
    /**
     * The size of the teeth: the pitch circle's diameter divided by the number of teeth, in model
     * units. A gear meshes inside the ring only with the same module.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    module?: number | undefined = 0.2;
    /**
     * How many teeth the ring has. Their tips must stay outside the base circle, which takes at least
     * 34 teeth at a pressure angle of 20 degrees.
     * @default 40
     * @minimum 3
     * @maximum 1000
     * @step 1
     */
    teeth?: number | undefined = 40;
    /**
     * The angle at which meshing teeth push on each other, in degrees; 20 is the common standard, and
     * the ring shares it with the gears inside it.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 45
     * @exclusiveMaximum true
     * @step 0.5
     */
    pressureAngle?: number | undefined = 20;
    /**
     * How much thinner each tooth is at the pitch circle than a tight fit, in model units; the ring
     * and a gear inside it leave both backlashes between their teeth.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    backlash?: number | undefined = 0;
    /**
     * How far the teeth reach in from the pitch circle toward the centre, as a share of the module.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    addendum?: number | undefined = 1;
    /**
     * How deep the gaps reach out beyond the pitch circle, as a share of the module; more than
     * `addendum` leaves room for the tips of the gear inside.
     * @default 1.25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    dedendum?: number | undefined = 1.25;
    /**
     * The radius that rounds the bottom of each gap, as a share of the module. It shrinks to fit a
     * narrow gap, and 0 leaves a sharp corner.
     * @default 0.38
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    rootFillet?: number | undefined = 0.38;
    /**
     * How thick the ring is outside the bottoms of its gaps, in model units.
     * @default 0.5
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    rim?: number | undefined = 0.5;
    /**
     * How far the ring is turned about its centre, in degrees. At 0 a tooth points along the frame's
     * direction.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    rotation?: number | undefined = 0;
    /**
     * The frame the ring lies in: its centre at the origin, a tooth along the direction, its face
     * toward the normal. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * The teeth, the rim and the frame of a ring gear for `parts.mechanical.gears.ringGearProfile`, with whether the
 * ring becomes a face.
 */
export class RingGearProfileDto extends RingGearSharedDto {
    constructor(makeFace?: boolean, module?: number, teeth?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, rim?: number, rotation?: number, frame?: Base.Frame) {
        super();
        if (makeFace !== undefined) { this.makeFace = makeFace; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (rim !== undefined) { this.rim = rim; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * When true, the ring between its outer circle and its teeth becomes a face facing the frame's
     * normal; when false only the teeth's outline stays, as a closed wire.
     * @default true
     */
    makeFace?: boolean | undefined = true;
}
/**
 * The teeth, the rim and the frame of a ring gear for `parts.mechanical.gears.ringGear` and its twin with face
 * roles, with how thick the ring is.
 */
export class RingGearDto extends RingGearSharedDto {
    constructor(width?: number, module?: number, teeth?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, rim?: number, rotation?: number, frame?: Base.Frame) {
        super();
        if (width !== undefined) { this.width = width; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (rim !== undefined) { this.rim = rim; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * How thick the ring is along the frame's normal, in model units.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    width?: number | undefined = 1;
}
/**
 * An involute helical gear for `parts.mechanical.gears.helicalGear` and its twin with face roles: its teeth and
 * their lean, measured square to the teeth, how thick it is, its bore and hub, and where it lies.
 */
export class HelicalGearDto {
    constructor(width?: number, bore?: number, hub?: number, hubLength?: number, keyway?: boolean, module?: number, teeth?: number, helixAngle?: number, herringbone?: boolean, pressureAngle?: number, profileShift?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, rotation?: number, frame?: Base.Frame) {
        if (width !== undefined) { this.width = width; }
        if (bore !== undefined) { this.bore = bore; }
        if (hub !== undefined) { this.hub = hub; }
        if (hubLength !== undefined) { this.hubLength = hubLength; }
        if (keyway !== undefined) { this.keyway = keyway; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (helixAngle !== undefined) { this.helixAngle = helixAngle; }
        if (herringbone !== undefined) { this.herringbone = herringbone; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (profileShift !== undefined) { this.profileShift = profileShift; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (frame !== undefined) { this.frame = frame; }
    }
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
     * @maximum 1000
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
     * When true, two halves of opposite hands meet halfway across the width, cancelling the push
     * along the axis; the half at the frame leans as `helixAngle` says.
     * @default false
     */
    herringbone?: boolean | undefined = false;
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
    /**
     * How far the gear is turned about its axis, in degrees. At 0 a tooth points along the frame's
     * direction where the gear meets the frame.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    rotation?: number | undefined = 0;
    /**
     * The frame the gear lies in: its centre at the origin, a tooth along the direction, its face
     * toward the normal. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
    /**
     * How thick the gear is along the frame's normal, in model units. The teeth twist through at
     * most 1000 degrees across it, or across each half of a herringbone gear.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    width?: number | undefined = 1;
    /**
     * The diameter of the hole through the middle of the gear, in model units; 0 leaves the gear
     * whole. It must stay inside the root circle.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    bore?: number | undefined = 0;
    /**
     * The diameter of a hub standing out from the gear's end face, in model units, between the
     * bore and the root circle; 0 leaves no hub.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    hub?: number | undefined = 0;
    /**
     * How far the hub stands out beyond the gear's end face along the normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    hubLength?: number | undefined = 0;
    /**
     * When true, a DIN 6885 keyway is cut along the bore, sized for a shaft of the bore's diameter
     * in millimetres, toward the tooth at rotation 0.
     * @default false
     */
    keyway?: boolean | undefined = false;
}
/**
 * A straight bevel gear for `parts.mechanical.gears.bevelGear` and its twin with face roles: its teeth at the
 * back, the gear it meshes with and the angle between them, how long the teeth are, its bore and where
 * its apex lies.
 */
export class BevelGearDto {
    constructor(faceWidth?: number, bore?: number, module?: number, teeth?: number, mateTeeth?: number, shaftAngle?: number, pressureAngle?: number, backlash?: number, addendum?: number, dedendum?: number, rootFillet?: number, rotation?: number, frame?: Base.Frame) {
        if (faceWidth !== undefined) { this.faceWidth = faceWidth; }
        if (bore !== undefined) { this.bore = bore; }
        if (module !== undefined) { this.module = module; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (mateTeeth !== undefined) { this.mateTeeth = mateTeeth; }
        if (shaftAngle !== undefined) { this.shaftAngle = shaftAngle; }
        if (pressureAngle !== undefined) { this.pressureAngle = pressureAngle; }
        if (backlash !== undefined) { this.backlash = backlash; }
        if (addendum !== undefined) { this.addendum = addendum; }
        if (dedendum !== undefined) { this.dedendum = dedendum; }
        if (rootFillet !== undefined) { this.rootFillet = rootFillet; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (frame !== undefined) { this.frame = frame; }
    }
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
     * @maximum 1000
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
    /**
     * How long the teeth are along the cone, from the back toward the apex, in model units; at most a
     * third of the cone distance.
     * @default 0.8
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    faceWidth?: number | undefined = 0.8;
    /**
     * The diameter of the hole along the axis, in model units; 0 leaves the gear whole. It must stay
     * inside the roots at the front.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    bore?: number | undefined = 0;
    /**
     * How far the gear is turned about its axis, in degrees. At 0 a tooth points along the frame's
     * direction where the gear meets the frame.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    rotation?: number | undefined = 0;
    /**
     * The apex, where the axes meet, at the origin; the axis along the normal toward the back; a
     * tooth along the direction. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * The size of a metric fastener and where it sits, shared by the screws, nuts and washers of
 * `parts.mechanical.fasteners`. Its sizes come from the ISO standards in millimetres, so model units are
 * millimetres.
 */
export abstract class MetricFastenerSharedDto {
    /**
     * The thread size, such as M8.
     * @default m3
     */
    size?: Engineering.metricSizeEnum | undefined = Engineering.metricSizeEnum.m3;
    /**
     * Where it sits: the origin where it bears, as under a head, the normal along its axis away from
     * the part. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * A screw's thread size, its length under the head and where its head sits, for
 * `parts.mechanical.fasteners.socketHeadCapScrew` and `parts.mechanical.fasteners.hexBolt`.
 */
export abstract class MetricScrewSharedDto extends MetricFastenerSharedDto {
    /**
     * The length of the screw from under its head to its tip, in millimetres.
     * @default 10
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
    /**
     * When true the threaded length is modelled, as `parts.mechanical.machining.thread` cuts it, its faces all
     * named `thread`; when false the thread is a light cosmetic face.
     * @default false
     */
    modelledThread?: boolean | undefined = false;
}
/**
 * An ISO 4762 cap screw with a hexagon recess in its round head, for
 * `parts.mechanical.fasteners.socketHeadCapScrew` and its twin with face roles: its size, its length and where
 * its head sits.
 */
export class SocketHeadCapScrewDto extends MetricScrewSharedDto {
    constructor(size?: Engineering.metricSizeEnum, length?: number, modelledThread?: boolean, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (length !== undefined) { this.length = length; }
        if (modelledThread !== undefined) { this.modelledThread = modelledThread; }
        if (frame !== undefined) { this.frame = frame; }
    }
}
/**
 * A hexagon head bolt for `parts.mechanical.fasteners.hexBolt` and its twin with face roles: threaded to the
 * head after ISO 4017, or only part of its length after ISO 4014.
 */
export class HexBoltDto extends MetricScrewSharedDto {
    constructor(size?: Engineering.metricSizeEnum, length?: number, fullyThreaded?: boolean, modelledThread?: boolean, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (length !== undefined) { this.length = length; }
        if (fullyThreaded !== undefined) { this.fullyThreaded = fullyThreaded; }
        if (modelledThread !== undefined) { this.modelledThread = modelledThread; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * When true the bolt is threaded to its head (ISO 4017); when false only for the length ISO 4014
     * gives, leaving a plain shank a modelled thread shows.
     * @default true
     */
    fullyThreaded?: boolean | undefined = true;
}
/**
 * An ISO 4032 hexagon nut for `parts.mechanical.fasteners.hexNut` and its twin with face roles: its size and
 * where it bears.
 */
export class MetricFastenerDto extends MetricFastenerSharedDto {
    constructor(size?: Engineering.metricSizeEnum, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (frame !== undefined) { this.frame = frame; }
    }
}
/**
 * A plain washer for `parts.mechanical.fasteners.washer` and its twin with face roles: its size, whether it is
 * the ISO 7090 washer chamfered on one face or the flat ISO 7089 one, and where it bears.
 */
export class WasherDto extends MetricFastenerSharedDto {
    constructor(size?: Engineering.metricSizeEnum, chamfered?: boolean, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (chamfered !== undefined) { this.chamfered = chamfered; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * When true, the ISO 7090 washer, chamfered on the outside of the face away from the seat, from
     * M5; when false, the flat ISO 7089 one.
     * @default false
     */
    chamfered?: boolean | undefined = false;
}
/**
 * A set screw with a hexagon recess for `parts.mechanical.fasteners.setScrew` and its twin with face roles:
 * its size, its length, its point and where its recessed end sits.
 */
export class SetScrewDto extends MetricFastenerSharedDto {
    constructor(size?: Engineering.metricSizeEnum, length?: number, point?: Engineering.setScrewPointEnum, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (length !== undefined) { this.length = length; }
        if (point !== undefined) { this.point = point; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shape of the end that bears on the part: flat (ISO 4026), cone (ISO 4027), dog (ISO 4028)
     * or cup (ISO 4029).
     * @default flat
     */
    point?: Engineering.setScrewPointEnum | undefined = Engineering.setScrewPointEnum.flat;
    /**
     * The length of the set screw, in millimetres.
     * @default 5
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 5;
}
/**
 * A cylindrical pin with a chamfer at each end, after ISO 2338, for `parts.mechanical.fasteners.dowelPin` and
 * its twin with face roles.
 */
export class DowelPinDto {
    constructor(diameter?: number, length?: number, frame?: Base.Frame) {
        if (diameter !== undefined) { this.diameter = diameter; }
        if (length !== undefined) { this.length = length; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The diameter of the pin, in model units.
     * @default 3
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.5
     */
    diameter?: number | undefined = 3;
    /**
     * The length of the pin, in model units.
     * @default 10
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
    /**
     * Where the pin starts: its origin at the centre of one end and its normal along the pin. Left
     * out, the origin facing +Z.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * A compression spring with closed and ground ends for `parts.mechanical.springs.compressionSpring` and its
 * twin with face roles: its wire, its coils, its length as it stands and where it stands.
 */
export class CompressionSpringDto {
    constructor(wireDiameter?: number, diameter?: number, activeCoils?: number, length?: number, frame?: Base.Frame) {
        if (wireDiameter !== undefined) { this.wireDiameter = wireDiameter; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (activeCoils !== undefined) { this.activeCoils = activeCoils; }
        if (length !== undefined) { this.length = length; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The diameter of the wire, in model units.
     * @default 0.2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    wireDiameter?: number | undefined = 0.2;
    /**
     * The outside diameter of the coils, in model units; more than three times the wire's.
     * @default 2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    diameter?: number | undefined = 2;
    /**
     * How many coils spring, besides the closed coil at each end; it may be a fraction.
     * @default 6
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.5
     */
    activeCoils?: number | undefined = 6;
    /**
     * The spring's length from one ground end to the other, free or compressed; at least the solid
     * length, where every coil touches the next.
     * @default 4
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    length?: number | undefined = 4;
    /**
     * Where the spring stands: its bottom end's centre on the origin and its axis along the normal.
     * Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * A deep groove ball bearing for `parts.mechanical.bearings.ballBearing` and its twin with face roles: which
 * bearing, whether shields close its sides and where it sits.
 */
export class BallBearingDto {
    constructor(designation?: Engineering.ballBearingEnum, shields?: boolean, frame?: Base.Frame) {
        if (designation !== undefined) { this.designation = designation; }
        if (shields !== undefined) { this.shields = shields; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The bearing, such as 6204 or 608; its sizes are in millimetres.
     * @default b608
     */
    designation?: Engineering.ballBearingEnum | undefined = Engineering.ballBearingEnum.b608;
    /**
     * When true, a shield closes each side between the rings, as on a 2Z bearing.
     * @default false
     */
    shields?: boolean | undefined = false;
    /**
     * Where the bearing sits: the centre of one side on the origin and its axis along the normal.
     * Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * A DIN 6885 form A parallel key with round ends for `parts.mechanical.keys.parallelKey` and its twin with face
 * roles: sized for its shaft, its length and where it lies.
 */
export class ParallelKeyDto {
    constructor(shaftDiameter?: number, length?: number, frame?: Base.Frame) {
        if (shaftDiameter !== undefined) { this.shaftDiameter = shaftDiameter; }
        if (length !== undefined) { this.length = length; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The diameter of the shaft the key sits in, in millimetres, which sets its width and height.
     * @default 20
     * @minimum 6
     * @exclusiveMinimum true
     * @maximum 65
     * @step 1
     */
    shaftDiameter?: number | undefined = 20;
    /**
     * The key's length from one round end to the other, in millimetres; at least its width.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 20;
    /**
     * Where the key lies: its bottom face's centre on the origin, its height along the normal, its
     * length along the direction. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * A DIN 471 retaining ring for a shaft or a DIN 472 ring for a bore, for
 * `parts.mechanical.retainingRings.retainingRing` and its twin with face roles: which ring and where it sits.
 */
export class RetainingRingDto {
    constructor(kind?: Engineering.retainingRingKindEnum, diameter?: number, frame?: Base.Frame) {
        if (kind !== undefined) { this.kind = kind; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * Whether the ring sits on a shaft or in a bore.
     * @default shaft
     */
    kind?: Engineering.retainingRingKindEnum | undefined = Engineering.retainingRingKindEnum.shaft;
    /**
     * The shaft's or the bore's diameter in millimetres, one DIN 471 or DIN 472 lists: from 3 to 100
     * for shafts, from 8 to 100 for bores.
     * @default 20
     * @minimum 3
     * @maximum 100
     * @step 1
     */
    diameter?: number | undefined = 20;
    /**
     * Where the ring sits: its centre on the origin, one side on the frame's plane, its lugs toward
     * the direction. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
