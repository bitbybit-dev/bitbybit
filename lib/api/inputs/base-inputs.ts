
// tslint:disable-next-line: no-namespace
export namespace Base {
    // Can't use BabylonJS types here as that crashes worker, which tries to include them
    export type Color = string;
    export type ColorRGB = {r: number, g: number, b: number};
    export type Point2 = [number, number];
    export type Vector2 = [number, number];
    export type Point3 = [number, number, number];
    export type Vector3 = [number, number, number];
    export type Line2 = { start: Base.Point2, end: Base.Point2 };
    export type Line3 = { start: Base.Point3, end: Base.Point3 };
    export type TransformMatrixes = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number][];
    
    // tslint:disable-next-line: no-namespace
    export enum skyboxEnum {
        default = "default",
        clearSky = "clearSky",
        city = "city"
    }
}
