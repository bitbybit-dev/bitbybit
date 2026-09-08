
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

    private readonly materialCache = new Map<string, THREEJS.MeshPhysicalMaterial>();

    private readonly unlitMaterialCache = new Map<string, THREEJS.MeshBasicMaterial>();

    private entityIdCounter = 0;
    private readonly instanceId = `three-${Date.now()}`;

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
        return this.materialCache.size === 0 && this.unlitMaterialCache.size === 0;
    }

    /**
     * Cleanup method to dispose of cached materials and prevent memory leaks
     * Should be called when the DrawHelper instance is no longer needed
     */
    public dispose(): void {
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

        this.entityIdCounter = 0;

        console.log("DrawHelper disposed successfully");
    }

    async drawManifoldsOrCrossSections(inputs: Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>): Promise<THREEJS.Group> {
        try {
            const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
            const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto[] = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", safeWorkerOptions);
            const meshes = decomposedMesh.map(dec => this.handleDecomposedManifold(dec, inputs)).filter((s): s is THREEJS.Group => s !== undefined);
            const manifoldMeshContainer = new THREEJS.Group();
            manifoldMeshContainer.name = this.generateEntityId("manifoldMeshContainer");
            meshes.forEach(mesh => {
                mesh.parent = manifoldMeshContainer;
            });
            this.context.scene.add(manifoldMeshContainer);
            return manifoldMeshContainer;
        } catch (error) {
            console.error("Error drawing manifolds or cross sections:", error);
            throw new Error(`Failed to draw manifolds or cross sections: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
        }
    }

    async drawManifoldOrCrossSection(inputs: Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>): Promise<THREEJS.Group | undefined> {
        try {
            if (!inputs.manifoldOrCrossSection) {
                throw new Error("Manifold or cross section parameter is required");
            }
            const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
            const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", safeWorkerOptions);
            return this.handleDecomposedManifold(decomposedMesh, inputs);
        } catch (error) {
            console.error("Error drawing manifold or cross section:", error);
            throw new Error(`Failed to draw manifold or cross section: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
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
            throw new Error(`Failed to draw OCCT shape: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
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
            throw new Error(`Failed to draw OCCT shapes: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
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
                const c = inputs.mesh.color;
                colour = "#" + new THREEJS.Color(c[0], c[1], c[2]).getHexString();
            } else {
                colour = Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours;
            }
            const s = this.makeMesh({ 
                updatable: inputs.updatable,
                opacity: inputs.opacity,
                hidden: inputs.hidden,
                colour: colour!,
                drawTwoSided: inputs.drawTwoSided,
                backFaceColour: inputs.backFaceColour,
                backFaceOpacity: inputs.backFaceOpacity
            }, meshToUpdate, res);
            inputs.jscadMesh = s;
            return s;
        } catch (error) {
            console.error("Error drawing JSCAD solid or polygon mesh:", error);
            throw new Error(`Failed to draw JSCAD mesh: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
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
                    colour = "#" + new THREEJS.Color(c[0]!, c[1]!, c[2]!).getHexString();
                } else if (colourIsArrayAndMatches) {
                    colour = inputs.colours[index];
                } else if (colorsAreArrays) {
                    colour = inputs.colours[0];
                } else {
                    colour = inputs.colours;
                }
                const m = this.makeMesh({ 
                    ...inputs, 
                    colour: colour as string,
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
            throw new Error(`Failed to draw JSCAD meshes: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
        }
    }

    drawPolylinesWithColours(inputs: Inputs.Polyline.DrawPolylinesDto<THREEJS.Group> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum, arrowSize?: number, arrowAngle?: number }) {
        let colours = inputs.colours;
        const strategy = inputs.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;

        const points = inputs.polylines.map((s, index) => {
            const pts = s.isClosed ? [...s.points, s.points[0]!] : s.points;
            if (s.color) {
                if (!Array.isArray(colours)) {
                    const shared = colours ?? "#444444";
                    colours = inputs.polylines.map(() => shared);
                }
                if (Array.isArray(s.color)) {
                    colours[index] = "#" + new THREEJS.Color(s.color[0]!, s.color[1]!, s.color[2]!).getHexString();
                } else {
                    colours[index] = s.color;
                }
            }
            return pts;
        });

        let lineSegments: THREEJS.LineSegments | undefined;
        if (inputs.polylinesMesh && inputs.updatable) {
            lineSegments = inputs.polylinesMesh.children[0] as THREEJS.LineSegments;
        }
        const polylines = this.drawPolylines(
            lineSegments,
            points,
            inputs.updatable ?? false,
            inputs.size ?? 3,
            inputs.opacity ?? 1,
            colours ?? "#444444",
            strategy,
            inputs.arrowSize,
            inputs.arrowAngle
        );
        if (inputs.polylinesMesh && inputs.updatable) {
            if (inputs.polylinesMesh.children[0]!.name !== polylines!.name) {
                inputs.polylinesMesh.children.forEach(child => {
                    if (child instanceof THREEJS.LineSegments) {
                        child.geometry.dispose();
                        (child.material as THREEJS.Material).dispose();
                    }
                });
                inputs.polylinesMesh.clear();
                inputs.polylinesMesh.add(polylines!);
            }
            return inputs.polylinesMesh;
        } else {
            const group = new THREEJS.Group();
            group.name = this.generateEntityId("polylines");
            group.add(polylines!);
            this.context.scene.add(group);
            return group;
        }
    }

    drawPoint(inputs: Inputs.Point.DrawPointDto<THREEJS.Group>): THREEJS.Group {
        const vectorPoints = [inputs.point];

        const colorsHex: string[] = Array.isArray(inputs.colours) ? inputs.colours : [inputs.colours];
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
        const points = inputs.polyline.isClosed
            ? [...inputs.polyline.points, inputs.polyline.points[0]!]
            : inputs.polyline.points;
        return this.drawPolyline(
            inputs.polylineMesh,
            points,
            inputs.updatable ?? false,
            inputs.size ?? 3,
            inputs.opacity ?? 1,
            inputs.colours ?? "#444444",
            inputs.arrowSize,
            inputs.arrowAngle
        );
    }

    drawPolyline(mesh: THREEJS.Group | undefined,
        pointsToDraw: Inputs.Base.Point3[],
        updatable: boolean, size: number, opacity: number, colours: string | string[],
        arrowSize = 0, arrowAngle = 30): THREEJS.Group {
        let lineSegments: THREEJS.LineSegments | undefined;
        if (mesh && mesh.children.length > 0) {
            lineSegments = mesh.children[0] as THREEJS.LineSegments;
        }
        const polylines = this.drawPolylines(lineSegments, [pointsToDraw], updatable, size, opacity, colours, 
            Inputs.Base.colorMapStrategyEnum.lastColorRemainder, arrowSize, arrowAngle);
        if (!mesh) {
            mesh = new THREEJS.Group();
            mesh.name = this.generateEntityId("polyline");
            mesh.add(polylines!);
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

        const coloursHex = this.resolveAllColors(inputs.colours, vectorPoints.length, strategy);

        if (inputs.pointsMesh && inputs.updatable) {
            const currentPointCount = inputs.pointsMesh.children.reduce((sum, child) => {
                if (child instanceof THREEJS.InstancedMesh) {
                    return sum + child.count;
                }
                return sum + 1;
            }, 0);

            if (currentPointCount === vectorPoints.length) {
                this.updatePointsInstances(inputs.pointsMesh, vectorPoints);
            } else {
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
        const children = group.children as THREEJS.InstancedMesh[];

        const positionMap = new Map<number, THREEJS.Vector3>();
        positions.forEach((pos, index) => {
            positionMap.set(index, new THREEJS.Vector3(pos[0], pos[1], pos[2]));
        });

        children.forEach((instancedMesh: THREEJS.InstancedMesh) => {
            const indices = instancedMesh.userData["pointIndices"] as number[];
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
                colours: resolvedColours[index]!,
                updatable: inputs.updatable,
                opacity: inputs.opacity,
                hidden: inputs.hidden,
                drawTwoSided: inputs.drawTwoSided,
                backFaceColour: inputs.backFaceColour,
                backFaceOpacity: inputs.backFaceOpacity,
            });
            inputs.surfacesMesh!.add(srf);
        });

        return inputs.surfacesMesh;
    }

    createOrUpdateSurfacesMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] | undefined }[],
        group: THREEJS.Group | undefined, updatable: boolean, material: THREEJS.MeshPhysicalMaterial, addToScene: boolean, hidden: boolean
    ): THREEJS.Group {
        const createMesh = () => {
            const totalPositions: number[] = [];
            let totalNormals: number[] = [];
            const totalIndices: number[] = [];
            const totalUvs: number[] = [];
            let indexOffset = 0;

            meshDataConverted.forEach(meshItem => {
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
                const offsetIndices = meshItem.indices.map(i => i + indexOffset);
                totalIndices.push(...offsetIndices);
                indexOffset += meshItem.positions.length / 3;
            });

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
            let scene: THREEJS.Scene | null = null;
            if (addToScene) {
                scene = this.context.scene;
            }

            group = new THREEJS.Group();
            group.name = this.generateEntityId("surface");
            if (scene) {
                scene.add(group);
            }
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

        const hex = Array.isArray(inputs.colours) ? inputs.colours[0]! : inputs.colours;
        const pbr = this.getOrCreateMaterial(hex, inputs.opacity, 0, () => {
            const mat = new THREEJS.MeshPhysicalMaterial();
            mat.name = this.generateEntityId("surfaceMaterial");
            mat.color = new THREEJS.Color(hex);
            mat.metalness = MATERIAL_DEFAULTS.METALNESS.SURFACE;
            mat.roughness = MATERIAL_DEFAULTS.ROUGHNESS.SURFACE;
            mat.opacity = inputs.opacity;
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
            const vn = meshData.normals[x]!;
            meshDataConverted.normals.push(vn[0]!, vn[1]!, vn[2]!);
            const pt = meshData.points[x]!;
            meshDataConverted.positions.push(pt[0]!, pt[1]!, pt[2]!);
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
        positions: number[], indices: number[], _normals: number[], jscadMesh: THREEJS.Group, transforms: number[], _updatable: boolean, material: THREEJS.MeshPhysicalMaterial
    ): void {
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

    async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>) {
        const shapeGroup = new THREEJS.Group();
        shapeGroup.name = this.generateEntityId("brepMesh");
        this.context.scene.add(shapeGroup);
        const dummy = undefined;

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
                    positions: face.vertexCoord,
                    normals: face.normalCoord,
                    indices: face.triIndexes,
                    uvs: face.uvs,
                };
            });

            const mesh = this.createOrUpdateSurfacesMesh(meshData, dummy, false, pbr, true, false);
            shapeGroup.add(mesh);

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

            const polylineEdgePoints: Inputs.Base.Point3[][] = [];
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertexCoord.filter(s => s !== undefined);
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
            shapeGroup.add(line!);
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
                let edgeMiddle = edge.middlePoint;
                if (edgeMiddle === undefined) {
                    edgeMiddle = this.computeEdgeMiddlePos(edge);
                }
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${edge.edgeIndex}`;
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
            shapeGroup.add(edgeMesh!);
        }
        if (inputs.drawFaceIndexes) {
            const promises = decomposedMesh.faceList.map(async (face) => {
                let faceMiddle = face.centerPoint;
                if (faceMiddle === undefined) {
                    faceMiddle = this.computeFaceMiddlePos(face.vertexCoordVec) as Inputs.Base.Point3;
                }
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${face.faceIndex}`;
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
            faceMesh!.parent = shapeGroup;
        }
        return shapeGroup;
    }

    async handleDecomposedMeshIndividually(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>): Promise<THREEJS.Group> {
        const shapeGroup = new THREEJS.Group();
        shapeGroup.name = this.generateEntityId("brepMesh");
        this.context.scene.add(shapeGroup);
        const dummy = undefined;

        if (inputs.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {
            const hex = Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour;
            const alpha = inputs.faceOpacity;
            const zOffset = inputs.drawEdges ? 2 : 0;

            let pbr: THREEJS.MeshPhysicalMaterial;
            if (inputs.faceMaterial) {
                pbr = inputs.faceMaterial;
            } else {
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

            decomposedMesh.faceList.forEach(face => {
                const meshData: MeshData[] = [{
                    positions: [...face.vertexCoord],
                    normals: [...face.normalCoord],
                    indices: [...face.triIndexes],
                    uvs: face.uvs ? [...face.uvs] : undefined,
                }];

                if (inputs.drawTwoSided !== false) {
                    const backFaceMesh = this.createBackFaceMesh(
                        meshData,
                        inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                        inputs.backFaceOpacity ?? inputs.faceOpacity,
                        zOffset
                    );
                    backFaceMesh.name = `face ${face.faceIndex} backFace`;
                    shapeGroup.add(backFaceMesh);
                }

                const faceMesh = this.createOrUpdateSurfacesMesh(meshData, dummy, false, pbr, true, false);
                faceMesh.name = `face ${face.faceIndex}`;
                shapeGroup.add(faceMesh);
            });
        }

        if (inputs.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertexCoord.filter(s => s !== undefined);
                const mesh = this.drawPolylines(
                    undefined,
                    [ev],
                    false,
                    inputs.edgeWidth,
                    inputs.edgeOpacity,
                    inputs.edgeColour,
                    Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                    options.edgeArrowSize,
                    options.edgeArrowAngle
                );
                if (mesh) {
                    mesh.name = `edge ${edge.edgeIndex}`;
                    shapeGroup.add(mesh);
                }
            });
        }

        if (inputs.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: inputs.vertexSize,
                colours: inputs.vertexColour,
                updatable: false,
            });
            mesh.name = "vertices";
            shapeGroup.add(mesh);
        }

        return shapeGroup;
    }

    private drawPolylines(lineSegments: THREEJS.LineSegments | undefined, polylinesPoints: Inputs.Base.Vector3[][], updatable: boolean,
        size: number, _opacity: number, colours: string | string[], colorMapStrategy: Inputs.Base.colorMapStrategyEnum = Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
        arrowSize = 0, arrowAngle = 30) {
        if (polylinesPoints && polylinesPoints.length > 0) {
            const lineVertices: THREEJS.Vector3[] = [];
            const polylineSegmentCounts: number[] = [];
            const allColors: string[] = [];

            polylinesPoints.forEach((pts, polylineIndex) => {
                const polylineColor = this.resolveColorForEntity(colours, polylineIndex, polylinesPoints.length, colorMapStrategy);
                let segmentCount = 0;
                for (let i = 0; i < pts.length - 1; i++) {
                    const c = pts[i]!;
                    const n = pts[i + 1]!;

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

                if (arrowSize > 0 && pts.length >= 2) {
                    const arrowLines = this.computeArrowHeadLines(pts, arrowSize, arrowAngle);
                    arrowLines.forEach(arrowLine => {
                        lineVertices.push(new THREEJS.Vector3(arrowLine[0]![0], arrowLine[0]![1], arrowLine[0]![2]));
                        lineVertices.push(new THREEJS.Vector3(arrowLine[1]![0], arrowLine[1]![1], arrowLine[1]![2]));
                        polylineSegmentCounts.push(1);
                        allColors.push(polylineColor);
                    });
                }
            });
            let lines: THREEJS.LineSegments;

            if (lineSegments && updatable) {
                if (lineSegments?.userData?.["linesForRenderLengths"] === polylinesPoints.map(l => l.length).toString()) {
                    lineSegments.geometry.clearGroups();
                    lineSegments.geometry.setFromPoints(lineVertices);
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
            const colorHex = this.resolveColorForEntity(colours, polylineIndex, totalPolylines, colorMapStrategy);
            const color = new THREEJS.Color(colorHex);

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
            lineColors = this.computePolylineColorsWithExplicit(polylineSegmentCounts, explicitColors);
        } else if (polylineSegmentCounts.length > 0) {
            lineColors = this.computePolylineColors(colours, polylineSegmentCounts, colorMapStrategy);
        } else {
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
        options: Inputs.Draw.DrawManifoldOrCrossSectionOptions): THREEJS.Group | undefined {
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

                if (options.drawTwoSided !== false) {
                    const positions = Array.from(decomposedMesh.vertProperties);
                    const indices = Array.from(decomposedMesh.triVerts);

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

    private getSafeWorkerOptions<T extends { faceMaterial?: THREEJS.Material | undefined }>(inputs: T): Omit<T, "faceMaterial"> {

        const { faceMaterial, ...safeOptions } = inputs;
        return safeOptions;
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

        const cached = this.materialCache.get(key);
        if (cached) {
            return cached;
        }

        if (this.materialCache.size >= CACHE_CONFIG.MAX_MATERIALS) {
            const firstKey = this.materialCache.keys().next().value!;
            const material = this.materialCache.get(firstKey);
            if (material && material.dispose) {
                material.dispose();
            }
            this.materialCache.delete(firstKey);
            console.warn(`Material cache full, evicted: ${firstKey}`);
        }

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
        const key = this.getMaterialKey(hex, alpha, 0, true);

        const cached = this.unlitMaterialCache.get(key);
        if (cached) {
            return cached;
        }

        if (this.unlitMaterialCache.size >= CACHE_CONFIG.MAX_MATERIALS) {
            const firstKey = this.unlitMaterialCache.keys().next().value!;
            const material = this.unlitMaterialCache.get(firstKey);
            if (material && material.dispose) {
                material.dispose();
            }
            this.unlitMaterialCache.delete(firstKey);
            console.warn(`Unlit material cache full, evicted: ${firstKey}`);
        }

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

        const backFaceMeshData = this.prepareBackFaceMeshData(meshDataConverted);

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

        materialSet.forEach(ms => {
            const pointCount = ms.positions.length;
            if (pointCount === 0) return;

            const segments = pointCount > 1000 ? 1 : 6;
            const geom = new THREEJS.SphereGeometry(size, segments, segments);

            const instancedMesh = new THREEJS.InstancedMesh(geom, ms.material, pointCount);
            instancedMesh.name = this.generateEntityId(`points-${ms.hex}`);

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
