import type { BitByBitBase, Inputs } from "@bitbybit-dev/threejs";
import type { Scene } from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

export const downloadStep = async (
  bitbybit: BitByBitBase,
  finalShape: Inputs.OCCT.TopoDSShapePointer | undefined
) => {
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
      fileName: "shape",
      adjustYtoZ: true,
      tryDownload: true,
    });
    bitbybit.occt.deleteShape({ shape: exportShape });
  }
};

export const downloadSTL = (scene: Scene) => {
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

export const downloadGLB = (scene: Scene) => {
  if (scene) {
    var exporter = new GLTFExporter();
    exporter.parse(
      scene,
      function (gltf: ArrayBuffer) {
        var blob = new Blob([gltf], { type: "application/octet-stream" });
        var link = document.createElement("a");
        link.style.display = "none";
        document.body.appendChild(link);
        link.href = URL.createObjectURL(blob);
        link.download = "Scene.glb";
        link.click();
      },
      function (error: string) {
        console.error("An error happened", error);
      },
      { trs: false, onlyVisible: true, binary: true }
    );
  }
};
