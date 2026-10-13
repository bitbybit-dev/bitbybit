/* eslint-disable @typescript-eslint/no-namespace */
import type * as BABYLON from "@babylonjs/core";
import * as Inputs from "./index";
import { Base } from "./base-inputs";
import type * as Models from "@bitbybit-dev/core/lib/api/models";

/**
 * Options for drawing geometry into a BabylonJS scene: color, opacity, size, whether the result is
 * pickable, and the per-kind settings that control how points, lines, polylines, meshes, surfaces and
 * kernel shapes are turned into renderer objects. Passing an existing drawn object back in updates it
 * in place instead of creating a second one, which is what makes animation cheap.
 */
export namespace Draw {

    /**
     * The union of every option shape a draw call accepts. Which one applies depends on what is being
     * drawn - basic geometry, a Manifold solid or cross section, an OCCT shape, or a node - and the
     * draw API picks the right one from the entity you pass. Reach for the specific option class when
     * you want type checking on the fields.
     */
    export type DrawOptions = DrawBasicGeometryOptions | DrawManifoldOrCrossSectionOptions | DrawOcctShapeOptions | DrawOcctShapeSimpleOptions | DrawOcctShapeMaterialOptions | DrawNodeOptions | DrawFrameOptions | DrawRecipeMeshesOptions;
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
     * appearance and what `occt.design.build` returns; tags; a BabylonJS node, which draws as an axis
     * triad; whatever a layer above these packages has taught the call to draw; and a list of any one
     * of them. This union is what makes one draw call able to render anything these packages produce
     * without you having to say which kind it is.
     *
     * A design build draws every placement as a thin instance. Drawn again into the mesh it returned,
     * passed as `babylonMesh`, with the same parts at the same component paths, it only moves them, so
     * animating from joint values never meshes again.
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
        | Inputs.OCCT.DecomposedMeshDto
        | Inputs.Manifold.ManifoldPointer
        | Inputs.Manifold.CrossSectionPointer
        | Inputs.Manifold.DecomposedManifoldMeshDto
        | Inputs.Manifold.RecipeMeshesDto
        | Inputs.JSCAD.JSCADEntity
        | Inputs.Tag.TagDto
        | CustomGeometryDrawable
        | CustomOverlayDrawable
        | BABYLON.TransformNode
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
        | Inputs.Tag.TagDto[]
        | BABYLON.TransformNode[];

    /**
     * Metadata a drawn tag carries so that handing it back updates it in place.
     */
    export interface DrawnTagMeta {
        type: drawingTypes;
        /** Whatever options the draw was given. Drawing a tag without any records only updatability. */
        options: DrawOptions | { updatable: boolean };
    }

    /**
     * A drawn tag. Drawing a tag produces the tag itself rather than a mesh, because a tag is rendered
     * as an HTML overlay positioned from the scene rather than as geometry in it. The drawing entry
     * points still declare a mesh, which is the type every drawable output is described by, so a drawn
     * tag reaches a caller through that declaration.
     */
    export interface DrawnTag extends Inputs.Tag.TagDto {
        metadata?: DrawnTagMeta | undefined;
    }

    /**
     * A list of drawn tags. The list itself carries the metadata as well as each tag does, because an
     * update is driven by handing back what drawing returned, which for a list of tags is the list.
     */
    export type DrawnTags = DrawnTag[] & { metadata?: DrawnTagMeta | undefined };

    /**
     * What every drawn output has in common: it can be released. A layer above these packages that
     * draws an overlay - a label, a dimension, a marker - hands back one of these rather than a
     * mesh, because positioning something from the scene is not the same as being geometry in it.
     */
    export interface DrawnOverlay { dispose(): void }

    /**
     * A drawable a layer above these packages taught the draw call to render, drawn as geometry.
     * `type` is the discriminant it is matched on, the same convention the kernels already follow
     * at runtime with "occ-shape" and "manifold-shape".
     */
    export interface CustomGeometryDrawable { readonly type: string; readonly name: string }

    /** The same, for a drawable that draws an overlay rather than geometry. */
    export interface CustomOverlayDrawable { readonly type: string; readonly entityName: string }

    /**
     * Everything drawing can produce, for the dispatch that runs before the kind is known. A caller
     * does know, and gets the one arm that applies through `Drawn`.
     *
     * The node arm is not the mesh arm: drawing a node draws an axis triad, which is a
     * `TransformNode` and not geometry, and saying so is what lets that path return what it builds
     * instead of asserting it is a mesh.
     */
    export type DrawnAny<T> = T | BABYLON.TransformNode | BABYLON.TransformNode[] | DrawnTag | DrawnTags | DrawnOverlay | undefined;

    /**
     * What drawing a particular entity resolves to.
     *
     * One call draws a dozen kinds of thing, and what comes back depends on which kind went in: a
     * tag becomes the tag itself, because it renders as an HTML overlay positioned from the scene
     * rather than as geometry in it; an overlay a host application resolves becomes a handle that
     * only knows how to dispose itself; a node becomes the node, because drawing one draws an axis
     * triad parented to it rather than replacing it with geometry; everything else becomes a mesh.
     * Spelling that out here is what lets a caller use what it gets back without first narrowing a
     * union it already knows the answer to.
     *
     * A mesh is matched before a node in the single-entity arms so that handing a drawn mesh back to
     * update it in place still resolves to a mesh - `Mesh` extends `TransformNode`, so the node arm
     * would otherwise swallow it and hand back the wider type. The list arms do not repeat that:
     * there is no update path that takes a list, so a list of meshes is drawn as the list of nodes
     * it is, and claiming a single mesh there would describe a result nothing can produce.
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
                : E[number] extends BABYLON.TransformNode ? BABYLON.TransformNode[]
                : T)
            : E extends Inputs.Tag.TagDto ? DrawnTag
            : E extends CustomOverlayDrawable ? DrawnOverlay
            : E extends BABYLON.Mesh ? T
            : E extends BABYLON.TransformNode ? BABYLON.TransformNode
            : T;

    /**
     * Feeds `draw.drawAnyAsync` and `drawAny`: the entity to draw, the options for its kind and,
     * when redrawing, the scene object from the previous draw.
     */
    export class DrawAny<E extends Entity = Entity> {
        constructor(entity?: E, options?: DrawOptions, babylonMesh?: BABYLON.Mesh | BABYLON.LinesMesh) {
            if (entity !== undefined) { this.entity = entity; }
            if (options !== undefined) { this.options = options; }
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * What to draw: a point, line, polyline, frame, curve, surface, kernel shape, mesh, tag or
         * node, or a list of one of these kinds. Kernel shapes need `draw.drawAnyAsync`.
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
         * A mesh an earlier draw returned. Kinds drawn with `updatable` set change in place, a design
         * build only moves its parts, and without `options` its earlier options apply.
         * @default undefined
         * @optional true
         */
        babylonMesh?: BABYLON.Mesh | BABYLON.LinesMesh | undefined;
    }

    /**
     * Feeds `draw.drawGridMesh` and `draw.drawGridMeshNoReturn`: the size of the grid on the ground
     * plane, how far apart its lines are and which are drawn thicker, and the color and opacity of its
     * lines.
     */
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
         * The size of the grid along X, in model units; the grid is centered on the origin.
         * @default 400
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        width?: number | undefined = 400;
        /**
         * The size of the grid along Z, its depth on the ground plane, in model units.
         * @default 400
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        height?: number | undefined = 400;
        /**
         * How many segments the ground mesh is cut into along each side; the spacing of the lines comes
         * from `gridRatio`, not from this.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions?: number | undefined = 10;
        /**
         * How many lines it takes from one thick major line to the next; the thinner lines between them
         * are the minor lines.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        majorUnitFrequency?: number | undefined = 10;
        /**
         * How strongly the thin minor lines between the major ones show, from 0 for hidden to 1 for
         * full.
         * @default 0.45
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        minorUnitVisibility?: number | undefined = 0.45;
        /**
         * The distance between two neighboring lines, in model units.
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        gridRatio?: number | undefined = 0.5;
        /**
         * How opaque the grid lines are, from 0 for invisible to 1 for opaque.
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity?: number | undefined = 0.5;
        /**
         * When true, the grid is not drawn when seen from below.
         * @default false
         */
        backFaceCulling?: boolean | undefined = false;
        /**
         * The color between the lines, as a hex string. This grid draws only its lines, so the color
         * does not show.
         * @default #ffffff
         */
        mainColor?: Base.Color | undefined = "#ffffff";
        /**
         * The color of the grid lines, as a hex string.
         * @default #ffffff
         */
        secondaryColor?: Base.Color | undefined = "#ffffff";
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
         * rest, repeating, or back and forth. JSCAD meshes and curves ignore it.
         * @default lastColorRemainder
         */
        colorMapStrategy?: Base.colorMapStrategyEnum | undefined = Base.colorMapStrategyEnum.lastColorRemainder;
        /**
         * The diameter of each point in model units and the width of lines, a hundredth of it in model
         * units. Lines drawn without options get 2.
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size?: number | undefined = 0.1;
        /**
         * The opacity of points, lines, surfaces and JSCAD meshes, from 0 for invisible to 1 for
         * opaque.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity?: number | undefined = 1;
        /**
         * When true, handing the drawn object back as `babylonMesh` changes it in place instead of
         * drawing a new one.
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
         * The length of the arrow head at the end of each line and polyline, showing its direction, in
         * model units; 0 draws none.
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
     * Feeds `draw.optionsBabylonNode`: a node is drawn as three colored lines along its own X, Y and Z
     * axes, each ending in a small arrow tip, and these set their colors and length.
     */
    export class DrawNodeOptions {
        constructor(colorX?: Base.Color, colorY?: Base.Color, colorZ?: Base.Color, size?: number) {
            if (colorX !== undefined) { this.colorX = colorX; }
            if (colorY !== undefined) { this.colorY = colorY; }
            if (colorZ !== undefined) { this.colorZ = colorZ; }
            if (size !== undefined) { this.size = size; }
        }
        /**
         * The color of the line along the node's X axis, as a hex string.
         * @default #ff0000
         */
        colorX?: Base.Color | undefined = "#ff0000";
        /**
         * The color of the line along the node's Y axis, as a hex string.
         * @default #00ff00
         */
        colorY?: Base.Color | undefined = "#00ff00";
        /**
         * The color of the line along the node's Z axis, as a hex string.
         * @default #0000ff
         */
        colorZ?: Base.Color | undefined = "#0000ff";
        /**
         * The length of each axis line in the node's own space, so a scaled node scales its axes too.
         * @default 2
         * @minimum 0
         * @maximum Infinity
         */
        size?: number | undefined = 2;
    }
    /**
     * Feeds `draw.optionsManifoldShapeMaterial`: how a Manifold solid or mesh is drawn, by face color
     * or engine material, with its shading and back faces, and how the outline of a cross-section is
     * drawn.
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
         * How opaque the faces are, from 0 for invisible to 1 for opaque; a `faceMaterial` replaces it.
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
         * The width of the outline of a cross-section, a hundredth of it in model units.
         * @default 2
         */
        crossSectionWidth?: number | undefined = 2;
        /**
         * How opaque the outline of a cross-section is, from 0 for invisible to 1 for opaque.
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
         * How opaque the faces are, from 0 for invisible to 1 for opaque, multiplied into each look's
         * own opacity. A `faceMaterial` replaces it.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        faceOpacity?: number | undefined = 1;
        /**
         * How opaque the edge and iso curve lines are, from 0 for invisible to 1 for opaque.
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
         * The width of the edge and iso curve lines, a hundredth of it in model units.
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
     * Feeds `draw.optionsOcctShapeSimple`: the most used OCCT drawing options, precision, face and edge
     * colors and the two-sided rendering. Every option it leaves out takes the default
     * `draw.optionsOcctShape` gives.
     */
    export class DrawOcctShapeSimpleOptions {
        constructor(precision?: number, drawFaces?: boolean, faceColour?: Base.Color, drawEdges?: boolean, edgeColour?: Base.Color, edgeWidth?: number, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number) {
            if (precision !== undefined) { this.precision = precision; }
            if (drawFaces !== undefined) { this.drawFaces = drawFaces; }
            if (faceColour !== undefined) { this.faceColour = faceColour; }
            if (drawEdges !== undefined) { this.drawEdges = drawEdges; }
            if (edgeColour !== undefined) { this.edgeColour = edgeColour; }
            if (edgeWidth !== undefined) { this.edgeWidth = edgeWidth; }
            if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
            if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
            if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
        }
        /**
         * The largest distance, in model units, the triangles and edge lines may stray from the curved
         * shape; smaller is finer and heavier.
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         */
        precision?: number | undefined = 0.01;
        /**
         * When false, the faces and their backs are not drawn.
         * @default true
         */
        drawFaces?: boolean | undefined = true;
        /**
         * The color of the faces, as a hex string.
         * @default #ff0000
         */
        faceColour?: Base.Color | undefined = "#ff0000";
        /**
         * When false, the edges are not drawn.
         * @default true
         */
        drawEdges?: boolean | undefined = true;
        /**
         * The color of the edges, as a hex string.
         * @default #ffffff
         */
        edgeColour?: Base.Color | undefined = "#ffffff";
        /**
         * The width of the edge and iso curve lines, a hundredth of it in model units.
         * @default 2
         * @minimum 0
         * @maximum Infinity
         */
        edgeWidth?: number | undefined = 2;
        /**
         * When true, the back of each face is drawn in `backFaceColour`, which shows which way faces
         * point.
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
     * Feeds `draw.optionsOcctShapeMaterial`: an OCCT shape whose faces wear an engine material, with
     * the precision and the edge style. Every option it leaves out takes the default
     * `draw.optionsOcctShape` gives, so the backs of the faces show in blue.
     */
    export class DrawOcctShapeMaterialOptions {
        constructor(precision?: number, faceMaterial?: any, drawEdges?: boolean, edgeColour?: Base.Color, edgeWidth?: number) {
            if (precision !== undefined) { this.precision = precision; }
            if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
            if (drawEdges !== undefined) { this.drawEdges = drawEdges; }
            if (edgeColour !== undefined) { this.edgeColour = edgeColour; }
            if (edgeWidth !== undefined) { this.edgeWidth = edgeWidth; }
        }
        /**
         * The largest distance, in model units, the triangles and edge lines may stray from the curved
         * shape; smaller is finer and heavier.
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         */
        precision?: number | undefined = 0.01;
        /**
         * The engine material the faces are drawn with, such as `draw.createPBRMaterial` makes; it sets
         * their color and opacity.
         * @default undefined
         */
        faceMaterial!: any;

        /**
         * When false, the edges are not drawn.
         * @default true
         */
        drawEdges?: boolean | undefined = true;
        /**
         * The color of the edges, as a hex string.
         * @default #ffffff
         */
        edgeColour?: Base.Color | undefined = "#ffffff";
        /**
         * The width of the edge and iso curve lines, a hundredth of it in model units.
         * @default 2
         * @minimum 0
         * @maximum Infinity
         */
        edgeWidth?: number | undefined = 2;
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
         * How many times the image repeats along U, the first texture direction of the surface; 0
         * counts as 1.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        uScale?: number | undefined = 1;
        /**
         * How many times the image repeats along V, the second texture direction of the surface; 0
         * counts as 1.
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
         * How far the image is turned on the surface, in radians.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        wAng?: number | undefined = 0;
        /**
         * When true, the image is flipped vertically as it loads; false, the default, keeps its rows in
         * file order.
         * @default false
         */
        invertY?: boolean | undefined = false;
        /**
         * Not read by this renderer; the image keeps its orientation whatever the value.
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
         * Not read by this renderer; its materials keep no depth offset.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        zOffset?: number | undefined = 0;
        /**
         * Not read by this renderer; its materials keep no depth offset.
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
         * An image holding metallic in its blue channel and roughness in its green channel, as glTF
         * lays them out.
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
         * When true, the scene's lights are ignored and the surface shows its colors flat.
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
         * The width of the axis and grid lines, a hundredth of it in model units.
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        lineWidth?: number | undefined = 2;
        /**
         * When true, handing the drawn frame back as `babylonMesh` changes it in place instead of
         * drawing a new one.
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
         * When true, a mesh placed often enough by matrices that only turn and move is drawn as
         * instances, one draw call for all of them.
         * @default true
         */
        instancing?: boolean | undefined = true;
        /**
         * How many such placements of one mesh make it instances.
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
