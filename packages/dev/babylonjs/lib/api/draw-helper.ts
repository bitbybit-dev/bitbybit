import * as BABYLON from "@babylonjs/core";
import type { Context } from "./context";
import * as Inputs from "./inputs";
import { DrawHelperCore, defaultEdgeColor, DesignMeshCache, designOptionsKeyOf, designPartKeyOf, edgeColorsOf, lookGroupsOf, lookGroupsOfColors, lookMeshesOf, designDrawPlanOf, designMeshesOf, meshesByKeyOf } from "@bitbybit-dev/core";
import type { FaceLook, FaceRange, LookMesh, PartPlacement, MeshData } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import type { Vector } from "@bitbybit-dev/base";
import { resolveDto } from "@bitbybit-dev/base";
import type { JSCADWorkerManager, JSCADText } from "@bitbybit-dev/jscad-worker";
import type { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import type { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { CACHE_CONFIG, DEFAULT_COLORS, BABYLONJS_MATERIAL_DEFAULTS } from "./constants";
import type * as Resolved from "./resolved-inputs";

interface DesignPartDrawn {
    part: string;
    key: string;
    matrices: Float32Array;
    faces: BABYLON.Mesh | undefined;
    edges: BABYLON.GreasedLineMesh | undefined;
}

interface DesignDrawState {
    placements: Map<string, PartPlacement[]>;
    meshes: Map<string, Inputs.OCCT.DecomposedMeshDto>;
    signature: string;
    looks: string;
    precision: number;
    parts: DesignPartDrawn[];
}

interface LookRange {
    vertexStart: number;
    vertexCount: number;
    indexStart: number;
    indexCount: number;
}

export class DrawHelper extends DrawHelperCore {

    private readonly materialCache = new Map<string, BABYLON.PBRMetallicRoughnessMaterial>();

    private readonly designStates = new WeakMap<BABYLON.Mesh, DesignDrawState>();

    private readonly designMeshes = new DesignMeshCache<Inputs.OCCT.DecomposedMeshDto>();

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
        this.designMeshes.clear();
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

    private generateEntityId(type: string, parentId?: string): string {
        const id = `${this.instanceId}-${type}-${++this.entityIdCounter}`;
        return parentId ? `${parentId}/${id}` : id;
    }

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
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] | undefined; colors?: number[] | undefined }[],
        mesh: BABYLON.Mesh | undefined, updatable: boolean, material: BABYLON.PBRMetallicRoughnessMaterial, addToScene: boolean, hidden: boolean
    ): BABYLON.Mesh {
        const colored = meshDataConverted.every(meshData => meshData.colors !== undefined && meshData.colors.length === meshData.positions.length / 3 * 4);
        const createMesh = () => {
            const first = meshDataConverted[meshDataConverted.length - 1]!;
            const rest = meshDataConverted.slice(0, -1);
            const vd = new BABYLON.VertexData();
            vd.positions = first.positions;
            vd.indices = first.indices;
            vd.normals = first.normals;
            if (first.uvs) {
                vd.uvs = first.uvs;
            }
            if (colored) {
                vd.colors = first.colors!;
            }

            const v: BABYLON.VertexData[] = [];
            rest.forEach(meshData => {
                const vertexData = new BABYLON.VertexData();
                vertexData.positions = meshData.positions;
                vertexData.indices = meshData.indices;
                vertexData.normals = meshData.normals;
                if (meshData.uvs) {
                    vertexData.uvs = meshData.uvs;
                }
                if (colored) {
                    vertexData.colors = meshData.colors!;
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
        const resolved = resolveDto(Inputs.Line.DrawLinesDto, inputs) as Resolved.Line.DrawLinesDto<BABYLON.LinesMesh>;
        const lines: BABYLON.Vector3[][] = [];
        const colors: BABYLON.Color4[][] = [];

        resolved.lines.forEach((line, index) => {
            lines.push([
                new BABYLON.Vector3(line.start[0], line.start[1], line.start[2]),
                new BABYLON.Vector3(line.end[0], line.end[1], line.end[2])]
            );
            let col;
            if (Array.isArray(resolved.colours) && resolved.colours.length === resolved.lines.length) {
                col = BABYLON.Color3.FromHexString(resolved.colours[index]!);
            } else if (Array.isArray(resolved.colours)) {
                col = BABYLON.Color3.FromHexString(resolved.colours[0]!);
            } else {
                col = BABYLON.Color3.FromHexString(resolved.colours);
            }
            colors.push([
                new BABYLON.Color4(col.r, col.g, col.b, resolved.opacity),
                new BABYLON.Color4(col.r, col.g, col.b, resolved.opacity)
            ]);
        });

        if (resolved.linesMesh && resolved.updatable) {
            if (resolved.linesMesh.getTotalVertices() / 2 === lines.length) {
                resolved.linesMesh = BABYLON.MeshBuilder.CreateLineSystem(resolved.linesMesh.name,
                    {
                        lines,
                        instance: resolved.linesMesh,
                        colors, useVertexAlpha: true,
                        updatable: resolved.updatable
                    }, null);
            } else {
                resolved.linesMesh.dispose();
                resolved.linesMesh = this.createLineSystemMesh(resolved.updatable, lines, colors);
            }
        } else {
            resolved.linesMesh = this.createLineSystemMesh(resolved.updatable, lines, colors);
        }

        this.edgesRendering(resolved.linesMesh, resolved.size, resolved.opacity, resolved.colours);
        return resolved.linesMesh;
    }

    drawPolylineClose(inputs: Inputs.Polyline.DrawPolylineDto<BABYLON.GreasedLineMesh> & { arrowSize?: number | undefined, arrowAngle?: number | undefined }): BABYLON.GreasedLineMesh {
        const resolved = resolveDto(Inputs.Polyline.DrawPolylineDto, inputs) as Resolved.Polyline.DrawPolylineDto<BABYLON.GreasedLineMesh> & { arrowSize?: number | undefined, arrowAngle?: number | undefined };
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

    drawCurve(inputs: Inputs.Verb.DrawCurveDto<BABYLON.GreasedLineMesh>): BABYLON.GreasedLineMesh {
        const resolved = resolveDto(Inputs.Verb.DrawCurveDto, inputs) as Resolved.Verb.DrawCurveDto<BABYLON.GreasedLineMesh>;
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

    drawSurface(inputs: Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.Verb.DrawSurfaceDto, inputs) as Resolved.Verb.DrawSurfaceDto<BABYLON.Mesh>;
        const meshData = resolved.surface.tessellate();

        const meshDataConverted: MeshData = {
            positions: [],
            indices: [],
            normals: [],
        };

        let countIndices = 0;
        meshData.faces.forEach((faceIndices: number[]) => {
            countIndices = this.parseFaces(faceIndices, meshData, meshDataConverted, countIndices);
        });

        const color = (Array.isArray(resolved.colours) ? resolved.colours[0] : resolved.colours) ?? "#444444";
        const pbr = this.getOrCreateMaterial(color, resolved.opacity, 0, () => {
            const mat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("surfaceMaterial"), this.context.scene);
            mat.baseColor = BABYLON.Color3.FromHexString(color);
            mat.metallic = BABYLONJS_MATERIAL_DEFAULTS.METALLIC;
            mat.roughness = BABYLONJS_MATERIAL_DEFAULTS.ROUGHNESS.SURFACE;
            mat.alpha = resolved.opacity;
            mat.alphaMode = BABYLONJS_MATERIAL_DEFAULTS.ALPHA_MODE;
            mat.backFaceCulling = true;
            mat.doubleSided = false;
            return mat;
        });

        let backFaceMesh: BABYLON.Mesh | undefined;
        if (resolved.drawTwoSided !== false) {
            backFaceMesh = this.createBackFaceMesh(
                [meshDataConverted],
                resolved.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                resolved.backFaceOpacity,
                0
            );
        }

        const surfaceMesh = this.createOrUpdateSurfacesMesh(
            [meshDataConverted],
            resolved.surfaceMesh,
            resolved.updatable,
            pbr,
            true,
            resolved.hidden,
        );

        if (backFaceMesh) {
            backFaceMesh.parent = surfaceMesh;
        }

        return surfaceMesh;
    }

    drawSurfaces(inputs: Inputs.Verb.DrawSurfacesDto<BABYLON.Mesh>): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.Verb.DrawSurfacesDto, inputs) as Resolved.Verb.DrawSurfacesDto<BABYLON.Mesh>;
        const tessellatedSurfaces: { points: number[][]; normals: number[][]; faces: number[][] }[] = [];
        resolved.surfaces.forEach(srf => {
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

        const color = (Array.isArray(resolved.colours) ? resolved.colours[0] : resolved.colours) ?? "#444444";
        const pbr = this.getOrCreateMaterial(color, resolved.opacity, 0, () => {
            const mat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("surfacesMaterial"), this.context.scene);
            mat.baseColor = BABYLON.Color3.FromHexString(color);
            mat.metallic = BABYLONJS_MATERIAL_DEFAULTS.METALLIC;
            mat.roughness = BABYLONJS_MATERIAL_DEFAULTS.ROUGHNESS.SURFACE;
            mat.alpha = resolved.opacity;
            mat.alphaMode = BABYLONJS_MATERIAL_DEFAULTS.ALPHA_MODE;
            mat.backFaceCulling = true;
            mat.doubleSided = false;
            return mat;
        });

        let backFaceMesh: BABYLON.Mesh | undefined;
        if (resolved.drawTwoSided !== false) {
            backFaceMesh = this.createBackFaceMesh(
                [meshDataConverted],
                resolved.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                resolved.backFaceOpacity,
                0
            );
        }

        const surfacesMesh = this.createOrUpdateSurfacesMesh(
            [meshDataConverted],
            resolved.surfacesMesh,
            resolved.updatable,
            pbr,
            true,
            resolved.hidden
        );

        if (backFaceMesh) {
            backFaceMesh.parent = surfacesMesh;
        }

        return surfacesMesh;
    }

    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto<BABYLON.Mesh> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined }): BABYLON.Mesh {
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
        const resolved = resolveDto(Inputs.Verb.DrawCurvesDto, inputs) as Resolved.Verb.DrawCurvesDto<BABYLON.GreasedLineMesh>;
        const points = resolved.curves.map(s => s.tessellate());
        return this.drawPolylines(
            resolved.curvesMesh,
            points,
            resolved.updatable,
            resolved.size,
            resolved.opacity,
            resolved.colours
        )!;
    }

    drawPolyline(mesh: BABYLON.GreasedLineMesh | undefined,
        pointsToDraw: number[][],
        updatable: boolean, size: number, opacity: number, colours: string | string[],
        arrowSize = 0, arrowAngle = 30): BABYLON.GreasedLineMesh {
        return this.drawPolylines(mesh, [pointsToDraw], updatable, size, opacity, colours, 1e-7, true,
            Inputs.Base.colorMapStrategyEnum.lastColorRemainder, arrowSize, arrowAngle)!;
    }

    drawPolylinesWithColours(inputs: Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined, arrowSize?: number | undefined, arrowAngle?: number | undefined }) {
        const resolved = resolveDto(Inputs.Polyline.DrawPolylinesDto, inputs) as Resolved.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined, arrowSize?: number | undefined, arrowAngle?: number | undefined };
        const strategy = resolved.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        const points = resolved.polylines.map(s => s.isClosed ? [...s.points, s.points[0]!] : s.points);
        const own = resolved.polylines.map(s => {
            if (!s.color) {
                return undefined;
            }
            return Array.isArray(s.color) ? BABYLON.Color3.FromArray(s.color).toHexString() : s.color;
        });
        const colours = own.some(c => c !== undefined)
            ? this.resolveAllColors(resolved.colours, resolved.polylines.length, strategy).map((shared, index) => own[index] ?? shared)
            : resolved.colours;

        return this.drawPolylines(
            resolved.polylinesMesh,
            points,
            resolved.updatable,
            resolved.size,
            resolved.opacity,
            colours,
            1e-7,
            true,
            strategy,
            resolved.arrowSize,
            resolved.arrowAngle
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
                if (this.canRestyleGreasedPolylines(mesh, allLinesForRender, babylonColors)) {
                    mesh.setPoints(allLinesForRender);
                    this.restyleGreasedPolylines(mesh, allLinesForRender, width, babylonColors, opacity);
                    return mesh;
                }
                mesh.dispose();
            }
            mesh = this.createGreasedPolylines(updatable, allLinesForRender, width, babylonColors, opacity);
            mesh.metadata = { linesForRenderLengths: allLinesForRender.map(l => l.length) };
            return mesh;
        } else {
            return undefined;
        }
    }

    private canRestyleGreasedPolylines(mesh: BABYLON.GreasedLineMesh, lines: number[][], colors: BABYLON.Color3[]): boolean {
        const previous: number[] | undefined = mesh.metadata?.linesForRenderLengths;
        return previous !== undefined
            && previous.length === lines.length
            && previous.every((length, i) => length === lines[i]!.length)
            && mesh.greasedLineMaterial !== undefined
            && mesh.greasedLineMaterial.useColors === this.hasMultipleGreasedColors(lines, colors);
    }

    private restyleGreasedPolylines(mesh: BABYLON.GreasedLineMesh, lines: number[][], width: number, colors: BABYLON.Color3[], visibility: number): void {
        const material = mesh.greasedLineMaterial!;
        material.width = width;
        material.setColor(colors[0]!);
        if (material.useColors) {
            material.setColors(this.expandedGreasedColors(lines, colors), false);
        }
        mesh.material!.alpha = visibility;
        mesh.material!.transparencyMode = visibility < 1 ? BABYLON.Material.MATERIAL_ALPHABLEND : null;
    }

    private hasMultipleGreasedColors(lines: number[][], colors: BABYLON.Color3[]): boolean {
        return colors.length > 1 || (colors.length === 1 && lines.length > 1);
    }

    private expandedGreasedColors(lines: number[][], colors: BABYLON.Color3[]): BABYLON.Color3[] {
        const expandedColors: BABYLON.Color3[] = [];
        lines.forEach((line, lineIndex) => {
            const lineColor = colors[lineIndex] || colors[0]!;
            const numPoints = line.length / 3;
            for (let i = 0; i < numPoints; i++) {
                expandedColors.push(lineColor);
            }
        });
        return expandedColors;
    }

    createGreasedPolylines(updatable: boolean, lines: number[][], width: number, colors: BABYLON.Color3[], visibility: number): BABYLON.GreasedLineMesh {
        const expandedColors = this.expandedGreasedColors(lines, colors);
        const hasMultipleColors = this.hasMultipleGreasedColors(lines, colors);
        
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
        const resolved = resolveDto(Inputs.Point.DrawPointDto, inputs) as Resolved.Point.DrawPointDto<BABYLON.Mesh>;
        const vectorPoints = [resolved.point];

        const colorsHex: string[] = Array.isArray(resolved.colours) ? resolved.colours : [resolved.colours];
        if (resolved.pointMesh && resolved.updatable) {
            this.updatePointsInstances(resolved.pointMesh, vectorPoints);
        } else {
            resolved.pointMesh = this.createPointSpheresMesh(
                this.generateEntityId("pointMesh"), vectorPoints, colorsHex, resolved.opacity, resolved.size, resolved.updatable
            );
        }
        return resolved.pointMesh;
    }

    drawPoints(inputs: Inputs.Point.DrawPointsDto<BABYLON.Mesh> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined }): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.Point.DrawPointsDto, inputs) as Resolved.Point.DrawPointsDto<BABYLON.Mesh> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum | undefined };
        const vectorPoints = resolved.points;
        const strategy = resolved.colorMapStrategy || Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
        
        const coloursHex = this.resolveAllColors(resolved.colours, vectorPoints.length, strategy);
        
        if (resolved.pointsMesh && resolved.updatable) {
            const storedPointCount = resolved.pointsMesh.metadata?.originalPointCount;
            if (storedPointCount === vectorPoints.length && resolved.pointsMesh.metadata?.canUpdate) {
                this.updatePointsInstances(resolved.pointsMesh, vectorPoints);
                return resolved.pointsMesh;
            } else {
                resolved.pointsMesh.dispose();
                resolved.pointsMesh = this.createPointSpheresMesh(
                    this.generateEntityId("pointsMesh"), vectorPoints, coloursHex, resolved.opacity, resolved.size, resolved.updatable
                );
            }
        } else {
            resolved.pointsMesh = this.createPointSpheresMesh(
                this.generateEntityId("pointsMesh"), vectorPoints, coloursHex, resolved.opacity, resolved.size, resolved.updatable
            );
        }
        return resolved.pointsMesh;
    }

    updatePointsInstances(mesh: BABYLON.Mesh, positions: Inputs.Base.Point3[]): void {
        const children = mesh.getChildMeshes<BABYLON.Mesh>();
        
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
            if (pointCount === 0) {
                return;
            }
            
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
        const resolved = resolveDto(Inputs.JSCAD.DrawSolidMeshDto, inputs) as Resolved.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>;
        const res: {
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
        } = await this.jscadWorkerManager.genericCallToWorkerPromise("shapeToMesh", resolved);
        let meshToUpdate;
        if (resolved.jscadMesh && resolved.updatable) {
            meshToUpdate = resolved.jscadMesh;
        } else {
            meshToUpdate = new BABYLON.Mesh(this.generateEntityId("jscadMesh"), this.context.scene);
        }
        let colour;
        if (resolved.mesh.color && resolved.mesh.color.length > 0) {
            colour = BABYLON.Color3.FromArray(resolved.mesh.color).toHexString();
        } else {
            colour = Array.isArray(resolved.colours) ? resolved.colours[0]! : resolved.colours;
        }

        const s = this.makeMesh({ ...resolved, colour }, meshToUpdate, res);
        resolved.jscadMesh = s;
        return s;
    }

    private makeMesh(inputs: { updatable: boolean, opacity: number, colour: string, hidden: boolean, drawTwoSided: boolean, backFaceColour: string, backFaceOpacity: number }, meshToUpdate: BABYLON.Mesh, res: { positions: number[]; normals: number[]; indices: number[]; transforms: []; }) {
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
        
        if (inputs.drawTwoSided) {
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
                inputs.backFaceColour,
                inputs.backFaceOpacity,
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
        const resolved = resolveDto(Inputs.JSCAD.DrawSolidMeshesDto, inputs) as Resolved.JSCAD.DrawSolidMeshesDto<BABYLON.Mesh>;
        return this.jscadWorkerManager.genericCallToWorkerPromise<{
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
            color?: number[]
        }[]>("shapesToMeshes", resolved).then((res) => {

            let localOrigin: BABYLON.Mesh;
            if (resolved.jscadMesh && resolved.updatable) {
                localOrigin = resolved.jscadMesh;
                const children = localOrigin.getChildMeshes();
                children.forEach(mesh => { mesh.dispose(); localOrigin.removeChild(mesh); });
            } else {
                localOrigin = new BABYLON.Mesh(this.generateEntityId("localOrigin"), this.context.scene);
            }

            localOrigin.isVisible = false;

            const colourIsArrayAndMatches = Array.isArray(resolved.colours) && resolved.colours.length === res.length;
            const colorsAreArrays = Array.isArray(resolved.colours);

            res.map((r, index) => {
                const meshToUpdate = new BABYLON.Mesh(this.generateEntityId("jscadMesh"), this.context.scene);
                let colour;
                if (r.color) {
                    colour = BABYLON.Color3.FromArray(r.color).toHexString();
                } else if (colourIsArrayAndMatches) {
                    colour = resolved.colours[index]!;
                } else if (colorsAreArrays) {
                    colour = resolved.colours[0]!;
                } else {
                    colour = resolved.colours as string;
                }
                const m = this.makeMesh({ ...resolved, colour }, meshToUpdate, r);
                m.parent = localOrigin;
            });
            resolved.jscadMesh = localOrigin;
            return localOrigin;
        });
    }

    async drawPath(inputs: Inputs.JSCAD.DrawPathDto<BABYLON.GreasedLineMesh>): Promise<BABYLON.GreasedLineMesh> {
        const resolved = resolveDto(Inputs.JSCAD.DrawPathDto, inputs) as Resolved.JSCAD.DrawPathDto<BABYLON.GreasedLineMesh>;
        return new Promise(resolve => {

            const path = resolved.path as Inputs.JSCAD.JSCADPath2;

            const points: number[][] = path.points ?? [];
            const pointsToDraw = points.length > 0 && path.isClosed ? [...points, points[0]!] : points;

            let colour = resolved.colour;
            if (path.color) {
                colour = BABYLON.Color3.FromArray(path.color).toHexString();
            }

            resolve(this.drawPolyline(
                resolved.pathMesh,
                pointsToDraw,
                resolved.updatable,
                resolved.width,
                resolved.opacity,
                colour
            ));
        });
    }

    async drawManifoldsOrCrossSections(inputs: Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh> {
        const resolved = resolveDto(Inputs.Manifold.DrawManifoldsOrCrossSectionsDto, inputs) as Resolved.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>;
        const safeWorkerOptions = this.getSafeWorkerOptions(resolved);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto[] = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", safeWorkerOptions);
        const meshes = decomposedMesh.map(dec => this.handleDecomposedManifold(dec, resolved));
        const manifoldMeshContainer = new BABYLON.Mesh(this.generateEntityId("manifoldMeshContainer"), this.context.scene);
        meshes.filter((s): s is BABYLON.Mesh => s !== undefined).forEach(mesh => {
            mesh.parent = manifoldMeshContainer;
        });
        return manifoldMeshContainer;
    }

    async drawManifoldOrCrossSection(inputs: Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh | undefined> {
        const resolved = resolveDto(Inputs.Manifold.DrawManifoldOrCrossSectionDto, inputs) as Resolved.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>;
        const safeWorkerOptions = this.getSafeWorkerOptions(resolved);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", safeWorkerOptions);
        return this.handleDecomposedManifold(decomposedMesh, resolved);
    }

    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh> {
        const resolved = resolveDto(Inputs.OCCT.DrawShapeDto, inputs) as Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>;
        const safeWorkerOptions = this.getMeshingOptions(resolved);
        const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", safeWorkerOptions);
        return this.handleDecomposedMesh(resolved, decomposedMesh, resolved);
    }

    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh> {
        const resolved = resolveDto(Inputs.OCCT.DrawShapesDto, inputs) as Resolved.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>;
        const safeWorkerOptions = this.getMeshingOptions(resolved);
        const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", safeWorkerOptions);
        const pooled = this.withSurfaceAnalysisRange(resolved, meshes);
        const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(pooled, decomposedMesh, pooled)));
        const shapesMeshContainer = new BABYLON.Mesh(this.generateEntityId("shapesMeshContainer"), this.context.scene);
        meshesSolved.forEach(mesh => {
            mesh.parent = shapesMeshContainer;
        });
        return shapesMeshContainer;
    }

    /**
     * Draws a kernel shape in its appearance: one mesh whose faces take their looks, a sub-mesh and a
     * material each, its back faces when asked, and its edges once, each in its color.
     * @param entity - The shape with its appearance
     * @param options - The drawing options; the face color is the color of faces no look colors
     * @returns The mesh holding the shape, added to the scene
     */
    async drawShapeWithAppearance(entity: Inputs.Draw.ShapeWithAppearance, options: Inputs.Draw.DrawOcctShapeOptions): Promise<BABYLON.Mesh> {
        const resolved = resolveDto(Inputs.Draw.DrawOcctShapeOptions, options) as Resolved.Draw.DrawOcctShapeOptions;
        const [mesh] = await this.meshShapesForLooks([entity.shape], resolved);
        return this.lookedShapeMesh(mesh!, entity.appearance, resolved);
    }

    /**
     * Draws kernel shapes in their appearance, all meshed in one call to the worker, each as
     * `drawShapeWithAppearance` draws one.
     * @param entities - The shapes with their appearance
     * @param options - The drawing options; the face color is the color of faces no look colors
     * @returns A mesh holding one mesh per shape, in order, added to the scene
     */
    async drawShapesWithAppearance(entities: readonly Inputs.Draw.ShapeWithAppearance[], options: Inputs.Draw.DrawOcctShapeOptions): Promise<BABYLON.Mesh> {
        const resolved = resolveDto(Inputs.Draw.DrawOcctShapeOptions, options) as Resolved.Draw.DrawOcctShapeOptions;
        const meshes = await this.meshShapesForLooks(entities.map(entity => entity.shape), resolved);
        const container = new BABYLON.Mesh(this.generateEntityId("shapesWithAppearanceContainer"), this.context.scene);
        entities.forEach((entity, index) => {
            this.lookedShapeMesh(meshes[index]!, entity.appearance, resolved).parent = container;
        });
        return container;
    }

    /**
     * Draws what `occt.design.build` returns. Every part is meshed once, in one call to the worker,
     * into one mesh with a sub-mesh per look and one line for its edges, and every placement is a
     * thin instance of both. Given the mesh an earlier build drew, it redraws in place: when the same
     * parts sit at the same paths, it only moves them, and otherwise it keeps what it drew for every
     * part whose shape and appearance are unchanged under the same options, places it again, and
     * meshes and draws only the rest.
     * @param build - The build to draw
     * @param drawOptions - The drawing options; the face color is the color of faces no look colors
     * @param previous - The mesh an earlier build drew, to redraw in place
     * @returns The mesh holding the build: `previous` when given, else a new mesh added to the scene
     */
    async drawDesignBuild(build: Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>, drawOptions: Inputs.Draw.DrawOcctShapeOptions, previous?: BABYLON.Mesh): Promise<BABYLON.Mesh> {
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

    private lookedShapeMesh(mesh: Inputs.OCCT.DecomposedMeshDto, appearance: Inputs.Draw.ShapeWithAppearance["appearance"], options: Resolved.Draw.DrawOcctShapeOptions): BABYLON.Mesh {
        const shapeMesh = new BABYLON.Mesh(this.generateEntityId("brepMeshWithAppearance"), this.context.scene);
        shapeMesh.isVisible = false;
        const zOffset = options.drawEdges ? 2 : 0;
        if (options.drawFaces && mesh.faceList.length > 0) {
            const looks = lookGroupsOf(appearance, mesh.faceList.map(face => face.faceIndex), options.faceColour);
            this.lookedMesh(lookMeshesOf(mesh, looks), options.faceOpacity, zOffset).parent = shapeMesh;
            if (options.drawTwoSided) {
                const meshData: MeshData[] = mesh.faceList.map(face => ({ positions: face.vertexCoord, normals: face.normalCoord, indices: face.triIndexes }));
                this.createBackFaceMesh(meshData, options.backFaceColour || DEFAULT_COLORS.BACK_FACE, options.backFaceOpacity, zOffset).parent = shapeMesh;
            }
        }
        if (options.drawEdges && mesh.edgeList.length > 0) {
            this.partEdges(mesh, appearance, options).parent = shapeMesh;
        }
        return shapeMesh;
    }

    private partEdges(mesh: Inputs.OCCT.DecomposedMeshDto, appearance: Inputs.Draw.ShapeWithAppearance["appearance"], options: Resolved.Draw.DrawOcctShapeOptions): BABYLON.GreasedLineMesh {
        const fallback = defaultEdgeColor(appearance?.color ?? options.faceColour, options.edgeColour, options.edgeContrast);
        const edgeIndexes = mesh.edgeList.map(edge => edge.edgeIndex);
        const colors = edgeColorsOf(appearance, edgeIndexes, fallback);
        const line = this.drawPolylines(undefined, mesh.edgeList.map(edge => edge.vertexCoord.filter(point => point !== undefined)), false, options.edgeWidth, options.edgeOpacity, colors)!;
        line.metadata = { ...line.metadata, edgeIndexes };
        return line;
    }

    private lookedMesh(lookMeshes: readonly LookMesh[], faceOpacity: number, zOffset: number): BABYLON.Mesh {
        const drawn = lookMeshes.filter(look => look.indices.length > 0);
        let vertexCount = 0;
        let indexCount = 0;
        for (const look of drawn) {
            vertexCount += look.positions.length / 3;
            indexCount += look.indices.length;
        }
        const positions = new Float32Array(vertexCount * 3);
        const normals = new Float32Array(vertexCount * 3);
        const indices = new Uint32Array(indexCount);
        const ranges: LookRange[] = [];
        const faceRanges: FaceRange[] = [];
        let vertexOffset = 0;
        let indexOffset = 0;
        for (const look of drawn) {
            positions.set(look.positions, vertexOffset * 3);
            normals.set(look.normals, vertexOffset * 3);
            for (let i = 0; i < look.indices.length; i += 3) {
                indices[indexOffset + i] = look.indices[i]! + vertexOffset;
                indices[indexOffset + i + 1] = look.indices[i + 2]! + vertexOffset;
                indices[indexOffset + i + 2] = look.indices[i + 1]! + vertexOffset;
            }
            ranges.push({ vertexStart: vertexOffset, vertexCount: look.positions.length / 3, indexStart: indexOffset, indexCount: look.indices.length });
            for (const range of look.faceRanges) {
                faceRanges.push({ face: range.face, start: range.start + indexOffset, count: range.count });
            }
            vertexOffset += look.positions.length / 3;
            indexOffset += look.indices.length;
        }
        const mesh = new BABYLON.Mesh(this.generateEntityId("lookedSurface"), this.context.scene);
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.normals = normals;
        vertexData.indices = indices;
        vertexData.applyToMesh(mesh, false);
        const materials = drawn.map(look => this.lookMaterial(look.group.look, faceOpacity, zOffset));
        if (materials.length === 1) {
            mesh.material = materials[0]!;
        } else if (materials.length > 1) {
            const multi = new BABYLON.MultiMaterial(this.generateEntityId("lookMaterials"), this.context.scene);
            multi.subMaterials = materials;
            mesh.material = multi;
            mesh.subMeshes = [];
            ranges.forEach((range, materialIndex) => new BABYLON.SubMesh(materialIndex, range.vertexStart, range.vertexCount, range.indexStart, range.indexCount, mesh));
        }
        mesh.isPickable = false;
        mesh.metadata = { faceRanges };
        return mesh;
    }

    private lookMaterial(look: FaceLook, faceOpacity: number, zOffset: number): BABYLON.PBRMetallicRoughnessMaterial {
        const opacity = look.opacity * faceOpacity;
        return this.getOrCreateMaterial(`look:${look.color}:${look.metallic ?? "-"}:${look.roughness ?? "-"}:${look.emissive ?? "-"}:${look.emissiveStrength ?? "-"}`, opacity, zOffset, () => {
            const material = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("lookMaterial"), this.context.scene);
            material.baseColor = BABYLON.Color3.FromHexString(look.color);
            material.metallic = look.metallic ?? BABYLONJS_MATERIAL_DEFAULTS.METALLIC;
            material.roughness = look.roughness ?? BABYLONJS_MATERIAL_DEFAULTS.ROUGHNESS.OCCT;
            if (look.emissive !== undefined) {
                material.emissiveColor = BABYLON.Color3.FromHexString(look.emissive).scale(look.emissiveStrength ?? 1);
            }
            material.alpha = opacity;
            material.alphaMode = BABYLONJS_MATERIAL_DEFAULTS.ALPHA_MODE;
            material.backFaceCulling = true;
            material.doubleSided = false;
            material.zOffset = zOffset;
            return material;
        });
    }

    private newDesignRoot(): BABYLON.Mesh {
        const root = new BABYLON.Mesh(this.generateEntityId("designBuild"), this.context.scene);
        root.isVisible = false;
        return root;
    }

    private fillDesign(target: BABYLON.Mesh, parts: ReadonlyMap<string, Inputs.Draw.ShapeWithAppearance & { shapeHash?: string }>, placements: Map<string, PartPlacement[]>, placed: readonly string[], meshes: ReadonlyMap<string, Inputs.OCCT.DecomposedMeshDto>, options: Resolved.Draw.DrawOcctShapeOptions, kept: ReadonlyMap<string, DesignPartDrawn>): DesignPartDrawn[] {
        const zOffset = options.drawEdges ? 2 : 0;
        return placed.map((id): DesignPartDrawn => {
            const part = parts.get(id)!;
            const partPlacements = placements.get(id)!;
            const matrices = new Float32Array(partPlacements.length * 16);
            partPlacements.forEach((placement, index) => matrices.set(placement.world, index * 16));
            const reused = kept.get(id);
            const mesh = reused ? undefined : meshes.get(id)!;
            const faces = reused ? reused.faces : mesh && options.drawFaces && mesh.faceList.length > 0
                ? this.lookedMesh(lookMeshesOf(mesh, lookGroupsOf(part.appearance, mesh.faceList.map(face => face.faceIndex), options.faceColour)), options.faceOpacity, zOffset)
                : undefined;
            const edges = reused ? reused.edges : mesh && options.drawEdges && mesh.edgeList.length > 0 ? this.partEdges(mesh, part.appearance, options) : undefined;
            const paths = partPlacements.map(placement => placement.path);
            for (const drawn of [faces, edges]) {
                if (drawn) {
                    drawn.parent = target;
                    drawn.thinInstanceSetBuffer("matrix", matrices, 16, false);
                    drawn.thinInstanceRefreshBoundingInfo(false);
                    drawn.metadata = { ...drawn.metadata, part: id, paths };
                }
            }
            return { part: id, key: designPartKeyOf(part), matrices, faces, edges };
        });
    }

    private poseDesign(state: DesignDrawState, placements: Map<string, PartPlacement[]>): void {
        for (const drawn of state.parts) {
            placements.get(drawn.part)!.forEach((placement, index) => drawn.matrices.set(placement.world, index * 16));
            for (const mesh of [drawn.faces, drawn.edges]) {
                if (mesh) {
                    mesh.thinInstanceSetBuffer("matrix", drawn.matrices, 16, false);
                    mesh.thinInstanceRefreshBoundingInfo(false);
                }
            }
        }
        state.placements = placements;
    }

    private clearDesign(parts: readonly DesignPartDrawn[]): void {
        for (const drawn of parts) {
            if (drawn.faces) {
                const material = drawn.faces.material;
                drawn.faces.dispose(false, false);
                if (material instanceof BABYLON.MultiMaterial) {
                    material.dispose();
                }
            }
            drawn.edges?.dispose(false, true);
        }
    }

    async handleDecomposedMesh(inputs: Omit<Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>): Promise<BABYLON.Mesh> {
        const resolved = resolveDto(Inputs.OCCT.DrawShapeDto, inputs) as Omit<Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">;
        const resolvedOptions = resolveDto(Inputs.Draw.DrawOcctShapeOptions, options) as Resolved.Draw.DrawOcctShapeOptions;
        const shapeMesh = new BABYLON.Mesh(this.generateEntityId("brepMesh"), this.context.scene);
        shapeMesh.isVisible = false;
        const dummy = undefined;
        const linesOnFaces = resolved.drawEdges || resolved.drawIsoCurves;

        const hex = Array.isArray(resolved.faceColour) ? resolved.faceColour[0] : resolved.faceColour;
        if (resolved.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {

            let pbr: BABYLON.PBRMetallicRoughnessMaterial;
            const alpha = resolved.faceOpacity;
            const zOffset = linesOnFaces ? 2 : 0;
            const analysisColors = this.surfaceAnalysisColors(decomposedMesh, hex, resolved.analysisMin, resolved.analysisMax, 4);

            if (analysisColors) {
                pbr = this.getOrCreateAnalysisMaterial(alpha, zOffset);
            } else if (resolvedOptions.faceMaterial) {
                pbr = resolvedOptions.faceMaterial;
            } else {
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

            const meshData: MeshData[] = decomposedMesh.faceList.map((face, index) => {
                return {
                    positions: face.vertexCoord,
                    normals: face.normalCoord,
                    indices: face.triIndexes,
                    uvs: face.uvs,
                    colors: analysisColors?.[index],
                };
            });

            let backFaceMesh: BABYLON.Mesh | undefined;
            if (resolved.drawTwoSided !== false) {
                backFaceMesh = this.createBackFaceMesh(
                    meshData,
                    resolved.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                    resolved.backFaceOpacity,
                    zOffset
                );
            }

            const colorGroups = decomposedMesh.colorGroups;
            const mesh = !analysisColors && !resolvedOptions.faceMaterial && colorGroups && Object.keys(colorGroups).length > 0
                ? this.lookedMesh(lookMeshesOf(decomposedMesh, lookGroupsOfColors(colorGroups, decomposedMesh.faceList.map(face => face.faceIndex), hex)), alpha, zOffset)
                : this.createOrUpdateSurfacesMesh(meshData, dummy, false, pbr, true, false);
            mesh.parent = shapeMesh;

            if (backFaceMesh) {
                backFaceMesh.parent = shapeMesh;
            }
        }
        if (resolved.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {
            const evs: Inputs.Base.Point3[][] = [];
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertexCoord.filter(s => s !== undefined);
                evs.push(ev);
            });
            const mesh = this.drawPolylines(
                dummy,
                evs,
                false,
                resolved.edgeWidth,
                resolved.edgeOpacity,
                defaultEdgeColor(hex, resolved.edgeColour, resolvedOptions.edgeContrast),
                1e-7,
                false,
                Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                resolvedOptions.edgeArrowSize,
                resolvedOptions.edgeArrowAngle
            )!;
            mesh.parent = shapeMesh;
        }

        if (resolved.drawIsoCurves && decomposedMesh && decomposedMesh.isoCurveList && decomposedMesh.isoCurveList.length) {
            const mesh = this.drawPolylines(dummy, decomposedMesh.isoCurveList, false, resolved.edgeWidth, resolved.edgeOpacity, resolved.isoCurvesColour)!;
            (mesh as { name: string }).name = this.generateEntityId("isoCurves");
            mesh.parent = shapeMesh;
        }

        if (resolved.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                pointsMesh: dummy,
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: resolved.vertexSize,
                colours: resolved.vertexColour,
                updatable: false,
            });
            mesh.parent = shapeMesh;
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
                    return movedOnPosition;
                });
                return texts;
            });
            const textPolylines = await Promise.all(promises);
            const edgeMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 2, 1, resolved.edgeIndexColour, 1e-7, true)!;
            edgeMesh.parent = shapeMesh;
            edgeMesh.material!.zOffset = -2;
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
                    return movedOnPosition;
                });
                return texts;
            });
            const textPolylines = await Promise.all(promises);

            const faceMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 2, 1, resolved.faceIndexColour, 1e-7, true)!;
            faceMesh.parent = shapeMesh;
            if (resolved.drawEdges) {
                faceMesh.material!.zOffset = -2;
            }
        }
        return shapeMesh;
    }

    async handleDecomposedMeshIndividually(inputs: Omit<Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.Draw.DrawOcctShapeOptions>): Promise<BABYLON.Mesh> {
        const resolved = resolveDto(Inputs.OCCT.DrawShapeDto, inputs) as Omit<Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, "shape">;
        const resolvedOptions = resolveDto(Inputs.Draw.DrawOcctShapeOptions, options) as Resolved.Draw.DrawOcctShapeOptions;
        const shapeMesh = new BABYLON.Mesh(this.generateEntityId("brepMesh"), this.context.scene);
        shapeMesh.isVisible = false;
        const dummy = undefined;

        const hex = Array.isArray(resolved.faceColour) ? resolved.faceColour[0] : resolved.faceColour;
        if (resolved.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {
            const alpha = resolved.faceOpacity;
            const zOffset = resolved.drawEdges || resolved.drawIsoCurves ? 2 : 0;
            const analysisColors = this.surfaceAnalysisColors(decomposedMesh, hex, resolved.analysisMin, resolved.analysisMax, 4);

            const pbr = analysisColors ? this.getOrCreateAnalysisMaterial(alpha, zOffset) : resolvedOptions.faceMaterial ?? this.getOrCreateMaterial(hex, alpha, zOffset, () => {
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

            decomposedMesh.faceList.forEach((face, index) => {
                if (resolved.drawTwoSided !== false) {
                    const backFaceMesh = this.createBackFaceMesh(
                        [{
                            positions: [...face.vertexCoord],
                            normals: [...face.normalCoord],
                            indices: [...face.triIndexes],
                            uvs: face.uvs ? [...face.uvs] : undefined,
                        }],
                        resolved.backFaceColour || DEFAULT_COLORS.BACK_FACE,
                        resolved.backFaceOpacity,
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
                    colors: analysisColors?.[index],
                }], dummy, false, pbr, true, false);
                faceMesh.name = `face ${face.faceIndex}`;
                faceMesh.parent = shapeMesh;
            });
        }

        if (resolved.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {
            const edgeColour = defaultEdgeColor(hex, resolved.edgeColour, resolvedOptions.edgeContrast);
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertexCoord.filter(s => s !== undefined);
                const mesh = this.drawPolylines(
                    dummy,
                    [ev],
                    false,
                    resolved.edgeWidth,
                    resolved.edgeOpacity,
                    edgeColour,
                    1e-7,
                    false,
                    Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                    resolvedOptions.edgeArrowSize,
                    resolvedOptions.edgeArrowAngle
                );
                if (mesh) {
                    (mesh as { name: string }).name = `edge ${edge.edgeIndex}`;
                    mesh.parent = shapeMesh;
                }
            });
        }

        if (resolved.drawIsoCurves && decomposedMesh && decomposedMesh.isoCurveList && decomposedMesh.isoCurveList.length) {
            const mesh = this.drawPolylines(dummy, decomposedMesh.isoCurveList, false, resolved.edgeWidth, resolved.edgeOpacity, resolved.isoCurvesColour)!;
            (mesh as { name: string }).name = "iso curves";
            mesh.parent = shapeMesh;
        }

        if (resolved.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                pointsMesh: dummy,
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: resolved.vertexSize,
                colours: resolved.vertexColour,
                updatable: false,
            });
            mesh.name = "vertices";
            mesh.parent = shapeMesh;
        }

        return shapeMesh;
    }

    private getOrCreateAnalysisMaterial(alpha: number, zOffset: number): BABYLON.PBRMetallicRoughnessMaterial {
        return this.getOrCreateMaterial("#ffffff-analysis", alpha, zOffset, () => {
            const pbmat = new BABYLON.PBRMetallicRoughnessMaterial(this.generateEntityId("brepAnalysisMaterial"), this.context.scene);
            pbmat.baseColor = BABYLON.Color3.FromHexString("#ffffff");
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

    private handleDecomposedManifold(
        decomposedManifold: Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][], options: Resolved.Draw.DrawManifoldOrCrossSectionOptions): BABYLON.Mesh | undefined {
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
                        options.backFaceOpacity,
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

    private getSafeWorkerOptions<T extends { faceMaterial?: BABYLON.Material | undefined }>(inputs: T): Omit<T, "faceMaterial"> {

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
}
