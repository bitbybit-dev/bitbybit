export class DrawCore {

    detectPoint(entity: any): boolean {
        return (Array.isArray(entity) && entity.length === 3 && this.checkIfElementsInArrayAreNumbers(entity));
    }

    detectPoints(entity: any): boolean {
        return Array.isArray(entity) &&
            this.checkIfElementsInArrayAreArrays(entity) &&
            this.arraysInChildrenArraysContainNumbers(entity) &&
            this.arraysInChildrenArraysAreOfLength3(entity);
    }

    detectLine(entity: any): boolean {
        return entity.start && entity.end && Array.isArray(entity.start) && Array.isArray(entity.end);
    }

    detectLines(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectLine(el));
    }

    detectPolyline(entity: any): boolean {
        return entity.points && Array.isArray(entity.points);
    }

    detectPolylines(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectPolyline(el));
    }

    detectNode(entity: any): boolean {
        return !Array.isArray(entity) && entity.id && entity.id.includes("node");
    }

    detectNodes(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectNode(el));
    }

    detectVerbCurve(entity: any): boolean {
        return !Array.isArray(entity) && entity._data && entity._data.controlPoints && entity._data.knots && entity._data.degree;
    }

    detectVerbSurface(entity: any): boolean {
        return !Array.isArray(entity) && entity._data && entity._data.controlPoints && entity._data.degreeU && entity._data.degreeV && entity._data.knotsU && entity._data.knotsV;
    }

    detectVerbCurves(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectVerbCurve(el));
    }

    detectVerbSurfaces(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectVerbSurface(el));
    }

    detectJscadMesh(entity: any): boolean {
        return !Array.isArray(entity) && (entity.sides || entity.polygons);
    }

    detectJscadMeshes(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectJscadMesh(el));
    }

    detectOcctShape(entity: any): boolean {
        return entity?.type === "occ-shape";
    }

    detectOcctShapes(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectOcctShape(el));
    }

    detectTag(entity: any): boolean {
        return !Array.isArray(entity) && entity.text;
    }

    detectTags(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectTag(el));
    }

    checkIfElementsInArrayAreNumbers(array: any[]): boolean {
        return !array.some(el => isNaN(el));
    }

    checkIfElementsInArrayAreArrays(array: any[]): boolean {
        return !array.some(el => !Array.isArray(el));
    }

    arraysInChildrenArraysContainNumbers(array: any[]) {
        return !array.some(el => !this.checkIfElementsInArrayAreNumbers(el));
    }

    arraysInChildrenArraysAreOfLength3(array: any[]) {
        return !array.some(el => el.length !== 3);
    }
}