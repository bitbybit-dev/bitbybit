import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";
/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Parameters for transform nodes: the invisible parents used to group and move several objects
 * together, and the queries that walk a node hierarchy.
 */
export namespace BabylonNode {

    /**
     * Feeds the `babylon.node` getters with the one transform node to read from.
     */
    export class NodeDto {
        constructor(node?: BABYLON.TransformNode) {
            if (node !== undefined) { this.node = node; }
        }
        /**
         * The transform node to read from
         */
        node!: BABYLON.TransformNode;
    }

    /**
     * Feeds `babylon.node.translate` with a node, the direction in its own axes and how far to move
     * it.
     */
    export class NodeTranslationDto {
        constructor(node?: BABYLON.TransformNode, direction?: Base.Vector3, distance?: number) {
            if (node !== undefined) { this.node = node; }
            if (direction !== undefined) { this.direction = direction; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * The transform node to move; its children follow
         */
        node!: BABYLON.TransformNode;
        /**
         * The direction to move in, in the node's own local axes
         */
        direction!: Base.Vector3;
        /**
         * How far to move along the direction, in scene units
         */
        distance!: number;
    }

    /**
     * Feeds `babylon.node.setParent` with a node and the node to parent it to.
     */
    export class NodeParentDto {
        constructor(node?: BABYLON.TransformNode, parentNode?: BABYLON.TransformNode) {
            if (node !== undefined) { this.node = node; }
            if (parentNode !== undefined) { this.parentNode = parentNode; }
        }
        /**
         * The transform node to reparent; it keeps its place in the world
         */
        node!: BABYLON.TransformNode;
        /**
         * The node it moves with from then on
         */
        parentNode!: BABYLON.TransformNode;
    }

    /**
     * Feeds `babylon.node.setDirection` with a node and the direction its local Z axis should point
     * along.
     */
    export class NodeDirectionDto {
        constructor(node?: BABYLON.TransformNode, direction?: Base.Vector3) {
            if (node !== undefined) { this.node = node; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * The transform node to turn; its children follow
         */
        node!: BABYLON.TransformNode;
        /**
         * The direction the node's local Z axis is turned to, as `[x, y, z]`
         */
        direction!: number[];
    }

    /**
     * Feeds `babylon.node.setAbsolutePosition` with a node and the world point to move it to.
     */
    export class NodePositionDto {
        constructor(node?: BABYLON.TransformNode, position?: Base.Point3) {
            if (node !== undefined) { this.node = node; }
            if (position !== undefined) { this.position = position; }
        }
        /**
         * The transform node to move; its children follow
         */
        node!: BABYLON.TransformNode;
        /**
         * The point in world space to move the node to, whatever its parents
         */
        position!: Base.Point3;
    }

    /**
     * Feeds `babylon.node.rotate` with a node, an axis through its origin and the angle to turn by.
     */
    export class RotateNodeDto {
        constructor(node?: BABYLON.TransformNode, axis?: Base.Vector3, angle?: number) {
            if (node !== undefined) { this.node = node; }
            if (axis !== undefined) { this.axis = axis; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * The transform node to turn; its children follow
         */
        node!: BABYLON.TransformNode;
        /**
         * The axis direction through the node's origin, as `[x, y, z]`
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * How far to turn, in degrees, added to the current rotation
         */
        angle = 0;
    }

    /**
     * Feeds `babylon.node.rotateAroundAxisWithPosition`: the node, a point and an axis through it,
     * and the angle to orbit by.
     */
    export class RotateAroundAxisNodeDto {
        constructor(node?: BABYLON.TransformNode, position?: Base.Point3, axis?: Base.Vector3, angle?: number) {
            if (node !== undefined) { this.node = node; }
            if (position !== undefined) { this.position = position; }
            if (axis !== undefined) { this.axis = axis; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * The transform node to turn around the axis; its children follow
         */
        node!: BABYLON.TransformNode;
        /**
         * A point the axis passes through
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * The direction of the axis, as `[x, y, z]`; not a zero vector
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * How far to turn, in degrees; positive follows the right-hand rule around the axis
         */
        angle = 0;
    }

    /**
     * Feeds `babylon.node.createNodeFromRotation`: the optional parent, where the node sits and how
     * it is turned.
     */
    export class CreateNodeFromRotationDto {
        constructor(parent?: BABYLON.TransformNode, origin?: Base.Point3, rotation?: Base.Vector3) {
            if (parent !== undefined) { this.parent = parent; }
            if (origin !== undefined) { this.origin = origin; }
            if (rotation !== undefined) { this.rotation = rotation; }
        }
        /**
         * The node to parent the new one to, or null for a top-level node
         */
        parent!: BABYLON.TransformNode | null;
        /**
         * Where the node sits, relative to its parent
         */
        origin: Base.Point3 = [0, 0, 0];
        /**
         * The angles around X, Y and Z in degrees the node is turned by
         */
        rotation: Base.Vector3 = [0, 0, 0];
    }

    /**
     * Feeds `babylon.node.drawNode` with the node to draw axes for, the color of each axis and
     * their length.
     */
    export class DrawNodeDto {
        constructor(node?: BABYLON.TransformNode, colorX?: string, colorY?: string, colorZ?: string, size?: number) {
            if (node !== undefined) { this.node = node; }
            if (colorX !== undefined) { this.colorX = colorX; }
            if (colorY !== undefined) { this.colorY = colorY; }
            if (colorZ !== undefined) { this.colorZ = colorZ; }
            if (size !== undefined) { this.size = size; }
        }
        /**
         * The transform node the axis lines are parented to
         */
        node!: BABYLON.TransformNode;
        /**
         * Hex color of the line along the node's X axis
         */
        colorX = "#ff0000";
        /**
         * Hex color of the line along the node's Y axis
         */
        colorY = "#00ff00";
        /**
         * Hex color of the line along the node's Z axis
         */
        colorZ = "#0000ff";
        /**
         * Length of each axis line, in scene units
         */
        size = 2;
    }

    /**
     * Feeds `babylon.node.drawNodes` with the nodes to draw axes for, the color of each axis and
     * their length.
     */
    export class DrawNodesDto {
        constructor(nodes?: BABYLON.TransformNode[], colorX?: string, colorY?: string, colorZ?: string, size?: number) {
            if (nodes !== undefined) { this.nodes = nodes; }
            if (colorX !== undefined) { this.colorX = colorX; }
            if (colorY !== undefined) { this.colorY = colorY; }
            if (colorZ !== undefined) { this.colorZ = colorZ; }
            if (size !== undefined) { this.size = size; }
        }
        /**
         * The transform nodes, each getting its own set of axis lines
         */
        nodes!: BABYLON.TransformNode[];
        /**
         * Hex color of the lines along the X axes
         */
        colorX = "#ff0000";
        /**
         * Hex color of the lines along the Y axes
         */
        colorY = "#00ff00";
        /**
         * Hex color of the lines along the Z axes
         */
        colorZ = "#0000ff";
        /**
         * Length of each axis line, in scene units
         */
        size = 2;
    }

}
