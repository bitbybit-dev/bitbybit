
import { Angle, Matrix, TransformNode, Node, Vector3 } from '@babylonjs/core';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';

/**
 * Nodes help understand the space and construct more complicated space structures. Nodes can be nested together
 * into child parent relationships to simplify the creation of 3D objects.
 */

export class BabylonNode {

    constructor(private readonly context: Context, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Draws a node of given size with given colours for every axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#drawNode
     * @param inputs Contains node data that includes size and colour information
     */
    drawNode(inputs: Inputs.BabylonNode.DrawNodeDto): void {
        const cotAxis = this.geometryHelper.localAxes(
            inputs.size, this.context.scene, inputs.colorX, inputs.colorY, inputs.colorZ
        );
        cotAxis.parent = inputs.node;
    }

    /**
     * Draws a nodes of given size with given colours for every axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#drawNodes
     * @param inputs Contains node data that includes size and colour information
     */
    drawNodes(inputs: Inputs.BabylonNode.DrawNodesDto): void {
        inputs.nodes.forEach(node => {
            const CoTAxis = this.geometryHelper.localAxes(
                inputs.size, this.context.scene, inputs.colorX, inputs.colorY, inputs.colorZ);
            CoTAxis.parent = node;
        });
    }

    /**
     * Creates a node on the origin with the given rotations in the parent coordinate system
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/createNodeFromRotation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#createNodeFromRotation
     * @param inputs Contains information for origin, rotation and parent node
     * @returns A new node
     */
    createNodeFromRotation(inputs: Inputs.BabylonNode.CreateNodeFromRotationDto): TransformNode {
        const transformNode = new TransformNode(`node${Math.random()}`);
        if (inputs.parent) {
            transformNode.parent = inputs.parent;
        }
        transformNode.position = new Vector3(inputs.origin[0], inputs.origin[1], inputs.origin[2]);
        transformNode.rotation = new Vector3(
            Angle.FromDegrees(inputs.rotation[0]).radians(),
            Angle.FromDegrees(inputs.rotation[1]).radians(),
            Angle.FromDegrees(inputs.rotation[2]).radians()
        );
        return transformNode;
    }

    /**
     * Creates a world node which has root node as his parent
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/createWorldNode.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#createWorldNode
     * @returns A new node whos parent is the root node of the scene
     */
    createWorldNode(): TransformNode {
        const tnode = new TransformNode(`root${Math.random()}`);
        tnode.parent = this.context.scene.getTransformNodeByID('root');
        return tnode;
    }

    /**
     * Gets the absolute forward facing vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getAbsoluteForwardVector.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getAbsoluteForwardVector
     * @param inputs Node from which to get the forward vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteForwardVector(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const dir = inputs.node.forward;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Gets the absolute right facing vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getAbsoluteRightVector.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getAbsoluteRightVector
     * @param inputs Node from which to get the right vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteRightVector(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const dir = inputs.node.right;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Gets the absolute up facing vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getAbsoluteUpVector.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getAbsoluteUpVector
     * @param inputs Node from which to get the up vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteUpVector(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const dir = inputs.node.up;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Gets the absolute position of the node as origin vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getAbsolutePosition.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getAbsolutePosition
     * @param inputs Node from which to get the absolute position
     * @returns Vector as an array of numbers indicating location of origin in world space
     */
    getAbsolutePosition(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const position = inputs.node.getAbsolutePosition();
        return [position.x, position.y, position.z];
    }

    /**
     * Gets the absolute rotation of the node as a transformation matrix encoded in array of 16 numbers
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getAbsoluteRotationTransformation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getAbsoluteRotationTransformation
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getAbsoluteRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const rotationMatrix = new Matrix();
        inputs.node.absoluteRotationQuaternion.toRotationMatrix(rotationMatrix);
        return rotationMatrix.toArray() as number[];
    }

    /**
     * Gets the rotation of the node in local parent coordinate space as a transformation matrix encoded in array of 16 numbers
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getRotationTransformation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getRotationTransformation
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const rotationMatrix = new Matrix();
        inputs.node.rotationQuaternion.toRotationMatrix(rotationMatrix);
        return rotationMatrix.toArray() as number[];
    }

    /**
     * Gets children of the node
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getChildren.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getChildren
     * @param inputs Node from which to get the children
     * @returns List of children nodes in the array
     */
    getChildren(inputs: Inputs.BabylonNode.NodeDto): Node[] {
        return inputs.node.getChildren();
    }

    /**
     * Gets parent of the node
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getParent.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getParent
     * @param inputs Node from which to get a parent
     * @returns Parent node
     */
    getParent(inputs: Inputs.BabylonNode.NodeDto): Node {
        return inputs.node.parent;
    }

    /**
     * Gets the position of the node expressed in local space
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getPositionExpressedInLocalSpace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getPositionExpressedInLocalSpace
     * @param inputs Node from which to get the position in local space
     * @returns Position vector
     */
    getPositionExpressedInLocalSpace(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const position = inputs.node.getPositionExpressedInLocalSpace();
        return [position.x, position.y, position.z];
    }

    /**
     * Gets the root node
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getRootNode.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getRootNode
     * @returns Root node
     */
    getRootNode(): TransformNode {
        return this.context.scene.getTransformNodeByID('root');
    }

    /**
     * Gets the euler rotations
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/getRotation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#getRotation
     * @param inputs Node from which to get rotation
     * @returns Euler rotations of x, y and z angles in the number array
     */
    getRotation(inputs: Inputs.BabylonNode.NodeDto): number[] {
        const vector3 = inputs.node.rotation;
        return [
            Angle.FromRadians(vector3.x).degrees(),
            Angle.FromRadians(vector3.y).degrees(),
            Angle.FromRadians(vector3.z).degrees()
        ];
    }

    /**
     * Rotates the node around axis and given position by a given angle
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/rotateAroundAxisWithPosition.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#rotateAroundAxisWithPosition
     * @param inputs Rotation around axis information
     */
    rotateAroundAxisWithPosition(inputs: Inputs.BabylonNode.RotateAroundAxisNodeDto): void {
        inputs.node.rotateAround(
            new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
            new Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Rotates the node around the origin and given axis
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/rotate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#rotate
     * @param inputs Rotation information
     */
    rotate(inputs: Inputs.BabylonNode.RotateNodeDto): void {
        inputs.node.rotate(
            new Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Sets the absolute position of the node
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/setAbsolutePosition.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#setAbsolutePosition
     * @param inputs Node absolute position information
     */
    setAbsolutePosition(inputs: Inputs.BabylonNode.NodePositionDto): void {
        inputs.node.setAbsolutePosition(
            new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
        );
    }

    /**
     * Sets the direction of the node
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/setDirection.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#setDirection
     * @param inputs Direction information
     */
    setDirection(inputs: Inputs.BabylonNode.NodeDirectionDto): void {
        inputs.node.setDirection(
            new Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
        );
    }

    /**
     * Sets the new parent to the node
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/setParent.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#setParent
     * @param inputs Node parent information
     */
    setParent(inputs: Inputs.BabylonNode.NodeParentDto): void {
        inputs.node.setParent(
            inputs.parentNode
        );
    }

    /**
     * Translates the node by a given direction vector and a distance
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/node/translate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_node.BabylonNode.html#translate
     * @param inputs Node translation information
     */
    translate(inputs: Inputs.BabylonNode.NodeTranslationDto): void {
        inputs.node.translate(
            new Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
            inputs.distance,
        );
    }
}
