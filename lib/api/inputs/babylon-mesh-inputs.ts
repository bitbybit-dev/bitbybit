/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace BabylonMesh {

    export enum sideOrientationEnum {
        frontside = "frontside",
        backside = "backside",
        doubleside = "doubleside"
    }
    
    export class UpdateDrawnBabylonMesh {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh;
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
        babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh;
        /**
         * BabylonJS Mesh to use as a parent
         * @default undefined
         */
        parentMesh: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh;
    }
    export class UpdateDrawnBabylonMeshPositionDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
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
        babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
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
        babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
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
        babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh2: BABYLON.Mesh | BABYLON.InstancedMesh;
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
        babylonMesh: BABYLON.Mesh | BABYLON.InstancedMesh;
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
        babylonMesh: BABYLON.Mesh;
    }
    export class ShowHideMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh;
        /**
         * Include children when showing hiding
         * @default true
         */
        includeChildren = true;
    }
    export class CloneBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh;
    }
    export class ChildMeshesBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh;
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
        babylonMesh: BABYLON.Mesh;
        /**
         * distance to translate
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        distance = 0;
    }
    export class NameBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         * 
         */
        babylonMesh?: BABYLON.Mesh;
        /**
         * name of the mesh
         * @default undefined
         */
        name: string;
        /**
         * Set name also on children
         * @default false
         */
        includeChildren?= false;
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
        babylonMesh?: BABYLON.Mesh;
        /**
         * material of the mesh
         * @default undefined
         */
        material: BABYLON.Material;
        /**
         * Set material on children also
         * @default false
         */
        includeChildren = false;
    }
    export class IdBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh?: BABYLON.Mesh;
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
        babylonMesh: BABYLON.Mesh;
        /**
         * Pickable
         * @default false
         */
        pickable = false;
        /**
         * Apply set to children also
         * @default false
         */
        includeChildren = false;
    }

    export class CheckCollisionsBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh;
        /**
         * Check collisions
         * @default false
         */
        checkCollisions = false;
        /**
         * Apply set to children also
         * @default false
         */
        includeChildren = false;
    }
    export class RotateBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh;
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
        babylonMesh: BABYLON.Mesh;
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
        includeChildren = false;
    }
    export class MeshInstanceAndTransformDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        mesh: BABYLON.Mesh;
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
        mesh: BABYLON.Mesh;
    }
    export class RotateAroundAxisNodeDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        mesh: BABYLON.Mesh;
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * The rotation angle expressed in degrees
         */
        angle = 0;
    }
}
