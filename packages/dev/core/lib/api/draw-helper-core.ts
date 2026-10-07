import { Base } from "./inputs/base-inputs";
import type { Vector } from "@bitbybit-dev/base";
import { srgbToLinear } from "@bitbybit-dev/base";
import { computeVertexNormals, creasedMesh } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-normals";
import { CACHE_CONFIG, DEFAULT_COLORS } from "./constants";
import type { ManifoldMeshAttributes, ManifoldShadingOptions, ManifoldVertexData } from "./draw-helper-types";

const POSITION_SIZE = 3;

/**
 * Mesh data structure for geometry processing
 */
export interface MeshData {
    positions: number[];
    indices: number[];
    normals: number[];
    uvs?: number[] | undefined;
    /** One color per vertex in the order of `positions`, three or four numbers from 0 to 1 each. */
    colors?: number[] | undefined;
}

/**
 * A face a surface analysis colors: its vertex positions, three numbers each, and, when the face was
 * analyzed, one value per vertex in the same order.
 */
export interface SurfaceAnalysisFace {
    vertexCoord: readonly number[];
    analysisValues?: readonly number[] | undefined;
}

/** A mesh whose faces may carry the values of a surface analysis. */
export interface SurfaceAnalysisMesh {
    faceList?: readonly SurfaceAnalysisFace[] | undefined;
}

const SURFACE_ANALYSIS_RAMP: readonly (readonly [number, number, number])[] = [[0, 0, 1], [0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 0, 0]];

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

function finiteRange(meshes: readonly SurfaceAnalysisMesh[]): { min: number; max: number } | undefined {
    let min = Infinity;
    let max = -Infinity;
    for (const mesh of meshes) {
        for (const face of mesh.faceList ?? []) {
            for (const value of face.analysisValues ?? []) {
                if (isFiniteNumber(value)) {
                    min = Math.min(min, value);
                    max = Math.max(max, value);
                }
            }
        }
    }
    return min <= max ? { min, max } : undefined;
}

function rampPlace(value: number, min: number, max: number): number {
    if (max === min) {
        return value > min ? 1 : value < min ? 0 : 0.5;
    }
    return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

function rampColor(place: number): [number, number, number] {
    const scaled = place * (SURFACE_ANALYSIS_RAMP.length - 1);
    const stop = Math.min(Math.floor(scaled), SURFACE_ANALYSIS_RAMP.length - 2);
    const share = scaled - stop;
    const from = SURFACE_ANALYSIS_RAMP[stop]!;
    const to = SURFACE_ANALYSIS_RAMP[stop + 1]!;
    return [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share, from[2] + (to[2] - from[2]) * share];
}

/**
 * Base class for DrawHelper implementations across all game engines.
 * Contains engine-agnostic utility methods that are shared between
 * PlayCanvas, ThreeJS, and BabylonJS implementations.
 */
export class DrawHelperCore {

    constructor(public readonly vector: Vector) { }

    /**
     * Compute the middle position of an edge
     * @param edge - Edge with vertex coordinates
     * @returns Middle point of the edge
     */
    computeEdgeMiddlePos(edge: { edgeIndex: number; vertexCoord: Base.Point3[]; }): Base.Point3 {
        let pos: number[];
        if (edge.vertexCoord.length === 2) {
            const midFloor = edge.vertexCoord[0]!;
            const midCeil = edge.vertexCoord[1]!;
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        } else if (edge.vertexCoord.length === 3) {
            pos = edge.vertexCoord[1]!;
        } else {
            const midFloor = edge.vertexCoord[Math.floor(edge.vertexCoord.length / 2)]!;
            const midCeil = edge.vertexCoord[Math.floor(edge.vertexCoord.length / 2 + 1)]!;
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        }
        return pos as Base.Point3;
    }

    /**
     * Compute the center position of a face
     * @param vertexCoordVec - Array of vertex coordinates
     * @returns Center point of the face
     */
    computeFaceMiddlePos(vertexCoordVec: number[][]): number[] {
        let x = 0;
        let y = 0;
        let z = 0;

        let realLength = 0;
        vertexCoordVec.forEach(v => {
            x += v[0]!;
            y += v[1]!;
            z += v[2]!;
            realLength++;
        });

        return [x / realLength, y / realLength, z / realLength];
    }

    /**
     * Resolve a color for a specific entity index based on the color mapping strategy
     * @param colors - Single color string or array of colors
     * @param entityIndex - Index of the entity that needs a color
     * @param totalEntities - Total number of entities being drawn
     * @param strategy - Color mapping strategy to use
     * @returns Resolved color for the entity
     */
    protected resolveColorForEntity(
        colors: string | string[],
        entityIndex: number,
        totalEntities: number,
        strategy: Base.colorMapStrategyEnum = Base.colorMapStrategyEnum.lastColorRemainder
    ): string {
        if (!Array.isArray(colors)) {
            return colors;
        }
        
        if (colors.length === 0) {
            return DEFAULT_COLORS.FACE;
        }
        
        if (colors.length === 1) {
            return colors[0]!;
        }
        
        if (colors.length >= totalEntities) {
            return colors[entityIndex]!;
        }
        
        switch (strategy) {
            case Base.colorMapStrategyEnum.firstColorForAll:
                return colors[0]!;
                
            case Base.colorMapStrategyEnum.lastColorRemainder:
                return entityIndex < colors.length ? colors[entityIndex]! : colors[colors.length - 1]!;
                
            case Base.colorMapStrategyEnum.repeatColors:
                return colors[entityIndex % colors.length]!;
                
            case Base.colorMapStrategyEnum.reversedColors: {
                const cycleLength = (colors.length - 1) * 2;
                if (cycleLength <= 0) {
                    return colors[0]!;
                }
                const position = entityIndex % cycleLength;
                if (position < colors.length) {
                    return colors[position]!;
                } else {
                    return colors[cycleLength - position]!;
                }
            }
                
            default:
                return entityIndex < colors.length ? colors[entityIndex]! : colors[colors.length - 1]!;
        }
    }

    /**
     * Resolve all colors for a set of entities based on the color mapping strategy
     * @param colors - Single color string or array of colors
     * @param totalEntities - Total number of entities being drawn
     * @param strategy - Color mapping strategy to use
     * @returns Array of colors, one for each entity
     */
    protected resolveAllColors(
        colors: string | string[],
        totalEntities: number,
        strategy: Base.colorMapStrategyEnum = Base.colorMapStrategyEnum.lastColorRemainder
    ): string[] {
        const result: string[] = [];
        for (let i = 0; i < totalEntities; i++) {
            result.push(this.resolveColorForEntity(colors, i, totalEntities, strategy));
        }
        return result;
    }

    /**
     * Convert RGB values (0-255) to hex color string
     * @param r - Red component (0-255)
     * @param g - Green component (0-255)
     * @param b - Blue component (0-255)
     * @returns Hex color string (e.g., "#ff0000")
     */
    protected colorToHex(r: number, g: number, b: number): string {
        const toHex = (n: number) => {
            const clamped = Math.min(255, Math.max(0, Math.round(n)));
            const hex = clamped.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return "#" + toHex(r) + toHex(g) + toHex(b);
    }

    /**
     * Convert normalized RGB values (0-1) to hex color string
     * @param r - Red component (0-1)
     * @param g - Green component (0-1)
     * @param b - Blue component (0-1)
     * @returns Hex color string (e.g., "#ff0000")
     */
    protected normalizedColorToHex(r: number, g: number, b: number): string {
        return this.colorToHex(r * 255, g * 255, b * 255);
    }

    /**
     * Convert hex color string to RGB object
     * @param hex - Hex color string (e.g., "#ff0000" or "ff0000")
     * @returns RGB object with values 0-1, or null if invalid
     */
    protected hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return {
                r: parseInt(result[1]!, 16) / 255,
                g: parseInt(result[2]!, 16) / 255,
                b: parseInt(result[3]!, 16) / 255
            };
        }
        return null;
    }

    /**
     * Normalize color input to hex string with validation
     * @param color - Color as number array [r,g,b], hex string, or undefined
     * @param fallback - Fallback color if input is invalid
     * @returns Normalized hex color string
     */
    protected normalizeColor(color: number[] | string | undefined, fallback: string): string {
        if (!color) {
            return fallback;
        }

        if (Array.isArray(color)) {
            if (color.length < 3) {
                console.warn(`Invalid color array length: ${color.length}, expected at least 3. Using fallback: ${fallback}`);
                return fallback;
            }
            const components = [color[0]!, color[1]!, color[2]!];
            if (components.some((component) => !(component >= 0 && component <= 1))) {
                console.warn(`Colour components are normalized to 0-1, and [${components.join(", ")}] is outside that range. Values are clamped; divide by 255 if these are byte values.`);
            }
            return this.normalizedColorToHex(components[0]!, components[1]!, components[2]!);
        }

        if (typeof color === "string") {
            if (!/^#?[0-9A-F]{6}$/i.test(color)) {
                console.warn(`Invalid hex color: ${color}. Using fallback: ${fallback}`);
                return fallback;
            }
            return color.startsWith("#") ? color : `#${color}`;
        }

        console.warn(`Unknown color format: ${typeof color}. Using fallback: ${fallback}`);
        return fallback;
    }

    /**
     * Generate a unique key for material caching
     * Uses fixed decimal precision to handle floating-point comparison
     * @param hex - Hex color string
     * @param alpha - Alpha value (0-1)
     * @param zOffset - Z-offset value for depth bias
     * @param unlit - Whether the material is unlit (no lighting)
     * @returns Unique cache key
     */
    protected getMaterialKey(hex: string, alpha: number, zOffset: number, unlit = false): string {
        const normalizedAlpha = alpha.toFixed(CACHE_CONFIG.ALPHA_PRECISION);
        const unlitSuffix = unlit ? "-unlit" : "";
        return `${hex}-${normalizedAlpha}-${zOffset}${unlitSuffix}`;
    }

    /**
     * Compute a signature string representing polyline structure
     * This is used to determine if existing geometry can be updated
     * @param polylinePoints - Array of polylines
     * @returns Signature string
     */
    protected computePolylineSignature(polylinePoints: Base.Vector3[][]): string {
        return polylinePoints.map(line => line.length).join(",");
    }

    /**
     * Compute arrow head lines for a polyline based on its last segment direction.
     * Creates 4 lines in 3D space forming an arrow head pointing in the direction of the polyline.
     * The arrow is constructed using two perpendicular planes through the direction vector.
     * 
     * @param polylinePoints - Array of points forming the polyline [x,y,z][]
     * @param arrowSize - Length of the arrow head lines
     * @param arrowAngleDeg - Angle of the arrow head in degrees (from direction vector)
     * @returns Array of 4 line segments, each as [[startX, startY, startZ], [endX, endY, endZ]], or empty array if not enough points
     */
    protected computeArrowHeadLines(
        polylinePoints: Base.Point3[],
        arrowSize: number,
        arrowAngleDeg: number
    ): Base.Point3[][] {
        if (polylinePoints.length < 2 || arrowSize <= 0) {
            return [];
        }

        const endPoint = polylinePoints[polylinePoints.length - 1]!;
        const prevPoint = polylinePoints[polylinePoints.length - 2]!;

        const dx = endPoint[0] - prevPoint[0];
        const dy = endPoint[1] - prevPoint[1];
        const dz = endPoint[2] - prevPoint[2];

        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (length < 1e-10) {
            return [];
        }

        const dirX = dx / length;
        const dirY = dy / length;
        const dirZ = dz / length;

        const angleRad = (arrowAngleDeg * Math.PI) / 180;
        const cosAngle = Math.cos(angleRad);
        const sinAngle = Math.sin(angleRad);

        let refX = 0, refY = 1, refZ = 0;
        const dotWithY = Math.abs(dirY);
        if (dotWithY > 0.9) {
            refX = 1; refY = 0; refZ = 0;
        }

        let perp1X = dirY * refZ - dirZ * refY;
        let perp1Y = dirZ * refX - dirX * refZ;
        let perp1Z = dirX * refY - dirY * refX;

        const perp1Len = Math.sqrt(perp1X * perp1X + perp1Y * perp1Y + perp1Z * perp1Z);
        perp1X /= perp1Len;
        perp1Y /= perp1Len;
        perp1Z /= perp1Len;

        let perp2X = dirY * perp1Z - dirZ * perp1Y;
        let perp2Y = dirZ * perp1X - dirX * perp1Z;
        let perp2Z = dirX * perp1Y - dirY * perp1X;

        const perp2Len = Math.sqrt(perp2X * perp2X + perp2Y * perp2Y + perp2Z * perp2Z);
        perp2X /= perp2Len;
        perp2Y /= perp2Len;
        perp2Z /= perp2Len;

        const backComponent = arrowSize * cosAngle;
        const perpComponent = arrowSize * sinAngle;

        const arrowLines: Base.Point3[][] = [];

        arrowLines.push([
            endPoint,
            [
                endPoint[0] - dirX * backComponent + perp1X * perpComponent,
                endPoint[1] - dirY * backComponent + perp1Y * perpComponent,
                endPoint[2] - dirZ * backComponent + perp1Z * perpComponent
            ]
        ]);

        arrowLines.push([
            endPoint,
            [
                endPoint[0] - dirX * backComponent - perp1X * perpComponent,
                endPoint[1] - dirY * backComponent - perp1Y * perpComponent,
                endPoint[2] - dirZ * backComponent - perp1Z * perpComponent
            ]
        ]);

        arrowLines.push([
            endPoint,
            [
                endPoint[0] - dirX * backComponent + perp2X * perpComponent,
                endPoint[1] - dirY * backComponent + perp2Y * perpComponent,
                endPoint[2] - dirZ * backComponent + perp2Z * perpComponent
            ]
        ]);

        arrowLines.push([
            endPoint,
            [
                endPoint[0] - dirX * backComponent - perp2X * perpComponent,
                endPoint[1] - dirY * backComponent - perp2Y * perpComponent,
                endPoint[2] - dirZ * backComponent - perp2Z * perpComponent
            ]
        ]);

        return arrowLines;
    }

    /**
     * Compute arrow head lines for multiple polylines
     * @param polylines - Array of polylines, each as array of points
     * @param arrowSize - Length of the arrow head lines
     * @param arrowAngleDeg - Angle of the arrow head in degrees
     * @returns Array of all arrow line segments from all polylines
     */
    protected computeArrowHeadLinesForPolylines(
        polylines: Base.Point3[][],
        arrowSize: number,
        arrowAngleDeg: number
    ): Base.Point3[][] {
        const allArrowLines: Base.Point3[][] = [];
        
        for (const polyline of polylines) {
            const arrowLines = this.computeArrowHeadLines(polyline, arrowSize, arrowAngleDeg);
            allArrowLines.push(...arrowLines);
        }
        
        return allArrowLines;
    }

    /**
     * Convert arrow lines to flat polyline format for rendering
     * Each arrow line is converted to a 2-point polyline (start and end)
     * @param arrowLines - Array of line segments [[start], [end]]
     * @returns Array of polylines suitable for drawing
     */
    protected arrowLinesToPolylines(arrowLines: Base.Point3[][]): Base.Point3[][] {
        return arrowLines;
    }

    /**
     * Process polyline points, handling closed polylines by adding first point to end
     * @param polylines - Array of polylines
     * @returns Array of processed point arrays
     */
    protected processPolylinePoints(polylines: Base.Polyline3[]): Base.Point3[][] {
        return polylines.map(polyline => {
            const points = polyline.points ? [...polyline.points] : [];
            
            if (polyline.isClosed && points.length > 0) {
                points.push(points[0]!);
            }
            
            return points;
        });
    }

    /**
     * Compute smooth vertex normals for a mesh when normals are not provided
     * Uses cross product of edge vectors and accumulates per-vertex
     * @param positions - Flat array of vertex positions [x,y,z,x,y,z,...]
     * @param indices - Triangle indices
     * @returns Flat array of normals [nx,ny,nz,nx,ny,nz,...]
     */
    protected computeNormals(positions: number[], indices: number[]): number[] {
        return computeVertexNormals(positions, indices);
    }

    /**
     * Expand indexed mesh to non-indexed (flat shaded) mesh with per-face normals
     * This creates unique vertices for each face, allowing flat shading
     * @param positions - Flat array of vertex positions [x,y,z,x,y,z,...]
     * @param indices - Triangle indices
     * @returns Object with expanded positions, new sequential indices, and flat normals
     */
    protected expandToFlatShaded(positions: number[], indices: number[]): { positions: number[], indices: number[], normals: number[] } {
        const expandedPositions: number[] = [];
        const expandedNormals: number[] = [];
        const expandedIndices: number[] = [];
        
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i]!;
            const i1 = indices[i + 1]!;
            const i2 = indices[i + 2]!;
            
            const v0x = positions[i0 * 3]!;
            const v0y = positions[i0 * 3 + 1]!;
            const v0z = positions[i0 * 3 + 2]!;
            
            const v1x = positions[i1 * 3]!;
            const v1y = positions[i1 * 3 + 1]!;
            const v1z = positions[i1 * 3 + 2]!;
            
            const v2x = positions[i2 * 3]!;
            const v2y = positions[i2 * 3 + 1]!;
            const v2z = positions[i2 * 3 + 2]!;
            
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
            
            const baseIndex = expandedPositions.length / 3;
            
            expandedPositions.push(v0x, v0y, v0z);
            expandedPositions.push(v1x, v1y, v1z);
            expandedPositions.push(v2x, v2y, v2z);
            
            expandedNormals.push(nx, ny, nz);
            expandedNormals.push(nx, ny, nz);
            expandedNormals.push(nx, ny, nz);
            
            expandedIndices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        }
        
        return {
            positions: expandedPositions,
            indices: expandedIndices,
            normals: expandedNormals
        };
    }

    /**
     * The sharp angle to ask the Manifold worker for: the drawing's `minSharpAngle` when normals are
     * computed, and 0, which shades every face flat, when they are not.
     * @param options - The drawing's shading options
     * @returns The angle in degrees
     */
    protected manifoldSharpAngle(options: ManifoldShadingOptions): number {
        return options.computeNormals ? options.minSharpAngle : 0;
    }

    /**
     * Turns a Manifold mesh into positions, normals and triangles to draw. The normals are the ones
     * the worker computed after each position; a worker from a release before it could do so sends
     * none, and they are then computed here by the same rule, smooth across edges flatter than
     * `minSharpAngle`.
     * @param mesh - The mesh as the worker sent it
     * @param minSharpAngle - The angle in degrees above which an edge stays sharp
     * @returns The positions, normals and triangle indices
     */
    protected manifoldMeshAttributes(mesh: ManifoldVertexData, minSharpAngle: number): ManifoldMeshAttributes {
        const numProp = mesh.numProp || POSITION_SIZE;
        const count = mesh.vertProperties.length / numProp;
        const positions = numProp === POSITION_SIZE ? mesh.vertProperties : new Float32Array(count * POSITION_SIZE);
        const normals = numProp >= POSITION_SIZE * 2 ? new Float32Array(count * POSITION_SIZE) : undefined;
        if (numProp !== POSITION_SIZE) {
            for (let vertex = 0; vertex < count; vertex++) {
                for (let axis = 0; axis < POSITION_SIZE; axis++) {
                    positions[vertex * POSITION_SIZE + axis] = mesh.vertProperties[vertex * numProp + axis]!;
                    if (normals) {
                        normals[vertex * POSITION_SIZE + axis] = mesh.vertProperties[vertex * numProp + POSITION_SIZE + axis]!;
                    }
                }
            }
        }
        return normals ? { positions, normals, indices: mesh.triVerts } : creasedMesh(positions, mesh.triVerts, minSharpAngle);
    }

    /**
     * Prepare mesh data for back face rendering by flipping normals and reversing winding order
     * This is used to create a duplicate mesh that renders the back side with a different material
     * @param meshDataArray - Array of mesh data objects
     * @returns Combined mesh data with flipped normals and reversed indices
     */
    protected prepareBackFaceMeshData(
        meshDataArray: MeshData[]
    ): MeshData {
        const totalPositions: number[] = [];
        let totalNormals: number[] = [];
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
            
            for (let i = 0; i < meshItem.indices.length; i += 3) {
                totalIndices.push(
                    meshItem.indices[i]! + indexOffset,
                    meshItem.indices[i + 2]! + indexOffset,
                    meshItem.indices[i + 1]! + indexOffset
                );
            }
            indexOffset += meshItem.positions.length / 3;
        });

        if (totalNormals.length === 0 && totalPositions.length > 0) {
            const computedNormals = this.computeNormals(totalPositions, totalIndices);
            totalNormals = computedNormals;
        }

        return {
            positions: totalPositions,
            indices: totalIndices,
            normals: totalNormals,
            uvs: totalUvs.length > 0 ? totalUvs : undefined
        };
    }

    /**
     * Get the default back face color
     * @returns Hex color string for back face
     */
    protected getDefaultBackFaceColor(): string {
        return DEFAULT_COLORS.BACK_FACE;
    }

    /**
     * `options` with `analysisMin` and `analysisMax` set, where they are not finite numbers, to the
     * lowest and highest finite values the faces of all `meshes` carry, so every mesh of a list is
     * colored over the same range. Without such values the options come back as they are.
     * @param options - Drawing options that may give either end of the range
     * @param meshes - Every mesh the options will draw
     * @returns New options with both ends of the range where the meshes give them
     */
    withSurfaceAnalysisRange<T extends { analysisMin?: number | undefined; analysisMax?: number | undefined }>(options: T, meshes: readonly SurfaceAnalysisMesh[]): T {
        const found = finiteRange(meshes);
        if (!found) {
            return options;
        }
        return {
            ...options,
            analysisMin: isFiniteNumber(options.analysisMin) ? options.analysisMin : found.min,
            analysisMax: isFiniteNumber(options.analysisMax) ? options.analysisMax : found.max,
        };
    }

    /**
     * The color of every vertex of every face of `mesh` from its surface analysis, in linear light as
     * the engines read vertex colors. A value runs from blue at `min` through cyan, green and yellow
     * to red at `max`, and is clamped past them; left out, they are the lowest and highest finite
     * values the mesh carries. A NaN value, and every vertex of a face without values, keeps
     * `fallback`.
     * @param mesh - The mesh whose faces carry the values
     * @param fallback - The hex color of a vertex without a value
     * @param min - The value drawn blue
     * @param max - The value drawn red
     * @param components - Three numbers per vertex (red, green, blue), or four with an alpha of 1
     * @returns One list of colors per face, or undefined when no face carries values
     */
    protected surfaceAnalysisColors(mesh: SurfaceAnalysisMesh, fallback: string, min: number | undefined, max: number | undefined, components: 3 | 4): number[][] | undefined {
        const faces = mesh.faceList ?? [];
        if (!faces.some(face => Array.isArray(face.analysisValues))) {
            return undefined;
        }
        const found = finiteRange([mesh]);
        const low = isFiniteNumber(min) ? min : found?.min ?? 0;
        const high = isFiniteNumber(max) ? max : found?.max ?? 0;
        const plain = this.hexToRgb(this.normalizeColor(fallback, DEFAULT_COLORS.FACE))!;
        const fallbackColor = [plain.r, plain.g, plain.b].map(srgbToLinear);
        return faces.map(face => {
            const count = Math.floor(face.vertexCoord.length / 3);
            const colors = new Array<number>(count * components);
            for (let vertex = 0; vertex < count; vertex++) {
                const value = face.analysisValues?.[vertex];
                const color = typeof value === "number" && !Number.isNaN(value) ? rampColor(rampPlace(value, low, high)).map(srgbToLinear) : fallbackColor;
                for (let channel = 0; channel < 3; channel++) {
                    colors[vertex * components + channel] = color[channel]!;
                }
                if (components === 4) {
                    colors[vertex * components + 3] = 1;
                }
            }
            return colors;
        });
    }
}