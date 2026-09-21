import { GeometryHelper, MathBitByBit, Transforms, Vector, type Base } from "@bitbybit-dev/base";
import type { BitByBitBase } from "@bitbybit-dev/threejs";

export type Occt = BitByBitBase["occt"];
export type Shape = Awaited<ReturnType<Occt["shapes"]["solid"]["createBox"]>>;
export type Wire = Awaited<ReturnType<Occt["shapes"]["wire"]["createCircleWire"]>>;
export type Point3 = Base.Point3;
export type Transform = Base.TransformMatrixes;

export const ORIGIN: Point3 = [0, 0, 0];

const math = new MathBitByBit();

export const transforms = new Transforms(new Vector(math, new GeometryHelper()), math);
