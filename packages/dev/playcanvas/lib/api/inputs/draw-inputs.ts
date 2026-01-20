/* eslint-disable @typescript-eslint/no-namespace */

import * as Inputs from "./index";
import { Base } from "./base-inputs";
import * as pc from "playcanvas";

// tslint:disable-next-line: no-namespace
export namespace Draw {

    export type DrawOptions = DrawOcctShapeOptions | DrawBasicGeometryOptions | DrawManifoldOrCrossSectionOptions;
    export type Entity = number[] | [number, number, number] | Base.Point3 | Base.Vector3 | Base.Line3  | Base.Segment3 | Base.Polyline3 | Base.VerbCurve | Base.VerbSurface | Inputs.OCCT.TopoDSShapePointer | Inputs.Tag.TagDto | { type: string, name?: string, entityName?: string } |
       number[][] | Base.Point3[] | Base.Vector3[] | Base.Line3[] | Base.Segment3[] | Base.Polyline3[] | Base.VerbCurve[] | Base.VerbSurface[] | Inputs.OCCT.TopoDSShapePointer[] | Inputs.Tag.TagDto[] | { type: string[], name?: string, entityName?: string };
       
    /**
     * Metadata stored on drawn entities to track their type and options for updates
     */
    export interface BitByBitMeta {
        type: drawingTypes;
        options: DrawOptions;
    }

    /**
     * Extended pc.Entity with BitByBit metadata for type-safe access to drawing metadata
     */
    export interface BitByBitEntity extends pc.Entity {
        bitbybitMeta?: BitByBitMeta;
    }

    /**
     * User data stored on polyline entities to track line lengths for update optimization
     */
    export interface PolylineUserData {
        linesForRenderLengths: string;
    }

    /**
     * Extended pc.Entity with user data for polyline tracking
     */
    export interface PolylineEntity extends pc.Entity {
        bitbybitMeta?: PolylineUserData;
    }

    export class DrawAny<U> {
        constructor(entity?: Entity, options?: DrawOptions) {
            if (entity !== undefined) { this.entity = entity; }
            if (options !== undefined) { this.options = options; }
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
         * Group to indicate if geometry should be updated
         */
        group?: U;
    }
    export class DrawManifoldOrCrossSectionOptions {
        /**
         * Provide options without default values
         */
        constructor(faceOpacity?: number, faceMaterial?: Base.Material, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number) {
            if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
            if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
            if (faceColour !== undefined) { this.faceColour = faceColour; }
            if (crossSectionColour !== undefined) { this.crossSectionColour = crossSectionColour; }
            if (crossSectionWidth !== undefined) { this.crossSectionWidth = crossSectionWidth; }
            if (crossSectionOpacity !== undefined) { this.crossSectionOpacity = crossSectionOpacity; }
            if (computeNormals !== undefined) { this.computeNormals = computeNormals; }
            if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
            if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
            if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
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
        /**
         * Hex colour string for cross section drawing
         * @default #ff00ff
         */
        crossSectionColour: Base.Color = "#ff00ff";
        /**
         * Width of cross section lines
         * @default 2
         */
        crossSectionWidth = 2;
        /**
         * Cross section opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        crossSectionOpacity: number;
        /**
         * Compute normals for the shape
         * @default false
         */
        computeNormals = false;
        /**
         * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
         * @default true
         */
        drawTwoSided = true;
        /**
         * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
         * @default #0000ff
         */
        backFaceColour: Base.Color = "#0000ff";
        /**
         * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        backFaceOpacity = 1;
    }
    export class DrawOcctShapeOptions {
        /**
         * Provide options without default values
         */
        constructor(faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, edgeArrowSize?: number, edgeArrowAngle?: number) {
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
            if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
            if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
            if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
            if (edgeArrowSize !== undefined) { this.edgeArrowSize = edgeArrowSize; }
            if (edgeArrowAngle !== undefined) { this.edgeArrowAngle = edgeArrowAngle; }
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
        /**
         * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
         * @default true
         */
        drawTwoSided = true;
        /**
         * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
         * @default #0000ff
         */
        backFaceColour: Base.Color = "#0000ff";
        /**
         * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        backFaceOpacity = 1;
        /**
         * Size of arrow heads at the end of edges to indicate edge/wire orientation. Set to 0 to disable arrows.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        edgeArrowSize = 0;
        /**
         * Angle of the arrow head in degrees. Controls how wide the arrow head spreads.
         * @default 15
         * @minimum 0
         * @maximum 90
         * @step 1
         */
        edgeArrowAngle = 15;
    }

    /**
     * Draw options for basic geometry types like points, lines, polylines, surfaces and jscad meshes
     */
    export class DrawBasicGeometryOptions {
        constructor(colours?: string | string[], size?: number, opacity?: number, updatable?: boolean, hidden?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, colorMapStrategy?: Base.colorMapStrategyEnum, arrowSize?: number, arrowAngle?: number) {
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (hidden !== undefined) { this.hidden = hidden; }
            if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
            if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
            if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
            if (colorMapStrategy !== undefined) { this.colorMapStrategy = colorMapStrategy; }
            if (arrowSize !== undefined) { this.arrowSize = arrowSize; }
            if (arrowAngle !== undefined) { this.arrowAngle = arrowAngle; }
        }
        /**
         * Basic geometry colours to use for lines, points, polylines, surfaces, jscad meshes.
         * @default #ff0000
         */
        colours: string | string[] = "#ff0000";
        /**
         * Strategy for mapping colors to entities when there are more entities than colors.
         * - firstColorForAll: Uses the first color for all entities (legacy behavior)
         * - lastColorRemainder: Maps colors 1:1, then uses last color for remaining entities
         * - repeatColors: Cycles through colors in a repeating pattern
         * - reversedColors: After exhausting colors, reverses direction (ping-pong pattern)
         * @default lastColorRemainder
         */
        colorMapStrategy: Base.colorMapStrategyEnum = Base.colorMapStrategyEnum.lastColorRemainder;
        /**
         * Size affect how big the drawn points are and how wide lines are.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
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
        /**
         * Draw two-sided faces with different colors for front and back. This helps visualize face orientation. Only applies to surfaces.
         * @default true
         */
        drawTwoSided = true;
        /**
         * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true and drawing surfaces.
         * @default #0000ff
         */
        backFaceColour: Base.Color = "#0000ff";
        /**
         * Back face opacity value between 0 and 1. Only used when drawTwoSided is true and drawing surfaces.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        backFaceOpacity = 1;
        /**
         * Size of the arrow head at the end of lines and polylines. Set to 0 to disable arrows.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        arrowSize = 0;
        /**
         * Angle of the arrow head in degrees. Controls how wide the arrow head spreads.
         * @default 15
         * @minimum 0
         * @maximum 90
         * @step 1
         */
        arrowAngle = 15;
    }

    /**
     * Texture filtering mode - how the texture is sampled when scaled
     */
    export enum samplingModeEnum {
        nearest = "nearest",
        bilinear = "bilinear",
        trilinear = "trilinear"
    }

    /**
     * Generic texture creation options that work across all supported game engines.
     * These options are mapped to engine-specific texture properties.
     */
    export class GenericTextureDto {
        constructor(
            url?: string,
            name?: string,
            uScale?: number,
            vScale?: number,
            uOffset?: number,
            vOffset?: number,
            wAng?: number,
            invertY?: boolean,
            invertZ?: boolean,
            samplingMode?: samplingModeEnum
        ) {
            if (url !== undefined) { this.url = url; }
            if (name !== undefined) { this.name = name; }
            if (uScale !== undefined) { this.uScale = uScale; }
            if (vScale !== undefined) { this.vScale = vScale; }
            if (uOffset !== undefined) { this.uOffset = uOffset; }
            if (vOffset !== undefined) { this.vOffset = vOffset; }
            if (wAng !== undefined) { this.wAng = wAng; }
            if (invertY !== undefined) { this.invertY = invertY; }
            if (invertZ !== undefined) { this.invertZ = invertZ; }
            if (samplingMode !== undefined) { this.samplingMode = samplingMode; }
        }
        /**
         * URL of the texture image. Can be a local path or remote URL.
         * @default undefined
         */
        url: string;
        /**
         * Name identifier for the texture
         * @default Texture
         */
        name = "Texture";
        /**
         * Horizontal (U) scale/tiling of the texture
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        uScale = 1;
        /**
         * Vertical (V) scale/tiling of the texture
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        vScale = 1;
        /**
         * Horizontal (U) offset of the texture
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        uOffset = 0;
        /**
         * Vertical (V) offset of the texture
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        vOffset = 0;
        /**
         * Rotation angle of the texture in radians around the W axis
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        wAng = 0;
        /**
         * Invert the texture on the Y axis
         * @default false
         */
        invertY = false;
        /**
         * Invert the texture on the Z axis
         * @default false
         */
        invertZ = false;
        /**
         * Texture sampling/filtering mode
         * @default nearest
         */
        samplingMode: samplingModeEnum = samplingModeEnum.nearest;
    }

    /**
     * Alpha/blend modes that determine how transparent materials are rendered
     */
    export enum alphaModeEnum {
        opaque = "opaque",
        mask = "mask",
        blend = "blend"
    }

    /**
     * Generic PBR (Physically Based Rendering) material creation options.
     * These properties represent the common subset available across BabylonJS, ThreeJS, and PlayCanvas.
     * Property names follow BabylonJS conventions and are mapped to equivalent properties in other engines.
     */
    export class GenericPBRMaterialDto {
        constructor(
            name?: string,
            baseColor?: Base.Color,
            metallic?: number,
            roughness?: number,
            alpha?: number,
            emissiveColor?: Base.Color,
            emissiveIntensity?: number,
            zOffset?: number,
            zOffsetUnits?: number,
            baseColorTexture?: Base.Texture,
            metallicRoughnessTexture?: Base.Texture,
            normalTexture?: Base.Texture,
            emissiveTexture?: Base.Texture,
            occlusionTexture?: Base.Texture,
            alphaMode?: alphaModeEnum,
            alphaCutoff?: number,
            doubleSided?: boolean,
            wireframe?: boolean,
            unlit?: boolean
        ) {
            if (name !== undefined) { this.name = name; }
            if (baseColor !== undefined) { this.baseColor = baseColor; }
            if (metallic !== undefined) { this.metallic = metallic; }
            if (roughness !== undefined) { this.roughness = roughness; }
            if (alpha !== undefined) { this.alpha = alpha; }
            if (emissiveColor !== undefined) { this.emissiveColor = emissiveColor; }
            if (emissiveIntensity !== undefined) { this.emissiveIntensity = emissiveIntensity; }
            if (zOffset !== undefined) { this.zOffset = zOffset; }
            if (zOffsetUnits !== undefined) { this.zOffsetUnits = zOffsetUnits; }
            if (baseColorTexture !== undefined) { this.baseColorTexture = baseColorTexture; }
            if (metallicRoughnessTexture !== undefined) { this.metallicRoughnessTexture = metallicRoughnessTexture; }
            if (normalTexture !== undefined) { this.normalTexture = normalTexture; }
            if (emissiveTexture !== undefined) { this.emissiveTexture = emissiveTexture; }
            if (occlusionTexture !== undefined) { this.occlusionTexture = occlusionTexture; }
            if (alphaMode !== undefined) { this.alphaMode = alphaMode; }
            if (alphaCutoff !== undefined) { this.alphaCutoff = alphaCutoff; }
            if (doubleSided !== undefined) { this.doubleSided = doubleSided; }
            if (wireframe !== undefined) { this.wireframe = wireframe; }
            if (unlit !== undefined) { this.unlit = unlit; }
        }
        /**
         * Name identifier for the material
         * @default PBRMaterial
         */
        name = "PBRMaterial";
        /**
         * Base/albedo color of the material in hex format
         * @default #0000ff
         */
        baseColor: Base.Color = "#0000ff";
        /**
         * Metallic factor (0 = dielectric, 1 = metallic)
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic = 0.5;
        /**
         * Roughness factor (0 = smooth/mirror, 1 = rough/diffuse)
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness = 0.5;
        /**
         * Overall opacity/transparency of the material (0 = fully transparent, 1 = fully opaque)
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        alpha = 1;
        /**
         * Emissive color - the color the material appears to emit (glow)
         * @default #000000
         */
        emissiveColor?: Base.Color = "#000000";
        /**
         * Intensity multiplier for the emissive color
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        emissiveIntensity = 1;
        /**
         * Z-buffer depth offset factor to help with z-fighting on coplanar surfaces
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        zOffset = 0;
        /**
         * Z-buffer depth offset units for fine-tuned z-fighting control
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        zOffsetUnits = 0;
        /**
         * Texture to use for base/albedo color
         * @default undefined
         * @optional true
         */
        baseColorTexture?: Base.Texture;
        /**
         * Combined metallic-roughness texture (metallic in B channel, roughness in G channel)
         * @default undefined
         * @optional true
         */
        metallicRoughnessTexture?: Base.Texture;
        /**
         * Normal/bump map texture for surface detail
         * @default undefined
         * @optional true
         */
        normalTexture?: Base.Texture;
        /**
         * Texture for emissive/glow areas
         * @default undefined
         * @optional true
         */
        emissiveTexture?: Base.Texture;
        /**
         * Ambient occlusion texture for soft shadows in crevices
         * @default undefined
         * @optional true
         */
        occlusionTexture?: Base.Texture;
        /**
         * Alpha/transparency mode: opaque, mask (cutout), or blend (translucent)
         * @default opaque
         */
        alphaMode: alphaModeEnum = alphaModeEnum.opaque;
        /**
         * Alpha threshold for mask mode (pixels below this are fully transparent)
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.05
         */
        alphaCutoff = 0.5;
        /**
         * Render both sides of faces (equivalent to disabling backFaceCulling)
         * @default false
         */
        doubleSided = false;
        /**
         * Render material as wireframe
         * @default false
         */
        wireframe = false;
        /**
         * Disable lighting calculations and render flat/unlit
         * @default false
         */
        unlit = false;
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
        occtShapes,
        tag,
        tags,
    }
}
