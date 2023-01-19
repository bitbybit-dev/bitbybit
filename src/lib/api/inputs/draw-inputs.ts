import { AbstractMesh, InstancedMesh, Mesh } from '@babylonjs/core';
import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace Draw {

    export class DrawAny {
        /**
         * Entity to be drawn - can be a single or multiple points, lines, polylines, verb curves, verb surfaces, jscad meshes, jscad polygons, jscad paths, occt shapes, tags, nodes
         */
        entity: any;
        /**
         * Entity to be used when updating
         */
        babylonMesh?: any;
        /**
         * Options that help you control how your drawn objects look like. This property is optional. In order to pick the right option you need to know which entity you are going to draw. For example if you draw points, lines, polylines or jscad meshes you can use basic geometry options, but if you want to draw OCCT shapes, use OCCT options.
         */
        options: DrawBasicGeometryOptions | DrawOcctShapeOptions | DrawNodeOptions;
    }

    export class SceneDrawGridMeshDto {
        /**
         * Width of the grid
         */
        width = 400;
        /**
         * Height of the ground
         */
        height = 400;
        /**
         * Ground subdivisions
         */
        subdivisions = 10;
        /**
         * The frequency of thicker lines.
         */
        majorUnitFrequency = 10;
        /**
         * The visibility of minor units in the grid.
         */
        minorUnitVisibility = 0.45;
        /**
         * The scale of the grid compared to unit.
         */
        gridRatio = 0.5;
        /**
         * The grid opacity outside of the lines.
         */
        opacity = 0.5;
        /**
         * Cull the back faces
         */
        backFaceCulling = false;
        /**
         * Main color of the grid (e.g. between lines)
         */
        mainColor = '#000000';
        /**
         * Color of the grid lines.
         */
        secondaryColor = '#555555';
    }
   
    /**
     * Draw options for basic geometry types like points, lines, polylines, surfaces and jscad meshes
     * <div>
     *  <img src="../assets/images/blockly-images/draw/drawbasicgeometryoptions.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/inputs_draw_inputs.draw.drawbasicgeometryoptions.html
     */
    export class DrawBasicGeometryOptions {
        /**
         * Basic geometry colours to use for lines, points, polylines, surfaces, jscad meshes.
         */
        colours: string | string[] = '#ff0000';
        /**
         * Size affect how big the drawn points are and how wide lines are.
         */
        size: number = 3;
        /**
         * Opacity of the point 0 to 1
         */
        opacity: number = 1;
        /**
         * If geometry needs to be updated later
         */
        updatable: boolean = false;
        /**
         * Hidden
         */
        hidden: boolean = false;
    }

    /**
     * Draw options for Nodes
     * <div>
     *  <img src="../assets/images/blockly-images/draw/drawnodeoptions.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/inputs_draw_inputs.draw.drawnodeoptions.html
     */
    export class DrawNodeOptions {
        /**
         * X Axis colour
         */
        colorX = '#ff0000';
        /**
         * Y Axis colour
         */
        colorY = '#00ff00';
        /**
         * Z Axis colour
         */
        colorZ = '#ff0000';
        /**
         * Length of the node axis
         */
        size = 2
    }

    /**
     * Draw options for OCCT shapes
     * <div>
     *  <img src="../assets/images/blockly-images/draw/drawocctshapeoptions.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/inputs_draw_inputs.draw.drawocctshapeoptions.html
     */
    export class DrawOcctShapeOptions {
        /**
         * Face opacity value between 0 and 1
         */
        faceOpacity = 1;
        /**
         * Edge opacity value between 0 and 1
         */
        edgeOpacity = 1;
        /**
         * Hex colour string for the edges
         */
        edgeColour = '#ffffff';
        /**
         * Hex colour string for face colour
         */
        faceColour = '#ff0000';
        /**
         * Face material
         */
        faceMaterial?;
        /**
         * Edge width
         */
        edgeWidth = 2;
        /**
         * You can turn off drawing of edges via this property
         */
        drawEdges = true;
        /**
         * You can turn off drawing of faces via this property
         */
        drawFaces = true;
        /**
         * Precision
         */
        precision = 0.01;
        /**
         * Draw index of edges in space
         */
        drawEdgeIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         */
        edgeIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         */
        edgeIndexColour = '#ff00ff';
        /**
         * Draw indexes of faces in space
         */
        drawFaceIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         */
        faceIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         */
        faceIndexColour = '#0000ff';
    }

    export enum drawingTypes {
        point,
        points,
        line,
        lines,
        node,
        nodes,
        polyline,
        polylines,
        verbCurve,
        verbCurves,
        verbSurface,
        verbSurfaces,
        jscadMesh,
        jscadMeshes,
        occt,
        tag,
        tags,
    }
}
