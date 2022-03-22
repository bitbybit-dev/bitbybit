import { AbstractMesh, InstancedMesh, Mesh } from '@babylonjs/core';
import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace BabylonMesh {

    export class UpdateDrawnBabylonMesh {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh;
        /**
         * Position to place the mesh into
         */
        position: Base.Point3;
        /**
         * Rotation for the mesh
         */
        rotation: Base.Vector3;
        /**
         * Scale mesh to certain value
         */
        scaling: Base.Vector3;
        /**
         * Colours or a single colour to change
         */
        colours: string | string[];
    }

    export class SetParentDto {
        /**
         * BabylonJS Mesh that needs to change it's parent
         */
        babylonMesh: Mesh | InstancedMesh | AbstractMesh;
        /**
         * BabylonJS Mesh to use as a parent
         */
        parentMesh: Mesh | InstancedMesh | AbstractMesh;
    }
    export class UpdateDrawnBabylonMeshPositionDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Position to place the mesh into
         */
        position: Base.Point3;
    }
    export class UpdateDrawnBabylonMeshRotationDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Rotation for the mesh
         */
        rotation: Base.Vector3;
    }

    export class UpdateDrawnBabylonMeshScaleDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Scale for the mesh
         */
        scale: Base.Vector3;
    }

    export class BabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
    }
    export class TranslateBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * distance to translate
         */
        distance: number;
    }
    export class RotateBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * rotate to translate
         */
        rotate: number;
    }
    export class SetMeshVisibilityDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Shows mesh if 0 and shows if 1
         */
        visibility = 0;
    }
    export class MeshInstanceAndTransformDto {
        mesh: Mesh;
        position: Base.Point3;
        rotation: Base.Vector3;
        scaling: Base.Vector3;
    }
    export class MeshInstanceDto {
        mesh: Mesh;
    }
}
