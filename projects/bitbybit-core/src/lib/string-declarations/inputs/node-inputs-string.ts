import { simplifyDeclaration } from '../simplify-declaration';

export const nodeInputsString = simplifyDeclaration(`
import { TransformNode } from '@babylonjs/core';
export namespace Node {
    class NodeDto {
        /**
         * Transformation node
         */
        node: TransformNode;
    }
    class NodeTranslationDto extends NodeDto {
        /**
         * Direction vector expressed in [x, y, z] vector array
         */
        direction: number[];
        /**
         * Distance to translate
         */
        distance: number;
    }
    class NodeParentDto extends NodeDto {
        /**
         * Parent node
         */
        parentNode: TransformNode;
    }
    class NodeDirectionDto extends NodeDto {
        /**
         * Direction vector expressed in [x, y, z] vector array
         */
        direction: number[];
    }
    class NodePositionDto extends NodeDto {
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: number[];
    }
    class RotateNodeDto extends NodeDto {
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: number[];
        /**
         * The rotation angle expressed in degrees
         */
        angle: number;
    }
    class RotateAroundAxisNodeDto extends NodeDto {
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: number[];
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: number[];
        /**
         * The rotation angle expressed in degrees
         */
        angle: number;
    }
    class CreateNodeFromRotationDto {
        /**
         * Optional parent node
         */
        parent: TransformNode | null;
        /**
         * Oirigin of the node
         */
        origin: number[];
        /**
         * Rotations of the node around x y z axis
         */
        rotation: number[];
    }
    class DrawNodeDto extends NodeDto {
        /**
         * Hex encoded color string for X axis
         */
        colorX: string;
        /**
         * Hex encoded color string for Y axis
         */
        colorY: '#00ff00';
        /**
         * Hex encoded color string for Z axis
         */
        colorZ: '#0000ff';
        /**
         * Length of the node axis
         */
        size: 2;
    }
    class DrawNodesDto {
        /**
         * Nodes that will be drawn
         */
        nodes: TransformNode[];
        /**
         * Hex encoded color string for X axis
         */
        colorX: string;
        /**
         * Hex encoded color string for Y axis
         */
        colorY: string;
        /**
         * Hex encoded color string for Z axis
         */
        colorZ: string;
        /**
         * Length of the node axis
         */
        size: number;
    }
}

`);
