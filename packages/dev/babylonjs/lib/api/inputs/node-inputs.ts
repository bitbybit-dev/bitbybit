import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";
/* eslint-disable @typescript-eslint/no-namespace */
export namespace BabylonNode {

    export class NodeDto {
        constructor(node?: BABYLON.TransformNode) {
            if (node !== undefined) { this.node = node; }
        }
        /**
         * Transformation node
         */
        node: BABYLON.TransformNode;
    }

    export class NodeTranslationDto {
        constructor(node?: BABYLON.TransformNode, direction?: Base.Vector3, distance?: number) {
            if (node !== undefined) { this.node = node; }
            if (direction !== undefined) { this.direction = direction; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
        * Transformation node
        */
        node: BABYLON.TransformNode;
        /**
         * Direction vector expressed in [x, y, z] vector array
         */
        direction: Base.Vector3;
        /**
         * Distance to translate
         */
        distance: number;
    }

    export class NodeParentDto {
        constructor(node?: BABYLON.TransformNode, parentNode?: BABYLON.TransformNode) {
            if (node !== undefined) { this.node = node; }
            if (parentNode !== undefined) { this.parentNode = parentNode; }
        }
        /**
        * Transformation node
        */
        node: BABYLON.TransformNode;
        /**
         * Parent node
         */
        parentNode: BABYLON.TransformNode;
    }

    export class NodeDirectionDto {
        constructor(node?: BABYLON.TransformNode, direction?: Base.Vector3) {
            if (node !== undefined) { this.node = node; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
        * Transformation node
        */
        node: BABYLON.TransformNode;
        /**
         * Direction vector expressed in [x, y, z] vector array
         */
        direction: number[];
    }

    export class NodePositionDto {
        constructor(node?: BABYLON.TransformNode, position?: Base.Point3) {
            if (node !== undefined) { this.node = node; }
            if (position !== undefined) { this.position = position; }
        }
        /**
        * Transformation node
        */
        node: BABYLON.TransformNode;
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: Base.Point3;
    }

    export class RotateNodeDto {
        constructor(node?: BABYLON.TransformNode, axis?: Base.Vector3, angle?: number) {
            if (node !== undefined) { this.node = node; }
            if (axis !== undefined) { this.axis = axis; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
       * Transformation node
       */
        node: BABYLON.TransformNode;
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * The rotation angle expressed in degrees
         */
        angle = 0;
    }

    export class RotateAroundAxisNodeDto {
        constructor(node?: BABYLON.TransformNode, position?: Base.Point3, axis?: Base.Vector3, angle?: number) {
            if (node !== undefined) { this.node = node; }
            if (position !== undefined) { this.position = position; }
            if (axis !== undefined) { this.axis = axis; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
        * Transformation node
        */
        node: BABYLON.TransformNode;
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * The rotation angle expressed in degrees
         */
        angle = 0;
    }

    export class CreateNodeFromRotationDto {
        constructor(parent?: BABYLON.TransformNode, origin?: Base.Point3, rotation?: Base.Vector3) {
            if (parent !== undefined) { this.parent = parent; }
            if (origin !== undefined) { this.origin = origin; }
            if (rotation !== undefined) { this.rotation = rotation; }
        }
        /**
         * Optional parent node
         */
        parent: BABYLON.TransformNode | null;
        /**
         * Oirigin of the node
         */
        origin: Base.Point3 = [0, 0, 0];
        /**
         * Rotations of the node around x y z axis
         */
        rotation: Base.Vector3 = [0, 0, 0];
    }

    export class DrawNodeDto {
        constructor(node?: BABYLON.TransformNode, colorX?: string, colorY?: string, colorZ?: string, size?: number) {
            if (node !== undefined) { this.node = node; }
            if (colorX !== undefined) { this.colorX = colorX; }
            if (colorY !== undefined) { this.colorY = colorY; }
            if (colorZ !== undefined) { this.colorZ = colorZ; }
            if (size !== undefined) { this.size = size; }
        }
        /**
        * Transformation node
        */
        node: BABYLON.TransformNode;
        /**
         * Hex encoded color string for X axis
         */
        colorX = "#ff0000";
        /**
         * Hex encoded color string for Y axis
         */
        colorY = "#00ff00";
        /**
         * Hex encoded color string for Z axis
         */
        colorZ = "#0000ff";
        /**
         * Length of the node axis
         */
        size = 2;
    }

    export class DrawNodesDto {
        constructor(nodes?: BABYLON.TransformNode[], colorX?: string, colorY?: string, colorZ?: string, size?: number) {
            if (nodes !== undefined) { this.nodes = nodes; }
            if (colorX !== undefined) { this.colorX = colorX; }
            if (colorY !== undefined) { this.colorY = colorY; }
            if (colorZ !== undefined) { this.colorZ = colorZ; }
            if (size !== undefined) { this.size = size; }
        }
        /**
         * Nodes that will be drawn
         */
        nodes: BABYLON.TransformNode[];
        /**
         * Hex encoded color string for X axis
         */
        colorX = "#ff0000";
        /**
         * Hex encoded color string for Y axis
         */
        colorY = "#00ff00";
        /**
         * Hex encoded color string for Z axis
         */
        colorZ = "#0000ff";
        /**
         * Length of the node axis
         */
        size = 2;
    }

}
