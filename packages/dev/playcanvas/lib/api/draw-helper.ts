
import type { Context } from "./context";
import * as Inputs from "./inputs";
import { DrawHelperCore, defaultEdgeColor, DesignMeshCache, designOptionsKeyOf, designPartKeyOf, edgeColorsOf, lookGroupsOf, lookGroupsOfColors, lookMeshesOf, designDrawPlanOf, designMeshesOf, meshesByKeyOf, keptMeshKeyOf } from "@bitbybit-dev/core";
import type { KeptDesignMesh } from "@bitbybit-dev/core";
import type { FaceLook, FaceRange, LookMesh, PartPlacement } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import type { JSCADText } from "@bitbybit-dev/jscad-worker";
import type { Vector } from "@bitbybit-dev/base";
import { messageOf, resolveDto } from "@bitbybit-dev/base";
import type { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import type { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import type { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import * as pc from "playcanvas";
import { DEFAULT_COLORS, CACHE_CONFIG } from "./constants";
import type * as Resolved from "./resolved-inputs";

function float32ViewOf(locked: ArrayBuffer | ArrayBufferView): Float32Array {
    if (ArrayBuffer.isView(locked)) {
        return new Float32Array(locked.buffer, locked.byteOffset, locked.byteLength / Float32Array.BYTES_PER_ELEMENT);
    }
    return new Float32Array(locked);
}

type PolylineEntity = Inputs.Draw.PolylineEntity;

type LookedEntity = pc.Entity & { faceRanges?: FaceRange[][] };

type DesignPartEntity = pc.Entity & { designPart?: { part: string; paths: string[] } };

interface DesignPartDrawn {
    part: string;
    key: string;
    matrices: Float32Array;
    buffer: pc.VertexBuffer;
    entity: DesignPartEntity;
    faces: pc.Entity | undefined;
    edges: pc.Entity | undefined;
}

interface DesignDrawState {
    placements: Map<string, PartPlacement[]>;
    meshes: Map<string, Inputs.OCCT.DecomposedMeshDto>;
    signature: string;
    looks: string;
    precision: number;
    parts: DesignPartDrawn[];
}

export class DrawHelper extends DrawHelperCore {

    private readonly materialCache = new Map<string, pc.StandardMaterial>();

    private readonly designStates = new WeakMap<pc.Entity, DesignDrawState>();

    private readonly designMeshes = new DesignMeshCache<Inputs.OCCT.DecomposedMeshDto>();
    
    private entityIdCounter = 0;
    private readonly instanceId = `pc-${Date.now()}`;

    constructor(
        private readonly context: Context,
        private readonly solidText: JSCADText,
        public override readonly vector: Vector,
        private readonly jscadWorkerManager: JSCADWorkerManager,
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
        private readonly occWorkerManager: OCCTWorkerManager
    ) {
        super(vector);
    }


    /**
     * Check if DrawHelper has been disposed
     * @returns True if disposed, false otherwise
     */
    public isDisposed(): boolean {
        return this.materialCache.size === 0;
    }

    async drawManifoldsOrCrossSections(inputs: Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>): Promise<pc.Entity> {
        const resolved = resolveDto(Inputs.Manifold.DrawManifoldsOrCrossSectionsDto, inputs) as Resolved.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>;
        try {
            const safeWorkerOptions = this.getSafeWorkerOptions(resolved);
            const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto[] = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", safeWorkerOptions);
            const meshes = decomposedMesh.map(dec => this.handleDecomposedManifold(dec, resolved)).filter((s): s is pc.Entity => s !== undefined);
            const containerId = this.generateEntityId("manifoldMeshContainer");
            const manifoldMeshContainer = new pc.Entity(containerId);
            meshes.forEach(mesh => {
                manifoldMeshContainer.addChild(mesh);
            });
            this.context.scene.addChild(manifoldMeshContainer);
            return manifoldMeshContainer;
        } catch (error) {
            console.error("Error drawing manifolds or cross sections:", error);
            throw new Error(`Failed to draw manifolds or cross sections: ${messageOf(error)}`, { cause: error });
        }
    }

    async drawManifoldOrCrossSection(inputs: Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>): Promise<pc.Entity | undefined> {
        const resolved = resolveDto(Inputs.Manifold.DrawManifoldOrCrossSectionDto, inputs) as Resolved.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>;
        try {
            const safeWorkerOptions = this.getSafeWorkerOptions(resolved);
            const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", safeWorkerOptions);
            return this.handleDecomposedManifold(decomposedMesh, resolved);
        } catch (error) {
            console.error("Error drawing manifold or cross section:", error);
            throw new Error(`Failed to draw manifold or cross section: ${messageOf(error)}`, { cause: error });
        }
    }

    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<pc.Entity> {
        const resolved = resolveDto(Inputs.OCCT.DrawShapeDto, inputs) as Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>;
        try {
            const safeWorkerOptions = this.getMeshingOptions(resolved);
            const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", safeWorkerOptions);
            return this.handleDecomposedMesh(resolved, decomposedMesh, resolved);
        } catch (error) {
            console.error("Error drawing OCCT shape:", error);
            throw new Error(`Failed to draw OCCT shape: ${messageOf(error)}`, { cause: error });
        }
    }

    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<pc.Entity> {
        const resolved = resolveDto(Inputs.OCCT.DrawShapesDto, inputs) as Resolved.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>;
        try {
            const safeWorkerOptions = this.getMeshingOptions(resolved);
            const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", safeWorkerOptions);
            const pooled = this.withSurfaceAnalysisRange(resolved, meshes);
            const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(pooled, decomposedMesh, pooled)));
            const containerId = this.generateEntityId("shapesMeshContainer");
            const shapesMeshContainer = new pc.Entity(containerId);
            this.context.scene.addChild(shapesMeshContainer);
            meshesSolved.forEach(mesh => {
                shapesMeshContainer.addChild(mesh);
            });
            return shapesMeshContainer;
        } catch (error) {
            console.error("Error drawing OCCT shapes:", error);
            throw new Error(`Failed to draw OCCT shapes: ${messageOf(error)}`, { cause: error });
        }
    }

    async drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>): Promise<pc.Entity> {
        const resolved = resolveDto(Inputs.JSCAD.DrawSolidMeshDto, inputs) as Resolved.JSCAD.DrawSolidMeshDto<pc.Entity>;
        try {
            const res: {
                positions: number[],
                normals: number[],
                indices: number[],
                transforms: [],
            } = await this.jscadWorkerManager.genericCallToWorkerPromise("shapeToMesh", resolved);
            
            let meshToUpdate: pc.Entity;
            if (resolved.jscadMesh && resolved.updatable) {
                meshToUpdate = resolved.jscadMesh;
            } else {
                meshToUpdate = new pc.Entity(this.generateEntityId("jscadMesh"));
                this.context.scene.addChild(meshToUpdate);
            }
            
            let colour: string | undefined;
            if (resolved.mesh.color && resolved.mesh.color.length > 0) {
                const c = resolved.mesh.color;
                colour = this.normalizeColor(c, DEFAULT_COLORS.DEFAULT);
            } else {
                colour = Array.isArray(resolved.colours) ? resolved.colours[0] : resolved.colours;
            }
            
            const s = this.makeMesh({ 
                ...resolved, 
                colour: colour!,
                drawTwoSided: resolved.drawTwoSided,
                backFaceColour: resolved.backFaceColour,
                backFaceOpacity: resolved.backFaceOpacity
            }, meshToUpdate, res);
            resolved.jscadMesh = s;
            return s;
        } catch (error) {
            console.error("Error drawing JSCAD solid or polygon mesh:", error);
            throw new Error(`Failed to draw JSCAD mesh: ${messageOf(error)}`, { cause: error });
        }
    }

    async drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>): Promise<pc.Entity> {
        const resolved = resolveDto(Inputs.JSCAD.DrawSolidMeshesDto, inputs) as Resolved.JSCAD.DrawSolidMeshesDto<pc.Entity>;
        try {
            const res: {
                positions: number[],
                normals: number[],
                indices: number[],
                transforms: [],
                color?: number[]
            }[] = await this.jscadWorkerManager.genericCallToWorkerPromise("shapesToMeshes", resolved);

            let localOrigin: pc.Entity;
            if (resolved.jscadMesh && resolved.updatable) {
                localOrigin = resolved.jscadMesh;
                this.clearEntity(localOrigin);
            } else {
                localOrigin = new pc.Entity(this.generateEntityId("jscadMeshes"));
            }

            const colourIsArrayAndMatches = Array.isArray(resolved.colours) && resolved.colours.length === res.length;
            const colorsAreArrays = Array.isArray(resolved.colours);

            res.forEach((r, index) => {
                const meshToUpdate = new pc.Entity(this.generateEntityId("jscadMesh", localOrigin.name));
                let colour;
                if (r.color) {
                    colour = this.normalizeColor(r.color, DEFAULT_COLORS.DEFAULT);
                } else if (colourIsArrayAndMatches) {
                    colour = resolved.colours[index];
                } else if (colorsAreArrays) {
                    colour = resolved.colours[0];
                } else {
                    colour = resolved.colours;
                }
                const m = this.makeMesh({ 
                    ...resolved, 
                    colour: colour as string,
                    drawTwoSided: resolved.drawTwoSided,
                    backFaceColour: resolved.backFaceColour,
                    backFaceOpacity: resolved.backFaceOpacity
                }, meshToUpdate, r);
                localOrigin.addChild(m);
            });
            
            this.context.scene.addChild(localOrigin);
            resolved.jscadMesh = localOrigin;
            return localOrigin;
        } catch (error) {
            console.error("Error drawing JSCAD solid or polygon meshes:", error);
            throw new Error(`Failed to draw JSCAD meshes: ${messageOf(error)}`, { cause: error });
        }
    }

    /**
     * Draw multiple polylines with individual colors
     * @param inputs - Polyline drawing inputs
     * @returns Entity containing all polylines
     */
    drawPolylinesWithColours(inputs: Inputs.Polyline.DrawPolylinesDto<pc.Entity> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined, arrowSize?: number | undefined, arrowAngle?: number | undefined }): pc.Entity {
        const resolved = resolveDto(Inputs.Polyline.DrawPolylinesDto, inputs) as Resolved.Polyline.DrawPolylinesDto<pc.Entity> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined, arrowSize?: number | undefined, arrowAngle?: number | undefined };
        const strategy = resolved.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        
        const processedPoints = this.processPolylinePoints(resolved.polylines as Inputs.Base.Polyline3[]);

        const own = resolved.polylines.map(polyline => {
            const color = (polyline as Inputs.Base.Polyline3 & { color?: string | [number, number, number] }).color;
            if (!color) {
                return undefined;
            }
            return Array.isArray(color) ? this.normalizedColorToHex(color[0], color[1], color[2]) : color;
        });
        const colours = own.some(c => c !== undefined)
            ? this.resolveAllColors(resolved.colours, resolved.polylines.length, strategy).map((shared, index) => own[index] ?? shared)
            : resolved.colours;

        const existingMesh = (resolved.updatable && resolved.polylinesMesh) 
            ? resolved.polylinesMesh.children[0] as pc.Entity
            : undefined;
        
        const polylineEntity = this.drawPolylines(
            existingMesh,
            processedPoints,
            resolved.updatable,
            resolved.size,
            resolved.opacity,
            colours,
            strategy,
            resolved.arrowSize,
            resolved.arrowAngle
        );
        
        return this.wrapPolylineInGroup(polylineEntity!, resolved.polylinesMesh, resolved.updatable);
    }

    drawPoint(inputs: Inputs.Point.DrawPointDto<pc.Entity>): pc.Entity {
        const resolved = resolveDto(Inputs.Point.DrawPointDto, inputs) as Resolved.Point.DrawPointDto<pc.Entity>;
        const vectorPoints = [resolved.point];

        const colorsHex: string[] = Array.isArray(resolved.colours) ? resolved.colours : [resolved.colours];
        if (resolved.pointMesh && resolved.updatable) {
            this.updatePointsInstances(resolved.pointMesh, vectorPoints);
        } else {
            resolved.pointMesh = this.createPointSpheresMesh(
                this.generateEntityId("pointMesh"), vectorPoints, colorsHex, resolved.opacity, resolved.size
            );
        }
        return resolved.pointMesh;
    }

    drawPolylineClose(inputs: Inputs.Polyline.DrawPolylineDto<pc.Entity> & { arrowSize?: number | undefined, arrowAngle?: number | undefined }): pc.Entity {
        const resolved = resolveDto(Inputs.Polyline.DrawPolylineDto, inputs) as Resolved.Polyline.DrawPolylineDto<pc.Entity> & { arrowSize?: number | undefined, arrowAngle?: number | undefined };
        const points = resolved.polyline.isClosed
            ? [...resolved.polyline.points, resolved.polyline.points[0]!]
            : resolved.polyline.points;
        return this.drawPolyline(
            resolved.polylineMesh,
            points,
            resolved.updatable,
            resolved.size,
            resolved.opacity,
            resolved.colours,
            resolved.arrowSize,
            resolved.arrowAngle
        );
    }

    drawPolyline(mesh: pc.Entity | undefined,
        pointsToDraw: Inputs.Base.Point3[],
        updatable: boolean, size: number, opacity: number, colours: string | string[],
        arrowSize = 0, arrowAngle = 30): pc.Entity {
        const polylines = this.drawPolylines(mesh, [pointsToDraw], updatable, size, opacity, colours,
            Inputs.Base.colorMapStrategyEnum.lastColorRemainder, arrowSize, arrowAngle);
        if (!mesh) {
            mesh = new pc.Entity(this.generateEntityId("polyline"));
            mesh.addChild(polylines!);
            this.context.scene.addChild(mesh);
        }
        return mesh;
    }

    drawCurve(inputs: Inputs.Verb.DrawCurveDto<pc.Entity>): pc.Entity {
        const resolved = resolveDto(Inputs.Verb.DrawCurveDto, inputs) as Resolved.Verb.DrawCurveDto<pc.Entity>;
        const points = resolved.curve.tessellate();
        return this.drawPolyline(
            resolved.curveMesh,
            points,
            resolved.updatable,
            resolved.size,
            resolved.opacity,
            resolved.colours
        );
    }

    drawPoints(inputs: Inputs.Point.DrawPointsDto<pc.Entity> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined }): pc.Entity {
        const resolved = resolveDto(Inputs.Point.DrawPointsDto, inputs) as Resolved.Point.DrawPointsDto<pc.Entity> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined };
        const vectorPoints = resolved.points;
        const strategy = resolved.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        
        const coloursHex = this.resolveAllColors(resolved.colours, vectorPoints.length, strategy);
        
        if (resolved.pointsMesh && resolved.updatable) {
            const children = resolved.pointsMesh.children;
            if (children.length === vectorPoints.length) {
                this.updatePointsInstances(resolved.pointsMesh, vectorPoints);
            } else {
                resolved.pointsMesh.destroy();
                resolved.pointsMesh = this.createPointSpheresMesh(
                    this.generateEntityId("pointsMesh"), vectorPoints, coloursHex, resolved.opacity, resolved.size
                );
            }
        } else {
            resolved.pointsMesh = this.createPointSpheresMesh(
                this.generateEntityId("pointsMesh"), vectorPoints, coloursHex, resolved.opacity, resolved.size
            );
        }
        return resolved.pointsMesh;
    }

    updatePointsInstances(group: pc.Entity, positions: Inputs.Base.Point3[]): void {
        const children = group.children;
        
        const positionMap = new Map<number, Inputs.Base.Point3>();
        positions.forEach((pos, index) => {
            positionMap.set(index, pos);
        });

        (children as pc.Entity[]).forEach((child: pc.Entity) => {
            if (child.tags?.has("instancedPoints")) {
                const extendedChild = child as pc.Entity & { instanceBuffer?: pc.VertexBuffer; pointIndices?: number[] };
                const instanceBuffer = extendedChild.instanceBuffer;
                const pointIndices = extendedChild.pointIndices;
                
                if (instanceBuffer && pointIndices) {
                    const instanceData = instanceBuffer.lock();
                    if (instanceData) {
                        const floatView = float32ViewOf(instanceData);
                        const tempMat = new pc.Mat4();
                        
                        pointIndices.forEach((originalIndex, instanceIndex) => {
                            const newPos = positionMap.get(originalIndex);
                            if (newPos) {
                                tempMat.setTranslate(newPos[0], newPos[1], newPos[2]);
                                floatView.set(tempMat.data, instanceIndex * 16);
                            }
                        });
                        
                        instanceBuffer.unlock();
                    }
                }
            }
            else if (child.tags?.has("singlePoint")) {
                const idx = parseInt(child.name.split("-").pop() || "0");
                if (positions[idx]) {
                    child.setLocalPosition(positions[idx][0], positions[idx][1], positions[idx][2]);
                }
            }
        });
    }

    drawCurves(inputs: Inputs.Verb.DrawCurvesDto<pc.Entity>): pc.Entity {
        const resolved = resolveDto(Inputs.Verb.DrawCurvesDto, inputs) as Resolved.Verb.DrawCurvesDto<pc.Entity>;
        const points = resolved.curves.map(s => ({ points: s.tessellate() }));
        return this.drawPolylinesWithColours({ polylines: points, polylinesMesh: resolved.curvesMesh, ...resolved });
    }

    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto<pc.Entity> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined }): pc.Entity {
        if (inputs.surfacesMesh && inputs.updatable) {
            this.clearEntity(inputs.surfacesMesh);
        } else {
            inputs.surfacesMesh = new pc.Entity(this.generateEntityId("colouredSurfaces"));
            this.context.scene.addChild(inputs.surfacesMesh);
        }

        const strategy = inputs.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        const resolvedColours = this.resolveAllColors(inputs.colours, inputs.surfaces.length, strategy);

        inputs.surfaces.forEach((surface, index) => {
            const srf = this.drawSurface({
                surface,
                colours: resolvedColours[index]!,
                updatable: inputs.updatable,
                opacity: inputs.opacity,
                hidden: inputs.hidden,
                drawTwoSided: inputs.drawTwoSided,
                backFaceColour: inputs.backFaceColour,
                backFaceOpacity: inputs.backFaceOpacity,
            });
            inputs.surfacesMesh!.addChild(srf);
        });

        return inputs.surfacesMesh;
    }

    createOrUpdateSurfacesMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] | undefined; colors?: number[] | undefined }[],
        group: pc.Entity | undefined, updatable: boolean, material: pc.StandardMaterial, addToScene: boolean, hidden: boolean
    ): pc.Entity {
        const createMesh = () => {
            const totalPositions: number[] = [];
            let totalNormals: number[] = [];
            const totalIndices: number[] = [];
            const totalUvs: number[] = [];
            const totalColors: number[] = [];
            let indexOffset = 0;

            meshDataConverted.forEach(meshItem => {
                totalPositions.push(...meshItem.positions);
                if (meshItem.normals && meshItem.normals.length > 0) {
                    totalNormals.push(...meshItem.normals);
                }
                if (meshItem.uvs) {
                    totalUvs.push(...meshItem.uvs);
                }
                if (meshItem.colors) {
                    totalColors.push(...meshItem.colors);
                }
                const offsetIndices = meshItem.indices.map(i => i + indexOffset);
                totalIndices.push(...offsetIndices);
                indexOffset += meshItem.positions.length / 3;
            });

            if (totalNormals.length === 0 && totalPositions.length > 0) {
                totalNormals = this.computeNormals(totalPositions, totalIndices);
            }

            const mesh = new pc.Mesh(this.context.app.graphicsDevice);
            mesh.setPositions(totalPositions);
            mesh.setNormals(totalNormals);
            mesh.setIndices(totalIndices);
            if (totalUvs.length > 0) {
                mesh.setUvs(0, totalUvs);
            }
            if (totalColors.length > 0 && totalColors.length === totalPositions.length / 3 * 4) {
                mesh.setColors(totalColors);
            }
            mesh.update(pc.PRIMITIVE_TRIANGLES);
            return mesh;
        };

        if (group && updatable) {
            this.clearEntity(group);
            const mesh = createMesh();
            const meshInstance = new pc.MeshInstance(mesh, material);
            const entity = new pc.Entity(this.generateEntityId("surfaceChild"));
            entity.addComponent("render", {
                meshInstances: [meshInstance]
            });
            group.addChild(entity);
        } else {
            group = new pc.Entity(this.generateEntityId("surface"));
            if (addToScene) {
                this.context.scene.addChild(group);
            }
            const mesh = createMesh();
            const meshInstance = new pc.MeshInstance(mesh, material);
            const entity = new pc.Entity(this.generateEntityId("surfaceChild"));
            entity.addComponent("render", {
                meshInstances: [meshInstance]
            });
            group.addChild(entity);
        }
        if (hidden) {
            group.enabled = false;
        }
        return group;
    }

    private createBackFaceMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] | undefined }[],
        backFaceColour: string,
        backFaceOpacity: number,
        zOffset: number
    ): pc.Entity {
        const backMaterial = this.getOrCreateMaterial(backFaceColour + "-back", backFaceOpacity, zOffset + 0.1, () => {
            const mat = new pc.StandardMaterial();
            mat.name = this.generateEntityId("backFaceMaterial");
            mat.diffuse = this.hexToColor(backFaceColour);
            mat.metalness = 0.4;
            mat.gloss = 0.2;
            mat.opacity = backFaceOpacity;
            if (backFaceOpacity < 1) {
                mat.blendType = pc.BLEND_NORMAL;
            }
            mat.depthBias = zOffset + 0.1;
            mat.slopeDepthBias = zOffset + 0.1;
            mat.update();
            return mat;
        });

        const backFaceData = this.prepareBackFaceMeshData(meshDataConverted);

        const mesh = new pc.Mesh(this.context.app.graphicsDevice);
        mesh.setPositions(backFaceData.positions);
        mesh.setNormals(backFaceData.normals);
        mesh.setIndices(backFaceData.indices);
        if (backFaceData.uvs && backFaceData.uvs.length > 0) {
            mesh.setUvs(0, backFaceData.uvs);
        }
        mesh.update(pc.PRIMITIVE_TRIANGLES);

        const group = new pc.Entity(this.generateEntityId("backFaceSurface"));
        const meshInstance = new pc.MeshInstance(mesh, backMaterial);
        const entity = new pc.Entity(this.generateEntityId("backFaceSurfaceChild"));
        entity.addComponent("render", {
            meshInstances: [meshInstance]
        });
        group.addChild(entity);

        return group;
    }

    drawSurface(inputs: Inputs.Verb.DrawSurfaceDto<pc.Entity>): pc.Entity {
        const resolved = resolveDto(Inputs.Verb.DrawSurfaceDto, inputs) as Resolved.Verb.DrawSurfaceDto<pc.Entity>;
        const meshData = resolved.surface.tessellate();

        const meshDataConverted = {
            positions: [],
            indices: [],
            normals: [],
        };

        let countIndices = 0;
        meshData.faces.forEach((faceIndices: number[]) => {
            countIndices = this.parseFaces(faceIndices, meshData, meshDataConverted, countIndices);
        });

        const color = Array.isArray(resolved.colours) ? resolved.colours[0]! : resolved.colours;
        const pbr = this.getOrCreateMaterial(color, resolved.opacity, 0, () => {
            const material = new pc.StandardMaterial();
            material.name = this.generateEntityId("pbrSurface");
            material.diffuse = this.hexToColor(color);
            material.metalness = 0.5;
            material.gloss = 0.3;
            material.opacity = resolved.opacity;
            if (resolved.opacity < 1) {
                material.blendType = pc.BLEND_NORMAL;
            }
            material.update();
            return material;
        });

        const surfaceEntity = this.createOrUpdateSurfacesMesh(
            [meshDataConverted],
            resolved.surfaceMesh,
            resolved.updatable,
            pbr,
            true,
            resolved.hidden,
        );

        if (resolved.drawTwoSided !== false) {
            const backFaceMesh = this.createBackFaceMesh(
                [meshDataConverted],
                resolved.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                resolved.backFaceOpacity,
                0
            );
            surfaceEntity.addChild(backFaceMesh);
        }

        return surfaceEntity;
    }

    private parseFaces(
        faceIndices: number[],
        meshData: { points: number[][]; normals: number[][]; },
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; },
        countIndices: number): number {
        faceIndices.forEach((x) => {
            const vn = meshData.normals[x]!;
            meshDataConverted.normals.push(vn[0]!, vn[1]!, vn[2]!);
            const pt = meshData.points[x]!;
            meshDataConverted.positions.push(pt[0]!, pt[1]!, pt[2]!);
            meshDataConverted.indices.push(countIndices);
            countIndices++;
        });
        return countIndices;
    }

    private makeMesh(inputs: { updatable: boolean, opacity: number, colour: string, hidden: boolean, drawTwoSided: boolean, backFaceColour: string, backFaceOpacity: number }, meshToUpdate: pc.Entity, res: { positions: number[]; normals: number[]; indices: number[]; transforms: []; }): pc.Entity {
        const pbr = this.getOrCreateMaterial(inputs.colour, inputs.opacity, 0, () => {
            const material = new pc.StandardMaterial();
            material.name = this.generateEntityId("jscadMaterial");
            material.diffuse = this.hexToColor(inputs.colour);
            material.metalness = 0.4;
            material.gloss = 0.4;
            material.opacity = inputs.opacity;
            if (inputs.opacity < 1) {
                material.blendType = pc.BLEND_NORMAL;
            }
            material.update();
            return material;
        });

        this.createMesh(res.positions, res.indices, res.normals, meshToUpdate, res.transforms, inputs.updatable, pbr);

        if (inputs.drawTwoSided !== false) {
            const backFaceMesh = this.createBackFaceMesh(
                [{ positions: res.positions, indices: res.indices, normals: res.normals }],
                inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                inputs.backFaceOpacity,
                0
            );
            meshToUpdate.addChild(backFaceMesh);
        }

        if (inputs.hidden) {
            meshToUpdate.enabled = false;
        }
        return meshToUpdate;
    }

    private createMesh(
        positions: number[], indices: number[], normals: number[], jscadMesh: pc.Entity, transforms: number[], _updatable: boolean, material: pc.StandardMaterial
    ): void {
        const mesh = new pc.Mesh(this.context.app.graphicsDevice);
        mesh.setPositions(positions);
        mesh.setIndices(indices);
        
        if (!normals || normals.length === 0) {
            const computedNormals = this.computeNormals(positions, indices);
            mesh.setNormals(computedNormals);
        } else {
            mesh.setNormals(normals);
        }
        
        mesh.update(pc.PRIMITIVE_TRIANGLES);
        
        const meshInstance = new pc.MeshInstance(mesh, material);
        this.clearEntity(jscadMesh);
        
        const entity = new pc.Entity(this.generateEntityId("jscadMeshChild"));
        entity.addComponent("render", {
            meshInstances: [meshInstance]
        });
        jscadMesh.addChild(entity);
        
        if (transforms && transforms.length === 16) {
            const mat4 = new pc.Mat4();
            mat4.data = new Float32Array(transforms);
            const pos = new pc.Vec3();
            const rot = new pc.Quat();
            const scale = new pc.Vec3();
            mat4.getTranslation(pos);
            mat4.getScale(scale);
            rot.setFromMat4(mat4);
            jscadMesh.setLocalPosition(pos);
            jscadMesh.setLocalRotation(rot);
            jscadMesh.setLocalScale(scale);
        }
    }

    /**
     * Draws a kernel shape in its appearance: one entity whose faces take their looks, a mesh
     * instance and a material each, its back faces when asked, and its edges once, each in its color.
     * @param entity - The shape with its appearance
     * @param options - The drawing options; the face color is the color of faces no look colors
     * @returns The entity holding the shape, added to the scene
     */
    async drawShapeWithAppearance(entity: Inputs.Draw.ShapeWithAppearance, options: Inputs.Draw.DrawOcctShapeOptions): Promise<pc.Entity> {
        const resolved = resolveDto(Inputs.Draw.DrawOcctShapeOptions, options) as Resolved.Draw.DrawOcctShapeOptions;
        const [mesh] = await this.meshShapesForLooks([entity.shape], resolved);
        const shapeGroup = this.lookedShapeEntity(mesh!, entity.appearance, resolved);
        this.context.scene.addChild(shapeGroup);
        return shapeGroup;
    }

    /**
     * Draws kernel shapes in their appearance, all meshed in one call to the worker, each as
     * `drawShapeWithAppearance` draws one.
     * @param entities - The shapes with their appearance
     * @param options - The drawing options; the face color is the color of faces no look colors
     * @returns An entity holding one entity per shape, in order, added to the scene
     */
    async drawShapesWithAppearance(entities: readonly Inputs.Draw.ShapeWithAppearance[], options: Inputs.Draw.DrawOcctShapeOptions): Promise<pc.Entity> {
        const resolved = resolveDto(Inputs.Draw.DrawOcctShapeOptions, options) as Resolved.Draw.DrawOcctShapeOptions;
        const meshes = await this.meshShapesForLooks(entities.map(entity => entity.shape), resolved);
        const container = new pc.Entity(this.generateEntityId("shapesWithAppearanceContainer"));
        entities.forEach((entity, index) => {
            container.addChild(this.lookedShapeEntity(meshes[index]!, entity.appearance, resolved));
        });
        this.context.scene.addChild(container);
        return container;
    }

    /**
     * Draws what `occt.design.build` returns. Every part is meshed once, in one call to the worker,
     * into one entity with a mesh instance per look and one for its edges, and every placement is a
     * hardware instance of each, from one buffer of matrices per part. Given the entity an earlier
     * build drew, it redraws in place: when the same parts sit at the same paths, it only moves
     * them, and otherwise it keeps what it drew for every part whose shape and appearance are
     * unchanged under the same options, places it again, and meshes and draws only the rest.
     * @param build - The build to draw
     * @param drawOptions - The drawing options; the face color is the color of faces no look colors
     * @param previous - The entity an earlier build drew, to redraw in place
     * @returns The entity holding the build: `previous` when given, else a new entity added to the scene
     */
    async drawDesignBuild(build: Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>, drawOptions: Inputs.Draw.DrawOcctShapeOptions, previous?: pc.Entity): Promise<pc.Entity> {
        const options = resolveDto(Inputs.Draw.DrawOcctShapeOptions, drawOptions) as Resolved.Draw.DrawOcctShapeOptions;
        const state = previous ? this.designStates.get(previous) : undefined;
        const plan = designDrawPlanOf(build, options, state);
        if (previous && state && plan.posesOnly) {
            this.poseDesign(state, plan.placements);
            return previous;
        }
        const meshes = await designMeshesOf(plan, options, state, this.meshingTextOf(options), this.designMeshes, parts => this.meshShapesForLooks(parts.map(part => part.shape), options));
        const looks = designOptionsKeyOf(options);
        const kept = new Map(state && state.looks === looks && state.precision === options.precision
            ? state.parts.filter(drawn => plan.parts.has(drawn.part) && plan.placements.has(drawn.part) && drawn.key === designPartKeyOf(plan.parts.get(drawn.part)!)).map(drawn => [drawn.part, drawn])
            : []);
        const target = previous && state ? previous : this.newDesignRoot();
        if (state && target === previous) {
            this.clearDesign(state.parts.filter(drawn => kept.get(drawn.part) !== drawn));
        }
        const drawnParts = this.fillDesign(target, plan.parts, plan.placements, plan.placed, meshes, options, kept);
        this.designStates.set(target, { placements: plan.placements, meshes: meshesByKeyOf(plan, meshes), signature: plan.signature, looks, precision: options.precision, parts: drawnParts });
        return target;
    }


    /**
     * The meshes this drawer keeps for design parts with the given shape hashes, as it meshed them for
     * these drawing options, so a caller can store them and hand them back with `keepDesignMeshes`.
     * @param shapeHashes - The parts' shape hashes, as a design build gives them
     * @param drawOptions - The options the parts were drawn with
     * @returns The meshes it keeps, each with its part's shape hash; a part it has not meshed for these options is left out
     */
    keptDesignMeshes(shapeHashes: readonly string[], drawOptions: Inputs.Draw.DrawOcctShapeOptions): KeptDesignMesh<Inputs.OCCT.DecomposedMeshDto>[] {
        const resolved = resolveDto(Inputs.Draw.DrawOcctShapeOptions, drawOptions) as Resolved.Draw.DrawOcctShapeOptions;
        const meshing = this.meshingTextOf(resolved);
        return shapeHashes.flatMap(shapeHash => {
            const mesh = this.designMeshes.get(keptMeshKeyOf(shapeHash, meshing));
            return mesh === undefined ? [] : [{ shapeHash, mesh }];
        });
    }

    /**
     * Keeps meshes a caller stored for design parts, so the parts with these shape hashes are drawn with
     * these options without being meshed again. A mesh that is not one of faces and edges is passed over.
     * @param meshes - The meshes, each with its part's shape hash
     * @param drawOptions - The options the meshes were made for
     */
    keepDesignMeshes(meshes: readonly KeptDesignMesh<unknown>[], drawOptions: Inputs.Draw.DrawOcctShapeOptions): void {
        const resolved = resolveDto(Inputs.Draw.DrawOcctShapeOptions, drawOptions) as Resolved.Draw.DrawOcctShapeOptions;
        const meshing = this.meshingTextOf(resolved);
        meshes.forEach(({ shapeHash, mesh }) => {
            if (this.isMeshOfFacesAndEdges(mesh)) {
                this.designMeshes.set(keptMeshKeyOf(shapeHash, meshing), mesh);
            }
        });
    }

    private meshingForLooks(options: Resolved.Draw.DrawOcctShapeOptions): Omit<Omit<Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">, "faceMaterial"> {
        const resolved = resolveDto(Inputs.OCCT.DrawShapeDto, options) as Omit<Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">;
        return this.getMeshingOptions({ ...resolved, drawIsoCurves: false, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.none });
    }

    private meshingTextOf(options: Resolved.Draw.DrawOcctShapeOptions): string {
        return JSON.stringify(this.meshingForLooks(options));
    }

    private async meshShapesForLooks(shapes: Inputs.OCCT.TopoDSShapePointer[], options: Resolved.Draw.DrawOcctShapeOptions): Promise<Inputs.OCCT.DecomposedMeshDto[]> {
        const meshing = this.meshingForLooks(options);
        const meshes: unknown = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", { ...meshing, shapes });
        if (!Array.isArray(meshes) || meshes.length !== shapes.length || !meshes.every(mesh => this.isMeshOfFacesAndEdges(mesh))) {
            throw new Error(`Meshing ${shapes.length} shapes did not return one mesh of faces and edges per shape.`);
        }
        return meshes;
    }

    private isMeshOfFacesAndEdges(mesh: unknown): mesh is Inputs.OCCT.DecomposedMeshDto {
        return typeof mesh === "object" && mesh !== null && Array.isArray((mesh as Record<string, unknown>)["faceList"]) && Array.isArray((mesh as Record<string, unknown>)["edgeList"]);
    }

    private lookedShapeEntity(mesh: Inputs.OCCT.DecomposedMeshDto, appearance: Inputs.Draw.ShapeWithAppearance["appearance"], options: Resolved.Draw.DrawOcctShapeOptions): pc.Entity {
        const shapeGroup = new pc.Entity(this.generateEntityId("brepMeshWithAppearance"));
        const zOffset = options.drawEdges ? 2 : 0;
        if (options.drawFaces && mesh.faceList.length > 0) {
            const looks = lookGroupsOf(appearance, mesh.faceList.map(face => face.faceIndex), options.faceColour);
            shapeGroup.addChild(this.lookedEntity(lookMeshesOf(mesh, looks), options.faceOpacity, zOffset));
            if (options.drawTwoSided) {
                const meshData = mesh.faceList.map(face => ({ positions: face.vertexCoord, normals: face.normalCoord, indices: face.triIndexes }));
                shapeGroup.addChild(this.createBackFaceMesh(meshData, options.backFaceColour || DEFAULT_COLORS.BACK_FACE, options.backFaceOpacity, zOffset));
            }
        }
        if (options.drawEdges && mesh.edgeList.length > 0) {
            const line = this.partEdges(mesh, appearance, options);
            if (line) {
                shapeGroup.addChild(line);
            }
        }
        return shapeGroup;
    }

    private partEdges(mesh: Inputs.OCCT.DecomposedMeshDto, appearance: Inputs.Draw.ShapeWithAppearance["appearance"], options: Resolved.Draw.DrawOcctShapeOptions): pc.Entity | undefined {
        const fallback = defaultEdgeColor(appearance?.color ?? options.faceColour, options.edgeColour, options.edgeContrast);
        const colors = edgeColorsOf(appearance, mesh.edgeList.map(edge => edge.edgeIndex), fallback);
        return this.drawPolylines(undefined, mesh.edgeList.map(edge => edge.vertexCoord.filter(point => point !== undefined)), false, options.edgeWidth, options.edgeOpacity, colors);
    }

    private lookedEntity(lookMeshes: readonly LookMesh[], faceOpacity: number, zOffset: number): pc.Entity {
        const drawn = lookMeshes.filter(look => look.indices.length > 0);
        const entity: LookedEntity = new pc.Entity(this.generateEntityId("lookedSurface"));
        entity.addComponent("render", {
            meshInstances: drawn.map(look => {
                const mesh = new pc.Mesh(this.context.app.graphicsDevice);
                mesh.setPositions(look.positions);
                mesh.setNormals(look.normals);
                mesh.setIndices(look.indices);
                mesh.update(pc.PRIMITIVE_TRIANGLES);
                return new pc.MeshInstance(mesh, this.lookMaterial(look.group.look, faceOpacity, zOffset));
            }),
        });
        entity.faceRanges = drawn.map(look => look.faceRanges);
        return entity;
    }

    private lookMaterial(look: FaceLook, faceOpacity: number, zOffset: number): pc.StandardMaterial {
        const opacity = look.opacity * faceOpacity;
        return this.getOrCreateMaterial(`look:${look.color}:${look.metallic ?? "-"}:${look.roughness ?? "-"}:${look.emissive ?? "-"}:${look.emissiveStrength ?? "-"}`, opacity, zOffset, () => {
            const material = new pc.StandardMaterial();
            material.diffuse = this.hexToColor(look.color);
            if (look.emissive !== undefined) {
                material.emissive = this.hexToColor(look.emissive);
                material.emissiveIntensity = look.emissiveStrength ?? 1;
            }
            material.metalness = look.metallic ?? 0.4;
            material.useMetalness = look.metallic !== undefined;
            material.gloss = look.roughness === undefined ? 0.2 : 1 - look.roughness;
            material.opacity = opacity;
            if (opacity < 1) {
                material.blendType = pc.BLEND_NORMAL;
                material.depthWrite = false;
            }
            material.depthBias = zOffset;
            material.slopeDepthBias = zOffset;
            material.update();
            return material;
        });
    }

    private newDesignRoot(): pc.Entity {
        const root = new pc.Entity(this.generateEntityId("designBuild"));
        this.context.scene.addChild(root);
        return root;
    }

    private fillDesign(target: pc.Entity, parts: ReadonlyMap<string, Inputs.Draw.ShapeWithAppearance & { shapeHash?: string }>, placements: Map<string, PartPlacement[]>, placed: readonly string[], meshes: ReadonlyMap<string, Inputs.OCCT.DecomposedMeshDto>, options: Resolved.Draw.DrawOcctShapeOptions, kept: ReadonlyMap<string, DesignPartDrawn>): DesignPartDrawn[] {
        const zOffset = options.drawEdges ? 2 : 0;
        const device = this.context.app.graphicsDevice;
        return placed.map((id): DesignPartDrawn => {
            const part = parts.get(id)!;
            const partPlacements = placements.get(id)!;
            const matrices = new Float32Array(partPlacements.length * 16);
            partPlacements.forEach((placement, index) => matrices.set(placement.world, index * 16));
            const reused = kept.get(id);
            const sameCount = reused !== undefined && reused.matrices.length === matrices.length;
            if (reused && !sameCount) {
                reused.buffer.destroy();
            }
            const buffer = reused && sameCount ? reused.buffer : new pc.VertexBuffer(device, pc.VertexFormat.getDefaultInstancingFormat(device), partPlacements.length, { usage: pc.BUFFER_DYNAMIC });
            this.writeInstances(buffer, matrices);
            const entity: DesignPartEntity = reused ? reused.entity : new pc.Entity(this.generateEntityId("designPart"));
            entity.designPart = { part: id, paths: partPlacements.map(placement => placement.path) };
            const mesh = reused ? undefined : meshes.get(id)!;
            const faces = reused ? reused.faces : mesh && options.drawFaces && mesh.faceList.length > 0
                ? this.lookedEntity(lookMeshesOf(mesh, lookGroupsOf(part.appearance, mesh.faceList.map(face => face.faceIndex), options.faceColour)), options.faceOpacity, zOffset)
                : undefined;
            const edges = reused ? reused.edges : mesh && options.drawEdges && mesh.edgeList.length > 0 ? this.partEdges(mesh, part.appearance, options) : undefined;
            for (const drawn of [faces, edges]) {
                if (drawn) {
                    if (!reused) {
                        entity.addChild(drawn);
                    }
                    for (const meshInstance of drawn.render?.meshInstances ?? []) {
                        meshInstance.setInstancing(buffer);
                        meshInstance.instancingCount = partPlacements.length;
                    }
                }
            }
            if (!reused) {
                target.addChild(entity);
            }
            return { part: id, key: designPartKeyOf(part), matrices, buffer, entity, faces, edges };
        });
    }

    private writeInstances(buffer: pc.VertexBuffer, matrices: Float32Array): void {
        const locked = buffer.lock();
        if (locked) {
            float32ViewOf(locked).set(matrices);
            buffer.unlock();
        }
    }

    private poseDesign(state: DesignDrawState, placements: Map<string, PartPlacement[]>): void {
        for (const drawn of state.parts) {
            placements.get(drawn.part)!.forEach((placement, index) => drawn.matrices.set(placement.world, index * 16));
            this.writeInstances(drawn.buffer, drawn.matrices);
        }
        state.placements = placements;
    }

    private clearDesign(parts: readonly DesignPartDrawn[]): void {
        for (const drawn of parts) {
            const lineMaterials = (drawn.edges?.render?.meshInstances ?? []).map(meshInstance => meshInstance.material);
            drawn.entity.destroy();
            lineMaterials.forEach(material => material.destroy());
            drawn.buffer.destroy();
        }
    }

    async handleDecomposedMesh(inputs: Omit<Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>): Promise<pc.Entity> {
        const resolved = resolveDto(Inputs.OCCT.DrawShapeDto, inputs) as Omit<Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">;
        const resolvedOptions = resolveDto(Inputs.Draw.DrawOcctShapeOptions, options) as Resolved.Draw.DrawOcctShapeOptions;
        const shapeGroup = new pc.Entity(this.generateEntityId("brepMesh"));
        this.context.scene.addChild(shapeGroup);
        const linesOnFaces = resolved.drawEdges || resolved.drawIsoCurves;

        const hex = Array.isArray(resolved.faceColour) ? resolved.faceColour[0] : resolved.faceColour;
        if (resolved.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {

            let pbr: pc.StandardMaterial;
            const alpha = resolved.faceOpacity;
            const zOffset = linesOnFaces ? 2 : 0;
            const slopeOffset = linesOnFaces ? 2 : 0;
            const analysisColors = this.surfaceAnalysisColors(decomposedMesh, hex, resolved.analysisMin, resolved.analysisMax, 4);

            if (analysisColors) {
                pbr = this.getOrCreateAnalysisMaterial(alpha, zOffset);
            } else if (resolvedOptions.faceMaterial) {
                pbr = resolvedOptions.faceMaterial;
            } else {
                pbr = this.getOrCreateMaterial(hex, alpha, zOffset, () => {
                    const pbmat = new pc.StandardMaterial();
                    pbmat.diffuse = this.hexToColor(hex);
                    pbmat.metalness = 0.4;
                    pbmat.gloss = 0.2;
                    pbmat.opacity = alpha;
                    pbmat.depthBias = zOffset;
                    pbmat.slopeDepthBias = slopeOffset;
                    pbmat.update();
                    return pbmat;
                });
            }

            const meshData = decomposedMesh.faceList.map((face, index) => {
                return {
                    positions: face.vertexCoord,
                    normals: face.normalCoord,
                    indices: face.triIndexes,
                    uvs: face.uvs,
                    colors: analysisColors?.[index],
                };
            });

            const colorGroups = decomposedMesh.colorGroups;
            const mesh = !analysisColors && !resolvedOptions.faceMaterial && colorGroups && Object.keys(colorGroups).length > 0
                ? this.lookedEntity(lookMeshesOf(decomposedMesh, lookGroupsOfColors(colorGroups, decomposedMesh.faceList.map(face => face.faceIndex), hex)), alpha, zOffset)
                : this.createOrUpdateSurfacesMesh(meshData, undefined, false, pbr, false, false);
            shapeGroup.addChild(mesh);

            if (resolved.drawTwoSided !== false) {
                const backFaceMesh = this.createBackFaceMesh(
                    meshData, 
                    resolved.backFaceColour || DEFAULT_COLORS.BACK_FACE, 
                    resolved.backFaceOpacity,
                    zOffset
                );
                shapeGroup.addChild(backFaceMesh);
            }
        }
        if (resolved.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {

            const polylineEdgePoints: Inputs.Base.Point3[][] = [];
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertexCoord.filter(s => s !== undefined);
                polylineEdgePoints.push(ev);
            });
            const line = this.drawPolylines(
                undefined, 
                polylineEdgePoints, 
                false, 
                resolved.edgeWidth, 
                resolved.edgeOpacity, 
                defaultEdgeColor(hex, resolved.edgeColour, resolvedOptions.edgeContrast),
                Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                resolvedOptions.edgeArrowSize,
                resolvedOptions.edgeArrowAngle
            );
            shapeGroup.addChild(line!);
        }

        if (resolved.drawIsoCurves && decomposedMesh && decomposedMesh.isoCurveList && decomposedMesh.isoCurveList.length) {
            const line = this.drawPolylines(undefined, decomposedMesh.isoCurveList, false, resolved.edgeWidth, resolved.edgeOpacity, resolved.isoCurvesColour)!;
            line.name = this.generateEntityId("isoCurves");
            shapeGroup.addChild(line);
        }

        if (resolved.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: resolved.vertexSize,
                colours: resolved.vertexColour,
                updatable: false,
            });
            shapeGroup.addChild(mesh);
        }

        if (resolved.drawEdgeIndexes) {
            const promises = decomposedMesh.edgeList.map(async (edge) => {
                let edgeMiddle = edge.middlePoint;
                if (edgeMiddle === undefined) {
                    edgeMiddle = this.computeEdgeMiddlePos(edge);
                }
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${edge.edgeIndex}`;
                tdto.height = resolved.edgeIndexHeight;
                tdto.lineSpacing = 1.5;
                const t = await this.solidText.createVectorText(tdto);
                const texts = t.map(s => {
                    const res = s.map(c => {
                        return [
                            c[0],
                            c[1] + 0.05,
                            0
                        ] as Inputs.Base.Vector3;
                    });
                    const movedOnPosition = res.map(r => this.vector.add({ first: r, second: edgeMiddle }));
                    return movedOnPosition as Inputs.Base.Vector3[];
                });

                return texts;
            });
            const textPolylines = await Promise.all(promises);
            const edgeMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 0.2, 1, resolved.edgeIndexColour);
            shapeGroup.addChild(edgeMesh!);
        }
        if (resolved.drawFaceIndexes) {
            const promises = decomposedMesh.faceList.map(async (face) => {
                let faceMiddle = face.centerPoint;
                if (faceMiddle === undefined) {
                    faceMiddle = this.computeFaceMiddlePos(face.vertexCoordVec) as Inputs.Base.Point3;
                }
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${face.faceIndex}`;
                tdto.height = resolved.faceIndexHeight;
                tdto.lineSpacing = 1.5;
                const t = await this.solidText.createVectorText(tdto);
                const texts = t.map(s => {
                    const res = s.map(c => {
                        return [
                            c[0],
                            c[1] + 0.05,
                            0
                        ] as Inputs.Base.Point3;
                    });
                    const movedOnPosition = res.map(r => this.vector.add({ first: r, second: faceMiddle }));
                    return movedOnPosition as Inputs.Base.Point3[];
                });
                return texts;
            });
            const textPolylines = await Promise.all(promises);

            const faceMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 0.2, 1, resolved.faceIndexColour);
            shapeGroup.addChild(faceMesh!);
        }
        return shapeGroup;
    }

    async handleDecomposedMeshIndividually(inputs: Omit<Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>): Promise<pc.Entity> {
        const resolved = resolveDto(Inputs.OCCT.DrawShapeDto, inputs) as Omit<Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">;
        const resolvedOptions = resolveDto(Inputs.Draw.DrawOcctShapeOptions, options) as Resolved.Draw.DrawOcctShapeOptions;
        const shapeGroup = new pc.Entity(this.generateEntityId("brepMesh"));
        this.context.scene.addChild(shapeGroup);

        const hex = Array.isArray(resolved.faceColour) ? resolved.faceColour[0] : resolved.faceColour;
        if (resolved.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {
            const alpha = resolved.faceOpacity;
            const zOffset = resolved.drawEdges || resolved.drawIsoCurves ? 2 : 0;
            const slopeOffset = zOffset;
            const analysisColors = this.surfaceAnalysisColors(decomposedMesh, hex, resolved.analysisMin, resolved.analysisMax, 4);

            let pbr: pc.StandardMaterial;
            if (analysisColors) {
                pbr = this.getOrCreateAnalysisMaterial(alpha, zOffset);
            } else if (resolvedOptions.faceMaterial) {
                pbr = resolvedOptions.faceMaterial;
            } else {
                pbr = this.getOrCreateMaterial(hex, alpha, zOffset, () => {
                    const pbmat = new pc.StandardMaterial();
                    pbmat.diffuse = this.hexToColor(hex);
                    pbmat.metalness = 0.4;
                    pbmat.gloss = 0.2;
                    pbmat.opacity = alpha;
                    pbmat.depthBias = zOffset;
                    pbmat.slopeDepthBias = slopeOffset;
                    pbmat.update();
                    return pbmat;
                });
            }

            decomposedMesh.faceList.forEach((face, index) => {
                const meshData = [{
                    positions: [...face.vertexCoord],
                    normals: [...face.normalCoord],
                    indices: [...face.triIndexes],
                    uvs: face.uvs ? [...face.uvs] : undefined,
                    colors: analysisColors?.[index],
                }];

                if (resolved.drawTwoSided !== false) {
                    const backFaceMesh = this.createBackFaceMesh(
                        meshData,
                        resolved.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                        resolved.backFaceOpacity,
                        zOffset
                    );
                    backFaceMesh.name = `face ${face.faceIndex} backFace`;
                    shapeGroup.addChild(backFaceMesh);
                }

                const faceMesh = this.createOrUpdateSurfacesMesh(meshData, undefined, false, pbr, false, false);
                faceMesh.name = `face ${face.faceIndex}`;
                shapeGroup.addChild(faceMesh);
            });
        }

        if (resolved.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {
            const edgeColour = defaultEdgeColor(hex, resolved.edgeColour, resolvedOptions.edgeContrast);
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertexCoord.filter(s => s !== undefined);
                const line = this.drawPolylines(
                    undefined,
                    [ev],
                    false,
                    resolved.edgeWidth,
                    resolved.edgeOpacity,
                    edgeColour,
                    Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                    resolvedOptions.edgeArrowSize,
                    resolvedOptions.edgeArrowAngle
                );
                if (line) {
                    line.name = `edge ${edge.edgeIndex}`;
                    shapeGroup.addChild(line);
                }
            });
        }

        if (resolved.drawIsoCurves && decomposedMesh && decomposedMesh.isoCurveList && decomposedMesh.isoCurveList.length) {
            const line = this.drawPolylines(undefined, decomposedMesh.isoCurveList, false, resolved.edgeWidth, resolved.edgeOpacity, resolved.isoCurvesColour)!;
            line.name = "iso curves";
            shapeGroup.addChild(line);
        }

        if (resolved.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: resolved.vertexSize,
                colours: resolved.vertexColour,
                updatable: false,
            });
            mesh.name = "vertices";
            shapeGroup.addChild(mesh);
        }

        return shapeGroup;
    }

    private canUpdatePolylineEntity(
        entity: pc.Entity | undefined, 
        polylinePoints: Inputs.Base.Vector3[][],
        updatable: boolean
    ): entity is PolylineEntity {
        if (!entity || !updatable) {
            return false;
        }
        
        const polylineEntity = entity as PolylineEntity;
        const newSignature = super.computePolylineSignature(polylinePoints);
        const oldSignature = polylineEntity.bitbybitMeta?.linesForRenderLengths;
        
        return oldSignature === newSignature;
    }

    private updatePolylineEntityPositions(
        entity: pc.Entity, 
        linePositions: number[],
        vertexColors: number[]
    ): boolean {
        const renderComponent = entity.render;
        if (!renderComponent?.meshInstances?.[0]?.mesh) {
            console.warn("Cannot update polyline: missing render component or mesh");
            return false;
        }
        
        try {
            const mesh = renderComponent.meshInstances[0].mesh;
            mesh.setPositions(linePositions);
            mesh.setColors32(vertexColors);
            mesh.update(pc.PRIMITIVE_LINES);
            return true;
        } catch (error) {
            console.error("Error updating polyline positions:", error);
            return false;
        }
    }

    private computeLinePositionsWithSegmentCounts(polylinesPoints: Inputs.Base.Vector3[][]): {
        positions: number[];
        segmentCounts: number[];
    } {
        const linePositions: number[] = [];
        const segmentCounts: number[] = [];
        
        for (const points of polylinesPoints) {
            let segmentCount = 0;
            for (let i = 0; i < points.length - 1; i++) {
                const current = points[i]!;
                const next = points[i + 1]!;
                
                linePositions.push(current[0], current[1], current[2]);
                linePositions.push(next[0], next[1], next[2]);
                segmentCount++;
            }
            segmentCounts.push(segmentCount);
        }
        
        return { positions: linePositions, segmentCounts };
    }

    private createPolylineEntityWithExplicitColors(
        linePositions: number[],
        _size: number,
        polylinePoints: Inputs.Base.Vector3[][],
        segmentCounts: number[],
        explicitColors: string[]
    ): PolylineEntity {
        const entity = this.createLineEntityWithExplicitColors(linePositions, segmentCounts, explicitColors) as PolylineEntity;
        entity.bitbybitMeta = {
            linesForRenderLengths: this.computePolylineSignature(polylinePoints)
        };
        return entity;
    }

    private computePolylineColorsWithExplicit(
        segmentCounts: number[],
        explicitColors: string[]
    ): number[] {
        const lineColors: number[] = [];
        
        segmentCounts.forEach((segmentCount, index) => {
            const colorHex = explicitColors[index] || explicitColors[0] || "#ff0000";
            const color = this.hexToColor(colorHex);
            
            for (let i = 0; i < segmentCount * 2; i++) {
                lineColors.push(
                    Math.round(color.r * 255),
                    Math.round(color.g * 255),
                    Math.round(color.b * 255),
                    255
                );
            }
        });
        
        return lineColors;
    }

    private createLineEntityWithExplicitColors(
        linePositions: number[],
        segmentCounts: number[],
        explicitColors: string[]
    ): pc.Entity {
        const mesh = new pc.Mesh(this.context.app.graphicsDevice);
        mesh.setPositions(linePositions);
        
        const vertexColors = this.computePolylineColorsWithExplicit(segmentCounts, explicitColors);
        mesh.setColors32(vertexColors);
        
        mesh.update(pc.PRIMITIVE_LINES);

        const mat = new pc.StandardMaterial();
        mat.diffuseVertexColor = true;
        mat.emissiveVertexColor = true;
        Object.assign(mat, { vertexColorGamma: true });
        mat.diffuse = new pc.Color(1, 1, 1);
        mat.emissive = new pc.Color(1, 1, 1);
        mat.useLighting = false;
        mat.update();

        const meshInstance = new pc.MeshInstance(mesh, mat);
        const lineEntity = new pc.Entity(this.generateEntityId("lines"));
        lineEntity.addComponent("render", {
            meshInstances: [meshInstance],
            castShadows: false
        });
        return lineEntity;
    }

    private drawPolylines(
        existingEntity: pc.Entity | undefined, 
        polylinesPoints: Inputs.Base.Vector3[][], 
        updatable: boolean,
        size: number, 
        _opacity: number, 
        colours: string | string[],
        colorMapStrategy: Inputs.Base.colorMapStrategyEnum = Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
        arrowSize = 0,
        arrowAngle = 30
    ): pc.Entity | undefined {
        if (!polylinesPoints || polylinesPoints.length === 0) {
            return undefined;
        }
        
        const arrowLinePoints: Inputs.Base.Vector3[][] = [];
        const arrowLineColors: string[] = [];
        
        if (arrowSize > 0) {
            polylinesPoints.forEach((pts, polylineIndex) => {
                if (pts.length >= 2) {
                    const arrowLines = this.computeArrowHeadLines(pts, arrowSize, arrowAngle);
                    const polylineColor = this.resolveColorForEntity(colours, polylineIndex, polylinesPoints.length, colorMapStrategy);
                    arrowLines.forEach(arrowLine => {
                        arrowLinePoints.push(arrowLine);
                        arrowLineColors.push(polylineColor);
                    });
                }
            });
        }
        
        const allPolylinePoints = [...polylinesPoints, ...arrowLinePoints];
        
        const { positions: linePositions, segmentCounts } = this.computeLinePositionsWithSegmentCounts(allPolylinePoints);
        
        const resolvedPolylineColors = this.resolveAllColors(colours, polylinesPoints.length, colorMapStrategy);
        const allExplicitColors = [...resolvedPolylineColors, ...arrowLineColors];
        
        if (this.canUpdatePolylineEntity(existingEntity, polylinesPoints, updatable)) {
            if (this.updatePolylineEntityPositions(existingEntity, linePositions, this.computePolylineColorsWithExplicit(segmentCounts, allExplicitColors))) {
                return existingEntity;
            }
            console.warn("Polyline update failed, creating new entity");
        }
        
        return this.createPolylineEntityWithExplicitColors(
            linePositions, 
            size, 
            allPolylinePoints,
            segmentCounts,
            allExplicitColors
        );
    }

    private handleDecomposedManifold(
        decomposedManifold: Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][],
        options: Resolved.Draw.DrawManifoldOrCrossSectionOptions): pc.Entity | undefined {
        if ((decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto).vertProperties) {
            const decomposedMesh = decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto;
            if (decomposedMesh.triVerts.length !== 0) {
                const numProp = decomposedMesh.numProp || 3;
                const vertProperties = decomposedMesh.vertProperties;
                const triVerts = decomposedMesh.triVerts;
                
                let indexedPositions: number[];
                if (numProp === 3) {
                    indexedPositions = Array.from(vertProperties);
                } else {
                    const numVerts = vertProperties.length / numProp;
                    indexedPositions = [];
                    for (let i = 0; i < numVerts; i++) {
                        const baseIdx = i * numProp;
                        indexedPositions.push(vertProperties[baseIdx]!, vertProperties[baseIdx + 1]!, vertProperties[baseIdx + 2]!);
                    }
                }
                
                const positions: number[] = [];
                const normals: number[] = [];
                const indices: number[] = [];
                
                for (let i = 0; i < triVerts.length; i += 3) {
                    const i0 = triVerts[i]!;
                    const i1 = triVerts[i + 1]!;
                    const i2 = triVerts[i + 2]!;
                    
                    const v0x = indexedPositions[i0 * 3]!;
                    const v0y = indexedPositions[i0 * 3 + 1]!;
                    const v0z = indexedPositions[i0 * 3 + 2]!;
                    
                    const v1x = indexedPositions[i1 * 3]!;
                    const v1y = indexedPositions[i1 * 3 + 1]!;
                    const v1z = indexedPositions[i1 * 3 + 2]!;
                    
                    const v2x = indexedPositions[i2 * 3]!;
                    const v2y = indexedPositions[i2 * 3 + 1]!;
                    const v2z = indexedPositions[i2 * 3 + 2]!;
                    
                    const e1x = v1x - v0x;
                    const e1y = v1y - v0y;
                    const e1z = v1z - v0z;
                    
                    const e2x = v2x - v0x;
                    const e2y = v2y - v0y;
                    const e2z = v2z - v0z;
                    
                    let nx = e1y * e2z - e1z * e2y;
                    let ny = e1z * e2x - e1x * e2z;
                    let nz = e1x * e2y - e1y * e2x;
                    
                    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
                    if (len > 0) {
                        nx /= len;
                        ny /= len;
                        nz /= len;
                    }
                    
                    const baseIndex = positions.length / 3;
                    
                    positions.push(v0x, v0y, v0z);
                    positions.push(v1x, v1y, v1z);
                    positions.push(v2x, v2y, v2z);
                    
                    normals.push(nx, ny, nz);
                    normals.push(nx, ny, nz);
                    normals.push(nx, ny, nz);
                    
                    indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
                }
                
                const mesh = new pc.Mesh(this.context.app.graphicsDevice);
                mesh.setPositions(positions);
                mesh.setIndices(indices);
                mesh.setNormals(normals);
                mesh.update(pc.PRIMITIVE_TRIANGLES);

                const group = new pc.Entity(this.generateEntityId("manifoldMesh"));

                let material: pc.StandardMaterial;
                if (options.faceMaterial === undefined) {
                    material = this.getOrCreateMaterial(options.faceColour, options.faceOpacity, 0, () => {
                        const mat = new pc.StandardMaterial();
                        mat.name = this.generateEntityId("pbrManifold");
                        mat.diffuse = this.hexToColor(options.faceColour);
                        mat.metalness = 0.5;
                        mat.gloss = 0.3;
                        mat.opacity = options.faceOpacity;
                        mat.update();
                        return mat;
                    });
                } else {
                    material = options.faceMaterial;
                }

                const meshInstance = new pc.MeshInstance(mesh, material);
                const childEntity = new pc.Entity(this.generateEntityId("manifoldMeshChild"));
                childEntity.addComponent("render", {
                    meshInstances: [meshInstance]
                });
                group.addChild(childEntity);

                if (options.drawTwoSided !== false) {
                    const backFaceMesh = this.createBackFaceMesh(
                        [{ positions, indices, normals }],
                        options.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                        options.backFaceOpacity,
                        0
                    );
                    group.addChild(backFaceMesh);
                }
                
                this.context.scene.addChild(group);
                return group;
            } else {
                return undefined;
            }
        } else {
            const decompsoedPolygons = decomposedManifold as Inputs.Base.Vector2[][];
            if (decompsoedPolygons.length > 0) {

                const group = new pc.Entity(this.generateEntityId("manifoldCrossSection"));
                const polylines = decompsoedPolygons.map(polygon => ({
                    points: polygon.map(p => [p[0], p[1], 0] as Inputs.Base.Point3),
                    isClosed: true
                }));
                const polylineMesh = this.drawPolylinesWithColours({
                    polylinesMesh: undefined,
                    polylines,
                    updatable: false,
                    size: options.crossSectionWidth,
                    opacity: options.crossSectionOpacity,
                    colours: options.crossSectionColour
                });
                group.addChild(polylineMesh);
                this.context.scene.addChild(group);
                return group;
            }
            else {
                return undefined;
            }
        }
    }

    private clearEntity(entity: pc.Entity): void {
        while (entity.children.length > 0) {
            const child = entity.children[0]!;
            child.destroy();
        }
    }

    private hexToColor(hex: string): pc.Color {
        const rgb = this.hexToRgb(hex);
        if (rgb) {
            return new pc.Color(rgb.r, rgb.g, rgb.b);
        }
        return new pc.Color(1, 0, 0);
    }

    private getSafeWorkerOptions<T extends { faceMaterial?: pc.StandardMaterial | undefined }>(inputs: T): Omit<T, "faceMaterial"> {
         
        const { faceMaterial, ...safeOptions } = inputs;
        return safeOptions;
    }

    private getMeshingOptions<T extends Omit<Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">>(inputs: T): Omit<T, "faceMaterial"> {
        return {
            ...this.getSafeWorkerOptions(inputs),
            isoCurvesU: inputs.drawIsoCurves ? inputs.isoCurvesU : 0,
            isoCurvesV: inputs.drawIsoCurves ? inputs.isoCurvesV : 0,
            surfaceAnalysis: inputs.drawFaces ? inputs.surfaceAnalysis : Inputs.OCCT.surfaceAnalysisEnum.none,
        };
    }

    private getOrCreateAnalysisMaterial(alpha: number, zOffset: number): pc.StandardMaterial {
        return this.getOrCreateMaterial("#ffffff-analysis", alpha, zOffset, () => {
            const pbmat = new pc.StandardMaterial();
            pbmat.diffuse = new pc.Color(1, 1, 1);
            pbmat.diffuseVertexColor = true;
            pbmat.metalness = 0.4;
            pbmat.gloss = 0.2;
            pbmat.opacity = alpha;
            pbmat.depthBias = zOffset;
            pbmat.slopeDepthBias = zOffset;
            pbmat.update();
            return pbmat;
        });
    }

    private generateEntityId(type: string, parentId?: string): string {
        const id = `${this.instanceId}-${type}-${++this.entityIdCounter}`;
        return parentId ? `${parentId}/${id}` : id;
    }

    private getOrCreateMaterial(
        hex: string,
        alpha: number,
        zOffset: number,
        createFn: () => pc.StandardMaterial,
        unlit = false
    ): pc.StandardMaterial {
        const key = super.getMaterialKey(hex, alpha, zOffset, unlit);

        const cached = this.materialCache.get(key);
        if (cached) {
            return cached;
        }

        if (this.materialCache.size >= CACHE_CONFIG.MAX_MATERIALS) {
            const firstKey = this.materialCache.keys().next().value!;
            const material = this.materialCache.get(firstKey);
            if (material && material.destroy) {
                material.destroy();
            }
            this.materialCache.delete(firstKey);
            console.warn(`Material cache full, evicted: ${firstKey}`);
        }

        const material = createFn();
        this.materialCache.set(key, material);
        return material;
    }

    /**
     * Cleanup method to dispose of cached materials and prevent memory leaks
     * Should be called when the DrawHelper instance is no longer needed
     */
    public dispose(): void {
        this.designMeshes.clear();
        this.materialCache.forEach((material, key) => {
            try {
                if (material.destroy) {
                    material.destroy();
                }
            } catch (error) {
                console.warn(`Error disposing material ${key}:`, error);
            }
        });
        this.materialCache.clear();

        this.entityIdCounter = 0;

        console.log("DrawHelper disposed successfully");
    }

    private wrapPolylineInGroup(
        polylineEntity: pc.Entity, 
        existingGroup?: pc.Entity,
        updatable?: boolean
    ): pc.Entity {
        if (existingGroup && updatable) {
            const previous = existingGroup.children[0];
            if (previous?.name === polylineEntity.name) {
                return existingGroup;
            }
            previous?.destroy();
            existingGroup.addChild(polylineEntity);
            return existingGroup;
        }
        
        const groupId = this.generateEntityId("polylinesGroup");
        const group = new pc.Entity(groupId);
        group.addChild(polylineEntity);
        this.context.scene.addChild(group);
        
        return group;
    }

    private createPointSpheresMesh(
        meshName: string, positions: Inputs.Base.Point3[], colors: string[], opacity: number, size: number): pc.Entity {
        const positionsModel = positions.map((pos, index) => {
            return {
                position: pos,
                color: colors[index],
                index
            };
        });

        const colorSet = Array.from(new Set(colors));
        const materialSet = colorSet.map((colour) => {
            const mat = this.getOrCreateMaterial(colour, opacity, 0, () => {
                const material = new pc.StandardMaterial();
                material.name = this.generateEntityId("mat");
                material.opacity = opacity;
                if (opacity < 1) {
                    material.blendType = pc.BLEND_NORMAL;
                }
                material.emissive = this.hexToColor(colour);
                material.diffuse = this.hexToColor(colour);
                material.useLighting = false;
                material.update();
                return material;
            }, true);
            const positionsFiltered = positionsModel.filter(s => s.color === colour);

            return { hex: colour, material: mat, positions: positionsFiltered };
        });

        const pointsGroup = new pc.Entity(meshName);
        this.context.scene.addChild(pointsGroup);
        
        materialSet.forEach(ms => {
            const pointCount = ms.positions.length;
            if (pointCount === 0) {
                return;
            }
            
            const segments = pointCount > 1000 ? 4 : 8;
            
            const instancedEntity = this.createInstancedSphereMesh(
                this.generateEntityId(`points-${ms.hex}`, meshName),
                ms.positions.map(p => ({ position: p.position, index: p.index })),
                size / 2,
                segments,
                ms.material
            );
            
            instancedEntity.tags?.add("instancedPoints");
            pointsGroup.addChild(instancedEntity);
        });

        return pointsGroup;
    }

    private createInstancedSphereMesh(
        name: string,
        positions: { position: Inputs.Base.Point3; index: number }[],
        radius: number,
        segments: number,
        material: pc.StandardMaterial
    ): pc.Entity {
        const graphicsDevice = this.context.app?.graphicsDevice;
        
        if (!graphicsDevice) {
            return this.createFallbackPointsMesh(name, positions.map(p => p.position), radius, material);
        }

        const instanceCount = positions.length;
        
        const sphereMesh = pc.Mesh.fromGeometry(graphicsDevice, new pc.SphereGeometry({
            radius: radius,
            latitudeBands: segments,
            longitudeBands: segments
        }));
        
        const instanceFormat = pc.VertexFormat.getDefaultInstancingFormat(graphicsDevice);
        const instanceBuffer = new pc.VertexBuffer(
            graphicsDevice,
            instanceFormat,
            instanceCount,
            {
                usage: pc.BUFFER_STATIC
            }
        );
        
        const instanceData = new Float32Array(instanceCount * 16);
        const tempMat = new pc.Mat4();
        
        positions.forEach((pos, i) => {
            tempMat.setTranslate(pos.position[0], pos.position[1], pos.position[2]);
            instanceData.set(tempMat.data, i * 16);
        });
        
        const lockedData = instanceBuffer.lock();
        if (lockedData) {
            float32ViewOf(lockedData).set(instanceData);
            instanceBuffer.unlock();
        }
        
        const meshInstance = new pc.MeshInstance(sphereMesh, material);
        meshInstance.setInstancing(instanceBuffer);
        meshInstance.instancingCount = instanceCount;
        
        meshInstance.castShadow = false;
        meshInstance.receiveShadow = false;
        
        const entity = new pc.Entity(name);
        entity.addComponent("render", {
            meshInstances: [meshInstance],
            castShadows: false,
            receiveShadows: false
        });
        
        entity.tags?.add("instancedPoints");
        (entity as pc.Entity & { instanceBuffer?: pc.VertexBuffer; pointIndices?: number[] }).instanceBuffer = instanceBuffer;
        (entity as pc.Entity & { instanceBuffer?: pc.VertexBuffer; pointIndices?: number[] }).pointIndices = positions.map(p => p.index);
        
        return entity;
    }

    private createFallbackPointsMesh(
        name: string,
        positions: Inputs.Base.Point3[],
        size: number,
        material: pc.StandardMaterial
    ): pc.Entity {
        const group = new pc.Entity(name);
        
        positions.forEach((pos, index) => {
            const sphereEntity = new pc.Entity(this.generateEntityId(`point-${index}`, name));
            sphereEntity.addComponent("render", {
                type: "sphere",
                material: material,
                castShadows: false,
                receiveShadows: false
            });
            sphereEntity.setLocalScale(size * 2, size * 2, size * 2);
            sphereEntity.setLocalPosition(pos[0], pos[1], pos[2]);
            sphereEntity.tags?.add("singlePoint");
            group.addChild(sphereEntity);
        });
        
        return group;
    }

}
