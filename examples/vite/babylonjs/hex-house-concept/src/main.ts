import "./style.css";
import { BitByBitBase, Inputs, initBitByBit, type InitBitByBitOptions } from "@bitbybit-dev/babylonjs";
import { model, current } from "./models";
import {
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

const options: InitBitByBitOptions = {
  enableOCCT: true,
  enableJSCAD: false,
  enableManifold: false,
};

start();

async function start() {
  const { scene, engine } = initBabylonJS();

  const bitbybit = new BitByBitBase();

  await initBitByBit(scene, bitbybit, options);
  
  createDirLightsAndGround(bitbybit, current);

  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  const shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];

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
