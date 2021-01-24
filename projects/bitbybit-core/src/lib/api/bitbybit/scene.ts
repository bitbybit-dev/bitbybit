import { Injectable } from '@angular/core';
import { Context } from '../context';
import { Color4, Color3, Mesh, PointLight, Vector3, MeshBuilder, StandardMaterial, Light } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import * as Inputs from '../inputs/inputs';

@Injectable()
export class Scene {

    constructor(private readonly context: Context) { }

    /**
     * Changes the scene background colour for 3D space
     * <div>
     *  <img src="../assets/images/blockly-images/scene/backgroundColour.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#backgroundcolour
     * @param inputs Describes the colour of the scene background
     */
    backgroundColour(inputs: Inputs.Scene.SceneBackgroundColourDto): void {
        this.context.scene.clearColor = Color4.FromColor3(Color3.FromHexString(inputs.colour));
    }

    /**
     * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
     * <div>
     *  <img src="../assets/images/blockly-images/scene/drawGridMesh.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#drawgridmesh
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
     * Creates a point light in the scene
     * <div>
     *  <img src="../assets/images/blockly-images/scene/createPointLight.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#createpointlight
     * @param inputs Describes the light source
     * @returns BabylonJS point light
     */
    createPointLight(inputs: Inputs.Scene.PointLightDto): PointLight {
        const light = new PointLight(`pointLight${Math.random()}`,
            new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
            this.context.scene
        );
        light.diffuse = Color3.FromHexString(inputs.diffuse);
        light.specular = Color3.FromHexString(inputs.specular);
        light.intensityMode = Light.INTENSITYMODE_LUMINOUSPOWER;
        light.intensity = inputs.intensity;
        return light;
    }

    /**
     * Draws a light in the scene
     * <div>
     *  <img src="../assets/images/blockly-images/scene/drawLight.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#drawlight
     * @param inputs Parameters for drawing lights
     * @returns Sphere with emissive material in the location of the light
     */
    drawLight(inputs: Inputs.Scene.DrawLightDto): Mesh {
        const sphere = MeshBuilder.CreateSphere(`PointLightSphere${Math.random()}`,
            { diameter: inputs.bubbleRadius * 2 },
            this.context.scene
        );
        sphere.position = inputs.light.position;
        const lightMaterial = new StandardMaterial(`LightMaterial${Math.random()}`, this.context.scene);
        lightMaterial.diffuseColor = inputs.light.diffuse;
        lightMaterial.specularColor = inputs.light.specular;
        lightMaterial.emissiveColor = inputs.light.diffuse;
        sphere.material = lightMaterial;
        return sphere;
    }

    /**
     * Clears all of the drawn objects in the 3D scene
     * <div>
     *  <img src="../assets/images/blockly-images/scene/clearAllDrawn.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#clearalldrawn
     */
    clearAllDrawn(): void {
        this.context.bitByBitBlocklyHelperService.clearAllDrawn();
    }

}
