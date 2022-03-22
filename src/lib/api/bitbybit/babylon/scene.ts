
import { Context } from '../../context';
import {
    Color4, Color3, Mesh, PointLight, Vector3,
    MeshBuilder, StandardMaterial, Light, ArcRotateCamera, ShadowGenerator, DirectionalLight, SceneLoader, ISceneLoaderAsyncResult, AbstractMesh, SceneSerializer, ISceneLoaderPlugin, ISceneLoaderPluginAsync
} from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import * as Inputs from '../../inputs/inputs';


export class BabylonScene {

    constructor(private readonly context: Context) { }

    /**
     * Changes the scene background colour for 3D space
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/scene/backgroundColour.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_scene.BabylonScene.html#backgroundColour
     * @param inputs Describes the colour of the scene background
     */
    backgroundColour(inputs: Inputs.BabylonScene.SceneBackgroundColourDto): void {
        this.context.scene.clearColor = Color4.FromColor3(Color3.FromHexString(inputs.colour));
    }

    /**
     * Creates and draws a point light in the scene
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/scene/drawPointLight.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_scene.BabylonScene.html#drawPointLight
     * @param inputs Describes the light source
     * @returns BabylonJS point light
     */
    drawPointLight(inputs: Inputs.BabylonScene.PointLightDto): PointLight {
        const pos = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        const light = new PointLight(`pointLight${Math.random()}`,
            pos,
            this.context.scene
        );
        if (inputs.enableShadows) {
            light.shadowEnabled = true;
            var shadowGenerator = new ShadowGenerator(inputs.shadowGeneratorMapSize, light);
            shadowGenerator.darkness = inputs.shadowDarkness;
            shadowGenerator.usePercentageCloserFiltering = true;
            shadowGenerator.contactHardeningLightSizeUVRatio = 0.2;
            light.shadowMaxZ = 1000;
            this.context.scene.metadata.shadowGenerators.push(shadowGenerator);
        }

        light.diffuse = Color3.FromHexString(inputs.diffuse);
        light.specular = Color3.FromHexString(inputs.specular);
        light.intensityMode = Light.INTENSITYMODE_LUMINOUSPOWER;
        light.intensity = inputs.intensity;

        if (inputs.radius > 0) {
            const sphere = MeshBuilder.CreateSphere(`PointLightSphere${Math.random()}`,
                { diameter: inputs.radius * 2 },
                this.context.scene
            );
            const lightMaterial = new StandardMaterial(`LightMaterial${Math.random()}`, this.context.scene);
            lightMaterial.diffuseColor = light.diffuse;
            lightMaterial.specularColor = light.diffuse;
            lightMaterial.emissiveColor = light.diffuse;
            sphere.material = lightMaterial;
            sphere.parent = light;
        }
        return light;
    }

    /**
    * Creates and draws a directional light in the scene
    * <div>
    *  <img src="../assets/images/blockly-images/babylon/scene/drawDirectionalLight.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_scene.BabylonScene.html#drawDirectionalLight
    * @param inputs Describes the light source
    * @returns BabylonJS directional light
    */
    drawDirectionalLight(inputs: Inputs.BabylonScene.DirectionalLightDto): DirectionalLight {
        const dir = new Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        const light = new DirectionalLight(`directionalLight${Math.random()}`,
            dir,
            this.context.scene
        );

        if (inputs.enableShadows) {
            light.shadowEnabled = true;
            var shadowGenerator = new ShadowGenerator(inputs.shadowGeneratorMapSize, light);
            shadowGenerator.darkness = inputs.shadowDarkness;
            shadowGenerator.usePercentageCloserFiltering = true;
            shadowGenerator.contactHardeningLightSizeUVRatio = 0.2;
            this.context.scene.metadata.shadowGenerators.push(shadowGenerator);
        }

        light.diffuse = Color3.FromHexString(inputs.diffuse);
        light.specular = Color3.FromHexString(inputs.specular);
        // light.intensityMode = Light.INTENSITYMODE_LUMINOUSPOWER;
        light.intensity = inputs.intensity;

        return light;
    }

    /**
     * Adjusts the active arc rotate camera with configuration parameters
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/scene/adjustActiveArcRotateCamera.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_scene.BabylonScene.html#adjustActiveArcRotateCamera
     */
    adjustActiveArcRotateCamera(inputs: Inputs.BabylonScene.CameraConfigurationDto): void {
        const camera = this.context.scene.getCameraByName('Camera') as ArcRotateCamera;
        camera.position = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        camera.target = new Vector3(inputs.lookAt[0], inputs.lookAt[1], inputs.lookAt[2]);
        camera.maxZ = inputs.maxZ;
        camera.panningSensibility = inputs.panningSensibility;
        camera.wheelPrecision = inputs.wheelPrecision;
    }

    /**
     * Clears all of the drawn objects in the 3D scene
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/scene/clearAllDrawn.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_scene.BabylonScene.html#clearAllDrawn
     */
    clearAllDrawn(): void {
        this.context.bitByBitBlocklyHelperService.clearAllDrawn();
    }


}
