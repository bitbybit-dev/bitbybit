export class ShapeWithId<U>{
    id: string;
    shape: U;
}

export class ObjectDefinition<M, U>{
    compound?: U;
    shapes?: ShapeWithId<U>[];
    data?: M;
}
