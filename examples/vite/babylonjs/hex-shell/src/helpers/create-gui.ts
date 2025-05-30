import GUI from "lil-gui";
import type { Current, Model } from "../models";
import { Color3, PBRMetallicRoughnessMaterial } from "@babylonjs/core";

export const createGui = (
  current: Current,
  model: Model,
  updateShape: (lod: boolean) => void
) => {
  model.update = () => updateShape(true);
  const gui = new GUI();
  current.gui = gui;
  gui.$title.innerHTML = "Pattern";

  gui
    .add(model, "uHex", 1, 14, 1)
    .name("Hexagons U")
    .onFinishChange((value: number) => {
      model.uHex = value;
      updateShape(false);
    });

  gui
    .add(model, "vHex", 8, 36, 2)
    .name("Hexagons V")
    .onFinishChange((value: number) => {
      model.vHex = value;
      updateShape(false);
    });

  gui
    .add(model, "height", 15, 25, 1)
    .name("Height")
    .onFinishChange((value: number) => {
      model.height = value;
      updateShape(false);
    });

  gui
    .add(model, "ellipse2RotX", 0, 15, 0.1)
    .name("Angle Guide")
    .onFinishChange((value: number) => {
      model.ellipse2RotX = value;
      updateShape(false);
    });

  gui
    .add(model, "finalPrecision", 0.01, 1, 0.01)
    .name("Final Precision")
    .onFinishChange((value: number) => {
      model.finalPrecision = value;
    });

  gui
    .add(model, "rotationEnabled")
    .name("Rotation Enabled")
    .onFinishChange((value: boolean) => {
      model.rotationEnabled = value;
    });

  gui
    .add(model, "drawEdges")
    .name("Draw Edges")
    .onFinishChange((value: boolean) => {
      model.drawEdges = value;
    });

  gui
    .addColor(model, "color1")
    .name("Color 1")
    .onChange((value: string) => {
      current.group1?.getChildren().forEach((c1) => {
        const children = c1.getChildMeshes();
        const mat = children[0].material as PBRMetallicRoughnessMaterial;
        mat.baseColor = Color3.FromHexString(value);
      });
    });

  gui
    .addColor(model, "color2")
    .name("Color 2")
    .onChange((value: string) => {
      current.group2?.getChildren().forEach((c1) => {
        const children = c1.getChildMeshes();
        const mat = children[0].material as PBRMetallicRoughnessMaterial;
        mat.baseColor = Color3.FromHexString(value);
      });
    });

  gui.add(model, "update").name("Finalize");
  gui.add(model, "downloadSTL").name("Download STL");
  gui.add(model, "downloadStep").name("Download STEP");
  gui.add(model, "downloadGLB").name("Download GLB");
};
