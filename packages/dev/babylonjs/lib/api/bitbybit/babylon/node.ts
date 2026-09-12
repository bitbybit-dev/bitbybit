
import { uniqueName } from "../../unique-name";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import { DrawHelper } from "../../draw-helper";
import * as Inputs from "../../inputs";

/**
 * Transform nodes: invisible points with a position and an orientation that meshes and other nodes
 * can be parented to, so a whole group moves as one. Building a hierarchy of nodes is how complex
 * arrangements are placed: turn the parent and every child turns with it. The methods here create
 * nodes, read their axes and positions in world or local space, and move, rotate and reparent them;
 * angles are in degrees.
 */

export class BabylonNode {

    constructor(private readonly context: Context, private readonly drawHelper: DrawHelper) { }

    /**
     * Draws the three axes of a node as colored lines of the given length, parented to it, so its
     * position and orientation can be seen; the default colors are red for X, green for Y and blue
     * for Z.
     * @param inputs - The node, the axis colors and the axis length
     * @example
     * ```typescript
     * bitbybit.babylon.node.drawNode({ node, colorX: "#ff0000", colorY: "#00ff00", colorZ: "#0000ff", size: 2 });
     * ```
     */
    drawNode(inputs: Inputs.BabylonNode.DrawNodeDto): void {
        const cotAxis = this.drawHelper.localAxes(
            inputs.size, this.context.scene, inputs.colorX, inputs.colorY, inputs.colorZ
        );
        cotAxis.parent = inputs.node;
    }

    /**
     * Draws the three axes of several nodes as colored lines of the given length, each set parented
     * to its node, as `drawNode` does for one.
     * @param inputs - The nodes, the axis colors and the axis length
     * @example
     * ```typescript
     * bitbybit.babylon.node.drawNodes({ nodes: [nodeA, nodeB], colorX: "#ff0000", colorY: "#00ff00", colorZ: "#0000ff", size: 2 });
     * ```
     */
    drawNodes(inputs: Inputs.BabylonNode.DrawNodesDto): void {
        inputs.nodes.forEach(node => {
            const CoTAxis = this.drawHelper.localAxes(
                inputs.size, this.context.scene, inputs.colorX, inputs.colorY, inputs.colorZ);
            CoTAxis.parent = node;
        });
    }

    /**
     * Creates a node at `origin` turned by the three `rotation` angles in degrees around X, Y and
     * Z, inside the coordinate system of `parent` when one is given.
     * @param inputs - The optional parent, the origin and the rotation angles in degrees
     * @returns The new node
     * @example
     * ```typescript
     * const node = bitbybit.babylon.node.createNodeFromRotation({ parent: null, origin: [0, 5, 0], rotation: [0, 45, 0] });
     * ```
     */
    createNodeFromRotation(inputs: Inputs.BabylonNode.CreateNodeFromRotationDto): BABYLON.TransformNode {
        const transformNode = new BABYLON.TransformNode(uniqueName("node"), this.context.scene);
        if (inputs.parent) {
            transformNode.parent = inputs.parent;
        }
        transformNode.position = new BABYLON.Vector3(inputs.origin[0], inputs.origin[1], inputs.origin[2]);
        transformNode.rotation = new BABYLON.Vector3(
            BABYLON.Angle.FromDegrees(inputs.rotation[0]).radians(),
            BABYLON.Angle.FromDegrees(inputs.rotation[1]).radians(),
            BABYLON.Angle.FromDegrees(inputs.rotation[2]).radians()
        );
        return transformNode;
    }

    /**
     * Creates a node parented to the root node of the scene, a fresh starting point for building a
     * hierarchy at the world origin.
     * @returns The new node, whose parent is the scene's root node
     * @example
     * ```typescript
     * const world = bitbybit.babylon.node.createWorldNode();
     * const arm = bitbybit.babylon.node.createNodeFromRotation({ parent: world, origin: [0, 5, 0], rotation: [0, 0, 30] });
     * ```
     */
    createWorldNode(): BABYLON.TransformNode {
        const tnode = new BABYLON.TransformNode(uniqueName("root"), this.context.scene);
        tnode.parent = this.context.scene.getTransformNodeByID("root");
        return tnode;
    }

    /**
     * Reads the direction a node's local Z axis points in world space, with every parent's rotation
     * applied.
     * @param inputs - The node
     * @returns The forward direction as a vector
     */
    getAbsoluteForwardVector(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const dir = inputs.node.forward;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Reads the direction a node's local X axis points in world space, with every parent's rotation
     * applied.
     * @param inputs - The node
     * @returns The right direction as a vector
     */
    getAbsoluteRightVector(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const dir = inputs.node.right;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Reads the direction a node's local Y axis points in world space, with every parent's rotation
     * applied.
     * @param inputs - The node
     * @returns The up direction as a vector
     */
    getAbsoluteUpVector(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const dir = inputs.node.up;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Reads where a node's origin is in world space, with every parent's transform applied.
     * @param inputs - The node
     * @returns The world position as a point
     */
    getAbsolutePosition(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const position = inputs.node.getAbsolutePosition();
        return [position.x, position.y, position.z];
    }

    /**
     * Reads the rotation of a node in world space, with every parent's rotation applied, as a 4x4
     * matrix of 16 numbers.
     * @param inputs - The node
     * @returns The rotation as a matrix of 16 numbers
     */
    getAbsoluteRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const rotationMatrix = new BABYLON.Matrix();
        inputs.node.absoluteRotationQuaternion.toRotationMatrix(rotationMatrix);
        return [...rotationMatrix.toArray()];
    }

    /**
     * Reads the rotation of a node relative to its parent as a 4x4 matrix of 16 numbers; the node
     * must carry a rotation quaternion, which `rotate` and `setDirection` give it.
     * @param inputs - The node
     * @returns The rotation as a matrix of 16 numbers
     */
    getRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const rotationMatrix = new BABYLON.Matrix();
        inputs.node.rotationQuaternion!.toRotationMatrix(rotationMatrix);
        return [...rotationMatrix.toArray()];
    }

    /**
     * Lists the nodes and meshes parented directly under a node, the ones that move with it.
     * @param inputs - The node
     * @returns The direct children
     */
    getChildren(inputs: Inputs.BabylonNode.NodeDto): BABYLON.Node[] {
        return inputs.node.getChildren();
    }

    /**
     * Reads the node a node is parented to, the one it moves with; a top-level node has none.
     * @param inputs - The node
     * @returns The parent node
     */
    getParent(inputs: Inputs.BabylonNode.NodeDto): BABYLON.Node {
        return inputs.node.parent!;
    }

    /**
     * Reads a node's position measured in its own local axes rather than its parent's, which
     * differs once the node is rotated.
     * @param inputs - The node
     * @returns The position as a point in the node's local space
     */
    getPositionExpressedInLocalSpace(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const position = inputs.node.getPositionExpressedInLocalSpace();
        return [position.x, position.y, position.z];
    }

    /**
     * Gives the root node of the scene, the top of the hierarchy that `createWorldNode` parents to.
     * @returns The root node
     */
    getRootNode(): BABYLON.TransformNode {
        return this.context.scene.getTransformNodeByID("root")!;
    }

    /**
     * Reads a node's rotation relative to its parent as three angles in degrees around X, Y and Z.
     * @param inputs - The node
     * @returns The rotation angles in degrees
     */
    getRotation(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const vector3 = inputs.node.rotation;
        return [
            BABYLON.Angle.FromRadians(vector3.x).degrees(),
            BABYLON.Angle.FromRadians(vector3.y).degrees(),
            BABYLON.Angle.FromRadians(vector3.z).degrees()
        ];
    }

    /**
     * Turns a node by `angle` degrees around an axis that passes through `position`, so the node
     * orbits that point rather than spinning in place; its children follow.
     * @param inputs - The node, the point on the axis, the axis direction and the angle in degrees
     * @example
     * ```typescript
     * bitbybit.babylon.node.rotateAroundAxisWithPosition({ node, position: [0, 0, 0], axis: [0, 1, 0], angle: 90 });
     * ```
     */
    rotateAroundAxisWithPosition(inputs: Inputs.BabylonNode.RotateAroundAxisNodeDto): void {
        inputs.node.rotateAround(
            new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
            new BABYLON.Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            BABYLON.Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Turns a node by `angle` degrees around an axis through its own origin, on top of its current
     * rotation; its children follow.
     * @param inputs - The node, the axis direction and the angle in degrees
     * @example
     * ```typescript
     * bitbybit.babylon.node.rotate({ node, axis: [0, 1, 0], angle: 45 });
     * ```
     */
    rotate(inputs: Inputs.BabylonNode.RotateNodeDto): void {
        inputs.node.rotate(
            new BABYLON.Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            BABYLON.Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Moves a node to a point in world space, whatever its parents are; its children follow.
     * @param inputs - The node and the world position
     * @example
     * ```typescript
     * bitbybit.babylon.node.setAbsolutePosition({ node, position: [10, 0, 0] });
     * ```
     */
    setAbsolutePosition(inputs: Inputs.BabylonNode.NodePositionDto): void {
        inputs.node.setAbsolutePosition(
            new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
        );
    }

    /**
     * Turns a node so its local Z axis points along `direction`; its children follow.
     * @param inputs - The node and the direction
     * @example
     * ```typescript
     * bitbybit.babylon.node.setDirection({ node, direction: [1, 0, 0] });
     * ```
     */
    setDirection(inputs: Inputs.BabylonNode.NodeDirectionDto): void {
        inputs.node.setDirection(
            new BABYLON.Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
        );
    }

    /**
     * Parents a node to another so it moves with it from then on, keeping its current place in the
     * world; a null parent detaches it.
     * @param inputs - The node and the new parent
     * @example
     * ```typescript
     * bitbybit.babylon.node.setParent({ node: wheel, parentNode: car });
     * ```
     */
    setParent(inputs: Inputs.BabylonNode.NodeParentDto): void {
        inputs.node.setParent(
            inputs.parentNode
        );
    }

    /**
     * Moves a node by `distance` scene units along `direction`, given in the node's own local axes;
     * its children follow.
     * @param inputs - The node, the direction and the distance
     * @example
     * ```typescript
     * bitbybit.babylon.node.translate({ node, direction: [0, 1, 0], distance: 5 });
     * ```
     */
    translate(inputs: Inputs.BabylonNode.NodeTranslationDto): void {
        inputs.node.translate(
            new BABYLON.Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
            inputs.distance,
        );
    }
}
