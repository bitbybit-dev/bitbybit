
import { Context } from '../../context';
import {
    Color4, Color3, PointLight, Vector3,
    MeshBuilder, StandardMaterial, Light, ArcRotateCamera, ShadowGenerator, DirectionalLight, CubeTexture, Matrix, Ray, PickingInfo, Scene
} from '@babylonjs/core';
import * as Inputs from '../../inputs/inputs';


export class BabylonScene {

    constructor(private readonly context: Context) { }

    /**
     * Changes the scene background colour for 3D space
     * @param inputs Describes the colour of the scene background
     * @group environment
     * @shortname colour
     */
    backgroundColour(inputs: Inputs.BabylonScene.SceneBackgroundColourDto): void {
        this.context.scene.clearColor = Color4.FromColor3(Color3.FromHexString(inputs.colour));
    }

    /**
     * Activate camera
     * @param inputs Activates the camera
     * @group camera
     * @shortname activate
     */
    activateCamera(inputs: Inputs.BabylonScene.ActiveCameraDto): void {
        this.context.scene.activeCamera.detachControl();
        this.context.scene.activeCamera = inputs.camera;
    }

    /**
     * Use right handed system
     * @param inputs Activates the camera
     * @group system
     * @shortname hand right
     */
    useRightHandedSystem(inputs: Inputs.BabylonScene.UseRightHandedSystemDto): void {
        this.context.scene.useRightHandedSystem = inputs.use;
        this.context.scene.activeCamera.getViewMatrix(true);
        this.context.scene.activeCamera.getProjectionMatrix(true);
    }

    /**
     * Creates and draws a point light in the scene
     * @param inputs Describes the light source
     * @returns BabylonJS point light
     * @group lights
     * @shortname point
     * @disposableOutput true
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
            shadowGenerator.bias = 0.0001;
            shadowGenerator.normalBias = 0.002;
            light.shadowMaxZ = 1000;
            light.shadowMinZ = 1;
            this.context.scene.metadata.shadowGenerators.push(shadowGenerator);
            this.context.scene.meshes.forEach(m => {
                if (m.name !== 'hdrSkyBox') {
                    shadowGenerator.addShadowCaster(m, true);
                    m.receiveShadows = true;
                }
            })
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
     * @param inputs Describes the light source
     * @returns BabylonJS directional light
     * @group lights
     * @shortname directional
     * @disposableOutput true
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
            shadowGenerator.bias = 0.0001;
            shadowGenerator.normalBias = 0.002;
            light.shadowMaxZ = 1000;
            light.shadowMinZ = 1;
            this.context.scene.metadata.shadowGenerators.push(shadowGenerator);
            this.context.scene.meshes.forEach(m => {
                if (m.name !== 'hdrSkyBox') {
                    shadowGenerator.addShadowCaster(m, true);
                    m.receiveShadows = true;
                }
            })
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
     * @group camera
     * @shortname adjust active
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
     * @group environment
     * @shortname clear all drawn
     */
    clearAllDrawn(): void {
        this.context.BitByBitContextHelperService.clearAllDrawn();
    }

    /**
     * Enables skybox
     * @param inputs Skybox configuration
     * @group environment
     * @shortname skybox
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
     * @ignore true
     */
    onPointerDown(inputs: Inputs.BabylonScene.PointerDto): void {
        this.context.scene.onPointerDown = inputs.statement_update;
    }

    /**
     * Registers code to run when pointer is up
     * @param inputs pointer statement
     * @ignore true
     */
    onPointerUp(inputs: Inputs.BabylonScene.PointerDto): void {
        this.context.scene.onPointerUp = inputs.statement_update;
    }

    /**
     * Registers code to run when pointer is moving
     * @param inputs pointer statement
     * @ignore true
     */
    onPointerMove(inputs: Inputs.BabylonScene.PointerDto): void {
        this.context.scene.onPointerMove = inputs.statement_update;
    }

    /**
     * Enables fog mode
     * @param inputs fog options
     * @group environment
     * @shortname fog
     */
    fog(inputs: Inputs.BabylonScene.FogDto): void {
        this.context.scene.fogMode = +inputs.mode;
        this.context.scene.fogDensity = inputs.density;
        this.context.scene.fogStart = inputs.start;
        this.context.scene.fogEnd = inputs.end;
        this.context.scene.fogColor = Color3.FromHexString(inputs.color);

    }

}
