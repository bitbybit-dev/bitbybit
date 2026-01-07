import "./style.css";
import { BitByBitBase } from "@bitbybit-dev/threejs";
import { OccStateEnum } from "@bitbybit-dev/occt-worker";
import { Inputs } from "@bitbybit-dev/threejs";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
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
} from "three";
import { GUI } from "lil-gui";
import { createShape } from "./create-cup";
import type { Current } from "./models/current";
import type { Model } from "./models/model";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <canvas id="three-canvas">
  </canvas>
`;

function component() {
  let current: Current = {
    group: undefined,
    ground: undefined,
    gui: undefined,
  };

  const model = {
    cupHeight: 13,
    cupRadius: 4.5,
    cupThickness: 1,
    cupHandleDistance: 2,
    cupHandleHeight: 0.5,
    color: "#091044",
  } as Model;

  let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];
  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  let bitbybit: BitByBitBase | undefined;
  let scene: Scene | undefined;

  const rotateGroup = () => {
    if (current.group) {
      current.group.rotation.y -= 0.001;
    }
  };

  const downloadStep = async () => {
    console.log(bitbybit, finalShape);
    if (bitbybit && finalShape) {
      await bitbybit.occt.io.saveShapeSTEP({
        shape: finalShape,
        fileName: "shape",
        adjustYtoZ: true,
        tryDownload: true,
      });
    }
  };

  const downloadSTL = () => {
    if (scene) {
      var exporter = new STLExporter();
      var str = exporter.parse(scene);
      var blob = new Blob([str], { type: "text/plain" });
      var link = document.createElement("a");
      link.style.display = "none";
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = "Scene.stl";
      link.click();
    }
  };

  model.downloadSTL = downloadSTL;
  model.downloadStep = downloadStep;

  const updateShape = async () => {
    disableGUI();
    current.group?.traverse((obj) => {
      scene?.remove(obj);
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
      "three-canvas"
    ) as HTMLCanvasElement;
    const occt = new Worker(new URL("./workers/occt.worker", import.meta.url), {
      name: "OCC",
      type: "module",
    });

    const camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    scene = new Scene();
    scene.fog = new Fog(0x1a1c1f, 15, 60);
    const light = new HemisphereLight(0xffffff, 0x000000, 10);
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
    camera.position.set(15, 20, 15);

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
    window.addEventListener("resize", onWindowResize, false);

    renderer.setClearColor(new Color(0x1a1c1f), 1);

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

        const dirLight = new DirectionalLight(0xffffff, 100);
        dirLight.position.set(15, 40, -15);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0;
        dirLight.shadow.camera.far = 300;
        const dist = 100;
        dirLight.shadow.camera.right = dist;
        dirLight.shadow.camera.left = -dist;
        dirLight.shadow.camera.top = dist;
        dirLight.shadow.camera.bottom = -dist;
        dirLight.shadow.mapSize.width = 2000;
        dirLight.shadow.mapSize.height = 2000;
        dirLight.shadow.blurSamples = 8;
        dirLight.shadow.radius = 2;
        dirLight.shadow.bias = -0.0005;

        scene?.add(dirLight);

        const material = new MeshPhongMaterial({ color: 0x091044 });
        material.shininess = 0;
        material.specular = new Color(0x222222);
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
    const lilGui = document.getElementsByClassName("lil-gui")[0] as HTMLElement;
    lilGui.style.pointerEvents = "none";
    lilGui.style.opacity = "0.5";
  };

  const enableGUI = () => {
    const lilGui = document.getElementsByClassName("lil-gui")[0] as HTMLElement;
    lilGui.style.pointerEvents = "all";
    lilGui.style.opacity = "1";
  };

  const createGui = () => {
    const gui = new GUI();
    current.gui = gui;
    gui.$title.innerHTML = "Cup";

    gui
      .add(model, "cupHeight", 6, 16, 0.01)
      .name("Height")
      .onFinishChange((value: number) => {
        model.cupHeight = value;
        updateShape();
      });

    gui
      .add(model, "cupRadius", 3, 8, 0.01)
      .name("Radius")
      .onFinishChange((value: number) => {
        model.cupRadius = value;
        updateShape();
      });

    gui
      .add(model, "cupThickness", 0.5, 1, 0.01)
      .name("Thickness")
      .onFinishChange((value: number) => {
        model.cupThickness = value;
        updateShape();
      });

    gui
      .add(model, "cupHandleDistance", 0.3, 3, 0.01)
      .name("Handle Distance")
      .onFinishChange((value: number) => {
        model.cupHandleDistance = value;
        updateShape();
      });

    gui
      .add(model, "cupHandleHeight", 0, 1, 0.01)
      .name("Handle Height")
      .onFinishChange((value: number) => {
        model.cupHandleHeight = value;
        updateShape();
      });

    gui
      .addColor(model, "color")
      .name("Color")
      .onChange((value: string) => {
        const children = current.group?.children[0].children as Mesh[];
        [...children, current.ground].forEach((child) => {
          const material = (child as Mesh).material as MeshPhongMaterial;
          material.color.setHex(parseInt(value.replace("#", "0x")));
        });
      });

    gui.add(model, "downloadSTL").name("Download STL");
    gui.add(model, "downloadStep").name("Download STEP");
  };

  init();
}

component();
