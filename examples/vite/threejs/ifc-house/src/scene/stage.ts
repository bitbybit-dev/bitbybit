import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Inputs, initThreeJS } from "@bitbybit-dev/threejs";
import type { Stage } from "./scene-types";

const SKY = "#e7ebec";
const NARROW_SCREEN = 720;
const WIDE_PIVOT: Inputs.Base.Point3 = [8.4, 2.6, -4.6];
const NARROW_PIVOT: Inputs.Base.Point3 = [6.0, -3.0, -3.0];
const SUN_OFFSET = new THREE.Vector3(24, 30, 22);
const SHADOW_REACH = 26;

export function createStage(canvasId: string): Stage {
    const narrow = window.innerWidth < NARROW_SCREEN;
    const PIVOT = narrow ? NARROW_PIVOT : WIDE_PIVOT;
    const options = new Inputs.ThreeJSScene.InitThreeJSDto();
    options.canvasId = canvasId;
    options.sceneSize = 40;
    options.backgroundColor = SKY;
    options.enableGround = false;
    options.hemisphereLightSkyColor = "#f4f6f8";
    options.hemisphereLightGroundColor = "#a49c8c";
    options.hemisphereLightIntensity = 0.38;
    options.directionalLightColor = "#fff4e6";
    options.directionalLightIntensity = 3.1;
    options.shadowMapSize = 4096;
    const camera = new Inputs.ThreeJSCamera.OrbitCameraDto();
    camera.pivotPoint = PIVOT;
    camera.distance = narrow ? 52 : 26;
    camera.pitch = 14;
    camera.yaw = 32;
    camera.distanceMin = 4;
    camera.distanceMax = 120;
    camera.pitchAngleMin = 2;
    camera.pitchAngleMax = 88;
    options.orbitCameraOptions = camera;
    const { scene, renderer, directionalLight, orbitCamera, startAnimationLoop } = initThreeJS(options);
    if (!orbitCamera) {
        throw new Error("The scene was set up without its orbit camera");
    }

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.45;
    scene.fog = new THREE.Fog(SKY, 70, 190);

    const target = new THREE.Vector3(...PIVOT);
    directionalLight.position.copy(target).add(SUN_OFFSET);
    directionalLight.target.position.copy(target);
    const shadow = directionalLight.shadow.camera;
    shadow.left = -SHADOW_REACH;
    shadow.right = SHADOW_REACH;
    shadow.top = SHADOW_REACH;
    shadow.bottom = -SHADOW_REACH;
    shadow.far = 140;
    shadow.updateProjectionMatrix();
    directionalLight.shadow.bias = -0.0004;
    directionalLight.shadow.normalBias = 0.02;
    directionalLight.shadow.radius = 3;

    startAnimationLoop();
    return { scene, renderer, camera: orbitCamera.camera, orbit: orbitCamera };
}
