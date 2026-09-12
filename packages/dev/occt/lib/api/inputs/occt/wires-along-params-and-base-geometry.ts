// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

/**
 * A face, a direction and a fraction for `shapes.face.wireAlongParam`, which draws a wire across
 * the face along one parameter line.
 */
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
     * The face the wire is drawn on.
     * @default undefined
     */
    shape!: T;
    /**
     * When true the wire sits at a fixed U and runs across the V range; when false the roles swap.
     * @default true
     */
    isU = true;
    /**
     * Where the wire sits, as a fraction from 0 to 1 of the fixed direction's range.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param = 0.5;
}

/**
 * A face, a direction and several fractions for `shapes.face.wiresAlongParams`, which draws one
 * wire across the face per fraction.
 */
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
     * The face the wires are drawn on.
     * @default undefined
     */
    shape!: T;
    /**
     * When true each wire sits at a fixed U and runs across the V range; when false the roles swap.
     * @default true
     */
    isU = true;
    /**
     * Where the wires sit, as fractions from 0 to 1 of the fixed direction's range, one wire each.
     * @default undefined
     */
    params!: number[];
}

/**
 * A face and one UV position for `shapes.face.pointOnUV`, `normalOnUV` and `uvOnFace`.
 */
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
     * The face to evaluate.
     * @default undefined
     */
    shape!: T;
    /**
     * The U position as a fraction from 0 to 1 of the face's U range.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    paramU = 0.5;
    /**
     * The V position as a fraction from 0 to 1 of the face's V range.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    paramV = 0.5;
}
/**
 * A face and several UV positions for `shapes.face.pointsOnUVs` and `normalsOnUVs`.
 */
export class DataOnUVsDto<T> {
    /**
     * Provide options without default values
     */
    constructor(shape?: T, paramsUV?: [number, number][]) {
        if (shape !== undefined) { this.shape = shape; }
        if (paramsUV !== undefined) { this.paramsUV = paramsUV; }
    }
    /**
     * The face to evaluate.
     * @default undefined
     */
    shape!: T;
    /**
     * The positions as `[u, v]` pairs, each a fraction from 0 to 1 of the face's range, one result
     * each.
     * @default [[0.5, 0.5]]
     */
    paramsUV: [number, number][] = [[0.5, 0.5]];
}
/**
 * Corner points for `shapes.wire.createPolygonWire`, `shapes.face.createPolygonFace` and
 * `shapes.edge.fromPoints`, a closed outline through them.
 */
export class PolygonDto {
    constructor(points?: Base.Point3[]) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The corners in order; the outline closes from the last back to the first.
     * @default undefined
     */
    points!: Base.Point3[];
}
/**
 * Several polygon definitions for `shapes.wire.createPolygons`, which builds one closed wire per
 * polygon.
 */
export class PolygonsDto {
    constructor(polygons?: PolygonDto[], returnCompound?: boolean) {
        if (polygons !== undefined) { this.polygons = polygons; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * One list of corner points per polygon.
     * @default undefined
     */
    polygons!: PolygonDto[];
    /**
     * When true, the wires are packed into one compound instead of a list.
     */
    returnCompound = false;
}
/**
 * Points for `shapes.wire.createPolylineWire`, an open chain of straight edges through them.
 */
export class PolylineDto {
    constructor(points?: Base.Point3[]) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The points in order; the chain stays open between the last and the first.
     * @default undefined
     */
    points!: Base.Point3[];
}
/**
 * A polyline object for `shapes.wire.fromBasePolyline` and `shapes.edge.fromBasePolyline`.
 */
export class PolylineBaseDto {
    constructor(polyline?: Base.Polyline3) {
        if (polyline !== undefined) { this.polyline = polyline; }
    }
    /**
     * The polyline as `{ points, isClosed }`; a closed one also gets the edge back to its first
     * point.
     * @default undefined
     */
    polyline!: Base.Polyline3;
}
/**
 * Several polyline objects, one wire each; currently unused by the library.
 */
export class PolylinesBaseDto {
    constructor(polylines?: Base.Polyline3[]) {
        if (polylines !== undefined) { this.polylines = polylines; }
    }
    /**
     * The polylines as `{ points, isClosed }` objects.
     * @default undefined
     */
    polylines!: Base.Polyline3[];
}
/**
 * A line object for `shapes.wire.fromBaseLine` and `shapes.edge.fromBaseLine`.
 */
export class LineBaseDto {
    constructor(line?: Base.Line3) {
        if (line !== undefined) { this.line = line; }
    }
    /**
     * The line as `{ start, end }`.
     * @default undefined
     */
    line!: Base.Line3;
}
/**
 * Several line objects for `shapes.wire.fromBaseLines` and `shapes.edge.fromBaseLines`, one result
 * each.
 */
export class LinesBaseDto {
    constructor(lines?: Base.Line3[]) {
        if (lines !== undefined) { this.lines = lines; }
    }
    /**
     * The lines as `{ start, end }` objects, in the order the results should come back.
     * @default undefined
     */
    lines!: Base.Line3[];
}
/**
 * A segment, a pair of points, for `shapes.wire.fromBaseSegment` and `shapes.edge.fromBaseSegment`.
 */
export class SegmentBaseDto {
    constructor(segment?: Base.Segment3) {
        if (segment !== undefined) { this.segment = segment; }
    }
    /**
     * The segment as a pair of points, `[start, end]`.
     * @default undefined
     */
    segment!: Base.Segment3;
}
/**
 * Several segments for `shapes.wire.fromBaseSegments` and `shapes.edge.fromBaseSegments`, one
 * result each.
 */
export class SegmentsBaseDto {
    constructor(segments?: Base.Segment3[]) {
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The segments as pairs of points, `[start, end]`, in the order the results should come back.
     * @default undefined
     */
    segments!: Base.Segment3[];
}
/**
 * A triangle for `shapes.face.fromBaseTriangle`, `shapes.wire.fromBaseTriangle` and
 * `shapes.edge.fromBaseTriangle`.
 */
export class TriangleBaseDto {
    constructor(triangle?: Base.Triangle3) {
        if (triangle !== undefined) { this.triangle = triangle; }
    }
    /**
     * The triangle as its three corner points.
     * @default undefined
     */
    triangle!: Base.Triangle3;
}
/**
 * A triangle mesh for `shapes.face.fromBaseMesh`, `shapes.wire.fromBaseMesh` and
 * `shapes.edge.fromBaseMesh`, one result per triangle.
 */
export class MeshBaseDto {
    constructor(mesh?: Base.Mesh3) {
        if (mesh !== undefined) { this.mesh = mesh; }
    }
    /**
     * The mesh as a list of triangles, each three corner points.
     * @default undefined
     */
    mesh!: Base.Mesh3;
}
/**
 * Several polyline definitions for `shapes.wire.createPolylines`, which builds one open wire per
 * polyline.
 */
export class PolylinesDto {
    constructor(polylines?: PolylineDto[], returnCompound?: boolean) {
        if (polylines !== undefined) { this.polylines = polylines; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * One list of points per polyline.
     * @default undefined
     */
    polylines!: PolylineDto[];
    /**
     * When true, the wires are packed into one compound instead of a list.
     */
    returnCompound = false;
}
