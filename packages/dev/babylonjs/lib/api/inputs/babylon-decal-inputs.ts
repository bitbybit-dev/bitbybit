/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace BabylonDecal {

    export class CreateMeshDecalDto {
        constructor(sourceMesh?: BABYLON.AbstractMesh, texture?: BABYLON.BaseTexture, position?: Base.Point3, normal?: Base.Vector3, size?: Base.Vector3, angle?: number, cullBackFaces?: boolean, localMode?: boolean, zOffset?: number) {
            if (sourceMesh !== undefined) { this.sourceMesh = sourceMesh; }
            if (texture !== undefined) { this.texture = texture; }
            if (position !== undefined) { this.position = position; }
            if (normal !== undefined) { this.normal = normal; }
            if (size !== undefined) { this.size = size; }
            if (angle !== undefined) { this.angle = angle; }
            if (cullBackFaces !== undefined) { this.cullBackFaces = cullBackFaces; }
            if (localMode !== undefined) { this.localMode = localMode; }
            if (zOffset !== undefined) { this.zOffset = zOffset; }
        }
        /**
         * Mesh to project the decal onto. The decal is created as a clipped child mesh hugging the surface.
         * @default undefined
         */
        sourceMesh: BABYLON.AbstractMesh;
        /**
         * Image texture to project. Create it via texture image, and keep an alpha channel for cutout decals.
         * @default undefined
         */
        texture: BABYLON.BaseTexture;
        /**
         * Position of the decal projector in world coordinates. Often picked from a ray/pick hit on the mesh.
         * @default [0, 0, 0]
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * Direction the decal is projected along, in world coordinates. Usually the surface normal at the hit point.
         * @default [0, 1, 0]
         */
        normal: Base.Vector3 = [0, 1, 0];
        /**
         * Size of the decal box on each axis. The third value is the projection depth.
         * @default [1, 1, 1]
         */
        size: Base.Vector3 = [1, 1, 1];
        /**
         * Angle to rotate the decal around the projection direction, in radians.
         * @default 0
         * @step 0.1
         */
        angle = 0;
        /**
         * Remove back faces from the decal mesh so it only sticks to faces pointing towards the projector.
         * @default true
         */
        cullBackFaces = true;
        /**
         * Compute the decal using the local mesh coordinates instead of world space. Useful when the source mesh is transformed.
         * @default false
         */
        localMode = false;
        /**
         * Depth bias used to avoid z-fighting between the decal and the surface. Negative values push the decal towards the camera.
         * @default -2
         * @step 0.5
         */
        zOffset = -2;
    }

    export class EnableDecalMapDto {
        constructor(mesh?: BABYLON.AbstractMesh, material?: BABYLON.Material, width?: number, height?: number) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (material !== undefined) { this.material = material; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * Mesh on which a UV-space decal map should be enabled. The mesh must have proper, non-overlapping UV coordinates.
         * @default undefined
         */
        mesh: BABYLON.AbstractMesh;
        /**
         * Material of the mesh on which the decal map plugin should be turned on so projected decals are blended in the shader.
         * @default undefined
         */
        material: BABYLON.Material;
        /**
         * Width in pixels of the internal decal map render target.
         * @default 1024
         */
        width = 1024;
        /**
         * Height in pixels of the internal decal map render target.
         * @default 1024
         */
        height = 1024;
    }

    export class ProjectDecalDto {
        constructor(decalMap?: BABYLON.MeshUVSpaceRenderer, texture?: BABYLON.BaseTexture, position?: Base.Point3, normal?: Base.Vector3, size?: Base.Vector3, angle?: number) {
            if (decalMap !== undefined) { this.decalMap = decalMap; }
            if (texture !== undefined) { this.texture = texture; }
            if (position !== undefined) { this.position = position; }
            if (normal !== undefined) { this.normal = normal; }
            if (size !== undefined) { this.size = size; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * Decal map renderer obtained from enabling a decal map on a mesh. Projected decals accumulate into it.
         * @default undefined
         */
        decalMap: BABYLON.MeshUVSpaceRenderer;
        /**
         * Image texture to project into the mesh UV space.
         * @default undefined
         */
        texture: BABYLON.BaseTexture;
        /**
         * Position of the projector in world coordinates.
         * @default [0, 0, 0]
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * Projection direction in world coordinates, usually the surface normal at the projection point.
         * @default [0, 1, 0]
         */
        normal: Base.Vector3 = [0, 1, 0];
        /**
         * Size of the projection box on each axis.
         * @default [1, 1, 1]
         */
        size: Base.Vector3 = [1, 1, 1];
        /**
         * Angle to rotate the projection around the projection direction, in radians.
         * @default 0
         * @step 0.1
         */
        angle = 0;
    }

    export class DecalMapDto {
        constructor(decalMap?: BABYLON.MeshUVSpaceRenderer) {
            if (decalMap !== undefined) { this.decalMap = decalMap; }
        }
        /**
         * Decal map renderer to operate on.
         * @default undefined
         */
        decalMap: BABYLON.MeshUVSpaceRenderer;
    }
}
