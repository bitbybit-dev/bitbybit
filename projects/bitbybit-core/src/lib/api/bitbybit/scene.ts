import { Injectable } from '@angular/core';
import { Context } from '../context';
import { Color4, Color3, Mesh } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import * as Inputs from '../inputs/inputs';

@Injectable()
export class Scene {

    constructor(private readonly context: Context) { }

    /**
     * Changes the scene background colour for 3D space
     * <div>
     *  <img src="../assets/images/blockly-images/scene/backgroundColour.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_scene_.scene.html#backgroundcolour
     * @param inputs Describes the colour of the scene background
     */
    backgroundColour(inputs: Inputs.Scene.SceneBackgroundColourDto): void {
        this.context.scene.clearColor = Color4.FromColor3(Color3.FromHexString(inputs.colour));
    }

    /**
     * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
     * <div>
     *  <img src="../assets/images/blockly-images/scene/drawGridMesh.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_scene_.scene.html#drawgridmesh
     * @param inputs Describes various parameters of the grid mesh like size, colour, etc.
     */
    drawGridMesh(inputs: Inputs.Scene.SceneDrawGridMeshDto): Mesh {
        const groundMaterial = new GridMaterial(`groundMaterial${Math.random()}`, this.context.scene);
        groundMaterial.majorUnitFrequency = inputs.majorUnitFrequency;
        groundMaterial.minorUnitVisibility = inputs.minorUnitVisibility;
        groundMaterial.gridRatio = inputs.gridRatio;
        groundMaterial.backFaceCulling = inputs.backFaceCulling;
        groundMaterial.mainColor = Color3.FromHexString(inputs.mainColor);
        groundMaterial.lineColor = Color3.FromHexString(inputs.secondaryColor);
        groundMaterial.opacity = inputs.opacity;

        const ground = Mesh.CreateGround(`ground${Math.random()}`,
            inputs.width, inputs.height, inputs.subdivisions, this.context.scene, false
        );

        ground.material = groundMaterial;
        return ground;
    }

    /**
     * Clears all of the drawn objects in the 3D scene
     * <div>
     *  <img src="../assets/images/blockly-images/scene/clearAllDrawn.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_scene_.scene.html#clearalldrawn
     */
    clearAllDrawn(): void {
        this.context.bitByBitBlocklyHelperService.clearAllDrawn();
    }

}
