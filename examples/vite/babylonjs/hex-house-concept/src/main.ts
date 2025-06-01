import "./style.css";
import { BitByBitBase, Inputs } from "@bitbybit-dev/babylonjs";
import { model, type KernelOptions, current } from "./models";
import {
  initKernels,
  initBabylonJS,
  createGui,
  createShape,
  createDirLightsAndGround,
  disableGUI,
  enableGUI,
  hideSpinner,
  showSpinner,
  downloadGLTF,
  downloadSTL,
  downloadStep,
} from "./helpers";

const kernelOptions: KernelOptions = {
  enableOCCT: true,
  enableJSCAD: false,
  enableManifold: false,
};

start();

async function start() {
  const { scene, engine } = initBabylonJS();

  const bitbybit = new BitByBitBase();
  bitbybit.context.scene = scene;
  bitbybit.context.engine = engine;
  createDirLightsAndGround(bitbybit, current);

  await initKernels(scene, bitbybit, kernelOptions);

  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];

  model.downloadStep = () => downloadStep(bitbybit, finalShape);
  model.downloadGLTF = () => downloadGLTF(bitbybit);
  model.downloadSTL = () => downloadSTL(bitbybit, finalShape);

  createGui(current, model, updateShape);

  const rotationSpeed = 0.0005;
  const rotateGroup = () => {
    if (current.groups && current.groups.length > 0) {
      current.groups.forEach((g) => {
        g.rotation.y -= rotationSpeed;
      });
    }
  };

  scene.onBeforeRenderObservable.add(() => rotateGroup());

  engine.runRenderLoop(() => {
    scene.render(true, false);
  });

  finalShape = await createShape(
    bitbybit,
    scene,
    model,
    shapesToClean,
    current
  );

  async function updateShape() {
    disableGUI();
    showSpinner();
    if (current.groups) {
      current.groups.forEach((g) => g.dispose(false, true));
    }

    finalShape = await createShape(
      bitbybit,
      scene,
      model,
      shapesToClean,
      current
    );

    hideSpinner();
    enableGUI();
  }
}
