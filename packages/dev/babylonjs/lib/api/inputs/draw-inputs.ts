/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "./inputs";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace Draw {

    export type DrawOptions = DrawBasicGeometryOptions | DrawManifoldOptions | DrawOcctShapeOptions | DrawOcctShapeSimpleOptions | DrawOcctShapeMaterialOptions | DrawNodeOptions;
    export type Entity = Base.Point3 | Base.Vector3 | Base.Line3 | Base.Polyline3 | Base.VerbCurve | Base.VerbSurface | Inputs.OCCT.TopoDSShapePointer | Inputs.Tag.TagDto | { type: string, name: string } |
    Base.Point3[] | Base.Vector3[] | Base.Line3[] | Base.Polyline3[] | Base.VerbCurve[] | Base.VerbSurface[] | Inputs.OCCT.TopoDSShapePointer[] | Inputs.Tag.TagDto[] | { type: string[], name: string };

    export class DrawAny {
        constructor(entity?: Entity, options?: DrawOptions, babylonMesh?: BABYLON.Mesh | BABYLON.LinesMesh) {
            if (entity !== undefined) { this.entity = entity; }
            if (options !== undefined) { this.options = options; }
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * Entity to be drawn - can be a single or multiple points, lines, polylines, verb curves, verb surfaces, jscad meshes, jscad polygons, jscad paths, occt shapes, tags, nodes
         * @default undefined
         */
        entity: Entity;
        /**
         * Options that help you control how your drawn objects look like. This property is optional. In order to pick the right option you need to know which entity you are going to draw. For example if you draw points, lines, polylines or jscad meshes you can use basic geometry options, but if you want to draw OCCT shapes, use OCCT options.
         * @default undefined
         * @optional true
         */
        options?: DrawOptions;
        /**
         * Entity to be used when updating already drawn mesh in the render loop
         * @default undefined
         * @optional true
         */
        babylonMesh?: BABYLON.Mesh | BABYLON.LinesMesh;
    }

    export class SceneDrawGridMeshDto {
        constructor(width?: number, height?: number, subdivisions?: number, majorUnitFrequency?: number, minorUnitVisibility?: number, gridRatio?: number, opacity?: number, backFaceCulling?: boolean, mainColor?: Base.Color, secondaryColor?: Base.Color) {
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (subdivisions !== undefined) { this.subdivisions = subdivisions; }
            if (majorUnitFrequency !== undefined) { this.majorUnitFrequency = majorUnitFrequency; }
            if (minorUnitVisibility !== undefined) { this.minorUnitVisibility = minorUnitVisibility; }
            if (gridRatio !== undefined) { this.gridRatio = gridRatio; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (backFaceCulling !== undefined) { this.backFaceCulling = backFaceCulling; }
            if (mainColor !== undefined) { this.mainColor = mainColor; }
            if (secondaryColor !== undefined) { this.secondaryColor = secondaryColor; }
        }
        /**
         * Width of the grid
         * @default 400
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        width = 400;
        /**
         * Height of the ground
         * @default 400
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        height = 400;
        /**
         * Ground subdivisions
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions = 10;
        /**
         * The frequency of thicker lines.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        majorUnitFrequency = 10;
        /**
         * The visibility of minor units in the grid.
         * @default 0.45
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        minorUnitVisibility = 0.45;
        /**
         * The scale of the grid compared to unit.
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        gridRatio = 0.5;
        /**
         * The grid opacity outside of the lines.
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 0.5;
        /**
         * Cull the back faces
         * @default false
         */
        backFaceCulling = false;
        /**
         * Main color of the grid (e.g. between lines)
         * @default #ffffff
         */
        mainColor: Base.Color = "#ffffff";
        /**
         * Color of the grid lines.
         * @default #ffffff
         */
        secondaryColor: Base.Color = "#ffffff";
    }

    /**
     * Draw options for basic geometry types like points, lines, polylines, surfaces and jscad meshes
     */
    export class DrawBasicGeometryOptions {
        constructor(colours?: string | string[], size?: number, opacity?: number, updatable?: boolean, hidden?: boolean) {
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (hidden !== undefined) { this.hidden = hidden; }
        }
        /**
         * Basic geometry colours to use for lines, points, polylines, surfaces, jscad meshes.
         * @default #ff0000
         */
        colours: string | string[] = "#ff0000";
        /**
         * Size affect how big the drawn points are and how wide lines are.
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 0.1;
        /**
         * Opacity of the point 0 to 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * If geometry needs to be updated later
         * @default false
         */
        updatable = false;
        /**
         * Hidden
         * @default false
         */
        hidden = false;
    }

    /**
     * Draw options for Nodes
     */
    export class DrawNodeOptions {
        constructor(colourX?: Base.Color, colourY?: Base.Color, colourZ?: Base.Color, size?: number) {
            if (colourX !== undefined) { this.colorX = colourX; }
            if (colourY !== undefined) { this.colorY = colourY; }
            if (colourZ !== undefined) { this.colorZ = colourZ; }
            if (size !== undefined) { this.size = size; }
        }
        /**
         * X Axis colour
         * @default #ff0000
         */
        colorX: Base.Color = "#0000ff";
        /**
         * Y Axis colour
         * @default #00ff00
         */
        colorY: Base.Color = "#00ff00";
        /**
         * Z Axis colour
         * @default #0000ff
         */
        colorZ: Base.Color = "#ff0000";
        /**
         * Length of the node axis
         * @default 2
         * @minimum 0
         * @maximum Infinity
         */
        size = 2;
    }
    export class DrawManifoldOptions {
        /**
         * Provide options without default values
         */
        constructor(faceOpacity?: number, faceMaterial?: Base.Material, faceColour?: Base.Color) {
            if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
            if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
            if (faceColour !== undefined) { this.faceColour = faceColour; }
        }
        /**
         * Face opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        faceOpacity = 1;
        /**
         * Hex colour string for face colour
         * @default #ff0000
         */
        faceColour: Base.Color = "#ff0000";
        /**
         * Face material
         * @default undefined
         * @optional true
         */
        faceMaterial?: Base.Material;
    }
    /**
     * Draw options for OCCT shapes
     */
    export class DrawOcctShapeOptions {
        /**
         * Provide options without default values
         */
        constructor(faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color) {
            if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
            if (edgeOpacity !== undefined) { this.edgeOpacity = edgeOpacity; }
            if (edgeColour !== undefined) { this.edgeColour = edgeColour; }
            if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
            if (faceColour !== undefined) { this.faceColour = faceColour; }
            if (vertexColour !== undefined) { this.vertexColour = vertexColour; }
            if (vertexSize !== undefined) { this.vertexSize = vertexSize; }
            if (edgeWidth !== undefined) { this.edgeWidth = edgeWidth; }
            if (drawEdges !== undefined) { this.drawEdges = drawEdges; }
            if (drawFaces !== undefined) { this.drawFaces = drawFaces; }
            if (drawVertices !== undefined) { this.drawVertices = drawVertices; }
            if (precision !== undefined) { this.precision = precision; }
            if (drawEdgeIndexes !== undefined) { this.drawEdgeIndexes = drawEdgeIndexes; }
            if (edgeIndexHeight !== undefined) { this.edgeIndexHeight = edgeIndexHeight; }
            if (edgeIndexColour !== undefined) { this.edgeIndexColour = edgeIndexColour; }
            if (drawFaceIndexes !== undefined) { this.drawFaceIndexes = drawFaceIndexes; }
            if (faceIndexHeight !== undefined) { this.faceIndexHeight = faceIndexHeight; }
            if (faceIndexColour !== undefined) { this.faceIndexColour = faceIndexColour; }
        }
        /**
         * Face opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        faceOpacity = 1;
        /**
         * Edge opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        edgeOpacity = 1;
        /**
         * Hex colour string for the edges
         * @default #ffffff
         */
        edgeColour: Base.Color = "#ffffff";
        /**
         * Hex colour string for face colour
         * @default #ff0000
         */
        faceColour: Base.Color = "#ff0000";
        /**
         * Color of the vertices that will be drawn
         * @default #ff00ff
         */
        vertexColour: Base.Color = "#ffaaff";
        /**
         * Face material
         * @default undefined
         * @optional true
         */
        faceMaterial?: Base.Material;
        /**
         * Edge width
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        edgeWidth = 2;
        /**
         * The size of a vertices that will be drawn
         * @default 0.03
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        vertexSize = 0.03;
        /**
         * You can turn off drawing of edges via this property
         * @default true
         */
        drawEdges = true;
        /**
         * You can turn off drawing of faces via this property
         * @default true
         */
        drawFaces = true;
        /**
         * You can turn off drawing of vertexes via this property
         * @default false
         */
        drawVertices = false;
        /**
         * Precision of the mesh that will be generated for the shape, lower number will mean more triangles
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        precision = 0.01;
        /**
         * Draw index of edges in space
         * @default false
         */
        drawEdgeIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        edgeIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         * @default #ff00ff
         */
        edgeIndexColour: Base.Color = "#ff00ff";
        /**
         * Draw indexes of faces in space
         * @default false
         */
        drawFaceIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        faceIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         * @default #0000ff
         */
        faceIndexColour: Base.Color = "#0000ff";
    }
    export class DrawOcctShapeSimpleOptions {
        constructor(precision?: number, drawFaces?: boolean, faceColour?: Base.Color, drawEdges?: boolean, edgeColour?: Base.Color, edgeWidth?: number) {
            if (precision !== undefined) { this.precision = precision; }
            if (drawFaces !== undefined) { this.drawFaces = drawFaces; }
            if (faceColour !== undefined) { this.faceColour = faceColour; }
            if (drawEdges !== undefined) { this.drawEdges = drawEdges; }
            if (edgeColour !== undefined) { this.edgeColour = edgeColour; }
            if (edgeWidth !== undefined) { this.edgeWidth = edgeWidth; }
        }
        /**
         * Precision
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         */
        precision = 0.01;
        /**
         * You can turn off drawing of faces via this property
         * @default true
         */
        drawFaces = true;
        /**
         * Hex colour string for face colour
         * @default #ff0000
         */
        faceColour?: Base.Color = "#ff0000";
        /**
        * You can turn off drawing of edges via this property
        * @default true
        */
        drawEdges = true;
        /**
         * Hex colour string for the edges
         * @default #ffffff
         */
        edgeColour: Base.Color = "#ffffff";
        /**
         * Edge width
         * @default 2
         * @minimum 0
         * @maximum Infinity
         */
        edgeWidth = 2;
    }

    export class DrawOcctShapeMaterialOptions {
        constructor(precision?: number, faceMaterial?: any, drawEdges?: boolean, edgeColour?: Base.Color, edgeWidth?: number) {
            if (precision !== undefined) { this.precision = precision; }
            if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
            if (drawEdges !== undefined) { this.drawEdges = drawEdges; }
            if (edgeColour !== undefined) { this.edgeColour = edgeColour; }
            if (edgeWidth !== undefined) { this.edgeWidth = edgeWidth; }
        }
        /**
        * Precision
        * @default 0.01
        * @minimum 0
        * @maximum Infinity
        */
        precision = 0.01;
        /**
         * Face material
         * @default undefined
         */
        faceMaterial;

        /**
        * You can turn off drawing of edges via this property
        * @default true
        */
        drawEdges = true;
        /**
         * Hex colour string for the edges
         * @default #ffffff
         */
        edgeColour: Base.Color = "#ffffff";
        /**
         * Edge width
         * @default 2
         * @minimum 0
         * @maximum Infinity
         */
        edgeWidth = 2;
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
        manifold,
        tag,
        tags,
    }
}
