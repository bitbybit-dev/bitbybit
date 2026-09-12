
import { uniqueName } from "../../unique-name";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import * as Inputs from "../../inputs";
import { Base } from "../../inputs";

/**
 * Working with meshes already in the BabylonJS scene, the objects `draw.drawAnyAsync` gives back:
 * moving, rotating and scaling them, showing and hiding, parenting, picking and collision flags,
 * names and ids, cloning and instancing for many copies, and reading their triangles back out.
 * Rotations are given in degrees; positions and distances are in scene units.
 */
export class BabylonMesh {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Removes a mesh from the scene and frees its GPU resources; the mesh cannot be used
     * afterwards. Nothing happens when no mesh is given.
     * @param inputs - The mesh to remove
     * @group memory
     * @shortname dispose
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.dispose({ babylonMesh: mesh });
     * ```
     */
    dispose(inputs: Inputs.BabylonMesh.BabylonMeshDto): void {
        if (inputs.babylonMesh) {
            inputs.babylonMesh.getScene().removeMesh(inputs.babylonMesh, true);
            inputs.babylonMesh.dispose();
        }
    }

    /**
     * Moves, rotates, scales and recolors a drawn mesh in place, without drawing it again, which is
     * faster when only the placement or the color changes.
     *
     * `rotation` is in radians here. `colours` is one hex color, or a list with one entry per child
     * mesh, or per point or line of such a drawing; any other list uses its first entry.
     * @param inputs - The drawn mesh, its new position, rotation, scaling and colors
     * @group updates
     * @shortname update drawn
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.updateDrawn({ babylonMesh: mesh, position: [0, 5, 0], rotation: [0, Math.PI / 2, 0], scaling: [1, 1, 1], colours: "#ff0000" });
     * ```
     */
    updateDrawn(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMesh): void {
        const type = inputs.babylonMesh.metadata.type as Inputs.Draw.drawingTypes;

        inputs.babylonMesh.position = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        inputs.babylonMesh.rotation = new BABYLON.Vector3(inputs.rotation[0], inputs.rotation[1], inputs.rotation[2]);
        inputs.babylonMesh.scaling = new BABYLON.Vector3(inputs.scaling[0], inputs.scaling[1], inputs.scaling[2]);

        const areColorsArray = Array.isArray(inputs.colours);
        let meshChildren;
        if (inputs.babylonMesh.getChildMeshes) {
            meshChildren = inputs.babylonMesh.getChildMeshes();
        }
        if (meshChildren && meshChildren.length > 0) {
            if (areColorsArray && inputs.colours.length === meshChildren.length) {
                meshChildren.forEach((child, index) => {
                    const color = BABYLON.Color3.FromHexString(inputs.colours[index]!);
                    this.assignColorToMesh(child, color);
                });
            } else if (areColorsArray) {
                meshChildren.forEach((child) => {
                    const color = BABYLON.Color3.FromHexString(inputs.colours[0]!);
                    this.assignColorToMesh(child, color);
                });
            } else {
                meshChildren.forEach((child) => {
                    const color = BABYLON.Color3.FromHexString(inputs.colours as string);
                    this.assignColorToMesh(child, color);
                });
            }
        } else {
            const color = areColorsArray ? BABYLON.Color3.FromHexString(inputs.colours[0]!) : BABYLON.Color3.FromHexString(inputs.colours as string);
            this.assignColorToMesh(inputs.babylonMesh, color);
        }

        if (inputs.babylonMesh.edgesRenderer !== null) {
            const color = areColorsArray ? BABYLON.Color3.FromHexString(inputs.colours[0]!) : BABYLON.Color3.FromHexString(inputs.colours as string);
            inputs.babylonMesh.edgesColor = BABYLON.Color4.FromColor3(color);
        }
        if ([
            Inputs.Draw.drawingTypes.point,
            Inputs.Draw.drawingTypes.points,
            Inputs.Draw.drawingTypes.line,
            Inputs.Draw.drawingTypes.lines,
            Inputs.Draw.drawingTypes.polyline,
            Inputs.Draw.drawingTypes.polylines].includes(type)) {
            const colors = inputs.babylonMesh.getVerticesData(BABYLON.VertexBuffer.ColorKind)!;
            const length = colors.length / 4;

            const c = [];

            if (areColorsArray && length === inputs.colours.length) {
                for (let i = 0; i < length; i++) {
                    const col = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(inputs.colours[i]!));
                    c.push(col.r, col.g, col.b, col.a);
                }
            } else if (areColorsArray) {
                const col = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(inputs.colours[0]!));
                for (let i = 0; i < length; i++) {
                    c.push(col.r, col.g, col.b, col.a);
                }
            } else {
                const col = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(inputs.colours as string));
                for (let i = 0; i < length; i++) {
                    c.push(col.r, col.g, col.b, col.a);
                }
            }

            inputs.babylonMesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, c);
        }
    }

    /**
     * Sets how visible a mesh is, from 0 for fully transparent to 1 for fully shown, with the
     * values between fading it; `includeChildren` applies the same value to its child meshes.
     * @param inputs - The mesh, the visibility from 0 to 1 and whether children follow
     * @group visibility
     * @shortname set visibility
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.setVisibility({ babylonMesh: mesh, visibility: 0.5, includeChildren: true });
     * ```
     */
    setVisibility(inputs: Inputs.BabylonMesh.SetMeshVisibilityDto): void {
        inputs.babylonMesh.visibility = inputs.visibility;
        if (inputs.includeChildren) {
            if (inputs.babylonMesh.getChildMeshes) {
                inputs.babylonMesh.getChildMeshes().forEach(mesh => {
                    mesh.visibility = inputs.visibility;
                });
            }
        }
    }

    /**
     * Hides a mesh without removing it from the scene, and its child meshes too when
     * `includeChildren` is true; `show` brings it back.
     * @param inputs - The mesh and whether its children follow
     * @group visibility
     * @shortname hide
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.hide({ babylonMesh: mesh, includeChildren: true });
     * ```
     */
    hide(inputs: Inputs.BabylonMesh.ShowHideMeshDto): void {
        inputs.babylonMesh.isVisible = false;
        if (inputs.includeChildren) {
            if (inputs.babylonMesh.getChildMeshes) {
                inputs.babylonMesh.getChildMeshes().forEach(mesh => {
                    mesh.isVisible = false;
                });
            }
        }
    }

    /**
     * Shows a mesh that `hide` or a hidden draw made invisible, and its child meshes too when
     * `includeChildren` is true.
     * @param inputs - The mesh and whether its children follow
     * @group visibility
     * @shortname show
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.show({ babylonMesh: mesh, includeChildren: true });
     * ```
     */
    show(inputs: Inputs.BabylonMesh.ShowHideMeshDto): void {
        inputs.babylonMesh.isVisible = true;
        if (inputs.includeChildren) {
            inputs.babylonMesh.getChildMeshes().forEach(mesh => {
                mesh.isVisible = true;
            });
        }
    }

    /**
     * Makes one mesh the child of another, so it moves, turns and scales together with its parent
     * from then on; its position becomes relative to the parent.
     * @param inputs - The mesh and the mesh to parent it to
     * @group set
     * @shortname parent
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.setParent({ babylonMesh: wheel, parentMesh: car });
     * ```
     */
    setParent(inputs: Inputs.BabylonMesh.SetParentDto): void {
        inputs.babylonMesh.parent = inputs.parentMesh;
    }

    /**
     * Reads the node a mesh is parented to, which is what it moves with; a mesh at the top level
     * has none.
     * @param inputs - The mesh
     * @returns The parent node
     * @group get
     * @shortname parent
     */
    getParent(inputs: Inputs.BabylonMesh.SetParentDto): BABYLON.Node {
        return inputs.babylonMesh.parent!;
    }

    /**
     * Turns collision checking on or off for a mesh, and its children when `includeChildren` is
     * true, so a camera or another collider with collisions enabled cannot pass through it.
     * @param inputs - The mesh, the flag and whether children follow
     * @group set
     * @shortname check collisions
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.setCheckCollisions({ babylonMesh: walls, checkCollisions: true, includeChildren: true });
     * ```
     */
    setCheckCollisions(inputs: Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto): void {
        inputs.babylonMesh.checkCollisions = inputs.checkCollisions;
        if (inputs.includeChildren) {
            const children = inputs.babylonMesh.getChildMeshes();
            children.forEach(child => {
                child.checkCollisions = inputs.checkCollisions;
            });
        }
    }

    /**
     * Reads whether a mesh takes part in collision checking.
     * @param inputs - The mesh
     * @returns True when collisions are checked against the mesh
     * @group get
     * @shortname check collisions
     */
    getCheckCollisions(inputs: Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto): boolean {
        return inputs.babylonMesh.checkCollisions;
    }

    /**
     * Sets whether a mesh answers to pointer picking, and its children too when `includeChildren`
     * is true; an unpickable mesh is skipped by clicks and rays that pick.
     * @param inputs - The mesh, the flag and whether children follow
     * @group get
     * @shortname check collisions
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.setPickable({ babylonMesh: mesh, pickable: true, includeChildren: true });
     * ```
     */
    setPickable(inputs: Inputs.BabylonMesh.PickableBabylonMeshDto): void {
        inputs.babylonMesh.isPickable = inputs.pickable;
        if (inputs.includeChildren) {
            const children = inputs.babylonMesh.getChildMeshes();
            children.forEach(child => {
                child.isPickable = inputs.pickable;
            });
        }
    }

    /**
     * Lets a mesh, and its children when `includeChildren` is true, react to the pointer merely
     * moving over it, which is off by default because it costs a pick on every pointer move.
     * @param inputs - The mesh and whether children follow
     * @group set
     * @shortname enable pointer move events
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.enablePointerMoveEvents({ babylonMesh: mesh, includeChildren: true });
     * ```
     */
    enablePointerMoveEvents(inputs: Inputs.BabylonMesh.BabylonMeshWithChildrenDto): void {
        inputs.babylonMesh.enablePointerMoveEvents = true;
        if (inputs.includeChildren) {
            const children = inputs.babylonMesh.getChildMeshes();
            children.forEach(child => {
                child.enablePointerMoveEvents = true;
            });
        }
    }

    /**
     * Stops a mesh, and its children when `includeChildren` is true, from reacting to pointer
     * moves, back to the default.
     * @param inputs - The mesh and whether children follow
     * @group set
     * @shortname disable pointer move events
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.disablePointerMoveEvents({ babylonMesh: mesh, includeChildren: true });
     * ```
     */
    disablePointerMoveEvents(inputs: Inputs.BabylonMesh.BabylonMeshWithChildrenDto): void {
        inputs.babylonMesh.enablePointerMoveEvents = false;
        if (inputs.includeChildren) {
            const children = inputs.babylonMesh.getChildMeshes();
            children.forEach(child => {
                child.enablePointerMoveEvents = false;
            });
        }
    }

    /**
     * Reads whether the mesh can be picked with the pointer.
     * @param inputs - The mesh
     * @returns True when the mesh answers to picking
     * @group get
     * @shortname pickable
     */
    getPickable(inputs: Inputs.BabylonMesh.BabylonMeshDto): boolean {
        return inputs.babylonMesh.isPickable;
    }

    /**
     * Finds every mesh in the scene whose name contains the given text, case-sensitive, in scene
     * order.
     * @param inputs - The text to look for in mesh names
     * @returns The matching meshes
     * @group get
     * @shortname meshes where name contains
     * @example
     * ```typescript
     * const wheels = bitbybit.babylon.mesh.getMeshesWhereNameContains({ name: "wheel" });
     * ```
     */
    getMeshesWhereNameContains(inputs: Inputs.BabylonMesh.ByNameBabylonMeshDto): BABYLON.AbstractMesh[] {
        return this.context.scene.meshes.filter(m => m.name.includes(inputs.name));
    }

    /**
     * Lists the meshes parented under a mesh: all descendants, or only the direct children when
     * `directDescendantsOnly` is true.
     * @param inputs - The mesh and whether to stop at direct children
     * @returns The child meshes
     * @group get
     * @shortname child meshes
     * @example
     * ```typescript
     * const parts = bitbybit.babylon.mesh.getChildMeshes({ babylonMesh: model, directDescendantsOnly: false });
     * ```
     */
    getChildMeshes(inputs: Inputs.BabylonMesh.ChildMeshesBabylonMeshDto): BABYLON.AbstractMesh[] {
        return inputs.babylonMesh.getChildMeshes(inputs.directDescendantsOnly);
    }

    /**
     * Finds every mesh in the scene with exactly the given id; ids need not be unique, so several
     * may match.
     * @param inputs - The id to look for
     * @returns The meshes with that id
     * @group get
     * @shortname meshes by id
     * @example
     * ```typescript
     * const meshes = bitbybit.babylon.mesh.getMeshesOfId({ id: "wheel" });
     * ```
     */
    getMeshesOfId(inputs: Inputs.BabylonMesh.ByIdBabylonMeshDto): BABYLON.AbstractMesh[] {
        return this.context.scene.getMeshesById(inputs.id);
    }

    /**
     * Finds the first mesh in the scene with exactly the given id; use `getMeshesOfId` when several
     * share it.
     * @param inputs - The id to look for
     * @returns The first mesh with that id
     * @group get
     * @shortname mesh by id
     * @example
     * ```typescript
     * const mesh = bitbybit.babylon.mesh.getMeshOfId({ id: "wheel" });
     * ```
     */
    getMeshOfId(inputs: Inputs.BabylonMesh.ByIdBabylonMeshDto): BABYLON.AbstractMesh {
        return this.context.scene.getMeshById(inputs.id)!;
    }

    /**
     * Finds the mesh with the given unique id, the number the scene assigns to every mesh once, as
     * `getUniqueId` reads it.
     * @param inputs - The unique id
     * @returns The mesh with that unique id
     * @group get
     * @shortname mesh by unique id
     * @example
     * ```typescript
     * const id = bitbybit.babylon.mesh.getUniqueId({ babylonMesh: mesh });
     * const same = bitbybit.babylon.mesh.getMeshOfUniqueId({ uniqueId: id });
     * ```
     */
    getMeshOfUniqueId(inputs: Inputs.BabylonMesh.UniqueIdBabylonMeshDto): BABYLON.AbstractMesh {
        return this.context.scene.getMeshByUniqueId(inputs.uniqueId)!;
    }

    /**
     * Joins several meshes into one new mesh, which draws faster than many separate ones.
     *
     * The sources are removed when `disposeSource` is true; set `allow32BitsIndices` when the
     * meshes together have more than 65 thousand vertices, and use the sub-mesh options to keep
     * separate materials.
     * @param inputs - The meshes and the merge options
     * @returns The merged mesh
     * @group edit
     * @shortname merge
     * @example
     * ```typescript
     * const merged = bitbybit.babylon.mesh.mergeMeshes({ arrayOfMeshes: [meshA, meshB], disposeSource: true, allow32BitsIndices: true, subdivideWithSubMeshes: false, multiMultiMaterials: false });
     * ```
     */
    mergeMeshes(inputs: Inputs.BabylonMesh.MergeMeshesDto): BABYLON.Mesh {
        const newMesh = BABYLON.Mesh.MergeMeshes(
            inputs.arrayOfMeshes,
            inputs.disposeSource,
            inputs.allow32BitsIndices,
            inputs.meshSubclass,
            inputs.subdivideWithSubMeshes,
            inputs.multiMultiMaterials
        );
        return newMesh!;
    }

    /**
     * Gives every triangle of a mesh its own vertices and normals, so faces show as flat facets
     * instead of being smoothed across edges; the mesh is changed in place and given back.
     * @param inputs - The mesh
     * @returns The same mesh, flat shaded
     * @group edit
     * @shortname convert to flat shaded
     * @example
     * ```typescript
     * const faceted = bitbybit.babylon.mesh.convertToFlatShadedMesh({ babylonMesh: mesh });
     * ```
     */
    convertToFlatShadedMesh(inputs: Inputs.BabylonMesh.BabylonMeshDto): BABYLON.Mesh {
        return inputs.babylonMesh.convertToFlatShadedMesh();
    }

    /**
     * Makes a copy of a mesh, with its children, that shares the geometry of the original and is
     * placed at the same spot; the copy casts and receives shadows like the original.
     * @param inputs - The mesh to copy
     * @returns The copy
     * @group edit
     * @shortname clone
     * @disposableOutput true
     * @example
     * ```typescript
     * const copy = bitbybit.babylon.mesh.clone({ babylonMesh: mesh });
     * bitbybit.babylon.mesh.setPosition({ babylonMesh: copy, position: [10, 0, 0] });
     * ```
     */
    clone(inputs: Inputs.BabylonMesh.BabylonMeshDto): BABYLON.Mesh {
        const clone = inputs.babylonMesh.clone();

        if (!inputs.babylonMesh.metadata || (inputs.babylonMesh.metadata && inputs.babylonMesh.metadata.shadows !== false)) {
            const sgs = this.context.scene?.metadata?.shadowGenerators as BABYLON.ShadowGenerator[];
            if (sgs.length > 0) {
                clone.getChildMeshes().forEach(m => {
                    m.receiveShadows = true;
                    sgs.forEach(sg => sg.addShadowCaster(m));
                });
                clone.receiveShadows = true;
                sgs.forEach(sg => sg.addShadowCaster(clone));
            }
        }
        clone.metadata = { ...inputs.babylonMesh.metadata };
        return clone;
    }

    /**
     * Makes one copy of a mesh at every given position, in the same order; the copies share the
     * geometry of the original.
     * @param inputs - The mesh and the positions
     * @returns One copy per position
     * @group edit
     * @shortname clone to positions
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const copies = bitbybit.babylon.mesh.cloneToPositions({ babylonMesh: mesh, positions: [[0, 0, 0], [10, 0, 0], [20, 0, 0]] });
     * ```
     */
    cloneToPositions(inputs: Inputs.BabylonMesh.CloneToPositionsDto): BABYLON.Mesh[] {
        const clones: BABYLON.Mesh[] = [];
        inputs.positions.forEach((position) => {
            const clone = inputs.babylonMesh.clone();
            clone.position = new BABYLON.Vector3(position[0], position[1], position[2]);
            clones.push(clone);
        });
        return clones;
    }

    /**
     * Sets the id of a mesh, a label that `getMeshOfId` finds it by and that need not be unique.
     * @param inputs - The mesh and the id
     * @group set
     * @shortname id
     */
    setId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): void {
        inputs.babylonMesh.id = inputs.id;
    }

    /**
     * Reads the id of a mesh, the label set by `setId` or by the loader that created it.
     * @param inputs - The mesh
     * @returns The id
     * @group get
     * @shortname id
     */
    getId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): string {
        return inputs.babylonMesh.id;
    }

    /**
     * Reads the unique id of a mesh, the number the scene gives every mesh once and never reuses.
     * @param inputs - The mesh
     * @returns The unique id number
     * @group get
     * @shortname unique id
     */
    getUniqueId(inputs: Inputs.BabylonMesh.BabylonMeshDto): number {
        return inputs.babylonMesh.uniqueId;
    }


    /**
     * Sets the name of a mesh, and of its children too when `includeChildren` is true; names are
     * what `getMeshesWhereNameContains` searches.
     * @param inputs - The mesh, the name and whether children follow
     * @group set
     * @shortname name
     */
    setName(inputs: Inputs.BabylonMesh.NameBabylonMeshDto): void {
        inputs.babylonMesh.name = inputs.name;
        if (inputs.includeChildren) {
            const children = inputs.babylonMesh.getChildMeshes();
            children.forEach(child => {
                child.name = inputs.name;
            });
        }
    }

    /**
     * Reads the triangles of a mesh as lists of three points in the mesh's own coordinates, the
     * form `jscad.shapes.fromPolygonPoints` and similar builders take. The mesh must be made of
     * triangles.
     * @param inputs - The mesh
     * @returns The triangles as lists of three points
     * @group get
     * @shortname vertices as polygon points
     * @example
     * ```typescript
     * const triangles = bitbybit.babylon.mesh.getVerticesAsPolygonPoints({ babylonMesh: mesh });
     * ```
     */
    getVerticesAsPolygonPoints(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3[][] {
        const vertices = inputs.babylonMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)!;
        const indices = inputs.babylonMesh.getIndices()!;
        const res: Base.Point3[][] = [];
        for (let i = 0; i < indices.length; i += 3) {
            const p1 = indices[i]!;
            const p2 = indices[i + 1]!;
            const p3 = indices[i + 2]!;
            res.push([
                [vertices[p1 * 3]!, vertices[p1 * 3 + 1]!, vertices[p1 * 3 + 2]!],
                [vertices[p2 * 3]!, vertices[p2 * 3 + 1]!, vertices[p2 * 3 + 2]!],
                [vertices[p3 * 3]!, vertices[p3 * 3 + 1]!, vertices[p3 * 3 + 2]!],
            ]);
        }
        return res;
    }

    /**
     * Reads the name of a mesh, as set by `setName` or by whatever created it.
     * @param inputs - The mesh
     * @returns The name
     * @group get
     * @shortname name
     */
    getName(inputs: Inputs.BabylonMesh.BabylonMeshDto): string {
        return inputs.babylonMesh.name;
    }

    /**
     * Gives a mesh a material, and its children too when `includeChildren` is true; the material
     * decides the color, shininess and transparency of its surface.
     * @param inputs - The mesh, the material and whether children follow
     * @group set
     * @shortname material
     * @example
     * ```typescript
     * const material = bitbybit.babylon.material.pbrMetallicRoughness.create({ name: "red", baseColor: "#ff0000", emissiveColor: "#000000", metallic: 0.2, roughness: 0.6, alpha: 1, backFaceCulling: false, zOffset: 0 });
     * bitbybit.babylon.mesh.setMaterial({ babylonMesh: mesh, material, includeChildren: true });
     * ```
     */
    setMaterial(inputs: Inputs.BabylonMesh.MaterialBabylonMeshDto): void {
        inputs.babylonMesh.material = inputs.material;
        if (inputs.includeChildren) {
            const children = inputs.babylonMesh.getChildMeshes();
            children.forEach(child => {
                child.material = inputs.material;
            });
        }
    }

    /**
     * Reads the material of a mesh, the surface description its faces are drawn with.
     * @param inputs - The mesh
     * @returns The material
     * @group get
     * @shortname material
     */
    getMaterial(inputs: Inputs.BabylonMesh.BabylonMeshDto): BABYLON.Material {
        return inputs.babylonMesh.material!;
    }

    /**
     * Reads the position of a mesh relative to its parent, as a point.
     * @param inputs - The mesh
     * @returns The position as a point
     * @group get
     * @shortname position
     */
    getPosition(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3 {
        const m = inputs.babylonMesh;
        return [m.position.x, m.position.y, m.position.z];
    }

    /**
     * Reads the position of a mesh in world coordinates, with every parent's transform applied.
     * @param inputs - The mesh
     * @returns The world position as a point
     * @group get
     * @shortname absolute position
     */
    getAbsolutePosition(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3 {
        const m = inputs.babylonMesh;
        return [m.absolutePosition.x, m.absolutePosition.y, m.absolutePosition.z];
    }

    /**
     * Reads the rotation of a mesh around X, Y and Z, in radians, as its rotation property holds
     * it.
     * @param inputs - The mesh
     * @returns The rotation angles in radians
     * @group get
     * @shortname rotation
     */
    getRotation(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3 {
        const m = inputs.babylonMesh;
        return [m.rotation.x, m.rotation.y, m.rotation.z];
    }

    /**
     * Reads the scale factors of a mesh along X, Y and Z; 1 is unscaled.
     * @param inputs - The mesh
     * @returns The scale factors
     * @group get
     * @shortname scale
     */
    getScale(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3 {
        const m = inputs.babylonMesh;
        return [m.scaling.x, m.scaling.y, m.scaling.z];
    }

    /**
     * Moves a mesh along its own forward direction, the local Z axis, by `distance` scene units; a
     * turned mesh moves the way it faces.
     * @param inputs - The mesh and the distance
     * @group move
     * @shortname forward
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.moveForward({ babylonMesh: mesh, distance: 5 });
     * ```
     */
    moveForward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.forward, inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves a mesh against its own forward direction, the local Z axis, by `distance` scene units.
     * @param inputs - The mesh and the distance
     * @group move
     * @shortname backward
     */
    moveBackward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.forward.negate(), inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves a mesh along its own up direction, the local Y axis, by `distance` scene units.
     * @param inputs - The mesh and the distance
     * @group move
     * @shortname up
     */
    moveUp(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.up, inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves a mesh against its own up direction, the local Y axis, by `distance` scene units.
     * @param inputs - The mesh and the distance
     * @group move
     * @shortname down
     */
    moveDown(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.up.negate(), inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves a mesh along its own right direction, the local X axis, by `distance` scene units.
     * @param inputs - The mesh and the distance
     * @group move
     * @shortname right
     */
    moveRight(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.right, inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves a mesh against its own right direction, the local X axis, by `distance` scene units.
     * @param inputs - The mesh and the distance
     * @group move
     * @shortname left
     */
    moveLeft(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.right.negate(), inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Turns a mesh around its own Y axis by `rotate` degrees, on top of its current rotation, the
     * way a car turns left or right.
     * @param inputs - The mesh and the angle in degrees
     * @group move
     * @shortname yaw
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.yaw({ babylonMesh: mesh, rotate: 45 });
     * ```
     */
    yaw(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        const rot = BABYLON.Angle.FromDegrees(inputs.rotate).radians();
        m.rotate(BABYLON.Axis.Y, rot, BABYLON.Space.LOCAL);
    }

    /**
     * Turns a mesh around its own X axis by `rotate` degrees, on top of its current rotation, the
     * way a nose tips up or down.
     * @param inputs - The mesh and the angle in degrees
     * @group move
     * @shortname pitch
     */
    pitch(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        const rot = BABYLON.Angle.FromDegrees(inputs.rotate).radians();
        m.rotate(BABYLON.Axis.X, rot, BABYLON.Space.LOCAL);
    }

    /**
     * Turns a mesh around its own Z axis by `rotate` degrees, on top of its current rotation, the
     * way a wing banks.
     * @param inputs - The mesh and the angle in degrees
     * @group move
     * @shortname roll
     */
    roll(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        const rot = BABYLON.Angle.FromDegrees(inputs.rotate).radians();
        m.rotate(BABYLON.Axis.Z, rot, BABYLON.Space.LOCAL);
    }

    /**
     * Turns a mesh by `angle` degrees around an axis that passes through `position`, so the mesh
     * orbits that point rather than spinning in place.
     * @param inputs - The mesh, the point on the axis, the axis direction and the angle in degrees
     * @group move
     * @shortname rotate around axis with position
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.rotateAroundAxisWithPosition({ mesh, position: [0, 0, 0], axis: [0, 1, 0], angle: 90 });
     * ```
     */
    rotateAroundAxisWithPosition(inputs: Inputs.BabylonMesh.RotateAroundAxisNodeDto): void {
        inputs.mesh.rotateAround(
            new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
            new BABYLON.Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            BABYLON.Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Places a mesh, or an instance of one, at a point relative to its parent.
     * @param inputs - The mesh and the position
     * @group set
     * @shortname position
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.setPosition({ babylonMesh: mesh, position: [0, 5, 0] });
     * ```
     */
    setPosition(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshPositionDto): void {
        inputs.babylonMesh.position = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
    }

    /**
     * Sets the rotation of a mesh, or an instance of one, as angles in degrees around X, Y and Z,
     * replacing its current rotation.
     * @param inputs - The mesh and the three angles in degrees
     * @group set
     * @shortname rotation
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.setRotation({ babylonMesh: mesh, rotation: [0, 90, 0] });
     * ```
     */
    setRotation(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshRotationDto): void {
        const radX = BABYLON.Angle.FromDegrees(inputs.rotation[0]).radians();
        const radY = BABYLON.Angle.FromDegrees(inputs.rotation[1]).radians();
        const radZ = BABYLON.Angle.FromDegrees(inputs.rotation[2]).radians();

        inputs.babylonMesh.rotation = new BABYLON.Vector3(radX, radY, radZ);
    }

    /**
     * Sets the scale factors of a mesh, or an instance of one, along X, Y and Z, replacing its
     * current scale; 1 is unscaled.
     * @param inputs - The mesh and the three scale factors
     * @group set
     * @shortname scale
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.setScale({ babylonMesh: mesh, scale: [2, 1, 1] });
     * ```
     */
    setScale(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshScaleDto): void {
        inputs.babylonMesh.scaling = new BABYLON.Vector3(inputs.scale[0], inputs.scale[1], inputs.scale[2]);
    }

    /**
     * Multiplies the current scale of a mesh, or an instance of one, by one factor on all axes, so
     * 2 doubles whatever size it has.
     * @param inputs - The mesh and the factor
     * @group set
     * @shortname scale in place
     */
    setLocalScale(inputs: Inputs.BabylonMesh.ScaleInPlaceDto): void {
        inputs.babylonMesh.scaling.scaleInPlace(inputs.scale);
    }

    /**
     * Tells whether two meshes overlap, judged by their bounding boxes: axis-aligned ones by
     * default, or boxes that follow each mesh's rotation when `precise` is true;
     * `includeDescendants` tests their children too.
     * @param inputs - The two meshes and the precision options
     * @returns True when the meshes overlap
     * @group intersects
     * @shortname mesh
     * @example
     * ```typescript
     * const touching = bitbybit.babylon.mesh.intersectsMesh({ babylonMesh: meshA, babylonMesh2: meshB, precise: true, includeDescendants: false });
     * ```
     */
    intersectsMesh(inputs: Inputs.BabylonMesh.IntersectsMeshDto): boolean {
        return inputs.babylonMesh.intersectsMesh(inputs.babylonMesh2, inputs.precise, inputs.includeDescendants);
    }

    /**
     * Tells whether a point lies inside the bounding box of a mesh.
     * @param inputs - The mesh and the point
     * @returns True when the point is inside the mesh's bounds
     * @group intersects
     * @shortname point
     * @example
     * ```typescript
     * const inside = bitbybit.babylon.mesh.intersectsPoint({ babylonMesh: mesh, point: [0, 1, 0] });
     * ```
     */
    intersectsPoint(inputs: Inputs.BabylonMesh.IntersectsPointDto): boolean {
        const point = new BABYLON.Vector3(inputs.point[0], inputs.point[1], inputs.point[2]);
        return inputs.babylonMesh.intersectsPoint(point);
    }

    /**
     * Creates a placed instance of a mesh, as `createMeshInstanceAndTransform` does, without giving
     * it back; for scripts that only need the copy to appear.
     * @param inputs - The mesh and the position, rotation and scaling of the instance
     * @group instance
     * @shortname create and transform
     * @disposableOutput true
     * @example
     * ```typescript
     * bitbybit.babylon.mesh.createMeshInstanceAndTransformNoReturn({ mesh, position: [10, 0, 0], rotation: [0, 45, 0], scaling: [1, 1, 1] });
     * ```
     */
    createMeshInstanceAndTransformNoReturn(inputs: Inputs.BabylonMesh.MeshInstanceAndTransformDto): void {
        this.createMeshInstanceAndTransform(inputs);
    }

    /**
     * Creates an instance of a mesh, a lightweight copy that shares its geometry and draws cheaply,
     * and places it at the given position, rotation in degrees and scaling.
     *
     * A mesh with children gets one instance per child, gathered under a new container; the
     * original is hidden.
     * @param inputs - The mesh and the position, rotation and scaling of the instance
     * @returns The container holding the instances
     * @group instance
     * @shortname create and transform
     * @disposableOutput true
     * @example
     * ```typescript
     * const instance = bitbybit.babylon.mesh.createMeshInstanceAndTransform({ mesh, position: [10, 0, 0], rotation: [0, 45, 0], scaling: [1, 1, 1] });
     * ```
     */
    createMeshInstanceAndTransform(inputs: Inputs.BabylonMesh.MeshInstanceAndTransformDto): BABYLON.Mesh {
        const parent = new BABYLON.Mesh(uniqueName("instanceContainer"), this.context.scene);
        const sgs = this.context.scene?.metadata?.shadowGenerators as BABYLON.ShadowGenerator[];
        if (inputs.mesh && inputs.mesh.getChildMeshes && inputs.mesh.getChildMeshes().length > 0) {
            (inputs.mesh.getChildMeshes(false) as BABYLON.Mesh[]).forEach((child: BABYLON.Mesh) => {
                const vertices = child.getTotalVertices();
                if (child.createInstance && vertices > 0) {
                    child.disableEdgesRendering();
                    const newInstance = child.createInstance(uniqueName("InstanceMesh"));
                    newInstance.position = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
                    newInstance.rotation = new BABYLON.Vector3(
                        BABYLON.Angle.FromDegrees(inputs.rotation[0]).radians(),
                        BABYLON.Angle.FromDegrees(inputs.rotation[1]).radians(),
                        BABYLON.Angle.FromDegrees(inputs.rotation[2]).radians());
                    newInstance.scaling = new BABYLON.Vector3(inputs.scaling[0], inputs.scaling[1], inputs.scaling[2]);

                    if (!inputs.mesh.metadata || (inputs.mesh.metadata && inputs.mesh.metadata.shadows !== false)) {
                        if (sgs.length > 0) {
                            sgs.forEach(sg => {
                                sg.addShadowCaster(newInstance);
                            });
                            newInstance.receiveShadows = true;
                        }
                    }

                    parent.metadata = inputs.mesh.metadata;
                    newInstance.parent = parent;
                }
            });
            inputs.mesh.isVisible = false;
        } else if (inputs.mesh) {
            inputs.mesh.isVisible = false;
            const newInstance = inputs.mesh.createInstance(uniqueName("InstanceMesh"));

            newInstance.position = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
            newInstance.rotation = new BABYLON.Vector3(
                BABYLON.Angle.FromDegrees(inputs.rotation[0]).radians(),
                BABYLON.Angle.FromDegrees(inputs.rotation[1]).radians(),
                BABYLON.Angle.FromDegrees(inputs.rotation[2]).radians());
            newInstance.scaling = new BABYLON.Vector3(inputs.scaling[0], inputs.scaling[1], inputs.scaling[2]);
            newInstance.parent = parent;
            if (!inputs.mesh.metadata || (inputs.mesh.metadata && inputs.mesh.metadata.shadows !== false)) {
                if (sgs.length > 0) {
                    sgs.forEach(sg => {
                        sg.addShadowCaster(newInstance);
                    });
                }
                newInstance.receiveShadows = true;
            }
            newInstance.metadata = inputs.mesh.metadata;
        }
        return parent;
    }


    /**
     * Creates an instance of a mesh, a lightweight copy that shares its geometry and draws cheaply
     * when many alike are needed, placed where the original is.
     *
     * A mesh with children gets one instance per child, gathered under a new container.
     * @param inputs - The mesh
     * @returns The instance, or the container holding the child instances
     * @group instance
     * @shortname create
     * @disposableOutput true
     * @example
     * ```typescript
     * const instance = bitbybit.babylon.mesh.createMeshInstance({ mesh });
     * bitbybit.babylon.mesh.setPosition({ babylonMesh: instance, position: [10, 0, 0] });
     * ```
     */
    createMeshInstance(inputs: Inputs.BabylonMesh.MeshInstanceDto): BABYLON.Mesh {
        let result!: BABYLON.Mesh;
        if (inputs.mesh && inputs.mesh.getChildMeshes && inputs.mesh.getChildMeshes().length > 0) {
            inputs.mesh.setParent(null);
            const container = new BABYLON.Mesh(uniqueName("meshCloneContainer"));
            (inputs.mesh.getChildMeshes(false) as BABYLON.Mesh[]).forEach((child: BABYLON.Mesh) => {
                if (child.createInstance && child.getTotalVertices() > 0 && child.getTotalIndices() > 0) {
                    const newInstance = child.createInstance(uniqueName("InstanceMesh"));
                    newInstance.parent = container;
                }
            });
            result = container;
            const sgs = this.context.scene.metadata.shadowGenerators as BABYLON.ShadowGenerator[];
            if (!inputs.mesh.metadata || (inputs.mesh.metadata && inputs.mesh.metadata.shadows !== false)) {
                if (sgs.length > 0) {
                    result.getChildMeshes().forEach(m => {
                        sgs.forEach(sg => sg.addShadowCaster(m));
                        m.receiveShadows = true;
                    });
                    sgs.forEach(sg => sg.addShadowCaster(result));
                    result.receiveShadows = true;
                }
            }
        } else if (inputs.mesh) {
            inputs.mesh.setParent(null);
            const vertices = inputs.mesh.getTotalVertices();
            if (vertices > 0) {
                const container = new BABYLON.Mesh(uniqueName("meshCloneContainer"));
                const mesh = inputs.mesh.createInstance(uniqueName("InstanceMesh"));
                mesh.parent = container;
                result = container;
            }
        }
        return result;
    }

    /**
     * Turns a side orientation choice into the number the engine uses for it, for building meshes
     * by hand.
     * @param sideOrientation - The side orientation choice
     * @returns The engine's number for that orientation
     * @ignore true
     */
    getSideOrientation(sideOrientation: Inputs.BabylonMesh.sideOrientationEnum): number {
        switch (sideOrientation) {
            case Inputs.BabylonMesh.sideOrientationEnum.frontside:
                return BABYLON.Mesh.FRONTSIDE;
            case Inputs.BabylonMesh.sideOrientationEnum.backside:
                return BABYLON.Mesh.BACKSIDE;
            case Inputs.BabylonMesh.sideOrientationEnum.doubleside:
                return BABYLON.Mesh.DOUBLESIDE;
            default:
                return BABYLON.Mesh.FRONTSIDE;
        }
    }


    private assignColorToMesh(mesh: BABYLON.AbstractMesh, color: BABYLON.Color3) {
        const mat = (mesh.material);
        if (mat instanceof BABYLON.PBRMetallicRoughnessMaterial) {
            mat.baseColor = color;
        } else if (mat instanceof BABYLON.StandardMaterial) {
            mat.diffuseColor = color;
        }
    }
}

