import type * as Modeling from "@jscad/modeling";
import { Jscad } from "../jscad-service";

// One kernel per process. The JSCAD kernel is plain JavaScript with no global state to corrupt, so
// every suite in a file can share it, and loading it once keeps the suites fast.
let loaded: { jscad: Jscad; kernel: typeof Modeling } | undefined;

export type BoundingBox = [[number, number, number], [number, number, number]];

// The tests measure with the kernel's own measurement functions: a wrapper is correct when the
// library's measurements of what it built are the ones the shape should have.
export async function getJscad(): Promise<{ jscad: Jscad; kernel: typeof Modeling }> {
    if (!loaded) {
        const module = await import("../../../jscad-generated");
        const kernel = module.default();
        loaded = { jscad: new Jscad(kernel), kernel };
    }
    return loaded;
}

/** The distinct corner coordinates of a solid, as comma-joined strings. */
export function cornersOf(shape: { polygons: { vertices: number[][] }[] }): Set<string> {
    return new Set(shape.polygons.flatMap((p) => p.vertices.map((v) => v.join(","))));
}

/** The side count of a 2D geometry, which JSCAD models as a closed list of segments. */
export function sideCount(shape: { sides: unknown[] }): number {
    return shape.sides.length;
}
