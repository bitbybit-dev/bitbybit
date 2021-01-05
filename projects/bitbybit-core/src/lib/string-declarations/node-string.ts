import { simplifyDeclaration } from "./simplify-declaration";

export const nodeString = simplifyDeclaration(`
import { TransformNode, Node as BabylonNode } from '@babylonjs/core';
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';
/**
 * Nodes help understand the space and construct more complicated space structures. Nodes can be nested together
 * into child parent relationships to simplify the creation of 3D objects.
 */
export declare class Node {
    private readonly context;
    constructor(context: Context);
    /**
     * Draws a node of given size with given colours for every axis
     * <div>
     *  <img src="../assets/images/blockly-images/node/drawNode.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#drawnode
     * @param inputs Contains node data that includes size and colour information
     */
    drawNode(inputs: Inputs.Node.DrawNodeDto): void;
    /**
     * Draws a nodes of given size with given colours for every axis
     * <div>
     *  <img src="../assets/images/blockly-images/node/drawNodes.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#drawnodes
     * @param inputs Contains node data that includes size and colour information
     */
    drawNodes(inputs: Inputs.Node.DrawNodesDto): void;
    /**
     * Creates a node on the origin with the given rotations in the parent coordinate system
     * <div>
     *  <img src="../assets/images/blockly-images/node/createNodeFromRotation.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#createnodefromrotation
     * @param inputs Contains information for origin, rotation and parent node
     * @returns A new node
     */
    createNodeFromRotation(inputs: Inputs.Node.CreateNodeFromRotationDto): TransformNode;
    /**
     * Creates a world node which has root node as his parent
     * <div>
     *  <img src="../assets/images/blockly-images/node/createWorldNode.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#createworldnode
     * @returns A new node whos parent is the root node of the scene
     */
    createWorldNode(): TransformNode;
    /**
     * Gets the absolute forward facing vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/node/getAbsoluteForwardVector.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getabsoluteforwardvector
     * @param inputs Node from which to get the forward vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteForwardVector(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the absolute right facing vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/node/getAbsoluteRightVector.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getabsoluterightvector
     * @param inputs Node from which to get the right vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteRightVector(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the absolute up facing vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/node/getAbsoluteUpVector.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getabsoluteupvector
     * @param inputs Node from which to get the up vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteUpVector(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the absolute position of the node as origin vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/node/getAbsolutePosition.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getabsoluteposition
     * @param inputs Node from which to get the absolute position
     * @returns Vector as an array of numbers indicating location of origin in world space
     */
    getAbsolutePosition(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the absolute rotation of the node as a transformation matrix encoded in array of 16 numbers
     * <div>
     *  <img src="../assets/images/blockly-images/node/getAbsoluteRotationTransformation.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getabsoluterotationtransformation
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getAbsoluteRotationTransformation(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the rotation of the node in local parent coordinate space as a transformation matrix encoded in array of 16 numbers
     * <div>
     *  <img src="../assets/images/blockly-images/node/getRotationTransformation.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getrotationtransformation
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getRotationTransformation(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets children of the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/getChildren.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getchildren
     * @param inputs Node from which to get the children
     * @returns List of children nodes in the array
     */
    getChildren(inputs: Inputs.Node.NodeDto): BabylonNode[];
    /**
     * Gets parent of the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/getParent.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getparent
     * @param inputs Node from which to get a parent
     * @returns Parent node
     */
    getParent(inputs: Inputs.Node.NodeDto): BabylonNode;
    /**
     * Gets the position of the node expressed in local space
     * <div>
     *  <img src="../assets/images/blockly-images/node/getPositionExpressedInLocalSpace.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getpositionexpressedinlocalspace
     * @param inputs Node from which to get the position in local space
     * @returns Position vector
     */
    getPositionExpressedInLocalSpace(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the root node
     * <div>
     *  <img src="../assets/images/blockly-images/node/getRootNode.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getrootnode
     * @returns Root node
     */
    getRootNode(): TransformNode;
    /**
     * Gets the euler rotations
     * <div>
     *  <img src="../assets/images/blockly-images/node/getRotation.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#getrotation
     * @param inputs Node from which to get rotation
     * @returns Euler rotations of x, y and z angles in the number array
     */
    getRotation(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Rotates the node around axis and given position by a given angle
     * <div>
     *  <img src="../assets/images/blockly-images/node/rotateAroundAxisWithPosition.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#rotatearoundaxiswithposition
     * @param inputs Rotation around axis information
     */
    rotateAroundAxisWithPosition(inputs: Inputs.Node.RotateAroundAxisNodeDto): void;
    /**
     * Rotates the node around the origin and given axis
     * <div>
     *  <img src="../assets/images/blockly-images/node/rotate.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#rotate
     * @param inputs Rotation information
     */
    rotate(inputs: Inputs.Node.RotateNodeDto): void;
    /**
     * Sets the absolute position of the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/setAbsolutePosition.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#setabsoluteposition
     * @param inputs Node absolute position information
     */
    setAbsolutePosition(inputs: Inputs.Node.NodePositionDto): void;
    /**
     * Sets the direction of the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/setDirection.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#setdirection
     * @param inputs Direction information
     */
    setDirection(inputs: Inputs.Node.NodeDirectionDto): void;
    /**
     * Sets the new parent to the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/setParent.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#setparent
     * @param inputs Node parent information
     */
    setParent(inputs: Inputs.Node.NodeParentDto): void;
    /**
     * Translates the node by a given direction vector and a distance
     * <div>
     *  <img src="../assets/images/blockly-images/node/translate.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_node_.node.html#translate
     * @param inputs Node translation information
     */
    translate(inputs: Inputs.Node.NodeTranslationDto): void;
}

`);