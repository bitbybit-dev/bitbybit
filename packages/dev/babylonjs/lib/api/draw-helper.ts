import * as BABYLON from "@babylonjs/core";
import { Context } from "./context";
import * as Inputs from "./inputs";
import { DrawHelperCore, MeshData } from "@bitbybit-dev/core";
import { Vector } from "@bitbybit-dev/base";
import { JSCADWorkerManager, JSCADText } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { CACHE_CONFIG, DEFAULT_COLORS, BABYLONJS_MATERIAL_DEFAULTS } from "./constants";

export class DrawHelper extends DrawHelperCore {

    private readonly materialCache = new Map<string, BABYLON.PBRMetallicRoughnessMaterial>();

    private readonly unlitMaterialCache = new Map<string, BABYLON.StandardMaterial>();

    private entityIdCounter = 0;
    private readonly instanceId = `babylon-${Date.now()}`;

    constructor(
        private readonly context: Context,
        private readonly solidText: JSCADText,
        override readonly vector: Vector,
        private readonly jscadWorkerManager: JSCADWorkerManager,
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
        private readonly occWorkerManager: OCCTWorkerManager) {
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
        createFn: () => BABYLON.PBRMetallicRoughnessMaterial,
        unlit = false
    ): BABYLON.PBRMetallicRoughnessMaterial {
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
        }

        const material = createFn();
        
        material.onDispose = () => {
            this.materialCache.delete(key);
        };
        
        this.materialCache.set(key, material);
        return material;
    }

    /**
     * Get or create a cached unlit material (StandardMaterial) for points and lines.
     * Uses a separate cache from PBR materials since these have different types.
     * @param hex - Hex color string
     * @param alpha - Alpha value (0-1)
     * @param createFn - Function to create new material if not cached
     * @returns Cached or newly created StandardMaterial
     */
    private getOrCreateUnlitMaterial(
        hex: string,
        alpha: number,
        createFn: () => BABYLON.StandardMaterial
    ): BABYLON.StandardMaterial {
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
        }

        const material = createFn();
        
        material.onDispose = () => {
            this.unlitMaterialCache.delete(key);
        };
        
        this.unlitMaterialCache.set(key, material);
        return material;
    }

    /**
     * Create a back face mesh with flipped normals and optionally reversed winding order
     * This is used for two-sided rendering of CAD geometries
     * @param meshDataConverted - Original mesh data
     * @param backFaceColour - Color for the back face
     * @param backFaceOpacity - Opacity for the back face
     * @param zOffset - Depth bias to prevent z-fighting
     * @param useClockWiseSideOrientation - Whether to set sideOrientation to ClockWise (default true, false for JSCAD)
     * @param skipWindingReversal - Whether to skip reversing winding order (default false, true for JSCAD in left-handed scenes)
     * @returns Mesh containing the back face geometry
     */
    private createBackFaceMesh(
        meshDataConverted: MeshData[],
        backFaceColour: string,
        backFaceOpacity: number,
        zOffset: number,
        useClockWiseSideOrientation = true,
        skipWindingReversal = false
    ): BABYLON.Mesh {
        const isRightHanded = this.context.scene.useRightHandedSystem === true;
        
        const materialKey = `${backFaceColour}-back${useClockWiseSideOrientation ? "" : "-jscad"}${isRightHanded ? "-scene-rh" : ""}`;
        const backMaterial = this.getOrCreateMaterial(materialKey, backFaceOpacity, zOffset + 0.1, () => {
            const mat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("backFaceMaterial"), this.context.scene);
            mat.baseColor = BABYLON.Color3.FromHexString(backFaceColour);
            mat.metallic = BABYLONJS_MATERIAL_DEFAULTS.METALLIC;
            mat.roughness = BABYLONJS_MATERIAL_DEFAULTS.ROUGHNESS.SURFACE;
            mat.alpha = backFaceOpacity;
            mat.alphaMode = BABYLONJS_MATERIAL_DEFAULTS.ALPHA_MODE;
            mat.backFaceCulling = true;
            mat.doubleSided = false;
            
            if (isRightHanded) {
                mat.sideOrientation = BABYLON.Material.CounterClockWiseSideOrientation;
            } else if (useClockWiseSideOrientation) {
                mat.sideOrientation = BABYLON.Material.ClockWiseSideOrientation;
            }
            
            mat.zOffset = zOffset + 0.1;
            return mat;
        });

        let backFaceMeshData: MeshData;
        if (skipWindingReversal) {
            backFaceMeshData = this.prepareBackFaceMeshDataNoWindingReversal(meshDataConverted);
        } else {
            backFaceMeshData = this.prepareBackFaceMeshData(meshDataConverted);
        }

        const mesh = new BABYLON.Mesh(this.generateEntityId("backFaceSurface"), this.context.scene);
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = backFaceMeshData.positions;
        vertexData.indices = backFaceMeshData.indices;
        vertexData.normals = backFaceMeshData.normals;
        if (backFaceMeshData.uvs) {
            vertexData.uvs = backFaceMeshData.uvs;
        }
        vertexData.applyToMesh(mesh, false);
        mesh.material = backMaterial;
        mesh.isPickable = false;

        return mesh;
    }
    
    /**
     * Prepare back face mesh data by only flipping normals (no winding reversal)
     * Used for JSCAD geometry which is right-handed
     */
    private prepareBackFaceMeshDataNoWindingReversal(meshDataArray: MeshData[]): MeshData {
        const totalPositions: number[] = [];
        const totalNormals: number[] = [];
        const totalIndices: number[] = [];
        const totalUvs: number[] = [];
        let indexOffset = 0;

        meshDataArray.forEach(meshItem => {
            totalPositions.push(...meshItem.positions);
            
            if (meshItem.normals && meshItem.normals.length > 0) {
                for (let i = 0; i < meshItem.normals.length; i++) {
                    totalNormals.push(-meshItem.normals[i]!);
                }
            }
            
            if (meshItem.uvs) {
                totalUvs.push(...meshItem.uvs);
            }
            
            for (let i = 0; i < meshItem.indices.length; i++) {
                totalIndices.push(meshItem.indices[i]! + indexOffset);
            }
            indexOffset += meshItem.positions.length / 3;
        });

        return {
            positions: totalPositions,
            indices: totalIndices,
            normals: totalNormals,
            uvs: totalUvs.length > 0 ? totalUvs : undefined
        };
    }

    createOrUpdateSurfacesMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] | undefined }[],
        mesh: BABYLON.Mesh | undefined, updatable: boolean, material: BABYLON.PBRMetallicRoughnessMaterial, addToScene: boolean, hidden: boolean
    ): BABYLON.Mesh {
        const createMesh = () => {
            const first = meshDataConverted.pop()!;
            const vd = new BABYLON.VertexData();
            vd.positions = first.positions;
            vd.indices = first.indices;
            vd.normals = first.normals;
            if (first.uvs) {
                vd.uvs = first.uvs;
            }

            const v: BABYLON.VertexData[] = [];
            meshDataConverted.forEach(meshData => {
                const vertexData = new BABYLON.VertexData();
                vertexData.positions = meshData.positions;
                vertexData.indices = meshData.indices;
                vertexData.normals = meshData.normals;
                if (meshData.uvs) {
                    vertexData.uvs = meshData.uvs;
                }
                v.push(vertexData);
            });
            vd.merge(v);
            vd.applyToMesh(mesh!, updatable);
        };

        if (mesh && updatable) {
            mesh.dispose();
            createMesh();
            mesh.flipFaces(false);
        } else {
            let scene = null;
            if (addToScene) {
                scene = this.context.scene;
            }
            mesh = new BABYLON.Mesh(this.generateEntityId("surface"), scene);
            createMesh();
            mesh.flipFaces(false);
            if (material) {
                mesh.material = material;
            }
        }
        if (material) {
            mesh.material = material;
        }
        if (hidden) {
            mesh.isVisible = false;
        }
        mesh.isPickable = false;
        return mesh;
    }


    edgesRendering(mesh: BABYLON.LinesMesh, size: number, opacity: number, colours: string | string[]): void {
        mesh.enableEdgesRendering();
        mesh.edgesWidth = size;
        const colour = Array.isArray(colours) ? BABYLON.Color3.FromHexString(colours[0]!) : BABYLON.Color3.FromHexString(colours);
        const edgeColor = colour;
        mesh.color = edgeColor;
        mesh.edgesColor = new BABYLON.Color4(edgeColor.r, edgeColor.g, edgeColor.b, opacity);
    }

    drawLines(inputs: Inputs.Line.DrawLinesDto<BABYLON.LinesMesh>): BABYLON.LinesMesh {
        const lines: BABYLON.Vector3[][] = [];
        const colors: BABYLON.Color4[][] = [];

        inputs.lines.forEach((line, index) => {
            lines.push([
                new BABYLON.Vector3(line.start[0], line.start[1], line.start[2]),
                new BABYLON.Vector3(line.end[0], line.end[1], line.end[2])]
            );
            let col;
            if (Array.isArray(inputs.colours) && inputs.colours.length === inputs.lines.length) {
                col = BABYLON.Color3.FromHexString(inputs.colours[index]!);
            } else if (Array.isArray(inputs.colours)) {
                col = BABYLON.Color3.FromHexString(inputs.colours[0]!);
            } else {
                col = BABYLON.Color3.FromHexString(inputs.colours ?? "#444444");
            }
            colors.push([
                new BABYLON.Color4(col.r, col.g, col.b, inputs.opacity),
                new BABYLON.Color4(col.r, col.g, col.b, inputs.opacity)
            ]);
        });

        if (inputs.linesMesh && inputs.updatable) {
            if (inputs.linesMesh.getTotalVertices() / 2 === lines.length) {
                inputs.linesMesh = BABYLON.MeshBuilder.CreateLineSystem(inputs.linesMesh.name,
                    {
                        lines,
                        instance: inputs.linesMesh,
                        colors, useVertexAlpha: true,
                        updatable: inputs.updatable
                    }, null);
            } else {
                inputs.linesMesh.dispose();
                inputs.linesMesh = this.createLineSystemMesh(inputs.updatable ?? false, lines, colors);
            }
        } else {
            inputs.linesMesh = this.createLineSystemMesh(inputs.updatable ?? false, lines, colors);
        }

        this.edgesRendering(inputs.linesMesh, inputs.size ?? 3, inputs.opacity ?? 1, inputs.colours ?? "#444444");
        return inputs.linesMesh;
    }

    drawPolylineClose(inputs: Inputs.Polyline.DrawPolylineDto<BABYLON.GreasedLineMesh> & { arrowSize?: number, arrowAngle?: number }): BABYLON.GreasedLineMesh {
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

    drawCurve(inputs: Inputs.Verb.DrawCurveDto<BABYLON.GreasedLineMesh>): BABYLON.GreasedLineMesh {
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

    drawSurface(inputs: Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>): BABYLON.Mesh {
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

        const color = (Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours) ?? "#444444";
        const pbr = this.getOrCreateMaterial(color, inputs.opacity, 0, () => {
            const mat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("surfaceMaterial"), this.context.scene);
            mat.baseColor = BABYLON.Color3.FromHexString(color);
            mat.metallic = BABYLONJS_MATERIAL_DEFAULTS.METALLIC;
            mat.roughness = BABYLONJS_MATERIAL_DEFAULTS.ROUGHNESS.SURFACE;
            mat.alpha = inputs.opacity;
            mat.alphaMode = BABYLONJS_MATERIAL_DEFAULTS.ALPHA_MODE;
            mat.backFaceCulling = true;
            mat.doubleSided = false;
            return mat;
        });

        let backFaceMesh: BABYLON.Mesh | undefined;
        if (inputs.drawTwoSided !== false) {
            backFaceMesh = this.createBackFaceMesh(
                [meshDataConverted],
                inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                inputs.backFaceOpacity ?? inputs.opacity,
                0
            );
        }

        const surfaceMesh = this.createOrUpdateSurfacesMesh(
            [meshDataConverted],
            inputs.surfaceMesh,
            inputs.updatable,
            pbr,
            true,
            inputs.hidden,
        );

        if (backFaceMesh) {
            backFaceMesh.parent = surfaceMesh;
        }

        return surfaceMesh;
    }

    drawSurfaces(inputs: Inputs.Verb.DrawSurfacesDto<BABYLON.Mesh>): BABYLON.Mesh {
        const tessellatedSurfaces: { faces: number[][] }[] = [];
        inputs.surfaces.forEach(srf => {
            tessellatedSurfaces.push(srf.tessellate());
        });

        const meshDataConverted: MeshData = {
            positions: [],
            indices: [],
            normals: [],
        };

        let countIndices = 0;
        tessellatedSurfaces.forEach(meshData => {
            meshData.faces.forEach((faceIndices: number[]) => {
                countIndices = this.parseFaces(faceIndices, meshData, meshDataConverted, countIndices);
            });
        });

        const color = (Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours) ?? "#444444";
        const pbr = this.getOrCreateMaterial(color, inputs.opacity, 0, () => {
            const mat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("surfacesMaterial"), this.context.scene);
            mat.baseColor = BABYLON.Color3.FromHexString(color);
            mat.metallic = BABYLONJS_MATERIAL_DEFAULTS.METALLIC;
            mat.roughness = BABYLONJS_MATERIAL_DEFAULTS.ROUGHNESS.SURFACE;
            mat.alpha = inputs.opacity;
            mat.alphaMode = BABYLONJS_MATERIAL_DEFAULTS.ALPHA_MODE;
            mat.backFaceCulling = true;
            mat.doubleSided = false;
            return mat;
        });

        let backFaceMesh: BABYLON.Mesh | undefined;
        if (inputs.drawTwoSided !== false) {
            backFaceMesh = this.createBackFaceMesh(
                [meshDataConverted],
                inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                inputs.backFaceOpacity ?? inputs.opacity,
                0
            );
        }

        const surfacesMesh = this.createOrUpdateSurfacesMesh(
            [meshDataConverted],
            inputs.surfacesMesh,
            inputs.updatable,
            pbr,
            true,
            inputs.hidden
        );

        if (backFaceMesh) {
            backFaceMesh.parent = surfacesMesh;
        }

        return surfacesMesh;
    }

    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto<BABYLON.Mesh> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum }): BABYLON.Mesh {
        const strategy = inputs.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        const resolvedColours = this.resolveAllColors(inputs.colours, inputs.surfaces.length, strategy);

        if (inputs.surfacesMesh && inputs.updatable) {
            inputs.surfacesMesh.getChildren().forEach(srf => srf.dispose());
        } else {
            inputs.surfacesMesh = new BABYLON.Mesh(this.generateEntityId("colouredSurfaces"), this.context.scene);
        }
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

    drawCurves(inputs: Inputs.Verb.DrawCurvesDto<BABYLON.GreasedLineMesh>): BABYLON.GreasedLineMesh {
        const points = inputs.curves.map(s => s.tessellate());
        return this.drawPolylines(
            inputs.curvesMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours
        )!;
    }

    drawPolyline(mesh: BABYLON.GreasedLineMesh | undefined,
        pointsToDraw: number[][],
        updatable: boolean, size: number, opacity: number, colours: string | string[],
        arrowSize = 0, arrowAngle = 30): BABYLON.GreasedLineMesh {
        return this.drawPolylines(mesh, [pointsToDraw], updatable, size, opacity, colours, 1e-7, true,
            Inputs.Base.colorMapStrategyEnum.lastColorRemainder, arrowSize, arrowAngle)!;
    }

    drawPolylinesWithColours(inputs: Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum, arrowSize?: number, arrowAngle?: number }) {
        let colours = inputs.colours ?? "#444444";
        const strategy = inputs.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        
        const points = inputs.polylines.map((s, index) => {
            const pts = s.isClosed ? [...s.points, s.points[0]!] : s.points;
            if (s.color) {
                if (!Array.isArray(colours)) {
                    const shared = colours;
                    colours = inputs.polylines.map(() => shared);
                }
                if (Array.isArray(s.color)) {
                    colours[index] = BABYLON.Color3.FromArray(s.color).toHexString();
                } else {
                    colours[index] = s.color;
                }
            }
            return pts;
        });

        return this.drawPolylines(
            inputs.polylinesMesh,
            points,
            inputs.updatable ?? false,
            inputs.size ?? 3,
            inputs.opacity ?? 1,
            colours,
            1e-7,
            true,
            strategy,
            inputs.arrowSize,
            inputs.arrowAngle
        );
    }

    drawPolylines(
        mesh: BABYLON.GreasedLineMesh | undefined, polylinePoints: number[][][], updatable: boolean,
        size: number, opacity: number, colours: string | string[], tolerance = 1e-7, segmentize = false,
        colorMapStrategy: Inputs.Base.colorMapStrategyEnum = Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
        arrowSize = 0, arrowAngle = 30
    ): BABYLON.GreasedLineMesh | undefined {
        const linesForRender: number[][] = [];
        const arrowLinesForRender: number[][] = [];
        
        if (polylinePoints && polylinePoints.length > 0) {
            polylinePoints.forEach(polyline => {
                const points = polyline.map(p => p.length === 2 ? [p[0]!, p[1]!, 0] : p);
                if (segmentize) {
                    const segmentedPoints = this.segmentizePolylinePoints(points, tolerance);
                    if (segmentedPoints.length >= 2) {
                        linesForRender.push(segmentedPoints.flat());
                    }
                } else {
                    linesForRender.push(points.flat());
                }
                
                if (arrowSize > 0 && points.length >= 2) {
                    const arrowLines = this.computeArrowHeadLines(points as Inputs.Base.Point3[], arrowSize, arrowAngle);
                    arrowLines.forEach(arrowLine => {
                        arrowLinesForRender.push(arrowLine.flat());
                    });
                }
            });
            
            const allLinesForRender = [...linesForRender, ...arrowLinesForRender];
            
            const width = size / 100;
            
            const resolvedColors = this.resolveAllColors(colours, polylinePoints.length, colorMapStrategy);
            
            const arrowColors: string[] = [];
            if (arrowSize > 0) {
                resolvedColors.forEach(color => {
                    for (let i = 0; i < 4; i++) {
                        arrowColors.push(color);
                    }
                });
            }
            const allColors = [...resolvedColors, ...arrowColors];
            const babylonColors = allColors.map(c => BABYLON.Color3.FromHexString(c));

            if (mesh && updatable) {
                if (!mesh?.metadata?.linesForRenderLengths.some((s: number, i: number) => s !== allLinesForRender[i]?.length)) {
                    mesh.setPoints(allLinesForRender);
                    return mesh;
                } else {
                    mesh.dispose();
                    mesh = this.createGreasedPolylines(updatable, allLinesForRender, width, babylonColors, opacity);
                    mesh.metadata = { linesForRenderLengths: allLinesForRender.map(l => l.length) };
                }
            } else {
                mesh = this.createGreasedPolylines(updatable, allLinesForRender, width, babylonColors, opacity);
                mesh.metadata = { linesForRenderLengths: allLinesForRender.map(l => l.length) };
            }

            return mesh;
        } else {
            return undefined;
        }
    }

    createGreasedPolylines(updatable: boolean, lines: number[][], width: number, colors: BABYLON.Color3[], visibility: number): BABYLON.GreasedLineMesh {
        const expandedColors: BABYLON.Color3[] = [];
        lines.forEach((line, lineIndex) => {
            const lineColor = colors[lineIndex] || colors[0]!;
            const numPoints = line.length / 3;
            for (let i = 0; i < numPoints; i++) {
                expandedColors.push(lineColor);
            }
        });
        
        const hasMultipleColors = colors.length > 1 || (colors.length === 1 && lines.length > 1);
        
        const materialOptions: Parameters<typeof BABYLON.CreateGreasedLine>[2] = {
            width,
            materialType: BABYLON.GreasedLineMeshMaterialType.MATERIAL_TYPE_PBR,
            useColors: hasMultipleColors,
            colorMode: BABYLON.GreasedLineMeshColorMode.COLOR_MODE_SET,
            createAndAssignMaterial: true,
        };
        if (colors[0]) {
            materialOptions.color = colors[0];
        }
        if (hasMultipleColors) {
            materialOptions.colors = expandedColors;
        }
        const result = BABYLON.CreateGreasedLine(
            this.generateEntityId("lineSystem"),
            {
                points: lines,
                updatable,
            },
            materialOptions,
            this.context.scene
        );
        result.material!.alpha = visibility;
        if (visibility < 1) {
            result.material!.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        }
        return result as BABYLON.GreasedLineMesh;
    }

    private segmentizePolylinePoints(points: number[][], tolerance: number): number[][] {
        if (!points || points.length === 0) {
            return [];
        }

        const uniquePoints: number[][] = [];
        let prevPoint: number[] | null = null;

        for (const point of points) {
            if (prevPoint === null || !this.arePointsEqual(prevPoint, point, tolerance)) {
                uniquePoints.push(point);
                prevPoint = point;
            }
        }

        if (uniquePoints.length < 2) {
            return uniquePoints;
        }

        const isAlreadySegmented = this.isSegmentedPolyline(uniquePoints, tolerance);

        if (isAlreadySegmented) {
            return uniquePoints;
        }

        const segmentedPoints: number[][] = [];
        for (let i = 0; i < uniquePoints.length - 1; i++) {
            segmentedPoints.push(uniquePoints[i]!);
            segmentedPoints.push(uniquePoints[i + 1]!);
        }

        return segmentedPoints;
    }

    private isSegmentedPolyline(points: number[][], tolerance: number): boolean {
        if (points.length < 4) {
            return false;
        }

        for (let i = 1; i < points.length - 1; i += 2) {
            if (!this.arePointsEqual(points[i]!, points[i + 1]!, tolerance)) {
                return false;
            }
        }
        return true;
    }

    private arePointsEqual(p1: number[], p2: number[], tolerance: number): boolean {
        if (p1.length !== p2.length) {
            return false;
        }
        for (let i = 0; i < p1.length; i++) {
            if (Math.abs(p1[i]! - p2[i]!) > tolerance) {
                return false;
            }
        }
        return true;
    }

    localAxes(size: number, scene: BABYLON.Scene, colorXHex: string, colorYHex: string, colorZHex: string): BABYLON.Mesh {
        const pilotLocalAxisX = BABYLON.MeshBuilder.CreateLines(this.generateEntityId("pilotLocalAxisX"), {
            points: [
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
                new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
            ]
        }, scene);
        const colorX = BABYLON.Color3.FromHexString(colorXHex);
        pilotLocalAxisX.color = colorX;

        const pilotLocalAxisY = BABYLON.MeshBuilder.CreateLines(this.generateEntityId("pilotLocalAxisY"), {
            points: [
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
                new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
            ]
        }, scene);
        const colorY = BABYLON.Color3.FromHexString(colorYHex);
        pilotLocalAxisY.color = colorY;

        const pilotLocalAxisZ = BABYLON.MeshBuilder.CreateLines(this.generateEntityId("pilotLocalAxisZ"), {
            points: [
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
                new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
            ]
        }, scene);
        const colorZ = BABYLON.Color3.FromHexString(colorZHex);
        pilotLocalAxisZ.color = colorZ;

        const localOrigin = new BABYLON.Mesh(this.generateEntityId("localOrigin"), scene);
        localOrigin.isVisible = false;

        pilotLocalAxisX.parent = localOrigin;
        pilotLocalAxisY.parent = localOrigin;
        pilotLocalAxisZ.parent = localOrigin;

        return localOrigin;
    }

    drawPoint(inputs: Inputs.Point.DrawPointDto<BABYLON.Mesh>): BABYLON.Mesh {
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

    drawPoints(inputs: Inputs.Point.DrawPointsDto<BABYLON.Mesh> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum }): BABYLON.Mesh {
        const vectorPoints = inputs.points;
        const strategy = inputs.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        
        const coloursHex = this.resolveAllColors(inputs.colours, vectorPoints.length, strategy);
        
        if (inputs.pointsMesh && inputs.updatable) {
            const storedPointCount = inputs.pointsMesh.metadata?.originalPointCount;
            if (storedPointCount === vectorPoints.length && inputs.pointsMesh.metadata?.canUpdate) {
                this.updatePointsInstances(inputs.pointsMesh, vectorPoints);
                return inputs.pointsMesh;
            } else {
                inputs.pointsMesh.dispose();
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

    updatePointsInstances(mesh: BABYLON.Mesh, positions: Inputs.Base.Point3[]): void {
        const children = mesh.getChildMeshes() as BABYLON.Mesh[];
        
        const positionMap = new Map<number, Inputs.Base.Point3>();
        positions.forEach((pos, index) => {
            positionMap.set(index, pos);
        });

        children.forEach((child: BABYLON.Mesh) => {
            const pointIndices = child.metadata?.pointIndices as number[];
            const matricesData = child.metadata?.matricesData as Float32Array;
            
            if (pointIndices && matricesData) {
                pointIndices.forEach((originalIndex, instanceIndex) => {
                    const newPos = positionMap.get(originalIndex);
                    if (newPos) {
                        const matrix = BABYLON.Matrix.Translation(newPos[0], newPos[1], newPos[2]);
                        matrix.copyToArray(matricesData, instanceIndex * 16);
                    }
                });
                
                child.thinInstanceSetBuffer("matrix", matricesData, 16, false);
            }
        });
    }

    private createPointSpheresMesh(
        meshName: string, positions: Inputs.Base.Point3[], colors: string[], opacity: number, size: number, updatable: boolean): BABYLON.Mesh {

        const positionsModel = positions.map((pos, index) => {
            return {
                position: pos,
                color: colors[index],
                index
            };
        });

        const colorSet = Array.from(new Set(colors));
        const materialSet = colorSet.map((colour) => {
            const mat = this.getOrCreateUnlitMaterial(colour, opacity, () => {
                const material = new BABYLON.StandardMaterial(this.generateEntityId("pointMaterial"), this.context.scene);
                material.disableLighting = true;
                material.emissiveColor = BABYLON.Color3.FromHexString(colour);
                material.alpha = opacity;
                return material;
            });
            const filteredPositions = positionsModel.filter(s => s.color === colour);
            return { hex: colour, material: mat, positions: filteredPositions };
        });

        const pointsMesh = new BABYLON.Mesh(meshName, this.context.scene);
        
        pointsMesh.metadata = {
            originalPointCount: positions.length,
            canUpdate: updatable
        };
        
        materialSet.forEach(ms => {
            const pointCount = ms.positions.length;
            if (pointCount === 0) return;
            
            const segments = pointCount > 1000 ? 1 : 6;
            
            const sphereMesh = BABYLON.MeshBuilder.CreateSphere(
                this.generateEntityId(`pointSphere-${ms.hex}`), 
                { diameter: size, segments, updatable: false }, 
                this.context.scene
            );
            sphereMesh.material = ms.material;
            sphereMesh.parent = pointsMesh;
            
            const matricesData = new Float32Array(pointCount * 16);
            const pointIndices: number[] = [];
            
            ms.positions.forEach((pos, instanceIndex) => {
                const matrix = BABYLON.Matrix.Translation(pos.position[0], pos.position[1], pos.position[2]);
                matrix.copyToArray(matricesData, instanceIndex * 16);
                pointIndices.push(pos.index);
            });
            
            sphereMesh.thinInstanceSetBuffer("matrix", matricesData, 16, false);
            
            sphereMesh.metadata = { pointIndices, matricesData };
        });

        return pointsMesh;
    }

    async drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>): Promise<BABYLON.Mesh> {
        const res: {
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
        } = await this.jscadWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        let meshToUpdate;
        if (inputs.jscadMesh && inputs.updatable) {
            meshToUpdate = inputs.jscadMesh;
        } else {
            meshToUpdate = new BABYLON.Mesh(this.generateEntityId("jscadMesh"), this.context.scene);
        }
        let colour;
        if (inputs.mesh.color && inputs.mesh.color.length > 0) {
            colour = BABYLON.Color3.FromArray(inputs.mesh.color).toHexString();
        } else {
            colour = Array.isArray(inputs.colours) ? inputs.colours[0]! : inputs.colours;
        }

        const s = this.makeMesh({ ...inputs, colour }, meshToUpdate, res);
        inputs.jscadMesh = s;
        return s;
    }

    private makeMesh(inputs: { updatable: boolean, opacity: number, colour: string, hidden: boolean, drawFaces?: boolean, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number }, meshToUpdate: BABYLON.Mesh, res: { positions: number[]; normals: number[]; indices: number[]; transforms: []; }) {
        this.createMesh(res.positions, res.indices, res.normals, meshToUpdate, res.transforms, inputs.updatable);
        
        const zOffset = 0;
        const pbr = this.getOrCreateMaterial(inputs.colour, inputs.opacity, zOffset, () => {
            const mat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("jscadMaterial"), this.context.scene);
            mat.baseColor = BABYLON.Color3.FromHexString(inputs.colour);
            mat.metallic = 1.0;
            mat.roughness = 0.6;
            mat.alpha = inputs.opacity;
            mat.alphaMode = 1;
            mat.backFaceCulling = true;
            mat.zOffset = zOffset;
            return mat;
        });
        
        meshToUpdate.material = pbr;
        meshToUpdate.flipFaces(false);
        meshToUpdate.isPickable = false;
        if (inputs.hidden) {
            meshToUpdate.isVisible = false;
        }
        
        const drawTwoSided = (inputs.drawTwoSided === undefined || inputs.drawTwoSided === true) ? true : false;
        if (drawTwoSided) {
            const backFaceColour = inputs.backFaceColour ?? inputs.colour;
            const backFaceOpacity = inputs.backFaceOpacity ?? inputs.opacity;
            
            const isRightHanded = this.context.scene.useRightHandedSystem === true;
            
            const meshDataArray: MeshData[] = [{
                positions: res.positions,
                normals: res.normals,
                indices: res.indices
            }];
            const usesClockWiseSideOrientation = false;
            const skipWindingReversal = isRightHanded;
            const backFaceMesh = this.createBackFaceMesh(
                meshDataArray,
                backFaceColour,
                backFaceOpacity,
                zOffset,
                usesClockWiseSideOrientation,
                skipWindingReversal
            );
            backFaceMesh.parent = meshToUpdate;
            
            if (inputs.hidden) {
                backFaceMesh.isVisible = false;
            }
        }
        
        return meshToUpdate;
    }

    async drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto<BABYLON.Mesh>): Promise<BABYLON.Mesh> {
        return this.jscadWorkerManager.genericCallToWorkerPromise<{
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
            color?: number[]
        }[]>("shapesToMeshes", inputs).then((res) => {

            let localOrigin: BABYLON.Mesh;
            if (inputs.jscadMesh && inputs.updatable) {
                localOrigin = inputs.jscadMesh;
                const children = localOrigin.getChildMeshes();
                children.forEach(mesh => { mesh.dispose(); localOrigin.removeChild(mesh); });
            } else {
                localOrigin = new BABYLON.Mesh(this.generateEntityId("localOrigin"), this.context.scene);
            }

            localOrigin.isVisible = false;

            const colourIsArrayAndMatches = Array.isArray(inputs.colours) && inputs.colours.length === res.length;
            const colorsAreArrays = Array.isArray(inputs.colours);

            res.map((r, index) => {
                const meshToUpdate = new BABYLON.Mesh(this.generateEntityId("jscadMesh"), this.context.scene);
                let colour;
                if (r.color) {
                    colour = BABYLON.Color3.FromArray(r.color).toHexString();
                } else if (colourIsArrayAndMatches) {
                    colour = inputs.colours[index]!;
                } else if (colorsAreArrays) {
                    colour = inputs.colours[0]!;
                } else {
                    colour = inputs.colours as string;
                }
                const m = this.makeMesh({ ...inputs, colour }, meshToUpdate, r);
                m.parent = localOrigin;
            });
            inputs.jscadMesh = localOrigin;
            return localOrigin;
        });
    }

    async drawPath(inputs: Inputs.JSCAD.DrawPathDto<BABYLON.GreasedLineMesh>): Promise<BABYLON.GreasedLineMesh> {
        return new Promise(resolve => {

            const path = inputs.path as Inputs.JSCAD.JSCADPath2;

            const points: number[][] = path.points ?? [];
            const pointsToDraw = points.length > 0 && path.isClosed ? [...points, points[0]!] : points;

            let colour = inputs.colour;
            if (path.color) {
                colour = BABYLON.Color3.FromArray(path.color).toHexString();
            }

            resolve(this.drawPolyline(
                inputs.pathMesh,
                pointsToDraw,
                inputs.updatable,
                inputs.width,
                inputs.opacity,
                colour
            ));
        });
    }

    async drawManifoldsOrCrossSections(inputs: Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh> {
        const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto[] = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", safeWorkerOptions);
        const meshes = decomposedMesh.map(dec => this.handleDecomposedManifold(dec, inputs));
        const manifoldMeshContainer = new BABYLON.Mesh(this.generateEntityId("manifoldMeshContainer"), this.context.scene);
        meshes.filter((s): s is BABYLON.Mesh => s !== undefined).forEach(mesh => {
            mesh.parent = manifoldMeshContainer;
        });
        return manifoldMeshContainer;
    }

    async drawManifoldOrCrossSection(inputs: Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh | undefined> {
        const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", safeWorkerOptions);
        return this.handleDecomposedManifold(decomposedMesh, inputs);
    }

    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh> {
        const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
        const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", safeWorkerOptions);
        return this.handleDecomposedMesh(inputs, decomposedMesh, inputs);
    }

    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh> {
        const safeWorkerOptions = this.getSafeWorkerOptions(inputs);
        const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", safeWorkerOptions);
        const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(inputs, decomposedMesh, inputs)));
        const shapesMeshContainer = new BABYLON.Mesh(this.generateEntityId("shapesMeshContainer"), this.context.scene);
        meshesSolved.forEach(mesh => {
            mesh.parent = shapesMeshContainer;
        });
        return shapesMeshContainer;
    }

    async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>): Promise<BABYLON.Mesh> {
        const shapeMesh = new BABYLON.Mesh(this.generateEntityId("brepMesh"), this.context.scene);
        shapeMesh.isVisible = false;
        const dummy = undefined;

        if (inputs.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {

            let pbr: BABYLON.PBRMetallicRoughnessMaterial;

            if (options.faceMaterial) {
                pbr = options.faceMaterial;
            } else {
                const hex = Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour;
                const alpha = inputs.faceOpacity;
                const zOffset = inputs.drawEdges ? 2 : 0;
                
                pbr = this.getOrCreateMaterial(hex, alpha, zOffset, () => {
                    const pbmat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("brepMaterial"), this.context.scene);
                    pbmat.baseColor = BABYLON.Color3.FromHexString(hex);
                    pbmat.metallic = BABYLONJS_MATERIAL_DEFAULTS.METALLIC;
                    pbmat.roughness = BABYLONJS_MATERIAL_DEFAULTS.ROUGHNESS.OCCT;
                    pbmat.alpha = alpha;
                    pbmat.alphaMode = BABYLONJS_MATERIAL_DEFAULTS.ALPHA_MODE;
                    pbmat.backFaceCulling = true;
                    pbmat.doubleSided = false;
                    pbmat.zOffset = zOffset;
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

            let backFaceMesh: BABYLON.Mesh | undefined;
            if (inputs.drawTwoSided !== false) {
                backFaceMesh = this.createBackFaceMesh(
                    meshData,
                    inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                    inputs.backFaceOpacity ?? inputs.faceOpacity,
                    inputs.drawEdges ? 2 : 0
                );
            }

            const mesh = this.createOrUpdateSurfacesMesh(meshData, dummy, false, pbr, true, false);
            mesh.parent = shapeMesh;

            if (backFaceMesh) {
                backFaceMesh.parent = shapeMesh;
            }
        }
        if (inputs.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {
            const evs: Inputs.Base.Point3[][] = [];
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertexCoord.filter(s => s !== undefined);
                evs.push(ev);
            });
            const mesh = this.drawPolylines(
                dummy, 
                evs, 
                false, 
                inputs.edgeWidth, 
                inputs.edgeOpacity, 
                inputs.edgeColour,
                1e-7,
                false,
                Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                options.edgeArrowSize,
                options.edgeArrowAngle
            )!;
            mesh.parent = shapeMesh;
        }

        if (inputs.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                pointsMesh: dummy,
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: inputs.vertexSize,
                colours: inputs.vertexColour,
                updatable: false,
            });
            mesh.parent = shapeMesh;
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
                    return movedOnPosition;
                });
                return texts;
            });
            const textPolylines = await Promise.all(promises);
            const edgeMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 2, 1, inputs.edgeIndexColour, 1e-7, true)!;
            edgeMesh.parent = shapeMesh;
            edgeMesh.material!.zOffset = -2;
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
                    return movedOnPosition;
                });
                return texts;
            });
            const textPolylines = await Promise.all(promises);

            const faceMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 2, 1, inputs.faceIndexColour, 1e-7, true)!;
            faceMesh.parent = shapeMesh;
            if (inputs.drawEdges) {
                faceMesh.material!.zOffset = -2;
            }
        }
        return shapeMesh;
    }

    async handleDecomposedMeshIndividually(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>): Promise<BABYLON.Mesh> {
        const shapeMesh = new BABYLON.Mesh(this.generateEntityId("brepMesh"), this.context.scene);
        shapeMesh.isVisible = false;
        const dummy = undefined;

        if (inputs.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {
            const hex = Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour;
            const alpha = inputs.faceOpacity;
            const zOffset = inputs.drawEdges ? 2 : 0;

            const pbr = options.faceMaterial ?? this.getOrCreateMaterial(hex, alpha, zOffset, () => {
                const pbmat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("brepMaterial"), this.context.scene);
                pbmat.baseColor = BABYLON.Color3.FromHexString(hex);
                pbmat.metallic = BABYLONJS_MATERIAL_DEFAULTS.METALLIC;
                pbmat.roughness = BABYLONJS_MATERIAL_DEFAULTS.ROUGHNESS.OCCT;
                pbmat.alpha = alpha;
                pbmat.alphaMode = BABYLONJS_MATERIAL_DEFAULTS.ALPHA_MODE;
                pbmat.backFaceCulling = true;
                pbmat.doubleSided = false;
                pbmat.zOffset = zOffset;
                return pbmat;
            });

            decomposedMesh.faceList.forEach(face => {
                if (inputs.drawTwoSided !== false) {
                    const backFaceMesh = this.createBackFaceMesh(
                        [{
                            positions: [...face.vertexCoord],
                            normals: [...face.normalCoord],
                            indices: [...face.triIndexes],
                            uvs: face.uvs ? [...face.uvs] : undefined,
                        }],
                        inputs.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                        inputs.backFaceOpacity ?? inputs.faceOpacity,
                        zOffset
                    );
                    backFaceMesh.name = `face ${face.faceIndex} backFace`;
                    backFaceMesh.parent = shapeMesh;
                }

                const faceMesh = this.createOrUpdateSurfacesMesh([{
                    positions: [...face.vertexCoord],
                    normals: [...face.normalCoord],
                    indices: [...face.triIndexes],
                    uvs: face.uvs ? [...face.uvs] : undefined,
                }], dummy, false, pbr, true, false);
                faceMesh.name = `face ${face.faceIndex}`;
                faceMesh.parent = shapeMesh;
            });
        }

        if (inputs.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertexCoord.filter(s => s !== undefined);
                const mesh = this.drawPolylines(
                    dummy,
                    [ev],
                    false,
                    inputs.edgeWidth,
                    inputs.edgeOpacity,
                    inputs.edgeColour,
                    1e-7,
                    false,
                    Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                    options.edgeArrowSize,
                    options.edgeArrowAngle
                );
                if (mesh) {
                    (mesh as unknown as { name: string }).name = `edge ${edge.edgeIndex}`;
                    mesh.parent = shapeMesh;
                }
            });
        }

        if (inputs.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                pointsMesh: dummy,
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: inputs.vertexSize,
                colours: inputs.vertexColour,
                updatable: false,
            });
            mesh.name = "vertices";
            mesh.parent = shapeMesh;
        }

        return shapeMesh;
    }

    private handleDecomposedManifold(
        decomposedManifold: Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][], options: Inputs.Draw.DrawManifoldOrCrossSectionOptions): BABYLON.Mesh | undefined {
        if ((decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto).vertProperties) {
            const decomposedMesh = decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto;
            if (decomposedMesh.triVerts.length > 0) {
                const mesh = new BABYLON.Mesh(this.generateEntityId("manifoldMesh"), this.context.scene);

                const vertexData = new BABYLON.VertexData();

                vertexData.indices = decomposedMesh.triVerts.length > 65535 ? new Uint32Array(decomposedMesh.triVerts) : new Uint16Array(decomposedMesh.triVerts);

                for (let i = 0; i < decomposedMesh.triVerts.length; i += 3) {
                    vertexData.indices[i] = decomposedMesh.triVerts[i + 2]!;
                    vertexData.indices[i + 1] = decomposedMesh.triVerts[i + 1]!;
                    vertexData.indices[i + 2] = decomposedMesh.triVerts[i]!;
                }

                const vertexCount = decomposedMesh.vertProperties.length / decomposedMesh.numProp;

                let offset = 0;
                for (let componentIndex = 0; componentIndex < 1; componentIndex++) {
                    const component = { stride: 3, kind: "position" };

                    const data = new Float32Array(vertexCount * component.stride);
                    for (let i = 0; i < vertexCount; i++) {
                        for (let strideIndex = 0; strideIndex < component.stride; strideIndex++) {
                            data[i * component.stride + strideIndex] = decomposedMesh.vertProperties[i * decomposedMesh.numProp + offset + strideIndex]!;
                        }
                    }
                    vertexData.set(data, component.kind);
                    offset += component.stride;
                }
                if (options.computeNormals) {
                    const normals: number[] = [];
                    BABYLON.VertexData.ComputeNormals(vertexData.positions, vertexData.indices, normals);
                    vertexData.normals = normals;
                }
                vertexData.applyToMesh(mesh, false);

                if (options.faceMaterial === undefined) {
                    const material = this.getOrCreateMaterial(options.faceColour, options.faceOpacity, 0, () => {
                        const mat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("manifoldMaterial"), this.context.scene);
                        mat.baseColor = BABYLON.Color3.FromHexString(options.faceColour);
                        mat.metallic = BABYLONJS_MATERIAL_DEFAULTS.METALLIC;
                        mat.roughness = BABYLONJS_MATERIAL_DEFAULTS.ROUGHNESS.MANIFOLD;
                        mat.alpha = options.faceOpacity;
                        mat.alphaMode = BABYLONJS_MATERIAL_DEFAULTS.ALPHA_MODE;
                        mat.backFaceCulling = true;
                        mat.doubleSided = false;
                        return mat;
                    });
                    mesh.material = material;
                } else {
                    mesh.material = options.faceMaterial;
                }

                if (options.drawTwoSided !== false) {
                    const positions = vertexData.positions as number[];
                    const indices = Array.from(decomposedMesh.triVerts);
                    const normals = (vertexData.normals || []) as number[];

                    const meshDataArray: MeshData[] = [{
                        positions,
                        indices,
                        normals
                    }];

                    const usesClockWiseSideOrientation = true;
                    const backFaceMesh = this.createBackFaceMesh(
                        meshDataArray,
                        options.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                        options.backFaceOpacity ?? options.faceOpacity,
                        0,
                        usesClockWiseSideOrientation
                    );
                    backFaceMesh.parent = mesh;
                }

                return mesh;
            } else {
                return undefined;
            }
        } else {
            if ((decomposedManifold as Inputs.Base.Vector2[][]).length > 0) {
                const mesh = new BABYLON.Mesh(this.generateEntityId("manifoldCrossSection"), this.context.scene);
                const decompsoedPolygons = decomposedManifold as Inputs.Base.Vector2[][];
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
                polylineMesh!.parent = mesh;
                return mesh;
            } else {
                return undefined;
            }
        }
    }

    private createLineSystemMesh(updatable: boolean, lines: BABYLON.Vector3[][], colors: BABYLON.Color4[][]): BABYLON.LinesMesh {
        return BABYLON.MeshBuilder.CreateLineSystem(this.generateEntityId("lines"),
            {
                lines,
                colors,
                useVertexAlpha: true,
                updatable
            }, this.context.scene);
    }


    private createMesh(
        positions: number[], indices: number[], normals: number[], jscadMesh: BABYLON.Mesh, transforms: number[], updatable: boolean
    ): void {
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        BABYLON.VertexData.ComputeNormals(positions, indices, normals, { useRightHandedSystem: true });
        vertexData.normals = normals;

        vertexData.applyToMesh(jscadMesh, updatable);
        jscadMesh.setPreTransformMatrix(BABYLON.Matrix.FromArray(transforms));
    }

    private parseFaces(
        faceIndices: any,
        meshData: any,
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; },
        countIndices: number): number {
        faceIndices.forEach((x: number) => {
            const vn = meshData.normals[x];
            meshDataConverted.normals.push(vn[0], vn[1], vn[2]);
            const pt = meshData.points[x];
            meshDataConverted.positions.push(pt[0], pt[1], pt[2]);
            meshDataConverted.indices.push(countIndices);
            countIndices++;
        });
        return countIndices;
    }

    private getSafeWorkerOptions<T extends { faceMaterial?: BABYLON.Material | undefined }>(inputs: T): Omit<T, "faceMaterial"> {
         
        const { faceMaterial, ...safeOptions } = inputs;
        return safeOptions;
    }
}
