
import { BitByBitBase } from "@bitbybit-dev/threejs";
import { ManifoldStateEnum } from '@bitbybit-dev/manifold-worker';
import { Inputs } from '@bitbybit-dev/threejs';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Color, DirectionalLight, Fog, Group, HemisphereLight, Mesh, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, VSMShadowMap, WebGLRenderer } from 'three';
import { GUI } from 'lil-gui';

function component() {

    const showSpinner = () => {
        const element = document.createElement('div');
        element.id = "spinner";
        element.className = "lds-ellipsis";
        element.innerHTML = `
            <div></div>
            <div></div>
            <div></div>
        `;

        document.body.appendChild(
            element
        );
    }

    const hideSpinner = () => {
        const el = document.getElementById('spinner');
        if (el) {
            el.remove();
        }
    }

    let current: { group: Group | undefined, ground: Mesh | undefined, gui: GUI | undefined } = {
        group: undefined,
        ground: undefined,
        gui: undefined,
    };

    type Model = {
        sphereRadius: number,
        nrSubdivisions: number,
        color: string,
    }

    const model = {
        sphereRadius: 2,
        nrSubdivisions: 1,
        color: '#6600ff'
    } as Model;

    let manifoldsToClean: Inputs.Manifold.ManifoldPointer[] = [];
    let finalManifold: Inputs.Manifold.ManifoldPointer | undefined;
    let bitbybit: BitByBitBase | undefined;
    let scene: Scene | undefined;

    const rotateGroup = () => {
        if (current.group) {
            current.group.rotation.y += 0.005;
        }
    }

    const createShape = async (bitbybit?: BitByBitBase, scene?: Scene) => {
        if (scene && bitbybit) {
            if (manifoldsToClean.length > 0) {
                await bitbybit.manifold.deleteManifoldsOrCrossSections({ manifoldsOrCrossSections: manifoldsToClean });
            }

            const { manifold } = bitbybit.manifold;

            const sphereManifold = await bitbybit.manifold.manifold.shapes.sphere({
                radius: model.sphereRadius,
                circularSegments: 32,
            });

            // max has small tolerance so that strict steps would fit the interval till last item
            const span = bitbybit.vector.span({
                step: model.sphereRadius * 2 / (model.nrSubdivisions + 1),
                min: -model.sphereRadius,
                max: model.sphereRadius + 0.000001,
            });

            const slicedManifolds = await manifold.booleans.splitByPlaneOnOffsets({
                manifold: sphereManifold,
                normal: [1, 1, 0.3],
                originOffsets: span
            });

            const spanTranslations = bitbybit.vector.span({
                step: model.sphereRadius * 4 / slicedManifolds.length,
                min: 0,
                max: model.sphereRadius * 4 + 1,
            });

            const translatedManifoldPromises: Promise<Inputs.Manifold.ManifoldPointer>[] = [];
            slicedManifolds.forEach((s, i) => {
                const translated = manifold.transforms.translate({
                    manifold: s,
                    vector: [0, spanTranslations[i], 0]
                });
                translatedManifoldPromises.push(translated);
            });

            const translatedManifolds = await Promise.all(translatedManifoldPromises);
            finalManifold = await manifold.operations.compose({
                manifolds: translatedManifolds
            });

            manifoldsToClean = [sphereManifold, ...slicedManifolds, ...translatedManifolds, finalManifold];

            const options = new Inputs.Draw.DrawManifoldOrCrossSectionOptions();
            options.faceColour = "#6600ff";
            const group = await bitbybit.draw.drawAnyAsync({ entity: finalManifold, options });

            if (group) {
                group.children.forEach((child) => {
                    child.castShadow = true;
                    child.receiveShadow = true;
                });
            }
            current.group = group;

        }
    }

    const updateShape = async () => {
        showSpinner();
        disableGUI();
        current.group?.traverse((obj) => {
            scene?.remove(obj);
        });
        await createShape(bitbybit, scene);
        enableGUI();
        hideSpinner();
    }

    const init = async () => {
        showSpinner();
        bitbybit = new BitByBitBase();

        const domNode = document.getElementById('three-canvas') as HTMLCanvasElement;
        const manifold = new Worker(new URL('../manifold.worker', import.meta.url), { name: 'MANIFOLD', type: 'module' });

        const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
        scene = new Scene();
        scene.fog = new Fog(0x1a1c1f, 15, 60);
        const light = new HemisphereLight(0xffffff, 0x000000, 10);
        scene.add(light);
        await bitbybit.init(scene, undefined, undefined, manifold);

        const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio / 1.5)
        const animation = (time: number) => {
            renderer.render(scene, camera);
            rotateGroup();
            controls.update();
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        camera.position.set(10, 5, 10);

        controls.update();
        controls.target = new Vector3(0, 5, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1
        controls.zoomSpeed = 0.1;

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = VSMShadowMap;

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener("resize", onWindowResize, false);

        renderer.setClearColor(new Color(0x1a1c1f), 1);

        const dirLight = new DirectionalLight(0xffffff, 30);
        dirLight.position.set(30, 50, -30);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0;
        dirLight.shadow.camera.far = 200;
        const dist = 15;
        dirLight.shadow.camera.right = dist;
        dirLight.shadow.camera.left = - dist;
        dirLight.shadow.camera.top = dist;
        dirLight.shadow.camera.bottom = - dist;
        dirLight.shadow.mapSize.width = 3000;
        dirLight.shadow.mapSize.height = 3000;
        dirLight.shadow.blurSamples = 8;
        dirLight.shadow.radius = 2;
        dirLight.shadow.bias = -0.0005;

        scene.add(dirLight);

        const material = new MeshPhongMaterial({ color: 0x3300ff })
        material.shininess = 0;
        material.specular = new Color(0x222222);
        const ground = new Mesh(new PlaneGeometry(20, 20, 1, 1), material);
        ground.position.y = -2;
        ground.rotateX(-Math.PI / 2);
        ground.receiveShadow = true;
        current.ground = ground;
        scene.add(ground);

        bitbybit.manifoldWorkerManager.manifoldWorkerState$.subscribe(async s => {
            if (s.state === ManifoldStateEnum.initialised) {
                await createShape(bitbybit, scene);

                renderer.setAnimationLoop(animation);

                createGui();
                hideSpinner();
            }
        });

    }

    const disableGUI = () => {
        const lilGui = document.getElementsByClassName('lil-gui')[0] as HTMLElement;
        lilGui.style.pointerEvents = "none";
        lilGui.style.opacity = "0.5";
    }

    const enableGUI = () => {
        const lilGui = document.getElementsByClassName('lil-gui')[0] as HTMLElement;
        lilGui.style.pointerEvents = "all";
        lilGui.style.opacity = "1";
    }

    const createGui = () => {

        const gui = new GUI();
        current.gui = gui;
        gui.$title.innerHTML = "Pattern";

        gui
            .add(model, "sphereRadius", 1, 3, 0.01)
            .name("Sphere Radius")
            .onFinishChange((value: number) => {
                model.sphereRadius = value;
                updateShape();
            });

        gui
            .add(model, "nrSubdivisions", 1, 32, 1)
            .name("Nr Subdivisions")
            .onFinishChange((value: number) => {
                model.nrSubdivisions = value;
                updateShape();
            });

        gui
            .addColor(model, "color")
            .name("Color")
            .onChange((value: string) => {
                if (current && current.group) {
                    const children = current.group?.children[0].children as Mesh[];
                    [...children, current.ground].forEach((child) => {
                        const material = (child as Mesh).material as MeshPhongMaterial;
                        material.color.setHex(parseInt(value.replace('#', '0x')));
                    });
                }
            })
    }

    init();

}

component();