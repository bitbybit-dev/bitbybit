import type { BitByBitBase, Inputs } from "@bitbybit-dev/playcanvas";
import type { Entity } from "playcanvas";

export const downloadStep = async (
    bitbybit: BitByBitBase,
    finalShape: Inputs.OCCT.TopoDSShapePointer | undefined
) => {
    if (bitbybit && finalShape) {
        // playcanvas is right handed - originally bitbybit was built on left handed system, thus this compensation is needed till
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

export const downloadSTL = (scene: Entity) => {
    // PlayCanvas doesn't have built-in STL exporter like Three.js
    // For now, log a message - could implement custom exporter later
    console.warn("STL export is not yet implemented for PlayCanvas");
};

export const downloadGLB = (scene: Entity) => {
    // PlayCanvas doesn't have built-in GLB exporter like Three.js
    // For now, log a message - could implement custom exporter later
    console.warn("GLB export is not yet implemented for PlayCanvas");
};
