import * as THREEJS from "three";
import { DrawCore, Tag } from "@bitbybit-dev/core";
import * as Inputs from "../inputs";
import { Base } from "@bitbybit-dev/core/lib/api/inputs/base-inputs";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";

/**
 * Everything drawing can hand back: a group for geometry, the tag or tags for tags, a disposable
 * overlay for one a host application resolves, nothing for an empty entity.
 *
 * This is what the dispatch is typed as, because it runs before the kind is known. A caller does
 * know, and gets the one arm that applies through `Inputs.Draw.Drawn`.
 */
export type DrawnEntity = Inputs.Draw.DrawnAny<THREEJS.Group>;

export class Draw extends DrawCore {
    private defaultBasicOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    private defaultPolylineOptions: Inputs.Draw.DrawBasicGeometryOptions = {
        ...new Inputs.Draw.DrawBasicGeometryOptions(),
        size: 2,
        colours: "#ff00ff",
    };

    constructor(
        public readonly drawHelper: DrawHelper,
        public readonly context: Context,
        public readonly tag: Tag
    ) {
        super();
    }

    /**
     * Draws any kind of geometry after all input promises are resolved. Inputs can also be non-promise like.
     *
     * What comes back depends on what went in, and the type says so: an OCCT, JSCAD or Manifold
     * shape, a point, a line, a polyline or a mesh resolves to a Three.js group; a tag resolves to the drawn
     * tag, and a list of tags to the list, because a tag renders as an HTML overlay positioned from
     * the scene rather than as geometry in it; an entity a host application resolves into an overlay
     * resolves to something whose only method is `dispose`. So a caller that knows what it is drawing
     * does not have to narrow a union to use the result.
     *
     * Drawing an empty list draws nothing and resolves undefined. A literal `[]` is typed as that;
     * a list variable that happens to be empty is not, because whether a list is empty is not
     * something the type of the list says.
     * @param inputs Contains options and entities to be drawn
     * @returns What drawing the given entity produces - see above
     */
    async drawAnyAsync<E extends Inputs.Draw.Entity>(
        inputs: Inputs.Draw.DrawAny<THREEJS.Group, E>,
    ): Promise<Inputs.Draw.Drawn<E, THREEJS.Group>> {
        return await this.drawResolvedAsync(inputs) as Inputs.Draw.Drawn<E, THREEJS.Group>;
    }

    /**
     * Every branch of the asynchronous dispatch, typed as what it can actually produce.
     *
     * A package that adds entity kinds overrides this rather than the public signature: two
     * unresolved conditional types over the same `E` have no provable relation to each other, so a
     * narrower override of `drawAnyAsync` cannot typecheck however correct it is.
     * @ignore true
     */
    private cachedSyncHandlers: Record<string, (inputs: Inputs.Draw.DrawAny<THREEJS.Group>) => DrawnEntity> | undefined;

    /**
     * What this renderer draws each synchronous kind with, keyed by the kind's name in the ordered
     * table. A kind absent from here is one this renderer does not draw, and the walk skips it.
     * @ignore true
     */
    private syncHandlers(): Record<string, (inputs: Inputs.Draw.DrawAny<THREEJS.Group>) => DrawnEntity> {
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

    private cachedAsyncHandlers: Record<string, (inputs: Inputs.Draw.DrawAny<THREEJS.Group>, entity: unknown) => Promise<DrawnEntity>> | undefined;

    /**
     * The same for the kinds that have to cross to a worker and back.
     *
     * The two JSCAD entries ask their own check again rather than asserting: a handler that takes the
     * narrowed entity can only be given one honestly, and re-running a check the table just ran is
     * cheaper than a cast that could be wrong.
     * @ignore true
     */
    private asyncHandlers(): Record<string, (inputs: Inputs.Draw.DrawAny<THREEJS.Group>, entity: unknown) => Promise<DrawnEntity>> {
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

    protected async drawResolvedAsync(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<DrawnEntity> {
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

    private handleDecomposedMeshShape(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            const merged = { ...new Inputs.Draw.DrawOcctShapeOptions(), ...options as Inputs.Draw.DrawOcctShapeOptions };
            return this.drawHelper.handleDecomposedMesh(
                merged,
                inputs.entity as unknown as Inputs.OCCT.DecomposedMeshDto,
                merged
            );
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleDecomposedMeshes(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), async (options) => {
            const merged = { ...new Inputs.Draw.DrawOcctShapeOptions(), ...options as Inputs.Draw.DrawOcctShapeOptions };
            const decomposedMeshes = inputs.entity as unknown as Inputs.OCCT.DecomposedMeshDto[];
            const drawn = await Promise.all(decomposedMeshes.map(dm => this.drawHelper.handleDecomposedMesh(
                merged, dm, merged)));
            const container = new THREEJS.Group();
            container.name = "decomposedMeshesContainer";
            const scene = drawn.find(mesh => mesh)?.parent;
            if (scene) { scene.add(container); }
            drawn.forEach(mesh => { if (mesh) { container.add(mesh); } });
            return container;
        }, Inputs.Draw.drawingTypes.occtShapes);
    }

    /**
     * Draws any kind of geometry that does not need asynchronous computing, thus it cant be used with shapes coming from occt or jscad
     * @param inputs Contains options and entities to be drawn
     * @returns What drawing the given entity produces: a group for geometry, the tag or tags for
     * a tag, a disposable overlay for one a host application resolves, nothing for an empty list.
     * @group draw sync
     * @shortname draw sync
     */
    drawAny<E extends Inputs.Draw.Entity>(
        inputs: Inputs.Draw.DrawAny<THREEJS.Group, E>,
    ): Inputs.Draw.Drawn<E, THREEJS.Group> {
        return this.drawResolved(inputs) as Inputs.Draw.Drawn<E, THREEJS.Group>;
    }

    /**
     * Every branch of the synchronous dispatch, typed as what it can actually produce. Overridden
     * instead of the public signature, for the reason given on its asynchronous twin.
     * @ignore true
     */
    protected drawResolved(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): DrawnEntity {
        let result;
        const entity = inputs.entity;
        if (!inputs.group && !(inputs.entity instanceof THREEJS.Group)) {
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
     * @param inputs Texture configuration options
     * @returns ThreeJS Texture
     * @group material
     * @shortname create texture
     * @disposableOutput true
     */
    createTexture(inputs: Inputs.Draw.GenericTextureDto): THREEJS.Texture {
        const loader = new THREEJS.TextureLoader();
        const texture = loader.load(inputs.url);
        
        texture.name = inputs.name;
        texture.repeat.set(inputs.uScale, inputs.vScale);
        texture.offset.set(inputs.uOffset, inputs.vOffset);
        texture.rotation = inputs.wAng;
        texture.flipY = !inputs.invertY;
        texture.wrapS = THREEJS.RepeatWrapping;
        texture.wrapT = THREEJS.RepeatWrapping;
        
        switch (inputs.samplingMode) {
            case Inputs.Draw.samplingModeEnum.nearest:
                texture.minFilter = THREEJS.NearestFilter;
                texture.magFilter = THREEJS.NearestFilter;
                break;
            case Inputs.Draw.samplingModeEnum.bilinear:
                texture.minFilter = THREEJS.LinearFilter;
                texture.magFilter = THREEJS.LinearFilter;
                break;
            case Inputs.Draw.samplingModeEnum.trilinear:
                texture.minFilter = THREEJS.LinearMipmapLinearFilter;
                texture.magFilter = THREEJS.LinearFilter;
                break;
        }
        
        return texture;
    }

    /**
     * Creates a generic PBR (Physically Based Rendering) material.
     * This method provides a cross-engine compatible way to create materials
     * that can be used with draw options for OCCT shapes and other geometry.
     * @param inputs Material configuration options
     * @returns ThreeJS MeshStandardMaterial
     * @group material
     * @shortname create pbr material
     * @disposableOutput true
     */
    createPBRMaterial(inputs: Inputs.Draw.GenericPBRMaterialDto): THREEJS.MeshStandardMaterial {
        const mat = new THREEJS.MeshStandardMaterial({
            name: inputs.name,
            color: new THREEJS.Color(inputs.baseColor),
            metalness: inputs.metallic,
            roughness: inputs.roughness,
            opacity: inputs.alpha,
            transparent: inputs.alpha < 1 || inputs.alphaMode === Inputs.Draw.alphaModeEnum.blend,
            side: inputs.doubleSided ? THREEJS.DoubleSide : THREEJS.FrontSide,
            wireframe: inputs.wireframe,
        });
        
        if (inputs.emissiveColor) {
            mat.emissive = new THREEJS.Color(inputs.emissiveColor);
            mat.emissiveIntensity = inputs.emissiveIntensity;
        }
        
        if (inputs.zOffset !== 0 || inputs.zOffsetUnits !== 0) {
            mat.polygonOffset = true;
            mat.polygonOffsetFactor = inputs.zOffset;
            mat.polygonOffsetUnits = inputs.zOffsetUnits;
        }
        
        if (inputs.baseColorTexture) {
            mat.map = inputs.baseColorTexture as THREEJS.Texture;
        }
        if (inputs.metallicRoughnessTexture) {
            mat.metalnessMap = inputs.metallicRoughnessTexture as THREEJS.Texture;
            mat.roughnessMap = inputs.metallicRoughnessTexture as THREEJS.Texture;
        }
        if (inputs.normalTexture) {
            mat.normalMap = inputs.normalTexture as THREEJS.Texture;
        }
        if (inputs.emissiveTexture) {
            mat.emissiveMap = inputs.emissiveTexture as THREEJS.Texture;
        }
        if (inputs.occlusionTexture) {
            mat.aoMap = inputs.occlusionTexture as THREEJS.Texture;
        }
        
        switch (inputs.alphaMode) {
            case Inputs.Draw.alphaModeEnum.opaque:
                mat.transparent = false;
                mat.alphaTest = 0;
                break;
            case Inputs.Draw.alphaModeEnum.mask:
                mat.transparent = false;
                mat.alphaTest = inputs.alphaCutoff;
                break;
            case Inputs.Draw.alphaModeEnum.blend:
                mat.transparent = true;
                mat.alphaTest = 0;
                break;
        }
        
        if (inputs.unlit) {
            mat.emissive = new THREEJS.Color(inputs.baseColor);
            mat.emissiveIntensity = 1;
            mat.color = new THREEJS.Color(0x000000);
        }
        
        return mat;
    }

    private handleJscadMesh(inputs: Inputs.Draw.DrawAny<THREEJS.Group>, mesh: Inputs.JSCAD.JSCADGeom2 | Inputs.JSCAD.JSCADGeom3): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSolidOrPolygonMesh({
                jscadMesh: inputs.group,
                mesh,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.jscadMesh);
    }

    private handleJscadMeshes(inputs: Inputs.Draw.DrawAny<THREEJS.Group>, meshes: (Inputs.JSCAD.JSCADGeom2 | Inputs.JSCAD.JSCADGeom3)[]): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSolidOrPolygonMeshes({
                jscadMesh: inputs.group,
                meshes,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.jscadMeshes);
    }

    private handleManifoldShape(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group | undefined> {
        return this.handleAsync(inputs, new Inputs.Manifold.DrawManifoldOrCrossSectionDto(inputs.entity), (options) => {
            return this.drawHelper.drawManifoldOrCrossSection({
                manifoldOrCrossSection: inputs.entity as Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer,
                ...new Inputs.Draw.DrawManifoldOrCrossSectionOptions(),
                ...options as Inputs.Draw.DrawManifoldOrCrossSectionOptions
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleManifoldShapes(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, new Inputs.Manifold.DrawManifoldOrCrossSectionDto(inputs.entity), (options) => {
            return this.drawHelper.drawManifoldsOrCrossSections({
                manifoldsOrCrossSections: inputs.entity as (Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer)[],
                ...new Inputs.Draw.DrawManifoldOrCrossSectionOptions(),
                ...options as Inputs.Draw.DrawManifoldOrCrossSectionOptions
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleOcctShape(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShape({
                shape: inputs.entity as Inputs.OCCT.TopoDSShapePointer,
                ...new Inputs.Draw.DrawOcctShapeOptions(),
                ...options as Inputs.Draw.DrawOcctShapeOptions
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleOcctShapes(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShapes({
                shapes: inputs.entity as Inputs.OCCT.TopoDSShapePointer[],
                ...new Inputs.Draw.DrawOcctShapeOptions(),
                ...options as Inputs.Draw.DrawOcctShapeOptions
            });
        }, Inputs.Draw.drawingTypes.occtShapes);
    }

    private handleLine(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
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

    private handlePoint(inputs: Inputs.Draw.DrawAny<THREEJS.Group>) {
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
    private handleJscadPath(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        const points = this.pathToPolylinePoints(inputs.entity as Inputs.JSCAD.JSCADPath2);
        return this.handlePolyline({ ...inputs, entity: { points } }, Inputs.Draw.drawingTypes.jscadPath);
    }

    private handleJscadPaths(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        const paths = inputs.entity as Inputs.JSCAD.JSCADPath2[];
        const polylines = paths.map(path => ({ points: this.pathToPolylinePoints(path) }));
        return this.handlePolylines({ ...inputs, entity: polylines }, Inputs.Draw.drawingTypes.jscadPaths);
    }

    private handlePolyline(inputs: Inputs.Draw.DrawAny<THREEJS.Group>, type = Inputs.Draw.drawingTypes.polyline): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPolylineClose({
                polylineMesh: inputs.group,
                polyline: inputs.entity as Inputs.Polyline.PolylinePropertiesDto,
                ...options
            });
        }, type);
    }

    private handleVerbCurve(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawCurve({
                curveMesh: inputs.group,
                curve: inputs.entity,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbCurve);
    }

    private handleVerbSurface(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSurface({
                surfaceMesh: inputs.group,
                surface: inputs.entity,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbSurface);
    }

    private handlePolylines(inputs: Inputs.Draw.DrawAny<THREEJS.Group>, type = Inputs.Draw.drawingTypes.polylines): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPolylinesWithColours({
                polylinesMesh: inputs.group,
                polylines: inputs.entity as Inputs.Base.Polyline3[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, type);
    }

    private handleLines(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
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

    private handlePoints(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawPoints({
                pointsMesh: inputs.group,
                points: inputs.entity as Inputs.Base.Point3[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.points);
    }

    private handleVerbCurves(inputs: Inputs.Draw.DrawAny<THREEJS.Group>) {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawCurves({
                curvesMesh: inputs.group,
                curves: inputs.entity as Base.VerbCurve[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbCurves);
    }

    private handleVerbSurfaces(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawSurfacesMultiColour({
                surfacesMesh: inputs.group,
                surfaces: inputs.entity as Base.VerbSurface[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbSurfaces);
    }

    private handleTag(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Inputs.Draw.DrawnTag {
        const options = inputs.options ? inputs.options : {
            updatable: false,
        };
        const result = this.tag.drawTag({
            tagVariable: inputs.group as any,
            tag: inputs.entity as Inputs.Tag.TagDto,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        const drawnTag = result as Inputs.Draw.DrawnTag;
        drawnTag.userData = { type: Inputs.Draw.drawingTypes.tag, options };
        return drawnTag;
    }

    private handleTags(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Inputs.Draw.DrawnTags {
        const options = inputs.options ? inputs.options : {
            updatable: false,
        };
        const result = this.tag.drawTags({
            tagsVariable: inputs.group as any,
            tags: inputs.entity as Inputs.Tag.TagDto[],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });

        const drawnTags = result as Inputs.Draw.DrawnTags;
        drawnTags.forEach(drawnTag => { drawnTag.userData = { type: Inputs.Draw.drawingTypes.tags, options }; });
        drawnTags.userData = { type: Inputs.Draw.drawingTypes.tags, options };
        return drawnTags;
    }

    private updateAny(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): DrawnEntity {
        let result;
        if (inputs.group && inputs.group.userData) {
            const type = inputs.group.userData["type"] as Inputs.Draw.drawingTypes;
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

    private handle(inputs: Inputs.Draw.DrawAny<THREEJS.Group>, defaultOptions: Inputs.Draw.DrawOptions, action: (options: Inputs.Draw.DrawOptions) => THREEJS.Group, type: Inputs.Draw.drawingTypes): THREEJS.Group {
        let options = inputs.options ? inputs.options : defaultOptions;
        if (!inputs.options && inputs.group && inputs.group.userData["options"]) {
            options = inputs.group.userData["options"];
        }
        const result = action(options);
        this.applyGlobalSettingsAndMetadataAndShadowCasting(type, options, result);
        return result;
    }

    private async handleAsync<T extends THREEJS.Group | undefined>(inputs: Inputs.Draw.DrawAny<THREEJS.Group>, defaultOptions: Inputs.Draw.DrawOptions, action: (options: Inputs.Draw.DrawOptions) => Promise<T>, type: Inputs.Draw.drawingTypes): Promise<T> {
        let options = inputs.options ? inputs.options : defaultOptions;
        if (!inputs.options && inputs.group && inputs.group.userData["options"]) {
            options = inputs.group.userData["options"];
        }
        const result = action(options);
        return result.then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(type, options, r);
            return r;
        });
    }

    private applyGlobalSettingsAndMetadataAndShadowCasting(type: Inputs.Draw.drawingTypes, options: Inputs.Draw.DrawOptions, result: THREEJS.Group | undefined) {
        if (result) {
            const typemeta = { type, options };
            result.userData = result.userData ? { ...result.userData, ...typemeta } : typemeta;
        }
    }
}
