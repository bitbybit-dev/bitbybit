import { Context } from "../../context";
import { uniqueName } from "../../unique-name";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../inputs";
import { GlobalCDNProvider } from "@bitbybit-dev/base";


/**
 * The BabylonJS scene as a whole: the active camera and its limits, lights with shadows, the skybox
 * and environment lighting, fog, physics, pointer events, the canvas background and clearing
 * everything drawn. A scene holds every mesh, light and camera; most scripts touch it to set up
 * lighting and the camera once and then draw into it.
 */
export class BabylonScene {

    constructor(private readonly context: Context) { }

    /**
     * Gives the scene every draw call goes into, for direct use of the BabylonJS API on it.
     * @returns The current scene
     * @ignore true
     * @group scene
     * @shortname get scene
     */
    getScene(): BABYLON.Scene {
        return this.context.scene;
    }

    /**
     * Makes the given scene the one this library draws into, adding the shadow bookkeeping and root
     * node it expects; for applications that create the scene themselves.
     * @param inputs - The scene to use
     * @returns The same scene, now current
     * @ignore true
     * @group scene
     * @shortname get scene
     * @example
     * ```typescript
     * const scene = bitbybit.babylon.scene.setAndAttachScene({ scene: myScene });
     * ```
     */
    setAndAttachScene(inputs: Inputs.BabylonScene.SceneDto): BABYLON.Scene {
        const scene = inputs.scene;
        scene.metadata = { shadowGenerators: [] };
        new BABYLON.TransformNode("root", this.context.scene);
        return this.context.scene = inputs.scene;
    }

    /**
     * Makes a camera the one the scene renders through, detaching the controls of the camera that
     * was active before.
     * @param inputs - The camera to activate
     * @group camera
     * @shortname activate
     * @example
     * ```typescript
     * const camera = bitbybit.babylon.camera.arcRotate.create({ radius: 20, target: [0, 0, 0], alpha: 45, beta: 70, lowerBetaLimit: 1, upperBetaLimit: 179, angularSensibilityX: 1000, angularSensibilityY: 1000, panningSensibility: 1000, wheelPrecision: 3, maxZ: 1000 });
     * bitbybit.babylon.scene.activateCamera({ camera });
     * ```
     */
    activateCamera(inputs: Inputs.BabylonScene.ActiveCameraDto): void {
        this.context.scene.activeCamera!.detachControl();
        this.context.scene.activeCamera = inputs.camera;
    }

    /**
     * Switches the scene between the left-handed coordinate system BabylonJS uses by default and a
     * right-handed one, the convention of most CAD tools and of glTF; the active camera is
     * refreshed to match.
     * @param inputs - Whether to use the right-handed system
     * @group system
     * @shortname hand right
     * @example
     * ```typescript
     * bitbybit.babylon.scene.useRightHandedSystem({ use: true });
     * ```
     */
    useRightHandedSystem(inputs: Inputs.BabylonScene.UseRightHandedSystemDto): void {
        this.context.scene.useRightHandedSystem = inputs.use;
        this.context.scene.activeCamera!.getViewMatrix(true);
        this.context.scene.activeCamera!.getProjectionMatrix(true);
    }

    /**
     * Adds a point light to the scene, as `drawPointLight` does, without giving it back; for
     * scripts that only need the light to exist.
     * @param inputs - The light's position, colors, intensity, bulb radius and shadow settings
     * @group lights
     * @shortname point
     * @disposableOutput true
     * @example
     * ```typescript
     * bitbybit.babylon.scene.drawPointLightNoReturn({ position: [10, 20, 10], intensity: 2000, diffuse: "#ffffff", specular: "#ffffff", radius: 0.5, enableShadows: true, shadowGeneratorMapSize: 1024, shadowDarkness: 0, transparencyShadow: false, shadowUsePercentageCloserFiltering: true, shadowContactHardeningLightSizeUVRatio: 0.2, shadowBias: 0.0001, shadowNormalBias: 0.002, shadowMaxZ: 1000, shadowMinZ: 0.1, shadowRefreshRate: 1 });
     * ```
     */
    drawPointLightNoReturn(inputs: Inputs.BabylonScene.PointLightDto): void {
        this.drawPointLight(inputs);
    }

    /**
     * Lists the shadow generators of the lights created through this library, one per light with
     * shadows enabled; drawn meshes are registered with them as casters.
     * @returns The shadow generators, or an empty list
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
     * Adds a light that shines in every direction from a point, like a bulb, with an optional small
     * glowing sphere at its position.
     *
     * With `enableShadows` true a shadow generator is created and every mesh already in the scene
     * casts and receives shadows; `intensity` is luminous power, so values in the thousands are
     * normal.
     * @param inputs - The light's position, colors, intensity, bulb radius and shadow settings
     * @returns The point light
     * @group lights
     * @shortname point light
     * @disposableOutput true
     * @example
     * ```typescript
     * const light = bitbybit.babylon.scene.drawPointLight({ position: [10, 20, 10], intensity: 2000, diffuse: "#ffffff", specular: "#ffffff", radius: 0.5, enableShadows: true, shadowGeneratorMapSize: 1024, shadowDarkness: 0, transparencyShadow: false, shadowUsePercentageCloserFiltering: true, shadowContactHardeningLightSizeUVRatio: 0.2, shadowBias: 0.0001, shadowNormalBias: 0.002, shadowMaxZ: 1000, shadowMinZ: 0.1, shadowRefreshRate: 1 });
     * ```
     */
    drawPointLight(inputs: Inputs.BabylonScene.PointLightDto): BABYLON.PointLight {
        const pos = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        const light = new BABYLON.PointLight(uniqueName("pointLight"),
            pos,
            this.context.scene
        );
        if (inputs.enableShadows) {
            light.shadowEnabled = true;
            const shadowGenerator = new BABYLON.ShadowGenerator(inputs.shadowGeneratorMapSize ?? 1024, light);
            shadowGenerator.darkness = inputs.shadowDarkness ?? 0;
            shadowGenerator.usePercentageCloserFiltering = inputs.shadowUsePercentageCloserFiltering;
            shadowGenerator.contactHardeningLightSizeUVRatio = inputs.shadowContactHardeningLightSizeUVRatio;
            shadowGenerator.bias = inputs.shadowBias;
            shadowGenerator.normalBias = inputs.shadowNormalBias;
            if (inputs.transparencyShadow === true) {
                shadowGenerator.setTransparencyShadow(true);
            }
            if (inputs.shadowRefreshRate !== undefined) {
                shadowGenerator.getShadowMap()!.refreshRate = inputs.shadowRefreshRate;
            }
            light.shadowMaxZ = inputs.shadowMaxZ;
            light.shadowMinZ = inputs.shadowMinZ;
            this.context.scene.metadata.shadowGenerators.push(shadowGenerator);

            this.context.scene.meshes.forEach(m => {
                if (m.name !== "bitbybit-hdrSkyBox" && !m.name.includes("poi_") && !m.name.includes("dimension_text_3d") && !m.name.includes("bitbybit-ground") && (!m.metadata || (m.metadata && m.metadata.shadows !== false))) {
                    shadowGenerator.addShadowCaster(m, true);
                    m.receiveShadows = true;
                }
            });

            light.onDispose = () => {
                shadowGenerator.dispose();
                if (this.context.scene.metadata && this.context.scene.metadata.shadowGenerators) {
                    const index = this.context.scene.metadata.shadowGenerators.indexOf(shadowGenerator);
                    if (index > -1) {
                        this.context.scene.metadata.shadowGenerators.splice(index, 1);
                    }
                }
            };
        }

        light.diffuse = BABYLON.Color3.FromHexString(inputs.diffuse);
        light.specular = BABYLON.Color3.FromHexString(inputs.specular);
        light.intensityMode = BABYLON.Light.INTENSITYMODE_LUMINOUSPOWER;
        light.intensity = inputs.intensity;

        if (inputs.radius > 0) {
            const sphere = BABYLON.MeshBuilder.CreateSphere(uniqueName("PointLightSphere"),
                { diameter: inputs.radius * 2 },
                this.context.scene
            );
            sphere.metadata = { shadows: false };
            const lightMaterial = new BABYLON.StandardMaterial(uniqueName("LightMaterial"), this.context.scene);
            lightMaterial.diffuseColor = light.diffuse;
            lightMaterial.specularColor = light.diffuse;
            lightMaterial.emissiveColor = light.diffuse;
            sphere.material = lightMaterial;
            sphere.parent = light;
        }
        return light;
    }

    /**
     * Adds a directional light to the scene, as `drawDirectionalLight` does, without giving it
     * back; for scripts that only need the light to exist.
     * @param inputs - The light's direction, colors, intensity and shadow settings
     * @group lights
     * @shortname directional
     * @disposableOutput true
     * @example
     * ```typescript
     * bitbybit.babylon.scene.drawDirectionalLightNoReturn({ direction: [-100, -100, -100], intensity: 0.5, diffuse: "#ffffff", specular: "#ffffff", enableShadows: true, shadowGeneratorMapSize: 1024, shadowDarkness: 0, transparencyShadow: false, shadowUsePercentageCloserFiltering: true, shadowContactHardeningLightSizeUVRatio: 0.2, shadowBias: 0.0001, shadowNormalBias: 0.002, shadowMaxZ: 1000, shadowMinZ: 0, shadowRefreshRate: 1 });
     * ```
     */
    drawDirectionalLightNoReturn(inputs: Inputs.BabylonScene.DirectionalLightDto): void {
        this.drawDirectionalLight(inputs);
    }

    /**
     * Adds a light that shines the same way everywhere, like the sun, along `direction`.
     *
     * With `enableShadows` true a shadow generator is created and every mesh already in the scene
     * casts and receives shadows; `intensity` is a plain factor where 1 is full strength.
     * @param inputs - The light's direction, colors, intensity and shadow settings
     * @returns The directional light
     * @group lights
     * @shortname directional light
     * @disposableOutput true
     * @example
     * ```typescript
     * const sun = bitbybit.babylon.scene.drawDirectionalLight({ direction: [-100, -100, -100], intensity: 0.5, diffuse: "#ffffff", specular: "#ffffff", enableShadows: true, shadowGeneratorMapSize: 1024, shadowDarkness: 0, transparencyShadow: false, shadowUsePercentageCloserFiltering: true, shadowContactHardeningLightSizeUVRatio: 0.2, shadowBias: 0.0001, shadowNormalBias: 0.002, shadowMaxZ: 1000, shadowMinZ: 0, shadowRefreshRate: 1 });
     * ```
     */
    drawDirectionalLight(inputs: Inputs.BabylonScene.DirectionalLightDto): BABYLON.DirectionalLight {
        const dir = new BABYLON.Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        const light = new BABYLON.DirectionalLight(uniqueName("directionalLight"),
            dir,
            this.context.scene
        );

        if (inputs.enableShadows) {
            light.shadowEnabled = true;
            const shadowGenerator = new BABYLON.ShadowGenerator(inputs.shadowGeneratorMapSize ?? 1024, light);
            shadowGenerator.darkness = inputs.shadowDarkness ?? 0;

            shadowGenerator.usePercentageCloserFiltering = inputs.shadowUsePercentageCloserFiltering;
            shadowGenerator.contactHardeningLightSizeUVRatio = inputs.shadowContactHardeningLightSizeUVRatio;
            shadowGenerator.bias = inputs.shadowBias;
            shadowGenerator.normalBias = inputs.shadowNormalBias;
            if (inputs.transparencyShadow === true) {
                shadowGenerator.setTransparencyShadow(true);
            }
            if (inputs.shadowRefreshRate !== undefined) {
                shadowGenerator.getShadowMap()!.refreshRate = inputs.shadowRefreshRate;
            }

            light.shadowMaxZ = inputs.shadowMaxZ;
            light.shadowMinZ = inputs.shadowMinZ;
            this.context.scene.metadata.shadowGenerators.push(shadowGenerator);
            this.context.scene.meshes.forEach(m => {
                if (m.name !== "bitbybit-hdrSkyBox" && !m.name.includes("poi_") && !m.name.includes("dimension_text_3d") && !m.name.includes("bitbybit-ground") && (!m.metadata || (m.metadata && m.metadata.shadows !== false))) {
                    shadowGenerator.addShadowCaster(m, true);
                    m.receiveShadows = true;
                }
            });
            light.onDispose = () => {
                shadowGenerator.dispose();
                if (this.context.scene.metadata && this.context.scene.metadata.shadowGenerators) {
                    const index = this.context.scene.metadata.shadowGenerators.indexOf(shadowGenerator);
                    if (index > -1) {
                        this.context.scene.metadata.shadowGenerators.splice(index, 1);
                    }
                }
            };
        }

        light.diffuse = BABYLON.Color3.FromHexString(inputs.diffuse);
        light.specular = BABYLON.Color3.FromHexString(inputs.specular);
        light.intensity = inputs.intensity;
        light.shadowMaxZ = inputs.shadowMaxZ;
        return light;
    }

    /**
     * Gives the camera the scene currently renders through.
     * @returns The active camera
     * @group camera
     * @shortname get active camera
     */
    getActiveCamera(): BABYLON.Camera {
        return this.context.scene.activeCamera!;
    }

    /**
     * Repositions the default orbiting camera, the one named `Camera`, and sets its limits and
     * sensitivities.
     *
     * The camera is placed at `position` looking at `lookAt`; the radius, alpha and beta limits
     * fence how far it can zoom and orbit, angles in degrees, and the sensibilities set how fast it
     * reacts, lower being faster.
     * @param inputs - The position, the target and the optional limits and sensitivities
     * @group camera
     * @shortname adjust active camera
     * @example
     * ```typescript
     * bitbybit.babylon.scene.adjustActiveArcRotateCamera({ position: [20, 20, 20], lookAt: [0, 0, 0], lowerRadiusLimit: 5, upperRadiusLimit: 100, lowerBetaLimit: 1, upperBetaLimit: 179, angularSensibilityX: 1000, angularSensibilityY: 1000, panningSensibility: 1000, wheelPrecision: 3, maxZ: 1000 });
     * ```
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
     * Removes everything drawn from the scene: meshes, materials, textures, lights other than the
     * default hemispheric one, transform nodes, shadow generators, fog and the environment texture,
     * and restores the default camera when another was active.
     * @group environment
     * @shortname clear all drawn
     * @example
     * ```typescript
     * bitbybit.babylon.scene.clearAllDrawn();
     * ```
     */
    clearAllDrawn(): void {
        const scene = this.context.scene;
        if (scene) {

            if (scene.environmentTexture) {
                scene.environmentTexture.dispose();
            }
            scene.environmentTexture = null;
            scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
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
                    (scene.metadata.guiManager as GUI.GUI3DManager).dispose();
                }
            }
            const root = scene.getTransformNodeByName("root");
            scene.transformNodes = root ? [root] : [];

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
     * Surrounds the scene with one of the built-in skyboxes and uses it as the environment lighting
     * that reflective materials pick up.
     *
     * `blur` softens the visible sky, `environmentIntensity` scales how much it lights the scene,
     * and `hideSkybox` keeps the lighting while hiding the sky itself.
     * @param inputs - The built-in skybox, its size, blur, environment intensity and visibility
     * @group environment
     * @shortname skybox
     * @example
     * ```typescript
     * bitbybit.babylon.scene.enableSkybox({ skybox: Bit.Inputs.Base.skyboxEnum.clearSky, size: 1000, blur: 0.1, environmentIntensity: 0.7, hideSkybox: false });
     * ```
     */
    enableSkybox(inputs: Inputs.BabylonScene.SkyboxDto): void {

        let texture: BABYLON.CubeTexture | BABYLON.HDRCubeTexture | undefined;

        if (inputs.skybox === Inputs.Base.skyboxEnum.default) {
            texture = new BABYLON.CubeTexture(GlobalCDNProvider.BITBYBIT_CDN_URL + "/textures/skybox/default_skybox/skybox", this.context.scene);
        } else if (inputs.skybox === Inputs.Base.skyboxEnum.greyGradient) {
            texture = new BABYLON.CubeTexture(GlobalCDNProvider.BITBYBIT_CDN_URL + "/textures/skybox/grey_gradient/skybox", this.context.scene);
        } else if (inputs.skybox === Inputs.Base.skyboxEnum.clearSky) {
            texture = BABYLON.CubeTexture.CreateFromPrefilteredData(GlobalCDNProvider.BITBYBIT_CDN_URL + "/textures/skybox/clear_sky/environment.env",
                this.context.scene, false, false);
        } else if (inputs.skybox === Inputs.Base.skyboxEnum.city) {
            texture = BABYLON.CubeTexture.CreateFromPrefilteredData(GlobalCDNProvider.BITBYBIT_CDN_URL + "/textures/skybox/city/environmentSpecular.env",
                this.context.scene, false, false);
        }

        this.createSkyboxMesh(texture, inputs.size, inputs.blur, inputs.hideSkybox ?? false, inputs.environmentIntensity);
    }

    /**
     * Surrounds the scene with a skybox loaded from your own texture and uses it as the environment
     * lighting.
     *
     * `textureUrl` may point to an `.hdr` file, an `.env` file or the root of six cube face images;
     * nothing happens without it. `hideSkybox` keeps the lighting while hiding the sky itself.
     * @param inputs - The texture URL and size, the skybox size, blur, environment intensity and visibility
     * @group environment
     * @shortname skybox
     * @example
     * ```typescript
     * bitbybit.babylon.scene.enableSkyboxCustomTexture({ textureUrl: "https://example.com/env/studio.env", textureSize: 512, size: 1000, blur: 0.1, environmentIntensity: 0.7, hideSkybox: true });
     * ```
     */
    enableSkyboxCustomTexture(inputs: Inputs.BabylonScene.SkyboxCustomTextureDto): void {
        if (inputs.textureUrl) {
            let texture: BABYLON.CubeTexture | BABYLON.HDRCubeTexture;
            const textureUrl = inputs.textureUrl;
            const textureSize = inputs.textureSize || 512;

            const urlPath = textureUrl.split("?")[0]!.toLowerCase();

            if (urlPath.endsWith(".hdr")) {
                texture = new BABYLON.HDRCubeTexture(textureUrl, this.context.scene, textureSize, false, true, false, true);
            } else if (urlPath.endsWith(".env")) {
                texture = BABYLON.CubeTexture.CreateFromPrefilteredData(inputs.textureUrl,
                    this.context.scene, false, false);
            } else {
                texture = new BABYLON.CubeTexture(textureUrl, this.context.scene);
            }

            this.createSkyboxMesh(texture, inputs.size, inputs.blur, inputs.hideSkybox ?? false, inputs.environmentIntensity);
        }
    }

    /**
     * Sets the function that runs when a pointer button is pressed on the canvas, replacing any
     * function set before.
     * @param inputs - The function to run
     * @ignore true
     * @example
     * ```typescript
     * bitbybit.babylon.scene.onPointerDown({ statement_update: () => { console.log("pressed"); } });
     * ```
     */
    onPointerDown(inputs: Inputs.BabylonScene.PointerDto): void {
        this.context.scene.onPointerDown = inputs.statement_update;
    }

    /**
     * Sets the function that runs when a pointer button is released on the canvas, replacing any
     * function set before.
     * @param inputs - The function to run
     * @ignore true
     * @example
     * ```typescript
     * bitbybit.babylon.scene.onPointerUp({ statement_update: () => { console.log("released"); } });
     * ```
     */
    onPointerUp(inputs: Inputs.BabylonScene.PointerDto): void {
        this.context.scene.onPointerUp = inputs.statement_update;
    }

    /**
     * Sets the function that runs whenever the pointer moves over the canvas, replacing any
     * function set before; it runs often, so keep it light.
     * @param inputs - The function to run
     * @ignore true
     * @example
     * ```typescript
     * bitbybit.babylon.scene.onPointerMove({ statement_update: () => { console.log("moved"); } });
     * ```
     */
    onPointerMove(inputs: Inputs.BabylonScene.PointerDto): void {
        this.context.scene.onPointerMove = inputs.statement_update;
    }

    /**
     * Fades distant geometry into a color, the way haze does.
     *
     * `linear` fades from `start` to `end` in scene units; `exponential` and `exponentialSquared`
     * fade by `density` instead, ignoring the distances; `none` turns fog off.
     * @param inputs - The fog mode, color, density and the start and end distances
     * @group environment
     * @shortname fog
     * @example
     * ```typescript
     * bitbybit.babylon.scene.fog({ mode: Bit.Inputs.Base.fogModeEnum.linear, color: "#ffffff", density: 0.1, start: 50, end: 300 });
     * ```
     */
    fog(inputs: Inputs.BabylonScene.FogDto): void {
        switch (inputs.mode) {
            case Inputs.Base.fogModeEnum.none:
                this.context.scene.fogMode = 0;
                break;
            case Inputs.Base.fogModeEnum.exponential:
                this.context.scene.fogMode = 1;
                break;
            case Inputs.Base.fogModeEnum.exponentialSquared:
                this.context.scene.fogMode = 2;
                break;
            case Inputs.Base.fogModeEnum.linear:
                this.context.scene.fogMode = 3;
                break;
        }
        this.context.scene.fogDensity = inputs.density;
        this.context.scene.fogStart = inputs.start;
        this.context.scene.fogEnd = inputs.end;
        this.context.scene.fogColor = BABYLON.Color3.FromHexString(inputs.color);

    }

    /**
     * Turns on the physics engine for the scene with the given gravity, so bodies given physics
     * fall and collide; the physics plugin must be set up on the context.
     * @param inputs - The gravity vector
     * @returns Nothing; the scene is changed in place
     * @ignore true
     * @group physics
     * @shortname enable
     * @example
     * ```typescript
     * bitbybit.babylon.scene.enablePhysics({ vector: [0, -9.81, 0] });
     * ```
     */
    enablePhysics(inputs: Inputs.BabylonScene.EnablePhysicsDto) {
        this.context.scene.enablePhysics(new BABYLON.Vector3(inputs.vector[0], inputs.vector[1], inputs.vector[2]), this.context.havokPlugin);
    }

    /**
     * Paints any CSS `background-image` value behind the scene, a gradient or an image, by making
     * the scene's clear color transparent and styling the canvas.
     * @param inputs - The CSS background image value
     * @returns The style that was applied
     * @group background
     * @shortname css background image
     * @example
     * ```typescript
     * bitbybit.babylon.scene.canvasCSSBackgroundImage({ cssBackgroundImage: "linear-gradient(to top, #1a1c1f 0%, #93aacd 100%)" });
     * ```
     */
    canvasCSSBackgroundImage(inputs: Inputs.BabylonScene.SceneCanvasCSSBackgroundImageDto): { backgroundImage: string } {
        this.context.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        const canvas = this.context.scene.getEngine().getRenderingCanvas();
        const styleObject = { backgroundImage: inputs.cssBackgroundImage };
        if (canvas) {
            canvas.style.backgroundImage = inputs.cssBackgroundImage;
        }
        return styleObject;
    }

    /**
     * Paints a straight gradient between two colors behind the scene, in the given direction, with
     * the stops as percentages along it.
     * @param inputs - The two colors, the direction and the two stops
     * @returns The style that was applied
     * @group background
     * @shortname two color linear gradient
     * @example
     * ```typescript
     * bitbybit.babylon.scene.twoColorLinearGradientBackground({ colorFrom: "#1a1c1f", colorTo: "#93aacd", direction: Bit.Inputs.Base.gradientDirectionEnum.toBottom, stopFrom: 0, stopTo: 100 });
     * ```
     */
    twoColorLinearGradientBackground(inputs: Inputs.BabylonScene.SceneTwoColorLinearGradientDto): { backgroundImage: string } {
        this.context.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        const canvas = this.context.scene.getEngine().getRenderingCanvas();
        const gradient = `linear-gradient(${inputs.direction}, ${inputs.colorFrom} ${inputs.stopFrom}%, ${inputs.colorTo} ${inputs.stopTo}%)`;
        const styleObject = { backgroundImage: gradient };
        if (canvas) {
            canvas.style.backgroundImage = gradient;
        }
        return styleObject;
    }

    /**
     * Paints a round gradient between two colors behind the scene, spreading out from `position` in
     * the given `shape`, with the stops as percentages from the center.
     * @param inputs - The two colors, the center position, the two stops and the shape
     * @returns The style that was applied
     * @group background
     * @shortname two color radial gradient
     * @example
     * ```typescript
     * bitbybit.babylon.scene.twoColorRadialGradientBackground({ colorFrom: "#1a1c1f", colorTo: "#93aacd", position: Bit.Inputs.Base.gradientPositionEnum.center, stopFrom: 0, stopTo: 100, shape: Bit.Inputs.Base.gradientShapeEnum.circle });
     * ```
     */
    twoColorRadialGradientBackground(inputs: Inputs.BabylonScene.SceneTwoColorRadialGradientDto): { backgroundImage: string } {
        this.context.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        const canvas = this.context.scene.getEngine().getRenderingCanvas();
        const gradient = `radial-gradient(${inputs.shape} at ${inputs.position}, ${inputs.colorFrom} ${inputs.stopFrom}%, ${inputs.colorTo} ${inputs.stopTo}%)`;
        const styleObject = { backgroundImage: gradient };
        if (canvas) {
            canvas.style.backgroundImage = gradient;
        }
        return styleObject;
    }

    /**
     * Paints a straight gradient through several colors behind the scene, each at its own stop
     * percentage; `colors` and `stops` must be the same length, or an error object comes back
     * instead.
     * @param inputs - The colors, their stops and the direction
     * @returns The style that was applied, or an error message when the lists differ in length
     * @group background
     * @shortname multi color linear gradient
     * @example
     * ```typescript
     * bitbybit.babylon.scene.multiColorLinearGradientBackground({ colors: ["#1a1c1f", "#4a5a7a", "#93aacd"], stops: [0, 50, 100], direction: Bit.Inputs.Base.gradientDirectionEnum.toTop });
     * ```
     */
    multiColorLinearGradientBackground(inputs: Inputs.BabylonScene.SceneMultiColorLinearGradientDto): { backgroundImage: string } | { error: string } {
        this.context.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        const canvas = this.context.scene.getEngine().getRenderingCanvas();
        if (inputs.colors.length !== inputs.stops.length) {
            const errorObj = { error: "Colors and stops arrays must have the same length" };
            console.warn(errorObj.error);
            return errorObj;
        }
        const colorStops = inputs.colors.map((color, index) => `${color} ${inputs.stops[index]}%`).join(", ");
        const gradient = `linear-gradient(${inputs.direction}, ${colorStops})`;
        const styleObject = { backgroundImage: gradient };
        if (canvas) {
            canvas.style.backgroundImage = gradient;
        }
        return styleObject;
    }

    /**
     * Paints a round gradient through several colors behind the scene, each at its own stop
     * percentage; `colors` and `stops` must be the same length, or an error object comes back
     * instead.
     * @param inputs - The colors, their stops, the center position and the shape
     * @returns The style that was applied, or an error message when the lists differ in length
     * @group background
     * @shortname multi color radial gradient
     * @example
     * ```typescript
     * bitbybit.babylon.scene.multiColorRadialGradientBackground({ colors: ["#1a1c1f", "#93aacd"], stops: [0, 100], position: Bit.Inputs.Base.gradientPositionEnum.center, shape: Bit.Inputs.Base.gradientShapeEnum.circle });
     * ```
     */
    multiColorRadialGradientBackground(inputs: Inputs.BabylonScene.SceneMultiColorRadialGradientDto): { backgroundImage: string } | { error: string } {
        this.context.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        const canvas = this.context.scene.getEngine().getRenderingCanvas();
        if (inputs.colors.length !== inputs.stops.length) {
            const errorObj = { error: "Colors and stops arrays must have the same length" };
            console.warn(errorObj.error);
            return errorObj;
        }
        const colorStops = inputs.colors.map((color, index) => `${color} ${inputs.stops[index]}%`).join(", ");
        const gradient = `radial-gradient(${inputs.shape} at ${inputs.position}, ${colorStops})`;
        const styleObject = { backgroundImage: gradient };
        if (canvas) {
            canvas.style.backgroundImage = gradient;
        }
        return styleObject;
    }

    /**
     * Shows an image behind the scene with the CSS background options for how it repeats, scales,
     * sits and scrolls; the scene's clear color becomes transparent so the image shows through.
     * @param inputs - The image URL and the repeat, size, position, attachment, origin and clip options
     * @returns The style that was applied
     * @group background
     * @shortname background image
     * @example
     * ```typescript
     * bitbybit.babylon.scene.canvasBackgroundImage({ imageUrl: "https://example.com/backdrop.jpg", repeat: Bit.Inputs.Base.backgroundRepeatEnum.noRepeat, size: Bit.Inputs.Base.backgroundSizeEnum.cover, position: Bit.Inputs.Base.gradientPositionEnum.center, attachment: Bit.Inputs.Base.backgroundAttachmentEnum.scroll, origin: Bit.Inputs.Base.backgroundOriginClipEnum.paddingBox, clip: Bit.Inputs.Base.backgroundOriginClipEnum.borderBox });
     * ```
     */
    canvasBackgroundImage(inputs: Inputs.BabylonScene.SceneCanvasBackgroundImageDto): {
        backgroundImage: string;
        backgroundRepeat: string;
        backgroundSize: string;
        backgroundPosition: string;
        backgroundAttachment: string;
        backgroundOrigin: string;
        backgroundClip: string;
    } {
        this.context.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        const canvas = this.context.scene.getEngine().getRenderingCanvas();
        const styleObject = {
            backgroundImage: `url(${inputs.imageUrl})`,
            backgroundRepeat: inputs.repeat,
            backgroundSize: inputs.size,
            backgroundPosition: inputs.position,
            backgroundAttachment: inputs.attachment,
            backgroundOrigin: inputs.origin,
            backgroundClip: inputs.clip
        };
        if (canvas) {
            canvas.style.backgroundImage = styleObject.backgroundImage;
            canvas.style.backgroundRepeat = styleObject.backgroundRepeat;
            canvas.style.backgroundSize = styleObject.backgroundSize;
            canvas.style.backgroundPosition = styleObject.backgroundPosition;
            canvas.style.backgroundAttachment = styleObject.backgroundAttachment;
            canvas.style.backgroundOrigin = styleObject.backgroundOrigin;
            canvas.style.backgroundClip = styleObject.backgroundClip;
        }
        return styleObject;
    }

    /**
     * Fills the background of the scene with one plain color and removes any canvas background
     * image or gradient set before.
     * @param inputs - The hex color
     * @group background
     * @shortname color
     * @example
     * ```typescript
     * bitbybit.babylon.scene.backgroundColour({ colour: "#1a1c1f" });
     * ```
     */
    backgroundColour(inputs: Inputs.BabylonScene.SceneBackgroundColourDto): void {
        this.context.scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(inputs.colour));
        const canvas = this.context.scene.getEngine().getRenderingCanvas();
        if (canvas) {
            canvas.style.backgroundImage = "none";
            canvas.style.backgroundRepeat = "repeat";
            canvas.style.backgroundSize = "auto";
            canvas.style.backgroundPosition = "0% 0%";
            canvas.style.backgroundAttachment = "scroll";
            canvas.style.backgroundOrigin = "padding-box";
            canvas.style.backgroundClip = "border-box";
        }
    }

    private getRadians(degrees: number): number {
        return BABYLON.Tools.ToRadians(degrees);
    }

    private createSkyboxMesh(texture: BABYLON.BaseTexture | undefined, size: number, blur: number, hideSkybox: boolean, environmentIntensity: number) {
        this.context.scene.getMeshByName("bitbybit-hdrSkyBox")?.dispose(false, true);
        const skybox = this.context.scene.createDefaultSkybox(texture, true, size, blur, true)!;
        skybox.name = "bitbybit-hdrSkyBox";
        if (hideSkybox) {
            skybox.isVisible = false;
        }
        this.context.scene.environmentIntensity = environmentIntensity;
    }

}
