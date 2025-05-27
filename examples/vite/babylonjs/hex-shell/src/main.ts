import './style.css';
import { BitByBitBase } from '@bitbybit-dev/babylonjs';
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { Inputs } from '@bitbybit-dev/babylonjs';
import { GUI } from 'lil-gui';
import { createShapeLod2, createShapeLod1 } from './create-shape';
import type { Current } from './models/current';
import type { Model } from './models/model';
import {
  Scene,
  ArcRotateCamera,
  Engine,
  WebGPUEngine,
  Vector3,
  Color4,
  Color3,
  TransformNode,
  HemisphericLight,
  Light,
  PBRMetallicRoughnessMaterial,
  MeshBuilder,
} from '@babylonjs/core';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="babylon-canvas">
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
    color1: '#ffffff',
    color2: '#8000ff',
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
      current.group1.rotation.y += rotationSpeed;
      current.group2.rotation.y += rotationSpeed;
      current.dimensions.rotation.y += rotationSpeed;
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
    if (scene && bitbybit && finalShape) {
      bitbybit.occt.io.saveShapeStl({
        fileName: 'bitbybit-hex-shell.stl',
        shape: finalShape,
        adjustYtoZ: true,
        tryDownload: true,
        precision: 0.01,
      });
    }
  };

  const downloadGLB = () => {
    if (scene && bitbybit) {
      bitbybit.babylon.io.exportGLB({
        fileName: 'bitbybit-hex-shell.glb',
        discardSkyboxAndGrid: true,
      });
    }
  };

  model.downloadGLB = downloadGLB;
  model.downloadSTL = downloadSTL;
  model.downloadStep = downloadStep;

  const updateShape = async (finish: boolean) => {
    disableGUI();
    showSpinner();
    current.group1?.dispose(false, true);
    current.group2?.dispose(false, true);
    current.dimensions?.dispose(false, true);

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

    const occt = new Worker(new URL('./workers/occt.worker', import.meta.url), {
      name: 'OCC',
      type: 'module',
    });

    const canvas = document.getElementById(
      'babylon-canvas'
    ) as HTMLCanvasElement;
    canvas.addEventListener('wheel', (evt) => evt.preventDefault());
    const engine = new Engine(canvas, true);
    engine.setHardwareScalingLevel(0.5);
    const { scn } = initScene(bitbybit, engine, canvas);
    scene = scn;

    bitbybit.init(scene, occt);

    const dirLightOpt = new Inputs.BabylonScene.DirectionalLightDto();
    dirLightOpt.intensity = 3;
    dirLightOpt.shadowGeneratorMapSize = 4000;
    dirLightOpt.shadowBias = 0.001;
    dirLightOpt.direction = [50, -50, -100];
    bitbybit.babylon.scene.drawDirectionalLight(dirLightOpt);

    const matGround = new PBRMetallicRoughnessMaterial('ground');
    matGround.baseColor = Color3.FromHexString('#8888ff');
    matGround.zOffset = 2;
    const ground = MeshBuilder.CreateCylinder('ground', {
      diameter: 250,
      height: 3,
      tessellation: 300,
    });
    ground.position.y = -1.5;
    ground.material = matGround;
    ground.receiveShadows = true;
    current.ground = ground;

    window.onresize = () => {
      engine.resize();
    };

    bitbybit.occtWorkerManager.occWorkerState$.subscribe(async (s) => {
      if (s.state === OccStateEnum.initialised) {
        finalShape = await createShapeLod1(
          bitbybit,
          scene,
          model,
          shapesToClean,
          current
        );

        createGui();
      }
    });

    engine.runRenderLoop(() => {
      bitbybit?.context.scene?.render(true, false);
      rotateGroup();
    });
  };

  function initScene(
    bitbybit: BitByBitBase,
    engine: Engine | WebGPUEngine,
    canvas: HTMLCanvasElement
  ) {
    const scn = new Scene(engine);
    scn.clearColor = Color4.FromHexString('#8888ff');
    new TransformNode('root', scn);
    const camera = new ArcRotateCamera(
      'Camera',
      0,
      10,
      10,
      new Vector3(0, 0, 0),
      scn
    );
    const camPos = new Vector3(150, 15, 60);
    camera.setPosition(camPos);
    const camTarget = new Vector3(0, 5, 0);
    camera.setTarget(camTarget);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 0;
    camera.minZ = 3;
    const light = new HemisphericLight('HemiLight', new Vector3(0, 1, 0), scn);
    light.intensityMode = Light.INTENSITYMODE_ILLUMINANCE;
    light.intensity = 1;

    scn.ambientColor = Color3.FromHexString('#ffffff');
    scn.metadata = { shadowGenerators: [] };

    bitbybit.context.scene = scn;
    bitbybit.context.engine = engine;

    return { scn, camera };
  }

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
        current.group1?.getChildren().forEach((c1) => {
          const children = c1.getChildMeshes();
          const mat = children[0].material as PBRMetallicRoughnessMaterial;
          mat.baseColor = Color3.FromHexString(value);
        });
      });

    gui
      .addColor(model, 'color2')
      .name('Color 2')
      .onChange((value: string) => {
        current.group2?.getChildren().forEach((c1) => {
          const children = c1.getChildMeshes();
          const mat = children[0].material as PBRMetallicRoughnessMaterial;
          mat.baseColor = Color3.FromHexString(value);
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
