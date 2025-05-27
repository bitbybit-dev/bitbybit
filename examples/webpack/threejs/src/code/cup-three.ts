
import { BitByBitBase } from "@bitbybit-dev/threejs";
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { Inputs } from '@bitbybit-dev/threejs';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
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
        cupHeight: number,
        cupRadius: number,
        cupThickness: number,
        cupHandleDistance: number,
        cupHandleHeight: number,
        color: string,
        downloadSTL?: () => void,
        downloadStep?: () => void
    }


    const model = {
        cupHeight: 13,
        cupRadius: 4.5,
        cupThickness: 1,
        cupHandleDistance: 2,
        cupHandleHeight: 0.5,
        color: '#000000',
    } as Model;

    let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];
    let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
    let bitbybit: BitByBitBase | undefined;
    let scene: Scene | undefined;

    const rotateGroup = () => {
        if (current.group) {
            current.group.rotation.y -= 0.01;
        }
    }

    const createShape = async (bitbybit?: BitByBitBase, scene?: Scene) => {
        if (scene && bitbybit) {
            if (shapesToClean.length > 0) {
                await bitbybit.occt.deleteShapes({ shapes: shapesToClean });
            }

            const faceColour = '#444444';

            const roundingRadius = model.cupThickness / 3;
            const cupHolderLength = 2;
            const cupHolderThickness = model.cupThickness * 1.5;
            const cupHolderHeight = bitbybit.math.remap(
                {
                    number: model.cupHandleHeight,
                    fromLow: 0,
                    fromHigh: 1,
                    toLow: cupHolderThickness * 2 + roundingRadius * 2.5,
                    toHigh: (model.cupHeight - model.cupThickness * 2)
                }
            )
            // .mapRange(model.cupHandleHeight, 0, 1, cupHolderThickness * 2 + roundingRadius * 2.5, (model.cupHeight - model.cupThickness * 2));

            const cupHolderWidth = model.cupHandleDistance + model.cupThickness * 2;
            const edgeColour = "#ffffff";

            const box = await bitbybit.occt.shapes.solid.createBox({
                width: cupHolderWidth * 2,
                height: cupHolderHeight,
                length: cupHolderLength,
                center: [model.cupRadius, model.cupHeight / 2, 0]
            });

            const boxInside = await bitbybit.occt.shapes.solid.createBox({
                width: (cupHolderWidth * 2) - (cupHolderThickness * 2),
                height: cupHolderHeight - (cupHolderThickness * 2),
                length: cupHolderLength * 1.2,
                center: [model.cupRadius, model.cupHeight / 2, 0]
            });


            const boolHolder = await bitbybit.occt.booleans.difference({
                shape: box,
                shapes: [boxInside],
                keepEdges: false
            });

            const cylinder = await bitbybit.occt.shapes.solid.createCylinder({
                center: [0, 0, 0],
                radius: model.cupRadius,
                height: model.cupHeight
            });

            const baseUnion = await bitbybit.occt.booleans.union({
                shapes: [cylinder, boolHolder],
                keepEdges: false
            });

            const cylinderInside = await bitbybit.occt.shapes.solid.createCylinder({
                center: [0, model.cupThickness, 0],
                radius: model.cupRadius - model.cupThickness,
                height: model.cupHeight
            });

            const cupBase = await bitbybit.occt.booleans.difference({
                shape: baseUnion,
                shapes: [cylinderInside],
                keepEdges: false
            });

            finalShape = await bitbybit.occt.fillets.filletEdges({
                radius: roundingRadius,
                shape: cupBase
            });

            shapesToClean = [box, boxInside, boolHolder, cylinder, baseUnion, cylinderInside, cupBase, finalShape];

            const options = new Inputs.Draw.DrawOcctShapeOptions();
            options.faceColour = faceColour;
            options.faceOpacity = 1;
            options.edgeOpacity = 1;
            options.edgeWidth = 3;
            options.drawEdges = true;
            options.edgeColour = edgeColour;
            options.precision = 0.001;

            const mat = new MeshPhongMaterial({ color: new Color(model.color) });
            mat.polygonOffset = true;
            mat.polygonOffsetFactor = 3;
            options.faceMaterial = mat;

            const group = await bitbybit.draw.drawAnyAsync({ entity: finalShape, options });

            group.children[0].children.forEach((child) => {
                child.castShadow = true;
                child.receiveShadow = true;
            });

            current.group = group;
        }
    }

    const downloadStep = async () => {
        if (bitbybit && finalShape) {
            await bitbybit.occt.io.saveShapeSTEP({
                shape: finalShape,
                fileName: 'shape.stp',
                adjustYtoZ: true,
                tryDownload: true
            });
        }
    }

    const downloadSTL = () => {
        if (scene) {
            var exporter = new STLExporter();
            var str = exporter.parse(scene);
            var blob = new Blob([str], { type: 'text/plain' });
            var link = document.createElement('a');
            link.style.display = 'none';
            document.body.appendChild(link);
            link.href = URL.createObjectURL(blob);
            link.download = 'Scene.stl';
            link.click();
        }
    }

    model.downloadSTL = downloadSTL;
    model.downloadStep = downloadStep;

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
        const occt = new Worker(new URL('../occ.worker', import.meta.url), { name: 'OCC', type: 'module' });

        const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
        scene = new Scene();
        scene.fog = new Fog(0x1a1c1f, 15, 60);
        const light = new HemisphereLight(0xffffff, 0x000000, 10);
        scene.add(light);
        await bitbybit.init(scene, occt, undefined);

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
        camera.position.set(10, 20, 10);

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

        bitbybit.occtWorkerManager.occWorkerState$.subscribe(async s => {
            if (s.state === OccStateEnum.initialised) {
                await createShape(bitbybit, scene);

                renderer.setAnimationLoop(animation);

                const dirLight = new DirectionalLight(0xffffff, 50);
                dirLight.position.set(15, 40, -15);
                dirLight.castShadow = true;
                dirLight.shadow.camera.near = 0;
                dirLight.shadow.camera.far = 300;
                const dist = 100;
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

                const material = new MeshPhongMaterial({ color: 0x000000 })
                material.shininess = 0;
                material.specular = new Color(0x222222);
                const ground = new Mesh(new PlaneGeometry(50, 50, 1, 1), material);
                ground.rotateX(-Math.PI / 2);
                ground.receiveShadow = true;
                current.ground = ground;
                scene.add(ground);

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
        gui.$title.innerHTML = "Cup";

        gui
            .add(model, "cupHeight", 6, 16, 0.01)
            .name("Height")
            .onFinishChange((value: number) => {
                model.cupHeight = value;
                updateShape();
            });

        gui
            .add(model, "cupRadius", 3, 8, 0.01)
            .name("Radius")
            .onFinishChange((value: number) => {
                model.cupRadius = value;
                updateShape();
            });

        gui
            .add(model, "cupThickness", 0.5, 1, 0.01)
            .name("Thickness")
            .onFinishChange((value: number) => {
                model.cupThickness = value;
                updateShape();
            });

        gui
            .add(model, "cupHandleDistance", 0.3, 3, 0.01)
            .name("Handle Distance")
            .onFinishChange((value: number) => {
                model.cupHandleDistance = value;
                updateShape();
            });

        gui
            .add(model, "cupHandleHeight", 0, 1, 0.01)
            .name("Handle Height")
            .onFinishChange((value: number) => {
                model.cupHandleHeight = value;
                updateShape();
            });

        gui
            .addColor(model, "color")
            .name("Color")
            .onChange((value: string) => {
                const children = current.group?.children[0].children as Mesh[];
                [...children, current.ground].forEach((child) => {
                    const material = (child as Mesh).material as MeshPhongMaterial;
                    material.color.setHex(parseInt(value.replace('#', '0x')));
                });

            })

        gui.add(model, "downloadSTL").name("Download STL");
        gui.add(model, "downloadStep").name("Download STEP");
    }

    init();

}

component();