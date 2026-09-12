/* eslint-disable @typescript-eslint/no-namespace */

import * as Inputs from "./index";
import { Base } from "./base-inputs";
import * as pc from "playcanvas";

// tslint:disable-next-line: no-namespace
/**
 * Options for drawing geometry into a PlayCanvas scene: color, opacity, size, and the per-kind
 * settings that control how points, lines, polylines, meshes, surfaces and kernel shapes become
 * renderer entities. Passing an existing drawn entity back in updates it in place.
 */
export namespace Draw {

    export type DrawOptions = DrawOcctShapeOptions | DrawBasicGeometryOptions | DrawManifoldOrCrossSectionOptions;
    /**
     * Everything a draw call will accept: points, lines, segments and polylines; Verb curves and
     * surfaces; the handles the OCCT, Manifold and JSCAD kernels return; tags; whatever a layer
     * above these packages has taught the call to draw; and a list of any one of them. This union is
     * what makes one draw call able to render anything these packages produce without you having to
     * say which kind it is.
     *
     * The list arms are one per kind rather than a single list of the union, because that is what is
     * true: drawing a list applies one set of options to one kind of thing, and every plural handler
     * reads its list as homogeneous. A mixed list is not something this call can draw, and saying so
     * here is what stops one being written.
     *
     * `Base.Vector3` is not listed and is still accepted: it is the same type as `Base.Point3`.
     *
     * `number[]` and `number[][]` are listed, and are the loosest members here on purpose. A point is
     * the tuple `Base.Point3`, but the vector services are honestly `number[]` - they operate on a
     * vector of any length - so every result of `vector.add`, `cross`, `lerp` and their siblings is a
     * `number[]`, and drawing one is ordinary. Dropping these arms would narrow the union at the cost
     * of making the library's own output undrawable without a cast.
     */
    export type Entity =
        | number[]
        | Base.Point3
        | Base.Line3
        | Base.Segment3
        | Base.Polyline3
        | Base.VerbCurve
        | Base.VerbSurface
        | Inputs.OCCT.TopoDSShapePointer
        | Inputs.OCCT.DecomposedMeshDto
        | Inputs.Manifold.ManifoldPointer
        | Inputs.Manifold.CrossSectionPointer
        | Inputs.JSCAD.JSCADEntity
        | Inputs.Tag.TagDto
        | CustomGeometryDrawable
        | number[][]
        | Base.Point3[]
        | Base.Line3[]
        | Base.Segment3[]
        | Base.Polyline3[]
        | Base.VerbCurve[]
        | Base.VerbSurface[]
        | Inputs.OCCT.TopoDSShapePointer[]
        | Inputs.OCCT.DecomposedMeshDto[]
        | Inputs.Manifold.ManifoldPointer[]
        | Inputs.Manifold.CrossSectionPointer[]
        | Inputs.JSCAD.JSCADEntity[]
        | Inputs.Tag.TagDto[];
       
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
        bitbybitMeta?: BitByBitMeta | undefined;
    }

    /**
     * A drawn tag. Drawing a tag produces the tag itself rather than a scene entity, because a tag is
     * rendered as an HTML overlay positioned from the scene rather than as geometry in it. It carries
     * the same metadata a drawn entity does, so that passing it back in updates it in place.
     */
    export interface DrawnTag extends Inputs.Tag.TagDto {
        bitbybitMeta?: BitByBitMeta | undefined;
    }

    /**
     * A list of drawn tags. The list itself carries the metadata as well as each tag does, because an
     * update is driven by handing back what drawing returned, which for a list of tags is the list.
     */
    export type DrawnTags = DrawnTag[] & { bitbybitMeta?: BitByBitMeta | undefined };


    /**
     * A drawable a layer above these packages taught the draw call to render, drawn as geometry.
     * `type` is the discriminant it is matched on, the same convention the kernels already follow
     * at runtime with "occ-shape" and "manifold-shape".
     */
    export interface CustomGeometryDrawable { readonly type: string; readonly name: string }


    /**
     * Everything drawing can produce, for the dispatch that runs before the kind is known. A caller
     * does know, and gets the one arm that applies through `Drawn`.
     */
    export type DrawnAny<T> = T | DrawnTag | DrawnTags | undefined;

    /**
     * What drawing hands back: an entity for geometry, the tag or tags for tags.
     */
    export type DrawnEntity = DrawnAny<BitByBitEntity>;

    /**
     * What drawing a particular entity resolves to.
     *
     * One call draws a dozen kinds of thing, and what comes back depends on which kind went in: a
     * tag becomes the tag itself, because it renders as an HTML overlay positioned from the scene
     * rather than as geometry in it; an overlay a host application resolves becomes a handle that
     * only knows how to dispose itself; everything else becomes a scene entity. Spelling that out
     * here is what lets a caller use what it gets back without first narrowing a union it already
     * knows the answer to.
     *
     * An `E` that is not known - the whole `Entity` union, or an `any` - resolves to the union of
     * every branch, which is the honest answer for a caller that does not know either.
     *
     * The empty-list arm is not decoration. `{ entity: [] }` infers `E` as `never[]`, and `never`
     * satisfies every other branch, so without it a literal empty list types as drawn tags.
     */
    export type Drawn<E, T> =
        E extends readonly unknown[]
            ? ([E[number]] extends [never] ? undefined
                : E[number] extends Inputs.Tag.TagDto ? DrawnTags
                : T)
            : E extends Inputs.Tag.TagDto ? DrawnTag
            : T;

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
        bitbybitMeta?: PolylineUserData | undefined;
    }

    /**
     * Feeds `draw.drawAnyAsync` and `drawAny`: the entity to draw, the options for its kind and,
     * when redrawing, the scene object from the previous draw.
     */
    export class DrawAny<U, E extends Entity = Entity> {
        constructor(entity?: E, options?: DrawOptions, group?: U) {
            if (entity !== undefined) { this.entity = entity; }
            if (options !== undefined) { this.options = options; }
            if (group !== undefined) { this.group = group; }
        }
        /**
         * Entity to be drawn - can be a single or multiple points, lines, polylines, verb curves, verb surfaces, jscad meshes, jscad polygons, jscad paths, occt shapes, tags, nodes
         * @default undefined
         */
        entity!: E;
        /**
         * How the drawing looks, matched to the entity: basic options for points, lines, polylines
         * and JSCAD meshes, OCCT options for shapes, and so on; left out, defaults are used
         * @default undefined
         * @optional true
         */
        options?: DrawOptions | undefined;
        /**
         * Group to indicate if geometry should be updated
         */
        group?: U | undefined;
    }
    /**
     * Drawing options for Manifold solids and cross-sections: the face color or material, the line
     * style of a cross-section, normals and the two-sided rendering.
     */
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
         * Hex color string for face color
         * @default #ff0000
         */
        faceColour: Base.Color = "#ff0000";
        /**
         * An engine material for the faces, used instead of `faceColour` when given
         * @default undefined
         * @optional true
         */
        faceMaterial?: Base.Material | undefined;
        /**
         * Hex color string for cross section drawing
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
        crossSectionOpacity: number = 1;
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
         * Hex color string for back face color (negative side of the face). Only used when drawTwoSided is true.
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
    /**
     * Feeds `draw.optionsOcctShape`: everything about how an OCCT shape is drawn, from meshing
     * precision to face, edge and vertex colors, index labels, arrows and the triangulation cache.
     */
    export class DrawOcctShapeOptions {
        /**
         * Provide options without default values
         */
        constructor(faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, edgeArrowSize?: number, edgeArrowAngle?: number, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean) {
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
            if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
            if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
            if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
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
         * Hex color string for the edges
         * @default #ffffff
         */
        edgeColour: Base.Color = "#ffffff";
        /**
         * Hex color string for face color
         * @default #ff0000
         */
        faceColour: Base.Color = "#ff0000";
        /**
         * Color of the vertices that will be drawn
         * @default #ff00ff
         */
        vertexColour: Base.Color = "#ffaaff";
        /**
         * An engine material for the faces, used instead of `faceColour` when given
         * @default undefined
         * @optional true
         */
        faceMaterial?: Base.Material | undefined;
        /**
         * Thickness of the drawn edge lines
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
         * Edge index color if the edges are drawn
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
         * Edge index color if the edges are drawn
         * @default #0000ff
         */
        faceIndexColour: Base.Color = "#0000ff";
        /**
         * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
         * @default true
         */
        drawTwoSided = true;
        /**
         * Hex color string for back face color (negative side of the face). Only used when drawTwoSided is true.
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
        /**
         * Keep the cached triangulation on the shape after meshing. When false (default) the mesh data
         * is flushed so it does not accumulate in memory across draws.
         * @default false
         */
        keepMeshData = false;
        /**
         * Allow re-meshing to a lower resolution triangulation than one already cached on the shape.
         * @default true
         */
        allowQualityDecrease = true;
        /**
         * Force every face to be re-meshed to the requested precision regardless of cached triangulation.
         * @default false
         */
        forceFaceDeflection = false;
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
         * Basic geometry colors to use for lines, points, polylines, surfaces, jscad meshes.
         * @default #ff0000
         */
        colours: string | string[] = "#ff0000";
        /**
         * How colors are spread over more entities than colors: first color for all, the last color
         * for the remainder, colors repeating, or colors bouncing back and forth
         * @default lastColorRemainder
         */
        colorMapStrategy: Base.colorMapStrategyEnum = Base.colorMapStrategyEnum.lastColorRemainder;
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
         * When true, the entity is drawn but not shown until it is made visible
         * @default false
         */
        hidden = false;
        /**
         * Draw two-sided faces with different colors for front and back. This helps visualize face orientation. Only applies to surfaces.
         * @default true
         */
        drawTwoSided = true;
        /**
         * Hex color string for back face color (negative side of the face). Only used when drawTwoSided is true and drawing surfaces.
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
        url!: string;
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
        emissiveColor?: Base.Color | undefined = "#000000";
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
        baseColorTexture?: Base.Texture | undefined;
        /**
         * Combined metallic-roughness texture (metallic in B channel, roughness in G channel)
         * @default undefined
         * @optional true
         */
        metallicRoughnessTexture?: Base.Texture | undefined;
        /**
         * Normal/bump map texture for surface detail
         * @default undefined
         * @optional true
         */
        normalTexture?: Base.Texture | undefined;
        /**
         * Texture for emissive/glow areas
         * @default undefined
         * @optional true
         */
        emissiveTexture?: Base.Texture | undefined;
        /**
         * Ambient occlusion texture for soft shadows in crevices
         * @default undefined
         * @optional true
         */
        occlusionTexture?: Base.Texture | undefined;
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

    /**
     * The kind of geometry a draw call detected, in singular and plural forms - point, line, node,
     * polyline, Verb curve and surface, JSCAD mesh, and so on. Written onto a drawn object so that
     * handing it back finds the handler that made it, and readable so you can tell what a handle
     * refers to when updating or disposing it.
     *
     * The values are strings rather than ordinals, and the membership is the same in every renderer.
     * As ordinals they were neither: the three renderers listed different kinds, so the same number
     * meant a Manifold solid in one and a list of OCCT shapes in another, and a value written by one
     * renderer read as a different kind in the next. A string says what it is wherever it is read.
     */
    export enum drawingTypes {
        point = "point",
        points = "points",
        line = "line",
        lines = "lines",
        node = "node",
        nodes = "nodes",
        polyline = "polyline",
        polylines = "polylines",
        verbCurve = "verbCurve",
        verbCurves = "verbCurves",
        verbSurface = "verbSurface",
        verbSurfaces = "verbSurfaces",
        jscadMesh = "jscadMesh",
        jscadMeshes = "jscadMeshes",
        jscadPath = "jscadPath",
        jscadPaths = "jscadPaths",
        occt = "occt",
        occtShapes = "occtShapes",
        manifold = "manifold",
        tag = "tag",
        tags = "tags",
    }
}
