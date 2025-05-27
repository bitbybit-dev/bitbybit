
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
        uRec: number,
        vRec: number,
        rounding: number,
        drawEdges: boolean,
        drawFaces: boolean,
        color: string,
        downloadSTL?: () => void,
        downloadStep?: () => void
    }

    const model = {
        uRec: 16,
        vRec: 16,
        rounding: 0.5,
        drawEdges: true,
        drawFaces: true,
        color: '#6600ff'
    } as Model;

    let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];
    let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
    let bitbybit: BitByBitBase | undefined;
    let scene: Scene | undefined;

    const rotateGroup = () => {
        if (current.group) {
            current.group.rotation.y += 0.001;
        }
    }

    const createShape = async (bitbybit?: BitByBitBase, scene?: Scene) => {
        if (scene && bitbybit) {
            if (shapesToClean.length > 0) {
                await bitbybit.occt.deleteShapes({ shapes: shapesToClean });
            }
            const curvePts = [[[-10, 0, -10], [0, 3, -10], [10, -1, -10], [20, 2, -10]], [[-10, -5, 0], [0, -3, 0], [10, 1, 0], [20, -2, 0]], [[-10, 0, 10], [0, 3, 10], [10, -1, 10], [20, 2, 10]]] as Inputs.Base.Point3[][];

            const wirePromises = curvePts.map((pts) => {
                return bitbybit.occt.shapes.wire.interpolatePoints({ points: pts, periodic: false, tolerance: 1e-7 });
            });

            const wires = await Promise.all(wirePromises);
            const loft = await bitbybit.occt.operations.loft({ shapes: wires, makeSolid: false });
            const translated = await bitbybit.occt.transforms.translate({ shape: loft, translation: [0, 10, 0] });
            const faces = await bitbybit.occt.shapes.face.getFaces({ shape: translated });

            const subdivideOptions = new Inputs.OCCT.FaceSubdivideToRectangleHolesDto(faces[0]);
            subdivideOptions.nrRectanglesU = model.vRec;
            subdivideOptions.nrRectanglesV = model.uRec;
            subdivideOptions.scalePatternU = [0.9, 0.5, 0.7];
            subdivideOptions.scalePatternV = [0.9, 0.5, 0.7];
            subdivideOptions.filletPattern = [model.rounding];
            subdivideOptions.inclusionPattern = [false, true, true, true, true];
            subdivideOptions.offsetFromBorderU = 0.01;
            subdivideOptions.offsetFromBorderV = 0.01;

            const withHoles = await bitbybit.occt.shapes.face.subdivideToRectangleHoles(subdivideOptions);
            finalShape = await bitbybit.occt.operations.makeThickSolidSimple({ shape: withHoles[0], offset: 0.5 });

            shapesToClean = [...wires, loft, translated, ...faces, ...withHoles, finalShape];

            const options = new Inputs.Draw.DrawOcctShapeOptions();
            options.precision = 0.02;
            options.drawEdges = model.drawEdges;
            options.drawFaces = model.drawFaces;
            options.drawVertices = false;
            options.edgeWidth = 20;
            options.edgeColour = "#000000";

            const mat = new MeshPhongMaterial({ color: new Color(model.color) });
            mat.polygonOffset = true;
            mat.polygonOffsetFactor = 1;
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
        await bitbybit.init(scene, occt);

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
        camera.position.set(10, 10, 20);

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

        const dirLight = new DirectionalLight(0xffffff, 50);
        dirLight.position.set(60, 70, -30);
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

        const material = new MeshPhongMaterial({ color: 0x3300ff })
        material.shininess = 0;
        material.specular = new Color(0x222222);
        const ground = new Mesh(new PlaneGeometry(50, 50, 1, 1), material);
        ground.rotateX(-Math.PI / 2);
        ground.receiveShadow = true;
        current.ground = ground;
        scene.add(ground);

        bitbybit.occtWorkerManager.occWorkerState$.subscribe(async s => {
            if (s.state === OccStateEnum.initialised) {
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
            .add(model, "uRec", 4, 32, 4)
            .name("Rectangles U")
            .onFinishChange((value: number) => {
                model.uRec = value;
                updateShape();
            });

        gui
            .add(model, "vRec", 4, 32, 4)
            .name("Rectangles V")
            .onFinishChange((value: number) => {
                model.vRec = value;
                updateShape();
            });

        gui
            .add(model, "rounding", 0.1, 0.9, 0.01)
            .name("Rounding")
            .onFinishChange((value: number) => {
                model.rounding = value;
                updateShape();
            });

        gui
            .add(model, "drawEdges")
            .name("Draw Edges")
            .onFinishChange((value: boolean) => {
                model.drawEdges = value;
                updateShape();
            });

        gui
            .add(model, "drawFaces")
            .name("Draw Faces")
            .onFinishChange((value: boolean) => {
                model.drawFaces = value;
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