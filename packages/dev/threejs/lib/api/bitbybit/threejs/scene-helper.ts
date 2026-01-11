import * as THREEJS from "three";
import { ThreeJSScene, InitThreeJSResult } from "../../inputs/threejs-scene-inputs";
import { OrbitCameraController } from "../../inputs/threejs-camera-inputs";
import { createOrbitCamera } from "./orbit-camera";

/**
 * Helper function to initialize a basic Three.js scene with lights, shadows, and optional ground plane.
 * This provides a quick setup for common use cases while remaining fully customizable.
 * 
 * @param inputs Configuration options for the scene
 * @returns Object containing the scene, renderer, lights, ground, and dispose function
 * 
 * @example
 * ```typescript
 * import { initThreeJS, ThreeJSScene } from "@bitbybit-dev/threejs";
 * 
 * // Basic usage with defaults
 * const { scene, renderer } = initThreeJS();
 * 
 * // Custom configuration
 * const options = new ThreeJSScene.InitThreeJSDto();
 * options.sceneSize = 500;
 * options.enableGround = true;
 * options.enableShadows = true;
 * const { scene, renderer, directionalLight } = initThreeJS(options);
 * ```
 */
export function initThreeJS(inputs?: ThreeJSScene.InitThreeJSDto): InitThreeJSResult {
    const config = inputs || new ThreeJSScene.InitThreeJSDto();

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

    // Create scene
    const scene = new THREEJS.Scene();
    scene.background = new THREEJS.Color(config.backgroundColor);

    // Calculate positions based on scene size
    const lightHeight = config.sceneSize * 0.75;
    const lightOffset = config.sceneSize * 0.5;

    // Create hemisphere light (ambient-like lighting from sky and ground)
    const hemisphereLight = new THREEJS.HemisphereLight(
        new THREEJS.Color(config.hemisphereLightSkyColor),
        new THREEJS.Color(config.hemisphereLightGroundColor),
        config.hemisphereLightIntensity
    );
    hemisphereLight.position.set(0, lightHeight, 0);
    scene.add(hemisphereLight);

    // Create directional light (sun-like light with shadows)
    const directionalLight = new THREEJS.DirectionalLight(
        new THREEJS.Color(config.directionalLightColor),
        config.directionalLightIntensity
    );
    directionalLight.position.set(lightOffset, lightHeight, lightOffset);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    // Create renderer
    const renderer = new THREEJS.WebGLRenderer({
        antialias: true,
        canvas: canvas
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Configure shadows
    if (config.enableShadows) {
        renderer.shadowMap.enabled = true;
        // Use VSM for softer, more natural-looking shadows
        renderer.shadowMap.type = THREEJS.VSMShadowMap;

        directionalLight.castShadow = true;

        // Configure shadow camera based on scene size
        const shadowCameraSize = config.sceneSize * config.groundScaleFactor;
        directionalLight.shadow.camera.left = -shadowCameraSize / 2;
        directionalLight.shadow.camera.right = shadowCameraSize / 2;
        directionalLight.shadow.camera.top = shadowCameraSize / 2;
        directionalLight.shadow.camera.bottom = -shadowCameraSize / 2;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = config.sceneSize * 3;

        directionalLight.shadow.mapSize.width = config.shadowMapSize;
        directionalLight.shadow.mapSize.height = config.shadowMapSize;
        
        // VSM shadow map settings for soft shadows
        // Radius controls the blur amount - higher values = softer shadows
        directionalLight.shadow.radius = 4;
        // Blur samples for VSM - more samples = smoother but slower
        directionalLight.shadow.blurSamples = 8;
        
        // Compute shadow bias values based on scene size for optimal results
        // VSM requires smaller bias values than PCF
        const shadowCameraSizeComputed = config.sceneSize * config.groundScaleFactor;
        directionalLight.shadow.bias = -0.0001 * (shadowCameraSizeComputed / 40);
        directionalLight.shadow.normalBias = 0.01 * (shadowCameraSizeComputed / 40);
    }

    // Create ground plane
    let ground: THREEJS.Mesh | null = null;
    if (config.enableGround) {
        const groundSize = config.sceneSize * config.groundScaleFactor;
        const groundGeometry = new THREEJS.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREEJS.MeshStandardMaterial({
            color: new THREEJS.Color(config.groundColor),
            roughness: 0.8,
            metalness: 0.2,
            transparent: config.groundOpacity < 1,
            opacity: config.groundOpacity,
            side: THREEJS.DoubleSide
        });
        ground = new THREEJS.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.position.set(
            config.groundCenter[0],
            config.groundCenter[1],
            config.groundCenter[2]
        );
        ground.receiveShadow = config.enableShadows;
        scene.add(ground);
    }

    // Create orbit camera if enabled
    let orbitCamera: OrbitCameraController | null = null;
    if (config.enableOrbitCamera) {
        const camOpts = config.orbitCameraOptions;
        // Pass the DTO directly to createOrbitCamera, adding scene and domElement
        orbitCamera = createOrbitCamera({
            ...camOpts,
            scene,
            domElement: renderer.domElement,
        });
    }

    // Handle window resize
    const onWindowResize = (): void => {
        if (orbitCamera) {
            orbitCamera.camera.aspect = window.innerWidth / window.innerHeight;
            orbitCamera.camera.updateProjectionMatrix();
        }
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize, false);

    // Start animation loop helper
    const startAnimationLoop = (onRender?: (deltaTime: number) => void): void => {
        const animate = (): void => {
            const deltaTime = 0.016; // ~60fps
            if (orbitCamera) {
                orbitCamera.update(deltaTime);
                renderer.render(scene, orbitCamera.camera);
            }
            if (onRender) {
                onRender(deltaTime);
            }
        };
        renderer.setAnimationLoop(animate);
    };

    // Dispose function to clean up resources
    const dispose = (): void => {
        window.removeEventListener("resize", onWindowResize);
        renderer.setAnimationLoop(null);
        
        if (orbitCamera) {
            orbitCamera.destroy();
        }
        
        if (ground) {
            ground.geometry.dispose();
            (ground.material as THREEJS.Material).dispose();
            scene.remove(ground);
        }
        
        scene.remove(hemisphereLight);
        scene.remove(directionalLight);
        scene.remove(directionalLight.target);
        
        renderer.dispose();
        
        // Remove canvas if we created it
        if (!config.canvasId && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    };

    return {
        scene,
        renderer,
        hemisphereLight,
        directionalLight,
        ground,
        orbitCamera,
        startAnimationLoop,
        dispose
    };
}
