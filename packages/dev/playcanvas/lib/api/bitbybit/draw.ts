import * as pc from "playcanvas";
import type { Tag } from "@bitbybit-dev/core";
import { DrawCore } from "@bitbybit-dev/core";
import * as Inputs from "../inputs";
import type { Base } from "@bitbybit-dev/core/lib/api/inputs/base-inputs";
import type { Context } from "../context";
import type { DrawHelper } from "../draw-helper";
import { GEOMETRY_DEFAULTS, DEFAULT_COLORS } from "../constants";
import { messageOf, resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../resolved-inputs";
import type * as Models from "@bitbybit-dev/core/lib/api/models";

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
type TextureMapSlot = "diffuseMap" | "normalMap" | "emissiveMap" | "metalnessMap" | "aoMap";

/**
 * Drawing anything into the scene: kernel shapes, points, lines, polylines, frames, curves, meshes
 * and tags all go through `drawAnyAsync`, which picks the right renderer for the entity and returns
 * the drawn object. The `options` methods build the drawing options with defaults for each kind of
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
    private defaultFrameOptions = new Inputs.Draw.DrawFrameOptions();

    constructor(
        public readonly drawHelper: DrawHelper,
        public readonly context: Context,
        public readonly tag: Tag
    ) {
        super();
    }

    /**
     * Draws any entity the library produces into the scene and gives back the drawn object: kernel
     * shapes, alone or with their appearance, design builds, points, lines, polylines, frames,
     * curves, meshes, tags and nodes.
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

    private cachedSyncHandlers: Record<string, (inputs: Inputs.Draw.DrawAny<pc.Entity>) => Inputs.Draw.DrawnEntity> | undefined;

    private syncHandlers(): Record<string, (inputs: Inputs.Draw.DrawAny<pc.Entity>) => Inputs.Draw.DrawnEntity> {
        return this.cachedSyncHandlers ??= {
            line: (i) => this.handleLine(i),
            point: (i) => this.handlePoint(i),
            jscadPath: (i) => this.handleJscadPath(i),
            polyline: (i) => this.handlePolyline(i),
            frame: (i) => this.handleFrames(i),
            verbCurve: (i) => this.handleVerbCurve(i),
            verbSurface: (i) => this.handleVerbSurface(i),
            jscadPaths: (i) => this.handleJscadPaths(i),
            polylines: (i) => this.handlePolylines(i),
            frames: (i) => this.handleFrames(i),
            lines: (i) => this.handleLines(i),
            points: (i) => this.handlePoints(i),
            verbCurves: (i) => this.handleVerbCurves(i),
            verbSurfaces: (i) => this.handleVerbSurfaces(i),
            tag: (i) => this.handleTag(i),
            tags: (i) => this.handleTags(i),
        };
    }

    private cachedAsyncHandlers: Record<string, (inputs: Inputs.Draw.DrawAny<pc.Entity>, entity: unknown) => Promise<Inputs.Draw.DrawnEntity>> | undefined;

    private asyncHandlers(): Record<string, (inputs: Inputs.Draw.DrawAny<pc.Entity>, entity: unknown) => Promise<Inputs.Draw.DrawnEntity>> {
        return this.cachedAsyncHandlers ??= {
            jscadMesh: (i, e) => this.detectJscadMesh(e) ? this.handleJscadMesh(i, e) : Promise.resolve(undefined),
            occtShape: (i) => this.handleOcctShape(i),
            occtShapes: (i) => this.handleOcctShapes(i),
            occtShapeWithAppearance: (i) => this.handleShapeWithAppearance(i),
            occtShapesWithAppearance: (i) => this.handleShapesWithAppearance(i),
            designBuild: (i) => this.handleDesignBuild(i),
            jscadMeshes: (i, e) => this.detectJscadMeshes(e) ? this.handleJscadMeshes(i, e) : Promise.resolve(undefined),
            manifoldShape: (i) => this.handleManifoldShape(i),
            manifoldShapes: (i) => this.handleManifoldShapes(i),
            decomposedMeshes: (i) => this.handleDecomposedMeshes(i),
            decomposedMesh: (i) => this.handleDecomposedMeshShape(i),
        };
    }

    /**
     * Every branch of the asynchronous dispatch, typed as what it can actually produce.
     *
     * A package that adds entity kinds overrides this rather than the public signature: two
     * unresolved conditional types over the same `E` have no provable relation to each other, so a
     * narrower override of `drawAnyAsync` cannot typecheck however correct it is.
     * @ignore true
     */
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
            const merged = this.occtOptions(options);
            return this.drawHelper.handleDecomposedMesh(
                merged,
                inputs.entity as Inputs.OCCT.DecomposedMeshDto,
                merged
            );
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleDecomposedMeshes(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), async (options) => {
            const decomposedMeshes = inputs.entity as Inputs.OCCT.DecomposedMeshDto[];
            const merged = this.drawHelper.withSurfaceAnalysisRange(this.occtOptions(options), decomposedMeshes);
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
     * object: points, lines, polylines, frames, tags and nodes.
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
        return resolveDto(Inputs.Draw.DrawBasicGeometryOptions, inputs);
    }

    /**
     * Builds drawing options for frames: how long the axes are and their colors, whether the small
     * grid in the frame's plane is drawn and in which color, the line width and whether the frame
     * can be redrawn in place, with defaults for what is left out.
     * @param inputs - The options to start from
     * @returns The drawing options
     * @group options
     * @shortname frame
     * @example
     * ```typescript
     * const options = bitbybit.draw.optionsFrame({ size: 2, colorX: "#ff0000", colorY: "#00ff00", colorZ: "#0000ff", drawPlane: true, colorPlane: "#808080", lineWidth: 2, updatable: false });
     * const drawn = bitbybit.draw.drawAny({ entity: bitbybit.frame.world(), options });
     * ```
     */
    optionsFrame(inputs: Inputs.Draw.DrawFrameOptions): Inputs.Draw.DrawFrameOptions {
        return resolveDto(Inputs.Draw.DrawFrameOptions, inputs);
    }

    /**
     * Builds the full drawing options for OCCT shapes: meshing precision, face, edge and vertex
     * colors and sizes, index labels, arrows on edges, two-sided rendering, iso curves, a surface
     * analysis coloring the faces and the triangulation cache, with defaults for what is left out.
     * @param inputs - The options to start from
     * @returns The drawing options
     * @group options
     * @shortname occt shape
     * @example
     * ```typescript
     * const options = bitbybit.draw.optionsOcctShape({ faceOpacity: 1, edgeOpacity: 1, edgeColour: "#ffffff", faceColour: "#ff0000", edgeWidth: 2, drawEdges: true, drawFaces: true, drawVertices: false, vertexColour: "#ff00ff", vertexSize: 0.03, precision: 0.01, drawEdgeIndexes: false, edgeIndexHeight: 0.06, edgeIndexColour: "#ff00ff", drawFaceIndexes: false, faceIndexHeight: 0.06, faceIndexColour: "#0000ff", drawTwoSided: true, backFaceColour: "#0000ff", backFaceOpacity: 1, edgeArrowSize: 0, edgeArrowAngle: 15, keepMeshData: false, allowQualityDecrease: true, forceFaceDeflection: false, drawIsoCurves: true, isoCurvesU: 5, isoCurvesV: 5, isoCurvesColour: "#808080", surfaceAnalysis: Bit.Inputs.OCCT.surfaceAnalysisEnum.gaussian, draftDirection: [0, 1, 0] });
     * ```
     */
    optionsOcctShape(inputs: Inputs.Draw.DrawOcctShapeOptions): Inputs.Draw.DrawOcctShapeOptions {
        return resolveDto(Inputs.Draw.DrawOcctShapeOptions, inputs);
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
        const resolved = resolveDto(Inputs.Draw.GenericTextureDto, inputs) as Resolved.Draw.GenericTextureDto;
        const app = this.context.app;
        
        const texture = new pc.Texture(app.graphicsDevice, {
            name: resolved.name,
            addressU: pc.ADDRESS_REPEAT,
            addressV: pc.ADDRESS_REPEAT,
            flipY: !resolved.invertY,
        });
        
        (texture as pc.Texture & { _bitbybitTransform?: TextureTransformData })._bitbybitTransform = {
            uScale: resolved.uScale,
            vScale: resolved.vScale,
            uOffset: resolved.uOffset,
            vOffset: resolved.vOffset,
            wAng: resolved.wAng,
            invertZ: resolved.invertZ,
        };
        
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            texture.setSource(image);
            
            switch (resolved.samplingMode) {
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
        image.src = resolved.url;
        
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
        const resolved = resolveDto(Inputs.Draw.GenericPBRMaterialDto, inputs) as Resolved.Draw.GenericPBRMaterialDto;
        const mat = new pc.StandardMaterial();
        mat.name = resolved.name;
        
        const baseColor = this.hexToRgb(resolved.baseColor);
        mat.diffuse = new pc.Color(baseColor.r, baseColor.g, baseColor.b);
        
        mat.metalness = resolved.metallic;
        mat.gloss = 1 - resolved.roughness;
        mat.useMetalness = true;
        mat.opacity = resolved.alpha;
        
        if (resolved.emissiveColor) {
            const emissive = this.hexToRgb(resolved.emissiveColor);
            mat.emissive = new pc.Color(emissive.r, emissive.g, emissive.b);
            mat.emissiveIntensity = resolved.emissiveIntensity;
        }
        
        mat.cull = resolved.doubleSided ? pc.CULLFACE_NONE : pc.CULLFACE_BACK;
        
        if (resolved.zOffset !== 0) {
            mat.depthBias = resolved.zOffset;
            mat.slopeDepthBias = resolved.zOffsetUnits;
        }
        
        if (resolved.baseColorTexture) {
            mat.diffuseMap = resolved.baseColorTexture as pc.Texture;
            this.applyTextureTransform(mat, resolved.baseColorTexture as TextureWithTransform, "diffuseMap");
        }
        if (resolved.metallicRoughnessTexture) {
            mat.metalnessMap = resolved.metallicRoughnessTexture as pc.Texture;
            mat.glossMap = resolved.metallicRoughnessTexture as pc.Texture;
            this.applyTextureTransform(mat, resolved.metallicRoughnessTexture as TextureWithTransform, "metalnessMap");
        }
        if (resolved.normalTexture) {
            mat.normalMap = resolved.normalTexture as pc.Texture;
            this.applyTextureTransform(mat, resolved.normalTexture as TextureWithTransform, "normalMap");
        }
        if (resolved.emissiveTexture) {
            mat.emissiveMap = resolved.emissiveTexture as pc.Texture;
            this.applyTextureTransform(mat, resolved.emissiveTexture as TextureWithTransform, "emissiveMap");
        }
        if (resolved.occlusionTexture) {
            mat.aoMap = resolved.occlusionTexture as pc.Texture;
            this.applyTextureTransform(mat, resolved.occlusionTexture as TextureWithTransform, "aoMap");
        }
        
        switch (resolved.alphaMode) {
            case Inputs.Draw.alphaModeEnum.opaque:
                mat.blendType = pc.BLEND_NONE;
                break;
            case Inputs.Draw.alphaModeEnum.mask:
                mat.blendType = pc.BLEND_NONE;
                mat.alphaTest = resolved.alphaCutoff;
                break;
            case Inputs.Draw.alphaModeEnum.blend:
                mat.blendType = pc.BLEND_NORMAL;
                break;
        }
        
        mat.update();
        return mat;
    }

    private applyTextureTransform(
        mat: pc.StandardMaterial, 
        texture: TextureWithTransform, 
        mapType: TextureMapSlot
    ): void {
        const transform = texture._bitbybitTransform;
        if (!transform) {
            return;
        }

        const propertyMap: Record<string, TextureMapSlot> = {
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
        mat[`${prefix}Tiling` as const] = new pc.Vec2(
            transform.uScale, 
            transform.vScale * vScaleMultiplier
        );
        
        mat[`${prefix}Offset` as const] = new pc.Vec2(
            transform.uOffset, 
            transform.vOffset
        );
        
        mat[`${prefix}Rotation` as const] = transform.wAng;
    }

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
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                jscadMesh: inputs.group,
                mesh,
            });
        }, Inputs.Draw.drawingTypes.jscadMesh);
    }

    private handleJscadMeshes(inputs: Inputs.Draw.DrawAny<pc.Entity>, meshes: (Inputs.JSCAD.JSCADGeom2 | Inputs.JSCAD.JSCADGeom3)[]): Promise<pc.Entity> {
        return this.handleAsync(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSolidOrPolygonMeshes({
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                jscadMesh: inputs.group,
                meshes,
            });
        }, Inputs.Draw.drawingTypes.jscadMeshes);
    }

    private handleManifoldShape(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity | undefined> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawManifoldOrCrossSectionOptions(), (options) => {
            return this.drawHelper.drawManifoldOrCrossSection({
                ...this.manifoldOptions(options),
                manifoldOrCrossSection: inputs.entity as Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer,
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleManifoldShapes(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawManifoldOrCrossSectionOptions(), (options) => {
            return this.drawHelper.drawManifoldsOrCrossSections({
                ...this.manifoldOptions(options),
                manifoldsOrCrossSections: inputs.entity as (Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer)[],
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleOcctShape(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShape({
                ...this.occtOptions(options),
                shape: inputs.entity as Inputs.OCCT.TopoDSShapePointer,
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleShapeWithAppearance(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShapeWithAppearance(inputs.entity as Inputs.Draw.ShapeWithAppearance, this.occtOptions(options));
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleShapesWithAppearance(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShapesWithAppearance(inputs.entity as Inputs.Draw.ShapeWithAppearance[], this.occtOptions(options));
        }, Inputs.Draw.drawingTypes.occtShapes);
    }

    private handleDesignBuild(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawDesignBuild(inputs.entity as Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>, this.occtOptions(options), inputs.group);
        }, Inputs.Draw.drawingTypes.occtShapes);
    }

    private handleOcctShapes(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShapes({
                ...this.occtOptions(options),
                shapes: inputs.entity as Inputs.OCCT.TopoDSShapePointer[],
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
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                polylinesMesh: inputs.group,
                polylines: [{ points: pts }],
            });
        }, Inputs.Draw.drawingTypes.line);
    }

    private handlePoint(inputs: Inputs.Draw.DrawAny<pc.Entity>) {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawPoint({
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                pointMesh: inputs.group,
                point: inputs.entity as Inputs.Base.Point3,
            });
        }, Inputs.Draw.drawingTypes.point);
    }

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
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                polylineMesh: inputs.group,
                polyline: inputs.entity as Inputs.Base.Polyline3,
            });
        }, type);
    }

    private handleVerbCurve(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawCurve({
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                curveMesh: inputs.group,
                curve: inputs.entity,
            } as Inputs.Verb.DrawCurveDto<pc.Entity>);
        }, Inputs.Draw.drawingTypes.verbCurve);
    }

    private handleVerbSurface(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSurface({
                ...this.basicOptions(options),
                surfaceMesh: inputs.group,
                surface: inputs.entity,
            });
        }, Inputs.Draw.drawingTypes.verbSurface);
    }

    private handleFrames(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity | undefined {
        const options = this.resolveDrawOptions(inputs, this.defaultFrameOptions);
        const style = resolveDto(Inputs.Draw.DrawFrameOptions, options) as Resolved.Draw.DrawFrameOptions;
        const entity: unknown = inputs.entity;
        const frames: Inputs.Base.Frame[] = this.detectFrames(entity) ? entity : this.detectFrame(entity) ? [entity] : [];
        const type = Array.isArray(entity) ? Inputs.Draw.drawingTypes.frames : Inputs.Draw.drawingTypes.frame;
        const { polylines, colours } = this.frameMarkerLines(frames, style);
        if (polylines.length === 0) {
            if (style.updatable && inputs.group) {
                inputs.group.destroy();
            }
            return undefined;
        }
        const result = this.drawHelper.drawPolylinesWithColours({
            polylinesMesh: inputs.group,
            polylines,
            colours,
            size: style.lineWidth,
            opacity: 1,
            updatable: style.updatable,
            colorMapStrategy: Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(type, options, result);
        return result;
    }

    private handlePolylines(inputs: Inputs.Draw.DrawAny<pc.Entity>, type = Inputs.Draw.drawingTypes.polylines): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPolylinesWithColours({
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                polylinesMesh: inputs.group,
                polylines: inputs.entity as Inputs.Base.Polyline3[],
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
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                polylinesMesh: inputs.group,
                polylines: pts.map(e => ({ points: [...e] })),
            });
        }, Inputs.Draw.drawingTypes.lines);
    }

    private handlePoints(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawPoints({
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                pointsMesh: inputs.group,
                points: inputs.entity as Inputs.Base.Point3[],
            });
        }, Inputs.Draw.drawingTypes.points);
    }

    private handleVerbCurves(inputs: Inputs.Draw.DrawAny<pc.Entity>) {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawCurves({
                ...options as Inputs.Draw.DrawBasicGeometryOptions,
                curvesMesh: inputs.group,
                curves: inputs.entity as Base.VerbCurve[],
            } as Inputs.Verb.DrawCurvesDto<pc.Entity>);
        }, Inputs.Draw.drawingTypes.verbCurves);
    }

    private handleVerbSurfaces(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawSurfacesMultiColour({
                ...this.basicOptions(options),
                surfacesMesh: inputs.group,
                surfaces: inputs.entity as Base.VerbSurface[],
            });
        }, Inputs.Draw.drawingTypes.verbSurfaces);
    }

    private handleTag(inputs: Inputs.Draw.DrawAny<pc.Entity>): Inputs.Draw.DrawnTag {
        const options = this.resolveDrawOptions(inputs, { ...this.defaultBasicOptions, updatable: false });

        if (!this.isTagDto(inputs.entity)) {
            throw new Error("Entity must be a TagDto for drawTag operation");
        }

        const result = this.tag.drawTag({
            ...options as Inputs.Draw.DrawBasicGeometryOptions,
            tagVariable: inputs.group && this.isTagDto(inputs.group) ? inputs.group : undefined,
            tag: inputs.entity,
        });

        return this.attachTagMetadata(result, Inputs.Draw.drawingTypes.tag, options);
    }

    private handleTags(inputs: Inputs.Draw.DrawAny<pc.Entity>): Inputs.Draw.DrawnTags {
        const options = this.resolveDrawOptions(inputs, { ...this.defaultBasicOptions, updatable: false });

        if (!this.isTagDtoArray(inputs.entity)) {
            throw new Error("Entity must be a TagDto array for drawTags operation");
        }

        const result = this.tag.drawTags({
            ...options as Inputs.Draw.DrawBasicGeometryOptions,
            tagsVariable: inputs.group && this.isTagDtoArray(inputs.group) ? inputs.group : undefined,
            tags: inputs.entity,
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
                case Inputs.Draw.drawingTypes.frame:
                case Inputs.Draw.drawingTypes.frames:
                    result = this.handleFrames(inputs);
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

    private basicOptions(options: Inputs.Draw.DrawOptions): Resolved.Draw.DrawBasicGeometryOptions {
        return resolveDto(Inputs.Draw.DrawBasicGeometryOptions, options) as Resolved.Draw.DrawBasicGeometryOptions;
    }

    private occtOptions(options: Inputs.Draw.DrawOptions): Resolved.Draw.DrawOcctShapeOptions {
        return resolveDto(Inputs.Draw.DrawOcctShapeOptions, options) as Resolved.Draw.DrawOcctShapeOptions;
    }

    private manifoldOptions(options: Inputs.Draw.DrawOptions): Resolved.Draw.DrawManifoldOrCrossSectionOptions {
        return resolveDto(Inputs.Draw.DrawManifoldOrCrossSectionOptions, options) as Resolved.Draw.DrawManifoldOrCrossSectionOptions;
    }

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
            
            const errorMessage = messageOf(error);
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
