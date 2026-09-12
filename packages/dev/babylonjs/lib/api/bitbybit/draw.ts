
import { uniqueName } from "../unique-name";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../inputs";
import { BabylonNode } from "./babylon/node";
import { Tag, DrawCore } from "@bitbybit-dev/core";
import { Context } from "../context";
import { GridMaterial } from "@babylonjs/materials";
import { DrawHelper } from "../draw-helper";

/**
 * Drawing anything into the scene: kernel shapes, points, lines, polylines, curves, meshes and tags
 * all go through `drawAnyAsync`, which picks the right renderer for the entity and returns the
 * drawn object. The `options` methods build the drawing options with defaults for each kind of
 * entity, `createPBRMaterial` and `createTexture` make materials for the face slots, and a drawn
 * object can be redrawn in place by passing it back.
 */
export class Draw extends DrawCore {

    private defaultBasicOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    private defaultPolylineOptions: Inputs.Draw.DrawBasicGeometryOptions = {
        ...new Inputs.Draw.DrawBasicGeometryOptions(),
        size: 2,
        colours: "#ff00ff",
    };
    private defaultNodeOptions: Inputs.Draw.DrawNodeOptions = {
        colorX: "#ff0000",
        colorY: "#00ff00",
        colorZ: "#0000ff",
        size: 2,
    };
    constructor(
        /**
         * @ignore true
         */
        public readonly drawHelper: DrawHelper,
        /**
         * @ignore true
         */
        public readonly node: BabylonNode,
        /**
         * @ignore true
         */
        public readonly tag: Tag,
        /**
         * @ignore true
         */
        public readonly context: Context,
    ) {
        super();
    }

    /**
     * Draws any entity into the scene, as `drawAnyAsync` does, without giving the drawn object
     * back; for the last step of a script that only needs the result to appear.
     * @param inputs - The entity to draw and the optional drawing options
     * @group draw async
     * @shortname draw async void
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
     * await bitbybit.draw.drawAnyAsyncNoReturn({ entity: box });
     * ```
     */
    async drawAnyAsyncNoReturn(inputs: Inputs.Draw.DrawAny): Promise<void> {
        await this.drawAnyAsync(inputs);
    }

    /**
     * Draws any entity the library produces into the scene and gives back the drawn object: kernel
     * shapes from OCCT, JSCAD and Manifold, points, lines, polylines, curves, meshes, tags and
     * nodes.
     *
     * The options are matched to the entity, with defaults when none are given; pass the previous
     * result back in the update slot to redraw in place.
     * @param inputs - The entity to draw, the optional drawing options and the previous result when updating
     * @returns What drawing the entity produces: a scene object for geometry, the tag or tags for a tag, an axis triad for a node; undefined for an empty list
     * @group draw async
     * @shortname draw async
     * @drawable true
     * @disposableOutput true
     * @example
     * ```typescript
     * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
     * const options = bitbybit.draw.optionsOcctShapeSimple({ precision: 0.01, drawFaces: true, faceColour: "#ff0000", drawEdges: true, edgeColour: "#ffffff", edgeWidth: 2, drawTwoSided: true, backFaceColour: "#0000ff", backFaceOpacity: 1 });
     * const drawn = await bitbybit.draw.drawAnyAsync({ entity: box, options });
     * ```
     */
    async drawAnyAsync<E extends Inputs.Draw.Entity>(
        inputs: Inputs.Draw.DrawAny<E>,
    ): Promise<Inputs.Draw.Drawn<E, BABYLON.Mesh>> {
        return await this.drawResolvedAsync(inputs) as Inputs.Draw.Drawn<E, BABYLON.Mesh>;
    }

    /**
     * Every branch of the asynchronous dispatch, typed as what it can actually produce.
     *
     * A package that adds entity kinds overrides this rather than the public signature: two
     * unresolved conditional types over the same `E` have no provable relation to each other, so a
     * narrower override of `drawAnyAsync` cannot typecheck however correct it is.
     * @ignore true
     */
    protected async drawResolvedAsync(inputs: Inputs.Draw.DrawAny): Promise<Inputs.Draw.DrawnAny<BABYLON.Mesh>> {
        const entity = inputs.entity;
        if (entity === undefined || (Array.isArray(entity) && entity.length === 0)) {
            return Promise.resolve(undefined);
        }
        const handlers = this.asyncHandlers();
        const kind = this.resolveDrawableKind(entity, "async", (k) => k in handlers);
        if (kind) {
            return handlers[kind]!(inputs, entity);
        }
        return Promise.resolve(this.drawResolved(inputs));
    }

    private mergedOcctShapeOptions(inputs: Inputs.Draw.DrawAny): Inputs.Draw.DrawOcctShapeOptions {
        let options = inputs.options ? inputs.options : new Inputs.Draw.DrawOcctShapeOptions();
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return { ...new Inputs.Draw.DrawOcctShapeOptions(), ...options as Inputs.Draw.DrawOcctShapeOptions };
    }

    private handleDecomposedMeshShape(inputs: Inputs.Draw.DrawAny) {
        const options = this.mergedOcctShapeOptions(inputs);
        return this.drawHelper.handleDecomposedMesh(
            options,
            inputs.entity as unknown as Inputs.OCCT.DecomposedMeshDto,
            options
        ).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.occt, options, r);
            return r;
        });
    }

    private async handleDecomposedMeshes(inputs: Inputs.Draw.DrawAny) {
        const options = this.mergedOcctShapeOptions(inputs);
        const decomposedMeshes = inputs.entity as unknown as Inputs.OCCT.DecomposedMeshDto[];
        const drawn = await Promise.all(decomposedMeshes.map(dm => this.drawHelper.handleDecomposedMesh(
            options, dm, options)));
        const container = new BABYLON.Mesh(`decomposedMeshesContainer-${++this.decomposedMeshesContainerCounter}`, this.context.scene);
        container.isVisible = false;
        drawn.forEach(mesh => { if (mesh) { mesh.parent = container; } });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.occt, options, container);
        return container;
    }

    private decomposedMeshesContainerCounter = 0;

    private updateAny(inputs: Inputs.Draw.DrawAny): Inputs.Draw.DrawnAny<BABYLON.Mesh> {
        let result: Inputs.Draw.DrawnAny<BABYLON.Mesh>;
        if (inputs.babylonMesh && inputs.babylonMesh.metadata) {

            const type = inputs.babylonMesh.metadata.type as Inputs.Draw.drawingTypes;
            switch (type) {
                case Inputs.Draw.drawingTypes.point:
                    result = this.handlePoint(inputs);
                    break;
                case Inputs.Draw.drawingTypes.points:
                    result = this.handlePoints(inputs);
                    break;
                case Inputs.Draw.drawingTypes.line:
                    result = this.handleLine(inputs);
                    break;
                case Inputs.Draw.drawingTypes.lines:
                    result = this.handleLines(inputs);
                    break;
                case Inputs.Draw.drawingTypes.polyline:
                    result = this.handlePolyline(inputs);
                    break;
                case Inputs.Draw.drawingTypes.polylines:
                    result = this.handlePolylines(inputs);
                    break;
                case Inputs.Draw.drawingTypes.jscadPath:
                    result = this.handleJscadPath(inputs);
                    break;
                case Inputs.Draw.drawingTypes.jscadPaths:
                    result = this.handleJscadPaths(inputs);
                    break;
                case Inputs.Draw.drawingTypes.verbCurve:
                    result = this.handleVerbCurve(inputs);
                    break;
                case Inputs.Draw.drawingTypes.verbCurves:
                    result = this.handleVerbCurves(inputs);
                    break;
                case Inputs.Draw.drawingTypes.verbSurface:
                    result = this.handleVerbSurface(inputs);
                    break;
                case Inputs.Draw.drawingTypes.verbSurfaces:
                    result = this.handleVerbSurfaces(inputs);
                    break;
                case Inputs.Draw.drawingTypes.tag:
                    result = this.handleTag(inputs);
                    break;
                case Inputs.Draw.drawingTypes.tags:
                    result = this.handleTags(inputs);
                    break;
                case Inputs.Draw.drawingTypes.node:
                    result = this.handleNode(inputs);
                    break;
                case Inputs.Draw.drawingTypes.nodes:
                    result = this.handleNodes(inputs);
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    /**
     * Draws an entity that needs no kernel work, as `drawAny` does, without giving the drawn object
     * back; points, lines, polylines and tags qualify, kernel shapes do not.
     * @param inputs - The entity to draw and the optional drawing options
     * @group draw sync
     * @shortname draw sync void
     * @example
     * ```typescript
     * bitbybit.draw.drawAnyNoReturn({ entity: [[0, 0, 0], [5, 5, 5], [10, 0, 0]] });
     * ```
     */
    drawAnyNoReturn(inputs: Inputs.Draw.DrawAny): void {
        this.drawAny(inputs);
    }

    /**
     * Draws an entity that needs no kernel work into the scene right away and gives back the drawn
     * object: points, lines, polylines, tags and nodes.
     *
     * Kernel shapes from OCCT, JSCAD and Manifold must go through `drawAnyAsync`, which waits for
     * the kernel to mesh them.
     * @param inputs - The entity to draw, the optional drawing options and the previous result when updating
     * @returns What drawing the entity produces: a scene object for geometry, the tag or tags for a tag, an axis triad for a node; undefined for an empty list
     * @group draw sync
     * @shortname draw sync
     * @example
     * ```typescript
     * const options = bitbybit.draw.optionsSimple({ colours: "#00ff00", size: 0.5, opacity: 1, updatable: false, hidden: false, drawTwoSided: true, backFaceColour: "#0000ff", backFaceOpacity: 1, colorMapStrategy: Bit.Inputs.Base.colorMapStrategyEnum.lastColorRemainder, arrowSize: 0, arrowAngle: 15 });
     * const drawn = bitbybit.draw.drawAny({ entity: [[0, 0, 0], [5, 5, 5], [10, 0, 0]], options });
     * ```
     */
    drawAny<E extends Inputs.Draw.Entity>(
        inputs: Inputs.Draw.DrawAny<E>,
    ): Inputs.Draw.Drawn<E, BABYLON.Mesh> {
        return this.drawResolved(inputs) as Inputs.Draw.Drawn<E, BABYLON.Mesh>;
    }

    private cachedSyncHandlers: Record<string, (inputs: Inputs.Draw.DrawAny) => Inputs.Draw.DrawnAny<BABYLON.Mesh>> | undefined;

    /**
     * What this renderer draws each synchronous kind with, keyed by the kind's name in the ordered
     * table. A kind absent from here is one this renderer does not draw, and the walk skips it.
     * @ignore true
     */
    private syncHandlers(): Record<string, (inputs: Inputs.Draw.DrawAny) => Inputs.Draw.DrawnAny<BABYLON.Mesh>> {
        return this.cachedSyncHandlers ??= {
            line: (i) => this.handleLine(i),
            point: (i) => this.handlePoint(i),
            jscadPath: (i) => this.handleJscadPath(i),
            polyline: (i) => this.handlePolyline(i),
            node: (i) => this.handleNode(i),
            verbCurve: (i) => this.handleVerbCurve(i),
            verbSurface: (i) => this.handleVerbSurface(i),
            jscadPaths: (i) => this.handleJscadPaths(i),
            polylines: (i) => this.handlePolylines(i),
            lines: (i) => this.handleLines(i),
            points: (i) => this.handlePoints(i),
            nodes: (i) => this.handleNodes(i),
            verbCurves: (i) => this.handleVerbCurves(i),
            verbSurfaces: (i) => this.handleVerbSurfaces(i),
            tag: (i) => this.handleTag(i),
            tags: (i) => this.handleTags(i),
        };
    }

    private cachedAsyncHandlers: Record<string, (inputs: Inputs.Draw.DrawAny, entity: unknown) => Promise<Inputs.Draw.DrawnAny<BABYLON.Mesh>>> | undefined;

    /**
     * The same for the kinds that have to cross to a worker and back.
     *
     * The two JSCAD entries ask their own check again rather than asserting: a handler that takes the
     * narrowed entity can only be given one honestly, and re-running a check the table just ran is
     * cheaper than a cast that could be wrong.
     * @ignore true
     */
    private asyncHandlers(): Record<string, (inputs: Inputs.Draw.DrawAny, entity: unknown) => Promise<Inputs.Draw.DrawnAny<BABYLON.Mesh>>> {
        return this.cachedAsyncHandlers ??= {
            jscadMesh: (i, e) => this.detectJscadMesh(e) ? this.handleJscadMesh(i, e) : Promise.resolve(undefined),
            occtShape: (i) => this.handleOcctShape(i),
            occtShapes: (i) => this.handleOcctShapes(i),
            jscadMeshes: (i, e) => this.detectJscadMeshes(e) ? this.handleJscadMeshes(i, e) : Promise.resolve(undefined),
            manifoldShape: (i) => this.handleManifoldShape(i),
            manifoldShapes: (i) => this.handleManifoldShapes(i),
            decomposedMeshes: (i) => this.handleDecomposedMeshes(i),
            decomposedMesh: (i) => this.handleDecomposedMeshShape(i),
        };
    }

    /**
     * Whether the entity is a node this renderer can draw an axis triad for.
     *
     * The engine-agnostic check this replaces asks whether `id` is a string containing "node", which
     * any object can satisfy and most real nodes do not: it matched only the ones this library named
     * itself, so a node from a loaded model, or one a script constructed, typechecked as drawable
     * and then silently drew nothing. A node is a renderer's own concept, so the honest check lives
     * beside the renderer that has the type to ask about.
     * @ignore true
     */
    override detectNode(entity: unknown): entity is BABYLON.TransformNode {
        return entity instanceof BABYLON.TransformNode;
    }

    /**
     * @ignore true
     */
    override detectNodes(entity: unknown): entity is BABYLON.TransformNode[] {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectNode(el));
    }

    /**
     * Every branch of the synchronous dispatch, typed as what it can actually produce. Overridden
     * instead of the public signature, for the reason given on its asynchronous twin.
     * @ignore true
     */
    protected drawResolved(inputs: Inputs.Draw.DrawAny): Inputs.Draw.DrawnAny<BABYLON.Mesh> {
        let result: Inputs.Draw.DrawnAny<BABYLON.Mesh>;
        const entity = inputs.entity;
        if (!inputs.babylonMesh && !(entity instanceof BABYLON.Mesh)) {
            const handlers = this.syncHandlers();
            const kind = this.resolveDrawableKind(entity, "sync", (k) => k in handlers);
            if (kind) {
                result = handlers[kind]!(inputs);
            }
        } else {
            result = this.updateAny(inputs);
        }
        return result;
    }

    /**
     * Draws a grid on the ground plane, as `drawGridMesh` does, without giving the mesh back.
     * @param inputs - The size, line spacing, colors and opacity of the grid
     * @group grid
     * @shortname draw grid no return
     * @disposableOutput true
     * @example
     * ```typescript
     * bitbybit.draw.drawGridMeshNoReturn({ width: 400, height: 400, subdivisions: 10, majorUnitFrequency: 10, minorUnitVisibility: 0.45, gridRatio: 0.5, opacity: 0.5, backFaceCulling: false, mainColor: "#ffffff", secondaryColor: "#ffffff" });
     * ```
     */
    drawGridMeshNoReturn(inputs: Inputs.Draw.SceneDrawGridMeshDto): void {
        this.drawGridMesh(inputs);
    }

    /**
     * Draws a grid on the ground plane, the XZ plane through the origin, to give a sense of scale
     * and orientation; every tenth line is drawn thicker by default.
     * @param inputs - The size, line spacing, colors and opacity of the grid
     * @returns The grid mesh
     * @group grid
     * @shortname draw grid
     * @disposableOutput true
     * @example
     * ```typescript
     * const grid = bitbybit.draw.drawGridMesh({ width: 400, height: 400, subdivisions: 10, majorUnitFrequency: 10, minorUnitVisibility: 0.45, gridRatio: 0.5, opacity: 0.5, backFaceCulling: false, mainColor: "#ffffff", secondaryColor: "#ffffff" });
     * ```
     */
    drawGridMesh(inputs: Inputs.Draw.SceneDrawGridMeshDto): BABYLON.Mesh {
        try {
            const groundMaterial = new GridMaterial(uniqueName("groundMaterial"), this.context.scene);
            groundMaterial.majorUnitFrequency = inputs.majorUnitFrequency;
            groundMaterial.minorUnitVisibility = inputs.minorUnitVisibility;
            groundMaterial.gridRatio = inputs.gridRatio;
            groundMaterial.backFaceCulling = inputs.backFaceCulling;
            groundMaterial.mainColor = BABYLON.Color3.FromHexString(inputs.mainColor);
            groundMaterial.lineColor = BABYLON.Color3.FromHexString(inputs.secondaryColor);
            groundMaterial.opacity = inputs.opacity;
            groundMaterial.linesOnly = true;
            const ground = BABYLON.MeshBuilder.CreateGround(uniqueName("bitbybit-ground"),
                {
                    width: inputs.width,
                    height: inputs.height,
                    subdivisions: inputs.subdivisions,
                    updatable: false,

                },
                this.context.scene,
            );
            ground.isPickable = false;
            ground.material = groundMaterial;
            return ground;
        } catch (e) {
            console.log("Error happened: ", e);
            return new BABYLON.Mesh("error-ground", this.context.scene);
        }
    }

    /**
     * Builds drawing options for points, lines, polylines, curves, surfaces and JSCAD meshes:
     * colors, size, opacity, two-sided rendering and arrow heads on lines, with defaults for what
     * is left out.
     * @param inputs - The options to start from
     * @returns The drawing options
     * @group options
     * @shortname simple
     * @example
     * ```typescript
     * const options = bitbybit.draw.optionsSimple({ colours: "#ff0000", size: 2, opacity: 1, updatable: false, hidden: false, drawTwoSided: true, backFaceColour: "#0000ff", backFaceOpacity: 1, colorMapStrategy: Bit.Inputs.Base.colorMapStrategyEnum.lastColorRemainder, arrowSize: 0, arrowAngle: 15 });
     * ```
     */
    optionsSimple(inputs: Inputs.Draw.DrawBasicGeometryOptions): Inputs.Draw.DrawBasicGeometryOptions {
        return inputs;
    }

    /**
     * Builds the full drawing options for OCCT shapes: meshing precision, face, edge and vertex
     * colors and sizes, index labels, arrows on edges, two-sided rendering and the triangulation
     * cache, with defaults for what is left out.
     * @param inputs - The options to start from
     * @returns The drawing options
     * @group options
     * @shortname occt shape
     * @example
     * ```typescript
     * const options = bitbybit.draw.optionsOcctShape({ faceOpacity: 1, edgeOpacity: 1, edgeColour: "#ffffff", faceColour: "#ff0000", edgeWidth: 2, drawEdges: true, drawFaces: true, drawVertices: false, vertexColour: "#ff00ff", vertexSize: 0.03, precision: 0.01, drawEdgeIndexes: false, edgeIndexHeight: 0.06, edgeIndexColour: "#ff00ff", drawFaceIndexes: false, faceIndexHeight: 0.06, faceIndexColour: "#0000ff", drawTwoSided: true, backFaceColour: "#0000ff", backFaceOpacity: 1, edgeArrowSize: 0, edgeArrowAngle: 15, keepMeshData: false, allowQualityDecrease: true, forceFaceDeflection: false });
     * ```
     */
    optionsOcctShape(inputs: Inputs.Draw.DrawOcctShapeOptions): Inputs.Draw.DrawOcctShapeOptions {
        return inputs;
    }

    /**
     * Builds the most used drawing options for OCCT shapes, precision, face and edge colors and
     * two-sided rendering, with defaults for what is left out.
     * @param inputs - The options to start from
     * @returns The drawing options
     * @group options
     * @shortname occt shape simple
     * @example
     * ```typescript
     * const options = bitbybit.draw.optionsOcctShapeSimple({ precision: 0.01, drawFaces: true, faceColour: "#ff0000", drawEdges: true, edgeColour: "#ffffff", edgeWidth: 2, drawTwoSided: true, backFaceColour: "#0000ff", backFaceOpacity: 1 });
     * ```
     */
    optionsOcctShapeSimple(inputs: Inputs.Draw.DrawOcctShapeSimpleOptions): Inputs.Draw.DrawOcctShapeSimpleOptions {
        return inputs;
    }

    /**
     * Builds drawing options for OCCT shapes whose faces use a full engine material, as
     * `createPBRMaterial` makes one, plus the precision and edge style.
     * @param inputs - The options to start from
     * @returns The drawing options
     * @group options
     * @shortname occt shape with material
     * @example
     * ```typescript
     * const material = bitbybit.draw.createPBRMaterial({ name: "steel", baseColor: "#c0c0c0", metallic: 1, roughness: 0.4, alpha: 1, emissiveColor: "#000000", emissiveIntensity: 1, zOffset: 0, zOffsetUnits: 0, alphaMode: Bit.Inputs.Draw.alphaModeEnum.opaque, alphaCutoff: 0.5, doubleSided: false, wireframe: false, unlit: false });
     * const options = bitbybit.draw.optionsOcctShapeMaterial({ precision: 0.01, faceMaterial: material, drawEdges: true, edgeColour: "#ffffff", edgeWidth: 2 });
     * ```
     */
    optionsOcctShapeMaterial(inputs: Inputs.Draw.DrawOcctShapeMaterialOptions): Inputs.Draw.DrawOcctShapeMaterialOptions {
        return inputs;
    }

    /**
     * Builds drawing options for Manifold solids and cross-sections: face color or a full engine
     * material, the line style of cross-sections, normals and the two-sided rendering.
     * @param inputs - The options to start from
     * @returns The drawing options
     * @group options
     * @shortname manifold shape draw options
     * @example
     * ```typescript
     * const options = bitbybit.draw.optionsManifoldShapeMaterial({ faceOpacity: 1, faceColour: "#ff0000", faceMaterial: material, crossSectionColour: "#ff00ff", crossSectionWidth: 2, crossSectionOpacity: 1, computeNormals: false, drawTwoSided: true, backFaceColour: "#0000ff", backFaceOpacity: 1 });
     * const drawn = await bitbybit.draw.drawAnyAsync({ entity: solid, options });
     * ```
     */
    optionsManifoldShapeMaterial(inputs: Inputs.Draw.DrawManifoldOrCrossSectionOptions): Inputs.Draw.DrawManifoldOrCrossSectionOptions {
        return inputs;
    }

    /**
     * Builds drawing options for transform nodes, which are drawn as a triad of colored axis lines
     * of a given length.
     * @param inputs - The options to start from
     * @returns The drawing options
     * @group options
     * @shortname babylon node
     * @example
     * ```typescript
     * const options = bitbybit.draw.optionsBabylonNode({ colorX: "#0000ff", colorY: "#00ff00", colorZ: "#ff0000", size: 2 });
     * const drawn = await bitbybit.draw.drawAnyAsync({ entity: node, options });
     * ```
     */
    optionsBabylonNode(inputs: Inputs.Draw.DrawNodeOptions): Inputs.Draw.DrawNodeOptions {
        return inputs;
    }

    /**
     * Creates an image texture from a URL for the texture slots of `createPBRMaterial`, with
     * tiling, offset, rotation and filtering that mean the same in every renderer.
     * @param inputs - The image URL and the tiling, offset, rotation, flip and sampling options
     * @returns The engine's texture
     * @group material
     * @shortname create texture
     * @disposableOutput true
     * @example
     * ```typescript
     * const texture = bitbybit.draw.createTexture({ url: "https://example.com/wood.jpg", name: "wood", uScale: 2, vScale: 2, uOffset: 0, vOffset: 0, wAng: 0, invertY: false, invertZ: false, samplingMode: Bit.Inputs.Draw.samplingModeEnum.trilinear });
     * ```
     */
    createTexture(inputs: Inputs.Draw.GenericTextureDto): BABYLON.Texture {
        const samplingMode = this.getSamplingMode(inputs.samplingMode);
        const texture = new BABYLON.Texture(
            inputs.url,
            this.context.scene,
            false,
            inputs.invertY,
            samplingMode
        );

        texture.name = inputs.name;
        texture.uOffset = inputs.uOffset || 0;
        texture.vOffset = inputs.vOffset || 0;
        texture.uScale = inputs.uScale || 1;
        texture.vScale = inputs.vScale || 1;
        texture.wAng = inputs.wAng || 0;

        return texture;
    }

    /**
     * Creates a physically based material from settings that mean the same in every renderer: base
     * color, metallic and roughness, opacity, emissive glow, the texture slots and the alpha and
     * side options; put it in the `faceMaterial` of the drawing options.
     * @param inputs - The name, colors, metallic and roughness values, opacity, textures and rendering options
     * @returns The engine's material
     * @group material
     * @shortname create pbr material
     * @disposableOutput true
     * @example
     * ```typescript
     * const material = bitbybit.draw.createPBRMaterial({ name: "steel", baseColor: "#c0c0c0", metallic: 1, roughness: 0.4, alpha: 1, emissiveColor: "#000000", emissiveIntensity: 1, zOffset: 0, zOffsetUnits: 0, alphaMode: Bit.Inputs.Draw.alphaModeEnum.opaque, alphaCutoff: 0.5, doubleSided: false, wireframe: false, unlit: false });
     * const options = bitbybit.draw.optionsOcctShapeMaterial({ precision: 0.01, faceMaterial: material, drawEdges: true, edgeColour: "#ffffff", edgeWidth: 2 });
     * ```
     */
    createPBRMaterial(inputs: Inputs.Draw.GenericPBRMaterialDto): BABYLON.PBRMetallicRoughnessMaterial {
        const mat = new BABYLON.PBRMetallicRoughnessMaterial(inputs.name, this.context.scene);

        if (inputs.baseColor) {
            mat.baseColor = BABYLON.Color3.FromHexString(inputs.baseColor);
        }
        mat.metallic = inputs.metallic || 1;
        mat.roughness = inputs.roughness || 1;
        mat.alpha = inputs.alpha;

        if (inputs.emissiveColor) {
            const emissive = BABYLON.Color3.FromHexString(inputs.emissiveColor);
            if (inputs.emissiveIntensity !== undefined) {
                mat.emissiveColor = emissive.scale(inputs.emissiveIntensity);
            } else {
                mat.emissiveColor = emissive;
            }
        }

        if (inputs.baseColorTexture) {
            mat.baseTexture = inputs.baseColorTexture as BABYLON.BaseTexture;
        }
        if (inputs.metallicRoughnessTexture) {
            mat.metallicRoughnessTexture = inputs.metallicRoughnessTexture as BABYLON.BaseTexture;
        }
        if (inputs.normalTexture) {
            mat.normalTexture = inputs.normalTexture as BABYLON.BaseTexture;
        }
        if (inputs.emissiveTexture) {
            mat.emissiveTexture = inputs.emissiveTexture as BABYLON.BaseTexture;
        }
        if (inputs.occlusionTexture) {
            mat.occlusionTexture = inputs.occlusionTexture as BABYLON.BaseTexture;
        }

        if (inputs.alphaCutoff !== undefined) {
            mat.alphaCutOff = inputs.alphaCutoff;
        }

        if (inputs.alphaMode !== undefined) {
            switch (inputs.alphaMode) {
                case Inputs.Draw.alphaModeEnum.opaque:
                    mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_OPAQUE;
                    break;
                case Inputs.Draw.alphaModeEnum.mask:
                    mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHATEST;
                    break;
                case Inputs.Draw.alphaModeEnum.blend:
                    mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
                    break;
            }
        }

        if (inputs.doubleSided !== undefined) {
            mat.doubleSided = inputs.doubleSided;
        }

        if (inputs.unlit) {
            mat.disableLighting = true;
        }

        return mat;
    }

    private getSamplingMode(mode: Inputs.Draw.samplingModeEnum): number {
        switch (mode) {
            case Inputs.Draw.samplingModeEnum.nearest:
                return BABYLON.Texture.NEAREST_SAMPLINGMODE;
            case Inputs.Draw.samplingModeEnum.bilinear:
                return BABYLON.Texture.BILINEAR_SAMPLINGMODE;
            case Inputs.Draw.samplingModeEnum.trilinear:
                return BABYLON.Texture.TRILINEAR_SAMPLINGMODE;
            default:
                return BABYLON.Texture.TRILINEAR_SAMPLINGMODE;
        }
    }

    private handleTags(inputs: Inputs.Draw.DrawAny): Inputs.Draw.DrawnTags {
        const options = inputs.options ? inputs.options : {
            updatable: false,
        };
        const result = this.tag.drawTags({
            tagsVariable: inputs.babylonMesh as any,
            tags: inputs.entity as Inputs.Tag.TagDto[],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });

        const drawnTags = result as Inputs.Draw.DrawnTags;
        const tagsMetadata = { type: Inputs.Draw.drawingTypes.tags, options };
        drawnTags.forEach(drawnTag => { drawnTag.metadata = tagsMetadata; });
        drawnTags.metadata = tagsMetadata;
        return drawnTags;
    }

    private handleTag(inputs: Inputs.Draw.DrawAny): Inputs.Draw.DrawnTag {
        let options = inputs.options ? inputs.options : {
            updatable: false,
        };
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = this.tag.drawTag({
            tagVariable: inputs.babylonMesh as any,
            tag: inputs.entity as Inputs.Tag.TagDto,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        const drawnTag = result as Inputs.Draw.DrawnTag;
        drawnTag.metadata = { type: Inputs.Draw.drawingTypes.tag, options };
        return drawnTag;
    }

    private handleVerbSurfaces(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = this.drawHelper.drawSurfacesMultiColour({
            surfacesMesh: inputs.babylonMesh,
            surfaces: inputs.entity as Inputs.Base.VerbSurface[],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.verbSurfaces, options, result);
        return result;
    }

    private handleVerbCurves(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;

        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = this.drawHelper.drawCurves({
            curvesMesh: inputs.babylonMesh as BABYLON.GreasedLineMesh,
            curves: inputs.entity as Inputs.Base.VerbCurve[],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });

        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.verbCurves, options, result);
        return result;
    }

    private handleNodes(inputs: Inputs.Draw.DrawAny): BABYLON.TransformNode[] {
        let options = inputs.options ? inputs.options : this.defaultNodeOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = inputs.entity as BABYLON.TransformNode[];
        const existing = new Map(result.map(node => [node, new Set(node.getChildMeshes())]));
        this.node.drawNodes({
            nodes: result,
            ...options as Inputs.Draw.DrawNodeOptions
        });
        result.forEach(node => {
            const before = existing.get(node)!;
            const triad = node.getChildMeshes().filter(m => !before.has(m));
            this.applyNodeSettingsAndMetadata(Inputs.Draw.drawingTypes.nodes, options, node, triad);
        });
        return result;
    }

    private handlePoints(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = this.drawHelper.drawPoints({
            pointsMesh: inputs.babylonMesh,
            points: inputs.entity as Inputs.Base.Point3[],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.points, options, result);
        return result;
    }

    private handleLines(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultPolylineOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const lines = inputs.entity as Inputs.Base.Line3[] | Inputs.Base.Segment3[];
        const pts: Inputs.Base.Point3[][] = [];
        if (lines && lines[0] && "start" in lines[0]) {
            (lines as Inputs.Base.Line3[]).forEach(e => {
                pts.push([e.start, e.end]);
            });
        } else {
            lines.forEach(line => {
                pts.push(line as Inputs.Base.Segment3);
            });
        }
        const result = this.drawHelper.drawPolylinesWithColours({
            polylinesMesh: inputs.babylonMesh as BABYLON.GreasedLineMesh,
            polylines: pts.map(e => ({ points: [...e] })),
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.lines, options, result);
        return result;
    }

    private handlePolylines(inputs: Inputs.Draw.DrawAny, type = Inputs.Draw.drawingTypes.polylines) {
        let options = inputs.options ? inputs.options : this.defaultPolylineOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = this.drawHelper.drawPolylinesWithColours({
            polylinesMesh: inputs.babylonMesh as BABYLON.GreasedLineMesh,
            polylines: inputs.entity as Inputs.Base.Polyline3[],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(type, options, result);
        return result;
    }

    private handleVerbSurface(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = this.drawHelper.drawSurface({
            surfaceMesh: inputs.babylonMesh,
            surface: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.verbSurface, options, result);
        return result;
    }

    private handleVerbCurve(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultPolylineOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = this.drawHelper.drawCurve({
            curveMesh: inputs.babylonMesh as BABYLON.GreasedLineMesh,
            curve: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.verbCurve, options, result);
        return result;
    }

    private handleNode(inputs: Inputs.Draw.DrawAny): BABYLON.TransformNode {
        let options = inputs.options ? inputs.options : this.defaultNodeOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = inputs.entity as BABYLON.TransformNode;
        const existing = new Set(result.getChildMeshes());
        this.node.drawNode({
            node: result,
            ...options as Inputs.Draw.DrawNodeOptions
        });
        const triad = result.getChildMeshes().filter(m => !existing.has(m));
        this.applyNodeSettingsAndMetadata(Inputs.Draw.drawingTypes.node, options, result, triad);
        return result;
    }

    /**
     * A JSCAD path drawn as the polyline it is.
     *
     * The path's points are two-dimensional and its closing segment is implied by `isClosed`, so
     * both are resolved before the polyline handler sees it - which then applies the same options,
     * metadata and update handling every other polyline gets.
     */
    private handleJscadPath(inputs: Inputs.Draw.DrawAny) {
        const points = this.pathToPolylinePoints(inputs.entity as Inputs.JSCAD.JSCADPath2);
        return this.handlePolyline({ ...inputs, entity: { points } }, Inputs.Draw.drawingTypes.jscadPath);
    }

    private handleJscadPaths(inputs: Inputs.Draw.DrawAny) {
        const paths = inputs.entity as Inputs.JSCAD.JSCADPath2[];
        const polylines = paths.map(path => ({ points: this.pathToPolylinePoints(path) }));
        return this.handlePolylines({ ...inputs, entity: polylines }, Inputs.Draw.drawingTypes.jscadPaths);
    }

    private handlePolyline(inputs: Inputs.Draw.DrawAny, type = Inputs.Draw.drawingTypes.polyline) {
        let options = inputs.options ? inputs.options : this.defaultPolylineOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = this.drawHelper.drawPolylineClose({
            polylineMesh: inputs.babylonMesh as BABYLON.GreasedLineMesh,
            polyline: inputs.entity as Inputs.Base.Polyline3,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(type, options, result);
        return result;
    }

    private handlePoint(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const result = this.drawHelper.drawPoint({
            pointMesh: inputs.babylonMesh,
            point: inputs.entity as Inputs.Base.Point3,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.point, options, result);
        return result;
    }

    private handleLine(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultPolylineOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        const line = inputs.entity as Inputs.Base.Line3 | Inputs.Base.Segment3;
        const pts: Inputs.Base.Point3[] = [];
        if (line && "start" in line) {
            pts.push((line).start, (line).end);
        } else {
            pts.push(...line);
        }
        const result = this.drawHelper.drawPolylinesWithColours({
            polylinesMesh: inputs.babylonMesh as BABYLON.GreasedLineMesh,
            polylines: [{ points: pts }],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.line, options, result);
        return result;
    }

    private handleJscadMeshes(inputs: Inputs.Draw.DrawAny, meshes: (Inputs.JSCAD.JSCADGeom2 | Inputs.JSCAD.JSCADGeom3)[]) {
        let options = inputs.options ? inputs.options : this.defaultPolylineOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return this.drawHelper.drawSolidOrPolygonMeshes({
            jscadMesh: inputs.babylonMesh,
            meshes,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.jscadMeshes, options, r);
            return r;
        });
    }

    private handleManifoldShape(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : new Inputs.Manifold.DrawManifoldOrCrossSectionDto(inputs.entity);
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return this.drawHelper.drawManifoldOrCrossSection({
            manifoldOrCrossSection: inputs.entity as Inputs.Manifold.ManifoldPointer,
            ...new Inputs.Draw.DrawManifoldOrCrossSectionOptions(),
            ...options as Inputs.Draw.DrawManifoldOrCrossSectionOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.manifold, options, r);
            return r as BABYLON.Mesh;
        });
    }

    private handleManifoldShapes(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : new Inputs.Manifold.DrawManifoldOrCrossSectionDto(inputs.entity);
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return this.drawHelper.drawManifoldsOrCrossSections({
            manifoldsOrCrossSections: inputs.entity as Inputs.Manifold.ManifoldPointer[],
            ...new Inputs.Manifold.DrawManifoldOrCrossSectionDto(),
            ...options as Inputs.Draw.DrawManifoldOrCrossSectionOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.manifold, options, r);
            return r;
        });
    }

    private handleOcctShape(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : new Inputs.Draw.DrawOcctShapeOptions();
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return this.drawHelper.drawShape({
            shape: inputs.entity as Inputs.OCCT.TopoDSShapePointer,
            ...new Inputs.Draw.DrawOcctShapeOptions(),
            ...options as Inputs.Draw.DrawOcctShapeOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.occt, options, r);
            return r;
        });
    }

    private handleOcctShapes(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : new Inputs.Draw.DrawOcctShapeOptions();
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return this.drawHelper.drawShapes({
            shapes: inputs.entity as Inputs.OCCT.TopoDSShapePointer[],
            ...new Inputs.Draw.DrawOcctShapeOptions(),
            ...options as Inputs.Draw.DrawOcctShapeOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.occt, options, r);
            return r;
        });
    }

    private handleJscadMesh(inputs: Inputs.Draw.DrawAny, mesh: Inputs.JSCAD.JSCADGeom2 | Inputs.JSCAD.JSCADGeom3) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return this.drawHelper.drawSolidOrPolygonMesh({
            jscadMesh: inputs.babylonMesh,
            mesh,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.jscadMesh, options, r);
            return r;
        });
    }

    /**
     * The settings a drawn node can carry, which is not the set a drawn mesh can.
     *
     * Drawing a node parents an axis triad to it: the node itself is not geometry, so pickability,
     * casting shadows and receiving them belong to the lines the triad is made of rather than to the
     * node. Sending a node through the mesh path instead writes members onto an object that has none
     * and registers a non-mesh as a shadow caster, which the shadow map then walks as geometry.
     *
     * The settings reach the triad only, which is why the caller passes it rather than letting this
     * ask the node for its meshes. Any transform node can be drawn - a loaded model hangs its whole
     * mesh tree off one - and asking the node would take the model with it, making every mesh in it
     * unpickable and re-registering all of them as shadow casters, because a draw call was made
     * about the node they happen to be parented to.
     */
    private applyNodeSettingsAndMetadata(type: Inputs.Draw.drawingTypes, options: Inputs.Draw.DrawOptions, node: BABYLON.TransformNode, meshes: BABYLON.AbstractMesh[]) {
        const typemeta = { type, options };
        const sgs = this.context.scene.metadata.shadowGenerators as BABYLON.ShadowGenerator[];

        meshes.forEach(m => { m.isPickable = false; });

        const shadowsEnabled = !(node.metadata && node.metadata.shadows === false);
        if (shadowsEnabled && sgs.length > 0) {
            meshes.forEach(m => {
                m.receiveShadows = true;
                sgs.forEach(sg => sg.addShadowCaster(m));
            });
        }

        node.metadata = node.metadata ? { ...node.metadata, ...typemeta } : typemeta;
    }

    private applyGlobalSettingsAndMetadataAndShadowCasting(type: Inputs.Draw.drawingTypes, options: Inputs.Draw.DrawOptions, result: BABYLON.Mesh | undefined) {
        if (result) {
            const typemeta = { type, options };
            const sgs = this.context.scene.metadata.shadowGenerators as BABYLON.ShadowGenerator[];

            result.isPickable = false;
            result.getChildMeshes().forEach(m => { m.isPickable = false; });

            let shadowsEnabled = true;
            if (result.metadata && result.metadata.shadows === false) {
                shadowsEnabled = false;
            }
            if (shadowsEnabled) {
                if (sgs.length > 0) {
                    result.receiveShadows = true;
                    sgs.forEach(sg => sg.addShadowCaster(result));
                    result.getChildMeshes().forEach(m => {
                        m.receiveShadows = true;
                        sgs.forEach(sg => sg.addShadowCaster(m));
                    });
                }
            }
            result.metadata = result.metadata ? { ...result.metadata, ...typemeta } : typemeta;
        }
    }

}
