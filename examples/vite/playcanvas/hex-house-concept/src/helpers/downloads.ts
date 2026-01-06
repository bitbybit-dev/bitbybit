import type { BitByBitBase, Inputs } from "@bitbybit-dev/playcanvas";

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
