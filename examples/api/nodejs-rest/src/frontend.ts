export function getHtml(): string {
    return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World Bitbybit CAD API</title>
    <link rel="icon" href="https://bitbybit.dev/favicon.png" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #1a1c1f; color: #f5ece6; font-family: 'Roboto', system-ui, sans-serif; overflow: hidden; }
        #header {
            position: fixed; top: 0; left: 0; right: 0; z-index: 20;
            display: flex; align-items: center; justify-content: center; gap: 12px;
            padding: 14px 24px;
            background: rgba(18, 19, 21, 0.85);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(240, 206, 187, 0.15);
        }
        #header img { width: 36px; height: 36px; }
        #header h1 {
            font-size: 18px; font-weight: 300;
            color: #F0CEBB;
            letter-spacing: 0.04em;
        }
        #overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
            z-index: 10; pointer-events: none;
        }
        #overlay.active { pointer-events: auto; }
        #overlay button {
            padding: 14px 32px; font-size: 16px; font-weight: 400;
            background: #F0CEBB; color: #1a1c1f; border: none; border-radius: 8px;
            cursor: pointer; transition: all 0.2s;
        }
        #overlay button:hover { background: #fff6f3; transform: scale(1.05); box-shadow: 0 0 20px rgba(240, 206, 187, 0.3); }
        #overlay button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        #batch-btn { background: transparent; color: #F0CEBB; border: 1px solid rgba(240, 206, 187, 0.4) !important; }
        #batch-btn:hover { background: rgba(240, 206, 187, 0.1); }
        #status { margin-top: 16px; font-size: 14px; font-weight: 300; min-height: 20px; text-align: center; color: #888; }
        #status.error { color: #ff6b6b; }
        canvas { display: block; width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div id="header">
        <img src="https://bitbybit.dev/logo-gold-small.png" alt="Bitbybit" />
        <h1>Hello World Bitbybit CAD API</h1>
    </div>
    <div id="overlay" class="active">
        <button id="generate-btn">Generate Dragon Cup</button>
        <button id="batch-btn">Generate Batch (3 Variations)</button>
        <div id="status"></div>
    </div>
    <canvas id="canvas"></canvas>

    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.175.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.175.0/examples/jsm/"
        }
    }
    </script>
    <script type="module">
        import * as THREE from "three";
        import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
        import { OrbitControls } from "three/addons/controls/OrbitControls.js";

        const canvas = document.getElementById("canvas");
        const btn = document.getElementById("generate-btn");
        const batchBtn = document.getElementById("batch-btn");
        const statusEl = document.getElementById("status");
        const overlay = document.getElementById("overlay");

        // Three.js setup
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1c1f);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(15, 12, 15);

        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lighting
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

        // Render loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        function loadGlb(url, offsetX) {
            statusEl.textContent = "Loading 3D model…";
            const loader = new GLTFLoader();
            loader.load(
                url,
                (gltf) => {
                    if (offsetX !== undefined) {
                        gltf.scene.position.x += offsetX;
                    }
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
                        center.z + maxDim * 1.5
                    );
                    controls.update();

                    // Apply clean white porcelain material
                    gltf.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.material = new THREE.MeshPhysicalMaterial({
                                color: 0xffffff,
                                metalness: 0.0,
                                roughness: 0.15,
                                clearcoat: 0.8,
                                clearcoatRoughness: 0.1,
                            });
                        }
                    });

                    overlay.remove();
                    statusEl.textContent = "";
                },
                (progress) => {
                    if (progress.total) {
                        const pct = Math.round((progress.loaded / progress.total) * 100);
                        statusEl.textContent = "Loading 3D model… " + pct + "%";
                    }
                },
                (err) => {
                    statusEl.className = "error";
                    statusEl.textContent = "Error loading model: " + err.message;
                    btn.disabled = false;
                }
            );
        }

        // Check URL for existing task on page load
        const params = new URLSearchParams(window.location.search);
        const existingTaskId = params.get("task");
        if (existingTaskId) {
            btn.disabled = true;
            statusEl.textContent = "Fetching existing task result…";
            fetch("/api/task/" + encodeURIComponent(existingTaskId))
                .then(r => r.json())
                .then(data => {
                    if (data.downloadUrl) {
                        loadGlb(data.downloadUrl);
                    } else if (data.status && data.status !== "completed") {
                        statusEl.textContent = "Task still " + data.status + " — click to regenerate.";
                        btn.disabled = false;
                    } else {
                        throw new Error(data.error || "Could not fetch result");
                    }
                })
                .catch(e => {
                    statusEl.className = "error";
                    statusEl.textContent = "Error: " + e.message;
                    btn.disabled = false;
                });
        }

        // Generate handler
        btn.addEventListener("click", async () => {
            btn.disabled = true;
            batchBtn.disabled = true;
            statusEl.className = "";
            statusEl.textContent = "Creating dragon cup — this may take a minute…";

            try {
                const res = await fetch("/api/generate", { method: "POST" });
                const data = await res.json();

                if (!res.ok || !data.downloadUrl) {
                    throw new Error(data.error || "Generation failed");
                }

                // Store task ID in URL for refresh
                if (data.taskId) {
                    const url = new URL(window.location);
                    url.searchParams.set("task", data.taskId);
                    window.history.replaceState({}, "", url);
                }

                loadGlb(data.downloadUrl);
            } catch (e) {
                statusEl.className = "error";
                statusEl.textContent = "Error: " + e.message;
                btn.disabled = false;
                batchBtn.disabled = false;
            }
        });

        // Batch generate handler
        batchBtn.addEventListener("click", async () => {
            btn.disabled = true;
            batchBtn.disabled = true;
            statusEl.className = "";
            statusEl.textContent = "Generating 3 dragon cup variations — this may take a minute…";

            try {
                const res = await fetch("/api/generate-batch", { method: "POST" });
                const data = await res.json();

                if (!res.ok || !data.downloadUrls || !data.downloadUrls.length) {
                    throw new Error(data.error || "Batch generation failed");
                }

                // Load all GLBs side by side with an offset
                const spacing = 15;
                const startX = -spacing * (data.downloadUrls.length - 1) / 2;
                data.downloadUrls.forEach((url, i) => {
                    loadGlb(url, startX + i * spacing);
                });
            } catch (e) {
                statusEl.className = "error";
                statusEl.textContent = "Error: " + e.message;
                btn.disabled = false;
                batchBtn.disabled = false;
            }
        });
    </script>
</body>
</html>`;
}
