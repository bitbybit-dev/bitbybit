import './style.css';
import { BitByBitBase } from '@bitbybit-dev/threejs';
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { Inputs } from '@bitbybit-dev/threejs';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
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
  Vector3,
  VSMShadowMap,
  WebGLRenderer,
} from 'three';
import { GUI } from 'lil-gui';
import { createShapeLod2, createShapeLod1 } from './create-shape';
import type { Current } from './models/current';
import type { Model } from './models/model';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="three-canvas">
  </canvas>
`;

function component() {
  let current: Current = {
    group1: undefined,
    group2: undefined,
    dimensions: undefined,
    ground: undefined,
    light1: undefined,
    gui: undefined,
  };

  const model = {
    uHex: 3,
    vHex: 12,
    height: 15,
    ellipse1MinRad: 15,
    ellipse1MaxRad: 15,
    ellipse2MinRad: 25,
    ellipse2MaxRad: 30,
    ellipse2RotX: 15,
    ellipse2RotY: 15,
    ellipse3MinRad: 45,
    ellipse3MaxRad: 90,
    ellipse3YRot: 45,
    finalPrecision: 0.05,
    drawEdges: false,
    drawFaces: true,
    rotationEnabled: false,
    color1: '#b3ccff',
    color2: '#ffffff',
  } as Model;

  let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];
  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  let bitbybit: BitByBitBase | undefined;
  let scene: Scene | undefined;

  const rotationSpeed = 0.0005;
  const rotateGroup = () => {
    if (
      model.rotationEnabled &&
      current.group1 &&
      current.group2 &&
      current.dimensions
    ) {
      current.group1.rotation.y -= rotationSpeed;
      current.group2.rotation.y -= rotationSpeed;
      current.dimensions.rotation.y -= rotationSpeed;
    }
  };

  const downloadStep = async () => {
    if (bitbybit && finalShape) {
      // threejs is right handed - originally bitbybit was built on left handed system, thus this compensation is needed till
      // we improve support
      const exportShape = await bitbybit.occt.transforms.mirrorAlongNormal({
        shape: finalShape,
        origin: [0, 0, 0],
        normal: [0, 0, 1],
      });
      await bitbybit.occt.io.saveShapeSTEP({
        shape: exportShape,
        fileName: 'shape',
        adjustYtoZ: true,
        tryDownload: true,
      });
      bitbybit.occt.deleteShape({ shape: exportShape });
    }
  };

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
  };

  const downloadGLB = () => {
    if (scene) {
      var exporter = new GLTFExporter();
      exporter.parse(
        scene,
        function (gltf: ArrayBuffer) {
          var blob = new Blob([gltf], { type: 'application/octet-stream' });
          var link = document.createElement('a');
          link.style.display = 'none';
          document.body.appendChild(link);
          link.href = URL.createObjectURL(blob);
          link.download = 'Scene.glb';
          link.click();
        },
        function (error: string) {
          console.error('An error happened', error);
        },
        { trs: false, onlyVisible: true, binary: true }
      );
    }
  };

  model.downloadGLB = downloadGLB;
  model.downloadSTL = downloadSTL;
  model.downloadStep = downloadStep;

  const updateShape = async (finish: boolean) => {
    disableGUI();
    showSpinner();
    current.group1?.traverse((obj) => {
      scene?.remove(obj);
    });
    current.group2?.traverse((obj) => {
      scene?.remove(obj);
    });
    current.dimensions?.traverse((obj) => {
      scene?.remove(obj);
    });
    if (finish) {
      finalShape = await createShapeLod2(
        bitbybit,
        scene,
        model,
        shapesToClean,
        current
      );
    } else {
      finalShape = await createShapeLod1(
        bitbybit,
        scene,
        model,
        shapesToClean,
        current
      );
    }
    hideSpinner();
    enableGUI();
  };

  model.update = () => updateShape(true);

  const init = async () => {
    bitbybit = new BitByBitBase();

    const domNode = document.getElementById(
      'three-canvas'
    ) as HTMLCanvasElement;
    const occt = new Worker(new URL('./workers/occt.worker', import.meta.url), {
      name: 'OCC',
      type: 'module',
    });

    const camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    scene = new Scene();
    scene.fog = new Fog(0x1a1c1f, 150, 230);
    const light = new HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(light);
    await bitbybit.init(scene, occt, undefined);

    const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.near = 3;
    camera.far = 1000;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio / 1.5);
    const animation = () => {
      if (scene) {
        renderer.render(scene, camera);
        rotateGroup();
      }
      controls.update();
    };

    const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.set(10, 5, 120);

    controls.update();
    controls.target = new Vector3(0, 5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.zoomSpeed = 0.1;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize, false);

    renderer.setClearColor(new Color(0x1a1c1f), 1);

    bitbybit.occtWorkerManager.occWorkerState$.subscribe(async (s) => {
      if (s.state === OccStateEnum.initialised) {
        finalShape = await createShapeLod1(
          bitbybit,
          scene,
          model,
          shapesToClean,
          current
        );

        renderer.setAnimationLoop(animation);

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
        dirLight.shadow.mapSize.width = 6000;
        dirLight.shadow.mapSize.height = 6000;
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

        createGui();
      }
    });
  };

  const disableGUI = () => {
    const lilGui = document.getElementsByClassName('lil-gui')[0] as HTMLElement;
    lilGui.style.pointerEvents = 'none';
    lilGui.style.opacity = '0.5';
  };

  const enableGUI = () => {
    const lilGui = document.getElementsByClassName('lil-gui')[0] as HTMLElement;
    lilGui.style.pointerEvents = 'all';
    lilGui.style.opacity = '1';
  };

  function showSpinner() {
    const element = document.createElement('div');
    element.id = 'spinner';
    element.className = 'lds-ellipsis';
    element.innerHTML = `
      <div></div>
      <div></div>
      <div></div>
  `;

    document.body.appendChild(element);
  }

  function hideSpinner() {
    const el = document.getElementById('spinner');
    if (el) {
      el.remove();
    }
  }

  const createGui = () => {
    const gui = new GUI();
    current.gui = gui;
    gui.$title.innerHTML = 'Pattern';

    gui
      .add(model, 'uHex', 1, 14, 1)
      .name('Hexagons U')
      .onFinishChange((value: number) => {
        model.uHex = value;
        updateShape(false);
      });

    gui
      .add(model, 'vHex', 8, 36, 2)
      .name('Hexagons V')
      .onFinishChange((value: number) => {
        model.vHex = value;
        updateShape(false);
      });

    gui
      .add(model, 'height', 15, 25, 1)
      .name('Height')
      .onFinishChange((value: number) => {
        model.height = value;
        updateShape(false);
      });

    gui
      .add(model, 'ellipse2RotX', 0, 15, 0.1)
      .name('Angle Guide')
      .onFinishChange((value: number) => {
        model.ellipse2RotX = value;
        updateShape(false);
      });

    gui
      .add(model, 'finalPrecision', 0.01, 1, 0.01)
      .name('Final Precision')
      .onFinishChange((value: number) => {
        model.finalPrecision = value;
      });

    gui
      .add(model, 'rotationEnabled')
      .name('Rotation Enabled')
      .onFinishChange((value: boolean) => {
        model.rotationEnabled = value;
      });

    gui
      .add(model, 'drawEdges')
      .name('Draw Edges')
      .onFinishChange((value: boolean) => {
        model.drawEdges = value;
      });

    gui
      .addColor(model, 'color1')
      .name('Color 1')
      .onChange((value: string) => {
        current.group1?.children.forEach((group) => {
          const children = group?.children[0].children as Mesh[];
          [...children].forEach((child) => {
            const material = (child as Mesh).material as MeshPhongMaterial;
            material.color.setHex(parseInt(value.replace('#', '0x')));
          });
        });
      });

    gui
      .addColor(model, 'color2')
      .name('Color 2')
      .onChange((value: string) => {
        current.group2?.children.forEach((group) => {
          const children = group?.children[0].children as Mesh[];
          [...children].forEach((child) => {
            const material = (child as Mesh).material as MeshPhongMaterial;
            material.color.setHex(parseInt(value.replace('#', '0x')));
          });
        });
      });

    gui.add(model, 'update').name('Finalize');
    gui.add(model, 'downloadSTL').name('Download STL');
    gui.add(model, 'downloadStep').name('Download STEP');
    gui.add(model, 'downloadGLB').name('Download GLB');
  };

  init();
}

component();
