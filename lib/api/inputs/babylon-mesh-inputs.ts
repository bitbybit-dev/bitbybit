import { AbstractMesh, InstancedMesh, Material, Mesh } from '@babylonjs/core';
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

    export class IntersectsMeshDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh2: Mesh | InstancedMesh;
        /**
         * Should check precisely
         */
        precise = false;
        /**
         * Check descendant intersections as well
         */
        includeDescendants = false;
    }
    export class IntersectsPointDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * point
         */
        point: Base.Point3;
    }

    export class BabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
    }
    export class ShowHideMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Include children when showing hiding
         */
        includeChildren: Boolean;
    }
    export class CloneBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
    }
    export class ChildMeshesBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Include only direct descendants
         */
        directDescendantsOnly = false;
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
    export class NameBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh?: Mesh;
        /**
         * name of the mesh
         */
        name: string;
        /**
         * Set name also on children
         */
        includeChildren?: boolean;
    }
    export class MaterialBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh?: Mesh;
        /**
         * material of the mesh
         */
        material: Material;
        /**
         * Set material on children also
         */
        includeChildren: Boolean;
    }
    export class IdBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh?: Mesh;
        /**
         * id of the mesh
         */
        id: string;
    }

    export class UniqueIdBabylonMeshDto {
        /**
         * Unique id of the mesh
         */
        uniqueId: number;
    }
    export class PickableBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Pickable
         */
        pickable: boolean;
        /**
         * Apply set to children also
         */
        includeChildren: boolean;
    }

    export class CheckCollisionsBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Check collisions
         */
        checkCollisions: boolean;
        /**
         * Apply set to children also
         */
        includeChildren: boolean;
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
        /**
         * Include children
         */
        includeChildren: boolean;
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
