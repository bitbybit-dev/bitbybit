import "./style.css";
import { BitByBitBase, Inputs, initBitByBit, type InitBitByBitOptions } from "@bitbybit-dev/threejs";
import { model, current } from "./models";
import {
  initThreeJS,
  createGui,
  createShape,
  createDirLightsAndGround,
  disableGUI,
  enableGUI,
  hideSpinner,
  showSpinner,
  downloadGLB,
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
  const { scene } = initThreeJS();
  createDirLightsAndGround(scene, current);

  const bitbybit = new BitByBitBase();
  await initBitByBit(scene, bitbybit, options);

  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  const shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];

  model.downloadStep = () => downloadStep(bitbybit, finalShape);
  model.downloadGLB = () => downloadGLB(scene);
  model.downloadSTL = () => downloadSTL(scene);

  createGui(current, model, updateShape);

  const rotationSpeed = 0.0005;
  const rotateGroup = () => {
    if (current.groups && current.groups.length) {
      current.groups.forEach((g) => {
        g.rotation.y -= rotationSpeed;
      });
    }
  };

  scene.onBeforeRender = () => {
    rotateGroup();
  };

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
    current.groups?.forEach((g) => {
      g.traverse((obj) => {
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

    hideSpinner();
    enableGUI();
  }
}
