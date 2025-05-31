import {
    Color,
    DirectionalLight,
    Fog,
    HemisphereLight,
    Mesh,
    MeshPhongMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    VSMShadowMap,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import type { Current } from "../models";

export function initThreeJS() {
    const domNode = document.getElementById("three-canvas") as HTMLCanvasElement;

    const camera = new PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1, // Adjusted near plane for typical scenes
        1000
    );
    const scene = new Scene();
    scene.background = new Color(0x1a1c1f); // Set background color

    scene.fog = new Fog(0x1a1c1f, 150, 230);
    const light = new HemisphereLight(0xffffff, 0x444444, 2); // Adjusted intensity
    scene.add(light);

    const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio / 1.5); // Consider devicePixelRatio for sharpness
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;

    camera.position.set(10, 5, 120);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.near = 3;
    camera.far = 1000;
    camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.zoomSpeed = 0.1;
    controls.target.set(0, 0, 0);
    controls.update();

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize, false);

    const animate = () => {
        controls.update(); // Important for damping
        renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    return { scene, camera, renderer }; // Return renderer and camera if needed elsewhere
}

export function createDirLightsAndGround(scene: Scene, current: Current) {
    const dirLight = new DirectionalLight(0xffffff, 3);
    dirLight.position.set(70, 25, -70);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 3;
    dirLight.shadow.camera.far = 300;
    const dist = 100;
    dirLight.shadow.camera.right = dist;
    dirLight.shadow.camera.left = -dist;
    dirLight.shadow.camera.top = dist;
    dirLight.shadow.camera.bottom = -dist;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.blurSamples = 3;
    dirLight.shadow.radius = 2;
    dirLight.shadow.bias = -0.0005;

    scene?.add(dirLight);
    current.light1 = dirLight;

    const dirLight2 = new DirectionalLight(0xffffff, 2);
    dirLight2.position.set(15, -40, -15);
    dirLight2.shadow.camera.near = 3;
    dirLight2.shadow.camera.far = 300;
    dirLight2.shadow.camera.right = dist;
    dirLight2.shadow.camera.left = -dist;
    dirLight2.shadow.camera.top = dist;
    dirLight2.shadow.camera.bottom = -dist;

    scene?.add(dirLight2);

    const material = new MeshPhongMaterial({ color: 0x444444 });
    material.shininess = 0;
    material.specular = new Color(0x222222);
    material.polygonOffset = true;
    material.polygonOffsetFactor = 10;
    const ground = new Mesh(new PlaneGeometry(740, 740, 1, 1), material);
    ground.rotateX(-Math.PI / 2);
    ground.receiveShadow = true;
    current.ground = ground;
    scene?.add(ground);
}
