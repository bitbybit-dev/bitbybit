import { simplifyDeclaration } from '../simplify-declaration';

export const occString = simplifyDeclaration(`
import { Mesh } from '@babylonjs/core';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { OCCHelper } from './occ-helper';
/**
 * Contains various methods for OpenCascade implementation
 * Much of the work is done by Johnathon Selstad and Sebastian Alff to port OCC to JavaScript
 * I'm super grateful for their work!
 */
export declare class OCC {
    private readonly context;
    private readonly geometryHelper;
    private readonly occHelper;
    constructor(context: Context, geometryHelper: GeometryHelper, occHelper: OCCHelper);
    /**
     * Draws a Brep solid
     * <div>
     *  <img src="../assets/images/blockly-images/occ/drawBrep.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#drawbrep
     * @param inputs Contains a brep to be drawn and options
     * @returns BabylonJS Mesh
     */
    drawBrep(inputs: Inputs.OCC.DrawBrepDto): Mesh;
    /**
     * Creates OpenCascade Polygon
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createPolygon.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createpolygon
     * @param inputs Polygon points
     * @returns OpenCascade polygon shape
     */
    createPolygon(inputs: Inputs.OCC.PolygonDto): any;
    /**
     * Creates OpenCascade Box
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBox.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbox
     * @param inputs Box size and center
     * @returns OpenCascade Box
     */
    createBox(inputs: Inputs.OCC.BoxDto): any;
    /**
     * Creates OpenCascade Sphere
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createsphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     */
    createSphere(inputs: Inputs.OCC.SphereDto): any;
    /**
     * Fillets OpenCascade Shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createsphere
     * @param inputs Sphere size
     * @returns OpenCascade Sphere
     */
    filletEdges(shape: any, radius: any, edgeList: any, filletAll: any): any;
    forEachEdge(shape: any, callback: any): any;
}

`);
