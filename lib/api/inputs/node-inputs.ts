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

    export class NodeTranslationDto extends NodeDto {
        /**
         * Direction vector expressed in [x, y, z] vector array
         */
        direction: Base.Vector3;
        /**
         * Distance to translate
         */
        distance: number;
    }

    export class NodeParentDto extends NodeDto {
        /**
         * Parent node
         */
        parentNode: TransformNode;
    }

    export class NodeDirectionDto extends NodeDto {
        /**
         * Direction vector expressed in [x, y, z] vector array
         */
        direction: number[];
    }

    export class NodePositionDto extends NodeDto {
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: Base.Point3;
    }

    export class RotateNodeDto extends NodeDto {
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * The rotation angle expressed in degrees
         */
        angle = 0;
    }

    export class RotateAroundAxisNodeDto extends NodeDto {
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

    export class DrawNodeDto extends NodeDto {
        /**
         * Provide options without default values
         */
        constructor(node?: TransformNode) {
            super();
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
