import "./style.css";
import { BitByBitBase, Inputs, initBitByBit, type InitBitByBitOptions } from "@bitbybit-dev/playcanvas";
import { model, current } from "./models";
import {
  initPlayCanvas,
  setupOrbitCamera,
  createGui,
  createShape,
  createDirLightsAndGround,
  disableGUI,
  enableGUI,
  hideSpinner,
  showSpinner,
  downloadStep,
} from "./helpers";

const options: InitBitByBitOptions = {
  enableOCCT: true,
  enableJSCAD: false,
  enableManifold: false,
};

start();

async function start() {
  const { app, scene, camera } = initPlayCanvas();
  createDirLightsAndGround(scene, current);

  const bitbybit = new BitByBitBase();
  await initBitByBit(app, scene, bitbybit, options);
  setupOrbitCamera(bitbybit, camera);

  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  const shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];

  model.downloadStep = () => downloadStep(bitbybit, finalShape);

  createGui(current, model, updateShape);

  const rotationSpeed = 0.0005;
  const rotateGroup = () => {
    if (current.groups && current.groups.length) {
      current.groups.forEach((g) => {
        g.rotate(0, -rotationSpeed * 180 / Math.PI, 0);
      });
    }
  };

  app.on("update", () => {
    rotateGroup();
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
    current.groups?.forEach((g) => {
      g.destroy();
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
