import type * as Manifold3D from "manifold-3d";

export interface ManifoldPrototype {
    transform: (this: Manifold3D.Manifold, matrix: Manifold3D.Mat4) => Manifold3D.Manifold;
    subtract: (this: Manifold3D.Manifold, other: Manifold3D.Manifold) => Manifold3D.Manifold;
    delete: (this: Manifold3D.Manifold) => void;
}

export interface CrossSectionPrototype {
    extrude: (this: Manifold3D.CrossSection, height: number) => Manifold3D.Manifold;
}
