import { simplifyDeclaration } from './simplify-declaration';

export const jscadString = simplifyDeclaration(`
import { LinesMesh, Mesh } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
import { JSCADBooleans } from './jscad-booleans';
import { JSCADExpansions } from './jscad-expansions';
import { JSCADExtrusions } from './jscad-extrusions';
import { JSCADHulls } from './jscad-hulls';
import { JSCADPath } from './jscad-path';
import { JSCADPolygon } from './jscad-polygon';
import { JSCADShapes } from './jscad-shapes';
import { JSCADText } from './jscad-text';
/**
 * Contains various functions for Solid meshes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class JSCAD {
    readonly booleans: JSCADBooleans;
    readonly expansions: JSCADExpansions;
    readonly extrusions: JSCADExtrusions;
    readonly hulls: JSCADHulls;
    readonly path: JSCADPath;
    readonly polygon: JSCADPolygon;
    readonly shapes: JSCADShapes;
    readonly text: JSCADText;
    private readonly context;
    private readonly geometryHelper;
    constructor(booleans: JSCADBooleans, expansions: JSCADExpansions, extrusions: JSCADExtrusions, hulls: JSCADHulls, path: JSCADPath, polygon: JSCADPolygon, shapes: JSCADShapes, text: JSCADText, context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single solids
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/drawSolidOrPolygonMesh.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawsolidorpolygonmesh
     * @param inputs Contains a solid or polygon and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto): Mesh;
    /**
     * Draws multiple solids
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/drawSolidOrPolygonMeshes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawsolidorpolygonmeshes
     * @param inputs Contains solids or polygons and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidsMeshDto): Mesh;
    /**
     * Draws a 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/drawPath.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawpath
     * @param inputs Contains a path and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawPath(inputs: Inputs.JSCAD.DrawPathDto): LinesMesh;
    /**
     * Transforms the Jscad solid meshes with a given list of transformations.
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/transformSolids.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#transformsolids
     * @param inputs Solids with the transformation matrixes
     * @returns Solids with a transformation
     */
    transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): any;
    /**
     * Transforms the Jscad solid mesh with a given list of transformations.
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/transformSolid.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#transformsolid
     * @param inputs Solid with the transformation matrixes
     * @returns Solid with a transformation
     */
    transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): any;
    /**
     * Downloads the binary STL file from a 3D solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/downloadSolidSTL.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#downloadsolidstl
     * @param inputs 3D Solid
     */
    downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): void;
    /**
     * Downloads the binary STL file from a 3D solids
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/downloadSolidsSTL.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#downloadsolidsstl
     * @param inputs 3D Solid
     */
    downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): void;
    private downloadSTL;
    private createMesh;
}

`);
