import GUI from "lil-gui";
import type { Current, Model } from "../models";
import { Color3, PBRMetallicRoughnessMaterial } from "@babylonjs/core";

export const createGui = (
  current: Current,
  model: Model,
  updateShape: () => void
) => {
  model.update = () => updateShape();
  const gui = new GUI();
  current.gui = gui;
  gui.$title.innerHTML = "Pattern";

  gui
    .add(model, "uHex", 5, 81, 4)
    .name("Hexagons U")
    .onFinishChange((value: number) => {
      model.uHex = value;
      updateShape();
    });

  gui
    .add(model, "vHex", 5, 12, 1)
    .name("Hexagons V")
    .onFinishChange((value: number) => {
      model.vHex = value;
      updateShape();
    });

  gui
    .add(model, "drawEdges")
    .name("Draw Edges")
    .onFinishChange((value: boolean) => {
      model.drawEdges = value;
      updateShape();
    });

  gui
    .add(model, "drawFaces")
    .name("Draw Faces")
    .onFinishChange((value: boolean) => {
      model.drawFaces = value;
      updateShape();
    });

  gui
    .addColor(model, "color")
    .name("Color")
    .onChange((value: string) => {
      if (current.groups && current.groups.length > 0) {
        const firstGroup = current.groups[0];
        const children = firstGroup.getChildMeshes();
        const faceMesh = children[0];
        const mat = faceMesh.material as PBRMetallicRoughnessMaterial;
        mat.baseColor = Color3.FromHexString(value);
      }
    });

  gui.add(model, "downloadSTL").name("Download STL");
  gui.add(model, "downloadStep").name("Download STEP");
  gui.add(model, "downloadGLTF").name("Download GLTF");
};
