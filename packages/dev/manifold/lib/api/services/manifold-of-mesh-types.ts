import type * as Manifold3D from "manifold-3d";

export type KernelManifoldConstructor = new (mesh: Manifold3D.Mesh) => Manifold3D.Manifold;

export type ManifoldErrorConstructor = new (status: Manifold3D.ErrorStatus) => Error;
