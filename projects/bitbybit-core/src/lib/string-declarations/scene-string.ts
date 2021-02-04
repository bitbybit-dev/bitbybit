import { simplifyDeclaration } from './simplify-declaration';

export const sceneString = simplifyDeclaration(`
import { Context } from '../context';
import { Mesh, PointLight } from '@babylonjs/core';
import * as Inputs from '../inputs/inputs';
import { GeometryHelper } from '../geometry-helper';
export declare class Scene {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Changes the scene background colour for 3D space
     * <div>
     *  <img src="../assets/images/blockly-images/scene/backgroundColour.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#backgroundcolour
     * @param inputs Describes the colour of the scene background
     */
    backgroundColour(inputs: Inputs.Scene.SceneBackgroundColourDto): void;
    /**
     * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
     * <div>
     *  <img src="../assets/images/blockly-images/scene/drawGridMesh.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#drawgridmesh
     * @param inputs Describes various parameters of the grid mesh like size, colour, etc.
     */
    drawGridMesh(inputs: Inputs.Scene.SceneDrawGridMeshDto): Mesh;
    /**
     * Creates and draws a point light in the scene
     * <div>
     *  <img src="../assets/images/blockly-images/scene/drawPointLight.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#drawpointlight
     * @param inputs Describes the light source
     * @returns BabylonJS point light
     */
    drawPointLight(inputs: Inputs.Scene.PointLightDto): PointLight;
    /**
     * Adjusts the active arc rotate camera with configuration parameters
     * <div>
     *  <img src="../assets/images/blockly-images/scene/adjustActiveArcRotateCamera.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#adjustactivearcrotatecamera
     */
    adjustActiveArcRotateCamera(inputs: Inputs.Scene.CameraConfigurationDto): void;
    /**
     * Clears all of the drawn objects in the 3D scene
     * <div>
     *  <img src="../assets/images/blockly-images/scene/clearAllDrawn.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#clearalldrawn
     */
    clearAllDrawn(): void;
    /**
     * Creates mesh instance and transforms it for optimised rendering. These are optimised for max performance
     * when rendering many similar objects in the scene.
     * <div>
     *  <img src="../assets/images/blockly-images/scene/createMeshInstanceAndTransform.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#createmeshinstanceandtransform
     */
    createMeshInstanceAndTransform(inputs: Inputs.Scene.MeshInstanceAndTransformDto): Promise<any>;
}
`);
