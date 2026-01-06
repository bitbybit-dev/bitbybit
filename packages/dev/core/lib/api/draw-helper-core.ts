import { Base } from "./inputs/base-inputs";
import { Vector } from "@bitbybit-dev/base";
import { CACHE_CONFIG, DEFAULT_COLORS } from "./constants";

/**
 * Mesh data structure for geometry processing
 */
export interface MeshData {
    positions: number[];
    indices: number[];
    normals: number[];
    uvs?: number[];
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
    computeEdgeMiddlePos(edge: { edge_index: number; vertex_coord: Base.Point3[]; }): Base.Point3 {
        let pos;
        if (edge.vertex_coord.length === 2) {
            const midFloor = edge.vertex_coord[0];
            const midCeil = edge.vertex_coord[1];
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        } else if (edge.vertex_coord.length === 3) {
            pos = edge.vertex_coord[1];
        } else {
            const midFloor = edge.vertex_coord[Math.floor(edge.vertex_coord.length / 2)];
            const midCeil = edge.vertex_coord[Math.floor(edge.vertex_coord.length / 2 + 1)];
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        }
        return pos;
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
            x += v[0];
            y += v[1];
            z += v[2];
            realLength++;
        });

        return [x / realLength, y / realLength, z / realLength];
    }

    // ============== Color Utility Methods ==============

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
        // If single color or empty array, return it directly
        if (!Array.isArray(colors)) {
            return colors;
        }
        
        if (colors.length === 0) {
            return DEFAULT_COLORS.FACE;
        }
        
        if (colors.length === 1) {
            return colors[0];
        }
        
        // If we have enough colors for all entities, use direct mapping
        if (colors.length >= totalEntities) {
            return colors[entityIndex];
        }
        
        // Apply strategy when there are more entities than colors
        switch (strategy) {
            case Base.colorMapStrategyEnum.firstColorForAll:
                return colors[0];
                
            case Base.colorMapStrategyEnum.lastColorRemainder:
                // Use corresponding color if available, otherwise use last color
                return entityIndex < colors.length ? colors[entityIndex] : colors[colors.length - 1];
                
            case Base.colorMapStrategyEnum.repeatColors:
                // Cycle through colors in repeating pattern
                return colors[entityIndex % colors.length];
                
            case Base.colorMapStrategyEnum.reversedColors: {
                // Ping-pong pattern: 0,1,2,1,0,1,2,1,0...
                const cycleLength = (colors.length - 1) * 2;
                if (cycleLength <= 0) {
                    return colors[0];
                }
                const position = entityIndex % cycleLength;
                if (position < colors.length) {
                    return colors[position];
                } else {
                    return colors[cycleLength - position];
                }
            }
                
            default:
                // Default to lastColorRemainder for safety
                return entityIndex < colors.length ? colors[entityIndex] : colors[colors.length - 1];
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
            const hex = Math.round(n).toString(16);
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
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255
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
            // Assume values are normalized (0-1)
            return this.normalizedColorToHex(color[0], color[1], color[2]);
        }

        if (typeof color === "string") {
            // Validate hex format
            if (!/^#?[0-9A-F]{6}$/i.test(color)) {
                console.warn(`Invalid hex color: ${color}. Using fallback: ${fallback}`);
                return fallback;
            }
            // Ensure it starts with #
            return color.startsWith("#") ? color : `#${color}`;
        }

        console.warn(`Unknown color format: ${typeof color}. Using fallback: ${fallback}`);
        return fallback;
    }

    // ============== Material Cache Utility Methods ==============

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

    // ============== Polyline Utility Methods ==============

    /**
     * Compute a signature string representing polyline structure
     * This is used to determine if existing geometry can be updated
     * @param polylinePoints - Array of polylines
     * @returns Signature string
     */
    protected computePolylineSignature(polylinePoints: Base.Vector3[][]): string {
        return polylinePoints.map(line => line.length).join(",");
    }

    // ============== Arrow Computation Methods ==============

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

        // Get the last two points to determine direction
        const endPoint = polylinePoints[polylinePoints.length - 1];
        const prevPoint = polylinePoints[polylinePoints.length - 2];

        // Compute direction vector (from prev to end)
        const dx = endPoint[0] - prevPoint[0];
        const dy = endPoint[1] - prevPoint[1];
        const dz = endPoint[2] - prevPoint[2];

        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (length < 1e-10) {
            return [];
        }

        // Normalize direction
        const dirX = dx / length;
        const dirY = dy / length;
        const dirZ = dz / length;

        // Convert angle to radians
        const angleRad = (arrowAngleDeg * Math.PI) / 180;
        const cosAngle = Math.cos(angleRad);
        const sinAngle = Math.sin(angleRad);

        // Find a perpendicular vector using cross product with a reference vector
        // Choose reference vector that is not parallel to direction
        let refX = 0, refY = 1, refZ = 0;
        const dotWithY = Math.abs(dirY);
        if (dotWithY > 0.9) {
            // Direction is nearly parallel to Y, use X instead
            refX = 1; refY = 0; refZ = 0;
        }

        // Cross product: perp1 = dir × ref
        let perp1X = dirY * refZ - dirZ * refY;
        let perp1Y = dirZ * refX - dirX * refZ;
        let perp1Z = dirX * refY - dirY * refX;

        // Normalize perp1
        const perp1Len = Math.sqrt(perp1X * perp1X + perp1Y * perp1Y + perp1Z * perp1Z);
        perp1X /= perp1Len;
        perp1Y /= perp1Len;
        perp1Z /= perp1Len;

        // Cross product: perp2 = dir × perp1 (second perpendicular)
        let perp2X = dirY * perp1Z - dirZ * perp1Y;
        let perp2Y = dirZ * perp1X - dirX * perp1Z;
        let perp2Z = dirX * perp1Y - dirY * perp1X;

        // Normalize perp2
        const perp2Len = Math.sqrt(perp2X * perp2X + perp2Y * perp2Y + perp2Z * perp2Z);
        perp2X /= perp2Len;
        perp2Y /= perp2Len;
        perp2Z /= perp2Len;

        // Arrow head points: 4 points at the end of arrow lines
        // Each line goes from endPoint back along direction with perpendicular offset
        // The backward component: -dir * arrowSize * cos(angle)
        // The perpendicular component: perp * arrowSize * sin(angle)
        const backComponent = arrowSize * cosAngle;
        const perpComponent = arrowSize * sinAngle;

        // 4 arrow head endpoints using both perpendicular vectors
        const arrowLines: Base.Point3[][] = [];

        // Arrow line 1: +perp1 direction
        arrowLines.push([
            endPoint,
            [
                endPoint[0] - dirX * backComponent + perp1X * perpComponent,
                endPoint[1] - dirY * backComponent + perp1Y * perpComponent,
                endPoint[2] - dirZ * backComponent + perp1Z * perpComponent
            ]
        ]);

        // Arrow line 2: -perp1 direction
        arrowLines.push([
            endPoint,
            [
                endPoint[0] - dirX * backComponent - perp1X * perpComponent,
                endPoint[1] - dirY * backComponent - perp1Y * perpComponent,
                endPoint[2] - dirZ * backComponent - perp1Z * perpComponent
            ]
        ]);

        // Arrow line 3: +perp2 direction
        arrowLines.push([
            endPoint,
            [
                endPoint[0] - dirX * backComponent + perp2X * perpComponent,
                endPoint[1] - dirY * backComponent + perp2Y * perpComponent,
                endPoint[2] - dirZ * backComponent + perp2Z * perpComponent
            ]
        ]);

        // Arrow line 4: -perp2 direction
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

    // ============== Polyline Processing Methods ==============

    /**
     * Process polyline points, handling closed polylines by adding first point to end
     * @param polylines - Array of polylines
     * @returns Array of processed point arrays
     */
    protected processPolylinePoints(polylines: Base.Polyline3[]): Base.Point3[][] {
        return polylines.map(polyline => {
            const points = polyline.points ? [...polyline.points] : []; // Don't mutate input
            
            if (polyline.isClosed && points.length > 0) {
                points.push(points[0]);
            }
            
            return points;
        });
    }

    // ============== Normal Computation Methods ==============

    /**
     * Compute smooth vertex normals for a mesh when normals are not provided
     * Uses cross product of edge vectors and accumulates per-vertex
     * @param positions - Flat array of vertex positions [x,y,z,x,y,z,...]
     * @param indices - Triangle indices
     * @returns Flat array of normals [nx,ny,nz,nx,ny,nz,...]
     */
    protected computeNormals(positions: number[], indices: number[]): number[] {
        const numVertices = positions.length / 3;
        const normals = new Float32Array(positions.length);
        
        // For each triangle, compute face normal and accumulate
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i];
            const i1 = indices[i + 1];
            const i2 = indices[i + 2];
            
            // Get vertices
            const v0x = positions[i0 * 3];
            const v0y = positions[i0 * 3 + 1];
            const v0z = positions[i0 * 3 + 2];
            
            const v1x = positions[i1 * 3];
            const v1y = positions[i1 * 3 + 1];
            const v1z = positions[i1 * 3 + 2];
            
            const v2x = positions[i2 * 3];
            const v2y = positions[i2 * 3 + 1];
            const v2z = positions[i2 * 3 + 2];
            
            // Compute edge vectors
            const e1x = v1x - v0x;
            const e1y = v1y - v0y;
            const e1z = v1z - v0z;
            
            const e2x = v2x - v0x;
            const e2y = v2y - v0y;
            const e2z = v2z - v0z;
            
            // Cross product for face normal
            const nx = e1y * e2z - e1z * e2y;
            const ny = e1z * e2x - e1x * e2z;
            const nz = e1x * e2y - e1y * e2x;
            
            // Accumulate normals for each vertex
            normals[i0 * 3] += nx;
            normals[i0 * 3 + 1] += ny;
            normals[i0 * 3 + 2] += nz;
            
            normals[i1 * 3] += nx;
            normals[i1 * 3 + 1] += ny;
            normals[i1 * 3 + 2] += nz;
            
            normals[i2 * 3] += nx;
            normals[i2 * 3 + 1] += ny;
            normals[i2 * 3 + 2] += nz;
        }
        
        // Normalize all normals
        for (let i = 0; i < numVertices; i++) {
            const x = normals[i * 3];
            const y = normals[i * 3 + 1];
            const z = normals[i * 3 + 2];
            const len = Math.sqrt(x * x + y * y + z * z);
            if (len > 0) {
                normals[i * 3] = x / len;
                normals[i * 3 + 1] = y / len;
                normals[i * 3 + 2] = z / len;
            }
        }
        
        return Array.from(normals);
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
        
        // For each triangle, create unique vertices with face normals
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i];
            const i1 = indices[i + 1];
            const i2 = indices[i + 2];
            
            // Get vertices
            const v0x = positions[i0 * 3];
            const v0y = positions[i0 * 3 + 1];
            const v0z = positions[i0 * 3 + 2];
            
            const v1x = positions[i1 * 3];
            const v1y = positions[i1 * 3 + 1];
            const v1z = positions[i1 * 3 + 2];
            
            const v2x = positions[i2 * 3];
            const v2y = positions[i2 * 3 + 1];
            const v2z = positions[i2 * 3 + 2];
            
            // Compute edge vectors
            const e1x = v1x - v0x;
            const e1y = v1y - v0y;
            const e1z = v1z - v0z;
            
            const e2x = v2x - v0x;
            const e2y = v2y - v0y;
            const e2z = v2z - v0z;
            
            // Cross product for face normal
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
            
            // Add expanded vertices (each triangle gets unique vertices)
            const baseIndex = expandedPositions.length / 3;
            
            expandedPositions.push(v0x, v0y, v0z);
            expandedPositions.push(v1x, v1y, v1z);
            expandedPositions.push(v2x, v2y, v2z);
            
            // Same normal for all three vertices (flat shading)
            expandedNormals.push(nx, ny, nz);
            expandedNormals.push(nx, ny, nz);
            expandedNormals.push(nx, ny, nz);
            
            // Sequential indices
            expandedIndices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        }
        
        return {
            positions: expandedPositions,
            indices: expandedIndices,
            normals: expandedNormals
        };
    }

    // ============== Back Face Mesh Data Preparation ==============

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
            
            // Flip normals for back face
            if (meshItem.normals && meshItem.normals.length > 0) {
                for (let i = 0; i < meshItem.normals.length; i++) {
                    totalNormals.push(-meshItem.normals[i]);
                }
            }
            
            if (meshItem.uvs) {
                totalUvs.push(...meshItem.uvs);
            }
            
            // Reverse winding order for back face (swap second and third vertex of each triangle)
            for (let i = 0; i < meshItem.indices.length; i += 3) {
                totalIndices.push(
                    meshItem.indices[i] + indexOffset,
                    meshItem.indices[i + 2] + indexOffset,  // Swapped
                    meshItem.indices[i + 1] + indexOffset   // Swapped
                );
            }
            indexOffset += meshItem.positions.length / 3;
        });

        // Compute normals if they're missing
        if (totalNormals.length === 0 && totalPositions.length > 0) {
            const computedNormals = this.computeNormals(totalPositions, totalIndices);
            // Normals will already point in the correct direction due to reversed winding
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
}