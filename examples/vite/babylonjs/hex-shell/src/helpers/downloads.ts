import type { BitByBitBase, Inputs } from "@bitbybit-dev/babylonjs";

export const downloadStep = async (
  bitbybit: BitByBitBase,
  finalShape: Inputs.OCCT.TopoDSShapePointer | undefined
) => {
  if (bitbybit && finalShape) {
    await bitbybit.occt.io.saveShapeSTEP({
      shape: finalShape,
      fileName: "shape",
      adjustYtoZ: true,
      tryDownload: true,
    });
  }
};

export const downloadSTL = (
  bitbybit: BitByBitBase,
  finalShape: Inputs.OCCT.TopoDSShapePointer | undefined
) => {
  if (bitbybit && finalShape) {
    bitbybit.occt.io.saveShapeStl({
      fileName: "bitbybit-hex-shell.stl",
      shape: finalShape,
      adjustYtoZ: true,
      tryDownload: true,
      precision: 0.01,
    });
  }
};

export const downloadGLB = (bitbybit: BitByBitBase) => {
  if (bitbybit) {
    bitbybit.babylon.io.exportGLB({
      fileName: "bitbybit-hex-shell.glb",
      discardSkyboxAndGrid: true,
    });
  }
};
