
import { Context } from "./context";
import * as Inputs from "./inputs";
import { DrawHelperCore } from "@bitbybit-dev/core";
import { JSCADText } from "@bitbybit-dev/jscad-worker";
import { Vector } from "@bitbybit-dev/base";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import * as pc from "playcanvas";
import { DEFAULT_COLORS, CACHE_CONFIG } from "./constants";

// Type alias for polyline entities with user data
type PolylineEntity = Inputs.Draw.PolylineEntity;

export class DrawHelper extends DrawHelperCore {

    // Map-based material cache for better performance
    private readonly materialCache = new Map<string, pc.StandardMaterial>();
    
    // Entity ID generation
    private entityIdCounter = 0;
    private readonly instanceId = `pc-${Date.now()}`;

    constructor(
        private readonly context: Context,
        private readonly solidText: JSCADText,
        public readonly vector: Vector,
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
        try {
            const options = this.deleteFaceMaterialForWorker(inputs);
            const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto[] = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", inputs);
            const meshes = decomposedMesh.map(dec => this.handleDecomposedManifold(dec, options)).filter(s => s !== undefined);
            const containerId = this.generateEntityId("manifoldMeshContainer");
            const manifoldMeshContainer = new pc.Entity(containerId);
            meshes.forEach(mesh => {
                manifoldMeshContainer.addChild(mesh);
            });
            this.context.scene.addChild(manifoldMeshContainer);
            return manifoldMeshContainer;
        } catch (error) {
            console.error("Error drawing manifolds or cross sections:", error);
            throw new Error(`Failed to draw manifolds or cross sections: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async drawManifoldOrCrossSection(inputs: Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>): Promise<pc.Entity> {
        try {
            const options = this.deleteFaceMaterialForWorker(inputs);
            const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", inputs);
            return this.handleDecomposedManifold(decomposedMesh, options);
        } catch (error) {
            console.error("Error drawing manifold or cross section:", error);
            throw new Error(`Failed to draw manifold or cross section: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<pc.Entity> {
        try {
            const options = this.deleteFaceMaterialForWorker(inputs);
            const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
            return this.handleDecomposedMesh(inputs, decomposedMesh, options);
        } catch (error) {
            console.error("Error drawing OCCT shape:", error);
            throw new Error(`Failed to draw OCCT shape: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<pc.Entity> {
        try {
            const options = this.deleteFaceMaterialForWorker(inputs);
            const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);
            const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(inputs, decomposedMesh, options)));
            const containerId = this.generateEntityId("shapesMeshContainer");
            const shapesMeshContainer = new pc.Entity(containerId);
            this.context.scene.addChild(shapesMeshContainer);
            meshesSolved.forEach(mesh => {
                shapesMeshContainer.addChild(mesh);
            });
            return shapesMeshContainer;
        } catch (error) {
            console.error("Error drawing OCCT shapes:", error);
            throw new Error(`Failed to draw OCCT shapes: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>): Promise<pc.Entity> {
        try {
            const res: {
                positions: number[],
                normals: number[],
                indices: number[],
                transforms: [],
            } = await this.jscadWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
            
            let meshToUpdate: pc.Entity;
            if (inputs.jscadMesh && inputs.updatable) {
                meshToUpdate = inputs.jscadMesh;
            } else {
                meshToUpdate = new pc.Entity(this.generateEntityId("jscadMesh"));
                this.context.scene.addChild(meshToUpdate);
            }
            
            let colour;
            if (inputs.mesh.color && inputs.mesh.color.length > 0) {
                // if jscad geometry is colorized and color is baked on geometry it will be used over anything that set in the draw options
                const c = inputs.mesh.color;
                colour = this.normalizeColor(c, DEFAULT_COLORS.DEFAULT);
            } else {
                colour = Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours;
            }
            
            const s = this.makeMesh({ 
                ...inputs, 
                colour,
                drawTwoSided: inputs.drawTwoSided,
                backFaceColour: inputs.backFaceColour,
                backFaceOpacity: inputs.backFaceOpacity
            }, meshToUpdate, res);
            inputs.jscadMesh = s;
            return s;
        } catch (error) {
            console.error("Error drawing JSCAD solid or polygon mesh:", error);
            throw new Error(`Failed to draw JSCAD mesh: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>): Promise<pc.Entity> {
        try {
            const res: {
                positions: number[],
                normals: number[],
                indices: number[],
                transforms: [],
                color?: number[]
            }[] = await this.jscadWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);

            let localOrigin: pc.Entity;
            if (inputs.jscadMesh && inputs.updatable) {
                localOrigin = inputs.jscadMesh;
                this.clearEntity(localOrigin);
            } else {
                localOrigin = new pc.Entity(this.generateEntityId("jscadMeshes"));
            }

            const colourIsArrayAndMatches = Array.isArray(inputs.colours) && inputs.colours.length === res.length;
            const colorsAreArrays = Array.isArray(inputs.colours);

            res.forEach((r, index) => {
                const meshToUpdate = new pc.Entity(this.generateEntityId("jscadMesh", localOrigin.name));
                let colour;
                if (r.color) {
                    colour = this.normalizeColor(r.color, DEFAULT_COLORS.DEFAULT);
                } else if (colourIsArrayAndMatches) {
                    colour = inputs.colours[index];
                } else if (colorsAreArrays) {
                    colour = inputs.colours[0];
                } else {
                    colour = inputs.colours;
                }
                const m = this.makeMesh({ 
                    ...inputs, 
                    colour,
                    drawTwoSided: inputs.drawTwoSided,
                    backFaceColour: inputs.backFaceColour,
                    backFaceOpacity: inputs.backFaceOpacity
                }, meshToUpdate, r);
                localOrigin.addChild(m);
            });
            
            this.context.scene.addChild(localOrigin);
            inputs.jscadMesh = localOrigin;
            return localOrigin;
        } catch (error) {
            console.error("Error drawing JSCAD solid or polygon meshes:", error);
            throw new Error(`Failed to draw JSCAD meshes: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Draw multiple polylines with individual colors
     * @param inputs - Polyline drawing inputs
     * @returns Entity containing all polylines
     */
    drawPolylinesWithColours(inputs: Inputs.Polyline.DrawPolylinesDto<pc.Entity> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum, arrowSize?: number, arrowAngle?: number }): pc.Entity {
        const strategy = inputs.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        
        const processedPoints = this.processPolylinePoints(inputs.polylines as Inputs.Base.Polyline3[]);
        
        // Determine if we should update existing mesh
        const existingMesh = (inputs.updatable && inputs.polylinesMesh) 
            ? inputs.polylinesMesh.children[0] as pc.Entity
            : undefined;
        
        // Draw the polylines with per-polyline colors
        const polylineEntity = this.drawPolylines(
            existingMesh,
            processedPoints,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours,
            strategy,
            inputs.arrowSize,
            inputs.arrowAngle
        );
        
        // Wrap in container group
        return this.wrapPolylineInGroup(polylineEntity, inputs.polylinesMesh, inputs.updatable);
    }

    drawPoint(inputs: Inputs.Point.DrawPointDto<pc.Entity>): pc.Entity {
        const vectorPoints = [inputs.point];

        let colorsHex: string[] = [];
        if (Array.isArray(inputs.colours)) {
            colorsHex = inputs.colours;
        } else {
            colorsHex = [inputs.colours];
        }
        if (inputs.pointMesh && inputs.updatable) {
            this.updatePointsInstances(inputs.pointMesh, vectorPoints);
        } else {
            inputs.pointMesh = this.createPointSpheresMesh(
                this.generateEntityId("pointMesh"), vectorPoints, colorsHex, inputs.opacity, inputs.size
            );
        }
        return inputs.pointMesh;
    }

    drawPolylineClose(inputs: Inputs.Polyline.DrawPolylineDto<pc.Entity> & { arrowSize?: number, arrowAngle?: number }): pc.Entity {
        const points = inputs.polyline.points;
        if (inputs.polyline.isClosed) {
            points.push(points[0]);
        }
        return this.drawPolyline(
            inputs.polylineMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours,
            inputs.arrowSize,
            inputs.arrowAngle
        );
    }

    drawPolyline(mesh: pc.Entity,
        pointsToDraw: Inputs.Base.Point3[],
        updatable: boolean, size: number, opacity: number, colours: string | string[],
        arrowSize = 0, arrowAngle = 30): pc.Entity {
        const polylines = this.drawPolylines(mesh, [pointsToDraw], updatable, size, opacity, colours,
            Inputs.Base.colorMapStrategyEnum.lastColorRemainder, arrowSize, arrowAngle);
        if (!mesh) {
            mesh = new pc.Entity(this.generateEntityId("polyline"));
            mesh.addChild(polylines);
            this.context.scene.addChild(mesh);
        }
        return mesh;
    }

    drawCurve(inputs: Inputs.Verb.DrawCurveDto<pc.Entity>): pc.Entity {
        const points = inputs.curve.tessellate();
        return this.drawPolyline(
            inputs.curveMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours
        );
    }

    drawPoints(inputs: Inputs.Point.DrawPointsDto<pc.Entity> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum }): pc.Entity {
        const vectorPoints = inputs.points;
        const strategy = inputs.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        
        // Resolve colors for all points using the color mapping strategy
        const coloursHex = this.resolveAllColors(inputs.colours, vectorPoints.length, strategy);
        
        if (inputs.pointsMesh && inputs.updatable) {
            const children = inputs.pointsMesh.children;
            if (children.length === vectorPoints.length) {
                this.updatePointsInstances(inputs.pointsMesh, vectorPoints);
            } else {
                inputs.pointsMesh.destroy();
                inputs.pointsMesh = this.createPointSpheresMesh(
                    this.generateEntityId("pointsMesh"), vectorPoints, coloursHex, inputs.opacity, inputs.size
                );
            }
        } else {
            inputs.pointsMesh = this.createPointSpheresMesh(
                this.generateEntityId("pointsMesh"), vectorPoints, coloursHex, inputs.opacity, inputs.size
            );
        }
        return inputs.pointsMesh;
    }

    updatePointsInstances(group: pc.Entity, positions: Inputs.Base.Point3[]): void {
        // The group contains entities with instanced meshes - each entity has an instanceBuffer
        const children = group.children;
        
        // Build a map of original index to new position
        const positionMap = new Map<number, Inputs.Base.Point3>();
        positions.forEach((pos, index) => {
            positionMap.set(index, pos);
        });

        children.forEach((child: pc.Entity) => {
            // Handle GPU-instanced points
            if (child.tags?.has("instancedPoints")) {
                const extendedChild = child as pc.Entity & { instanceBuffer?: pc.VertexBuffer; pointIndices?: number[] };
                const instanceBuffer = extendedChild.instanceBuffer;
                const pointIndices = extendedChild.pointIndices;
                
                if (instanceBuffer && pointIndices) {
                    const instanceData = instanceBuffer.lock();
                    if (instanceData) {
                        const floatView = new Float32Array(instanceData);
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
            // Handle fallback single-point entities
            else if (child.tags?.has("singlePoint")) {
                const idx = parseInt(child.name.split("-").pop() || "0");
                if (positions[idx]) {
                    child.setLocalPosition(positions[idx][0], positions[idx][1], positions[idx][2]);
                }
            }
        });
    }

    drawCurves(inputs: Inputs.Verb.DrawCurvesDto<pc.Entity>): pc.Entity {
        const points = inputs.curves.map(s => ({ points: s.tessellate() }));
        return this.drawPolylinesWithColours({ polylines: points, polylinesMesh: inputs.curvesMesh, ...inputs });
    }

    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto<pc.Entity> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum }): pc.Entity {
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
                colours: resolvedColours[index],
                updatable: inputs.updatable,
                opacity: inputs.opacity,
                hidden: inputs.hidden,
                drawTwoSided: inputs.drawTwoSided,
                backFaceColour: inputs.backFaceColour,
                backFaceOpacity: inputs.backFaceOpacity,
            });
            inputs.surfacesMesh.addChild(srf);
        });

        return inputs.surfacesMesh;
    }

    createOrUpdateSurfacesMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] }[],
        group: pc.Entity, updatable: boolean, material: pc.StandardMaterial, addToScene: boolean, hidden: boolean
    ): pc.Entity {
        const createMesh = () => {
            // Merge all geometries into one
            const totalPositions: number[] = [];
            let totalNormals: number[] = [];
            const totalIndices: number[] = [];
            const totalUvs: number[] = [];
            let indexOffset = 0;

            meshDataConverted.forEach(meshItem => {
                totalPositions.push(...meshItem.positions);
                if (meshItem.normals && meshItem.normals.length > 0) {
                    totalNormals.push(...meshItem.normals);
                }
                if (meshItem.uvs) {
                    totalUvs.push(...meshItem.uvs);
                }
                // Offset indices
                const offsetIndices = meshItem.indices.map(i => i + indexOffset);
                totalIndices.push(...offsetIndices);
                indexOffset += meshItem.positions.length / 3;
            });

            // Compute normals if they're missing
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

    /**
     * Create a back face mesh with flipped normals and reversed winding order
     * This is used for two-sided rendering where back faces have a different color
     * @param meshDataConverted - Original mesh data
     * @param backFaceColour - Color for the back face
     * @param backFaceOpacity - Opacity for the back face
     * @param zOffset - Depth bias to prevent z-fighting
     * @returns Entity containing the back face mesh
     */
    private createBackFaceMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] }[],
        backFaceColour: string,
        backFaceOpacity: number,
        zOffset: number
    ): pc.Entity {
        // Create material for back face
        const backMaterial = this.getOrCreateMaterial(backFaceColour + "-back", backFaceOpacity, zOffset + 0.1, () => {
            const mat = new pc.StandardMaterial();
            mat.name = this.generateEntityId("backFaceMaterial");
            mat.diffuse = this.hexToColor(backFaceColour);
            mat.metalness = 0.4;
            mat.gloss = 0.2;
            mat.opacity = backFaceOpacity;
            // Enable alpha blending for transparency when opacity < 1
            if (backFaceOpacity < 1) {
                mat.blendType = pc.BLEND_NORMAL;
            }
            mat.depthBias = zOffset + 0.1;
            mat.slopeDepthBias = zOffset + 0.1;
            mat.update();
            return mat;
        });

        // Use inherited method to prepare back face mesh data
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
        const meshData = inputs.surface.tessellate();

        const meshDataConverted = {
            positions: [],
            indices: [],
            normals: [],
        };

        let countIndices = 0;
        meshData.faces.forEach((faceIndices) => {
            countIndices = this.parseFaces(faceIndices, meshData, meshDataConverted, countIndices);
        });

        const color = Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours;
        const pbr = this.getOrCreateMaterial(color, inputs.opacity, 0, () => {
            const material = new pc.StandardMaterial();
            material.name = this.generateEntityId("pbrSurface");
            material.diffuse = this.hexToColor(color);
            material.metalness = 0.5;
            material.gloss = 0.3;
            material.opacity = inputs.opacity;
            // Enable alpha blending for transparency when opacity < 1
            if (inputs.opacity < 1) {
                material.blendType = pc.BLEND_NORMAL;
            }
            material.update();
            return material;
        });

        const surfaceEntity = this.createOrUpdateSurfacesMesh(
            [meshDataConverted],
            inputs.surfaceMesh,
            inputs.updatable,
            pbr,
            true,
            inputs.hidden,
        );

        // Draw back faces with different color when two-sided rendering is enabled
        if (inputs.drawTwoSided !== false) {
            const backFaceMesh = this.createBackFaceMesh(
                [meshDataConverted],
                inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                inputs.backFaceOpacity ?? inputs.opacity,
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
            const vn = meshData.normals[x];
            meshDataConverted.normals.push(vn[0], vn[1], vn[2]);
            const pt = meshData.points[x];
            meshDataConverted.positions.push(pt[0], pt[1], pt[2]);
            meshDataConverted.indices.push(countIndices);
            countIndices++;
        });
        return countIndices;
    }

    private makeMesh(inputs: { updatable: boolean, opacity: number, colour: string, hidden: boolean, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number }, meshToUpdate: pc.Entity, res: { positions: number[]; normals: number[]; indices: number[]; transforms: []; }): pc.Entity {
        const pbr = this.getOrCreateMaterial(inputs.colour, inputs.opacity, 0, () => {
            const material = new pc.StandardMaterial();
            material.name = this.generateEntityId("jscadMaterial");
            material.diffuse = this.hexToColor(inputs.colour);
            material.metalness = 0.4;
            material.gloss = 0.4;
            material.opacity = inputs.opacity;
            // Enable alpha blending for transparency when opacity < 1
            if (inputs.opacity < 1) {
                material.blendType = pc.BLEND_NORMAL;
            }
            material.update();
            return material;
        });

        this.createMesh(res.positions, res.indices, res.normals, meshToUpdate, res.transforms, inputs.updatable, pbr);

        // Draw back faces with different color when two-sided rendering is enabled
        if (inputs.drawTwoSided !== false) {
            const backFaceMesh = this.createBackFaceMesh(
                [{ positions: res.positions, indices: res.indices, normals: res.normals }],
                inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                inputs.backFaceOpacity ?? inputs.opacity,
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
        positions: number[], indices: number[], normals: number[], jscadMesh: pc.Entity, transforms: number[], updatable: boolean, material: pc.StandardMaterial
    ): void {
        const mesh = new pc.Mesh(this.context.app.graphicsDevice);
        mesh.setPositions(positions);
        mesh.setIndices(indices);
        
        // Compute normals if they're missing or empty
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
        
        // Apply transforms
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

    private async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>): Promise<pc.Entity> {
        const shapeGroup = new pc.Entity(this.generateEntityId("brepMesh"));
        this.context.scene.addChild(shapeGroup);

        if (inputs.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {

            let pbr: pc.StandardMaterial;

            if (options.faceMaterial) {
                pbr = options.faceMaterial;
            } else {
                const hex = Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour;
                const alpha = inputs.faceOpacity;
                const zOffset = inputs.drawEdges ? 2 : 0;
                const slopeOffset = inputs.drawEdges ? 2 : 0;
                
                pbr = this.getOrCreateMaterial(hex, alpha, zOffset, () => {
                    const pbmat = new pc.StandardMaterial();
                    pbmat.diffuse = this.hexToColor(hex);
                    pbmat.metalness = 0.4;
                    pbmat.gloss = 0.2;
                    pbmat.opacity = alpha;
                    // Use both depthBias and slopeDepthBias to push faces behind edges
                    pbmat.depthBias = zOffset;
                    pbmat.slopeDepthBias = slopeOffset;
                    pbmat.update();
                    return pbmat;
                });
            }

            const meshData = decomposedMesh.faceList.map(face => {
                return {
                    positions: face.vertex_coord,
                    normals: face.normal_coord,
                    indices: face.tri_indexes,
                    uvs: face.uvs,
                };
            });

            const mesh = this.createOrUpdateSurfacesMesh(meshData, undefined, false, pbr, false, false);
            shapeGroup.addChild(mesh);

            // Draw back faces with different color when two-sided rendering is enabled
            if (options.drawTwoSided !== false) {
                const backFaceMesh = this.createBackFaceMesh(
                    meshData, 
                    options.backFaceColour || DEFAULT_COLORS.BACK_FACE, 
                    options.backFaceOpacity ?? options.faceOpacity,
                    inputs.drawEdges ? 2 : 0
                );
                shapeGroup.addChild(backFaceMesh);
            }
        }
        if (inputs.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {

            const polylineEdgePoints = [];
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertex_coord.filter(s => s !== undefined);
                polylineEdgePoints.push(ev);
            });
            const line = this.drawPolylines(
                undefined, 
                polylineEdgePoints, 
                false, 
                inputs.edgeWidth, 
                inputs.edgeOpacity, 
                inputs.edgeColour,
                Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                options.edgeArrowSize,
                options.edgeArrowAngle
            );
            shapeGroup.addChild(line);
        }

        if (inputs.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: inputs.vertexSize,
                colours: inputs.vertexColour,
                updatable: false,
            });
            shapeGroup.addChild(mesh);
        }

        if (inputs.drawEdgeIndexes) {
            const promises = decomposedMesh.edgeList.map(async (edge) => {
                let edgeMiddle = edge.middle_point;
                if (edgeMiddle === undefined) {
                    edgeMiddle = this.computeEdgeMiddlePos(edge);
                }
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${edge.edge_index + 1}`;
                tdto.height = inputs.edgeIndexHeight;
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
            const edgeMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 0.2, 1, inputs.edgeIndexColour);
            shapeGroup.addChild(edgeMesh);
        }
        if (inputs.drawFaceIndexes) {
            const promises = decomposedMesh.faceList.map(async (face) => {
                let faceMiddle = face.center_point;
                if (faceMiddle === undefined) {
                    faceMiddle = this.computeFaceMiddlePos(face.vertex_coord_vec) as Inputs.Base.Point3;
                }
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${face.face_index}`;
                tdto.height = inputs.faceIndexHeight;
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

            const faceMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 0.2, 1, inputs.faceIndexColour);
            shapeGroup.addChild(faceMesh);
        }
        return shapeGroup;
    }

    /**
     * Check if a polyline entity can be updated with new point data
     * @param entity - Entity to check
     * @param polylinePoints - New polyline points
     * @param updatable - Whether updates are allowed
     * @returns True if entity can be updated
     */
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

    /**
     * Update an existing polyline entity with new position data
     * @param entity - Entity to update
     * @param linePositions - New line positions
     * @returns True if update succeeded, false otherwise
     */
    private updatePolylineEntityPositions(
        entity: pc.Entity, 
        linePositions: number[]
    ): boolean {
        const renderComponent = entity.render;
        if (!renderComponent?.meshInstances?.[0]?.mesh) {
            console.warn("Cannot update polyline: missing render component or mesh");
            return false;
        }
        
        try {
            const mesh = renderComponent.meshInstances[0].mesh;
            mesh.setPositions(linePositions);
            mesh.update(pc.PRIMITIVE_LINES);
            return true;
        } catch (error) {
            console.error("Error updating polyline positions:", error);
            return false;
        }
    }

    /**
     * Compute line positions array from polyline points
     * @param polylinesPoints - Array of polylines
     * @returns Object containing flat array of line positions and segment counts per polyline
     */
    private computeLinePositionsWithSegmentCounts(polylinesPoints: Inputs.Base.Vector3[][]): {
        positions: number[];
        segmentCounts: number[];
    } {
        const linePositions: number[] = [];
        const segmentCounts: number[] = [];
        
        for (const points of polylinesPoints) {
            let segmentCount = 0;
            for (let i = 0; i < points.length - 1; i++) {
                const current = points[i];
                const next = points[i + 1];
                
                linePositions.push(current[0], current[1], current[2]);
                linePositions.push(next[0], next[1], next[2]);
                segmentCount++;
            }
            segmentCounts.push(segmentCount);
        }
        
        return { positions: linePositions, segmentCounts };
    }

    /**
     * Compute per-vertex colors for polylines based on color mapping strategy
     * @param colours - Single color or array of colors
     * @param segmentCounts - Number of line segments per polyline
     * @param colorMapStrategy - Strategy for mapping colors to polylines
     * @returns Flat array of RGBA values (0-255) for each vertex
     */
    private computePolylineColors(
        colours: string | string[],
        segmentCounts: number[],
        colorMapStrategy: Inputs.Base.colorMapStrategyEnum
    ): number[] {
        const lineColors: number[] = [];
        const totalPolylines = segmentCounts.length;
        
        segmentCounts.forEach((segmentCount, polylineIndex) => {
            // Get the color for this polyline using the strategy
            const colorHex = this.resolveColorForEntity(colours, polylineIndex, totalPolylines, colorMapStrategy);
            const color = this.hexToColor(colorHex);
            
            // Each segment has 2 vertices, apply the same color to both (RGBA as 0-255)
            for (let i = 0; i < segmentCount * 2; i++) {
                lineColors.push(
                    Math.round(color.r * 255),
                    Math.round(color.g * 255),
                    Math.round(color.b * 255),
                    255 // Full opacity
                );
            }
        });
        
        return lineColors;
    }

    /**
     * Create a new polyline entity with metadata
     * @param linePositions - Line positions array
     * @param colours - Colors for the lines
     * @param size - Line width
     * @param polylinePoints - Original polyline points for signature
     * @param segmentCounts - Number of segments per polyline
     * @param colorMapStrategy - Strategy for mapping colors to polylines
     * @returns New polyline entity with metadata
     */
    private createPolylineEntityWithMetadata(
        linePositions: number[],
        colours: string | string[],
        size: number,
        polylinePoints: Inputs.Base.Vector3[][],
        segmentCounts: number[] = [],
        colorMapStrategy: Inputs.Base.colorMapStrategyEnum = Inputs.Base.colorMapStrategyEnum.lastColorRemainder
    ): PolylineEntity {
        const entity = this.createLineEntity(linePositions, colours, segmentCounts, colorMapStrategy) as PolylineEntity;
        entity.bitbybitMeta = {
            linesForRenderLengths: this.computePolylineSignature(polylinePoints)
        };
        return entity;
    }

    /**
     * Create a new polyline entity with explicit colors (for arrow support)
     * @param linePositions - Line positions array
     * @param size - Line width
     * @param polylinePoints - Original polyline points for signature
     * @param segmentCounts - Number of segments per polyline/arrow
     * @param explicitColors - Explicit color for each polyline/arrow segment
     * @returns New polyline entity with metadata
     */
    private createPolylineEntityWithExplicitColors(
        linePositions: number[],
        size: number,
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

    /**
     * Compute per-vertex colors using explicit color array
     * @param segmentCounts - Number of line segments per polyline/arrow
     * @param explicitColors - Explicit color for each polyline/arrow
     * @returns Flat array of RGBA values (0-255) for each vertex
     */
    private computePolylineColorsWithExplicit(
        segmentCounts: number[],
        explicitColors: string[]
    ): number[] {
        const lineColors: number[] = [];
        
        segmentCounts.forEach((segmentCount, index) => {
            const colorHex = explicitColors[index] || explicitColors[0] || "#ff0000";
            const color = this.hexToColor(colorHex);
            
            // Each segment has 2 vertices, apply the same color to both (RGBA as 0-255)
            for (let i = 0; i < segmentCount * 2; i++) {
                lineColors.push(
                    Math.round(color.r * 255),
                    Math.round(color.g * 255),
                    Math.round(color.b * 255),
                    255 // Full opacity
                );
            }
        });
        
        return lineColors;
    }

    /**
     * Create line entity with explicit colors
     * @param linePositions - Line positions array
     * @param segmentCounts - Number of segments per polyline
     * @param explicitColors - Explicit color for each segment group
     * @returns Entity containing lines
     */
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

        // Create material that uses vertex colors
        const mat = new pc.StandardMaterial();
        mat.diffuseVertexColor = true;
        mat.emissiveVertexColor = true;
        mat.diffuse = new pc.Color(1, 1, 1);
        mat.emissive = new pc.Color(1, 1, 1);
        mat.useLighting = false;
        mat.update();

        const meshInstance = new pc.MeshInstance(mesh, mat);
        const lineEntity = new pc.Entity(this.generateEntityId("lines"));
        lineEntity.addComponent("render", {
            meshInstances: [meshInstance]
        });
        return lineEntity;
    }

    /**
     * Draw multiple polylines using PlayCanvas line primitives
     * @param existingEntity - Optional existing entity to update
     * @param polylinesPoints - Array of polylines
     * @param updatable - Whether to attempt updates
     * @param size - Line width
     * @param opacity - Line opacity
     * @param colours - Line colors
     * @param colorMapStrategy - Strategy for mapping colors to polylines
     * @returns Entity containing rendered polylines, or undefined
     */
    private drawPolylines(
        existingEntity: pc.Entity | undefined, 
        polylinesPoints: Inputs.Base.Vector3[][], 
        updatable: boolean,
        size: number, 
        opacity: number, 
        colours: string | string[],
        colorMapStrategy: Inputs.Base.colorMapStrategyEnum = Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
        arrowSize = 0,
        arrowAngle = 30
    ): pc.Entity {
        // Validate input
        if (!polylinesPoints || polylinesPoints.length === 0) {
            return undefined;
        }
        
        // Compute arrow lines if arrowSize > 0
        const arrowLinePoints: Inputs.Base.Vector3[][] = [];
        const arrowLineColors: string[] = [];
        
        if (arrowSize > 0) {
            polylinesPoints.forEach((pts, polylineIndex) => {
                if (pts.length >= 2) {
                    const arrowLines = this.computeArrowHeadLines(pts as Inputs.Base.Point3[], arrowSize, arrowAngle);
                    const polylineColor = this.resolveColorForEntity(colours, polylineIndex, polylinesPoints.length, colorMapStrategy);
                    arrowLines.forEach(arrowLine => {
                        arrowLinePoints.push(arrowLine);
                        arrowLineColors.push(polylineColor);
                    });
                }
            });
        }
        
        // Combine original polylines with arrow lines
        const allPolylinePoints = [...polylinesPoints, ...arrowLinePoints];
        
        const { positions: linePositions, segmentCounts } = this.computeLinePositionsWithSegmentCounts(allPolylinePoints);
        
        // Compute explicit colors for all polylines + arrows
        const resolvedPolylineColors = this.resolveAllColors(colours, polylinesPoints.length, colorMapStrategy);
        const allExplicitColors = [...resolvedPolylineColors, ...arrowLineColors];
        
        // Try to update existing entity
        if (this.canUpdatePolylineEntity(existingEntity, polylinesPoints, updatable)) {
            if (this.updatePolylineEntityPositions(existingEntity, linePositions)) {
                return existingEntity;
            }
            // Update failed, fall through to create new
            console.warn("Polyline update failed, creating new entity");
        }
        
        // Create new entity with per-polyline colors (including arrows)
        return this.createPolylineEntityWithExplicitColors(
            linePositions, 
            size, 
            allPolylinePoints,
            segmentCounts,
            allExplicitColors
        );
    }

    private createLineEntity(
        linePositions: number[], 
        colours: string | string[],
        segmentCounts: number[] = [],
        colorMapStrategy: Inputs.Base.colorMapStrategyEnum = Inputs.Base.colorMapStrategyEnum.lastColorRemainder
    ): pc.Entity {
        const mesh = new pc.Mesh(this.context.app.graphicsDevice);
        mesh.setPositions(linePositions);
        
        // Use vertex colors if we have segment counts (multiple polylines)
        const useVertexColors = segmentCounts.length > 0;
        
        if (useVertexColors) {
            const vertexColors = this.computePolylineColors(colours, segmentCounts, colorMapStrategy);
            mesh.setColors32(vertexColors);
        }
        
        mesh.update(pc.PRIMITIVE_LINES);

        // Create material that uses vertex colors
        const mat = new pc.StandardMaterial();
        if (useVertexColors) {
            // Enable vertex colors in the material
            mat.diffuseVertexColor = true;
            mat.emissiveVertexColor = true;
            mat.diffuse = new pc.Color(1, 1, 1); // White base, vertex colors will tint
            mat.emissive = new pc.Color(1, 1, 1); // White base for emissive
        } else {
            // Single color mode
            const color = Array.isArray(colours) ? this.hexToColor(colours[0]) : this.hexToColor(colours);
            mat.emissive = color;
            mat.diffuse = color;
        }
        mat.useLighting = false;
        mat.update();

        const meshInstance = new pc.MeshInstance(mesh, mat);
        const lineEntity = new pc.Entity(this.generateEntityId("lines"));
        lineEntity.addComponent("render", {
            meshInstances: [meshInstance]
        });
        return lineEntity;
    }

    private handleDecomposedManifold(
        decomposedManifold: Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][],
        options: Inputs.Draw.DrawManifoldOrCrossSectionOptions): pc.Entity {
        if ((decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto).vertProperties) {
            const decomposedMesh = decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto;
            if (decomposedMesh.triVerts.length !== 0) {
                const numProp = decomposedMesh.numProp || 3;
                const vertProperties = decomposedMesh.vertProperties;
                const triVerts = decomposedMesh.triVerts;
                
                // Extract indexed positions based on numProp stride
                let indexedPositions: number[];
                if (numProp === 3) {
                    indexedPositions = Array.from(vertProperties);
                } else {
                    const numVerts = vertProperties.length / numProp;
                    indexedPositions = [];
                    for (let i = 0; i < numVerts; i++) {
                        const baseIdx = i * numProp;
                        indexedPositions.push(vertProperties[baseIdx], vertProperties[baseIdx + 1], vertProperties[baseIdx + 2]);
                    }
                }
                
                // Unindex the mesh for flat shading - each triangle gets unique vertices
                const positions: number[] = [];
                const normals: number[] = [];
                const indices: number[] = [];
                
                for (let i = 0; i < triVerts.length; i += 3) {
                    const i0 = triVerts[i];
                    const i1 = triVerts[i + 1];
                    const i2 = triVerts[i + 2];
                    
                    // Get vertex positions
                    const v0x = indexedPositions[i0 * 3];
                    const v0y = indexedPositions[i0 * 3 + 1];
                    const v0z = indexedPositions[i0 * 3 + 2];
                    
                    const v1x = indexedPositions[i1 * 3];
                    const v1y = indexedPositions[i1 * 3 + 1];
                    const v1z = indexedPositions[i1 * 3 + 2];
                    
                    const v2x = indexedPositions[i2 * 3];
                    const v2y = indexedPositions[i2 * 3 + 1];
                    const v2z = indexedPositions[i2 * 3 + 2];
                    
                    // Compute face normal
                    const e1x = v1x - v0x;
                    const e1y = v1y - v0y;
                    const e1z = v1z - v0z;
                    
                    const e2x = v2x - v0x;
                    const e2y = v2y - v0y;
                    const e2z = v2z - v0z;
                    
                    let nx = e1y * e2z - e1z * e2y;
                    let ny = e1z * e2x - e1x * e2z;
                    let nz = e1x * e2y - e1y * e2x;
                    
                    // Normalize
                    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
                    if (len > 0) {
                        nx /= len;
                        ny /= len;
                        nz /= len;
                    }
                    
                    // Add 3 unique vertices for this triangle
                    const baseIndex = positions.length / 3;
                    
                    positions.push(v0x, v0y, v0z);
                    positions.push(v1x, v1y, v1z);
                    positions.push(v2x, v2y, v2z);
                    
                    // Same normal for all 3 vertices (flat shading)
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

                // Draw back faces with different color when two-sided rendering is enabled
                if (options.drawTwoSided !== false) {
                    const backFaceMesh = this.createBackFaceMesh(
                        [{ positions, indices, normals }],
                        options.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                        options.backFaceOpacity ?? options.faceOpacity,
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
            const child = entity.children[0];
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

    // sometimes we must delete face material property for the web worker not to complain about complex (circular) objects and use cloned object later
    private deleteFaceMaterialForWorker<T extends { faceMaterial?: pc.StandardMaterial }>(inputs: T): T {
        const options = { ...inputs };
        if (inputs.faceMaterial) {
            delete inputs.faceMaterial;
        }
        return options;
    }

    /**
     * Generate a unique entity ID with semantic naming
     * @param type - The type of entity (e.g., 'manifoldMeshContainer', 'jscadMesh')
     * @param parentId - Optional parent ID for hierarchical naming
     * @returns Unique entity ID string
     */
    private generateEntityId(type: string, parentId?: string): string {
        const id = `${this.instanceId}-${type}-${++this.entityIdCounter}`;
        return parentId ? `${parentId}/${id}` : id;
    }

    /**
     * Get or create a cached material with the specified properties
     * Implements LRU-like eviction when cache is full
     * @param hex - Hex color string
     * @param alpha - Alpha value (0-1)
     * @param zOffset - Z-offset value
     * @param createFn - Function to create new material if not cached
     * @param unlit - Whether the material is unlit (no lighting, for points/lines)
     * @returns Cached or newly created material
     */
    private getOrCreateMaterial(
        hex: string,
        alpha: number,
        zOffset: number,
        createFn: () => pc.StandardMaterial,
        unlit = false
    ): pc.StandardMaterial {
        const key = super.getMaterialKey(hex, alpha, zOffset, unlit);

        // Check cache first
        const cached = this.materialCache.get(key);
        if (cached) {
            return cached;
        }

        // Evict oldest if at capacity (simple FIFO)
        if (this.materialCache.size >= CACHE_CONFIG.MAX_MATERIALS) {
            const firstKey = this.materialCache.keys().next().value;
            const material = this.materialCache.get(firstKey);
            if (material && material.destroy) {
                material.destroy();
            }
            this.materialCache.delete(firstKey);
            console.warn(`Material cache full, evicted: ${firstKey}`);
        }

        // Create new material
        const material = createFn();
        this.materialCache.set(key, material);
        return material;
    }

    /**
     * Cleanup method to dispose of cached materials and prevent memory leaks
     * Should be called when the DrawHelper instance is no longer needed
     */
    public dispose(): void {
        // Dispose cached materials
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

        // Reset counters
        this.entityIdCounter = 0;

        console.log("DrawHelper disposed successfully");
    }

    /**
     * Normalize polyline colors from multiple sources into a consistent array
     * @param polylines - Array of polylines with potential embedded colors
     * @param inputColors - Input colors (single or array)
     * @param colorMapStrategy - Strategy for mapping colors to polylines when there are more polylines than colors
     * @returns Array of normalized hex color strings
     */
    private normalizePolylineColors(
        polylines: Inputs.Polyline.PolylinePropertiesDto[], 
        inputColors: string | string[],
        colorMapStrategy: Inputs.Base.colorMapStrategyEnum = Inputs.Base.colorMapStrategyEnum.lastColorRemainder
    ): string[] {
        const defaultColor = Array.isArray(inputColors) ? inputColors[0] : inputColors;
        
        return polylines.map((polyline, index) => {
            // Priority 1: Polyline-specific color
            if (polyline.color) {
                const color = typeof polyline.color === "string" ? polyline.color : polyline.color.join(",");
                return super.normalizeColor(color, defaultColor);
            }
            
            // Priority 2: Use color map strategy to resolve color
            return this.resolveColorForEntity(inputColors, index, polylines.length, colorMapStrategy);
        });
    }

    /**
     * Wrap a polyline entity in a group container
     * @param polylineEntity - The polyline entity to wrap
     * @param existingGroup - Optional existing group for updates
     * @param updatable - Whether this is an update operation
     * @returns Group entity containing the polyline
     */
    private wrapPolylineInGroup(
        polylineEntity: pc.Entity, 
        existingGroup?: pc.Entity,
        updatable?: boolean
    ): pc.Entity {
        // If updating and names match, return existing group
        if (existingGroup && updatable && existingGroup.children[0]?.name === polylineEntity.name) {
            return existingGroup;
        }
        
        // Create new group
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
            // Use unlit=true to distinguish from lit materials used for surfaces
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
            }, true); // unlit = true
            const positionsFiltered = positionsModel.filter(s => s.color === colour);

            return { hex: colour, material: mat, positions: positionsFiltered };
        });

        const pointsGroup = new pc.Entity(meshName);
        this.context.scene.addChild(pointsGroup);
        
        // Create merged geometry for each unique color - one draw call per color
        materialSet.forEach(ms => {
            const pointCount = ms.positions.length;
            if (pointCount === 0) return;
            
            // Use fewer segments for large point counts
            const segments = pointCount > 1000 ? 4 : 8;
            
            // Create instanced mesh for all points of this color
            const instancedEntity = this.createInstancedSphereMesh(
                this.generateEntityId(`points-${ms.hex}`, meshName),
                ms.positions.map(p => ({ position: p.position, index: p.index })),
                size,
                segments,
                ms.material
            );
            
            // Store point indices for potential updates
            instancedEntity.tags?.add("instancedPoints");
            pointsGroup.addChild(instancedEntity);
        });

        return pointsGroup;
    }

    /**
     * Creates an instanced mesh for rendering multiple spheres with a single draw call.
     * Uses PlayCanvas GPU hardware instancing via setInstancing().
     */
    private createInstancedSphereMesh(
        name: string,
        positions: { position: Inputs.Base.Point3; index: number }[],
        radius: number,
        segments: number,
        material: pc.StandardMaterial
    ): pc.Entity {
        const graphicsDevice = this.context.app?.graphicsDevice;
        
        if (!graphicsDevice) {
            // Fallback to individual spheres if no graphics device available
            return this.createFallbackPointsMesh(name, positions.map(p => p.position), radius, material);
        }

        const instanceCount = positions.length;
        
        // Create a single sphere mesh to be instanced
        const sphereMesh = pc.Mesh.fromGeometry(graphicsDevice, new pc.SphereGeometry({
            radius: radius,
            latitudeBands: segments,
            longitudeBands: segments
        }));
        
        // Create instance vertex buffer with world matrices (Mat4 = 16 floats per instance)
        const instanceFormat = pc.VertexFormat.getDefaultInstancingFormat(graphicsDevice);
        const instanceBuffer = new pc.VertexBuffer(
            graphicsDevice,
            instanceFormat,
            instanceCount,
            {
                usage: pc.BUFFER_STATIC
            }
        );
        
        // Fill the instance buffer with transformation matrices
        const instanceData = new Float32Array(instanceCount * 16);
        const tempMat = new pc.Mat4();
        
        positions.forEach((pos, i) => {
            // Create a translation matrix for each instance
            tempMat.setTranslate(pos.position[0], pos.position[1], pos.position[2]);
            // Copy matrix data (16 floats) to the buffer
            instanceData.set(tempMat.data, i * 16);
        });
        
        // Upload instance data to GPU
        const lockedData = instanceBuffer.lock();
        if (lockedData) {
            new Float32Array(lockedData).set(instanceData);
            instanceBuffer.unlock();
        }
        
        // Create mesh instance and enable instancing
        const meshInstance = new pc.MeshInstance(sphereMesh, material);
        meshInstance.setInstancing(instanceBuffer);
        meshInstance.instancingCount = instanceCount;
        
        // Disable shadows for point spheres (they use emissive/unlit materials)
        meshInstance.castShadow = false;
        meshInstance.receiveShadow = false;
        
        // Create entity with render component
        const entity = new pc.Entity(name);
        entity.addComponent("render", {
            meshInstances: [meshInstance],
            castShadows: false,
            receiveShadows: false
        });
        
        // Store instance data for potential updates
        entity.tags?.add("instancedPoints");
        (entity as pc.Entity & { instanceBuffer?: pc.VertexBuffer; pointIndices?: number[] }).instanceBuffer = instanceBuffer;
        (entity as pc.Entity & { instanceBuffer?: pc.VertexBuffer; pointIndices?: number[] }).pointIndices = positions.map(p => p.index);
        
        return entity;
    }

    /**
     * Fallback method when graphics device is not available
     */
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
