import type { BitByBitBase, Inputs } from "@bitbybit-dev/playcanvas";
import type { Entity } from "playcanvas";

export type Model = {
    uHex: number;
    vHex: number;
    height: number;
    ellipse1MinRad: number;
    ellipse1MaxRad: number;
    ellipse2MinRad: number;
    ellipse2MaxRad: number;
    ellipse2RotX: number;
    ellipse2RotY: number;
    ellipse3MinRad: number;
    ellipse3MaxRad: number;
    ellipse3YRot: number;
    drawEdges: boolean;
    drawFaces: boolean;
    color1: string;
    color2: string;
    finalPrecision: number;
    rotationEnabled: boolean;
    downloadSTL?: (scene: Entity) => void;
    downloadStep?: (
        bitbybit: BitByBitBase,
        finalShape: Inputs.OCCT.TopoDSShapePointer | undefined
    ) => void;
    downloadGLB?: (scene: Entity) => void;
    update?: () => void;
};

export const model = {
    uHex: 3,
    vHex: 12,
    height: 15,
    ellipse1MinRad: 15,
    ellipse1MaxRad: 15,
    ellipse2MinRad: 25,
    ellipse2MaxRad: 30,
    ellipse2RotX: 15,
    ellipse2RotY: 15,
    ellipse3MinRad: 45,
    ellipse3MaxRad: 90,
    ellipse3YRot: 45,
    finalPrecision: 0.05,
    drawEdges: false,
    drawFaces: true,
    rotationEnabled: false,
    color1: "#b3ccff",
    color2: "#ffffff",
} as Model;
