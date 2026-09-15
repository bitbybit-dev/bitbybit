import * as pc from "playcanvas";
import { DrawCore, Tag } from "@bitbybit-dev/core";
import * as Inputs from "../inputs";
import { Base } from "@bitbybit-dev/core/lib/api/inputs/base-inputs";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import { GEOMETRY_DEFAULTS, DEFAULT_COLORS } from "../constants";

type BitByBitEntity = Inputs.Draw.BitByBitEntity;

interface TextureTransformData {
    uScale: number;
    vScale: number;
    uOffset: number;
    vOffset: number;
    wAng: number;
    invertZ: boolean;
}

type TextureWithTransform = pc.Texture & { _bitbybitTransform?: TextureTransformData };

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
        size: GEOMETRY_DEFAULTS.LINE_WIDTH,
        colours: DEFAULT_COLORS.POLYLINE,
    };

    constructor(
        public readonly drawHelper: DrawHelper,
        public readonly context: Context,
        public readonly tag: Tag
    ) {
        super();
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
     * @example
     * ```typescript
     * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
     * const options = bitbybit.draw.optionsOcctShapeSimple({ precision: 0.01, drawFaces: true, faceColour: "#ff0000", drawEdges: true, edgeColour: "#ffffff", edgeWidth: 2, drawTwoSided: true, backFaceColour: "#0000ff", backFaceOpacity: 1 });
     * const drawn = await bitbybit.draw.drawAnyAsync({ entity: box, options });
     * ```
     */
    async drawAnyAsync<E extends Inputs.Draw.Entity>(
        inputs: Inputs.Draw.DrawAny<pc.Entity, E>,
    ): Promise<Inputs.Draw.Drawn<E, Inputs.Draw.BitByBitEntity>> {
        return await this.drawResolvedAsync(inputs) as Inputs.Draw.Drawn<E, Inputs.Draw.BitByBitEntity>;
    }

    /**
     * Every branch of the asynchronous dispatch, typed as what it can actually produce.
     *
     * A package that adds entity kinds overrides this rather than the public signature: two
     * unresolved conditional types over the same `E` have no provable relation to each other, so a
     * narrower override of `drawAnyAsync` cannot typecheck however correct it is.
     * @ignore true
     */
    private cachedSyncHandlers: Record<string, (inputs: Inputs.Draw.DrawAny<pc.Entity>) => Inputs.Draw.DrawnEntity> | undefined;

    /**
     * What this renderer draws each synchronous kind with, keyed by the kind's name in the ordered
     * table. A kind absent from here is one this renderer does not draw, and the walk skips it.
     * @ignore true
     */
    private syncHandlers(): Record<string, (inputs: Inputs.Draw.DrawAny<pc.Entity>) => Inputs.Draw.DrawnEntity> {
        return this.cachedSyncHandlers ??= {
            line: (i) => this.handleLine(i),
            point: (i) => this.handlePoint(i),
            jscadPath: (i) => this.handleJscadPath(i),
            polyline: (i) => this.handlePolyline(i),
            verbCurve: (i) => this.handleVerbCurve(i),
            verbSurface: (i) => this.handleVerbSurface(i),
            jscadPaths: (i) => this.handleJscadPaths(i),
            polylines: (i) => this.handlePolylines(i),
            lines: (i) => this.handleLines(i),
            points: (i) => this.handlePoints(i),
            verbCurves: (i) => this.handleVerbCurves(i),
            verbSurfaces: (i) => this.handleVerbSurfaces(i),
            tag: (i) => this.handleTag(i),
            tags: (i) => this.handleTags(i),
        };
    }

    private cachedAsyncHandlers: Record<string, (inputs: Inputs.Draw.DrawAny<pc.Entity>, entity: unknown) => Promise<Inputs.Draw.DrawnEntity>> | undefined;

    /**
     * The same for the kinds that have to cross to a worker and back.
     *
     * The two JSCAD entries ask their own check again rather than asserting: a handler that takes the
     * narrowed entity can only be given one honestly, and re-running a check the table just ran is
     * cheaper than a cast that could be wrong.
     * @ignore true
     */
    private asyncHandlers(): Record<string, (inputs: Inputs.Draw.DrawAny<pc.Entity>, entity: unknown) => Promise<Inputs.Draw.DrawnEntity>> {
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

    protected async drawResolvedAsync(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<Inputs.Draw.DrawnEntity> {
        if (!this.isValidDrawInput(inputs.entity)) {
            return Promise.resolve(undefined);
        }
        
        const entity = inputs.entity;
        const handlers = this.asyncHandlers();
        const kind = this.resolveDrawableKind(entity, "async", (k) => k in handlers);
        if (kind) {
            return handlers[kind]!(inputs, entity);
        }
        return Promise.resolve(this.drawResolved(inputs));
    }

    private handleDecomposedMeshShape(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            const merged = { ...new Inputs.Draw.DrawOcctShapeOptions(), ...options as Inputs.Draw.DrawOcctShapeOptions };
            return this.drawHelper.handleDecomposedMesh(
                merged,
                inputs.entity as unknown as Inputs.OCCT.DecomposedMeshDto,
                merged
            );
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleDecomposedMeshes(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), async (options) => {
            const merged = { ...new Inputs.Draw.DrawOcctShapeOptions(), ...options as Inputs.Draw.DrawOcctShapeOptions };
            const decomposedMeshes = inputs.entity as unknown as Inputs.OCCT.DecomposedMeshDto[];
            const drawn = await Promise.all(decomposedMeshes.map(dm => this.drawHelper.handleDecomposedMesh(
                merged, dm, merged)));
            const container = new pc.Entity("decomposedMeshesContainer");
            const scene = drawn.find(entity => entity)?.parent;
            if (scene) { scene.addChild(container); }
            drawn.forEach(entity => { if (entity) { container.addChild(entity); } });
            return container;
        }, Inputs.Draw.drawingTypes.occtShapes);
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
        inputs: Inputs.Draw.DrawAny<pc.Entity, E>,
    ): Inputs.Draw.Drawn<E, Inputs.Draw.BitByBitEntity> {
        return this.drawResolved(inputs) as Inputs.Draw.Drawn<E, Inputs.Draw.BitByBitEntity>;
    }

    /**
     * Every branch of the synchronous dispatch, typed as what it can actually produce. Overridden
     * instead of the public signature, for the reason given on its asynchronous twin.
     * @ignore true
     */
    protected drawResolved(inputs: Inputs.Draw.DrawAny<pc.Entity>): Inputs.Draw.DrawnEntity {
        if (!this.isValidDrawInput(inputs.entity)) {
            return undefined;
        }
        
        let result;
        const entity = inputs.entity;
        if (!inputs.group && !(inputs.entity instanceof pc.Entity)) {
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
    createTexture(inputs: Inputs.Draw.GenericTextureDto): pc.Texture {
        const app = this.context.app;
        
        const texture = new pc.Texture(app.graphicsDevice, {
            name: inputs.name,
            addressU: pc.ADDRESS_REPEAT,
            addressV: pc.ADDRESS_REPEAT,
            flipY: !inputs.invertY,
        });
        
        (texture as pc.Texture & { _bitbybitTransform?: TextureTransformData })._bitbybitTransform = {
            uScale: inputs.uScale,
            vScale: inputs.vScale,
            uOffset: inputs.uOffset,
            vOffset: inputs.vOffset,
            wAng: inputs.wAng,
            invertZ: inputs.invertZ,
        };
        
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            texture.setSource(image);
            
            switch (inputs.samplingMode) {
                case Inputs.Draw.samplingModeEnum.nearest:
                    texture.minFilter = pc.FILTER_NEAREST;
                    texture.magFilter = pc.FILTER_NEAREST;
                    break;
                case Inputs.Draw.samplingModeEnum.bilinear:
                    texture.minFilter = pc.FILTER_LINEAR;
                    texture.magFilter = pc.FILTER_LINEAR;
                    break;
                case Inputs.Draw.samplingModeEnum.trilinear:
                    texture.minFilter = pc.FILTER_LINEAR_MIPMAP_LINEAR;
                    texture.magFilter = pc.FILTER_LINEAR;
                    break;
            }
        };
        image.src = inputs.url;
        
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
    createPBRMaterial(inputs: Inputs.Draw.GenericPBRMaterialDto): pc.StandardMaterial {
        const mat = new pc.StandardMaterial();
        mat.name = inputs.name;
        
        const baseColor = this.hexToRgb(inputs.baseColor);
        mat.diffuse = new pc.Color(baseColor.r, baseColor.g, baseColor.b);
        
        mat.metalness = inputs.metallic;
        mat.gloss = 1 - inputs.roughness;
        mat.useMetalness = true;
        mat.opacity = inputs.alpha;
        
        if (inputs.emissiveColor) {
            const emissive = this.hexToRgb(inputs.emissiveColor);
            mat.emissive = new pc.Color(emissive.r, emissive.g, emissive.b);
            mat.emissiveIntensity = inputs.emissiveIntensity;
        }
        
        mat.cull = inputs.doubleSided ? pc.CULLFACE_NONE : pc.CULLFACE_BACK;
        
        if (inputs.zOffset !== 0) {
            mat.depthBias = inputs.zOffset;
            mat.slopeDepthBias = inputs.zOffsetUnits;
        }
        
        if (inputs.baseColorTexture) {
            mat.diffuseMap = inputs.baseColorTexture as pc.Texture;
            this.applyTextureTransform(mat, inputs.baseColorTexture as TextureWithTransform, "diffuseMap");
        }
        if (inputs.metallicRoughnessTexture) {
            mat.metalnessMap = inputs.metallicRoughnessTexture as pc.Texture;
            mat.glossMap = inputs.metallicRoughnessTexture as pc.Texture;
            this.applyTextureTransform(mat, inputs.metallicRoughnessTexture as TextureWithTransform, "metalnessMap");
        }
        if (inputs.normalTexture) {
            mat.normalMap = inputs.normalTexture as pc.Texture;
            this.applyTextureTransform(mat, inputs.normalTexture as TextureWithTransform, "normalMap");
        }
        if (inputs.emissiveTexture) {
            mat.emissiveMap = inputs.emissiveTexture as pc.Texture;
            this.applyTextureTransform(mat, inputs.emissiveTexture as TextureWithTransform, "emissiveMap");
        }
        if (inputs.occlusionTexture) {
            mat.aoMap = inputs.occlusionTexture as pc.Texture;
            this.applyTextureTransform(mat, inputs.occlusionTexture as TextureWithTransform, "aoMap");
        }
        
        switch (inputs.alphaMode) {
            case Inputs.Draw.alphaModeEnum.opaque:
                mat.blendType = pc.BLEND_NONE;
                break;
            case Inputs.Draw.alphaModeEnum.mask:
                mat.blendType = pc.BLEND_NONE;
                mat.alphaTest = inputs.alphaCutoff;
                break;
            case Inputs.Draw.alphaModeEnum.blend:
                mat.blendType = pc.BLEND_NORMAL;
                break;
        }
        
        mat.update();
        return mat;
    }

    /**
     * Applies UV transformation data from a texture to the corresponding material properties.
     * PlayCanvas handles UV transforms at the material level per texture slot.
     * @param mat - The material to apply transforms to
     * @param texture - The texture with potential transform metadata
     * @param mapType - The type of texture map (e.g., "diffuseMap", "normalMap")
     */
    private applyTextureTransform(
        mat: pc.StandardMaterial, 
        texture: TextureWithTransform, 
        mapType: "diffuseMap" | "normalMap" | "emissiveMap" | "metalnessMap" | "aoMap"
    ): void {
        const transform = texture._bitbybitTransform;
        if (!transform) {
            return;
        }

        const propertyMap: Record<string, string> = {
            "diffuseMap": "diffuseMap",
            "normalMap": "normalMap",
            "emissiveMap": "emissiveMap",
            "metalnessMap": "metalnessMap",
            "aoMap": "aoMap",
        };
        
        const prefix = propertyMap[mapType];
        if (!prefix) {
            return;
        }

        const vScaleMultiplier = transform.invertZ ? -1 : 1;
        (mat as unknown as Record<string, pc.Vec2>)[`${prefix}Tiling`] = new pc.Vec2(
            transform.uScale, 
            transform.vScale * vScaleMultiplier
        );
        
        (mat as unknown as Record<string, pc.Vec2>)[`${prefix}Offset`] = new pc.Vec2(
            transform.uOffset, 
            transform.vOffset
        );
        
        (mat as unknown as Record<string, number>)[`${prefix}Rotation`] = transform.wAng;
    }

    /**
     * Helper method to convert hex color string to RGB values (0-1 range)
     */
    private hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return {
                r: parseInt(result[1]!, 16) / 255,
                g: parseInt(result[2]!, 16) / 255,
                b: parseInt(result[3]!, 16) / 255
            };
        }
        return { r: 0, g: 0, b: 1 };
    }

    private handleJscadMesh(inputs: Inputs.Draw.DrawAny<pc.Entity>, mesh: Inputs.JSCAD.JSCADGeom2 | Inputs.JSCAD.JSCADGeom3): Promise<pc.Entity> {
        return this.handleAsync(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSolidOrPolygonMesh({
                jscadMesh: inputs.group,
                mesh,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.jscadMesh);
    }

    private handleJscadMeshes(inputs: Inputs.Draw.DrawAny<pc.Entity>, meshes: (Inputs.JSCAD.JSCADGeom2 | Inputs.JSCAD.JSCADGeom3)[]): Promise<pc.Entity> {
        return this.handleAsync(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSolidOrPolygonMeshes({
                jscadMesh: inputs.group,
                meshes,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.jscadMeshes);
    }

    private handleManifoldShape(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity | undefined> {
        return this.handleAsync(inputs, new Inputs.Manifold.DrawManifoldOrCrossSectionDto(inputs.entity), (options) => {
            return this.drawHelper.drawManifoldOrCrossSection({
                manifoldOrCrossSection: inputs.entity as Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer,
                ...new Inputs.Draw.DrawManifoldOrCrossSectionOptions(),
                ...options as Inputs.Draw.DrawManifoldOrCrossSectionOptions
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleManifoldShapes(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Manifold.DrawManifoldOrCrossSectionDto(inputs.entity), (options) => {
            return this.drawHelper.drawManifoldsOrCrossSections({
                manifoldsOrCrossSections: inputs.entity as (Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer)[],
                ...new Inputs.Draw.DrawManifoldOrCrossSectionOptions(),
                ...options as Inputs.Draw.DrawManifoldOrCrossSectionOptions
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleOcctShape(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShape({
                shape: inputs.entity as Inputs.OCCT.TopoDSShapePointer,
                ...new Inputs.Draw.DrawOcctShapeOptions(),
                ...options as Inputs.Draw.DrawOcctShapeOptions
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleOcctShapes(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShapes({
                shapes: inputs.entity as Inputs.OCCT.TopoDSShapePointer[],
                ...new Inputs.Draw.DrawOcctShapeOptions(),
                ...options as Inputs.Draw.DrawOcctShapeOptions
            });
        }, Inputs.Draw.drawingTypes.occtShapes);
    }

    private handleLine(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            const line = inputs.entity as Inputs.Base.Line3 | Inputs.Base.Segment3;
            const pts: Inputs.Base.Point3[] = [];
            if (line && "start" in line) {
                pts.push((line).start, (line).end);
            } else {
                pts.push(...line);
            }
            return this.drawHelper.drawPolylinesWithColours({
                polylinesMesh: inputs.group,
                polylines: [{ points: pts }],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.line);
    }

    private handlePoint(inputs: Inputs.Draw.DrawAny<pc.Entity>) {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawPoint({
                pointMesh: inputs.group,
                point: inputs.entity as Inputs.Base.Point3,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.point);
    }

    /**
     * A JSCAD path drawn as the polyline it is.
     *
     * The path's points are two-dimensional and its closing segment is implied by `isClosed`, so
     * both are resolved before the polyline handler sees it - which then applies the same options,
     * metadata and update handling every other polyline gets.
     */
    private handleJscadPath(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        const points = this.pathToPolylinePoints(inputs.entity as Inputs.JSCAD.JSCADPath2);
        return this.handlePolyline({ ...inputs, entity: { points } }, Inputs.Draw.drawingTypes.jscadPath);
    }

    private handleJscadPaths(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        const paths = inputs.entity as Inputs.JSCAD.JSCADPath2[];
        const polylines = paths.map(path => ({ points: this.pathToPolylinePoints(path) }));
        return this.handlePolylines({ ...inputs, entity: polylines }, Inputs.Draw.drawingTypes.jscadPaths);
    }

    private handlePolyline(inputs: Inputs.Draw.DrawAny<pc.Entity>, type = Inputs.Draw.drawingTypes.polyline): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPolylineClose({
                polylineMesh: inputs.group,
                polyline: inputs.entity as Inputs.Base.Polyline3,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, type);
    }

    private handleVerbCurve(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawCurve({
                curveMesh: inputs.group,
                curve: inputs.entity,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbCurve);
    }

    private handleVerbSurface(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSurface({
                surfaceMesh: inputs.group,
                surface: inputs.entity,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbSurface);
    }

    private handlePolylines(inputs: Inputs.Draw.DrawAny<pc.Entity>, type = Inputs.Draw.drawingTypes.polylines): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPolylinesWithColours({
                polylinesMesh: inputs.group,
                polylines: inputs.entity as Inputs.Base.Polyline3[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, type);
    }

    private handleLines(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
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
            return this.drawHelper.drawPolylinesWithColours({
                polylinesMesh: inputs.group,
                polylines: pts.map(e => ({ points: [...e] })),
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.lines);
    }

    private handlePoints(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawPoints({
                pointsMesh: inputs.group,
                points: inputs.entity as Inputs.Base.Point3[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.points);
    }

    private handleVerbCurves(inputs: Inputs.Draw.DrawAny<pc.Entity>) {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawCurves({
                curvesMesh: inputs.group,
                curves: inputs.entity as Base.VerbCurve[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbCurves);
    }

    private handleVerbSurfaces(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawSurfacesMultiColour({
                surfacesMesh: inputs.group,
                surfaces: inputs.entity as Base.VerbSurface[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbSurfaces);
    }

    private handleTag(inputs: Inputs.Draw.DrawAny<pc.Entity>): Inputs.Draw.DrawnTag {
        const options = this.resolveDrawOptions(inputs, { ...this.defaultBasicOptions, updatable: false });

        if (!this.isTagDto(inputs.entity)) {
            throw new Error("Entity must be a TagDto for drawTag operation");
        }

        const result = this.tag.drawTag({
            tagVariable: inputs.group && this.isTagDto(inputs.group) ? inputs.group : undefined,
            tag: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });

        return this.attachTagMetadata(result, Inputs.Draw.drawingTypes.tag, options);
    }

    private handleTags(inputs: Inputs.Draw.DrawAny<pc.Entity>): Inputs.Draw.DrawnTags {
        const options = this.resolveDrawOptions(inputs, { ...this.defaultBasicOptions, updatable: false });

        if (!this.isTagDtoArray(inputs.entity)) {
            throw new Error("Entity must be a TagDto array for drawTags operation");
        }

        const result = this.tag.drawTags({
            tagsVariable: inputs.group && this.isTagDtoArray(inputs.group) ? inputs.group : undefined,
            tags: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });

        const drawnTags = result.map(tag => this.attachTagMetadata(tag, Inputs.Draw.drawingTypes.tags, options)) as Inputs.Draw.DrawnTags;
        drawnTags.bitbybitMeta = { type: Inputs.Draw.drawingTypes.tags, options };
        return drawnTags;
    }

    private updateAny(inputs: Inputs.Draw.DrawAny<pc.Entity>): Inputs.Draw.DrawnEntity {
        let result;
        const group = inputs.group as BitByBitEntity;
        if (group && group.bitbybitMeta) {
            const type = group.bitbybitMeta.type;
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
                default:
                    break;
            }
        }
        return result;
    }

    /**
     * Handle synchronous drawing operations with proper option resolution
     * @param inputs - Draw inputs
     * @param defaultOptions - Default options for this geometry type
     * @param action - Function that performs the actual drawing
     * @param type - Geometry type for metadata
     * @returns Drawn entity
     */
    private handle(
        inputs: Inputs.Draw.DrawAny<pc.Entity>, 
        defaultOptions: Inputs.Draw.DrawOptions, 
        action: (options: Inputs.Draw.DrawOptions) => pc.Entity, 
        type: Inputs.Draw.drawingTypes
    ): pc.Entity {
        try {
            const options = this.resolveDrawOptions(inputs, defaultOptions);
            const result = action(options);
            
            if (result) {
                this.applyGlobalSettingsAndMetadataAndShadowCasting(type, options, result);
            }
            
            return result;
        } catch (error) {
            const typeName = Inputs.Draw.drawingTypes[type];
            console.error(`Error in sync draw operation for ${typeName}:`, error);
            throw error;
        }
    }

    /**
     * Handle async drawing operations with proper error handling
     * @param inputs - Draw inputs
     * @param defaultOptions - Default options for this geometry type
     * @param action - Async function that performs the actual drawing
     * @param type - Geometry type for metadata
     * @returns Promise resolving to drawn entity
     */
    private async handleAsync<T extends pc.Entity | undefined>(
        inputs: Inputs.Draw.DrawAny<pc.Entity>, 
        defaultOptions: Inputs.Draw.DrawOptions, 
        action: (options: Inputs.Draw.DrawOptions) => Promise<T>, 
        type: Inputs.Draw.drawingTypes
    ): Promise<T> {
        try {
            const options = this.resolveDrawOptions(inputs, defaultOptions);
            const result = await action(options);
            
            if (result) {
                this.applyGlobalSettingsAndMetadataAndShadowCasting(type, options, result);
            } else {
                console.warn(`Drawing operation returned null/undefined for type: ${Inputs.Draw.drawingTypes[type]}`);
            }
            
            return result;
        } catch (error) {
            const typeName = Inputs.Draw.drawingTypes[type];
            console.error(`Error in async draw operation for ${typeName}:`, error);
            
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to draw ${typeName}: ${errorMessage}`, { cause: error });
        }
    }

    private applyGlobalSettingsAndMetadataAndShadowCasting(type: Inputs.Draw.drawingTypes, options: Inputs.Draw.DrawOptions, result: pc.Entity | undefined) {
        if (result) {
            const bitByBitResult = result as BitByBitEntity;
            const typemeta: Inputs.Draw.BitByBitMeta = { type, options };
            bitByBitResult.bitbybitMeta = bitByBitResult.bitbybitMeta ? { ...bitByBitResult.bitbybitMeta, ...typemeta } : typemeta;
        }
    }

    /**
     * Extract options from inputs with proper fallback chain
     * @param inputs - Draw inputs
     * @param defaultOptions - Default options to use as fallback
     * @returns Resolved options
     */
    private resolveDrawOptions(
        inputs: Inputs.Draw.DrawAny<pc.Entity>,
        defaultOptions: Inputs.Draw.DrawOptions
    ): Inputs.Draw.DrawOptions {
        if (inputs.options) {
            return inputs.options;
        }
        
        const group = inputs.group as BitByBitEntity;
        if (group?.bitbybitMeta?.options) {
            return group.bitbybitMeta.options;
        }
        
        return defaultOptions;
    }

    /**
     * Attach BitByBit metadata to a drawn tag
     * @param tag - Tag the tag API drew
     * @param type - Drawing type
     * @param options - Draw options
     * @returns Tag with attached metadata
     */
    private attachTagMetadata(
        tag: Inputs.Tag.TagDto,
        type: Inputs.Draw.drawingTypes,
        options: Inputs.Draw.DrawOptions
    ): Inputs.Draw.DrawnTag {
        const drawnTag = tag as Inputs.Draw.DrawnTag;
        drawnTag.bitbybitMeta = { type, options };
        return drawnTag;
    }

}
