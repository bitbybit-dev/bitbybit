import { useEffect, useRef, type ReactElement } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface ViewerProps {
    url: string | null;
    urls: string[] | null;
}

interface ViewerScene {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
}

const MODEL_SPACING = 15;

export function Viewer({ url, urls }: ViewerProps): ReactElement {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<ViewerScene | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1c1f);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(15, 12, 15);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
        fillLight.position.set(-10, 5, -10);
        scene.add(fillLight);

        const grid = new THREE.GridHelper(30, 30, 0x2e3136, 0x24272c);
        scene.add(grid);

        let animationId = 0;
        const animate = (): void => {
            animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        sceneRef.current = { scene, camera, renderer, controls };
        animate();

        const handleResize = (): void => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            container.removeChild(renderer.domElement);
            sceneRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!sceneRef.current) return;
        const { scene, camera, controls } = sceneRef.current;

        for (const group of scene.children.filter((child) => child.type === "Group")) scene.remove(group);

        const allUrls = urls ?? (url ? [url] : []);
        if (allUrls.length === 0) return;
        const startX = -MODEL_SPACING * (allUrls.length - 1) / 2;

        const show = async (modelUrl: string, index: number): Promise<void> => {
            const response = await fetch(`/api/proxy-download?url=${encodeURIComponent(modelUrl)}`);
            if (!response.ok) {
                console.error("[Viewer] proxy fetch failed:", response.status);
                return;
            }
            const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), "");
            if (allUrls.length > 1) gltf.scene.position.x += startX + index * MODEL_SPACING;

            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0xffffff,
                        metalness: 0.0,
                        roughness: 0.15,
                        clearcoat: 0.8,
                        clearcoatRoughness: 0.1,
                    });
                }
            });

            scene.add(gltf.scene);

            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            controls.target.copy(center);
            camera.position.set(center.x + maxDim * 1.5, center.y + maxDim, center.z + maxDim * 1.5);
            controls.update();
        };

        for (const [index, modelUrl] of allUrls.entries()) {
            show(modelUrl, index).catch((error: unknown) => {
                console.error("[Viewer] could not show", modelUrl, error);
            });
        }
    }, [url, urls]);

    return <div ref={containerRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1 }} />;
}
