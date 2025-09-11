import {
    Color,
    HemisphereLight,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// --- 4. Three.js Scene Initialization ---
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

    const light = new HemisphereLight(0xffffff, 0x444444, 2); // Adjusted intensity
    scene.add(light);

    const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(window.devicePixelRatio); // Consider devicePixelRatio for sharpness

    camera.position.set(50, 50, 100); // Adjusted camera position
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05; // Smoother damping
    controls.target.set(0, 0, 0); // Ensure controls target the origin
    controls.update(); // Initial update

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
