
import { BitByBitBase } from "@bitbybit-dev/threejs";
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { Inputs } from '@bitbybit-dev/threejs';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Color, DirectionalLight, Fog, Group, HemisphereLight, Mesh, MeshPhongMaterial, MeshPhysicalMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, VSMShadowMap, WebGLRenderer } from 'three';
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

    let mouseX = 0;
    let mouseY = 0;

    const hideSpinner = () => {
        const el = document.getElementById('spinner');
        if (el) {
            el.remove();
        }
    }

    let current: { group: Group | undefined, gui: GUI | undefined } = {
        group: undefined,
        gui: undefined,
    };

    type Model = {
        numberOfRays: number,
        widening: number,
        color: string,
        sourceCode: () => void
    }

    const model = {
        numberOfRays: 200,
        widening: 3,
        color: '#be8250',
        sourceCode: () => {
            window.open("https://github.com/bitbybit-dev/app-examples/blob/main/webpack/threejs/src/code/homepage.ts", "_blank");
        }
    } as Model;

    let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];
    let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
    let bitbybit: BitByBitBase | undefined;
    let scene: Scene | undefined;

    const rotateGroup = () => {
        if (current.group) {
            current.group.rotation.y -= ((window.innerWidth / 2) - mouseX) / 300000;
            current.group.rotation.z -= ((window.innerHeight / 2) - mouseY) / 300000;
        }
    }

    const createShape = async (bitbybit?: BitByBitBase, scene?: Scene) => {
        if (scene && bitbybit) {
            if (shapesToClean.length > 0) {
                await bitbybit.manifold.deleteManifoldsOrCrossSections({ manifoldsOrCrossSections: shapesToClean });
            }

            const { occt } = bitbybit;
            const spiralOptions = new Inputs.Point.SpiralDto();
            spiralOptions.phi = 0.9;
            spiralOptions.numberPoints = model.numberOfRays;
            spiralOptions.widening = model.widening;
            spiralOptions.radius = 10;
            spiralOptions.factor = 1;
            const spiralPoints = bitbybit.point.spiral(spiralOptions);

            // TODO - FIXED BUG v0.20.4
            // There's missing dependency in the line class
            (bitbybit.line as any).point = bitbybit.point;
            
            const lines = bitbybit.line.linesBetweenStartAndEndPoints({
                startPoints: spiralPoints,
                endPoints: spiralPoints.map(p => [0, 0, 0]),
            });

            const rays = bitbybit.verb.curve.convertLinesToNurbsCurves({
                lines
            });

            const pointsAtParam = bitbybit.verb.curve.pointsAtParam({
                curves: rays,
                parameter: 0.3
            });

            const spiralingLineCurves = bitbybit.verb.curve.convertLinesToNurbsCurves({
                lines: bitbybit.line.linesBetweenStartAndEndPoints({
                    startPoints: pointsAtParam,
                    endPoints: spiralPoints,
                })
            })

            const segmentedScalingFactor = 0.5;
            const segmentedLineCurves = bitbybit.lists.groupNth({
                list: spiralingLineCurves,
                nrElements: 3,
                keepRemainder: false
            });

            let curveScalingFactor = 1;
            const curveScalingFactorCenter = 1;

            const wiresSegmented: Promise<Inputs.OCCT.TopoDSWirePointer[]>[] = [];
            segmentedLineCurves.reverse().forEach((segmentedLineCurve, i: number) => {
                const wires: Promise<Inputs.OCCT.TopoDSWirePointer>[] = [];
                segmentedLineCurve.forEach((lineCurve: any) => {

                    curveScalingFactor += (10 / model.numberOfRays);

                    const pt1 = bitbybit.verb.curve.startPoint({
                        curve: lineCurve
                    });

                    const pt2 = bitbybit.point.translatePoints({
                        points: [
                            bitbybit.verb.curve.pointAtParam({
                                curve: lineCurve,
                                parameter: 0.2,
                            })
                        ],
                        translation: [0, 0, 0.15 * curveScalingFactor]
                    })[0];

                    const pt3 = bitbybit.point.translatePoints({
                        points: [
                            bitbybit.verb.curve.pointAtParam({
                                curve: lineCurve,
                                parameter: 0.5,
                            })
                        ],
                        translation: [0, 0, i % 3 ? 0.3 : 0.4]
                    })[0];
                    const pt4 = bitbybit.point.translatePoints({
                        points: [
                            bitbybit.verb.curve.pointAtParam({
                                curve: lineCurve,
                                parameter: i % 3 ? 0.99 : 1.1
                            })
                        ],
                        translation: [0, 0, i % 3 ? 0.15 : 0.05]
                    })[0];
                    const pt5 = bitbybit.point.translatePoints({
                        points: [
                            bitbybit.verb.curve.pointAtParam({
                                curve: lineCurve,
                                parameter: i % 3 ? 0.99 : 1.1
                            })
                        ],
                        translation: [0, 0, i % 3 ? -0.15 : -0.05]
                    })[0];
                    const pt6 = bitbybit.point.translatePoints({
                        points: [
                            bitbybit.verb.curve.pointAtParam({
                                curve: lineCurve,
                                parameter: 0.5,
                            })
                        ],
                        translation: [0, 0, i % 3 ? -0.3 : -0.4]
                    })[0];
                    const pt7 = bitbybit.point.translatePoints({
                        points: [
                            bitbybit.verb.curve.pointAtParam({
                                curve: lineCurve,
                                parameter: 0.2,
                            })
                        ],
                        translation: [0, 0, -0.15 * curveScalingFactor]
                    })[0];
                    const points = [
                        pt1, pt2, pt3, pt4, pt5, pt6, pt7, pt1
                    ].reverse();
                    const wire = bitbybit.occt.shapes.wire.createPolylineWire({
                        points,
                    });
                    wires.push(wire);
                });
                wiresSegmented.push(Promise.all(wires));
            });

            const segmentedWires = await Promise.all(wiresSegmented);
            const lofts: Promise<Inputs.OCCT.TopoDSWirePointer>[] = [];
            segmentedWires.reverse().forEach((wires, i) => {
                if (i > 10) {
                    const loft = bitbybit.occt.operations.loft({
                        shapes: wires,
                        makeSolid: true,
                    });
                    lofts.push(loft);
                }
            });

            const res = await Promise.all(lofts);

            window.addEventListener("mousemove", (event) => {
                mouseX = event.clientX;
                mouseY = event.clientY;
            });

            finalShape = await bitbybit.occt.shapes.compound.makeCompound({
                shapes: res,
            });

            const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
            const mat = new MeshPhysicalMaterial({ color: new Color(model.color) });
            mat.polygonOffset = true;
            mat.polygonOffsetFactor = 1;
            mat.polygonOffsetUnits = 2;
            mat.side = 2;
            mat.metalness = 0.5;
            mat.roughness = 0.9;
            mat.specularIntensity = 1;
            drawOptions.faceMaterial = mat;
            drawOptions.edgeColour = "#000000";

            const group = await bitbybit.draw.drawAnyAsync({
                entity: finalShape,
                options: drawOptions
            })

            shapesToClean = [];
            if (group) {
                group.children[0].children.forEach((child) => {
                    child.castShadow = true;
                    child.receiveShadow = true;
                });
            }

            if (current.group) {
                group.rotation.x = current.group.rotation.x;
                group.rotation.y = current.group.rotation.y;
                group.rotation.z = current.group.rotation.z;

                current.group.traverse((obj) => {
                    scene?.remove(obj);
                });
            }

            current.group = group;

        }
    }

    const updateShape = async () => {
        showSpinner();
        disableGUI();

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

        const renderer = new WebGLRenderer({ antialias: true, canvas: domNode, alpha: true });
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
        camera.position.set(10, 1, 10);

        controls.update();
        controls.target = new Vector3(-55, 1, 0);
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

        // renderer.setClearColor(new Color(0x1a1c1f), 1);

        const dirLight = new DirectionalLight(0x3333ff, 30);
        dirLight.position.set(30, -50, 30);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0;
        dirLight.shadow.camera.far = 200;
        const dist = 15;
        dirLight.shadow.camera.right = dist;
        dirLight.shadow.camera.left = - dist;
        dirLight.shadow.camera.top = dist;
        dirLight.shadow.camera.bottom = - dist;
        dirLight.shadow.mapSize.width = 2000;
        dirLight.shadow.mapSize.height = 2000;
        dirLight.shadow.blurSamples = 8;
        dirLight.shadow.radius = 2;
        dirLight.shadow.bias = -0.0005;

        scene.add(dirLight);

        const material = new MeshPhongMaterial({ color: 0x3300ff })
        material.shininess = 0.3;
        material.specular = new Color(0x222222);

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
            .add(model, "numberOfRays", 100, 600, 1)
            .name("Number of Rays")
            .onFinishChange((value: number) => {
                model.numberOfRays = value;
                updateShape();
            });

        gui
            .add(model, "widening", 2, 5, 0.1)
            .name("Widening")
            .onFinishChange((value: number) => {
                model.widening = value;
                updateShape();
            });

        gui
            .addColor(model, "color")
            .name("Color")
            .onChange((value: string) => {
                if (current && current.group) {
                    const children = current.group?.children[0].children as Mesh[];
                    [...children].forEach((child) => {
                        const material = (child as Mesh).material as MeshPhongMaterial;
                        material.color.setHex(parseInt(value.replace('#', '0x')));
                    });
                }
            })

        const loadButton = gui.add( model, "sourceCode" );
    }

    init();

}

component();