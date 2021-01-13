import { simplifyDeclaration } from './simplify-declaration';

export const solidString = simplifyDeclaration(`
import { LinesMesh, Mesh } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
import { SolidBooleans } from './solid-booleans';
import { SolidExpansions } from './solid-expansions';
import { SolidExtrusions } from './solid-extrusions';
import { SolidHulls } from './solid-hulls';
import { SolidPath } from './solid-path';
import { SolidPolygon } from './solid-polygon';
import { SolidShapes } from './solid-shapes';
import { SolidText } from './solid-text';
/**
 * Contains various functions for Solid meshes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class Solid {
    readonly booleans: SolidBooleans;
    readonly expansions: SolidExpansions;
    readonly extrusions: SolidExtrusions;
    readonly hulls: SolidHulls;
    readonly path: SolidPath;
    readonly polygon: SolidPolygon;
    readonly shapes: SolidShapes;
    readonly text: SolidText;
    private readonly context;
    private readonly geometryHelper;
    constructor(booleans: SolidBooleans, expansions: SolidExpansions, extrusions: SolidExtrusions, hulls: SolidHulls, path: SolidPath, polygon: SolidPolygon, shapes: SolidShapes, text: SolidText, context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single solids
     * <div>
     *  <img src="../assets/images/blockly-images/solid/drawSolidOrPolygonMesh.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#drawsolidorpolygonmesh
     * @param inputs Contains a solid or polygon and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMesh(inputs: Inputs.Solid.DrawSolidMeshDto): Mesh;
    /**
     * Draws multiple solids
     * <div>
     *  <img src="../assets/images/blockly-images/solid/drawSolidOrPolygonMeshes.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#drawsolidorpolygonmeshes
     * @param inputs Contains solids or polygons and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMeshes(inputs: Inputs.Solid.DrawSolidsMeshDto): Mesh;
    /**
     * Draws a 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/solid/drawPath.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#drawpath
     * @param inputs Contains a path and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawPath(inputs: Inputs.Solid.DrawPathDto): LinesMesh;
    /**
     * Transforms the Jscad solid meshes with a given list of transformations.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/transformSolids.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#transformsolids
     * @param inputs Solids with the transformation matrixes
     * @returns Solids with a transformation
     */
    transformSolids(inputs: Inputs.Solid.TransformSolidsDto): any;
    /**
     * Transforms the Jscad solid mesh with a given list of transformations.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/transformSolid.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#transformsolid
     * @param inputs Solid with the transformation matrixes
     * @returns Solid with a transformation
     */
    transformSolid(inputs: Inputs.Solid.TransformSolidDto): any;
    /**
     * Downloads the binary STL file from a 3D solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/downloadSolidSTL.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#downloadsolidstl
     * @param inputs 3D Solid
     */
    downloadSolidSTL(inputs: Inputs.Solid.DownloadSolidDto): void;
    /**
     * Downloads the binary STL file from a 3D solids
     * <div>
     *  <img src="../assets/images/blockly-images/solid/downloadSolidsSTL.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#downloadsolidsstl
     * @param inputs 3D Solid
     */
    downloadSolidsSTL(inputs: Inputs.Solid.DownloadSolidsDto): void;
    private downloadSTL;
    private createMesh;
}

`);
