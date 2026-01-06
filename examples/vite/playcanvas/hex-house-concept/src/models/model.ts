import type { BitByBitBase, Inputs } from "@bitbybit-dev/playcanvas";

export type Model = {
  uHex: number;
  vHex: number;
  drawEdges: boolean;
  drawFaces: boolean;
  color: string;
  downloadStep?: (
    bitbybit: BitByBitBase,
    finalShape: Inputs.OCCT.TopoDSShapePointer | undefined
  ) => void;
  update?: () => void;
};

export const model = {
  uHex: 41,
  vHex: 10,
  drawEdges: true,
  drawFaces: true,
  color: "#000000",
} as Model;
