import { Injectable } from '@angular/core';
import { Mesh } from '@babylonjs/core';
import { BitByBitBlocklyHelperService } from '../../bit-by-bit-blockly-helper.service';
import { Context } from '../context';

/**
 * Nodes help understand the space and construct more complicated space structures. Nodes can be nested together
 * into child parent relationships to simplify the creation of 3D objects.
 */
@Injectable()
export class Node {

    constructor(private readonly context: Context) { }
    /**
     * Draws a node of given size with given colours for every axis
     * @param inputs Contains node data that includes size and colour information
     */
    drawNode(inputs: DrawNodeDto): void {
        const cotAxis = BitByBitBlocklyHelperService.localAxes(inputs.size, this.context.scene, inputs.colorX, inputs.colorY, inputs.colorZ);
        cotAxis.parent = inputs.node;
    }
}

interface DrawNodeDto {
    /**
     * Parent node that will be used to position a mesh. Get root node if you want to use world as a basic parent.
     */
    node: Mesh;
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