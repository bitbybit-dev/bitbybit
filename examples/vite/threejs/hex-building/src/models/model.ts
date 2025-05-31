import type { BitByBitBase, Inputs } from "@bitbybit-dev/threejs";
import type { Scene } from "three";

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
  downloadGLB?: (scene: Scene) => void;
  update?: () => void;
};

export const model = {
  uHex: 41,
  vHex: 10,
  drawEdges: true,
  drawFaces: true,
  color: "#000000",
} as Model;
