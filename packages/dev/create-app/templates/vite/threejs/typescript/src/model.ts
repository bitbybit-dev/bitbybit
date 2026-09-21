import type { BitByBitBase } from "@bitbybit-dev/threejs";

export type Occt = BitByBitBase["occt"];

export type Shape = Awaited<ReturnType<Occt["fillets"]["filletEdges"]>>;

export interface ModelParams {
    size: number;
    filletRadius: number;
}

export const defaultParams: ModelParams = {
    size: 2.5,
    filletRadius: 0.4,
};

export async function buildModel(occt: Occt, params: ModelParams): Promise<Shape> {
    const cube = await occt.shapes.solid.createCube({
        size: params.size,
        center: [0, params.size / 2, 0],
        originOnCenter: true,
    });
    return occt.fillets.filletEdges({ shape: cube, radius: params.filletRadius });
}
