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
  VSMShadowMap,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import type { Current } from "../models";

export function initThreeJS() {
  const domNode = document.getElementById("three-canvas") as HTMLCanvasElement;

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const scene = new Scene();
  scene.background = new Color(0x1a1c1f);

  scene.fog = new Fog(0x1a1c1f, 10, 45);
  const light = new HemisphereLight(0xffffff, 0x444444, 2);
  scene.add(light);

  const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio / 1.5);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = VSMShadowMap;

  camera.position.set(10, 5, 15);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.near = 3;
  camera.far = 1000;
  camera.updateProjectionMatrix();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.zoomSpeed = 0.1;
  controls.target.set(0, 0, 0);
  controls.update();

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onWindowResize, false);

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(animate);

  return { scene, camera, renderer };
}

export function createDirLightsAndGround(scene: Scene, current: Current) {
  const dirLight = new DirectionalLight(0xffffff, 3);
  dirLight.position.set(70, 25, -70);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 3;
  dirLight.shadow.camera.far = 300;
  const dist = 15;
  dirLight.shadow.camera.right = dist;
  dirLight.shadow.camera.left = -dist;
  dirLight.shadow.camera.top = dist;
  dirLight.shadow.camera.bottom = -dist;
  dirLight.shadow.mapSize.width = 2000;
  dirLight.shadow.mapSize.height = 2000;
  dirLight.shadow.blurSamples = 3;
  dirLight.shadow.radius = 2;
  dirLight.shadow.bias = -0.0005;

  scene?.add(dirLight);

  const material = new MeshPhongMaterial({ color: 0x222222 });
  material.shininess = 0;
  material.specular = new Color(0x010101);
  material.polygonOffset = true;
  material.polygonOffsetFactor = 10;
  const ground = new Mesh(new PlaneGeometry(74, 74, 1, 1), material);
  ground.rotateX(-Math.PI / 2);
  ground.receiveShadow = true;
  current.ground = ground;
  scene?.add(ground);
}
