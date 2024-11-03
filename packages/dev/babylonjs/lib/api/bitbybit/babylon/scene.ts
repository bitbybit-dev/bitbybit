
import { Context } from "../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../inputs/inputs";
import { Base } from "../../inputs/base-inputs";
import { Scene } from "@babylonjs/core";
import { GUI3DManager } from "@babylonjs/gui";


export class BabylonScene {

    constructor(private readonly context: Context) { }

    /**
     * Gets the scene for the current context
     * @ignore true
     * @group scene
     * @shortname get scene
     */
    getScene(): BABYLON.Scene {
        return this.context.scene;
    }

    /**
     * Gets the scene for the current context
     * @ignore true
     * @group scene
     * @shortname get scene
     */
    setAndAttachScene(inputs: Inputs.BabylonScene.SceneDto): BABYLON.Scene {
        const scene = inputs.scene;
        scene.metadata = { shadowGenerators: [] };
        new BABYLON.TransformNode("root", this.context.scene);
        return this.context.scene = inputs.scene;
    }

    /**
     * Changes the scene background colour for 3D space
     * @param inputs Describes the colour of the scene background
     * @group environment
     * @shortname colour
     */
    backgroundColour(inputs: Inputs.BabylonScene.SceneBackgroundColourDto): void {
        this.context.scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(inputs.colour));
    }

    /**
     * Activate camera by overwriting currently active camera
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
     * Creates and draws a point light in the scene but does not output anything
     * @param inputs Describes the light source
     * @group lights
     * @shortname point
     * @disposableOutput true
     */
    drawPointLightNoReturn(inputs: Inputs.BabylonScene.PointLightDto): void {
        this.drawPointLight(inputs);
    }

    /**
     * Get shadow generators added by light sources through bitbybit
     * @param inputs Describes the light source
     * @group lights
     * @shortname point
     * @disposableOutput true
     */
    getShadowGenerators(): BABYLON.ShadowGenerator[] {
        if (this.context.scene.metadata && this.context.scene.metadata.shadowGenerators) {
            return this.context.scene.metadata.shadowGenerators;
        } else {
            return [];
        }
    }

    /**
     * Creates and draws a point light in the scene
     * @param inputs Describes the light source
     * @returns BabylonJS point light
     * @group lights
     * @shortname point light
     * @disposableOutput true
     */
    drawPointLight(inputs: Inputs.BabylonScene.PointLightDto): BABYLON.PointLight {
        const pos = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        const light = new BABYLON.PointLight(`pointLight${Math.random()}`,
            pos,
            this.context.scene
        );
        if (inputs.enableShadows) {
            light.shadowEnabled = true;
            const shadowGenerator = new BABYLON.ShadowGenerator(inputs.shadowGeneratorMapSize, light);
            shadowGenerator.darkness = inputs.shadowDarkness;
            shadowGenerator.usePercentageCloserFiltering = inputs.shadowUsePercentageCloserFiltering;
            shadowGenerator.contactHardeningLightSizeUVRatio = inputs.shadowContactHardeningLightSizeUVRatio;
            shadowGenerator.bias = inputs.shadowBias;
            shadowGenerator.normalBias = inputs.shadowNormalBias;
            light.shadowMaxZ = inputs.shadowMaxZ;
            light.shadowMinZ = inputs.shadowMinZ;
            this.context.scene.metadata.shadowGenerators.push(shadowGenerator);
            this.context.scene.meshes.forEach(m => {
                if (m.name !== "bitbybit-hdrSkyBox" && !m.name.includes("bitbybit-ground") && (!m.metadata || (m.metadata && m.metadata.shadows !== false))) {
                    shadowGenerator.addShadowCaster(m, true);
                    m.receiveShadows = true;
                }
            });
        }

        light.diffuse = BABYLON.Color3.FromHexString(inputs.diffuse);
        light.specular = BABYLON.Color3.FromHexString(inputs.specular);
        light.intensityMode = BABYLON.Light.INTENSITYMODE_LUMINOUSPOWER;
        light.intensity = inputs.intensity;

        if (inputs.radius > 0) {
            const sphere = BABYLON.MeshBuilder.CreateSphere(`PointLightSphere${Math.random()}`,
                { diameter: inputs.radius * 2 },
                this.context.scene
            );
            const lightMaterial = new BABYLON.StandardMaterial(`LightMaterial${Math.random()}`, this.context.scene);
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
     * @group lights
     * @shortname directional
     * @disposableOutput true
     */
    drawDirectionalLightNoReturn(inputs: Inputs.BabylonScene.DirectionalLightDto): void {
        this.drawDirectionalLight(inputs);
    }

    /**
     * Creates and draws a directional light in the scene
     * @param inputs Describes the light source
     * @returns BabylonJS directional light
     * @group lights
     * @shortname directional light
     * @disposableOutput true
     */
    drawDirectionalLight(inputs: Inputs.BabylonScene.DirectionalLightDto): BABYLON.DirectionalLight {
        const dir = new BABYLON.Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        const light = new BABYLON.DirectionalLight(`directionalLight${Math.random()}`,
            dir,
            this.context.scene
        );

        if (inputs.enableShadows) {
            light.shadowEnabled = true;
            const shadowGenerator = new BABYLON.ShadowGenerator(inputs.shadowGeneratorMapSize, light);
            shadowGenerator.darkness = inputs.shadowDarkness;
            shadowGenerator.usePercentageCloserFiltering = inputs.shadowUsePercentageCloserFiltering;
            shadowGenerator.contactHardeningLightSizeUVRatio = inputs.shadowContactHardeningLightSizeUVRatio;
            shadowGenerator.bias = inputs.shadowBias;
            shadowGenerator.normalBias = inputs.shadowNormalBias;
            light.shadowMaxZ = inputs.shadowMaxZ;
            light.shadowMinZ = inputs.shadowMinZ;
            this.context.scene.metadata.shadowGenerators.push(shadowGenerator);
            this.context.scene.meshes.forEach(m => {
                if (m.name !== "bitbybit-hdrSkyBox" && !m.name.includes("bitbybit-ground") && (!m.metadata || (m.metadata && m.metadata.shadows !== false))) {
                    shadowGenerator.addShadowCaster(m, true);
                    m.receiveShadows = true;
                }
            });
        }

        light.diffuse = BABYLON.Color3.FromHexString(inputs.diffuse);
        light.specular = BABYLON.Color3.FromHexString(inputs.specular);
        // light.intensityMode = Light.INTENSITYMODE_LUMINOUSPOWER;
        light.intensity = inputs.intensity;
        light.shadowMaxZ = inputs.shadowMaxZ;
        return light;
    }

    /**
     * Gets the active camera of the scene
     * @group camera
     * @shortname get active camera
     */
    getActiveCamera(): BABYLON.Camera {
        return this.context.scene.activeCamera;
    }

    /**
     * Adjusts the active arc rotate camera with configuration parameters
     * @group camera
     * @shortname adjust active camera
     */
    adjustActiveArcRotateCamera(inputs: Inputs.BabylonScene.CameraConfigurationDto): void {
        const camera = this.context.scene.getCameraByName("Camera") as BABYLON.ArcRotateCamera;
        camera.position = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        camera.target = new BABYLON.Vector3(inputs.lookAt[0], inputs.lookAt[1], inputs.lookAt[2]);
        const distance = BABYLON.Vector3.Distance(camera.position, camera.target);
        camera.radius = distance;
        if (inputs.lowerRadiusLimit !== undefined) {
            camera.lowerRadiusLimit = inputs.lowerRadiusLimit;
        }
        if (inputs.upperRadiusLimit !== undefined) {
            camera.upperRadiusLimit = inputs.upperRadiusLimit;
        }
        if (inputs.lowerAlphaLimit !== undefined) {
            camera.lowerAlphaLimit = this.getRadians(inputs.lowerAlphaLimit);
        }
        if (inputs.upperAlphaLimit !== undefined) {
            camera.upperAlphaLimit = this.getRadians(inputs.upperAlphaLimit);
        }
        if (inputs.lowerBetaLimit !== undefined) {
            camera.lowerBetaLimit = this.getRadians(inputs.lowerBetaLimit);
        }
        if (inputs.upperBetaLimit !== undefined) {
            camera.upperBetaLimit = this.getRadians(inputs.upperBetaLimit);
        }
        if (inputs.angularSensibilityX !== undefined) {
            camera.angularSensibilityX = inputs.angularSensibilityX;
        }
        if (inputs.angularSensibilityY !== undefined) {
            camera.angularSensibilityY = inputs.angularSensibilityY;
        }
        if (inputs.panningSensibility !== undefined) {
            camera.panningSensibility = inputs.panningSensibility;
        }
        if (inputs.wheelPrecision !== undefined) {
            camera.wheelPrecision = inputs.wheelPrecision;
        }
        if (inputs.maxZ !== undefined) {
            camera.maxZ = inputs.maxZ;
        }
    }

    /**
     * Clears all of the drawn objects in the 3D scene
     * @group environment
     * @shortname clear all drawn
     */
    clearAllDrawn(): void {
        const scene = this.context.scene;
        if (scene) {

            if (scene.environmentTexture) {
                scene.environmentTexture.dispose();
            }
            scene.environmentTexture = null;
            scene.fogMode = Scene.FOGMODE_NONE;
            scene.meshes.forEach(m => m.dispose());
            scene.meshes = [];
            scene.materials.forEach(m => m.dispose());
            scene.textures.forEach(m => m.dispose());
            scene.materials = [];
            scene.textures = [];
            scene.useRightHandedSystem = false;
            scene.geometries.forEach((g: BABYLON.Geometry) => {
                if (g.meshes) {
                    g.meshes.forEach(m => m.dispose());
                }
                if (g.dispose) {
                    g.dispose();
                }
            });
            scene.geometries = [];

            scene.lights.forEach(l => {
                if (l.name !== "HemiLight") {
                    l.dispose();
                }
            });
            scene.lights = scene.lights.filter(i => i.name === "HemiLight");
            if (scene.transformNodes) {
                scene.transformNodes.forEach(t => {
                    if (t && t.name !== "root") {
                        t.dispose();
                    }
                });
            }

            if (scene.metadata) {
                if (scene.metadata.shadowGenerators.length > 0) {
                    const sgs = scene.metadata.shadowGenerators as BABYLON.ShadowGenerator[];
                    sgs.forEach(sg => sg.dispose());
                    scene.metadata.shadowGenerators = [];
                }
                if (scene.metadata.xr) {
                    (scene.metadata.xr as BABYLON.WebXRDefaultExperience).dispose();
                }
                if (scene.metadata.guiManager) {
                    (scene.metadata.guiManager as GUI3DManager).dispose();
                }
            }
            scene.transformNodes = [scene.getTransformNodeByName("root")];

            if (scene.activeCamera && scene.activeCamera.name !== "Camera") {
                scene.cameras.forEach(cam => cam.dispose());
                const camera = new BABYLON.ArcRotateCamera("Camera", 0, 10, 10, new BABYLON.Vector3(0, 0, 0), scene);
                camera.lowerRadiusLimit = 0;
                scene.setActiveCameraByName(camera.name);
                camera.setPosition(new BABYLON.Vector3(0, 10, 20));
                const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
                camera.attachControl(canvas, true);
                camera.minZ = 0;
            }
        }
    }

    /**
     * Enables skybox
     * @param inputs Skybox configuration
     * @group environment
     * @shortname skybox
     */
    enableSkybox(inputs: Inputs.BabylonScene.SkyboxDto): void {
        let texture: BABYLON.CubeTexture;
        if (inputs.skybox === Inputs.Base.skyboxEnum.default) {
            texture = new BABYLON.CubeTexture("https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.18.0-alpha.3/textures/skybox/default_skybox/skybox", this.context.scene);
        } else if (inputs.skybox === Inputs.Base.skyboxEnum.greyGradient) {
            texture = new BABYLON.CubeTexture("https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.18.0-alpha.3/textures/skybox/grey_gradient/skybox", this.context.scene);
        } else if (inputs.skybox === Inputs.Base.skyboxEnum.clearSky) {
            texture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.18.0-alpha.3/textures/skybox/clear_sky/environment.env",
                this.context.scene, false, false);
        } else if (inputs.skybox === Inputs.Base.skyboxEnum.city) {
            texture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.18.0-alpha.3/textures/skybox/city/environmentSpecular.env",
                this.context.scene, false, false);
        }

        const skybox = this.context.scene.createDefaultSkybox(texture, true, inputs.size, inputs.blur, true);
        skybox.name = "bitbybit-hdrSkyBox";
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
        switch (inputs.mode) {
            case Base.fogModeEnum.none:
                this.context.scene.fogMode = 0;
                break;
            case Base.fogModeEnum.exponential:
                this.context.scene.fogMode = 1;
                break;
            case Base.fogModeEnum.exponentialSquared:
                this.context.scene.fogMode = 2;
                break;
            case Base.fogModeEnum.linear:
                this.context.scene.fogMode = 3;
                break;
        }
        this.context.scene.fogDensity = inputs.density;
        this.context.scene.fogStart = inputs.start;
        this.context.scene.fogEnd = inputs.end;
        this.context.scene.fogColor = BABYLON.Color3.FromHexString(inputs.color);

    }

    /**
     * Enables the physics
     * @param inputs the gravity vector
     * @ignore true
     * @group physics
     * @shortname enable
     */
    enablePhysics(inputs: Inputs.BabylonScene.EnablePhysicsDto) {
        this.context.scene.enablePhysics(new BABYLON.Vector3(inputs.vector[0], inputs.vector[1], inputs.vector[2]), this.context.havokPlugin);
    }

    private getRadians(degrees: number): number {
        let angle = BABYLON.Angle.FromDegrees(degrees).radians();
        if (degrees < 0) {
            angle = -angle;
        }
        return angle;
    }
}
