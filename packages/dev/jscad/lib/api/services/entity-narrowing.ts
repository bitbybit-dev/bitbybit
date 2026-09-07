import * as Inputs from "../inputs/jscad-inputs";

// A JSCAD entity is one of three unrelated shapes, and the kernel's own operations are overloaded
// per shape: `union` takes a list of 2D regions or a list of solids, never a mixture. Our published
// input type is the union of the three, because a script may hand us any of them and the kernel is
// what decides. These are the four places that gap is bridged, gathered here so the bridging is
// visible rather than spread across the services as casts.

/**
 * Reads an input that the kernel accepts either singly or as a list. The published type says one
 * entity, and a list has always worked too because the kernel's operations are variadic; declaring
 * the union would change the input's socket in the visual editors, so the coercion lives here.
 */
export function oneOrMany(geometry: Inputs.JSCAD.JSCADEntity): Inputs.JSCAD.JSCADEntity[] {
    return Array.isArray(geometry) ? geometry as Inputs.JSCAD.JSCADEntity[] : [geometry];
}

/**
 * Hands a list of entities to an operation overloaded per geometry kind. The kernel still rejects a
 * genuinely mixed list, and it is the right thing to decide that - it knows which combinations its
 * operations support and we would only be guessing ahead of it.
 */
export function asKind<T>(entities: Inputs.JSCAD.JSCADEntity[]): T[] {
    return entities as unknown as T[];
}

/**
 * Narrows to the solid an operation needs, naming the operation that wanted one. Without this the
 * kernel fails several frames deep on a property access, which tells a script author nothing about
 * what they passed.
 */
export function asSolid(entity: Inputs.JSCAD.JSCADEntity, operation: string): Inputs.JSCAD.JSCADGeom3 {
    if (!("polygons" in entity)) {
        throw new Error(`${operation} needs a 3D solid, but was given a 2D geometry or a path.`);
    }
    return entity;
}

/** Narrows to the 2D path an operation needs, naming the operation that wanted one. */
export function asPath(entity: Inputs.JSCAD.JSCADEntity, operation: string): Inputs.JSCAD.JSCADPath2 {
    if (!("isClosed" in entity)) {
        throw new Error(`${operation} needs a 2D path, but was given a 2D region or a solid.`);
    }
    return entity;
}

/** Narrows to the 2D region an operation needs, naming the operation that wanted one. */
export function asRegion(entity: Inputs.JSCAD.JSCADEntity, operation: string): Inputs.JSCAD.JSCADGeom2 {
    if (!("sides" in entity)) {
        throw new Error(`${operation} needs a 2D geometry, but was given a path or a solid.`);
    }
    return entity;
}

/**
 * Reads back what a variadic operation returned. The kernel hands back the geometry when it was
 * given one and a list when it was given several, while the published return type describes only
 * the first of those - so this is where the two meet.
 */
export function asEntity(result: unknown): Inputs.JSCAD.JSCADEntity {
    return result as Inputs.JSCAD.JSCADEntity;
}
