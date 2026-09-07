import type * as Modeling from "@jscad/modeling";
import { Jscad } from "../jscad-service";
import type * as Inputs from "../inputs/jscad-inputs";

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

// A JSCAD entity is one of three unrelated shapes and the API returns the union, so a test that
// wants to read a path's points has to establish it got a path first. These narrow and say what
// arrived when it is the wrong kind - an assertion that simply read `.points` off a solid would
// otherwise compare undefined against undefined and pass.

function describeEntity(entity: Inputs.JSCAD.JSCADEntity): string {
    if ("polygons" in entity) return "a 3D solid";
    if ("isClosed" in entity) return "a 2D path";
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

/**
 * Reads back a result the API returns either singly or as a list, asserting it is the single case -
 * a test that meant to colour one solid should fail loudly if it was handed a list instead.
 */
export function asOne(result: Inputs.JSCAD.JSCADEntity | Inputs.JSCAD.JSCADEntity[]): Inputs.JSCAD.JSCADEntity {
    if (Array.isArray(result)) {
        throw new Error(`expected a single entity, got a list of ${result.length}`);
    }
    return result;
}
