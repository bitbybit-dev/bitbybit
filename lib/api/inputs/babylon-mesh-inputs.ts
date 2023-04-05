import { AbstractMesh, InstancedMesh, Material, Mesh } from '@babylonjs/core';
import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace BabylonMesh {

    export class UpdateDrawnBabylonMesh {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Position to place the mesh into
         * @default undefined
         */
        position: Base.Point3;
        /**
         * Rotation for the mesh
         * @default undefined
         */
        rotation: Base.Vector3;
        /**
         * Scale mesh to certain value
         * @default undefined
         */
        scaling: Base.Vector3;
        /**
         * Colours or a single colour to change
         * @default undefined
         */
        colours: string | string[];
    }

    export class SetParentDto {
        /**
         * BabylonJS Mesh that needs to change it's parent
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh | AbstractMesh;
        /**
         * BabylonJS Mesh to use as a parent
         * @default undefined
         */
        parentMesh: Mesh | InstancedMesh | AbstractMesh;
    }
    export class UpdateDrawnBabylonMeshPositionDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Position to place the mesh into
         * @default undefined
         */
        position: Base.Point3;
    }
    export class UpdateDrawnBabylonMeshRotationDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Rotation for the mesh
         * @default undefined
         */
        rotation: Base.Vector3;
    }

    export class UpdateDrawnBabylonMeshScaleDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Scale for the mesh
         * @default undefined
         */
        scale: Base.Vector3;
    }

    export class IntersectsMeshDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh2: Mesh | InstancedMesh;
        /**
         * Should check precisely
         * @default false
         */
        precise = false;
        /**
         * Check descendant intersections as well
         * @default false
         */
        includeDescendants = false;
    }
    export class IntersectsPointDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * point
         * @default undefined
         */
        point: Base.Point3;
    }

    export class BabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
    }
    export class ShowHideMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Include children when showing hiding
         * @default true
         */
        includeChildren: boolean = true;
    }
    export class CloneBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
    }
    export class ChildMeshesBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Include only direct descendants
         * @default false
         */
        directDescendantsOnly = false;
    }
    export class TranslateBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * distance to translate
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        distance: number = 0;
    }
    export class NameBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         * 
         */
        babylonMesh?: Mesh;
        /**
         * name of the mesh
         * @default undefined
         */
        name: string;
        /**
         * Set name also on children
         * @default false
         */
        includeChildren?: boolean = false;
    }
    export class ByNameBabylonMeshDto {
        /**
         * name of the mesh
         * @default undefined
         */
        name: string;
    }
    export class MaterialBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh?: Mesh;
        /**
         * material of the mesh
         * @default undefined
         */
        material: Material;
        /**
         * Set material on children also
         * @default false
         */
        includeChildren: boolean = false;
    }
    export class IdBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh?: Mesh;
        /**
         * id of the mesh
         * @default undefined
         */
        id: string;
    }
    export class ByIdBabylonMeshDto {
        /**
         * id of the mesh
         * @default undefined
         */
        id: string;
    }

    export class UniqueIdBabylonMeshDto {
        /**
         * Unique id of the mesh
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        uniqueId: number;
    }
    export class PickableBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Pickable
         * @default false
         */
        pickable: boolean = false;
        /**
         * Apply set to children also
         * @default false
         */
        includeChildren: boolean = false;
    }

    export class CheckCollisionsBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Check collisions
         * @default false
         */
        checkCollisions: boolean = false;
        /**
         * Apply set to children also
         * @default false
         */
        includeChildren: boolean = false;
    }
    export class RotateBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * rotate to translate
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        rotate: number;
    }
    export class SetMeshVisibilityDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Shows mesh if 0 and shows if 1
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        visibility = 0;
        /**
         * Include children
         * @default false
         */
        includeChildren: boolean = false;
    }
    export class MeshInstanceAndTransformDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        mesh: Mesh;
        /**
         * Position
         * @default undefined
         */
        position: Base.Point3;
        /**
         * Rotation
         * @default undefined
         */
        rotation: Base.Vector3;
        /**
         * Scaling
         * @default undefined
         */
        scaling: Base.Vector3;
    }
    export class MeshInstanceDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        mesh: Mesh;
    }
}
