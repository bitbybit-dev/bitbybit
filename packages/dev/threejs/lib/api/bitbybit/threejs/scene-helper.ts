import * as THREEJS from "three";
import { ThreeJSScene, InitThreeJSResult } from "../../inputs/threejs-scene-inputs";
import { OrbitCameraController, ThreeJSCamera } from "../../inputs/threejs-camera-inputs";
import { createOrbitCamera } from "./orbit-camera";

const SIXTY_HZ_FRAMES_PER_SECOND = 60;
const FIRST_FRAME_DELTA_SECONDS = 1 / SIXTY_HZ_FRAMES_PER_SECOND;
const MAX_FRAME_DELTA_SECONDS = 6 / SIXTY_HZ_FRAMES_PER_SECOND;

function frameDeltaSeconds(previousFrameTimeMs: number | undefined, frameTimeMs: number): number {
    if (previousFrameTimeMs === undefined) {
        return FIRST_FRAME_DELTA_SECONDS;
    }
    const measuredSeconds = (frameTimeMs - previousFrameTimeMs) / 1000;
    if (!Number.isFinite(measuredSeconds) || measuredSeconds <= 0) {
        return FIRST_FRAME_DELTA_SECONDS;
    }
    return Math.min(measuredSeconds, MAX_FRAME_DELTA_SECONDS);
}

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

    const scene = new THREEJS.Scene();
    scene.background = new THREEJS.Color(config.backgroundColor);

    const lightHeight = config.sceneSize * 0.75;
    const lightOffset = config.sceneSize * 0.5;

    const hemisphereLight = new THREEJS.HemisphereLight(
        new THREEJS.Color(config.hemisphereLightSkyColor),
        new THREEJS.Color(config.hemisphereLightGroundColor),
        config.hemisphereLightIntensity
    );
    hemisphereLight.position.set(0, lightHeight, 0);
    scene.add(hemisphereLight);

    const directionalLight = new THREEJS.DirectionalLight(
        new THREEJS.Color(config.directionalLightColor),
        config.directionalLightIntensity
    );
    directionalLight.position.set(lightOffset, lightHeight, lightOffset);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    const renderer = new THREEJS.WebGLRenderer({
        antialias: true,
        canvas: canvas
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    if (config.enableShadows) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREEJS.VSMShadowMap;

        directionalLight.castShadow = true;

        const shadowCameraSize = config.sceneSize * config.groundScaleFactor;
        directionalLight.shadow.camera.left = -shadowCameraSize / 2;
        directionalLight.shadow.camera.right = shadowCameraSize / 2;
        directionalLight.shadow.camera.top = shadowCameraSize / 2;
        directionalLight.shadow.camera.bottom = -shadowCameraSize / 2;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = config.sceneSize * 3;

        directionalLight.shadow.mapSize.width = config.shadowMapSize;
        directionalLight.shadow.mapSize.height = config.shadowMapSize;
        
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.blurSamples = 8;
        
        const shadowCameraSizeComputed = config.sceneSize * config.groundScaleFactor;
        directionalLight.shadow.bias = -0.0001 * (shadowCameraSizeComputed / 40);
        directionalLight.shadow.normalBias = 0.01 * (shadowCameraSizeComputed / 40);
    }

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
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(
            config.groundCenter[0],
            config.groundCenter[1],
            config.groundCenter[2]
        );
        ground.receiveShadow = config.enableShadows;
        scene.add(ground);
    }

    let orbitCamera: OrbitCameraController | null = null;
    if (config.enableOrbitCamera) {
        const camOpts = config.orbitCameraOptions ?? new ThreeJSCamera.OrbitCameraDto();
        
        const referenceSize = 20;
        const sizeRatio = config.sceneSize / referenceSize;
        
        const userProvidedCameraOptions = config.orbitCameraOptions !== undefined;
        const effectiveDistance = userProvidedCameraOptions ? camOpts.distance : config.sceneSize * Math.sqrt(2);
        const effectiveDistanceMin = userProvidedCameraOptions ? camOpts.distanceMin : config.sceneSize * 0.05;
        const effectiveDistanceMax = userProvidedCameraOptions ? camOpts.distanceMax : config.sceneSize * 10;
        const effectiveDistanceSensitivity = userProvidedCameraOptions ? camOpts.distanceSensitivity : camOpts.distanceSensitivity * sizeRatio;
        const effectivePanSensitivity = userProvidedCameraOptions ? camOpts.panSensitivity : camOpts.panSensitivity * sizeRatio;
        
        orbitCamera = createOrbitCamera({
            pivotPoint: camOpts.pivotPoint,
            distance: effectiveDistance,
            pitch: camOpts.pitch,
            yaw: camOpts.yaw,
            distanceMin: effectiveDistanceMin,
            distanceMax: effectiveDistanceMax,
            pitchAngleMin: camOpts.pitchAngleMin,
            pitchAngleMax: camOpts.pitchAngleMax,
            orbitSensitivity: camOpts.orbitSensitivity,
            distanceSensitivity: effectiveDistanceSensitivity,
            panSensitivity: effectivePanSensitivity,
            inertiaFactor: camOpts.inertiaFactor,
            autoRender: camOpts.autoRender,
            frameOnStart: camOpts.frameOnStart,
            enableDamping: camOpts.enableDamping,
            dampingFactor: camOpts.dampingFactor,
            scene,
            domElement: renderer.domElement,
        });
    }

    const onWindowResize = (): void => {
        if (orbitCamera) {
            orbitCamera.camera.aspect = window.innerWidth / window.innerHeight;
            orbitCamera.camera.updateProjectionMatrix();
        }
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize, false);

    const startAnimationLoop = (onRender?: (deltaTime: number) => void): void => {
        let previousFrameTimeMs: number | undefined = undefined;
        const animate = (frameTimeMs: number): void => {
            const deltaTime = frameDeltaSeconds(previousFrameTimeMs, frameTimeMs);
            previousFrameTimeMs = frameTimeMs;
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
