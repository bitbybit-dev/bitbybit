/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
/**
 * Parameters for mesh objects in the scene: visibility, picking, parenting, position, rotation and
 * scale, material assignment, and the options for cloning, merging and disposing a mesh.
 */
export namespace BabylonMesh {

    /**
     * Which face of a surface is rendered: the front, the back, or both. Meshes are single-sided by
     * default, so a surface can look missing when viewed from behind - setting this to double-sided is
     * the usual fix.
     */
    export enum sideOrientationEnum {
        frontside = "frontside",
        backside = "backside",
        doubleside = "doubleside"
    }

    /**
     * Feeds `babylon.mesh.updateDrawn`: a drawn mesh and the placement, rotation in radians,
     * scaling and colors to apply to it in place.
     */
    export class UpdateDrawnBabylonMesh {
        constructor(babylonMesh?: BABYLON.Mesh, position?: Base.Point3, rotation?: Base.Vector3, scaling?: Base.Vector3, colours?: string | string[]) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (position !== undefined) { this.position = position; }
            if (rotation !== undefined) { this.rotation = rotation; }
            if (scaling !== undefined) { this.scaling = scaling; }
            if (colours !== undefined) { this.colours = colours; }
        }
        /**
         * The drawn mesh to change in place
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * Where to place the mesh, relative to its parent
         * @default undefined
         */
        position!: Base.Point3;
        /**
         * The rotation angles around X, Y and Z, in radians, replacing the current rotation
         * @default undefined
         */
        rotation!: Base.Vector3;
        /**
         * The scale factors along X, Y and Z, 1 being unscaled
         * @default undefined
         */
        scaling!: Base.Vector3;
        /**
         * One hex color, or a list with one entry per child mesh or per point or line of a point or
         * line drawing; other lists use the first entry
         * @default undefined
         */
        colours!: string | string[];
    }

    /**
     * Feeds `babylon.mesh.setParent` and `babylon.mesh.getParent`: the mesh and the mesh it is
     * parented to, so it moves with it.
     */
    export class SetParentDto {
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh, parentMesh?: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (parentMesh !== undefined) { this.parentMesh = parentMesh; }
        }
        /**
         * The mesh whose parent is set or read
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh;
        /**
         * The mesh to parent to; the child then moves, turns and scales with it
         * @default undefined
         */
        parentMesh!: BABYLON.Mesh | BABYLON.InstancedMesh | BABYLON.AbstractMesh;
    }
    /**
     * Feeds `babylon.mesh.setPosition` with a mesh, or an instance, and the point to place it at
     * relative to its parent.
     */
    export class UpdateDrawnBabylonMeshPositionDto {
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, position?: Base.Point3) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (position !== undefined) { this.position = position; }
        }
        /**
         * The mesh or instance to move
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh | BABYLON.InstancedMesh;
        /**
         * Where to place it, relative to its parent
         * @default undefined
         */
        position!: Base.Point3;
    }
    /**
     * Feeds `babylon.mesh.setRotation` with a mesh, or an instance, and its new rotation as three
     * angles in degrees.
     */
    export class UpdateDrawnBabylonMeshRotationDto {
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, rotation?: Base.Vector3) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (rotation !== undefined) { this.rotation = rotation; }
        }
        /**
         * The mesh or instance to turn
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh | BABYLON.InstancedMesh;
        /**
         * The angles around X, Y and Z in degrees, replacing the current rotation
         * @default undefined
         */
        rotation!: Base.Vector3;
    }

    /**
     * Feeds `babylon.mesh.setScale` with a mesh, or an instance, and its new scale factors per
     * axis.
     */
    export class UpdateDrawnBabylonMeshScaleDto {
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, scale?: Base.Vector3) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (scale !== undefined) { this.scale = scale; }
        }
        /**
         * The mesh or instance to scale
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh | BABYLON.InstancedMesh;
        /**
         * The scale factors along X, Y and Z, 1 being unscaled, replacing the current scale
         * @default undefined
         */
        scale!: Base.Vector3;
    }
    /**
     * Feeds `babylon.mesh.setLocalScale` with a mesh, or an instance, and one factor that
     * multiplies its current scale on every axis.
     */
    export class ScaleInPlaceDto {
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, scale?: number) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (scale !== undefined) { this.scale = scale; }
        }
        /**
         * The mesh or instance to scale
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh | BABYLON.InstancedMesh;
        /**
         * The factor the current scale is multiplied by on every axis; 2 doubles the size
         * @default 1
         */
        scale = 1;
    }
    /**
     * Feeds `babylon.mesh.intersectsMesh` with the two meshes to test for overlap and how carefully
     * to test.
     */
    export class IntersectsMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, babylonMesh2?: BABYLON.Mesh | BABYLON.InstancedMesh, precise?: boolean, includeDescendants?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (babylonMesh2 !== undefined) { this.babylonMesh2 = babylonMesh2; }
            if (precise !== undefined) { this.precise = precise; }
            if (includeDescendants !== undefined) { this.includeDescendants = includeDescendants; }
        }
        /**
         * The first mesh of the pair
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh | BABYLON.InstancedMesh;
        /**
         * The second mesh of the pair
         * @default undefined
         */
        babylonMesh2!: BABYLON.Mesh | BABYLON.InstancedMesh;
        /**
         * When true, boxes that follow each mesh's rotation are tested instead of axis-aligned
         * ones, a slower but tighter check
         * @default false
         */
        precise = false;
        /**
         * When true, the child meshes of both are tested as well
         * @default false
         */
        includeDescendants = false;
    }
    /**
     * Feeds `babylon.mesh.intersectsPoint` with a mesh and the point to test against its bounding
     * box.
     */
    export class IntersectsPointDto {
        constructor(babylonMesh?: BABYLON.Mesh | BABYLON.InstancedMesh, point?: Base.Point3) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (point !== undefined) { this.point = point; }
        }
        /**
         * The mesh whose bounds are tested
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh | BABYLON.InstancedMesh;
        /**
         * The point tested for lying inside the mesh's bounding box
         * @default undefined
         */
        point!: Base.Point3;
    }

    /**
     * Feeds the `babylon.mesh` methods that take just a mesh: dispose, clone, the getters for
     * position, rotation, scale, name, material and ids, and the triangle read-out.
     */
    export class BabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * The mesh to act on or read from
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
    }
    /**
     * Feeds `babylon.mesh.cloneToPositions` with the mesh to copy and the points to put the copies
     * at.
     */
    export class CloneToPositionsDto {
        constructor(babylonMesh?: BABYLON.Mesh, positions?: Base.Point3[]) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (positions !== undefined) { this.positions = positions; }
        }
        /**
         * The mesh to copy; it stays where it is
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * One point per copy, in the order the copies come back
         * @default []
         */
        positions: Base.Point3[] = [];
    }
    /**
     * Feeds `babylon.mesh.mergeMeshes` with the meshes to join into one and the merge options of
     * the engine.
     */
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
         * The meshes to join; none of them may be empty
         * @default undefined
         */
        arrayOfMeshes!: BABYLON.Mesh[];
        /**
         * When true, the source meshes are removed once merged
         * @default true
         */
        disposeSource = true;
        /**
         * Set true when the meshes together have more than 65 thousand vertices, or the merge fails
         * @default false
         */
        allow32BitsIndices = false;
        /**
         * An existing mesh to merge the vertices into instead of creating a new one
         * @default undefined
         * @optional true
         */
        meshSubclass?: BABYLON.Mesh | undefined;
        /**
         * When true, each source becomes a sub-mesh of the result, keeping their boundaries
         * @default false
         */
        subdivideWithSubMeshes = false;
        /**
         * When true, each source keeps its own material in a multi-material result; overrides
         * `subdivideWithSubMeshes`
         * @default false
         */
        multiMultiMaterials = false;
    }
    /**
     * Feeds `babylon.mesh.enablePointerMoveEvents` and `disablePointerMoveEvents` with a mesh and
     * whether its children follow.
     */
    export class BabylonMeshWithChildrenDto {
        constructor(babylonMesh?: BABYLON.Mesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * The mesh to change
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * When true, the change is applied to the child meshes as well
         * @default true
         */
        includeChildren = true;
    }
    
    /**
     * Feeds `babylon.mesh.show` and `babylon.mesh.hide` with a mesh and whether its children
     * follow.
     */
    export class ShowHideMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
        /**
         * The mesh whose visibility is switched
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * When true, the child meshes are shown or hidden too
         * @default true
         */
        includeChildren = true;
    }
    /**
     * A mesh to copy; `babylon.mesh.clone` reads the plainer `BabylonMeshDto`, so this class is
     * here for symmetry.
     */
    export class CloneBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * The mesh to copy
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
    }
    /**
     * Feeds `babylon.mesh.getChildMeshes` with a mesh and whether to list only its direct children.
     */
    export class ChildMeshesBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, directDescendantsOnly?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (directDescendantsOnly !== undefined) { this.directDescendantsOnly = directDescendantsOnly; }
        }
        /**
         * The mesh whose children are listed
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * When true, only the direct children are listed; when false, every descendant
         * @default false
         */
        directDescendantsOnly = false;
    }
    /**
     * Feeds the `babylon.mesh.move` methods with a mesh and how far to move it along its own axis.
     */
    export class TranslateBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, distance?: number) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * The mesh to move
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * How far to move, in scene units; negative moves the other way
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        distance = 0;
    }
    /**
     * Feeds `babylon.mesh.setName` with a mesh, the name to give it and whether its children get it
     * too.
     */
    export class NameBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, name?: string, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (name !== undefined) { this.name = name; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }

        /**
         * The mesh to rename
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * The new name, which `getMeshesWhereNameContains` searches
         * @default undefined
         */
        name!: string;
        /**
         * When true, the child meshes get the same name
         * @default false
         */
        includeChildren?: boolean | undefined = false;
    }
    /**
     * Feeds `babylon.mesh.getMeshesWhereNameContains` with the text to look for in mesh names.
     */
    export class ByNameBabylonMeshDto {
        constructor(name?: string) {
            if (name !== undefined) { this.name = name; }
        }
        /**
         * The text a mesh's name must contain, case-sensitive
         * @default undefined
         */
        name!: string;
    }
    /**
     * Feeds `babylon.mesh.setMaterial` with a mesh, the material to give it and whether its
     * children get it too.
     */
    export class MaterialBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, material?: BABYLON.Material, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (material !== undefined) { this.material = material; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
        /**
         * The mesh whose material is set
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * The material the faces are drawn with from then on
         * @default undefined
         */
        material!: BABYLON.Material;
        /**
         * When true, the child meshes get the same material
         * @default false
         */
        includeChildren = false;
    }
    /**
     * Feeds `babylon.mesh.setId` and `babylon.mesh.getId` with a mesh and the id, a label that need
     * not be unique.
     */
    export class IdBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, id?: string) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (id !== undefined) { this.id = id; }
        }
        /**
         * The mesh whose id is set or read
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * The id to set; several meshes may share one
         * @default undefined
         */
        id!: string;
    }
    /**
     * Feeds `babylon.mesh.getMeshOfId` and `babylon.mesh.getMeshesOfId` with the id to look for in
     * the scene.
     */
    export class ByIdBabylonMeshDto {
        constructor(id?: string) {
            if (id !== undefined) { this.id = id; }
        }
        /**
         * The id a mesh must have exactly
         * @default undefined
         */
        id!: string;
    }

    /**
     * Feeds `babylon.mesh.getMeshOfUniqueId` with the number the scene gave a mesh, as
     * `getUniqueId` reads it.
     */
    export class UniqueIdBabylonMeshDto {
        constructor(uniqueId?: number) {
            if (uniqueId !== undefined) { this.uniqueId = uniqueId; }
        }
        /**
         * The unique number of the mesh to find
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        uniqueId: number = 0;
    }
    /**
     * Feeds `babylon.mesh.setPickable` with a mesh, whether it answers to pointer picking and
     * whether its children follow.
     */
    export class PickableBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, pickable?: boolean, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (pickable !== undefined) { this.pickable = pickable; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
        /**
         * The mesh to change
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * When true, clicks and rays can pick the mesh; when false, they pass through it
         * @default false
         */
        pickable = false;
        /**
         * When true, the child meshes get the same setting
         * @default false
         */
        includeChildren = false;
    }

    /**
     * Feeds `babylon.mesh.setCheckCollisions` and `getCheckCollisions` with a mesh, the collision
     * flag and whether its children follow.
     */
    export class CheckCollisionsBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, checkCollisions?: boolean, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (checkCollisions !== undefined) { this.checkCollisions = checkCollisions; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
        /**
         * The mesh to change or read
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * When true, colliders such as a camera with collisions on cannot pass through the mesh
         * @default false
         */
        checkCollisions = false;
        /**
         * When true, the child meshes get the same setting
         * @default false
         */
        includeChildren = false;
    }
    /**
     * Feeds `babylon.mesh.yaw`, `pitch` and `roll` with a mesh and the angle to turn it by.
     */
    export class RotateBabylonMeshDto {
        constructor(babylonMesh?: BABYLON.Mesh, rotate?: number) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (rotate !== undefined) { this.rotate = rotate; }
        }
        /**
         * The mesh to turn
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * The angle in degrees added to the current rotation; negative turns the other way
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        rotate: number = 0;
    }
    /**
     * Feeds `babylon.mesh.setVisibility` with a mesh, how visible it is from 0 to 1 and whether its
     * children follow.
     */
    export class SetMeshVisibilityDto {
        constructor(babylonMesh?: BABYLON.Mesh, visibility?: number, includeChildren?: boolean) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
            if (visibility !== undefined) { this.visibility = visibility; }
            if (includeChildren !== undefined) { this.includeChildren = includeChildren; }
        }
        /**
         * The mesh to change
         * @default undefined
         */
        babylonMesh!: BABYLON.Mesh;
        /**
         * From 0 for fully transparent to 1 for fully shown; values between fade the mesh
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        visibility = 0;
        /**
         * When true, the child meshes get the same visibility
         * @default false
         */
        includeChildren = false;
    }
    /**
     * Feeds `babylon.mesh.createMeshInstanceAndTransform`: the mesh to instance and where to place
     * the instance.
     */
    export class MeshInstanceAndTransformDto {
        constructor(mesh?: BABYLON.Mesh, position?: Base.Point3, rotation?: Base.Vector3, scaling?: Base.Vector3) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (position !== undefined) { this.position = position; }
            if (rotation !== undefined) { this.rotation = rotation; }
            if (scaling !== undefined) { this.scaling = scaling; }
        }
        /**
         * The mesh to make an instance of; it is hidden once instanced
         * @default undefined
         */
        mesh!: BABYLON.Mesh;
        /**
         * Where the instance is placed
         * @default undefined
         */
        position!: Base.Point3;
        /**
         * The instance's rotation angles around X, Y and Z, in degrees
         * @default undefined
         */
        rotation!: Base.Vector3;
        /**
         * The instance's scale factors along X, Y and Z, 1 being unscaled
         * @default undefined
         */
        scaling!: Base.Vector3;
    }
    /**
     * Feeds `babylon.mesh.createMeshInstance` with the mesh to make a lightweight instance of.
     */
    export class MeshInstanceDto {
        constructor(mesh?: BABYLON.Mesh) {
            if (mesh !== undefined) { this.mesh = mesh; }
        }
        /**
         * The mesh to make an instance of; its children are instanced one by one
         * @default undefined
         */
        mesh!: BABYLON.Mesh;
    }
    /**
     * Feeds `babylon.mesh.rotateAroundAxisWithPosition`: the mesh, a point and an axis through it,
     * and the angle to orbit by.
     */
    export class RotateAroundAxisNodeDto {
        constructor(mesh?: BABYLON.Mesh, position?: Base.Point3, axis?: Base.Vector3, angle?: number) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (position !== undefined) { this.position = position; }
            if (axis !== undefined) { this.axis = axis; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * The mesh to turn around the axis
         * @default undefined
         */
        mesh!: BABYLON.Mesh;
        /**
         * A point the axis passes through
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * The direction of the axis; any length will do, but not a zero vector
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * How far to turn, in degrees; positive follows the right-hand rule around the axis
         */
        angle = 0;
    }
}
