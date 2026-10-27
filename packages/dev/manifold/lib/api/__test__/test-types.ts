import type * as Manifold3D from "manifold-3d";
import type { KernelHandle } from "../../../../__test__/embind-ledger-types";

export interface ManifoldPrototype {
    transform: (this: Manifold3D.Manifold, matrix: Manifold3D.Mat4) => Manifold3D.Manifold;
    subtract: (this: Manifold3D.Manifold, other: Manifold3D.Manifold) => Manifold3D.Manifold;
    delete: (this: Manifold3D.Manifold) => void;
    status: (this: Manifold3D.Manifold) => Manifold3D.ErrorStatus;
}

export interface CrossSectionPrototype {
    extrude: (this: Manifold3D.CrossSection, height: number) => Manifold3D.Manifold;
}

export interface CrossSectionReadPrototype {
    toPolygons: (this: Manifold3D.CrossSection) => Manifold3D.SimplePolygon[];
}

export type KernelVectorClass = new () => KernelHandle;

export interface CrossSectionVectorPrototype {
    push_back: (this: object, section: Manifold3D.CrossSection) => void;
}

export interface CrossSectionVectorClass {
    prototype: CrossSectionVectorPrototype;
}

export type Act = () => unknown;

export type Arranged = [string, () => Act];
