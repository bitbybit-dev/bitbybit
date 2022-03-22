
// tslint:disable-next-line: no-namespace
export namespace Base {
    // Can't use BabylonJS types here as that crashes worker, which tries to include them
    export type Point2 = [number, number];
    export type Vector2 = [number, number];
    export type Point3 = [number, number, number];
    export type Vector3 = [number, number, number];
}
