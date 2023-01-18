
import { Context } from '../../context';
import {
    Color4, Color3, Mesh, PointLight, Vector3,
    MeshBuilder, StandardMaterial, Light, ArcRotateCamera, ShadowGenerator, DirectionalLight, CubeTexture, Matrix, Ray, PickingInfo, Scene
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
     * Activate camera
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/scene/activatecamera.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_scene.BabylonScene.html#activateCamera
     * @param inputs Activates the camera
     */
    activateCamera(inputs: Inputs.BabylonScene.ActiveCameraDto): void {
        this.context.scene.activeCamera.detachControl();
        this.context.scene.activeCamera = inputs.camera;
    }

    /**
     * Use right handed system
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/scene/userighthandedsystem.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_scene.BabylonScene.html#useRightHandedSystem
     * @param inputs Activates the camera
     */
    useRightHandedSystem(inputs: Inputs.BabylonScene.UseRightHandedSystemDto): void {
        this.context.scene.useRightHandedSystem = inputs.use;
        this.context.scene.activeCamera.getViewMatrix(true);
        this.context.scene.activeCamera.getProjectionMatrix(true);
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
            const shadowGenerator = new ShadowGenerator(inputs.shadowGeneratorMapSize, light);
            shadowGenerator.darkness = inputs.shadowDarkness;
            shadowGenerator.usePercentageCloserFiltering = true;
            shadowGenerator.contactHardeningLightSizeUVRatio = 0.2;
            shadowGenerator.bias = 0.001;
            shadowGenerator.normalBias = 0.02;
            light.shadowMaxZ = 1000;
            light.shadowMinZ = 1;
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
            const shadowGenerator = new ShadowGenerator(inputs.shadowGeneratorMapSize, light);
            shadowGenerator.darkness = inputs.shadowDarkness;
            shadowGenerator.usePercentageCloserFiltering = true;
            shadowGenerator.contactHardeningLightSizeUVRatio = 0.2;
            shadowGenerator.bias = 0.001;
            shadowGenerator.normalBias = 0.02;
            light.shadowMaxZ = 1000;
            light.shadowMinZ = 1;
            this.context.scene.metadata.shadowGenerators.push(shadowGenerator);
        }

        light.diffuse = Color3.FromHexString(inputs.diffuse);
        light.specular = Color3.FromHexString(inputs.specular);
        // light.intensityMode = Light.INTENSITYMODE_LUMINOUSPOWER;
        light.intensity = inputs.intensity;
        light.shadowMaxZ = 1000;
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

    /**
     * Enables skybox
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/scene/enableSkybox.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_scene.BabylonScene.html#enableSkybox
     */
    enableSkybox(inputs: Inputs.BabylonScene.SkyboxDto): void {
        let texture: CubeTexture;
        if (inputs.skybox === Inputs.Base.skyboxEnum.default) {
            texture = new CubeTexture('/assets/textures/default_skybox/skybox', this.context.scene);
        } else if (inputs.skybox === Inputs.Base.skyboxEnum.clearSky) {
            texture = CubeTexture.CreateFromPrefilteredData('/assets/textures/clear_sky/environment.env',
                this.context.scene, false, false);
        } else if (inputs.skybox === Inputs.Base.skyboxEnum.city) {
            texture = CubeTexture.CreateFromPrefilteredData('/assets/textures/city/environmentSpecular.env',
                this.context.scene, false, false);
        }

        const skybox = this.context.scene.createDefaultSkybox(texture, true, inputs.size, inputs.blur, true);
        // skybox.disableEdgesRendering();
        // this.context.scene.environmentTexture = texture;
        this.context.scene.environmentIntensity = inputs.environmentIntensity;
    }

    /**
     * Registers code to run when pointer is down
     * @param inputs pointer statement
     */
    onPointerDown(inputs: Inputs.BabylonScene.PointerDto): void {
        this.context.scene.onPointerDown = inputs.statement_update;
    }

    /**
     * Registers code to run when pointer is up
     * @param inputs pointer statement
     */
    onPointerUp(inputs: Inputs.BabylonScene.PointerDto): void {
        this.context.scene.onPointerUp = inputs.statement_update;
    }

    /**
     * Registers code to run when pointer is moving
     * @param inputs pointer statement
     */
    onPointerMove(inputs: Inputs.BabylonScene.PointerDto): void {
        this.context.scene.onPointerMove = inputs.statement_update;
    }

    fog(inputs: Inputs.BabylonScene.FogDto): void {
        this.context.scene.fogMode = +inputs.mode;
        this.context.scene.fogDensity = inputs.density;
        this.context.scene.fogStart = inputs.start;
        this.context.scene.fogEnd = inputs.end;
        this.context.scene.fogColor = Color3.FromHexString(inputs.color);

    }

}
