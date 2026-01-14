import * as BABYLON from "@babylonjs/core";
import { BabylonJSScene, InitBabylonJSResult } from "../../inputs/babylon-scene-helper-inputs";
import { BabylonCamera } from "../../inputs/babylon-camera-inputs";

/**
 * Helper function to initialize a basic BabylonJS scene with lights, shadows, and optional ground plane.
 * This provides a quick setup for common use cases while remaining fully customizable.
 * 
 * @param inputs Configuration options for the scene
 * @returns Object containing the scene, engine, lights, ground, and dispose function
 * 
 * @example
 * import { initBabylonJS, BabylonJSScene } from "@bitbybit-dev/babylonjs";
 * 
 * // Basic usage with defaults
 * const { scene, engine } = initBabylonJS();
 * 
 * // Custom configuration
 * const options = new BabylonJSScene.InitBabylonJSDto();
 * options.sceneSize = 500;
 * options.enableGround = true;
 * options.enableShadows = true;
 * const { scene, engine, directionalLight } = initBabylonJS(options);
 */
export function initBabylonJS(inputs?: BabylonJSScene.InitBabylonJSDto): InitBabylonJSResult {
    const config = inputs || new BabylonJSScene.InitBabylonJSDto();

    // Get or create canvas
    let canvas: HTMLCanvasElement;
    if (config.canvasId) {
        const existingCanvas = document.getElementById(config.canvasId) as HTMLCanvasElement;
        if (!existingCanvas) {
            throw new Error(`Canvas with id "${config.canvasId}" not found`);
        }
        canvas = existingCanvas;
    } else {
        canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        document.body.appendChild(canvas);
    }

    // Create engine
    const engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
    });
    engine.setHardwareScalingLevel(0.5);
    // Create scene
    const scene = new BABYLON.Scene(engine);
    scene.metadata = { shadowGenerators: [] }; // Important for Bitbybit integration
    
    // Parse background color
    const bgColor = BABYLON.Color3.FromHexString(config.backgroundColor);
    scene.clearColor = new BABYLON.Color4(bgColor.r, bgColor.g, bgColor.b, 1);

    // Calculate positions based on scene size
    const lightHeight = config.sceneSize * 0.75;
    const lightOffset = config.sceneSize * 0.5;

    // Create hemispheric light (ambient-like lighting from sky and ground)
    const hemisphericLight = new BABYLON.HemisphericLight(
        "hemisphericLight",
        new BABYLON.Vector3(0, lightHeight, 0),
        scene
    );
    hemisphericLight.diffuse = BABYLON.Color3.FromHexString(config.hemisphereLightSkyColor);
    hemisphericLight.groundColor = BABYLON.Color3.FromHexString(config.hemisphereLightGroundColor);
    hemisphericLight.intensity = config.hemisphereLightIntensity;

    // Create directional light (sun-like light with shadows)
    const directionalLight = new BABYLON.DirectionalLight(
        "directionalLight",
        new BABYLON.Vector3(-lightOffset, -lightHeight, -lightOffset).normalize(),
        scene
    );
    directionalLight.diffuse = BABYLON.Color3.FromHexString(config.directionalLightColor);
    directionalLight.intensity = config.directionalLightIntensity;
    directionalLight.position = new BABYLON.Vector3(lightOffset, lightHeight, lightOffset);

    // Configure shadows
    if (config.enableShadows) {
        const shadowGenerator = new BABYLON.ShadowGenerator(config.shadowMapSize, directionalLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        shadowGenerator.darkness = 0.3;
        
        // Store shadow generator in scene metadata for Bitbybit integration
        scene.metadata.shadowGenerators.push(shadowGenerator);
    }

    // Create ground plane
    let ground: BABYLON.Mesh | null = null;
    if (config.enableGround) {
        const groundSize = config.sceneSize * config.groundScaleFactor;
        ground = BABYLON.MeshBuilder.CreateGround("ground", {
            width: groundSize,
            height: groundSize
        }, scene);
        
        ground.position = new BABYLON.Vector3(
            config.groundCenter[0],
            config.groundCenter[1],
            config.groundCenter[2]
        );
        
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseColor = BABYLON.Color3.FromHexString(config.groundColor);
        groundMaterial.alpha = config.groundOpacity;
        groundMaterial.backFaceCulling = false;
        ground.material = groundMaterial;
        ground.receiveShadows = config.enableShadows;
    }

    // Create arc rotate camera if enabled
    let arcRotateCamera: BABYLON.ArcRotateCamera | null = null;
    if (config.enableArcRotateCamera) {
        // Use provided camera options or create new DTO with defaults as single source of truth
        const camOpts = config.arcRotateCameraOptions ?? new BabylonCamera.ArcRotateCameraDto();
        
        // Compute scene-aware overrides for values that should scale with scene size
        // Reference scene size of 20 units is used as baseline for sensitivity calculations
        const referenceSize = 20;
        const sizeRatio = config.sceneSize / referenceSize;
        
        // Only override these values if user didn't provide custom camera options
        const userProvidedCameraOptions = config.arcRotateCameraOptions !== undefined;
        const effectiveRadius = userProvidedCameraOptions ? camOpts.radius : config.sceneSize * Math.sqrt(2);
        const effectiveLowerRadiusLimit = userProvidedCameraOptions && camOpts.lowerRadiusLimit !== undefined ? camOpts.lowerRadiusLimit : config.sceneSize * 0.1;
        const effectiveUpperRadiusLimit = userProvidedCameraOptions && camOpts.upperRadiusLimit !== undefined ? camOpts.upperRadiusLimit : config.sceneSize * 10;
        const effectivePanningSensibility = userProvidedCameraOptions ? camOpts.panningSensibility : camOpts.panningSensibility / sizeRatio;
        const effectiveWheelPrecision = userProvidedCameraOptions ? camOpts.wheelPrecision : Math.max(0.1, camOpts.wheelPrecision / sizeRatio);
        const effectiveMaxZ = userProvidedCameraOptions && camOpts.maxZ !== undefined ? camOpts.maxZ : config.sceneSize * 50;
        
        const target = new BABYLON.Vector3(camOpts.target[0], camOpts.target[1], camOpts.target[2]);
        const alphaRad = BABYLON.Tools.ToRadians(camOpts.alpha);
        const betaRad = BABYLON.Tools.ToRadians(camOpts.beta);
        
        arcRotateCamera = new BABYLON.ArcRotateCamera(
            "arcRotateCamera",
            alphaRad,
            betaRad,
            effectiveRadius,
            target,
            scene
        );
        
        // Apply all settings from DTO, with scene-aware overrides where applicable
        arcRotateCamera.angularSensibilityX = camOpts.angularSensibilityX;
        arcRotateCamera.angularSensibilityY = camOpts.angularSensibilityY;
        arcRotateCamera.lowerRadiusLimit = effectiveLowerRadiusLimit;
        arcRotateCamera.upperRadiusLimit = effectiveUpperRadiusLimit;
        arcRotateCamera.panningSensibility = effectivePanningSensibility;
        arcRotateCamera.wheelPrecision = effectiveWheelPrecision;
        arcRotateCamera.maxZ = effectiveMaxZ;
        arcRotateCamera.minZ = 0.1;
        
        // Apply beta limits from DTO
        arcRotateCamera.lowerBetaLimit = BABYLON.Tools.ToRadians(camOpts.lowerBetaLimit);
        arcRotateCamera.upperBetaLimit = BABYLON.Tools.ToRadians(camOpts.upperBetaLimit);
        
        // Apply optional alpha limits only if user provided them
        if (userProvidedCameraOptions && camOpts.lowerAlphaLimit !== undefined) {
            arcRotateCamera.lowerAlphaLimit = BABYLON.Tools.ToRadians(camOpts.lowerAlphaLimit);
        }
        if (userProvidedCameraOptions && camOpts.upperAlphaLimit !== undefined) {
            arcRotateCamera.upperAlphaLimit = BABYLON.Tools.ToRadians(camOpts.upperAlphaLimit);
        }
        
        arcRotateCamera.attachControl(canvas, true);
    }

    // Handle window resize
    const onWindowResize = (): void => {
        engine.resize();
    };

    window.addEventListener("resize", onWindowResize, false);

    // Start render loop helper
    const startRenderLoop = (onRender?: () => void): void => {
        engine.runRenderLoop(() => {
            if (scene.activeCamera) {
                scene.render();
                if (onRender) {
                    onRender();
                }
            }
        });
    };

    // Dispose function to clean up resources
    const dispose = (): void => {
        window.removeEventListener("resize", onWindowResize);
        engine.stopRenderLoop();
        
        if (ground) {
            ground.material?.dispose();
            ground.dispose();
        }
        
        hemisphericLight.dispose();
        directionalLight.dispose();
        
        if (arcRotateCamera) {
            arcRotateCamera.dispose();
        }
        
        scene.dispose();
        engine.dispose();
        
        // Remove canvas if we created it
        if (!config.canvasId && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    };

    return {
        scene,
        engine,
        hemisphericLight,
        directionalLight,
        ground,
        arcRotateCamera,
        startRenderLoop,
        dispose
    };
}
