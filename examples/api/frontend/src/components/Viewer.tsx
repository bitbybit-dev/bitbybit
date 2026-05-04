import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface ViewerProps {
    url: string | null;
    urls: string[] | null;
}

export function Viewer({ url, urls }: ViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        controls: OrbitControls;
        animationId: number;
    } | null>(null);

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

        // Lighting — matches old working frontend
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
        fillLight.position.set(-10, 5, -10);
        scene.add(fillLight);

        // Grid
        const grid = new THREE.GridHelper(30, 30, 0x2e3136, 0x24272c);
        scene.add(grid);

        const animate = () => {
            sceneRef.current!.animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        sceneRef.current = { scene, camera, renderer, controls, animationId: 0 };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(sceneRef.current!.animationId);
            renderer.dispose();
            container.removeChild(renderer.domElement);
            sceneRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!sceneRef.current) return;
        const { scene, camera, controls } = sceneRef.current;

        // Clear existing models (keep lights and grid)
        const toRemove = scene.children.filter((c) => c.type === "Group");
        toRemove.forEach((c) => scene.remove(c));

        const allUrls = urls ?? (url ? [url] : []);
        if (allUrls.length === 0) return;

        allUrls.forEach(async (modelUrl, i) => {
            try {
                const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(modelUrl)}`;
                const res = await fetch(proxyUrl);
                if (!res.ok) {
                    console.error("[Viewer] proxy fetch failed:", res.status);
                    return;
                }
                const buffer = await res.arrayBuffer();

                const loader = new GLTFLoader();
                loader.parse(
                    buffer,
                    "",
                    (gltf) => {
                        // Offset models side-by-side when loading multiple
                        if (allUrls.length > 1) {
                            const spacing = 15;
                            const startX = -spacing * (allUrls.length - 1) / 2;
                            gltf.scene.position.x += startX + i * spacing;
                        }

                        // Apply porcelain material
                        gltf.scene.traverse((child) => {
                            if ((child as THREE.Mesh).isMesh) {
                                (child as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({
                                    color: 0xffffff,
                                    metalness: 0.0,
                                    roughness: 0.15,
                                    clearcoat: 0.8,
                                    clearcoatRoughness: 0.1,
                                });
                            }
                        });

                        scene.add(gltf.scene);

                        // Fit camera to model
                        const box = new THREE.Box3().setFromObject(gltf.scene);
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.y, size.z);

                        controls.target.copy(center);
                        camera.position.set(
                            center.x + maxDim * 1.5,
                            center.y + maxDim,
                            center.z + maxDim * 1.5,
                        );
                        controls.update();
                    },
                    (err) => {
                        console.error("[Viewer] GLTFLoader.parse error:", err);
                    },
                );
            } catch (err) {
                console.error("[Viewer] fetch error for:", modelUrl, err);
            }
        });
    }, [url, urls]);

    return <div ref={containerRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1 }} />;
}
