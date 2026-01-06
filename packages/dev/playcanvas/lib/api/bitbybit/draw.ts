import * as pc from "playcanvas";
import { DrawCore, Tag } from "@bitbybit-dev/core";
import * as Inputs from "../inputs/inputs";
import { Base } from "@bitbybit-dev/core/lib/api/inputs/base-inputs";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import { GEOMETRY_DEFAULTS, DEFAULT_COLORS } from "../constants";

// Type alias for entity with bitbybitMeta property
type BitByBitEntity = Inputs.Draw.BitByBitEntity;

// Interface for texture UV transformation data stored on textures
interface TextureTransformData {
    uScale: number;
    vScale: number;
    uOffset: number;
    vOffset: number;
    wAng: number;
    invertZ: boolean;
}

// Type for textures with optional BitByBit transform metadata
type TextureWithTransform = pc.Texture & { _bitbybitTransform?: TextureTransformData };

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

    async drawAnyAsync(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<BitByBitEntity> {
        if (!this.isValidDrawInput(inputs.entity)) {
            return Promise.resolve(undefined);
        }
        
        const entity = inputs.entity;
        // we start with async ones
        if (this.detectJscadMesh(entity)) {
            return this.handleJscadMesh(inputs);
        } else if (this.detectOcctShape(entity)) {
            return this.handleOcctShape(inputs);
        } else if (this.detectOcctShapes(entity)) {
            return this.handleOcctShapes(inputs);
        } else if (this.detectJscadMeshes(entity)) {
            return this.handleJscadMeshes(inputs);
        } else if (this.detectManifoldShape(entity)) {
            return this.handleManifoldShape(inputs);
        } else if (this.detectManifoldShapes(entity)) {
            return this.handleManifoldShapes(inputs);
        } else {
            // here we have all sync drawer functions
            return Promise.resolve(this.drawAny(inputs));
        }
    }

    /**
     * Draws any kind of geometry that does not need asynchronous computing, thus it cant be used with shapes coming from occt or jscad
     * @param inputs Contains options and entities to be drawn
     * @returns PlayCanvas Entity
     * @group draw sync
     * @shortname draw sync
     */
    drawAny(inputs: Inputs.Draw.DrawAny<pc.Entity>): BitByBitEntity {
        if (!this.isValidDrawInput(inputs.entity)) {
            return undefined;
        }
        
        let result;
        const entity = inputs.entity;
        if (!inputs.group && !(inputs.entity instanceof pc.Entity)) {
            if (this.detectLine(entity)) {
                result = this.handleLine(inputs);
            } else if (this.detectPoint(entity)) {
                result = this.handlePoint(inputs);
            } else if (this.detectPolyline(entity)) {
                result = this.handlePolyline(inputs);
            } else if (this.detectVerbCurve(entity)) {
                result = this.handleVerbCurve(inputs);
            } else if (this.detectVerbSurface(entity)) {
                result = this.handleVerbSurface(inputs);
            } else if (this.detectPolylines(entity)) {
                result = this.handlePolylines(inputs);
            } else if (this.detectLines(entity)) {
                result = this.handleLines(inputs);
            } else if (this.detectPoints(entity)) {
                result = this.handlePoints(inputs);
            } else if (this.detectVerbCurves(entity)) {
                result = this.handleVerbCurves(inputs);
            } else if (this.detectVerbSurfaces(entity)) {
                result = this.handleVerbSurfaces(inputs);
            } else if (this.detectTag(entity)) {
                result = this.handleTag(inputs);
            } else if (this.detectTags(entity)) {
                result = this.handleTags(inputs);
            }
        } else {
            // here types are marked on group metadata so it is not necessary to check their type
            result = this.updateAny(inputs);
        }
        return result;
    }

    /**
     * Creates draw options for basic geometry types like points, lines, polylines, surfaces and jscad meshes
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname simple
     */
    optionsSimple(inputs: Inputs.Draw.DrawBasicGeometryOptions): Inputs.Draw.DrawBasicGeometryOptions {
        return inputs;
    }

    /**
     * Creates draw options for occt shape geometry like edges, wires, faces, shells, solids and compounds
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname occt shape
     */
    optionsOcctShape(inputs: Inputs.Draw.DrawOcctShapeOptions): Inputs.Draw.DrawOcctShapeOptions {
        return inputs;
    }

    /**
     * Creates a generic texture that can be used with PBR materials.
     * This method provides a cross-engine compatible way to create textures.
     * Note: In PlayCanvas, UV transformations (scale, offset, rotation) are stored as metadata
     * on the texture and applied when the texture is assigned to a material via createPBRMaterial.
     * @param inputs Texture configuration options
     * @returns PlayCanvas Texture with attached transformation metadata
     * @group material
     * @shortname create texture
     * @disposableOutput true
     */
    createTexture(inputs: Inputs.Draw.GenericTextureDto): pc.Texture {
        const app = this.context.app;
        
        // Create a new texture
        const texture = new pc.Texture(app.graphicsDevice, {
            name: inputs.name,
            addressU: pc.ADDRESS_REPEAT,
            addressV: pc.ADDRESS_REPEAT,
            // PlayCanvas flipY is applied during upload - default is true for WebGL convention
            // We invert since our API's invertY=false means "don't flip" (standard image orientation)
            flipY: !inputs.invertY,
        });
        
        // Store UV transformation data as metadata on the texture
        // PlayCanvas handles UV transforms at the material level, so we attach this data
        // to be applied when the texture is used in createPBRMaterial
        (texture as pc.Texture & { _bitbybitTransform?: TextureTransformData })._bitbybitTransform = {
            uScale: inputs.uScale,
            vScale: inputs.vScale,
            uOffset: inputs.uOffset,
            vOffset: inputs.vOffset,
            wAng: inputs.wAng,
            invertZ: inputs.invertZ,
        };
        
        // Load the image asynchronously
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            texture.setSource(image);
            
            // Apply sampling mode after source is set
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
     * Creates a generic PBR (Physically Based Rendering) material.
     * This method provides a cross-engine compatible way to create materials
     * that can be used with draw options for OCCT shapes and other geometry.
     * UV transformations from textures created with createTexture are automatically applied.
     * @param inputs Material configuration options
     * @returns PlayCanvas StandardMaterial
     * @group material
     * @shortname create pbr material
     * @disposableOutput true
     */
    createPBRMaterial(inputs: Inputs.Draw.GenericPBRMaterialDto): pc.StandardMaterial {
        const mat = new pc.StandardMaterial();
        mat.name = inputs.name;
        
        // Parse hex color to RGB
        const baseColor = this.hexToRgb(inputs.baseColor);
        mat.diffuse = new pc.Color(baseColor.r, baseColor.g, baseColor.b);
        
        // PBR properties
        mat.metalness = inputs.metallic;
        mat.gloss = 1 - inputs.roughness; // PlayCanvas uses gloss (inverse of roughness)
        mat.useMetalness = true;
        mat.opacity = inputs.alpha;
        
        // Emissive
        if (inputs.emissiveColor) {
            const emissive = this.hexToRgb(inputs.emissiveColor);
            mat.emissive = new pc.Color(emissive.r, emissive.g, emissive.b);
            mat.emissiveIntensity = inputs.emissiveIntensity;
        }
        
        // Back face culling
        mat.cull = inputs.doubleSided ? pc.CULLFACE_NONE : pc.CULLFACE_BACK;
        
        // Z offset (depth bias in PlayCanvas)
        if (inputs.zOffset !== 0) {
            mat.depthBias = inputs.zOffset;
            mat.slopeDepthBias = inputs.zOffsetUnits;
        }
        
        // Textures with UV transform support
        if (inputs.baseColorTexture) {
            mat.diffuseMap = inputs.baseColorTexture as pc.Texture;
            this.applyTextureTransform(mat, inputs.baseColorTexture as TextureWithTransform, "diffuseMap");
        }
        if (inputs.metallicRoughnessTexture) {
            mat.metalnessMap = inputs.metallicRoughnessTexture as pc.Texture;
            mat.glossMap = inputs.metallicRoughnessTexture as pc.Texture;
            this.applyTextureTransform(mat, inputs.metallicRoughnessTexture as TextureWithTransform, "metalnessMap");
            // Note: glossMap shares the same texture, PlayCanvas will use the same UV transforms
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
        
        // Alpha mode
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

        // Map texture slot names to their corresponding material property prefixes
        // PlayCanvas uses properties like diffuseMapTiling, normalMapOffset, etc.
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

        // Apply tiling (scale) - PlayCanvas uses Vec2 for tiling
        // invertZ affects V scale (flips texture vertically in UV space)
        const vScaleMultiplier = transform.invertZ ? -1 : 1;
        (mat as unknown as Record<string, pc.Vec2>)[`${prefix}Tiling`] = new pc.Vec2(
            transform.uScale, 
            transform.vScale * vScaleMultiplier
        );
        
        // Apply offset - PlayCanvas uses Vec2 for offset
        (mat as unknown as Record<string, pc.Vec2>)[`${prefix}Offset`] = new pc.Vec2(
            transform.uOffset, 
            transform.vOffset
        );
        
        // Apply rotation (wAng) - PlayCanvas supports texture rotation in radians
        (mat as unknown as Record<string, number>)[`${prefix}Rotation`] = transform.wAng;
    }

    /**
     * Helper method to convert hex color string to RGB values (0-1 range)
     */
    private hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255
            };
        }
        return { r: 0, g: 0, b: 1 }; // Default blue
    }

    private handleJscadMesh(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSolidOrPolygonMesh({
                jscadMesh: inputs.group,
                mesh: inputs.entity,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.jscadMesh);
    }

    private handleJscadMeshes(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
        return this.handleAsync(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSolidOrPolygonMeshes({
                jscadMesh: inputs.group,
                meshes: inputs.entity as Inputs.JSCAD.JSCADEntity[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.jscadMeshes);
    }

    private handleManifoldShape(inputs: Inputs.Draw.DrawAny<pc.Entity>): Promise<pc.Entity> {
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
            if (line && line["start"]) {
                pts.push((line as Inputs.Base.Line3).start, (line as Inputs.Base.Line3).end);
            } else {
                pts.push(...line as Inputs.Base.Segment3);
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

    private handlePolyline(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPolylineClose({
                polylineMesh: inputs.group,
                polyline: inputs.entity as Inputs.Base.Polyline3,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.polyline);
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

    private handlePolylines(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPolylinesWithColours({
                polylinesMesh: inputs.group,
                polylines: inputs.entity as Inputs.Base.Polyline3[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.polylines);
    }

    private handleLines(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            const lines = inputs.entity as Inputs.Base.Line3[] | Inputs.Base.Segment3[];
            const pts: Inputs.Base.Point3[][] = [];
            if (lines && lines[0] && lines[0]["start"]) {
                lines.forEach(e => {
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
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
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

    private handleTag(inputs: Inputs.Draw.DrawAny<pc.Entity>): BitByBitEntity {
        const options = this.resolveDrawOptions(inputs, { ...this.defaultBasicOptions, updatable: false });
        
        // Validate entity is a TagDto
        if (!this.isTagDto(inputs.entity)) {
            throw new Error("Entity must be a TagDto for drawTag operation");
        }
        
        const result = this.tag.drawTag({
            tagVariable: inputs.group && this.isTagDto(inputs.group) ? inputs.group as unknown as Inputs.Tag.TagDto : undefined,
            tag: inputs.entity as unknown as Inputs.Tag.TagDto,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        
        return this.attachMetadata(result, Inputs.Draw.drawingTypes.tag, options);
    }

    private handleTags(inputs: Inputs.Draw.DrawAny<pc.Entity>): BitByBitEntity {
        const options = this.resolveDrawOptions(inputs, { ...this.defaultBasicOptions, updatable: false });
        
        // Validate entity is a TagDto array
        if (!this.isTagDtoArray(inputs.entity)) {
            throw new Error("Entity must be a TagDto array for drawTags operation");
        }
        
        const result = this.tag.drawTags({
            tagsVariable: inputs.group && this.isTagDtoArray(inputs.group) ? inputs.group as unknown as Inputs.Tag.TagDto[] : undefined,
            tags: inputs.entity as unknown as Inputs.Tag.TagDto[],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });

        return this.attachMetadata(result, Inputs.Draw.drawingTypes.tags, options);
    }

    private updateAny(inputs: Inputs.Draw.DrawAny<pc.Entity>): pc.Entity {
        let result;
        const group = inputs.group as BitByBitEntity;
        if (group && group.bitbybitMeta) {
            const type = group.bitbybitMeta.type as Inputs.Draw.drawingTypes;
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
            throw error; // Re-throw for sync operations
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
    private async handleAsync(
        inputs: Inputs.Draw.DrawAny<pc.Entity>, 
        defaultOptions: Inputs.Draw.DrawOptions, 
        action: (options: Inputs.Draw.DrawOptions) => Promise<pc.Entity>, 
        type: Inputs.Draw.drawingTypes
    ): Promise<pc.Entity> {
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
            
            // Include more context in error message
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to draw ${typeName}: ${errorMessage}`);
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
     * Type guard to check if value is a PlayCanvas Entity
     * @param value - Value to check
     * @returns True if value is pc.Entity
     */
    private isEntity(value: unknown): value is pc.Entity {
        return value instanceof pc.Entity;
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
        // Priority 1: Explicit options provided
        if (inputs.options) {
            return inputs.options;
        }
        
        // Priority 2: Options from existing group metadata
        const group = inputs.group as BitByBitEntity;
        if (group?.bitbybitMeta?.options) {
            return group.bitbybitMeta.options;
        }
        
        // Priority 3: Default options
        return defaultOptions;
    }

    /**
     * Attach BitByBit metadata to an entity
     * @param entity - Entity to attach metadata to
     * @param type - Drawing type
     * @param options - Draw options
     * @returns Entity with attached metadata
     */
    private attachMetadata(
        entity: pc.Entity | unknown, 
        type: Inputs.Draw.drawingTypes, 
        options: Inputs.Draw.DrawOptions
    ): BitByBitEntity {
        if (!entity || !this.isEntity(entity)) {
            throw new Error(`Invalid entity type for metadata attachment: ${typeof entity}`);
        }
        
        const bitByBitEntity = entity as BitByBitEntity;
        bitByBitEntity.bitbybitMeta = { type, options };
        return bitByBitEntity;
    }

}
