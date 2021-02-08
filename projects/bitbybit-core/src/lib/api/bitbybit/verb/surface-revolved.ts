import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../../context';
import * as Inputs from '../../inputs/inputs';

/**
 * Revolved surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class VerbSurfaceRevolved {

    constructor(private readonly context: Context) { }

    /**
     * Creates the revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_surface_revolved.verbsurfacerevolved.html#create
     * @param inputs Parameters for Nurbs revolved surface
     * @returns Revolved Nurbs surface
     */
    create(inputs: Inputs.Verb.RevolutionParametersDto): any {
        return new this.context.verb.geom.RevolvedSurface(
            inputs.profile, inputs.center, inputs.axis, Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Get the profile Nurbs curve of the revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/profile.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_surface_revolved.verbsurfacerevolved.html#profile
     * @param inputs Revolved Nurbs surface
     * @returns Nurbs curve
     */
    profile(inputs: Inputs.Verb.RevolutionDto): any {
        return inputs.revolution.profile();
    }

    /**
     * Get the center Nurbs curve of the revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/center.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_surface_revolved.verbsurfacerevolved.html#center
     * @param inputs Revolved Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Verb.RevolutionDto): number[] {
        return inputs.revolution.center();
    }

    /**
     * Get the rotation axis of the revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/axis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_surface_revolved.verbsurfacerevolved.html#axis
     * @param inputs Revolved Nurbs surface
     * @returns Axis vector of rotation
     */
    axis(inputs: Inputs.Verb.RevolutionDto): number[] {
        return inputs.revolution.axis();
    }

    /**
     * Get the angle of rotation from revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/angle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_surface_revolved.verbsurfacerevolved.html#angle
     * @param inputs Revolved Nurbs surface
     * @returns Angle in degrees
     */
    angle(inputs: Inputs.Verb.RevolutionDto): number {
        return Angle.FromRadians(inputs.revolution.angle()).degrees();
    }
}
