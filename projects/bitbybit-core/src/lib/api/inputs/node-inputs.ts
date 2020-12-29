import { TransformNode } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace Node {

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
        direction: number[];
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
        position: number[];
    }

    export class RotateNodeDto extends NodeDto {
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis = [0, 1, 0];
        /**
         * The rotation angle expressed in degrees
         */
        angle = 0;
    }

    export class RotateAroundAxisNodeDto extends NodeDto {
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position = [0, 0, 0];
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis = [0, 1, 0];
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
        origin = [0, 0, 0];
        /**
         * Rotations of the node around x y z axis
         */
        rotation = [0, 0, 0];
    }

    export class DrawNodeDto extends NodeDto {
        /**
         * Hex encoded color string for X axis
         */
        colorX = '#ff0000';
        /**
         * Hex encoded color string for Y axis
         */
        colorY = '#00ff00';
        /**
         * Hex encoded color string for Z axis
         */
        colorZ = '#0000ff';
        /**
         * Length of the node axis
         */
        size = 2;
    }

    export class DrawNodesDto {
        /**
         * Nodes that will be drawn
         */
        nodes: TransformNode[];
        /**
         * Hex encoded color string for X axis
         */
        colorX = '#ff0000';
        /**
         * Hex encoded color string for Y axis
         */
        colorY = '#00ff00';
        /**
         * Hex encoded color string for Z axis
         */
        colorZ = '#0000ff';
        /**
         * Length of the node axis
         */
        size = 2;
    }

}
