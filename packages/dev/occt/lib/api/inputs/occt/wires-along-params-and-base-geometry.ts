// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

export class WireAlongParamDto<T> {
    /**
     * Provide options without default values
     */
    constructor(shape?: T, isU?: boolean, param?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (isU !== undefined) { this.isU = isU; }
        if (param !== undefined) { this.param = param; }
    }
    /**
     * Brep OpenCascade geometry
     * @default undefined
     */
    shape!: T;
    /**
     * Linear subdivision direction true - U, false - V
     * @default true
     */
    isU = true;
    /**
     * Param on direction 0 - 1
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param = 0.5;
}

export class WiresAlongParamsDto<T> {
    /**
     * Provide options without default values
     */
    constructor(shape?: T, isU?: boolean, params?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (isU !== undefined) { this.isU = isU; }
        if (params !== undefined) { this.params = params; }
    }
    /**
     * Brep OpenCascade geometry
     * @default undefined
     */
    shape!: T;
    /**
     * Linear subdivision direction true - U, false - V
     * @default true
     */
    isU = true;
    /**
     * Params on direction 0 - 1
     * @default undefined
     */
    params!: number[];
}

export class DataOnUVDto<T> {
    /**
     * Provide options without default values
     */
    constructor(shape?: T, paramU?: number, paramV?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (paramU !== undefined) { this.paramU = paramU; }
        if (paramV !== undefined) { this.paramV = paramV; }
    }
    /**
     * Brep OpenCascade geometry
     * @default undefined
     */
    shape!: T;
    /**
     * Param on U direction 0 to 1
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    paramU = 0.5;
    /**
     * Param on V direction 0 to 1
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    paramV = 0.5;
}
export class DataOnUVsDto<T> {
    /**
     * Provide options without default values
     */
    constructor(shape?: T, paramsUV?: [number, number][]) {
        if (shape !== undefined) { this.shape = shape; }
        if (paramsUV !== undefined) { this.paramsUV = paramsUV; }
    }
    /**
     * Brep OpenCascade geometry
     * @default undefined
     */
    shape!: T;
    /**
     * Params uv
     * @default [[0.5, 0.5]]
     */
    paramsUV: [number, number][] = [[0.5, 0.5]];
}
export class PolygonDto {
    constructor(points?: Base.Point3[]) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * Points points
     * @default undefined
     */
    points!: Base.Point3[];
}
export class PolygonsDto {
    constructor(polygons?: PolygonDto[], returnCompound?: boolean) {
        if (polygons !== undefined) { this.polygons = polygons; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * Polygons
     * @default undefined
     */
    polygons!: PolygonDto[];
    /**
     * Indicates whether the shapes should be returned as a compound
     */
    returnCompound = false;
}
export class PolylineDto {
    constructor(points?: Base.Point3[]) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * Points points
     * @default undefined
     */
    points!: Base.Point3[];
}
export class PolylineBaseDto {
    constructor(polyline?: Base.Polyline3) {
        if (polyline !== undefined) { this.polyline = polyline; }
    }
    /**
     * Polyline
     * @default undefined
     */
    polyline!: Base.Polyline3;
}
export class PolylinesBaseDto {
    constructor(polylines?: Base.Polyline3[]) {
        if (polylines !== undefined) { this.polylines = polylines; }
    }
    /**
     * Polylines
     * @default undefined
     */
    polylines!: Base.Polyline3[];
}
export class LineBaseDto {
    constructor(line?: Base.Line3) {
        if (line !== undefined) { this.line = line; }
    }
    /**
     * Line
     * @default undefined
     */
    line!: Base.Line3;
}
export class LinesBaseDto {
    constructor(lines?: Base.Line3[]) {
        if (lines !== undefined) { this.lines = lines; }
    }
    /**
     * Lines
     * @default undefined
     */
    lines!: Base.Line3[];
}
export class SegmentBaseDto {
    constructor(segment?: Base.Segment3) {
        if (segment !== undefined) { this.segment = segment; }
    }
    /**
     * Segment
     * @default undefined
     */
    segment!: Base.Segment3;
}
export class SegmentsBaseDto {
    constructor(segments?: Base.Segment3[]) {
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Segments
     * @default undefined
     */
    segments!: Base.Segment3[];
}
export class TriangleBaseDto {
    constructor(triangle?: Base.Triangle3) {
        if (triangle !== undefined) { this.triangle = triangle; }
    }
    /**
     * Triangle
     * @default undefined
     */
    triangle!: Base.Triangle3;
}
export class MeshBaseDto {
    constructor(mesh?: Base.Mesh3) {
        if (mesh !== undefined) { this.mesh = mesh; }
    }
    /**
     * Mesh
     * @default undefined
     */
    mesh!: Base.Mesh3;
}
export class PolylinesDto {
    constructor(polylines?: PolylineDto[], returnCompound?: boolean) {
        if (polylines !== undefined) { this.polylines = polylines; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * Polylines
     * @default undefined
     */
    polylines!: PolylineDto[];
    /**
     * Indicates whether the shapes should be returned as a compound
     */
    returnCompound = false;
}
