
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import * as Inputs from "../../inputs/inputs";
import { Base } from "../../inputs/inputs";

export class BabylonMesh {

    constructor(
        private readonly context: Context,
    ) { }

    /** Disposes drawn mesh object from the scene
     * @param inputs Contains BabylonJS mesh that should be disposed
     * @group memory
     * @shortname dispose
     */
    dispose(inputs: Inputs.BabylonMesh.BabylonMeshDto): void {
        if (inputs.babylonMesh) {
            inputs.babylonMesh.getScene().removeMesh(inputs.babylonMesh, true);
            inputs.babylonMesh.dispose();
        }
    }

    /** Udates drawn BabylonJS mesh object without disposing it
     * @param inputs Contains BabylonJS mesh that should be updated, together with position, rotation, scaling and colour info
     * @returns BabylonJS Mesh
     * @group updates
     * @shortname update drawn
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
                    const color = BABYLON.Color3.FromHexString(inputs.colours[index]);
                    this.assignColorToMesh(child, color);
                });
            } else if (areColorsArray) {
                meshChildren.forEach((child) => {
                    const color = BABYLON.Color3.FromHexString(inputs.colours[0]);
                    this.assignColorToMesh(child, color);
                });
            } else {
                meshChildren.forEach((child) => {
                    const color = BABYLON.Color3.FromHexString(inputs.colours as string);
                    this.assignColorToMesh(child, color);
                });
            }
        } else {
            const color = areColorsArray ? BABYLON.Color3.FromHexString(inputs.colours[0]) : BABYLON.Color3.FromHexString(inputs.colours as string);
            this.assignColorToMesh(inputs.babylonMesh, color);
        }

        if (inputs.babylonMesh.edgesRenderer !== null) {
            const color = areColorsArray ? BABYLON.Color3.FromHexString(inputs.colours[0]) : BABYLON.Color3.FromHexString(inputs.colours as string);
            inputs.babylonMesh.edgesColor = BABYLON.Color4.FromColor3(color);
        }
        if ([
            Inputs.Draw.drawingTypes.point,
            Inputs.Draw.drawingTypes.points,
            Inputs.Draw.drawingTypes.line,
            Inputs.Draw.drawingTypes.lines,
            Inputs.Draw.drawingTypes.polyline,
            Inputs.Draw.drawingTypes.polylines].includes(type)) {
            const colors = inputs.babylonMesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            const length = colors.length / 4;

            const c = [];

            if (areColorsArray && length === inputs.colours.length) {
                for (let i = 0; i < length; i++) {
                    const col = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(inputs.colours[i]));
                    c.push(col.r, col.g, col.b, col.a);
                }
            } else if (areColorsArray) {
                const col = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(inputs.colours[0]));
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
     * Change the visibility of a drawn BabylonJS mesh
     * @param inputs BabylonJS mesh and parent mesh
     * @group visibility
     * @shortname set visibility
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
     * Hides the mesh
     * @param inputs BabylonJS mesh to hide
     * @group visibility
     * @shortname hide
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
     * Show the mesh
     * @param inputs BabylonJS mesh to hide
     * @group visibility
     * @shortname show
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
     * Change the parent of the drawn mesh
     * @param inputs BabylonJS mesh and parent mesh
     * @group set
     * @shortname parent
     */
    setParent(inputs: Inputs.BabylonMesh.SetParentDto): void {
        inputs.babylonMesh.parent = inputs.parentMesh;
    }

    /**
     * Get the parent of the drawn mesh
     * @param inputs BabylonJS mesh
     * @returns Parent mesh
     * @group get
     * @shortname parent
     */
    getParent(inputs: Inputs.BabylonMesh.SetParentDto) {
        return inputs.babylonMesh.parent;
    }

    /**
     * Change the check collisions property of the drawn mesh
     * @param inputs BabylonJS mesh and check collisions
     * @group set
     * @shortname check collisions
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
     * Get the check collisions property of the drawn mesh
     * @param inputs BabylonJS mesh and check collisions
     * @group get
     * @shortname check collisions
     */
    getCheckCollisions(inputs: Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto): boolean {
        return inputs.babylonMesh.checkCollisions;
    }

    /**
     * Change the pickable property of the drawn mesh
     * @param inputs BabylonJS mesh and pickable
     * @group get
     * @shortname check collisions
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
     * Force mesh to be pickable by pointer move events, default is false as it is performance heavy
     * @param inputs BabylonJS mesh
     * @group set
     * @shortname enable pointer move events
     */
    enablePointerMoveEvents(inputs: Inputs.BabylonMesh.BabylonMeshWithChildrenDto): void {
        inputs.babylonMesh.enablePointerMoveEvents = true;
        if (inputs.includeChildren) {
            const children = inputs.babylonMesh.getChildMeshes();
            children.forEach(child => {
                child.enablePointerMoveEvents = false;
            });
        }
    }

    /**
     * Make mesh ignore pointer move events, default is false
     * @param inputs BabylonJS mesh and pickable
     * @group set
     * @shortname disable pointer move events
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
     * Change the pickable property of the drawn mesh
     * @param inputs BabylonJS mesh and pickable
     * @group get
     * @shortname pickable
     */
    getPickable(inputs: Inputs.BabylonMesh.BabylonMeshDto): boolean {
        return inputs.babylonMesh.isPickable;
    }

    /**
     * Gets meshes that have names which contain a given text
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname meshes where name contains
     */
    getMeshesWhereNameContains(inputs: Inputs.BabylonMesh.ByNameBabylonMeshDto): BABYLON.AbstractMesh[] {
        return this.context.scene.meshes.filter(m => m.name.includes(inputs.name));
    }

    /**
     * Gets child meshes
     * @param inputs BabylonJS mesh and whether to include only direct descendants
     * @group get
     * @shortname child meshes
     */
    getChildMeshes(inputs: Inputs.BabylonMesh.ChildMeshesBabylonMeshDto): BABYLON.AbstractMesh[] {
        return inputs.babylonMesh.getChildMeshes(inputs.directDescendantsOnly);
    }

    /**
     * Gets meshes of id
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname meshes by id
     */
    getMeshesOfId(inputs: Inputs.BabylonMesh.ByIdBabylonMeshDto): BABYLON.AbstractMesh[] {
        return this.context.scene.getMeshesById(inputs.id);
    }

    /**
     * Gets mesh of id
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname mesh by id
     */
    getMeshOfId(inputs: Inputs.BabylonMesh.ByIdBabylonMeshDto): BABYLON.AbstractMesh {
        return this.context.scene.getMeshById(inputs.id);
    }

    /**
     * Gets mesh of unique id
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname mesh by unique id
     */
    getMeshOfUniqueId(inputs: Inputs.BabylonMesh.UniqueIdBabylonMeshDto): BABYLON.AbstractMesh {
        return this.context.scene.getMeshByUniqueId(inputs.uniqueId);
    }

    /**
     * Clones the mesh
     * @param inputs BabylonJS mesh to clone
     * @returns a new mesh
     * @group edit
     * @shortname clone
     * @disposableOutput true
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
     * Change the id of the drawn mesh
     * @param inputs BabylonJS mesh and name
     * @group set
     * @shortname id
     */
    setId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): void {
        inputs.babylonMesh.id = inputs.id;
    }

    /**
     * Get the id of the drawn mesh
     * @param inputs BabylonJS mesh and id
     * @group get
     * @shortname id
     */
    getId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): string {
        return inputs.babylonMesh.id;
    }

    /**
     * Get the unique id of the drawn mesh
     * @param inputs BabylonJS mesh and id
     * @returns unique id number
     * @group get
     * @shortname unique id
     */
    getUniqueId(inputs: Inputs.BabylonMesh.BabylonMeshDto): number {
        return inputs.babylonMesh.uniqueId;
    }


    /**
     * Change the name of the drawn mesh
     * @param inputs BabylonJS mesh and name
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
     * Gets the vertices as polygon points. These can be used with other construction methods to create meshes. Mesh must be triangulated.
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname vertices as polygon points
     */
    getVerticesAsPolygonPoints(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3[][] {
        const vertices = inputs.babylonMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const indices = inputs.babylonMesh.getIndices();
        // this method implies that mesh is triangulated
        const res = [];
        for (let i = 0; i < indices.length; i += 3) {
            const p1 = indices[i];
            const p2 = indices[i + 1];
            const p3 = indices[i + 2];
            res.push([
                [vertices[p1 * 3], vertices[p1 * 3 + 1], vertices[p1 * 3 + 2]],
                [vertices[p2 * 3], vertices[p2 * 3 + 1], vertices[p2 * 3 + 2]],
                [vertices[p3 * 3], vertices[p3 * 3 + 1], vertices[p3 * 3 + 2]],
            ]);
        }
        return res;
    }

    /**
     * Gets the name of babylon mesh
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname name
     */
    getName(inputs: Inputs.BabylonMesh.BabylonMeshDto): string {
        return inputs.babylonMesh.name;
    }

    /**
     * Change the material of the drawn mesh
     * @param inputs BabylonJS mesh and material
     * @group set
     * @shortname material
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
     * Gets the material of babylon mesh
     * @param inputs BabylonJS mesh
     * @group get
     * @shortname material
     */
    getMaterial(inputs: Inputs.BabylonMesh.BabylonMeshDto): BABYLON.Material {
        return inputs.babylonMesh.material;
    }

    /**
     * Gets the position as point of babylonjs mesh
     * @param inputs BabylonJS mesh
     * @returns point
     * @group get
     * @shortname position
     */
    getPosition(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3 {
        const m = inputs.babylonMesh;
        return [m.position.x, m.position.y, m.position.z];
    }

    /**
     * Gets the absolute position in the world as point of babylonjs mesh
     * @param inputs BabylonJS mesh
     * @returns point
     * @group get
     * @shortname absolute position
     */
    getAbsolutePosition(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3 {
        const m = inputs.babylonMesh;
        return [m.absolutePosition.x, m.absolutePosition.y, m.absolutePosition.z];
    }

    /**
     * Gets the rotation vector of babylonjs mesh
     * @param inputs BabylonJS mesh
     * @group get
     * @shortname rotation
     */
    getRotation(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3 {
        const m = inputs.babylonMesh;
        return [m.rotation.x, m.rotation.y, m.rotation.z];
    }

    /**
     * Gets the scale vector of babylonjs mesh
     * @param inputs BabylonJS mesh
     * @group get
     * @shortname scale
     */
    getScale(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3 {
        const m = inputs.babylonMesh;
        return [m.scaling.x, m.scaling.y, m.scaling.z];
    }

    /**
     * Moves babylonjs mesh forward in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname forward
     */
    moveForward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.forward, inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves babylonjs mesh backward in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname backward
     */
    moveBackward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.forward.negate(), inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves babylonjs mesh up in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname up
     */
    moveUp(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.up, inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves babylonjs mesh down in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname down
     */
    moveDown(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.up.negate(), inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves babylonjs mesh right in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname right
     */
    moveRight(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.right, inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Moves babylonjs mesh left in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname left
     */
    moveLeft(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        m.translate(m.right.negate(), inputs.distance, BABYLON.Space.WORLD);
    }

    /**
     * Rotates babylonjs mesh around local y axis
     * @param inputs BabylonJS mesh and rotation in degrees
     * @group move
     * @shortname yaw
     */
    yaw(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        const rot = BABYLON.Angle.FromDegrees(inputs.rotate).radians();
        m.rotate(BABYLON.Axis.Y, rot, BABYLON.Space.LOCAL);
    }

    /**
     * Rotates babylonjs mesh around local x axis
     * @param inputs BabylonJS mesh and rotation in degrees
     * @group move
     * @shortname pitch
     */
    pitch(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        const rot = BABYLON.Angle.FromDegrees(inputs.rotate).radians();
        m.rotate(BABYLON.Axis.X, rot, BABYLON.Space.LOCAL);
    }

    /**
     * Rotates babylonjs mesh around local z axis
     * @param inputs BabylonJS mesh and rotation in degrees
     * @group move
     * @shortname roll
     */
    roll(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void {
        const m = inputs.babylonMesh;
        const rot = BABYLON.Angle.FromDegrees(inputs.rotate).radians();
        m.rotate(BABYLON.Axis.Z, rot, BABYLON.Space.LOCAL);
    }

    /**
     * Rotates the mesh around axis and given position by a given angle
     * @param inputs Rotation around axis information    
     * @group move
     * @shortname rotate around axis with position
     */
    rotateAroundAxisWithPosition(inputs: Inputs.BabylonMesh.RotateAroundAxisNodeDto): void {
        inputs.mesh.rotateAround(
            new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
            new BABYLON.Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            BABYLON.Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Updates the position of the BabylonJS mesh or instanced mesh
     * @param inputs BabylonJS mesh and position point
     * @group set
     * @shortname position
     */
    setPosition(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshPositionDto): void {
        inputs.babylonMesh.position = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
    }

    /**
     * Updates the rotation of the BabylonJS mesh or instanced mesh
     * @param inputs BabylonJS mesh and rotation along x, y and z axis in degrees
     * @group set
     * @shortname rotation
     */
    setRotation(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshRotationDto): void {
        const radX = BABYLON.Angle.FromDegrees(inputs.rotation[0]).radians();
        const radY = BABYLON.Angle.FromDegrees(inputs.rotation[1]).radians();
        const radZ = BABYLON.Angle.FromDegrees(inputs.rotation[2]).radians();

        inputs.babylonMesh.rotation = new BABYLON.Vector3(radX, radY, radZ);
    }

    /**
     * Updates the scale of the BabylonJS mesh or instanced mesh
     * @param inputs BabylonJS mesh and scale vector
     * @group set
     * @shortname scale
     */
    setScale(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshScaleDto): void {
        inputs.babylonMesh.scaling = new BABYLON.Vector3(inputs.scale[0], inputs.scale[1], inputs.scale[2]);
    }

    /**
     * Checks wether mesh intersects another mesh mesh
     * @param inputs Two BabylonJS meshes
     * @group intersects
     * @shortname mesh
     */
    intersectsMesh(inputs: Inputs.BabylonMesh.IntersectsMeshDto): boolean {
        return inputs.babylonMesh.intersectsMesh(inputs.babylonMesh2, inputs.precise, inputs.includeDescendants);
    }

    /**
     * Checks wether mesh intersects point
     * @param inputs BabylonJS mesh and point
     * @group intersects
     * @shortname point
     */
    intersectsPoint(inputs: Inputs.BabylonMesh.IntersectsPointDto): boolean {
        const point = new BABYLON.Vector3(inputs.point[0], inputs.point[1], inputs.point[2]);
        return inputs.babylonMesh.intersectsPoint(point);
    }

    /**
    * Creates mesh instance for optimised rendering. This method will check if mesh contains children and will create instances for each child.
    *  These are optimised for max performance when rendering many similar objects in the scene. This method returns instances as childrens in a new mesh. 
    * If the mesh has children, then every child goes a mesh instance.
    * @group instance
    * @shortname create and transform
    * @disposableOutput true
    */
    createMeshInstanceAndTransformNoReturn(inputs: Inputs.BabylonMesh.MeshInstanceAndTransformDto): void {
        this.createMeshInstanceAndTransform(inputs);
    }

    /**
     * Creates mesh instance for optimised rendering. This method will check if mesh contains children and will create instances for each child.
     *  These are optimised for max performance when rendering many similar objects in the scene. This method returns instances as childrens in a new mesh. 
     * If the mesh has children, then every child goes a mesh instance.
     * @group instance
     * @returns babylon mesh
     * @shortname create and transform
     * @disposableOutput true
     */
    createMeshInstanceAndTransform(inputs: Inputs.BabylonMesh.MeshInstanceAndTransformDto): BABYLON.Mesh {
        const parent = new BABYLON.Mesh("instanceContainer" + Math.random(), this.context.scene);
        const sgs = this.context.scene?.metadata?.shadowGenerators as BABYLON.ShadowGenerator[];
        if (inputs.mesh && inputs.mesh.getChildMeshes && inputs.mesh.getChildMeshes().length > 0) {
            inputs.mesh.getChildMeshes(false).forEach((child: BABYLON.Mesh) => {
                const vertices = child.getTotalVertices();
                if (child.createInstance && vertices > 0) {
                    child.disableEdgesRendering();
                    const newInstance = child.createInstance(`InstanceMesh${Math.random()}`);
                    newInstance.position = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
                    newInstance.rotation = new BABYLON.Vector3(inputs.rotation[0], inputs.rotation[1], inputs.rotation[2]);
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
            const newInstance = inputs.mesh.createInstance(`InstanceMesh${Math.random()}`);

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
     * Creates mesh instance. These are optimised for max performance
     * when rendering many similar objects in the scene. If the mesh has children, then every child gets a mesh instance.
     * @group instance
     * @shortname create
     * @disposableOutput true
     */
    createMeshInstance(inputs: Inputs.BabylonMesh.MeshInstanceDto): BABYLON.Mesh {
        let result: BABYLON.Mesh;
        if (inputs.mesh && inputs.mesh.getChildMeshes && inputs.mesh.getChildMeshes().length > 0) {
            inputs.mesh.setParent(null);
            const container = new BABYLON.Mesh("meshCloneContainer" + Math.random());
            inputs.mesh.getChildMeshes(false).forEach((child: BABYLON.Mesh) => {
                if (child.createInstance && child.getTotalVertices() > 0 && child.getTotalIndices() > 0) {
                    const newInstance = child.createInstance(`InstanceMesh${Math.random()}`);
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
                const container = new BABYLON.Mesh("meshCloneContainer" + Math.random());
                const mesh = inputs.mesh.createInstance(`InstanceMesh${Math.random()}`);
                mesh.parent = container;
                result = container;
            }
        }
        return result;
    }

    /**
     * Gets side orientation
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


    private assignColorToMesh(mesh, color: BABYLON.Color3) {
        const mat = (mesh.material);
        if (mat instanceof BABYLON.PBRMetallicRoughnessMaterial) {
            mat.baseColor = color;
        } else if (mat instanceof BABYLON.StandardMaterial) {
            mat.diffuseColor = color;
        }
    }
}

