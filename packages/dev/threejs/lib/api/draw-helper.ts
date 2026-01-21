
import { Context } from "./context";
import * as Inputs from "./inputs";
import { DrawHelperCore, MeshData } from "@bitbybit-dev/core";
import { JSCADText } from "@bitbybit-dev/jscad-worker";
import { Vector } from "@bitbybit-dev/base";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import * as THREEJS from "three";
import { CACHE_CONFIG, DEFAULT_COLORS, MATERIAL_DEFAULTS } from "./constants";

export class DrawHelper extends DrawHelperCore {

    // Map-based material cache for better performance (MeshPhysicalMaterial for lit surfaces)
    private readonly materialCache = new Map<string, THREEJS.MeshPhysicalMaterial>();

    // Separate cache for unlit materials (MeshBasicMaterial for points/lines)
    private readonly unlitMaterialCache = new Map<string, THREEJS.MeshBasicMaterial>();

    // Entity ID generation
    private entityIdCounter = 0;
    private readonly instanceId = `three-${Date.now()}`;

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
        return this.materialCache.size === 0 && this.unlitMaterialCache.size === 0;
    }

    /**
     * Cleanup method to dispose of cached materials and prevent memory leaks
     * Should be called when the DrawHelper instance is no longer needed
     */
    public dispose(): void {
        // Dispose cached PBR materials
        this.materialCache.forEach((material, key) => {
            try {
                if (material.dispose) {
                    material.dispose();
                }
            } catch (error) {
                console.warn(`Error disposing material ${key}:`, error);
            }
        });
        this.materialCache.clear();

        // Dispose cached unlit materials (MeshBasicMaterial for points)
        this.unlitMaterialCache.forEach((material, key) => {
            try {
                if (material.dispose) {
                    material.dispose();
                }
            } catch (error) {
                console.warn(`Error disposing unlit material ${key}:`, error);
            }
        });
        this.unlitMaterialCache.clear();

        // Reset counters
        this.entityIdCounter = 0;

        console.log("DrawHelper disposed successfully");
    }

    async drawManifoldsOrCrossSections(inputs: Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>): Promise<THREEJS.Group> {
        try {
            const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
            const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto[] = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", safeWorkerOptions);
            const meshes = decomposedMesh.map(dec => this.handleDecomposedManifold(dec, inputs)).filter(s => s !== undefined);
            const manifoldMeshContainer = new THREEJS.Group();
            manifoldMeshContainer.name = this.generateEntityId("manifoldMeshContainer");
            meshes.forEach(mesh => {
                mesh.parent = manifoldMeshContainer;
            });
            this.context.scene.add(manifoldMeshContainer);
            return manifoldMeshContainer;
        } catch (error) {
            console.error("Error drawing manifolds or cross sections:", error);
            throw new Error(`Failed to draw manifolds or cross sections: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async drawManifoldOrCrossSection(inputs: Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>): Promise<THREEJS.Group> {
        try {
            if (!inputs.manifoldOrCrossSection) {
                throw new Error("Manifold or cross section parameter is required");
            }
            const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
            const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", safeWorkerOptions);
            return this.handleDecomposedManifold(decomposedMesh, inputs);
        } catch (error) {
            console.error("Error drawing manifold or cross section:", error);
            throw new Error(`Failed to draw manifold or cross section: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<THREEJS.Group> {
        try {
            if (!inputs.shape) {
                throw new Error("Shape parameter is required");
            }
            const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
            const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", safeWorkerOptions);
            return this.handleDecomposedMesh(inputs, decomposedMesh, inputs);
        } catch (error) {
            console.error("Error drawing OCCT shape:", error);
            throw new Error(`Failed to draw OCCT shape: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<THREEJS.Group> {
        try {
            const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
            const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", safeWorkerOptions);
            const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(inputs, decomposedMesh, inputs)));
            const shapesMeshContainer = new THREEJS.Group();
            shapesMeshContainer.name = this.generateEntityId("shapesMeshContainer");
            this.context.scene.add(shapesMeshContainer);
            meshesSolved.forEach(mesh => {
                shapesMeshContainer.add(mesh);
            });
            return shapesMeshContainer;
        } catch (error) {
            console.error("Error drawing OCCT shapes:", error);
            throw new Error(`Failed to draw OCCT shapes: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>): Promise<THREEJS.Group> {
        try {
            const res: {
                positions: number[],
                normals: number[],
                indices: number[],
                transforms: [],
            } = await this.jscadWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
            
            // Validate worker response
            if (!res || !res.positions || !res.indices || !res.transforms) {
                console.warn("Corrupted worker response, returning empty mesh");
                const emptyMesh = new THREEJS.Group();
                emptyMesh.name = this.generateEntityId("jscadMesh");
                this.context.scene.add(emptyMesh);
                return emptyMesh;
            }
            
            let meshToUpdate;
            if (inputs.jscadMesh && inputs.updatable) {
                meshToUpdate = inputs.jscadMesh;
            } else {
                meshToUpdate = new THREEJS.Group();
                meshToUpdate.name = this.generateEntityId("jscadMesh");
                this.context.scene.add(meshToUpdate);
            }
            let colour;
            if (inputs.mesh.color && inputs.mesh.color.length > 0) {
                // if jscad geometry is colorized and color is baked on geometry it will be used over anything that set in the draw options
                const c = inputs.mesh.color;
                colour = "#" + new THREEJS.Color(c[0], c[1], c[2]).getHexString();
            } else {
                colour = Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours;
            }
            const s = this.makeMesh({ 
                updatable: inputs.updatable,
                opacity: inputs.opacity,
                hidden: inputs.hidden,
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

    async drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>): Promise<THREEJS.Group> {
        try {
            const res: {
                positions: number[],
                normals: number[],
                indices: number[],
                transforms: [],
                color?: number[]
            }[] = await this.jscadWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);

            let localOrigin: THREEJS.Group;
            if (inputs.jscadMesh && inputs.updatable) {
                localOrigin = inputs.jscadMesh;
                localOrigin.clear();
            } else {
                localOrigin = new THREEJS.Group();
                localOrigin.name = this.generateEntityId("jscadMeshes");
            }

            const colourIsArrayAndMatches = Array.isArray(inputs.colours) && inputs.colours.length === res.length;
            const colorsAreArrays = Array.isArray(inputs.colours);

            res.map((r, index) => {
                const meshToUpdate = new THREEJS.Group();
                meshToUpdate.name = this.generateEntityId("jscadMesh", localOrigin.name);
                let colour;
                if (r.color) {
                    const c = r.color;
                    colour = "#" + new THREEJS.Color(c[0], c[1], c[2]).getHexString();
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
                localOrigin.add(m);
            });
            this.context.scene.add(localOrigin);
            inputs.jscadMesh = localOrigin;
            return localOrigin;
        } catch (error) {
            console.error("Error drawing JSCAD solid or polygon meshes:", error);
            throw new Error(`Failed to draw JSCAD meshes: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    drawPolylinesWithColours(inputs: Inputs.Polyline.DrawPolylinesDto<THREEJS.Group> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum, arrowSize?: number, arrowAngle?: number }) {
        let colours = inputs.colours;
        const strategy = inputs.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        
        const points = inputs.polylines.map((s, index) => {
            const pts = s.points;
            //handle jscad
            if (s.isClosed) {
                pts.push(pts[0]);
            }
            // sometimes polylines can have assigned colors in case of jscad for example. Such colour will overwrite the default provided colour for that polyline.
            if (s.color) {
                if (!Array.isArray(colours)) {
                    colours = [];
                }
                if (Array.isArray(s.color)) {
                    colours[index] = "#" + new THREEJS.Color(s.color[0], s.color[1], s.color[2]).getHexString();
                } else {
                    colours[index] = s.color;
                }
            }
            return pts;
        });

        let lineSegments: THREEJS.LineSegments;
        if (inputs.polylinesMesh && inputs.updatable) {
            lineSegments = inputs.polylinesMesh.children[0] as THREEJS.LineSegments;
        }
        const polylines = this.drawPolylines(
            lineSegments,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            colours,
            strategy,
            inputs.arrowSize,
            inputs.arrowAngle
        );
        if (inputs.polylinesMesh && inputs.updatable) {
            if (inputs.polylinesMesh.children[0].name !== polylines.name) {
                const group = new THREEJS.Group();
                group.name = this.generateEntityId("polylines");
                group.add(polylines);
                this.context.scene.add(group);
                return group;
            } else {
                return inputs.polylinesMesh;
            }
        } else {
            const group = new THREEJS.Group();
            group.name = this.generateEntityId("polylines");
            group.add(polylines);
            this.context.scene.add(group);
            return group;
        }
    }

    drawPoint(inputs: Inputs.Point.DrawPointDto<THREEJS.Group>): THREEJS.Group {
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
                this.generateEntityId("pointMesh"), vectorPoints, colorsHex, inputs.opacity, inputs.size, inputs.updatable
            );
        }
        return inputs.pointMesh;
    }

    drawPolylineClose(inputs: Inputs.Polyline.DrawPolylineDto<THREEJS.Group> & { arrowSize?: number, arrowAngle?: number }): THREEJS.Group {
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

    drawPolyline(mesh: THREEJS.Group,
        pointsToDraw: Inputs.Base.Point3[],
        updatable: boolean, size: number, opacity: number, colours: string | string[],
        arrowSize = 0, arrowAngle = 30): THREEJS.Group {
        let lineSegments: THREEJS.LineSegments;
        if (mesh && mesh.children.length > 0) {
            lineSegments = mesh.children[0] as THREEJS.LineSegments;
        }
        const polylines = this.drawPolylines(lineSegments, [pointsToDraw], updatable, size, opacity, colours, 
            Inputs.Base.colorMapStrategyEnum.lastColorRemainder, arrowSize, arrowAngle);
        if (!mesh) {
            mesh = new THREEJS.Group();
            mesh.name = this.generateEntityId("polyline");
            mesh.add(polylines);
            this.context.scene.add(mesh);
        }
        return mesh;
    }

    drawCurve(inputs: Inputs.Verb.DrawCurveDto<THREEJS.Group>): THREEJS.Group {
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

    drawPoints(inputs: Inputs.Point.DrawPointsDto<THREEJS.Group> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum }): THREEJS.Group {
        const vectorPoints = inputs.points;
        const strategy = inputs.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        
        // Resolve colors for all points using the color mapping strategy
        const coloursHex = this.resolveAllColors(inputs.colours, vectorPoints.length, strategy);
        
        if (inputs.pointsMesh && inputs.updatable) {
            // Calculate the total number of points currently in the mesh
            const currentPointCount = inputs.pointsMesh.children.reduce((sum, child) => {
                if (child instanceof THREEJS.InstancedMesh) {
                    return sum + child.count;
                }
                return sum + 1; // Regular mesh counts as 1 point
            }, 0);
            
            if (currentPointCount === vectorPoints.length) {
                this.updatePointsInstances(inputs.pointsMesh, vectorPoints);
            } else {
                // Dispose old geometries before recreating
                inputs.pointsMesh.children.forEach(child => {
                    if (child instanceof THREEJS.Mesh || child instanceof THREEJS.InstancedMesh) {
                        child.geometry?.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(m => m.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    }
                });
                inputs.pointsMesh.remove();
                inputs.pointsMesh = this.createPointSpheresMesh(
                    this.generateEntityId("pointsMesh"), vectorPoints, coloursHex, inputs.opacity, inputs.size, inputs.updatable
                );
            }
        } else {
            inputs.pointsMesh = this.createPointSpheresMesh(
                this.generateEntityId("pointsMesh"), vectorPoints, coloursHex, inputs.opacity, inputs.size, inputs.updatable
            );
        }
        return inputs.pointsMesh;
    }

    updatePointsInstances(group: THREEJS.Group, positions: Inputs.Base.Point3[]): void {
        // The group contains InstancedMesh children, each handling multiple points of the same color
        // We need to update the instance matrices based on the new positions
        const children = group.children as THREEJS.InstancedMesh[];
        
        // Build a map of original index to new position
        const positionMap = new Map<number, THREEJS.Vector3>();
        positions.forEach((pos, index) => {
            positionMap.set(index, new THREEJS.Vector3(pos[0], pos[1], pos[2]));
        });

        // Each InstancedMesh has metadata with the original indices of points it contains
        children.forEach((instancedMesh: THREEJS.InstancedMesh) => {
            const indices = instancedMesh.userData.pointIndices as number[];
            if (indices) {
                const matrix = new THREEJS.Matrix4();
                indices.forEach((originalIndex, instanceIndex) => {
                    const newPos = positionMap.get(originalIndex);
                    if (newPos) {
                        matrix.setPosition(newPos);
                        instancedMesh.setMatrixAt(instanceIndex, matrix);
                    }
                });
                instancedMesh.instanceMatrix.needsUpdate = true;
            }
        });
    }

    drawCurves(inputs: Inputs.Verb.DrawCurvesDto<THREEJS.Group>): THREEJS.Group {
        const points = inputs.curves.map(s => ({ points: s.tessellate() }));
        return this.drawPolylinesWithColours({ polylines: points, polylinesMesh: inputs.curvesMesh, ...inputs });
    }

    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto<THREEJS.Group> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum }): THREEJS.Group {
        if (inputs.surfacesMesh && inputs.updatable) {
            inputs.surfacesMesh.clear();
        } else {
            inputs.surfacesMesh = new THREEJS.Group();
            inputs.surfacesMesh.name = this.generateEntityId("colouredSurfaces");
            this.context.scene.add(inputs.surfacesMesh);
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
            inputs.surfacesMesh.add(srf);
        });

        return inputs.surfacesMesh;
    }

    createOrUpdateSurfacesMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] }[],
        group: THREEJS.Group, updatable: boolean, material: THREEJS.MeshPhysicalMaterial, addToScene: boolean, hidden: boolean
    ): THREEJS.Group {
        const createMesh = () => {
            // Merge all geometries into one
            const totalPositions: number[] = [];
            let totalNormals: number[] = [];
            const totalIndices: number[] = [];
            const totalUvs: number[] = [];
            let indexOffset = 0;

            meshDataConverted.forEach(meshItem => {
                // Validate mesh data structure
                if (!meshItem || !meshItem.positions || !meshItem.indices) {
                    console.warn("Skipping corrupted mesh item");
                    return;
                }
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
                totalNormals = Array.from(this.computeNormals(totalPositions, totalIndices));
            }

            const geometry = new THREEJS.BufferGeometry();
            geometry.setAttribute("position", new THREEJS.BufferAttribute(Float32Array.from(totalPositions), 3));
            geometry.setAttribute("normal", new THREEJS.BufferAttribute(Float32Array.from(totalNormals), 3));
            if (totalUvs.length > 0) {
                geometry.setAttribute("uv", new THREEJS.BufferAttribute(Float32Array.from(totalUvs), 2));
                geometry.setAttribute("uv2", new THREEJS.BufferAttribute(Float32Array.from(totalUvs), 2));
            }
            geometry.setIndex(new THREEJS.BufferAttribute(Uint32Array.from(totalIndices), 1));
            return geometry;
        };

        if (group && updatable) {
            group.clear();
            const geometry = createMesh();
            if (material) {
                const mesh = new THREEJS.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
            } else {
                const mesh = new THREEJS.Mesh(geometry);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
            }
        } else {
            let scene = null;
            if (addToScene) {
                scene = this.context.scene;
            }

            group = new THREEJS.Group();
            group.name = this.generateEntityId("surface");
            scene.add(group);
            const geometry = createMesh();
            if (material) {
                const mesh = new THREEJS.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
            } else {
                const mesh = new THREEJS.Mesh(geometry);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
            }
        }
        if (hidden) {
            group.visible = false;
        }
        return group;
    }

    drawSurface(inputs: Inputs.Verb.DrawSurfaceDto<THREEJS.Group>): THREEJS.Group {
        const meshData = inputs.surface.tessellate();

        const meshDataConverted: MeshData = {
            positions: [],
            indices: [],
            normals: [],
        };

        let countIndices = 0;
        meshData.faces.forEach((faceIndices: number[]) => {
            countIndices = this.parseFaces(faceIndices, meshData, meshDataConverted, countIndices);
        });

        const hex = Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours;
        const pbr = this.getOrCreateMaterial(hex, inputs.opacity, 0, () => {
            const mat = new THREEJS.MeshPhysicalMaterial();
            mat.name = this.generateEntityId("surfaceMaterial");
            mat.color = new THREEJS.Color(hex);
            mat.metalness = MATERIAL_DEFAULTS.METALNESS.SURFACE;
            mat.roughness = MATERIAL_DEFAULTS.ROUGHNESS.SURFACE;
            mat.opacity = inputs.opacity;
            // Enable transparency for semi-transparent materials
            if (inputs.opacity < 1) {
                mat.transparent = true;
            }
            return mat;
        });

        const surfaceGroup = this.createOrUpdateSurfacesMesh(
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
            surfaceGroup.add(backFaceMesh);
        }

        return surfaceGroup;
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

    private makeMesh(inputs: { updatable: boolean, opacity: number, colour: string, hidden: boolean, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number }, meshToUpdate: THREEJS.Group, res: { positions: number[]; normals: number[]; indices: number[]; transforms: []; }) {
        const pbr = this.getOrCreateMaterial(inputs.colour, inputs.opacity, 0, () => {
            const mat = new THREEJS.MeshPhysicalMaterial();
            mat.name = this.generateEntityId("jscadMaterial");
            mat.color = new THREEJS.Color(inputs.colour);
            mat.metalness = MATERIAL_DEFAULTS.METALNESS.JSCAD;
            mat.roughness = MATERIAL_DEFAULTS.ROUGHNESS.JSCAD;
            mat.alphaTest = inputs.opacity;
            mat.polygonOffsetFactor = 0;
            return mat;
        });

        this.createMesh(res.positions, res.indices, res.normals, meshToUpdate, res.transforms, inputs.updatable, pbr);

        // Draw back faces with different color when two-sided rendering is enabled
        // Default is true (when undefined), explicitly set to false for single-sided
        if (inputs.drawTwoSided !== false) {
            const meshData: MeshData[] = [{
                positions: res.positions,
                indices: res.indices,
                normals: res.normals
            }];

            const backFaceMesh = this.createBackFaceMesh(
                meshData,
                inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                inputs.backFaceOpacity ?? inputs.opacity,
                0
            );
            meshToUpdate.add(backFaceMesh);
        }

        if (inputs.hidden) {
            meshToUpdate.visible = false;
        }
        return meshToUpdate;
    }

    private createMesh(
        positions: number[], indices: number[], normals: number[], jscadMesh: THREEJS.Group, transforms: number[], updatable: boolean, material: THREEJS.MeshPhysicalMaterial
    ): void {
        // Validate worker response
        if (!positions || !indices || !transforms) {
            console.warn("Corrupted worker response, creating empty mesh");
            return;
        }
        const geometry = new THREEJS.BufferGeometry();
        geometry.setAttribute("position", new THREEJS.BufferAttribute(Float32Array.from(positions), 3));
        geometry.setIndex(new THREEJS.BufferAttribute(Uint32Array.from(indices), 1));
        geometry.computeVertexNormals();
        const matrix4 = new THREEJS.Matrix4();
        matrix4.fromArray(transforms);
        jscadMesh.clear();
        const mesh = new THREEJS.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        jscadMesh.add(mesh);
        jscadMesh.applyMatrix4(matrix4);
    }

    private async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>) {
        const shapeGroup = new THREEJS.Group();
        shapeGroup.name = this.generateEntityId("brepMesh");
        this.context.scene.add(shapeGroup);
        let dummy;

        if (inputs.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {

            let pbr: THREEJS.MeshPhysicalMaterial;

            if (inputs.faceMaterial) {
                pbr = inputs.faceMaterial;
            } else {
                const hex = Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour;
                const alpha = inputs.faceOpacity;
                const zOffset = inputs.drawEdges ? 2 : 0;
                
                pbr = this.getOrCreateMaterial(hex, alpha, zOffset, () => {
                    const pbmat = new THREEJS.MeshPhysicalMaterial();
                    pbmat.name = this.generateEntityId("brepMaterial");
                    pbmat.color = new THREEJS.Color(hex);
                    pbmat.metalness = MATERIAL_DEFAULTS.METALNESS.OCCT;
                    pbmat.roughness = MATERIAL_DEFAULTS.ROUGHNESS.OCCT;
                    pbmat.alphaTest = alpha;
                    pbmat.polygonOffset = true;
                    pbmat.polygonOffsetFactor = zOffset;
                    return pbmat;
                });
            }

            const meshData: MeshData[] = decomposedMesh.faceList.map(face => {
                return {
                    positions: face.vertex_coord,
                    normals: face.normal_coord,
                    indices: face.tri_indexes,
                    uvs: face.uvs,
                };
            });

            const mesh = this.createOrUpdateSurfacesMesh(meshData, dummy, false, pbr, true, false);
            shapeGroup.add(mesh);

            // Draw back faces with different color when two-sided rendering is enabled
            if (inputs.drawTwoSided !== false) {
                const backFaceMesh = this.createBackFaceMesh(
                    meshData,
                    inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                    inputs.backFaceOpacity ?? inputs.faceOpacity,
                    inputs.drawEdges ? 2 : 0
                );
                shapeGroup.add(backFaceMesh);
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
            shapeGroup.add(line);
        }

        if (inputs.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: inputs.vertexSize,
                colours: inputs.vertexColour,
                updatable: false,
            });
            shapeGroup.add(mesh);
        }

        if (inputs.drawEdgeIndexes) {
            const promises = decomposedMesh.edgeList.map(async (edge) => {
                let edgeMiddle = edge.middle_point;
                if (edgeMiddle === undefined) {
                    edgeMiddle = this.computeEdgeMiddlePos(edge);
                }
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${edge.edge_index}`;
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

                // texts.forEach(te => textPolylines.push(te));
                return texts;
            });
            const textPolylines = await Promise.all(promises);
            const edgeMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 0.2, 1, inputs.edgeIndexColour);
            shapeGroup.add(edgeMesh);
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
            faceMesh.parent = shapeGroup;
        }
        return shapeGroup;
    }

    private drawPolylines(lineSegments: THREEJS.LineSegments, polylinesPoints: Inputs.Base.Vector3[][], updatable: boolean,
        size: number, opacity: number, colours: string | string[], colorMapStrategy: Inputs.Base.colorMapStrategyEnum = Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
        arrowSize = 0, arrowAngle = 30) {
        if (polylinesPoints && polylinesPoints.length > 0) {
            const lineVertices = [];
            // Track how many line segments (pairs of vertices) each polyline/arrow has
            const polylineSegmentCounts: number[] = [];
            // Track colors in order of segments (polyline, then its arrows, then next polyline, etc.)
            const allColors: string[] = [];

            polylinesPoints.forEach((pts, polylineIndex) => {
                const polylineColor = this.resolveColorForEntity(colours, polylineIndex, polylinesPoints.length, colorMapStrategy);
                let segmentCount = 0;
                for (let i = 0; i < pts.length - 1; i++) {
                    const c = pts[i];
                    const n = pts[i + 1];

                    lineVertices.push(new THREEJS.Vector3(
                        c[0],
                        c[1],
                        c[2]
                    ));
                    lineVertices.push(new THREEJS.Vector3(
                        n[0],
                        n[1],
                        n[2]
                    ));
                    segmentCount++;
                }
                polylineSegmentCounts.push(segmentCount);
                allColors.push(polylineColor);
                
                // Compute arrow head lines if arrowSize > 0
                if (arrowSize > 0 && pts.length >= 2) {
                    const arrowLines = this.computeArrowHeadLines(pts as Inputs.Base.Point3[], arrowSize, arrowAngle);
                    arrowLines.forEach(arrowLine => {
                        lineVertices.push(new THREEJS.Vector3(arrowLine[0][0], arrowLine[0][1], arrowLine[0][2]));
                        lineVertices.push(new THREEJS.Vector3(arrowLine[1][0], arrowLine[1][1], arrowLine[1][2]));
                        polylineSegmentCounts.push(1); // Each arrow line is 1 segment
                        allColors.push(polylineColor); // Arrow uses same color as its parent polyline
                    });
                }
            });
            let lines: THREEJS.LineSegments;
            
            if (lineSegments && updatable) {
                if (lineSegments?.userData?.linesForRenderLengths === polylinesPoints.map(l => l.length).toString()) {
                    lineSegments.geometry.clearGroups();
                    lineSegments.geometry.setFromPoints(lineVertices);
                    // Update colors when updating geometry
                    const lineColors = this.computePolylineColorsWithExplicit(polylineSegmentCounts, allColors);
                    lineSegments.geometry.setAttribute("color", new THREEJS.Float32BufferAttribute(lineColors, 3));
                    return lineSegments;
                } else {
                    lines = this.createLineGeometry(lineVertices, colours, size, polylineSegmentCounts, colorMapStrategy, allColors);
                    lines.userData = { linesForRenderLengths: polylinesPoints.map(l => l.length).toString() };
                    return lines;
                }
            } else {
                lines = this.createLineGeometry(lineVertices, colours, size, polylineSegmentCounts, colorMapStrategy, allColors);
                lines.userData = { linesForRenderLengths: polylinesPoints.map(l => l.length).toString() };
                return lines;
            }
        } else {
            return undefined;
        }
    }

    /**
     * Compute per-vertex colors for polylines based on color mapping strategy
     * @param colours - Single color or array of colors
     * @param polylineSegmentCounts - Number of line segments per polyline
     * @param colorMapStrategy - Strategy for mapping colors to polylines
     * @returns Flat array of RGB values for each vertex
     */
    private computePolylineColors(
        colours: string | string[], 
        polylineSegmentCounts: number[], 
        colorMapStrategy: Inputs.Base.colorMapStrategyEnum
    ): number[] {
        const lineColors: number[] = [];
        const totalPolylines = polylineSegmentCounts.length;
        
        polylineSegmentCounts.forEach((segmentCount, polylineIndex) => {
            // Get the color for this polyline using the strategy
            const colorHex = this.resolveColorForEntity(colours, polylineIndex, totalPolylines, colorMapStrategy);
            const color = new THREEJS.Color(colorHex);
            
            // Each segment has 2 vertices, apply the same color to both
            for (let i = 0; i < segmentCount * 2; i++) {
                lineColors.push(color.r, color.g, color.b);
            }
        });
        
        return lineColors;
    }

    /**
     * Compute per-vertex colors for polylines using an explicit color array
     * @param polylineSegmentCounts - Number of line segments per polyline/arrow line
     * @param explicitColors - Array of colors, one per polyline/arrow line
     * @returns Flat array of RGB values for each vertex
     */
    private computePolylineColorsWithExplicit(
        polylineSegmentCounts: number[],
        explicitColors: string[]
    ): number[] {
        const lineColors: number[] = [];
        
        polylineSegmentCounts.forEach((segmentCount, index) => {
            const colorHex = explicitColors[index] || explicitColors[0] || "#ff0000";
            const color = new THREEJS.Color(colorHex);
            
            // Each segment has 2 vertices, apply the same color to both
            for (let i = 0; i < segmentCount * 2; i++) {
                lineColors.push(color.r, color.g, color.b);
            }
        });
        
        return lineColors;
    }

    private createLineGeometry(
        lineVertices: THREEJS.Vector3[], 
        colours: string | string[], 
        size: number, 
        polylineSegmentCounts: number[] = [], 
        colorMapStrategy: Inputs.Base.colorMapStrategyEnum = Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
        explicitColors?: string[]
    ) {
        const lineGeometry = new THREEJS.BufferGeometry().setFromPoints(lineVertices);

        let lineColors: number[];
        if (explicitColors && explicitColors.length > 0) {
            // Use explicit colors when provided (includes arrow colors)
            lineColors = this.computePolylineColorsWithExplicit(polylineSegmentCounts, explicitColors);
        } else if (polylineSegmentCounts.length > 0) {
            // Use per-polyline coloring with the specified strategy
            lineColors = this.computePolylineColors(colours, polylineSegmentCounts, colorMapStrategy);
        } else {
            // Fallback: single color for all vertices
            const color = Array.isArray(colours) ? new THREEJS.Color(colours[0]) : new THREEJS.Color(colours);
            lineColors = [];
            for (let i = 0; i < lineVertices.length; i++) {
                lineColors.push(color.r, color.g, color.b);
            }
        }

        lineGeometry.setAttribute("color", new THREEJS.Float32BufferAttribute(lineColors, 3));
        const lineMaterial = new THREEJS.LineBasicMaterial({
            color: 0xffffff, linewidth: size, vertexColors: true
        });
        const line = new THREEJS.LineSegments(lineGeometry, lineMaterial);
        line.name = this.generateEntityId("lines");
        return line;
    }

    private handleDecomposedManifold(
        decomposedManifold: Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][],
        options: Inputs.Draw.DrawManifoldOrCrossSectionOptions): THREEJS.Group {
        if ((decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto).vertProperties) {
            const decomposedMesh = decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto;
            if (decomposedMesh.triVerts.length !== 0) {
                const geometry = new THREEJS.BufferGeometry();
                geometry.setAttribute("position", new THREEJS.BufferAttribute(decomposedMesh.vertProperties, 3));
                geometry.setIndex(new THREEJS.BufferAttribute(decomposedMesh.triVerts, 1));
                geometry.computeVertexNormals();

                const group = new THREEJS.Group();
                group.name = this.generateEntityId("manifoldMesh");

                let material: THREEJS.MeshPhysicalMaterial;
                if (options.faceMaterial === undefined) {
                    material = this.getOrCreateMaterial(options.faceColour, options.faceOpacity, 0, () => {
                        const mat = new THREEJS.MeshPhysicalMaterial();
                        mat.name = this.generateEntityId("manifoldMaterial");
                        mat.color = new THREEJS.Color(options.faceColour);
                        mat.metalness = MATERIAL_DEFAULTS.METALNESS.MANIFOLD;
                        mat.roughness = MATERIAL_DEFAULTS.ROUGHNESS.MANIFOLD;
                        mat.opacity = options.faceOpacity;
                        mat.alphaTest = 1;
                        if (!options.computeNormals) {
                            mat.flatShading = true;
                        }
                        return mat;
                    });
                } else {
                    material = options.faceMaterial as THREEJS.MeshPhysicalMaterial;
                }

                const mesh = new THREEJS.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);

                // Draw back faces with different color when two-sided rendering is enabled
                if (options.drawTwoSided !== false) {
                    // Prepare mesh data for back face mesh creation
                    const positions = Array.from(decomposedMesh.vertProperties);
                    const indices = Array.from(decomposedMesh.triVerts);
                    
                    // Get normals from the geometry (they were computed above)
                    const normalAttribute = geometry.getAttribute("normal");
                    const normals = normalAttribute ? Array.from(normalAttribute.array as Float32Array) : [];

                    const meshData: MeshData[] = [{
                        positions,
                        indices,
                        normals
                    }];

                    const backFaceMesh = this.createBackFaceMesh(
                        meshData,
                        options.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                        options.backFaceOpacity ?? options.faceOpacity,
                        0
                    );
                    group.add(backFaceMesh);
                }

                this.context.scene.add(group);
                return group;
            } else {
                return undefined;
            }
        } else {
            const decompsoedPolygons = decomposedManifold as Inputs.Base.Vector2[][];
            if (decompsoedPolygons.length > 0) {

                const group = new THREEJS.Group();
                group.name = this.generateEntityId("manifoldCrossSection");
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
                polylineMesh.parent = group;
                this.context.scene.add(group);
                return group;
            }
            else {
                return undefined;
            }
        }

    }

    // Creates a shallow copy of inputs without the faceMaterial property for safe worker communication
    // Workers cannot handle complex circular objects like Three.js materials
    private getSafeWorkerOptions<T extends { faceMaterial?: THREEJS.Material }>(inputs: T): Omit<T, "faceMaterial"> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { faceMaterial, ...safeOptions } = inputs;
        return safeOptions as Omit<T, "faceMaterial">;
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
        createFn: () => THREEJS.MeshPhysicalMaterial,
        unlit = false
    ): THREEJS.MeshPhysicalMaterial {
        const key = this.getMaterialKey(hex, alpha, zOffset, unlit);

        // Check cache first
        const cached = this.materialCache.get(key);
        if (cached) {
            return cached;
        }

        // Evict oldest if at capacity (simple FIFO)
        if (this.materialCache.size >= CACHE_CONFIG.MAX_MATERIALS) {
            const firstKey = this.materialCache.keys().next().value;
            const material = this.materialCache.get(firstKey);
            if (material && material.dispose) {
                material.dispose();
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
     * Get or create a cached unlit material (MeshBasicMaterial) for points and lines.
     * Uses a separate cache from MeshPhysicalMaterial since these have different types.
     * @param hex - Hex color string
     * @param alpha - Alpha value (0-1)
     * @param createFn - Function to create new material if not cached
     * @returns Cached or newly created MeshBasicMaterial
     */
    private getOrCreateUnlitMaterial(
        hex: string,
        alpha: number,
        createFn: () => THREEJS.MeshBasicMaterial
    ): THREEJS.MeshBasicMaterial {
        const key = this.getMaterialKey(hex, alpha, 0, true); // unlit=true, zOffset=0

        // Check cache first
        const cached = this.unlitMaterialCache.get(key);
        if (cached) {
            return cached;
        }

        // Evict oldest if at capacity (simple FIFO)
        if (this.unlitMaterialCache.size >= CACHE_CONFIG.MAX_MATERIALS) {
            const firstKey = this.unlitMaterialCache.keys().next().value;
            const material = this.unlitMaterialCache.get(firstKey);
            if (material && material.dispose) {
                material.dispose();
            }
            this.unlitMaterialCache.delete(firstKey);
            console.warn(`Unlit material cache full, evicted: ${firstKey}`);
        }

        // Create new material
        const material = createFn();
        this.unlitMaterialCache.set(key, material);
        return material;
    }

    /**
     * Create a back face mesh with flipped normals and reversed winding order
     * This is used for two-sided rendering of CAD geometries
     * @param meshDataConverted - Original mesh data
     * @param backFaceColour - Color for the back face
     * @param backFaceOpacity - Opacity for the back face
     * @param zOffset - Depth bias to prevent z-fighting
     * @returns Group containing the back face mesh
     */
    private createBackFaceMesh(
        meshDataConverted: MeshData[],
        backFaceColour: string,
        backFaceOpacity: number,
        zOffset: number
    ): THREEJS.Group {
        // Create material for back face using the caching system
        const backMaterial = this.getOrCreateMaterial(backFaceColour + "-back", backFaceOpacity, zOffset + 0.1, () => {
            const mat = new THREEJS.MeshPhysicalMaterial();
            mat.name = this.generateEntityId("backFaceMaterial");
            mat.color = new THREEJS.Color(backFaceColour);
            mat.metalness = MATERIAL_DEFAULTS.METALNESS.SURFACE;
            mat.roughness = MATERIAL_DEFAULTS.ROUGHNESS.SURFACE;
            mat.opacity = backFaceOpacity;
            mat.polygonOffset = true;
            mat.polygonOffsetFactor = zOffset + 0.1;
            return mat;
        });

        // Use base class to prepare back face mesh data (flip normals, reverse winding)
        // prepareBackFaceMeshData merges all mesh data into one combined mesh
        const backFaceMeshData = this.prepareBackFaceMeshData(meshDataConverted);

        // Create geometry from the combined mesh data
        const geometry = new THREEJS.BufferGeometry();
        geometry.setAttribute("position", new THREEJS.BufferAttribute(Float32Array.from(backFaceMeshData.positions), 3));
        geometry.setAttribute("normal", new THREEJS.BufferAttribute(Float32Array.from(backFaceMeshData.normals), 3));
        if (backFaceMeshData.uvs && backFaceMeshData.uvs.length > 0) {
            geometry.setAttribute("uv", new THREEJS.BufferAttribute(Float32Array.from(backFaceMeshData.uvs), 2));
        }
        geometry.setIndex(new THREEJS.BufferAttribute(Uint32Array.from(backFaceMeshData.indices), 1));

        const group = new THREEJS.Group();
        group.name = this.generateEntityId("backFaceSurface");
        const mesh = new THREEJS.Mesh(geometry, backMaterial);
        mesh.name = this.generateEntityId("backFaceSurfaceChild");
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        return group;
    }

    private createPointSpheresMesh(
        meshName: string, positions: Inputs.Base.Point3[], colors: string[], opacity: number, size: number, _updatable: boolean): THREEJS.Group {
        const positionsModel = positions.map((pos, posIndex) => {
            return {
                position: pos,
                color: colors[posIndex],
                posIndex
            };
        });

        const colorSet = Array.from(new Set(colors));
        const materialSet = colorSet.map((colour) => {
            // Use cached unlit material for points
            const mat = this.getOrCreateUnlitMaterial(colour, opacity, () => {
                const material = new THREEJS.MeshBasicMaterial({ name: this.generateEntityId("pointMaterial") });
                material.opacity = opacity;
                material.transparent = opacity < 1;
                material.color = new THREEJS.Color(colour);
                return material;
            });
            const filteredPositions = positionsModel.filter(s => s.color === colour);

            return { hex: colour, material: mat, positions: filteredPositions };
        });

        const pointsGroup = new THREEJS.Group();
        pointsGroup.name = meshName;
        this.context.scene.add(pointsGroup);
        
        // Create one InstancedMesh per unique color for efficient rendering
        materialSet.forEach(ms => {
            const pointCount = ms.positions.length;
            if (pointCount === 0) return;
            
            // Use fewer segments for large point counts to improve performance
            const segments = pointCount > 1000 ? 1 : 6;
            const geom = new THREEJS.SphereGeometry(size, segments, segments);

            // Create a single InstancedMesh for all points of this color
            const instancedMesh = new THREEJS.InstancedMesh(geom, ms.material, pointCount);
            instancedMesh.name = this.generateEntityId(`points-${ms.hex}`);
            
            // Store the original point indices for updating later
            const pointIndices: number[] = [];
            const matrix = new THREEJS.Matrix4();
            
            ms.positions.forEach((pos, instanceIndex) => {
                matrix.setPosition(pos.position[0], pos.position[1], pos.position[2]);
                instancedMesh.setMatrixAt(instanceIndex, matrix);
                pointIndices.push(pos.posIndex);
            });
            
            instancedMesh.instanceMatrix.needsUpdate = true;
            instancedMesh.userData = { pointIndices };
            pointsGroup.add(instancedMesh);
        });

        return pointsGroup;
    }

}
