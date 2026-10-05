import type * as Modeling from "@jscad/modeling";
import { Jscad } from "../jscad-service";
import type * as Inputs from "../inputs/jscad-inputs";

let sharedKernel: { jscad: Jscad; kernel: typeof Modeling } | undefined;

export type BoundingBox = [[number, number, number], [number, number, number]];

export async function getJscad(): Promise<{ jscad: Jscad; kernel: typeof Modeling }> {
    if (!sharedKernel) {
        const module = await import("../../../jscad-generated");
        const kernel = module.default();
        sharedKernel = { jscad: new Jscad(kernel), kernel };
    }
    return sharedKernel;
}

export function cornersOf(shape: { polygons: { vertices: number[][] }[] }): Set<string> {
    return new Set(shape.polygons.flatMap((p) => p.vertices.map((v) => v.join(","))));
}

export function sideCount(shape: { sides: unknown[] }): number {
    return shape.sides.length;
}

function describeEntity(entity: Inputs.JSCAD.JSCADEntity): string {
    if ("polygons" in entity) {
        return "a 3D solid";
    }
    if ("isClosed" in entity) {
        return "a 2D path";
    }
    return "a 2D region";
}

export function expectPath(entity: Inputs.JSCAD.JSCADEntity): Inputs.JSCAD.JSCADPath2 {
    if (!("isClosed" in entity)) {
        throw new Error(`expected a 2D path, got ${describeEntity(entity)}`);
    }
    return entity;
}

export function expectRegion(entity: Inputs.JSCAD.JSCADEntity): Inputs.JSCAD.JSCADGeom2 {
    if (!("sides" in entity)) {
        throw new Error(`expected a 2D region, got ${describeEntity(entity)}`);
    }
    return entity;
}

export function expectSolid(entity: Inputs.JSCAD.JSCADEntity): Inputs.JSCAD.JSCADGeom3 {
    if (!("polygons" in entity)) {
        throw new Error(`expected a 3D solid, got ${describeEntity(entity)}`);
    }
    return entity;
}

export function asOne(result: Inputs.JSCAD.JSCADEntity | Inputs.JSCAD.JSCADEntity[]): Inputs.JSCAD.JSCADEntity {
    if (Array.isArray(result)) {
        throw new Error(`expected a single entity, got a list of ${result.length}`);
    }
    return result;
}
