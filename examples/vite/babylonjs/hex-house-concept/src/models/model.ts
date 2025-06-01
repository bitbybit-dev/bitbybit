import type { BitByBitBase, Inputs } from "@bitbybit-dev/babylonjs";
import type { Scene } from "@babylonjs/core";

export type Model = {
  uHex: number;
  vHex: number;
  drawEdges: boolean;
  drawFaces: boolean;
  color: string;
  downloadSTL?: (scene: Scene) => void;
  downloadStep?: (
    bitbybit: BitByBitBase,
    finalShape: Inputs.OCCT.TopoDSShapePointer | undefined
  ) => void;
  downloadGLTF?: (scene: Scene) => void;
  update?: () => void;
};

export const model = {
  uHex: 41,
  vHex: 10,
  drawEdges: true,
  drawFaces: true,
  color: "#ffffff",
} as Model;
