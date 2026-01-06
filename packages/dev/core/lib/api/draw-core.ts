/**
 * Base interface for draw options - engine-specific implementations extend this
 */
export interface DrawOptionsBase {
    updatable?: boolean;
    hidden?: boolean;
    opacity?: number;
    colours?: string | string[];
    size?: number;
}

/**
 * Base class for Draw implementations across all game engines.
 * Contains entity detection methods and shared validation utilities.
 */
export class DrawCore {

    // ============== Entity Detection Methods ==============

    detectPoint(entity: unknown): boolean {
        return (Array.isArray(entity) && entity.length === 3 && this.checkIfElementsInArrayAreNumbers(entity));
    }

    detectPoints(entity: unknown): boolean {
        return Array.isArray(entity) &&
            this.checkIfElementsInArrayAreArrays(entity) &&
            this.arraysInChildrenArraysContainNumbers(entity) &&
            this.arraysInChildrenArraysAreOfLength3(entity);
    }

    detectLine(entity: unknown): boolean {
        if (!entity || typeof entity !== "object") return false;
        const obj = entity as Record<string, unknown>;
        return (obj.start && obj.end && Array.isArray(obj.start) && Array.isArray(obj.end)) || 
               (Array.isArray(entity) && entity.length === 2 && 
                Array.isArray(entity[0]) && Array.isArray(entity[1]) && 
                this.checkIfElementsInArrayAreNumbers(entity[0]) && entity[0].length === 3 && 
                this.checkIfElementsInArrayAreNumbers(entity[1]) && entity[1].length === 3);
    }

    detectLines(entity: unknown): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectLine(el));
    }

    detectPolyline(entity: unknown): boolean {
        if (!entity || typeof entity !== "object") return false;
        const obj = entity as Record<string, unknown>;
        return obj.points !== undefined && Array.isArray(obj.points);
    }

    detectPolylines(entity: unknown): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectPolyline(el));
    }

    detectNode(entity: unknown): boolean {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        return typeof obj.id === "string" && obj.id.includes("node");
    }

    detectNodes(entity: unknown): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectNode(el));
    }

    detectVerbCurve(entity: unknown): boolean {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        const data = obj._data as Record<string, unknown> | undefined;
        return data !== undefined && data.controlPoints !== undefined && data.knots !== undefined && data.degree !== undefined;
    }

    detectVerbSurface(entity: unknown): boolean {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        const data = obj._data as Record<string, unknown> | undefined;
        return data !== undefined && data.controlPoints !== undefined && 
               data.degreeU !== undefined && data.degreeV !== undefined && 
               data.knotsU !== undefined && data.knotsV !== undefined;
    }

    detectVerbCurves(entity: unknown): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectVerbCurve(el));
    }

    detectVerbSurfaces(entity: unknown): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectVerbSurface(el));
    }

    detectJscadMesh(entity: unknown): boolean {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        return obj.sides !== undefined || obj.polygons !== undefined;
    }

    detectJscadMeshes(entity: unknown): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectJscadMesh(el));
    }

    detectOcctShape(entity: unknown): boolean {
        if (!entity || typeof entity !== "object") return false;
        const obj = entity as Record<string, unknown>;
        return obj.type === "occ-shape";
    }

    detectOcctShapes(entity: unknown): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectOcctShape(el));
    }

    detectManifoldShape(entity: unknown): boolean {
        if (!entity || typeof entity !== "object") return false;
        const obj = entity as Record<string, unknown>;
        return obj.type === "manifold-shape";
    }

    detectManifoldShapes(entity: unknown): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectManifoldShape(el));
    }

    detectTag(entity: unknown): boolean {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        return obj.text !== undefined;
    }

    detectTags(entity: unknown): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectTag(el));
    }

    // ============== Array Validation Helpers ==============

    checkIfElementsInArrayAreNumbers(array: unknown[]): boolean {
        return !array.some(el => typeof el !== "number" || isNaN(el));
    }

    checkIfElementsInArrayAreArrays(array: unknown[]): boolean {
        return !array.some(el => !Array.isArray(el));
    }

    arraysInChildrenArraysContainNumbers(array: unknown[][]): boolean {
        return !array.some(el => !this.checkIfElementsInArrayAreNumbers(el));
    }

    arraysInChildrenArraysAreOfLength3(array: unknown[][]): boolean {
        return !array.some(el => el.length !== 3);
    }

    // ============== Input Validation Methods ==============

    /**
     * Validate if draw input contains valid entity data
     * @param entity - Entity to validate
     * @returns True if valid, false otherwise
     */
    protected isValidDrawInput(entity: unknown): boolean {
        // Null or undefined
        if (entity === null || entity === undefined) {
            return false;
        }
        
        // Empty array
        if (Array.isArray(entity) && entity.length === 0) {
            return false;
        }
        
        return true;
    }

    /**
     * Type guard for Tag DTO
     * @param value - Value to check
     * @returns True if value has text property (TagDto)
     */
    protected isTagDto(value: unknown): boolean {
        return value !== null && 
               value !== undefined && 
               typeof value === "object" && 
               "text" in (value as object);
    }

    /**
     * Type guard for Tag DTO array
     * @param value - Value to check
     * @returns True if value is array of TagDtos
     */
    protected isTagDtoArray(value: unknown): boolean {
        return Array.isArray(value) && 
               value.length > 0 && 
               this.isTagDto(value[0]);
    }
}