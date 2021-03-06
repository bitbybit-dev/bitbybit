import { Injectable } from '@angular/core';
import { Angle, Matrix, Mesh, Quaternion, TransformNode, Node as BabylonNode, Vector3 } from '@babylonjs/core';
import { BitByBitBlocklyHelperService } from '../../bit-by-bit-blockly-helper.service';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Nodes help understand the space and construct more complicated space structures. Nodes can be nested together
 * into child parent relationships to simplify the creation of 3D objects.
 */
@Injectable()
export class Node {

    constructor(private readonly context: Context, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Draws a node of given size with given colours for every axis
     * <div>
     *  <img src="../assets/images/blockly-images/node/drawNode.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#drawnode
     * @param inputs Contains node data that includes size and colour information
     */
    drawNode(inputs: Inputs.Node.DrawNodeDto): void {
        const cotAxis = this.geometryHelper.localAxes(
            inputs.size, this.context.scene, inputs.colorX, inputs.colorY, inputs.colorZ
        );
        cotAxis.parent = inputs.node;
    }

    /**
     * Draws a nodes of given size with given colours for every axis
     * <div>
     *  <img src="../assets/images/blockly-images/node/drawNodes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#drawnodes
     * @param inputs Contains node data that includes size and colour information
     */
    drawNodes(inputs: Inputs.Node.DrawNodesDto): void {
        inputs.nodes.forEach(node => {
            const CoTAxis = this.geometryHelper.localAxes(
                inputs.size, this.context.scene, inputs.colorX, inputs.colorY, inputs.colorZ);
            CoTAxis.parent = node;
        });
    }

    /**
     * Creates a node on the origin with the given rotations in the parent coordinate system
     * <div>
     *  <img src="../assets/images/blockly-images/node/createNodeFromRotation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#createnodefromrotation
     * @param inputs Contains information for origin, rotation and parent node
     * @returns A new node
     */
    createNodeFromRotation(inputs: Inputs.Node.CreateNodeFromRotationDto): TransformNode {
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
     *  <img src="../assets/images/blockly-images/node/createWorldNode.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#createworldnode
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
     *  <img src="../assets/images/blockly-images/node/getAbsoluteForwardVector.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluteforwardvector
     * @param inputs Node from which to get the forward vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteForwardVector(inputs: Inputs.Node.NodeDto): number[] {
        const dir = inputs.node.forward;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Gets the absolute right facing vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/node/getAbsoluteRightVector.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluterightvector
     * @param inputs Node from which to get the right vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteRightVector(inputs: Inputs.Node.NodeDto): number[] {
        const dir = inputs.node.right;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Gets the absolute up facing vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/node/getAbsoluteUpVector.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluteupvector
     * @param inputs Node from which to get the up vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteUpVector(inputs: Inputs.Node.NodeDto): number[] {
        const dir = inputs.node.up;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Gets the absolute position of the node as origin vector in world space
     * <div>
     *  <img src="../assets/images/blockly-images/node/getAbsolutePosition.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluteposition
     * @param inputs Node from which to get the absolute position
     * @returns Vector as an array of numbers indicating location of origin in world space
     */
    getAbsolutePosition(inputs: Inputs.Node.NodeDto): number[] {
        const position = inputs.node.getAbsolutePosition();
        return [position.x, position.y, position.z];
    }

    /**
     * Gets the absolute rotation of the node as a transformation matrix encoded in array of 16 numbers
     * <div>
     *  <img src="../assets/images/blockly-images/node/getAbsoluteRotationTransformation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluterotationtransformation
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getAbsoluteRotationTransformation(inputs: Inputs.Node.NodeDto): number[] {
        const rotationMatrix = new Matrix();
        inputs.node.absoluteRotationQuaternion.toRotationMatrix(rotationMatrix);
        return rotationMatrix.toArray() as number[];
    }

    /**
     * Gets the rotation of the node in local parent coordinate space as a transformation matrix encoded in array of 16 numbers
     * <div>
     *  <img src="../assets/images/blockly-images/node/getRotationTransformation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getrotationtransformation
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getRotationTransformation(inputs: Inputs.Node.NodeDto): number[] {
        const rotationMatrix = new Matrix();
        inputs.node.rotationQuaternion.toRotationMatrix(rotationMatrix);
        return rotationMatrix.toArray() as number[];
    }

    /**
     * Gets children of the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/getChildren.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getchildren
     * @param inputs Node from which to get the children
     * @returns List of children nodes in the array
     */
    getChildren(inputs: Inputs.Node.NodeDto): BabylonNode[] {
        return inputs.node.getChildren();
    }

    /**
     * Gets parent of the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/getParent.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getparent
     * @param inputs Node from which to get a parent
     * @returns Parent node
     */
    getParent(inputs: Inputs.Node.NodeDto): BabylonNode {
        return inputs.node.parent;
    }

    /**
     * Gets the position of the node expressed in local space
     * <div>
     *  <img src="../assets/images/blockly-images/node/getPositionExpressedInLocalSpace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getpositionexpressedinlocalspace
     * @param inputs Node from which to get the position in local space
     * @returns Position vector
     */
    getPositionExpressedInLocalSpace(inputs: Inputs.Node.NodeDto): number[] {
        const position = inputs.node.getPositionExpressedInLocalSpace();
        return [position.x, position.y, position.z];
    }

    /**
     * Gets the root node
     * <div>
     *  <img src="../assets/images/blockly-images/node/getRootNode.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getrootnode
     * @returns Root node
     */
    getRootNode(): TransformNode {
        return this.context.scene.getTransformNodeByID('root');
    }

    /**
     * Gets the euler rotations
     * <div>
     *  <img src="../assets/images/blockly-images/node/getRotation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getrotation
     * @param inputs Node from which to get rotation
     * @returns Euler rotations of x, y and z angles in the number array
     */
    getRotation(inputs: Inputs.Node.NodeDto): number[] {
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
     *  <img src="../assets/images/blockly-images/node/rotateAroundAxisWithPosition.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#rotatearoundaxiswithposition
     * @param inputs Rotation around axis information
     */
    rotateAroundAxisWithPosition(inputs: Inputs.Node.RotateAroundAxisNodeDto): void {
        inputs.node.rotateAround(
            new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
            new Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Rotates the node around the origin and given axis
     * <div>
     *  <img src="../assets/images/blockly-images/node/rotate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#rotate
     * @param inputs Rotation information
     */
    rotate(inputs: Inputs.Node.RotateNodeDto): void {
        inputs.node.rotate(
            new Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
            Angle.FromDegrees(inputs.angle).radians()
        );
    }

    /**
     * Sets the absolute position of the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/setAbsolutePosition.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#setabsoluteposition
     * @param inputs Node absolute position information
     */
    setAbsolutePosition(inputs: Inputs.Node.NodePositionDto): void {
        inputs.node.setAbsolutePosition(
            new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
        );
    }

    /**
     * Sets the direction of the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/setDirection.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#setdirection
     * @param inputs Direction information
     */
    setDirection(inputs: Inputs.Node.NodeDirectionDto): void {
        inputs.node.setDirection(
            new Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
        );
    }

    /**
     * Sets the new parent to the node
     * <div>
     *  <img src="../assets/images/blockly-images/node/setParent.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#setparent
     * @param inputs Node parent information
     */
    setParent(inputs: Inputs.Node.NodeParentDto): void {
        inputs.node.setParent(
            inputs.parentNode
        );
    }

    /**
     * Translates the node by a given direction vector and a distance
     * <div>
     *  <img src="../assets/images/blockly-images/node/translate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#translate
     * @param inputs Node translation information
     */
    translate(inputs: Inputs.Node.NodeTranslationDto): void {
        inputs.node.translate(
            new Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
            inputs.distance,
        );
    }
}
