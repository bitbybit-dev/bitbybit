import GUI from "lil-gui";
import type { Current, Model } from "../models";
import type { Entity, StandardMaterial } from "playcanvas";

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
      const updateEntityColor = (entity: Entity) => {
        if (entity.render && entity.render.meshInstances) {
          entity.render.meshInstances.forEach((mi) => {
            const mat = mi.material as StandardMaterial;
            if (mat && mat.diffuse) {
              mat.diffuse.fromString(value);
              mat.update();
            }
          });
        }
        entity.children?.forEach((child) => updateEntityColor(child as Entity));
      };
      if (current.groups && current.groups[0]) {
        updateEntityColor(current.groups[0]);
      }
      if (current.ground) {
        updateEntityColor(current.ground);
      }
    });

  gui.add(model, "downloadStep").name("Download STEP");
};
