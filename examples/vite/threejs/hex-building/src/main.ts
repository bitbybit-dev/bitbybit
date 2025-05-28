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
import { createShape } from './create-shape';
import type { Current } from './models/current';
import type { Model } from './models/model';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="three-canvas">
  </canvas>
`;

function component() {
  let current: Current = {
    groups: undefined,
    ground: undefined,
    gui: undefined,
  };

  const model = {
    uRec: 41,
    vRec: 10,
    drawEdges: true,
    drawFaces: true,
    color: '#000000',
  } as Model;

  let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];
  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  let bitbybit: BitByBitBase | undefined;
  let scene: Scene | undefined;

  const rotateGroup = () => {
    if (current.groups) {
      current.groups.forEach((group) => {
        group.rotation.y -= 0.0005;
      });
    }
  };

  const downloadStep = async () => {
    if (bitbybit && finalShape) {
      await bitbybit.occt.io.saveShapeSTEP({
        shape: finalShape,
        fileName: 'shape',
        adjustYtoZ: true,
        tryDownload: true,
      });
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

  const downloadGLTF = () => {
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

  model.downloadSTL = downloadSTL;
  model.downloadStep = downloadStep;
  model.downloadGLTF = downloadGLTF;

  const updateShape = async () => {
    disableGUI();
    current.groups?.forEach((group) => {
      group.traverse((obj) => {
        scene?.remove(obj);
      });
    });

    finalShape = await createShape(
      bitbybit,
      scene,
      model,
      shapesToClean,
      current
    );
    enableGUI();
  };

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
    scene.fog = new Fog(0xffffff, 5, 45);
    const light = new HemisphereLight(0xffffff, 0x000000, 40);
    scene.add(light);
    await bitbybit.init(scene, occt, undefined);

    const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio / 1.5);
    const animation = () => {
      if (scene) {
        renderer.render(scene, camera);
      }
      rotateGroup();
      controls.update();
    };

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(10, 5, 15);

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

    renderer.setClearColor(new Color(0xffffff), 1);

    bitbybit.occtWorkerManager.occWorkerState$.subscribe(async (s) => {
      if (s.state === OccStateEnum.initialised) {
        finalShape = await createShape(
          bitbybit,
          scene,
          model,
          shapesToClean,
          current
        );

        renderer.setAnimationLoop(animation);

        const dirLight = new DirectionalLight(0xffffff, 200);
        dirLight.position.set(15, 40, -15);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0;
        dirLight.shadow.camera.far = 300;
        const dist = 100;
        dirLight.shadow.camera.right = dist;
        dirLight.shadow.camera.left = -dist;
        dirLight.shadow.camera.top = dist;
        dirLight.shadow.camera.bottom = -dist;
        dirLight.shadow.mapSize.width = 10000;
        dirLight.shadow.mapSize.height = 10000;
        dirLight.shadow.blurSamples = 8;
        dirLight.shadow.radius = 2;
        dirLight.shadow.bias = -0.0005;
        dirLight.shadow.intensity = 0.6;

        scene?.add(dirLight);

        const material = new MeshPhongMaterial({ color: 0x000000 });
        material.shininess = 0;
        material.specular = new Color(0x000000);
        const ground = new Mesh(new PlaneGeometry(40, 40, 1, 1), material);
        ground.rotateX(-Math.PI / 2);
        ground.receiveShadow = true;
        ground.position.y = -0.01;
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

  const createGui = () => {
    const gui = new GUI();
    current.gui = gui;
    gui.$title.innerHTML = 'Pattern';

    gui
      .add(model, 'uRec', 5, 81, 4)
      .name('Hexagons U')
      .onFinishChange((value: number) => {
        model.uRec = value;
        updateShape();
      });

    gui
      .add(model, 'vRec', 5, 12, 1)
      .name('Hexagons V')
      .onFinishChange((value: number) => {
        model.vRec = value;
        updateShape();
      });

    gui
      .add(model, 'drawEdges')
      .name('Draw Edges')
      .onFinishChange((value: boolean) => {
        model.drawEdges = value;
        updateShape();
      });

    gui
      .add(model, 'drawFaces')
      .name('Draw Faces')
      .onFinishChange((value: boolean) => {
        model.drawFaces = value;
        updateShape();
      });

    gui
      .addColor(model, 'color')
      .name('Color')
      .onChange((value: string) => {
        let children: Mesh[] = [];
        if (current.groups) {
          children = current.groups[0].children[0].children as Mesh[];
        }
        [...children, current.ground].forEach((child) => {
          const material = (child as Mesh).material as MeshPhongMaterial;
          material.color.setHex(parseInt(value.replace('#', '0x')));
        });
      });

    gui.add(model, 'downloadSTL').name('Download STL');
    gui.add(model, 'downloadStep').name('Download STEP');
    gui.add(model, 'downloadGLTF').name('Download GLTF');
  };

  init();
}

component();
