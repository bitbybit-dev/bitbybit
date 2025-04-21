
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import { DrawHelper } from "../../draw-helper";
import * as Inputs from "../../inputs";

/**
 * Nodes help understand the space and construct more complicated space structures. Nodes can be nested together
 * into child parent relationships to simplify the creation of 3D objects.
 */

export class BabylonNode {

    constructor(private readonly context: Context, private readonly drawHelper: DrawHelper) { }

    /**
     * Draws a node of given size with given colours for every axis
     * @param inputs Contains node data that includes size and colour information
     */
    drawNode(inputs: Inputs.BabylonNode.DrawNodeDto): void {
        const cotAxis = this.drawHelper.localAxes(
            inputs.size, this.context.scene, inputs.colorX, inputs.colorY, inputs.colorZ
        );
        cotAxis.parent = inputs.node;
    }

    /**
     * Draws a nodes of given size with given colours for every axis
     * @param inputs Contains node data that includes size and colour information
     */
    drawNodes(inputs: Inputs.BabylonNode.DrawNodesDto): void {
        inputs.nodes.forEach(node => {
            const CoTAxis = this.drawHelper.localAxes(
                inputs.size, this.context.scene, inputs.colorX, inputs.colorY, inputs.colorZ);
            CoTAxis.parent = node;
        });
    }

    /**
     * Creates a node on the origin with the given rotations in the parent coordinate system
     * @param inputs Contains information for origin, rotation and parent node
     * @returns A new node
     */
    createNodeFromRotation(inputs: Inputs.BabylonNode.CreateNodeFromRotationDto): BABYLON.TransformNode {
        const transformNode = new BABYLON.TransformNode(`node${Math.random()}`, this.context.scene);
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
     * Creates a world node which has root node as his parent
     * @returns A new node whos parent is the root node of the scene
     */
    createWorldNode(): BABYLON.TransformNode {
        const tnode = new BABYLON.TransformNode(`root${Math.random()}`, this.context.scene);
        tnode.parent = this.context.scene.getTransformNodeByID("root");
        return tnode;
    }

    /**
     * Gets the absolute forward facing vector in world space
     * @param inputs Node from which to get the forward vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteForwardVector(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const dir = inputs.node.forward;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Gets the absolute right facing vector in world space
     * @param inputs Node from which to get the right vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteRightVector(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const dir = inputs.node.right;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Gets the absolute up facing vector in world space
     * @param inputs Node from which to get the up vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteUpVector(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const dir = inputs.node.up;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Gets the absolute position of the node as origin vector in world space
     * @param inputs Node from which to get the absolute position
     * @returns Vector as an array of numbers indicating location of origin in world space
     */
    getAbsolutePosition(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const position = inputs.node.getAbsolutePosition();
        return [position.x, position.y, position.z];
    }

    /**
     * Gets the absolute rotation of the node as a transformation matrix encoded in array of 16 numbers
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getAbsoluteRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const rotationMatrix = new BABYLON.Matrix();
        inputs.node.absoluteRotationQuaternion.toRotationMatrix(rotationMatrix);
        return [...rotationMatrix.toArray()];
    }

    /**
     * Gets the rotation of the node in local parent coordinate space as a transformation matrix encoded in array of 16 numbers
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const rotationMatrix = new BABYLON.Matrix();
        inputs.node.rotationQuaternion.toRotationMatrix(rotationMatrix);
        return [...rotationMatrix.toArray()];
    }

    /**
     * Gets children of the node
     * @param inputs Node from which to get the children
     * @returns List of children nodes in the array
     */
    getChildren(inputs: Inputs.BabylonNode.NodeDto): BABYLON.Node[] {
        return inputs.node.getChildren();
    }

    /**
     * Gets parent of the node
     * @param inputs Node from which to get a parent
     * @returns Parent node
     */
    getParent(inputs: Inputs.BabylonNode.NodeDto): BABYLON.Node {
        return inputs.node.parent;
    }

    /**
     * Gets the position of the node expressed in local space
     * @param inputs Node from which to get the position in local space
     * @returns Position vector
     */
    getPositionExpressedInLocalSpace(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const position = inputs.node.getPositionExpressedInLocalSpace();
        return [position.x, position.y, position.z];
    }

    /**
     * Gets the root node
     * @returns Root node
     */
    getRootNode(): BABYLON.TransformNode {
        return this.context.scene.getTransformNodeByID("root");
    }

    /**
     * Gets the euler rotations
     * @param inputs Node from which to get rotation
     * @returns Euler rotations of x, y and z angles in the number array
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
     * Rotates the node around axis and given position by a given angle
     * @param inputs Rotation around axis information
     */
    rotateAroundAxisWithPosition(inputs: Inputs.BabylonNode.RotateAroundAxisNodeDto): void {
        inputs.node.rotateAround(
            new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
            new BABYLON.Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            BABYLON.Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Rotates the node around the origin and given axis
     * @param inputs Rotation information
     */
    rotate(inputs: Inputs.BabylonNode.RotateNodeDto): void {
        inputs.node.rotate(
            new BABYLON.Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            BABYLON.Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Sets the absolute position of the node
     * @param inputs Node absolute position information
     */
    setAbsolutePosition(inputs: Inputs.BabylonNode.NodePositionDto): void {
        inputs.node.setAbsolutePosition(
            new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
        );
    }

    /**
     * Sets the direction of the node
     * @param inputs Direction information
     */
    setDirection(inputs: Inputs.BabylonNode.NodeDirectionDto): void {
        inputs.node.setDirection(
            new BABYLON.Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
        );
    }

    /**
     * Sets the new parent to the node
     * @param inputs Node parent information
     */
    setParent(inputs: Inputs.BabylonNode.NodeParentDto): void {
        inputs.node.setParent(
            inputs.parentNode
        );
    }

    /**
     * Translates the node by a given direction vector and a distance
     * @param inputs Node translation information
     */
    translate(inputs: Inputs.BabylonNode.NodeTranslationDto): void {
        inputs.node.translate(
            new BABYLON.Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
            inputs.distance,
        );
    }
}
