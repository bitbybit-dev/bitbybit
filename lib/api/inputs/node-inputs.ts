import { TransformNode } from "@babylonjs/core";
import { Base } from "./base-inputs";
/* eslint-disable @typescript-eslint/no-namespace */
export namespace BabylonNode {

    export class NodeDto {
        /**
         * Transformation node
         */
        node: TransformNode;
    }

    export class NodeTranslationDto {
        /**
        * Transformation node
        */
        node: TransformNode;
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
        /**
        * Transformation node
        */
        node: TransformNode;
        /**
         * Parent node
         */
        parentNode: TransformNode;
    }

    export class NodeDirectionDto {
        /**
        * Transformation node
        */
        node: TransformNode;
        /**
         * Direction vector expressed in [x, y, z] vector array
         */
        direction: number[];
    }

    export class NodePositionDto {
        /**
        * Transformation node
        */
        node: TransformNode;
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: Base.Point3;
    }

    export class RotateNodeDto {
        /**
       * Transformation node
       */
        node: TransformNode;
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
        /**
        * Transformation node
        */
        node: TransformNode;
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
        /**
         * Optional parent node
         */
        parent: TransformNode | null;
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
        /**
        * Transformation node
        */
        node: TransformNode;
        /**
         * Provide options without default values
         */
        constructor(node?: TransformNode) {
            this.node = node;
        }
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
        /**
         * Provide options without default values
         */
        constructor(nodes?: TransformNode[]) {
            this.nodes = nodes;
        }
        /**
         * Nodes that will be drawn
         */
        nodes: TransformNode[];
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
