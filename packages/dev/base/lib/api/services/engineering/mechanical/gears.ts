import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { gearOutlinePoints, ringGearOutline, ringGearSizes, spurGearOutline, spurGearSizes } from "../../../gears/gears";
import { gearPair, internalGearPair, planetarySet } from "../../../gears/gear-pairs";
import { rackOutline, rackSizes } from "../../../gears/racks";
import { helicalGearOutline, helicalGearSizes } from "../../../gears/helical-gears";
import { bevelGearOutline, bevelGearSizes } from "../../../gears/bevel-gears";
import type { BevelGearSizes, GearPairSizes, GearSizes, HelicalGearSizes, InternalGearPairSizes, PlanetarySet, RackSizes } from "../../../gears/gear-types";

/**
 * Involute gears by their numbers, with no CAD kernel needed: the circles of spur and ring gears,
 * and their outlines as points on the XY plane for any kernel to extrude. `occt.parts.mechanical.gears` builds
 * the same teeth as solids. Gears mesh when they share `module` and `pressureAngle`: two spur gears
 * half the module times their teeth together apart, a spur gear in a ring half the module times the
 * difference.
 * @beta
 */
export class EngineeringGears {

    /**
     * Works out the circles of an involute spur gear: the pitch circle meshing gears roll on, the
     * base circle its flanks unwind from, the tip and root circles, and half the angle a tooth
     * spans at the pitch circle.
     *
     * Example: module 1, 20 teeth -> pitch radius 10, tip radius 11, root radius 8.75
     * @param inputs - The teeth
     * @returns The four radii in model units and the half tooth angle in radians
     * @group spur
     * @shortname spur gear sizes
     * @drawable false
     * @example
     * ```typescript
     * const pinion = bitbybit.engineering.mechanical.gears.spurGearSizes({ module: 1, teeth: 20 });
     * const wheel = bitbybit.engineering.mechanical.gears.spurGearSizes({ module: 1, teeth: 30 });
     * const centreDistance = pinion.pitchRadius + wheel.pitchRadius;
     * ```
     */
    spurGearSizes(inputs: Inputs.Engineering.SpurGearSizesDto): GearSizes {
        const resolved = resolveDto(Inputs.Engineering.SpurGearSizesDto, inputs) as Resolved.Engineering.SpurGearSizesDto;
        return spurGearSizes(resolved);
    }

    /**
     * Draws the outline of an involute spur gear as points on the XY plane, a closed counterclockwise
     * loop that does not repeat its start, ready to extrude in any kernel.
     *
     * The flanks follow the involute within a ten-thousandth of the module; `segments` sets the
     * points per curve. Tips that reach only inside the base circle are refused.
     * @param inputs - The teeth, the turn and the segments per curve
     * @returns The points of the outline
     * @group spur
     * @shortname spur gear outline
     * @drawable true
     * @example
     * ```typescript
     * const outline = bitbybit.engineering.mechanical.gears.spurGearOutline({ module: 1, teeth: 20 });
     * const gear = await bitbybit.jscad.extrusions.extrudeLinear({ geometry: await bitbybit.jscad.polygon.createFromPoints({ points: outline }), height: 5, twistAngle: 0, twistSteps: 1 });
     * ```
     */
    spurGearOutline(inputs: Inputs.Engineering.SpurGearOutlineDto): Inputs.Base.Point3[] {
        const resolved = resolveDto(Inputs.Engineering.SpurGearOutlineDto, inputs) as Resolved.Engineering.SpurGearOutlineDto;
        return gearOutlinePoints(spurGearOutline(resolved, [0, 0], resolved.rotation), resolved.segments);
    }

    /**
     * Works out the circles of an involute ring gear, whose teeth point in toward its centre: the
     * pitch and base circles, the tip circle inside them, the root circle beyond, and half the
     * angle a tooth spans at the pitch circle.
     *
     * Example: module 1, 40 teeth -> pitch radius 20, tip radius 19, root radius 21.25
     * @param inputs - The teeth
     * @returns The four radii in model units and the half tooth angle in radians
     * @group ring
     * @shortname ring gear sizes
     * @drawable false
     * @example
     * ```typescript
     * const ring = bitbybit.engineering.mechanical.gears.ringGearSizes({ module: 1, teeth: 40 });
     * const outsideAtLeast = 2 * ring.rootRadius;
     * ```
     */
    ringGearSizes(inputs: Inputs.Engineering.RingGearSizesDto): GearSizes {
        const resolved = resolveDto(Inputs.Engineering.RingGearSizesDto, inputs) as Resolved.Engineering.RingGearSizesDto;
        return ringGearSizes(resolved);
    }

    /**
     * Draws the teeth of an involute ring gear as points on the XY plane around the origin: the edge
     * of the hole inside the ring, a closed loop counterclockwise that does not repeat its start.
     *
     * Cut it from a circle larger than twice the root radius to make the ring; `segments` sets how
     * many points stand for each curve.
     * @param inputs - The teeth, the turn and the segments per curve
     * @returns The points of the outline
     * @group ring
     * @shortname ring gear outline
     * @drawable true
     * @example
     * ```typescript
     * const teeth = bitbybit.engineering.mechanical.gears.ringGearOutline({ module: 1, teeth: 40 });
     * ```
     */
    ringGearOutline(inputs: Inputs.Engineering.RingGearOutlineDto): Inputs.Base.Point3[] {
        const resolved = resolveDto(Inputs.Engineering.RingGearOutlineDto, inputs) as Resolved.Engineering.RingGearOutlineDto;
        return gearOutlinePoints(ringGearOutline(resolved, [0, 0], resolved.rotation), resolved.segments);
    }

    /**
     * Works out the circles of an involute helical gear's section square to its axis, with that
     * section's module and pressure angle, and how many degrees the teeth turn per model unit along
     * the axis.
     *
     * Example: module 1, 20 teeth, 20 degrees -> pitch radius 10.64, twist 1.96
     * @param inputs - The teeth and their lean
     * @returns The radii, the half tooth angle, the transverse module and pressure angle and the twist
     * @group helical
     * @shortname helical gear sizes
     * @drawable false
     * @example
     * ```typescript
     * const pinion = bitbybit.engineering.mechanical.gears.helicalGearSizes({ module: 1, teeth: 20, helixAngle: 20 });
     * const wheel = bitbybit.engineering.mechanical.gears.helicalGearSizes({ module: 1, teeth: 30, helixAngle: -20 });
     * const centreDistance = pinion.pitchRadius + wheel.pitchRadius;
     * ```
     */
    helicalGearSizes(inputs: Inputs.Engineering.HelicalGearSizesDto): HelicalGearSizes {
        const resolved = resolveDto(Inputs.Engineering.HelicalGearSizesDto, inputs) as Resolved.Engineering.HelicalGearSizesDto;
        return helicalGearSizes(resolved);
    }

    /**
     * Draws a helical gear's section square to its axis as points on the XY plane around the origin, a
     * closed loop counterclockwise that does not repeat its start.
     *
     * Extrude it with a twist of `twist` from `helicalGearSizes` times the height to make the gear.
     * @param inputs - The teeth, their lean, the turn and the segments per curve
     * @returns The points of the outline
     * @group helical
     * @shortname helical gear outline
     * @drawable true
     * @example
     * ```typescript
     * const sizes = bitbybit.engineering.mechanical.gears.helicalGearSizes({ module: 1, teeth: 20 });
     * const outline = bitbybit.engineering.mechanical.gears.helicalGearOutline({ module: 1, teeth: 20 });
     * const section = await bitbybit.jscad.polygon.createFromPoints({ points: outline });
     * const gear = await bitbybit.jscad.extrusions.extrudeLinear({ geometry: section, height: 5, twistAngle: sizes.twist * 5, twistSteps: 10 });
     * ```
     */
    helicalGearOutline(inputs: Inputs.Engineering.HelicalGearOutlineDto): Inputs.Base.Point3[] {
        const resolved = resolveDto(Inputs.Engineering.HelicalGearOutlineDto, inputs) as Resolved.Engineering.HelicalGearOutlineDto;
        return gearOutlinePoints(helicalGearOutline(resolved, [0, 0], resolved.rotation), resolved.segments);
    }

    /**
     * Works out the cones and outer circles of a straight bevel gear meshing a mate at a shaft
     * angle: its pitch, tip and root cones, back radii and apex distance.
     *
     * A tip cone of 90 degrees or more is refused.
     * Example: module 2, 20 teeth meshing 40 at 90 degrees -> pitch cone 26.57 degrees, apex 40 away
     * @param inputs - The teeth, the mate's teeth and the shaft angle
     * @returns The radii and distances in model units and the cone angles in degrees
     * @group bevel
     * @shortname bevel gear sizes
     * @drawable false
     * @example
     * ```typescript
     * const pinion = bitbybit.engineering.mechanical.gears.bevelGearSizes({ module: 2, teeth: 20, mateTeeth: 40 });
     * const wheel = bitbybit.engineering.mechanical.gears.bevelGearSizes({ module: 2, teeth: 40, mateTeeth: 20 });
     * ```
     */
    bevelGearSizes(inputs: Inputs.Engineering.BevelGearSizesDto): BevelGearSizes {
        const resolved = resolveDto(Inputs.Engineering.BevelGearSizesDto, inputs) as Resolved.Engineering.BevelGearSizesDto;
        return bevelGearSizes(resolved);
    }

    /**
     * Draws a straight bevel gear's teeth as points on the XY plane around the origin, as seen from
     * the apex on the plane of the outer pitch circle, by Tredgold's approximation.
     *
     * The flanks run straight to the apex, so the section in a plane nearer it is this outline scaled
     * by its distance over `apexDistance`.
     * @param inputs - The teeth, the mate's teeth, the shaft angle, the turn and the segments per curve
     * @returns The points of the outline
     * @group bevel
     * @shortname bevel gear outline
     * @drawable true
     * @example
     * ```typescript
     * const sizes = bitbybit.engineering.mechanical.gears.bevelGearSizes({ module: 1, teeth: 20, mateTeeth: 30 });
     * const outline = bitbybit.engineering.mechanical.gears.bevelGearOutline({ module: 1, teeth: 20, mateTeeth: 30 });
     * const section = await bitbybit.manifold.crossSection.crossSectionFromPoints({ points: outline, fillRule: Bit.Inputs.Manifold.fillRuleEnum.positive, removeDuplicates: false, tolerance: 1e-7 });
     * const gear = await bitbybit.manifold.crossSection.operations.extrude({ crossSection: section, height: sizes.apexDistance / 4, nDivisions: 1, twistDegrees: 0, scaleTopX: 0.75, scaleTopY: 0.75, center: false });
     * ```
     */
    bevelGearOutline(inputs: Inputs.Engineering.BevelGearOutlineDto): Inputs.Base.Point3[] {
        const resolved = resolveDto(Inputs.Engineering.BevelGearOutlineDto, inputs) as Resolved.Engineering.BevelGearOutlineDto;
        return gearOutlinePoints(bevelGearOutline(resolved, [0, 0], resolved.rotation), resolved.segments);
    }

    /**
     * Works out how two external spur gears mesh: centre distance, working pressure angle, contact
     * ratio and ratio, profile shifts included.
     *
     * The contact ratio counts only involute contact, `interferes` flags tips reaching past it, and
     * `tipShortening` and `clearance` show how shifts crowd tips into roots.
     * Example: module 2, 20 and 30 teeth -> 50 apart, contact ratio 1.61
     * @param inputs - The module, the teeth, the pressure angle, the tooth heights and the profile shifts
     * @returns The centre distance, working pressure angle, contact ratio, ratio, interference, tip shortening and clearance
     * @group pairs
     * @shortname gear pair
     * @drawable false
     * @example
     * ```typescript
     * const pair = bitbybit.engineering.mechanical.gears.gearPair({ module: 2, teethA: 12, teethB: 20, profileShiftA: 0.5, profileShiftB: 0.5 });
     * const sound = !pair.interferes && pair.clearance > 0 && pair.contactRatio > 1.2;
     * ```
     */
    gearPair(inputs: Inputs.Engineering.GearPairDto): GearPairSizes {
        const resolved = resolveDto(Inputs.Engineering.GearPairDto, inputs) as Resolved.Engineering.GearPairDto;
        return gearPair(resolved);
    }

    /**
     * Works out a spur gear meshing inside a ring gear: centre distance, contact ratio, ratio and
     * interference.
     *
     * The contact ratio counts only involute contact. `interferes` flags ring tips below the gear's
     * base circle, or gear tips catching ring tips when the two differ by few teeth.
     * Example: module 2, 20 teeth in 60 -> 40 apart, ratio 3
     * @param inputs - The module, the teeth and the pressure angle
     * @returns The centre distance, contact ratio, ratio and interference
     * @group pairs
     * @shortname internal gear pair
     * @drawable false
     * @example
     * ```typescript
     * const pair = bitbybit.engineering.mechanical.gears.internalGearPair({ module: 2, pinionTeeth: 24, ringTeeth: 60 });
     * ```
     */
    internalGearPair(inputs: Inputs.Engineering.InternalGearPairDto): InternalGearPairSizes {
        const resolved = resolveDto(Inputs.Engineering.InternalGearPairDto, inputs) as Resolved.Engineering.InternalGearPairDto;
        return internalGearPair(resolved);
    }

    /**
     * Lays out a planetary gear set around a sun at rotation 0: the ring's teeth, where the planets
     * sit, how far each planet and the ring turn to mesh, the ratio with the ring held, and whether
     * the planets mesh, keep clear of each other and interfere.
     *
     * They mesh when the sun's and ring's teeth together divide by the planets.
     * @param inputs - The module, the sun's and a planet's teeth, the planets and the pressure angle
     * @returns The layout and its checks
     * @group planetary
     * @shortname planetary set
     * @drawable false
     * @example
     * ```typescript
     * const set = bitbybit.engineering.mechanical.gears.planetarySet({ module: 1, sunTeeth: 24, planetTeeth: 24, planets: 4 });
     * const ringTeeth = set.ringTeeth;
     * ```
     */
    planetarySet(inputs: Inputs.Engineering.PlanetarySetDto): PlanetarySet {
        const resolved = resolveDto(Inputs.Engineering.PlanetarySetDto, inputs) as Resolved.Engineering.PlanetarySetDto;
        return planetarySet(resolved);
    }

    /**
     * Works out the lines of an involute rack: its pitch, its length, how far its tips stand above
     * the pitch line, how deep its gaps reach below it and how thick each tooth is on it.
     *
     * Example: module 2, 10 teeth -> pitch 6.28, 62.8 long
     * @param inputs - The teeth and the height
     * @returns The sizes in model units
     * @group racks
     * @shortname rack sizes
     * @drawable false
     * @example
     * ```typescript
     * const rack = bitbybit.engineering.mechanical.gears.rackSizes({ module: 2, teeth: 10, height: 6 });
     * ```
     */
    rackSizes(inputs: Inputs.Engineering.RackSizesDto): RackSizes {
        const resolved = resolveDto(Inputs.Engineering.RackSizesDto, inputs) as Resolved.Engineering.RackSizesDto;
        return rackSizes(resolved);
    }

    /**
     * Draws an involute rack's outline as points on the XY plane, a closed counterclockwise loop not
     * repeating its start: pitch line on the x axis, teeth along +y, the first tooth's middle on the
     * origin.
     *
     * A spur gear of the same module meshes with its centre its pitch radius, plus its profile shift
     * times the module, above the pitch line.
     * @param inputs - The teeth, the height and the segments per curve
     * @returns The points of the outline
     * @group racks
     * @shortname rack outline
     * @drawable true
     * @example
     * ```typescript
     * const outline = bitbybit.engineering.mechanical.gears.rackOutline({ module: 2, teeth: 10, height: 6 });
     * ```
     */
    rackOutline(inputs: Inputs.Engineering.RackOutlineDto): Inputs.Base.Point3[] {
        const resolved = resolveDto(Inputs.Engineering.RackOutlineDto, inputs) as Resolved.Engineering.RackOutlineDto;
        return gearOutlinePoints(rackOutline(resolved), resolved.segments);
    }
}
