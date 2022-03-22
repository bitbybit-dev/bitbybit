
import {
    Color4, Color3, Mesh, Vector3,
    StandardMaterial, PBRMetallicRoughnessMaterial, VertexBuffer, ShadowGenerator, Angle, InstancedMesh, Axis, Space
} from '@babylonjs/core';
import { Context } from '../../context';
import * as Inputs from '../../inputs/inputs';


export class BabylonMesh {

    constructor(
        private readonly context: Context,
    ) { }

    /** Disposes drawn mesh object from the scene
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/dispose.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#dispose
     * @param inputs Contains BabylonJS mesh that should be disposed
     */
    dispose(inputs: Inputs.BabylonMesh.BabylonMeshDto) {
        if (inputs.babylonMesh) {
            inputs.babylonMesh.getScene().removeMesh(inputs.babylonMesh, true);
            inputs.babylonMesh.dispose();
        }
    }

    /** Udates drawn BabylonJS mesh object without disposing it
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/updateDrawn.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#updateDrawn
     * @param inputs Contains BabylonJS mesh that should be updated, together with position, rotation, scaling and colour info
     * @returns BabylonJS Mesh
     */
    updateDrawn(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMesh) {
        const type = inputs.babylonMesh.metadata.type as Inputs.Draw.drawingTypes;
        let result: Mesh;

        inputs.babylonMesh.position = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        inputs.babylonMesh.rotation = new Vector3(inputs.rotation[0], inputs.rotation[1], inputs.rotation[2]);
        inputs.babylonMesh.scaling = new Vector3(inputs.scaling[0], inputs.scaling[1], inputs.scaling[2]);

        const areColorsArray = Array.isArray(inputs.colours);

        const meshChildren = inputs.babylonMesh.getChildMeshes();
        if (meshChildren && meshChildren.length > 0) {
            if (areColorsArray && inputs.colours.length === meshChildren.length) {
                meshChildren.forEach((child, index) => {
                    const color = Color3.FromHexString(inputs.colours[index]);
                    this.assignColorToMesh(child, color);
                })
            } else if (areColorsArray) {
                meshChildren.forEach((child) => {
                    const color = Color3.FromHexString(inputs.colours[0]);
                    this.assignColorToMesh(child, color);
                })
            } else {
                meshChildren.forEach((child) => {
                    const color = Color3.FromHexString(inputs.colours as string);
                    this.assignColorToMesh(child, color);
                })
            }
        } else {
            const color = areColorsArray ? Color3.FromHexString(inputs.colours[0]) : Color3.FromHexString(inputs.colours as string)
            this.assignColorToMesh(inputs.babylonMesh, color);
        }

        if (inputs.babylonMesh.edgesRenderer !== null) {
            const color = areColorsArray ? Color3.FromHexString(inputs.colours[0]) : Color3.FromHexString(inputs.colours as string)
            inputs.babylonMesh.edgesColor = Color4.FromColor3(color);
        }
        if ([
            Inputs.Draw.drawingTypes.point,
            Inputs.Draw.drawingTypes.points,
            Inputs.Draw.drawingTypes.line,
            Inputs.Draw.drawingTypes.lines,
            Inputs.Draw.drawingTypes.polyline,
            Inputs.Draw.drawingTypes.polylines].includes(type)) {
            const colors = inputs.babylonMesh.getVerticesData(VertexBuffer.ColorKind);
            const length = colors.length / 4;

            const c = [];

            if (areColorsArray && length === inputs.colours.length) {
                for (let i = 0; i < length; i++) {
                    const col = Color4.FromColor3(Color3.FromHexString(inputs.colours[i]));
                    c.push(col.r, col.g, col.b, col.a);
                }
            } else if (areColorsArray) {
                const col = Color4.FromColor3(Color3.FromHexString(inputs.colours[0]));
                for (let i = 0; i < length; i++) {
                    c.push(col.r, col.g, col.b, col.a);
                }
            } else {
                const col = Color4.FromColor3(Color3.FromHexString(inputs.colours as string));
                for (let i = 0; i < length; i++) {
                    c.push(col.r, col.g, col.b, col.a);
                }
            }

            inputs.babylonMesh.setVerticesData(VertexBuffer.ColorKind, c);
        }

        return result;
    }

    /**
     * Change the visibility of a drawn BabylonJS mesh
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/setMeshVisibility.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#setMeshVisibility
     * @param inputs BabylonJS mesh and parent mesh
     */
    setMeshVisibility(inputs: Inputs.BabylonMesh.SetMeshVisibilityDto) {
        inputs.babylonMesh.visibility = inputs.visibility;
        inputs.babylonMesh.getChildMeshes().forEach(mesh => {
            mesh.visibility = inputs.visibility;
        })
    }

    /**
     * Hides the mesh
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/hide.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#hide
     * @param inputs BabylonJS mesh to hide
     */
    hide(inputs: Inputs.BabylonMesh.BabylonMeshDto) {
        inputs.babylonMesh.isVisible = false;
        inputs.babylonMesh.getChildMeshes().forEach(mesh => {
            mesh.isVisible = false;
        })
    }

    /**
     * Show the mesh
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/show.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#show
     * @param inputs BabylonJS mesh to hide
     */
    show(inputs: Inputs.BabylonMesh.BabylonMeshDto) {
        inputs.babylonMesh.isVisible = true;
        inputs.babylonMesh.getChildMeshes().forEach(mesh => {
            mesh.isVisible = true;
        })
    }

    /**
     * Change the parent of the drawn mesh
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/setParentForMesh.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#setParentForMesh
     * @param inputs BabylonJS mesh and parent mesh
     */
    setParentForMesh(inputs: Inputs.BabylonMesh.SetParentDto) {
        inputs.babylonMesh.parent = inputs.parentMesh;
    }

    /**
      * Gets the position as point of babylonjs mesh
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/getPosition.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#getPosition
      * @param inputs BabylonJS mesh
      */
    getPosition(inputs: Inputs.BabylonMesh.BabylonMeshDto) {
        const m = inputs.babylonMesh;
        return [m.position.x, m.position.y, m.position.z];
    }

    /**
      * Gets the rotation vector of babylonjs mesh
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/getRotation.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#getRotation
      * @param inputs BabylonJS mesh
      */
    getRotation(inputs: Inputs.BabylonMesh.BabylonMeshDto) {
        const m = inputs.babylonMesh;
        return [m.rotation.x, m.rotation.y, m.rotation.z];
    }

    /**
      * Gets the scale vector of babylonjs mesh
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/getScale.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#getScale
      * @param inputs BabylonJS mesh
      */
    getScale(inputs: Inputs.BabylonMesh.BabylonMeshDto) {
        const m = inputs.babylonMesh;
        return [m.scaling.x, m.scaling.y, m.scaling.z];
    }

    /**
      * Moves babylonjs mesh forward in local space
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/moveForward.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#moveForward
      * @param inputs BabylonJS mesh and distance
      */
    moveForward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto) {
        const m = inputs.babylonMesh;
        m.translate(m.forward, inputs.distance, Space.WORLD);
    }

    /**
      * Moves babylonjs mesh backward in local space
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/moveBackward.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#moveBackward
      * @param inputs BabylonJS mesh and distance
      */
    moveBackward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto) {
        const m = inputs.babylonMesh;
        m.translate(m.forward.negate(), inputs.distance, Space.WORLD);
    }

    /**
      * Moves babylonjs mesh up in local space
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/moveUp.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#moveUp
      * @param inputs BabylonJS mesh and distance
      */
    moveUp(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto) {
        const m = inputs.babylonMesh;
        m.translate(m.up, inputs.distance, Space.WORLD);
    }

    /**
      * Moves babylonjs mesh down in local space
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/moveDown.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#moveDown
      * @param inputs BabylonJS mesh and distance
      */
    moveDown(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto) {
        const m = inputs.babylonMesh;
        m.translate(m.up.negate(), inputs.distance, Space.WORLD);
    }

    /**
      * Moves babylonjs mesh right in local space
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/moveRight.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#moveRight
      * @param inputs BabylonJS mesh and distance
      */
    moveRight(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto) {
        const m = inputs.babylonMesh;
        m.translate(m.right, inputs.distance, Space.WORLD);
    }

    /**
      * Moves babylonjs mesh left in local space
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/moveLeft.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#moveLeft
      * @param inputs BabylonJS mesh and distance
      */
    moveLeft(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto) {
        const m = inputs.babylonMesh;
        m.translate(m.right.negate(), inputs.distance, Space.WORLD);
    }

    /**
      * Rotates babylonjs mesh around local y axis
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/yaw.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#yaw
      * @param inputs BabylonJS mesh and rotation in degrees
      */
    yaw(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto) {
        const m = inputs.babylonMesh;
        const rot = Angle.FromDegrees(inputs.rotate).radians();
        m.rotate(Axis.Y, rot, Space.LOCAL);
    }

    /**
      * Rotates babylonjs mesh around local x axis
      * <div>
      *  <img src="../assets/images/blockly-images/babylon/mesh/pitch.svg" alt="Blockly Image"/>
      * </div>
      * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#pitch
      * @param inputs BabylonJS mesh and rotation in degrees
      */
    pitch(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto) {
        const m = inputs.babylonMesh;
        const rot = Angle.FromDegrees(inputs.rotate).radians();
        m.rotate(Axis.X, rot, Space.LOCAL);
    }

    /**
     * Rotates babylonjs mesh around local z axis
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/roll.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#roll
     * @param inputs BabylonJS mesh and rotation in degrees
     */
    roll(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto) {
        const m = inputs.babylonMesh;
        const rot = Angle.FromDegrees(inputs.rotate).radians();
        m.rotate(Axis.Z, rot, Space.LOCAL);
    }

    /**
     * Updates the position of the BabylonJS mesh or instanced mesh
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/setPosition.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#setPosition
     * @param inputs BabylonJS mesh and position point
     */
    setPosition(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshPositionDto) {
        inputs.babylonMesh.position = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
    }

    /**
     * Updates the rotation of the BabylonJS mesh or instanced mesh
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/setRotation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#setRotation
     * @param inputs BabylonJS mesh and rotation along x, y and z axis in degrees
     */
    setRotation(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshRotationDto) {
        const radX = Angle.FromDegrees(inputs.rotation[0]).radians();
        const radY = Angle.FromDegrees(inputs.rotation[1]).radians();
        const radZ = Angle.FromDegrees(inputs.rotation[2]).radians();

        inputs.babylonMesh.rotation = new Vector3(radX, radY, radZ);
    }

    /**
     * Updates the scale of the BabylonJS mesh or instanced mesh
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/setScale.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#setScale
     * @param inputs BabylonJS mesh and scale vector
     */
    setScale(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshScaleDto) {
        inputs.babylonMesh.scaling = new Vector3(inputs.scale[0], inputs.scale[1], inputs.scale[2]);
    }

    /**
     * Creates mesh instance and transforms it for optimised rendering. These are optimised for max performance
     * when rendering many similar objects in the scene. If the mesh has children, then every child ges a mesh instance.
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/createMeshInstanceAndTransform.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#createMeshInstanceAndTransform
     */
    createMeshInstanceAndTransform(inputs: Inputs.BabylonMesh.MeshInstanceAndTransformDto): Promise<any> {
        return new Promise((resolve, reject) => {
            if (inputs.mesh && inputs.mesh.getChildMeshes && inputs.mesh.getChildMeshes().length > 0) {
                inputs.mesh.getChildMeshes(false).forEach((child: Mesh) => {
                    if (child.createInstance) {
                        child.disableEdgesRendering();
                        const newInstance = child.createInstance(`InstanceMesh${Math.random()}`);

                        newInstance.position = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
                        newInstance.rotation = new Vector3(inputs.rotation[0], inputs.rotation[1], inputs.rotation[2]);
                        newInstance.scaling = new Vector3(inputs.scaling[0], inputs.scaling[1], inputs.scaling[2]);
                    }
                });
                inputs.mesh.isVisible = false;
            } else if (inputs.mesh) {
                inputs.mesh.isVisible = false;
                const newInstance = inputs.mesh.createInstance(`InstanceMesh${Math.random()}`);

                newInstance.position = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
                newInstance.rotation = new Vector3(
                    Angle.FromDegrees(inputs.rotation[0]).radians(),
                    Angle.FromDegrees(inputs.rotation[1]).radians(),
                    Angle.FromDegrees(inputs.rotation[2]).radians());
                newInstance.scaling = new Vector3(inputs.scaling[0], inputs.scaling[1], inputs.scaling[2]);
            }
            resolve({} as any);
        });
    }


    /**
     * Creates mesh instance. These are optimised for max performance
     * when rendering many similar objects in the scene. If the mesh has children, then every child gets a mesh instance.
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/mesh/createMeshInstance.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_mesh.BabylonMesh.html#createMeshInstance
     */
    createMeshInstance(inputs: Inputs.BabylonMesh.MeshInstanceDto): InstancedMesh {
        let result: InstancedMesh;
        if (inputs.mesh && inputs.mesh.getChildMeshes && inputs.mesh.getChildMeshes().length > 0) {
            const instance = inputs.mesh.createInstance('meshCloneInstance' + Math.random());

            inputs.mesh.getChildMeshes(false).forEach((child: Mesh) => {
                if (child.createInstance && child.getTotalVertices() > 0 && child.getTotalIndices() > 0) {
                    const newInstance = child.createInstance(`InstanceMesh${Math.random()}`);
                    newInstance.parent = instance;
                }
            });
            result = instance;

            const sgs = this.context.scene.metadata.shadowGenerators as ShadowGenerator[];

            if (sgs.length > 0) {
                result.getChildMeshes().forEach(m => {
                    sgs.forEach(sg => sg.addShadowCaster(m));
                });
                sgs.forEach(sg => sg.addShadowCaster(result));
            }
        } else if (inputs.mesh) {
            result = inputs.mesh.createInstance(`InstanceMesh${Math.random()}`);
        }
        return result;
    }

    private assignColorToMesh(mesh, color: Color3) {
        const mat = (mesh.material);
        if (mat instanceof PBRMetallicRoughnessMaterial) {
            mat.baseColor = color;
        } else if (mat instanceof StandardMaterial) {
            mat.diffuseColor = color;
        }
    }
}

