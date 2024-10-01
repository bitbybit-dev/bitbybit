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
        constructor(babylonMesh?: BABYLON.Mesh, position?: Base.Point3, rotation?: Base.Vector3, scaling?: Base.Vector3, colours?: string | string[]) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (position !== undefined) { this.position = position; }
            if (rotation !== undefined) { this.rotation = rotation; }
            if (scaling !== undefined) { this.scaling = scaling; }
            if (colours !== undefined) { this.colours = colours; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh, parentMesh?: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (parentMesh !== undefined) { this.parentMesh = parentMesh; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, position?: Base.Point3) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (position !== undefined) { this.position = position; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, rotation?: Base.Vector3) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (rotation !== undefined) { this.rotation = rotation; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, scale?: Base.Vector3) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (scale !== undefined) { this.scale = scale; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, babylonMesh2?: BABYLON.Mesh | BABYLON.InstancedMesh, precise?: boolean, includeDescendants?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (babylonMesh2 !== undefined) { this.babylonMesh2 = babylonMesh2; }
            if (precise !== undefined) { this.precise = precise; }
            if (includeDescendants !== undefined) { this.includeDescendants = includeDescendants; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, point?: Base.Point3) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (point !== undefined) { this.point = point; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh;
    }
    export class MergeMeshesDto {
        constructor (arrayOfMeshes?: BABYLON.Mesh[], disposeSource?: boolean, allow32BitsIndices?: boolean, meshSubclass?: BABYLON.Mesh, subdivideWithSubMeshes?: boolean, multiMultiMaterials?: boolean) {
            if (arrayOfMeshes !== undefined) { this.arrayOfMeshes = arrayOfMeshes; }
            if (disposeSource !== undefined) { this.disposeSource = disposeSource; }
            if (allow32BitsIndices !== undefined) { this.allow32BitsIndices = allow32BitsIndices; }
            if (meshSubclass !== undefined) { this.meshSubclass = meshSubclass; }
            if (subdivideWithSubMeshes !== undefined) { this.subdivideWithSubMeshes = subdivideWithSubMeshes; }
            if (multiMultiMaterials !== undefined) { this.multiMultiMaterials = multiMultiMaterials; }
        }
        /**
         * meshes array of meshes with the vertices to merge. Entries cannot be empty meshes.
         * @default undefined
         */
        arrayOfMeshes: BABYLON.Mesh[];
        /**
         * disposeSource when true (default), dispose of the vertices from the source meshes.
         * @default true
         */
        disposeSource = true;
        /**
         * allow32BitsIndices when the sum of the vertices > 64k, this must be set to true.
         * @default false
         */
        allow32BitsIndices = false;
        /**
         * meshSubclass (optional) can be set to a Mesh where the merged vertices will be inserted.
         * @default undefined
         * @optional true
         */
        meshSubclass?: BABYLON.Mesh;
        /**
         * subdivideWithSubMeshes when true (false default), subdivide mesh into subMeshes.
         * @default false
         */
        subdivideWithSubMeshes = false;
        /**
         * multiMultiMaterials when true (false default), subdivide mesh into subMeshes with multiple materials, ignores subdivideWithSubMeshes.
         * @default false
         */
        multiMultiMaterials = false;
    }
    export class BabylonMeshWithChildrenDto {
        constructor(babylonMesh?: BABYLON.Mesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh;
        /**
         * Include children when performing action
         * @default true
         */
        includeChildren = true;
    }
    
    export class ShowHideMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: BABYLON.Mesh;
    }
    export class ChildMeshesBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, directDescendantsOnly?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (directDescendantsOnly !== undefined) { this.directDescendantsOnly = directDescendantsOnly; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh, distance?: number) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (distance !== undefined) { this.distance = distance; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh, name?: string, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (name !== undefined) { this.name = name; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }

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
        includeChildren? = false;
    }
    export class ByNameBabylonMeshDto {
        constructor(name?: string) {
            if (name !== undefined) { this.name = name; }
        }
        /**
         * name of the mesh
         * @default undefined
         */
        name: string;
    }
    export class MaterialBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, material?: BABYLON.Material, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (material !== undefined) { this.material = material; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh, id?: string) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (id !== undefined) { this.id = id; }
        }
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
        constructor(id?: string) {
            if (id !== undefined) { this.id = id; }
        }
        /**
         * id of the mesh
         * @default undefined
         */
        id: string;
    }

    export class UniqueIdBabylonMeshDto {
        constructor(uniqueId?: number) {
            if (uniqueId !== undefined) { this.uniqueId = uniqueId; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh, pickable?: boolean, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (pickable !== undefined) { this.pickable = pickable; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh, checkCollisions?: boolean, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (checkCollisions !== undefined) { this.checkCollisions = checkCollisions; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh, rotate?: number) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (rotate !== undefined) { this.rotate = rotate; }
        }
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
        constructor(babylonMesh?: BABYLON.Mesh, visibility?: number, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (visibility !== undefined) { this.visibility = visibility; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
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
        constructor(mesh?: BABYLON.Mesh, position?: Base.Point3, rotation?: Base.Vector3, scaling?: Base.Vector3) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (position !== undefined) { this.position = position; }
            if (rotation !== undefined) { this.rotation = rotation; }
            if (scaling !== undefined) { this.scaling = scaling; }
        }
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
        constructor(mesh?: BABYLON.Mesh) {
            if (mesh !== undefined) { this.mesh = mesh; }
        }
        /**
         * BabylonJS mesh
         * @default undefined
         */
        mesh: BABYLON.Mesh;
    }
    export class RotateAroundAxisNodeDto {
        constructor(mesh?: BABYLON.Mesh, position?: Base.Point3, axis?: Base.Vector3, angle?: number) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (position !== undefined) { this.position = position; }
            if (axis !== undefined) { this.axis = axis; }
            if (angle !== undefined) { this.angle = angle; }
        }
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
