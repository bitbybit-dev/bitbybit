import {
    Application,
    Color,
    Entity,
    FILLMODE_FILL_WINDOW,
    Mouse,
    RESOLUTION_AUTO,
    StandardMaterial,
    TouchDevice,
} from "playcanvas";
import { type BitByBitBase, Inputs } from "@bitbybit-dev/playcanvas";
import type { Current } from "../models";

export function initPlayCanvas() {
    const canvas = document.getElementById("playcanvas") as HTMLCanvasElement;

    // Create a PlayCanvas application
    const app = new Application(canvas, {
        graphicsDeviceOptions: {
            antialias: true,
            alpha: false,
        },
        mouse: new Mouse(canvas),
        touch: new TouchDevice(canvas),
    });

    // Fill the window and automatically change resolution to be the same as the canvas size
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);

    // Ensure canvas is resized when window changes size
    window.addEventListener("resize", () => app.resizeCanvas());

    // Create root scene entity
    const scene = new Entity("scene");
    app.root.addChild(scene);

    // Create camera entity
    const camera = new Entity("camera");
    camera.addComponent("camera", {
        clearColor: new Color(0x1a / 255, 0x1c / 255, 0x1f / 255, 1),
        fov: 70,
        nearClip: 0.1,
        farClip: 1000,
    });
    camera.setPosition(10, 5, 120);
    scene.addChild(camera);

    // Set ambient lighting
    app.scene.ambientLight = new Color(0.4, 0.4, 0.4);

    // Start the application update loop
    app.start();

    return { app, scene, camera };
}

export function setupOrbitCamera(
    bitbybit: BitByBitBase,
    camera: Entity
) {
    const cameraOptions = new Inputs.PlayCanvasCamera.OrbitCameraDto();
    cameraOptions.distance = 125;
    cameraOptions.pitch = 24;
    cameraOptions.yaw = 27;
    cameraOptions.frameOnStart = false;
    cameraOptions.inertiaFactor = 0.2;
    cameraOptions.distanceSensitivity = 0.3;
    cameraOptions.focusEntity = camera;
    bitbybit.playcanvas.camera.orbitCamera.create(cameraOptions);
}

export function createDirLightsAndGround(scene: Entity, current: Current) {
    // Create directional light 1
    const dirLight = new Entity("directionalLight1");
    dirLight.addComponent("light", {
        type: "directional",
        color: new Color(1, 1, 1),
        intensity: 0.8,
        castShadows: true,
        shadowDistance: 300,
        shadowResolution: 2048,
        shadowBias: 0.2,
        normalOffsetBias: 0.02,
        shadowType: 1, // PCF shadow type for softer shadows
    });
    dirLight.setPosition(70, 25, -70);
    dirLight.lookAt(0, 0, 0);
    scene.addChild(dirLight);
    current.light1 = dirLight;

    // Create directional light 2 (fill light)
    const dirLight2 = new Entity("directionalLight2");
    dirLight2.addComponent("light", {
        type: "directional",
        color: new Color(1, 1, 1),
        intensity: 0.3,
    });
    dirLight2.setPosition(15, -40, -15);
    dirLight2.lookAt(0, 0, 0);
    scene.addChild(dirLight2);

    // Create ground plane
    const ground = new Entity("ground");
    ground.addComponent("render", {
        type: "plane",
    });
    ground.setLocalScale(740, 1, 740);
    ground.setPosition(0, 0, 0);

    // Create material for ground
    const material = new StandardMaterial();
    material.diffuse = new Color(0x44 / 255, 0x44 / 255, 0x44 / 255);
    material.update();
    if (ground.render) {
        ground.render.meshInstances[0].material = material;
    }

    current.ground = ground;
    scene.addChild(ground);
}
