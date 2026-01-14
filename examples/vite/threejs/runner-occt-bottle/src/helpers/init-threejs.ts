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
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function initThreeJS(canvasId = "myCanvas") {
    const domNode = document.getElementById(canvasId) as HTMLCanvasElement;

    const camera = new PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );
    const scene = new Scene();
    scene.background = new Color(0x1a1c1f);

    scene.fog = new Fog(0x1a1c1f, 30, 80);
    const light = new HemisphereLight(0xffffff, 0x444444, 2);
    scene.add(light);

    const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;

    camera.position.set(15, 12, 15);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.near = 0.1;
    camera.far = 200;
    camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.zoomSpeed = 0.5;
    controls.target.set(0, 4, 0);
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

    createDirLightsAndGround(scene);

    return { scene, camera, renderer };
}

function createDirLightsAndGround(scene: Scene) {
    const dirLight = new DirectionalLight(0xffffff, 3);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    const dist = 15;
    dirLight.shadow.camera.right = dist;
    dirLight.shadow.camera.left = -dist;
    dirLight.shadow.camera.top = dist;
    dirLight.shadow.camera.bottom = -dist;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.blurSamples = 3;
    dirLight.shadow.radius = 2;
    dirLight.shadow.bias = -0.0005;

    scene.add(dirLight);

    const dirLight2 = new DirectionalLight(0xffffff, 2);
    dirLight2.position.set(-5, 10, -5);
    dirLight2.shadow.camera.near = 0.5;
    dirLight2.shadow.camera.far = 50;
    dirLight2.shadow.camera.right = dist;
    dirLight2.shadow.camera.left = -dist;
    dirLight2.shadow.camera.top = dist;
    dirLight2.shadow.camera.bottom = -dist;

    scene.add(dirLight2);

    const material = new MeshPhongMaterial({ color: 0x444444 });
    material.shininess = 0;
    material.specular = new Color(0x222222);
    material.polygonOffset = true;
    material.polygonOffsetFactor = 10;
    const ground = new Mesh(new PlaneGeometry(50, 50, 1, 1), material);
    ground.rotateX(-Math.PI / 2);
    ground.receiveShadow = true;
    scene.add(ground);
}
