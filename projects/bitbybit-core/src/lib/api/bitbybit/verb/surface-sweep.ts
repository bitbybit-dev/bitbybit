import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../../context';
import * as Inputs from '../../inputs/inputs';

/**
 * Sweep surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class VerbSurfaceSweep {

    constructor(private readonly context: Context) { }

    /**
     * Creates the sweep Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/sweep/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_sweep.verbsurfacesweep.html#create
     * @param inputs Parameters for Nurbs sweep surface
     * @returns Sweep Nurbs surface
     */
    create(inputs: Inputs.Verb.SweepParametersDto): any {
        return new this.context.verb.geom.SweptSurface(inputs.profile, inputs.rail);
    }

    /**
     * Get the profile Nurbs curve of the swept Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/sweep/profile.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_sweep.verbsurfacesweep.html#profile
     * @param inputs Sweep Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Verb.SweepDto): any {
        return inputs.sweep.profile();
    }

    /**
     * Get the rail Nurbs curve of the swept Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/sweep/rail.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_sweep.verbsurfacesweep.html#rail
     * @param inputs Sweep Nurbs surface
     * @returns Rail Nurbs curve
     */
    rail(inputs: Inputs.Verb.SweepDto): any {
        return inputs.sweep.rail();
    }
}
