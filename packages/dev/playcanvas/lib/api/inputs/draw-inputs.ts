/* eslint-disable @typescript-eslint/no-namespace */

import * as Inputs from "./index";
import { Base } from "./base-inputs";
import type * as pc from "playcanvas";
import type * as Models from "@bitbybit-dev/core/lib/api/models";

/**
 * Options for drawing geometry into a PlayCanvas scene: color, opacity, size, and the per-kind
 * settings that control how points, lines, polylines, meshes, surfaces and kernel shapes become
 * renderer entities. Passing an existing drawn entity back in updates it in place.
 */
export namespace Draw {

    export type DrawOptions = DrawOcctShapeOptions | DrawBasicGeometryOptions | DrawManifoldOrCrossSectionOptions | DrawFrameOptions | DrawRecipeMeshesOptions;
    /**
     * A kernel shape with the looks to draw it in: a base look for the whole shape and groups of
     * faces that override it, by the face indexes `shapes.face.getFaces` gives, with the colors of
     * its edges. A part that `occt.design.build` returns is one already; drawn, the shape becomes
     * one mesh.
     */
    export interface ShapeWithAppearance {
        /** The shape to draw, as the Bitbybit OCCT Kernel returns it. */
        shape: Inputs.OCCT.TopoDSShapePointer;
        /**
         * How the shape looks. Each `faces` entry gives its values to the faces it lists, `edgeColor`
         * colors the edges and each `edges` entry the edges it lists, by the indexes
         * `shapes.edge.getEdges` gives; left out, the shape takes the colors of the options.
         */
        appearance?: Models.OCCT.DesignBuiltAppearance | undefined;
    }
    /**
     * Everything a draw call will accept: points, lines, segments and polylines; Verb curves and
     * surfaces; the handles the OCCT, Manifold and JSCAD kernels return; kernel shapes with their
     * appearance and what `occt.design.build` returns; tags; whatever a layer above these packages
     * has taught the call to draw; and a list of any one of them. This union is what makes one draw
     * call able to render anything these packages produce without you having to say which kind it is.
     *
     * A design build draws every placement as a hardware instance. Drawn again into the entity it
     * returned, passed as `group`, with the same parts at the same component paths, it only moves
     * them, so animating from joint values never meshes again.
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
        | Base.Frame
        | Base.VerbCurve
        | Base.VerbSurface
        | Inputs.OCCT.TopoDSShapePointer
        | ShapeWithAppearance
        | Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>
        | Models.OCCT.DesignSection<Inputs.OCCT.TopoDSShapePointer>
        | Inputs.OCCT.DecomposedMeshDto
        | Inputs.Manifold.ManifoldPointer
        | Inputs.Manifold.CrossSectionPointer
        | Inputs.Manifold.DecomposedManifoldMeshDto
        | Inputs.Manifold.RecipeMeshesDto
        | Inputs.JSCAD.JSCADEntity
        | Inputs.Tag.TagDto
        | CustomGeometryDrawable
        | number[][]
        | Base.Point3[]
        | Base.Line3[]
        | Base.Segment3[]
        | Base.Polyline3[]
        | Base.Frame[]
        | Base.VerbCurve[]
        | Base.VerbSurface[]
        | Inputs.OCCT.TopoDSShapePointer[]
        | ShapeWithAppearance[]
        | Inputs.OCCT.DecomposedMeshDto[]
        | Inputs.Manifold.ManifoldPointer[]
        | Inputs.Manifold.CrossSectionPointer[]
        | Inputs.Manifold.DecomposedManifoldMeshDto[]
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
         * What to draw: a point, line, polyline, frame, curve, surface, kernel shape, mesh or tag, or a
         * list of one of these kinds. Kernel shapes need `draw.drawAnyAsync`.
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
         * An entity an earlier draw returned. Kinds drawn with `updatable` set change in place, a
         * design build only moves its parts, and without `options` its earlier options apply.
         * @optional true
         */
        group?: U | undefined;
    }
    /**
     * Taken by `draw.drawAnyAsync` for Manifold solids, meshes and cross-sections: the face color or
     * engine material, the shading and back faces of solids, and the outline of cross-sections.
     */
    export class DrawManifoldOrCrossSectionOptions {
        /**
         * Provide options without default values
         */
        constructor(faceOpacity?: number, faceMaterial?: Base.Material, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, minSharpAngle?: number) {
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
            if (minSharpAngle !== undefined) { this.minSharpAngle = minSharpAngle; }
        }
        /**
         * How opaque the faces are, from 0 to 1, though this renderer draws them opaque whatever the
         * value; a `faceMaterial` replaces it.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        faceOpacity?: number | undefined = 1;
        /**
         * The color of the faces of solids and meshes, as a hex string; a `faceMaterial` replaces it.
         * @default #ff0000
         */
        faceColour?: Base.Color | undefined = "#ff0000";
        /**
         * An engine material for the faces, such as `draw.createPBRMaterial` makes; given, it replaces
         * `faceColour` and `faceOpacity`.
         * @default undefined
         * @optional true
         */
        faceMaterial?: Base.Material | undefined;
        /**
         * The color of the outline of a cross-section, as a hex string.
         * @default #ff00ff
         */
        crossSectionColour?: Base.Color | undefined = "#ff00ff";
        /**
         * Not honored by this renderer, which draws the outline of a cross-section one pixel wide.
         * @default 2
         */
        crossSectionWidth?: number | undefined = 2;
        /**
         * How opaque the outline of a cross-section is; this renderer draws it opaque whatever the
         * value.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        crossSectionOpacity?: number | undefined = 1;
        /**
         * When true, the mesh shades smoothly across edges flatter than `minSharpAngle` and keeps
         * sharper ones crisp; when false, every face is shaded flat.
         * @default true
         */
        computeNormals?: boolean | undefined = true;
        /**
         * The angle between two faces, in degrees, above which their shared edge is drawn sharp when
         * `computeNormals` is true.
         * @default 40
         * @minimum 0
         * @maximum 180
         * @step 5
         */
        minSharpAngle?: number | undefined = 40;
        /**
         * When true, the back of the faces of solids and meshes is drawn in `backFaceColour`, which
         * shows which way they face.
         * @default true
         */
        drawTwoSided?: boolean | undefined = true;
        /**
         * The color of the back of the faces, as a hex string; used with `drawTwoSided`.
         * @default #0000ff
         */
        backFaceColour?: Base.Color | undefined = "#0000ff";
        /**
         * How opaque the back of the faces is, from 0 for invisible to 1 for opaque; used with
         * `drawTwoSided`.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        backFaceOpacity?: number | undefined = 1;
    }
    /**
     * Built by `draw.optionsOcctShape` for OCCT shapes: meshing, which faces, edges, vertices and
     * labels show in what colors, iso curves, surface analysis and caching. Shapes with an appearance
     * and design builds skip vertices, labels, arrows, iso curves, analysis and `faceMaterial`.
     */
    export class DrawOcctShapeOptions {
        /**
         * Provide options without default values
         */
        constructor(faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, edgeArrowSize?: number, edgeArrowAngle?: number, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean, drawIsoCurves?: boolean, isoCurvesU?: number, isoCurvesV?: number, isoCurvesColour?: Base.Color, surfaceAnalysis?: Inputs.OCCT.surfaceAnalysisEnum, draftDirection?: Base.Vector3, analysisMin?: number, analysisMax?: number, edgeContrast?: number, angularDeflection?: number, relativeDeflection?: boolean) {
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
            if (drawIsoCurves !== undefined) { this.drawIsoCurves = drawIsoCurves; }
            if (isoCurvesU !== undefined) { this.isoCurvesU = isoCurvesU; }
            if (isoCurvesV !== undefined) { this.isoCurvesV = isoCurvesV; }
            if (isoCurvesColour !== undefined) { this.isoCurvesColour = isoCurvesColour; }
            if (surfaceAnalysis !== undefined) { this.surfaceAnalysis = surfaceAnalysis; }
            if (draftDirection !== undefined) { this.draftDirection = draftDirection; }
            if (analysisMin !== undefined) { this.analysisMin = analysisMin; }
            if (analysisMax !== undefined) { this.analysisMax = analysisMax; }
            if (edgeContrast !== undefined) { this.edgeContrast = edgeContrast; }
            if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
            if (relativeDeflection !== undefined) { this.relativeDeflection = relativeDeflection; }
        }
        /**
         * How opaque the faces are, from 0 to 1, multiplied into each look's own opacity. This renderer
         * shows it on faces drawn in looks only; plain faces stay opaque.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        faceOpacity?: number | undefined = 1;
        /**
         * How opaque the edge and iso curve lines are; this renderer draws them opaque whatever the
         * value.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        edgeOpacity?: number | undefined = 1;
        /**
         * The color of the edges, as a hex string, unless `edgeContrast` derives it from the faces; the
         * edge colors of an appearance win over both.
         * @default #ffffff
         */
        edgeColour?: Base.Color | undefined = "#ffffff";
        /**
         * Edges take their faces' color moved toward black, or toward white on dark faces, by this
         * amount from 0 to 1, instead of `edgeColour`. Appearance edge colors still win.
         * @default undefined
         * @optional true
         * @minimum 0
         * @maximum 1
         * @step 0.05
         */
        edgeContrast?: number | undefined;
        /**
         * The color of the faces, as a hex string. A `faceMaterial` or a `surfaceAnalysis` takes its
         * place, and the colors of an appearance win over it.
         * @default #ff0000
         */
        faceColour?: Base.Color | undefined = "#ff0000";
        /**
         * The color of the vertex markers, as a hex string; used with `drawVertices`.
         * @default #ff00ff
         */
        vertexColour?: Base.Color | undefined = "#ff00ff";
        /**
         * An engine material for the faces, such as `draw.createPBRMaterial` makes; it replaces
         * `faceColour` and `faceOpacity`, and a `surfaceAnalysis` replaces it in turn.
         * @default undefined
         * @optional true
         */
        faceMaterial?: Base.Material | undefined;
        /**
         * Not honored by this renderer, which draws edge and iso curve lines one pixel wide.
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        edgeWidth?: number | undefined = 2;
        /**
         * The diameter of the vertex markers, in model units; used with `drawVertices`.
         * @default 0.03
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        vertexSize?: number | undefined = 0.03;
        /**
         * When false, the edges are not drawn. Drawn edges or iso curves push the faces back slightly
         * in depth so the lines show on top.
         * @default true
         */
        drawEdges?: boolean | undefined = true;
        /**
         * When false, the faces and their backs are not drawn and no `surfaceAnalysis` is computed; the
         * face index labels still are.
         * @default true
         */
        drawFaces?: boolean | undefined = true;
        /**
         * When true, each vertex of the shape is drawn as a small sphere in `vertexColour`,
         * `vertexSize` across.
         * @default false
         */
        drawVertices?: boolean | undefined = false;
        /**
         * The largest distance, in model units, the triangles and edge lines may stray from the curved
         * shape; smaller is finer and heavier.
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        precision?: number | undefined = 0.01;
        /**
         * The largest angle, in radians, a curved face may turn between neighboring triangles; smaller
         * follows curvature more closely with more triangles.
         * @default 0.5
         * @minimum 0.001
         * @maximum 3.14159
         * @step 0.05
         */
        angularDeflection?: number | undefined = 0.5;
        /**
         * When true, `precision` is a fraction of each edge's and face's size instead of model units, so
         * small and large parts get triangles in proportion to their size.
         * @default false
         */
        relativeDeflection?: boolean | undefined = false;
        /**
         * When true, each edge's index is written beside the middle of the edge, handy for picking
         * edges to fillet.
         * @default false
         */
        drawEdgeIndexes?: boolean | undefined = false;
        /**
         * The height of the edge index labels, in model units; they are drawn as lines in a plane
         * parallel to XY.
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        edgeIndexHeight?: number | undefined = 0.06;
        /**
         * The color of the edge index labels, as a hex string.
         * @default #ff00ff
         */
        edgeIndexColour?: Base.Color | undefined = "#ff00ff";
        /**
         * When true, each face's index is written near the middle of the face, handy for picking faces.
         * @default false
         */
        drawFaceIndexes?: boolean | undefined = false;
        /**
         * The height of the face index labels, in model units; they are drawn as lines in a plane
         * parallel to XY.
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        faceIndexHeight?: number | undefined = 0.06;
        /**
         * The color of the face index labels, as a hex string.
         * @default #0000ff
         */
        faceIndexColour?: Base.Color | undefined = "#0000ff";
        /**
         * When true, the back of each face is drawn in `backFaceColour`, which shows which way faces
         * point. A design build draws no backs.
         * @default true
         */
        drawTwoSided?: boolean | undefined = true;
        /**
         * The color of the back of the faces, as a hex string; used with `drawTwoSided`.
         * @default #0000ff
         */
        backFaceColour?: Base.Color | undefined = "#0000ff";
        /**
         * How opaque the back of the faces is, from 0 for invisible to 1 for opaque; used with
         * `drawTwoSided`.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        backFaceOpacity?: number | undefined = 1;
        /**
         * The length of an arrow head at the end of each edge, showing its direction, in model units; 0
         * draws none.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        edgeArrowSize?: number | undefined = 0;
        /**
         * The angle, in degrees, between each line of an arrow head and its edge; larger spreads the
         * head wider.
         * @default 15
         * @minimum 0
         * @maximum 90
         * @step 1
         */
        edgeArrowAngle?: number | undefined = 15;
        /**
         * When true, the triangulation stays cached on each shape after drawing; when false it is
         * cleared so memory does not grow across draws.
         * @default false
         */
        keepMeshData?: boolean | undefined = false;
        /**
         * When true, a shape already meshed more finely may be remeshed at the coarser precision asked
         * for.
         * @default true
         */
        allowQualityDecrease?: boolean | undefined = true;
        /**
         * When true, every face is remeshed at the requested precision even when a triangulation is
         * cached.
         * @default false
         */
        forceFaceDeflection?: boolean | undefined = false;
        /**
         * When true, each face's iso curves are drawn with the shape, as its edges are: at `edgeWidth`
         * and `edgeOpacity`, in `isoCurvesColour`.
         * @default false
         */
        drawIsoCurves?: boolean | undefined = false;
        /**
         * How many iso curves of constant u each face gets with `drawIsoCurves`, at values spread evenly
         * inside its u range and trimmed to the face.
         * @default 5
         * @minimum 0
         * @maximum 1000
         * @step 1
         */
        isoCurvesU?: number | undefined = 5;
        /**
         * How many iso curves of constant v each face gets with `drawIsoCurves`, at values spread evenly
         * inside its v range and trimmed to the face.
         * @default 5
         * @minimum 0
         * @maximum 1000
         * @step 1
         */
        isoCurvesV?: number | undefined = 5;
        /**
         * The color of the iso curves as a hex string.
         * @default #808080
         */
        isoCurvesColour?: Base.Color | undefined = "#808080";
        /**
         * The surface analysis coloring the faces instead of `faceColour` and `faceMaterial`, from blue at
         * `analysisMin` through green to red at `analysisMax`; vertices without a value keep `faceColour`.
         * @default none
         */
        surfaceAnalysis?: Inputs.OCCT.surfaceAnalysisEnum | undefined = Inputs.OCCT.surfaceAnalysisEnum.none;
        /**
         * The pull direction the draft angles, in degrees, are measured against; read only when
         * `surfaceAnalysis` is `draftAngle`.
         * @default [0, 1, 0]
         */
        draftDirection?: Base.Vector3 | undefined = [0, 1, 0];
        /**
         * The analysis value drawn blue, and anything below it; left out, the lowest finite value
         * found.
         * @default undefined
         * @optional true
         */
        analysisMin?: number | undefined;
        /**
         * The analysis value drawn red, and anything above it; left out, the highest finite value
         * found.
         * @default undefined
         * @optional true
         */
        analysisMax?: number | undefined;
    }

    /**
     * Built by `draw.optionsSimple` for points, lines, polylines, JSCAD paths and meshes, and Verb
     * curves and surfaces: colors, size, opacity, back faces and arrow heads. Drawn with no options,
     * lines, polylines and curves get `size` 2 in magenta.
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
         * One hex color for everything drawn, or a list with one per point, line, polyline, surface or
         * JSCAD mesh; a polyline or JSCAD mesh with its own color keeps it.
         * @default #ff0000
         */
        colours?: string | string[] | undefined = "#ff0000";
        /**
         * How a `colours` list shorter than what is drawn is spread: first color for all, last for the
         * rest, repeating, or back and forth. JSCAD meshes ignore it.
         * @default lastColorRemainder
         */
        colorMapStrategy?: Base.colorMapStrategyEnum | undefined = Base.colorMapStrategyEnum.lastColorRemainder;
        /**
         * The diameter of each point in model units. This renderer draws lines one pixel wide whatever
         * the size.
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size?: number | undefined = 0.1;
        /**
         * The opacity of points, surfaces and JSCAD meshes, from 0 for invisible to 1 for opaque; this
         * renderer draws lines opaque.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity?: number | undefined = 1;
        /**
         * When true, handing the drawn object back as `group` changes it in place instead of drawing a
         * new one.
         * @default false
         */
        updatable?: boolean | undefined = false;
        /**
         * When true, surfaces and JSCAD meshes are drawn but not shown until made visible; points and
         * lines ignore it.
         * @default false
         */
        hidden?: boolean | undefined = false;
        /**
         * When true, the back of each surface and JSCAD mesh is drawn in `backFaceColour`, which shows
         * which way it faces.
         * @default true
         */
        drawTwoSided?: boolean | undefined = true;
        /**
         * The color of the back of surfaces and JSCAD meshes, as a hex string; used with
         * `drawTwoSided`.
         * @default #0000ff
         */
        backFaceColour?: Base.Color | undefined = "#0000ff";
        /**
         * How opaque the back of surfaces and JSCAD meshes is, from 0 for invisible to 1 for opaque;
         * used with `drawTwoSided`.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        backFaceOpacity?: number | undefined = 1;
        /**
         * The length of the arrow head at the end of each line, polyline and curve, showing its
         * direction, in model units; 0 draws none.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        arrowSize?: number | undefined = 0;
        /**
         * The angle, in degrees, between each line of an arrow head and the line it ends; larger
         * spreads the head wider.
         * @default 15
         * @minimum 0
         * @maximum 90
         * @step 1
         */
        arrowAngle?: number | undefined = 15;
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
     * Feeds `draw.createTexture`: the image to load and how it lies on a surface, its tiling, offset,
     * rotation and flip, and how it is filtered; the texture then goes into a texture slot of
     * `draw.createPBRMaterial`.
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
         * Where the image is loaded from, as a path relative to the page or a full web address.
         * @default undefined
         */
        url!: string;
        /**
         * The name the engine gives the texture.
         * @default Texture
         */
        name?: string | undefined = "Texture";
        /**
         * How many times the image repeats along U, the first texture direction of the surface.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        uScale?: number | undefined = 1;
        /**
         * How many times the image repeats along V, the second texture direction of the surface.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        vScale?: number | undefined = 1;
        /**
         * How far the image is shifted along U, in image widths.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        uOffset?: number | undefined = 0;
        /**
         * How far the image is shifted along V, in image heights.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        vOffset?: number | undefined = 0;
        /**
         * How far the image is turned on the surface; this renderer reads the value in degrees.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        wAng?: number | undefined = 0;
        /**
         * When false, the default, the image is flipped vertically as it loads; true keeps its rows in
         * file order.
         * @default false
         */
        invertY?: boolean | undefined = false;
        /**
         * When true, the tiling along V is negated, which mirrors the image vertically on the surface.
         * @default false
         */
        invertZ?: boolean | undefined = false;
        /**
         * How the image is sampled when shown larger or smaller than its pixels: `nearest` keeps hard
         * pixels, `bilinear` blends neighbors, and `trilinear` also blends between mipmap levels.
         * @default nearest
         */
        samplingMode?: samplingModeEnum | undefined = samplingModeEnum.nearest;
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
     * Feeds `draw.createPBRMaterial`: a physically based material for the `faceMaterial` of the drawing
     * options, from a base color, metallic and roughness values, opacity, glow, texture slots and how
     * the faces are rendered.
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
         * The name the engine gives the material.
         * @default PBRMaterial
         */
        name?: string | undefined = "PBRMaterial";
        /**
         * The base color of the surface, as a hex string.
         * @default #0000ff
         */
        baseColor?: Base.Color | undefined = "#0000ff";
        /**
         * How metallic the surface is, from 0 for plastic-like to 1 for metal.
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic?: number | undefined = 0.5;
        /**
         * How rough the surface is, from 0 for a mirror-like shine to 1 for a matte finish.
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness?: number | undefined = 0.5;
        /**
         * How opaque the material is, from 0 for invisible to 1 for opaque; the default `opaque` mode
         * of `alphaMode` ignores it and `blend` shows it.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        alpha?: number | undefined = 1;
        /**
         * The color the surface glows with whatever the scene's lights, as a hex string; black, the
         * default, adds no glow.
         * @default #000000
         */
        emissiveColor?: Base.Color | undefined = "#000000";
        /**
         * How strongly the surface glows: the emissive color is multiplied by it.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        emissiveIntensity?: number | undefined = 1;
        /**
         * A constant depth offset, which moves coplanar surfaces in front of or behind each other to
         * stop flicker.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        zOffset?: number | undefined = 0;
        /**
         * A depth offset scaled by the slope of each face, added to `zOffset`; used only when `zOffset`
         * is not 0.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        zOffsetUnits?: number | undefined = 0;
        /**
         * An image from `draw.createTexture` for the base color of the surface.
         * @default undefined
         * @optional true
         */
        baseColorTexture?: Base.Texture | undefined;
        /**
         * An image used as both the metalness map and the gloss map of this renderer's material.
         * @default undefined
         * @optional true
         */
        metallicRoughnessTexture?: Base.Texture | undefined;
        /**
         * A normal map, which adds surface detail by bending the lighting without changing the
         * geometry.
         * @default undefined
         * @optional true
         */
        normalTexture?: Base.Texture | undefined;
        /**
         * An image giving where and in which color the surface glows.
         * @default undefined
         * @optional true
         */
        emissiveTexture?: Base.Texture | undefined;
        /**
         * An ambient occlusion map, which darkens the creases and corners light reaches less.
         * @default undefined
         * @optional true
         */
        occlusionTexture?: Base.Texture | undefined;
        /**
         * How opacity is applied: `opaque` ignores it, `mask` cuts away pixels below `alphaCutoff`, and
         * `blend` draws the faces see-through.
         * @default opaque
         */
        alphaMode?: alphaModeEnum | undefined = alphaModeEnum.opaque;
        /**
         * The opacity below which a pixel is cut away; used with `alphaMode` set to `mask`.
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.05
         */
        alphaCutoff?: number | undefined = 0.5;
        /**
         * When true, both sides of each face are drawn; when false, the back is culled.
         * @default false
         */
        doubleSided?: boolean | undefined = false;
        /**
         * Not read by this renderer; the faces are drawn filled whatever the value.
         * @default false
         */
        wireframe?: boolean | undefined = false;
        /**
         * Not read by this renderer; the surface is lit whatever the value.
         * @default false
         */
        unlit?: boolean | undefined = false;
    }

    /**
     * Feeds `draw.optionsFrame`: how a frame is drawn, as its three axes in their own colors and a
     * small grid in its plane that marks it as a plane.
     */
    export class DrawFrameOptions {
        constructor(size?: number, colorX?: Base.Color, colorY?: Base.Color, colorZ?: Base.Color, drawPlane?: boolean, colorPlane?: Base.Color, lineWidth?: number, updatable?: boolean) {
            if (size !== undefined) { this.size = size; }
            if (colorX !== undefined) { this.colorX = colorX; }
            if (colorY !== undefined) { this.colorY = colorY; }
            if (colorZ !== undefined) { this.colorZ = colorZ; }
            if (drawPlane !== undefined) { this.drawPlane = drawPlane; }
            if (colorPlane !== undefined) { this.colorPlane = colorPlane; }
            if (lineWidth !== undefined) { this.lineWidth = lineWidth; }
            if (updatable !== undefined) { this.updatable = updatable; }
        }
        /**
         * Length of each axis, in model units; the grid in the plane is as wide, centered on the origin.
         * @default 1
         * @minimum 0
         * @exclusiveMinimum true
         * @maximum Infinity
         * @step 0.1
         */
        size?: number | undefined = 1;
        /**
         * Color of the X axis, which runs along the frame's direction.
         * @default #ff0000
         */
        colorX?: Base.Color | undefined = "#ff0000";
        /**
         * Color of the Y axis.
         * @default #00ff00
         */
        colorY?: Base.Color | undefined = "#00ff00";
        /**
         * Color of the Z axis, which runs along the frame's normal.
         * @default #0000ff
         */
        colorZ?: Base.Color | undefined = "#0000ff";
        /**
         * Whether to draw the small grid in the frame's plane around its origin.
         * @default true
         */
        drawPlane?: boolean | undefined = true;
        /**
         * Color of the grid in the frame's plane.
         * @default #808080
         */
        colorPlane?: Base.Color | undefined = "#808080";
        /**
         * Not honored by this renderer, which draws the axis and grid lines one pixel wide.
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        lineWidth?: number | undefined = 2;
        /**
         * When true, handing the drawn frame back as `group` changes it in place instead of drawing a
         * new one.
         * @default false
         */
        updatable?: boolean | undefined = false;
    }
    /**
     * How the meshes of a recipe, as `manifold.recipes.meshes` gives them, are drawn: the tag
     * naming an element, when a mesh placed many times becomes instances, the size of a merged
     * batch, and the look of roots without a color.
     */
    export class DrawRecipeMeshesOptions {
        constructor(elementKey?: string, instancing?: boolean, minInstances?: number, maxBatchVertices?: number, defaultColour?: Base.Color, defaultOpacity?: number, metallic?: number, roughness?: number) {
            if (elementKey !== undefined) { this.elementKey = elementKey; }
            if (instancing !== undefined) { this.instancing = instancing; }
            if (minInstances !== undefined) { this.minInstances = minInstances; }
            if (maxBatchVertices !== undefined) { this.maxBatchVertices = maxBatchVertices; }
            if (defaultColour !== undefined) { this.defaultColour = defaultColour; }
            if (defaultOpacity !== undefined) { this.defaultOpacity = defaultOpacity; }
            if (metallic !== undefined) { this.metallic = metallic; }
            if (roughness !== undefined) { this.roughness = roughness; }
        }
        /**
         * The tag whose value names an element, so the roots sharing it show, hide, color and pick
         * as one.
         * @default globalId
         */
        elementKey?: string | undefined = "globalId";
        /**
         * Not read by this renderer, which merges every mesh into batches and draws no instances.
         * @default true
         */
        instancing?: boolean | undefined = true;
        /**
         * Not read by this renderer, which merges every mesh into batches and draws no instances.
         * @default 2
         * @minimum 2
         * @maximum Infinity
         * @step 1
         */
        minInstances?: number | undefined = 2;
        /**
         * The most vertices one merged batch holds; more start another batch.
         * @default 1000000
         * @minimum 1
         * @maximum Infinity
         * @step 1000
         */
        maxBatchVertices?: number | undefined = 1000000;
        /**
         * The color of a root whose tag has no `rgba`.
         * @default #cccccc
         */
        defaultColour?: Base.Color | undefined = "#cccccc";
        /**
         * The opacity of such a root, from 0 to 1.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        defaultOpacity?: number | undefined = 1;
        /**
         * How metallic every surface is, from 0 to 1.
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic?: number | undefined = 0;
        /**
         * How rough every surface is, from 0 to 1.
         * @default 0.8
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness?: number | undefined = 0.8;
    }

    /**
     * Elements of a drawn recipe to show or hide, by the values of their element tag.
     */
    export class RecipeElementsVisibilityDto<T> {
        constructor(drawn?: T, keys?: string[], visible?: boolean) {
            if (drawn !== undefined) { this.drawn = drawn; }
            if (keys !== undefined) { this.keys = keys; }
            if (visible !== undefined) { this.visible = visible; }
        }
        /**
         * The drawn recipe, as drawing its meshes returned it.
         * @default undefined
         */
        drawn!: T;
        /**
         * The elements, by the values of their element tag, such as global ids.
         * @default undefined
         */
        keys!: string[];
        /**
         * Whether they are shown.
         * @default true
         */
        visible?: boolean | undefined = true;
    }

    /**
     * Elements of a drawn recipe to show in one color, or to give back their own, by the values
     * of their element tag.
     */
    export class RecipeElementsColourDto<T> {
        constructor(drawn?: T, keys?: string[], colour?: Base.Color, opacity?: number) {
            if (drawn !== undefined) { this.drawn = drawn; }
            if (keys !== undefined) { this.keys = keys; }
            if (colour !== undefined) { this.colour = colour; }
            if (opacity !== undefined) { this.opacity = opacity; }
        }
        /**
         * The drawn recipe, as drawing its meshes returned it.
         * @default undefined
         */
        drawn!: T;
        /**
         * The elements, by the values of their element tag, such as global ids.
         * @default undefined
         */
        keys!: string[];
        /**
         * The color to show them in; left out, each takes its own color back.
         * @default undefined
         * @optional true
         */
        colour?: Base.Color | undefined;
        /**
         * The opacity that color is shown with, from 0 to 1; it shows only in an element drawn
         * see-through already.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity?: number | undefined = 1;
    }

    /**
     * What a pick hit in a drawn recipe: the mesh, and the triangle or the instance the engine
     * reports for it.
     */
    export class RecipeElementPickDto<T, M> {
        constructor(drawn?: T, mesh?: M, triangle?: number, instance?: number) {
            if (drawn !== undefined) { this.drawn = drawn; }
            if (mesh !== undefined) { this.mesh = mesh; }
            if (triangle !== undefined) { this.triangle = triangle; }
            if (instance !== undefined) { this.instance = instance; }
        }
        /**
         * The drawn recipe, as drawing its meshes returned it.
         * @default undefined
         */
        drawn!: T;
        /**
         * The mesh the pick hit.
         * @default undefined
         */
        mesh!: M;
        /**
         * The triangle the pick hit, which the engine reports for a merged batch.
         * @default undefined
         * @optional true
         */
        triangle?: number | undefined;
        /**
         * The instance the pick hit, which the engine reports for instances.
         * @default undefined
         * @optional true
         */
        instance?: number | undefined;
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
        frame = "frame",
        frames = "frames",
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
        recipeMeshes = "recipeMeshes",
        tag = "tag",
        tags = "tags",
    }
}
