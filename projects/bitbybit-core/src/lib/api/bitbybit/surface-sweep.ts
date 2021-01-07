import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';

/**
 * Sweep surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class SurfaceSweep {

    constructor(private readonly context: Context) { }

    /**
     * Creates the sweep Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/sweep/create.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_sweep_.surfacerevolved.html#create
     * @param inputs Parameters for Nurbs sweep surface
     * @returns Sweep Nurbs surface
     */
    create(inputs: Inputs.Surface.SweepParametersDto): any {
        return new this.context.verb.geom.SweptSurface(inputs.profile, inputs.rail);
    }

    /**
     * Get the profile Nurbs curve of the swept Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/sweep/profile.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_sweep_.surfacesweep.html#profile
     * @param inputs Sweep Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Surface.SweepDto): any {
        return inputs.sweep.profile();
    }

    /**
     * Get the rail Nurbs curve of the swept Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/sweep/rail.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_sweep_.surfacesweep.html#rail
     * @param inputs Sweep Nurbs surface
     * @returns Rail Nurbs curve
     */
    rail(inputs: Inputs.Surface.SweepDto): any {
        return inputs.sweep.rail();
    }
}
