import { Injectable } from '@angular/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various functions for Solid hulls from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class SolidHulls {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Hull chain connects solids or 2d geometries by filling an empty space in between objects in order.
     * Geometries need to be of the same type.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/hulls/hull1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/hulls/hull2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/hulls/hull3.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_hulls_.solidhulls.html#chainhull
     * @param inputs Geometries
     * @returns Chain hulled geometry
     */
    hullChain(inputs: Inputs.Solid.HullDto): any | any[] {
        return this.context.jscad.hulls.hullChain(...inputs.geometry);
    }
    /**
     * Convex hull connects solids or 2d geometries by filling an empty space in between without following order.
     * Geometries need to be of the same type.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/hulls/hullChain1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/hulls/hullChain2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/hulls/hullChain3.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_hulls_.solidhulls.html#chainhull
     * @param inputs Geometries
     * @returns Hulled geometry
     */
    hull(inputs: Inputs.Solid.HullDto): any | any[] {
        return this.context.jscad.hulls.hull(...inputs.geometry);
    }
}
