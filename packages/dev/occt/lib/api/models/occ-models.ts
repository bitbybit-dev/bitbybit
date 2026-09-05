/**
 * A shape paired with a stable identifier. Operations that return many shapes use it so a
 * caller can match results back to what produced them - which face a fillet was applied to, which
 * part a section came from - instead of relying on array order.
 */
export class ShapeWithId<U> {
    id: string;
    shape: U;
}

/**
 * One named object in an assembly or a scene description: what it is, where it sits, and which
 * shape it refers to.
 */
export class ObjectDefinition<M, U> {
    compound?: U;
    shapes?: ShapeWithId<U>[];
    data?: M;
}
