import {
  Scene,
  TransformNode,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color3,
  Engine,
  Color4,
  Light,
  MeshBuilder,
  PBRMetallicRoughnessMaterial,
} from "@babylonjs/core";
import type { Current } from "../models";
import { Inputs, type BitByBitBase } from "@bitbybit-dev/babylonjs";

export function initBabylonJS() {
  const canvas = document.getElementById("babylon-canvas") as HTMLCanvasElement;
  canvas.addEventListener("wheel", (evt) => evt.preventDefault());
  const engine = new Engine(canvas, true);
  engine.setHardwareScalingLevel(0.5);
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString("#222222");
  new TransformNode("root", scene);
  const camera = new ArcRotateCamera(
    "Camera",
    0,
    10,
    10,
    new Vector3(0, 0, 0),
    scene
  );
  const camPos = new Vector3(20, 5, 20);
  camera.setPosition(camPos);
  const camTarget = new Vector3(0, 5, 0);
  camera.setTarget(camTarget);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 0;
  camera.minZ = 3;
  const light = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);
  light.intensityMode = Light.INTENSITYMODE_ILLUMINANCE;
  light.intensity = 2;

  scene.ambientColor = Color3.FromHexString("#ffffff");
  scene.metadata = { shadowGenerators: [] };

  window.onresize = () => {
    engine.resize();
  };

  return { scene, engine, camera };
}

export function createDirLightsAndGround(
  bitbybit: BitByBitBase,
  current: Current
) {
  const dirLightOpt = new Inputs.BabylonScene.DirectionalLightDto();
  dirLightOpt.intensity = 5;
  dirLightOpt.shadowGeneratorMapSize = 2000;
  dirLightOpt.direction = [50, -50, -100];
  bitbybit.babylon.scene.drawDirectionalLight(dirLightOpt);

  const fogOptions = new Inputs.BabylonScene.FogDto();
  fogOptions.mode = Inputs.Base.fogModeEnum.linear;
  fogOptions.start = 20;
  fogOptions.end = 50;
  fogOptions.color = "#000000";
  bitbybit.babylon.scene.fog(fogOptions);

  const matGround = new PBRMetallicRoughnessMaterial("ground");
  matGround.baseColor = Color3.FromHexString("#080808");
  matGround.zOffset = 2;
  const ground = MeshBuilder.CreateCylinder("ground", {
    diameter: 85,
    height: 3,
    tessellation: 300,
  });
  ground.position.y = -1.51;
  ground.material = matGround;
  ground.receiveShadows = true;
  current.ground = ground;
}
