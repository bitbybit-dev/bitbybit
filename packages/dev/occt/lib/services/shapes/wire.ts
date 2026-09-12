import { TopoDS_Face, BitbybitOcctModule, TopoDS_Wire, TopoDS_Compound, TopoDS_Shape, TopoDS_Edge } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

/**
 * Wires in OpenCascade: chains of edges joined end to end, open like a path or closed like an
 * outline. Build them from points and curves (polylines, B-splines, Beziers, interpolations,
 * helices, spirals), as ready-made flat outlines (circles, rectangles, stars, beam profiles, text)
 * that lie on the ground plane unless `direction` says otherwise, or by joining and splitting
 * existing edges and wires; read them back as points, tangents, lengths and centers; map them onto
 * faces or project them onto shapes. Parameters along a wire run from 0 at its start to 1 at its
 * end and follow each edge's own parameter, not distance. A closed wire is what `shapes.face` fills
 * to make a face.
 */
export class OCCTWire {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Rebuilds every edge of a wire as a B-spline of a given degree, within a tolerance, and joins
     * the results back into a wire.
     *
     * Lowering the degree simplifies the curves, raising it gives later operations more freedom;
     * either way each new curve stays within `tolerance` of the old.
     * @param inputs - The wire, the degree to rebuild to and the tolerance
     * @returns A new wire with the rebuilt edges
     * @group rebuild
     * @shortname rebuild wire degree
     * @drawable true
     * @example
     * ```typescript
     * const simpler = await bitbybit.occt.shapes.wire.rebuildWireDegree({ shape: wire, degree: 3, tolerance: 1e-3 });
     * ```
     */
    rebuildWireDegree(inputs: Inputs.OCCT.RebuildCurveDegreeDto<TopoDS_Wire>): TopoDS_Wire {
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const rebuilt = edges.map((e) => this.occ.RebuildEdgeDegree(e, inputs.degree, inputs.tolerance));
        return this.och.converterService.combineEdgesAndWiresIntoAWire({ shapes: rebuilt });
    }

    /**
     * Moves the seam of a closed periodic wire, the point where it starts and ends, to a given
     * parameter along its curve.
     *
     * The geometry does not change; only where the wire is considered to begin. Meant for
     * single-edge wires such as circles: each periodic edge is moved, edges that are not periodic
     * stay as they are.
     * @param inputs - The periodic wire and the parameter of the new seam
     * @returns A new wire starting at the seam
     * @group seam
     * @shortname move wire seam by param
     * @drawable true
     * @example
     * ```typescript
     * const rotated = await bitbybit.occt.shapes.wire.moveWireSeamByParameter({ shape: circle, parameter: 1.57 });
     * ```
     */
    moveWireSeamByParameter(inputs: Inputs.OCCT.CurveSeamByParameterDto<TopoDS_Wire>): TopoDS_Wire {
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const moved = edges.map((e) => this.occ.MoveSeamByParameter(e, inputs.parameter));
        return this.och.converterService.combineEdgesAndWiresIntoAWire({ shapes: moved });
    }

    /**
     * Moves the seam of a closed periodic wire, the point where it starts and ends, by a distance
     * along the curve from its current start.
     *
     * The geometry does not change; only where the wire is considered to begin. Meant for
     * single-edge wires such as circles: each periodic edge is moved, edges that are not periodic
     * stay as they are.
     * @param inputs - The periodic wire and the distance to move the seam
     * @returns A new wire starting at the seam
     * @group seam
     * @shortname move wire seam by length
     * @drawable true
     * @example
     * ```typescript
     * const rotated = await bitbybit.occt.shapes.wire.moveWireSeamByLength({ shape: circle, length: 2.5 });
     * ```
     */
    moveWireSeamByLength(inputs: Inputs.OCCT.CurveSeamByLengthDto<TopoDS_Wire>): TopoDS_Wire {
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const moved = edges.map((e) => this.occ.MoveSeamByLength(e, inputs.length));
        return this.och.converterService.combineEdgesAndWiresIntoAWire({ shapes: moved });
    }

    /**
     * Collects diagnostic facts about a wire: how many edges it has, whether it is closed, its
     * total length and, for every edge, the curve report `shapes.edge.debugInfo` gives.
     *
     * An empty or null wire gives a report marked invalid with zero counts.
     * @param inputs - The wire to inspect
     * @returns The report with the edge count, the closed flag, the length and one entry per edge
     * @group debug
     * @shortname wire debug info
     * @drawable false
     * @example
     * ```typescript
     * const info = await bitbybit.occt.shapes.wire.debugInfo({ shape: wire });
     * console.log(info.nbEdges, info.closed, info.totalLength);
     * ```
     */
    debugInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Models.OCCT.WireDebugInfo {
        if (!inputs.shape || inputs.shape.IsNull()) {
            return { valid: false, nbEdges: 0, closed: false, totalLength: 0, edges: [] };
        }
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const edgeInfos = edges.map((e) => JSON.parse(this.occ.EdgeDebugInfoJson(e)) as Models.OCCT.EdgeDebugInfo);
        const totalLength = edgeInfos.reduce((sum, e) => sum + (e.length ?? 0), 0);
        const closed = this.och.wiresService.isWireClosed({ shape: inputs.shape });
        return { valid: true, nbEdges: edges.length, closed, totalLength, edges: edgeInfos };
    }

    /**
     * Makes a straight single-edge wire from a line object of the form `{ start, end }`.
     * @param inputs - The line
     * @returns The straight wire
     * @group from base
     * @shortname wire from base line
     * @drawable true
     * @example
     * ```typescript
     * const wire = await bitbybit.occt.shapes.wire.fromBaseLine({ line: { start: [0, 0, 0], end: [10, 0, 0] } });
     * ```
     */
    fromBaseLine(inputs: Inputs.OCCT.LineBaseDto): TopoDS_Wire {
        return this.createLineWire(inputs.line);
    }

    /**
     * Makes one straight single-edge wire per line object of the form `{ start, end }`.
     * @param inputs - The lines
     * @returns One wire per line, in the same order
     * @group from base
     * @shortname wires from base lines
     * @drawable true
     * @example
     * ```typescript
     * const wires = await bitbybit.occt.shapes.wire.fromBaseLines({ lines: [{ start: [0, 0, 0], end: [10, 0, 0] }, { start: [10, 0, 0], end: [10, 10, 0] }] });
     * ```
     */
    fromBaseLines(inputs: Inputs.OCCT.LinesBaseDto): TopoDS_Wire[] {
        return inputs.lines.map(line => this.createLineWire(line));
    }

    /**
     * Makes a straight single-edge wire from a segment, a pair of points `[start, end]`.
     * @param inputs - The segment
     * @returns The straight wire
     * @group from base
     * @shortname wire from base segment
     * @drawable true
     * @example
     * ```typescript
     * const wire = await bitbybit.occt.shapes.wire.fromBaseSegment({ segment: [[0, 0, 0], [10, 0, 0]] });
     * ```
     */
    fromBaseSegment(inputs: Inputs.OCCT.SegmentBaseDto): TopoDS_Wire {
        return this.createLineWire({ start: inputs.segment[0], end: inputs.segment[1] });
    }

    /**
     * Makes one straight single-edge wire per segment, each a pair of points `[start, end]`.
     * @param inputs - The segments
     * @returns One wire per segment, in the same order
     * @group from base
     * @shortname wires from base segments
     * @drawable true
     * @example
     * ```typescript
     * const wires = await bitbybit.occt.shapes.wire.fromBaseSegments({ segments: [[[0, 0, 0], [10, 0, 0]], [[10, 0, 0], [10, 10, 0]]] });
     * ```
     */
    fromBaseSegments(inputs: Inputs.OCCT.SegmentsBaseDto): TopoDS_Wire[] {
        return inputs.segments.map(segment => this.createLineWire({ start: segment[0], end: segment[1] }));
    }

    /**
     * Joins a list of points in order with straight edges into one open wire.
     *
     * Fewer than two points throw an error. For a closed outline use `createPolygonWire`, which
     * adds the edge back to the first point.
     * @param inputs - The points, in order
     * @returns The wire through the points
     * @group from base
     * @shortname wire from points
     * @drawable true
     * @example
     * ```typescript
     * const path = await bitbybit.occt.shapes.wire.fromPoints({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] });
     * ```
     */
    fromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Wire {
        let wire: TopoDS_Wire | undefined;
        if (inputs.points.length > 1) {
            const start = inputs.points[0]!;
            const end = inputs.points[1]!;
            if (this.och.base.point.twoPointsAlmostEqual({ point1: start, point2: end })) {
                wire = this.createPolygonWire({ points: inputs.points });
            } else {
                wire = this.createPolylineWire({ points: inputs.points });
            }
        }
        if (!wire) {
            throw new Error("At least two points are required");
        }
        return wire;
    }

    /**
     * Makes a wire from a polyline object, one straight edge per segment; a polyline marked closed
     * also gets the edge from its last point back to its first.
     * @param inputs - The polyline
     * @returns The wire
     * @group from base
     * @shortname wire from polyline
     * @drawable true
     * @example
     * ```typescript
     * const outline = await bitbybit.occt.shapes.wire.fromBasePolyline({ polyline: { points: [[0, 0, 0], [10, 0, 0], [10, 0, 10]], isClosed: true } });
     * ```
     */
    fromBasePolyline(inputs: Inputs.OCCT.PolylineBaseDto): TopoDS_Wire {
        let wire;
        if (inputs.polyline.isClosed) {
            wire = this.createPolygonWire({ points: inputs.polyline.points });
        } else {
            wire = this.createPolylineWire({ points: inputs.polyline.points });
        }
        return wire;
    }

    /**
     * Makes a closed three-edge wire from a triangle given as three points.
     * @param inputs - The triangle
     * @returns The closed wire
     * @group from base
     * @shortname wire from triangle
     * @drawable true
     * @example
     * ```typescript
     * const outline = await bitbybit.occt.shapes.wire.fromBaseTriangle({ triangle: [[0, 0, 0], [10, 0, 0], [0, 0, 10]] });
     * ```
     */
    fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto): TopoDS_Wire {
        const points = inputs.triangle;
        return this.fromBasePolyline({ polyline: { points, isClosed: true } });
    }

    /**
     * Makes one closed three-edge wire per triangle of a mesh.
     *
     * A triangle whose wire cannot be built is skipped with a warning rather than stopping the
     * rest.
     * @param inputs - The mesh as a list of triangles
     * @returns One wire per triangle that could be built
     * @group from base
     * @shortname wires from mesh
     * @drawable true
     * @example
     * ```typescript
     * const outlines = await bitbybit.occt.shapes.wire.fromBaseMesh({ mesh: triangles });
     * ```
     */
    fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto): TopoDS_Wire[] {
        const wires: TopoDS_Wire[] = [];
        inputs.mesh.forEach((triangle) => {
            try {
                wires.push(this.fromBaseTriangle({ triangle }));
            } catch {
                console.warn("Failed to make wire for triangle", triangle);
            }
        });
        return wires.flat();
    }

    /**
     * Makes a closed wire of straight edges through a list of corner points, adding the edge from
     * the last point back to the first.
     *
     * The points need not lie in one plane; a flat face needs a planar outline though.
     * @param inputs - The corner points, in order
     * @returns The closed wire
     * @group via points
     * @shortname polygon
     * @drawable true
     * @example
     * ```typescript
     * const square = await bitbybit.occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]] });
     * ```
     */
    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): TopoDS_Wire {
        return this.och.wiresService.createPolygonWire(inputs);
    }

    /**
     * Makes one closed polygon wire per point list, as `createPolygonWire` does.
     *
     * With `returnCompound` true the wires are packed into one compound shape instead of a list.
     * @param inputs - The polygons and whether to pack them into a compound
     * @returns The wires in order, or one compound holding them
     * @group multiple
     * @shortname polygons
     * @drawable true
     * @example
     * ```typescript
     * const outlines = await bitbybit.occt.shapes.wire.createPolygons({
     *     polygons: [{ points: [[0, 0, 0], [5, 0, 0], [5, 0, 5]] }, { points: [[10, 0, 0], [15, 0, 0], [15, 0, 5]] }],
     *     returnCompound: false,
     * });
     * ```
     */
    createPolygons(inputs: Inputs.OCCT.PolygonsDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.polygons.map(p => this.createPolygonWire(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Makes a straight single-edge wire between two points.
     * @param inputs - The start and end points
     * @returns The straight wire
     * @group via points
     * @shortname line
     * @drawable true
     * @example
     * ```typescript
     * const line = await bitbybit.occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] });
     * ```
     */
    createLineWire(inputs: Inputs.OCCT.LineDto): TopoDS_Wire {
        return this.och.wiresService.createLineWire(inputs);
    }

    /**
     * Makes a straight single-edge wire between two points and lengthens it beyond each of them.
     *
     * `extensionStart` and `extensionEnd` are distances in model units added past the start and the
     * end along the line; the two points must differ or an error is thrown.
     * @param inputs - The start and end points and the two extension lengths
     * @returns The extended straight wire
     * @group via points
     * @shortname line with extensions
     * @drawable true
     * @example
     * ```typescript
     * const longer = await bitbybit.occt.shapes.wire.createLineWireWithExtensions({ start: [0, 0, 0], end: [10, 0, 0], extensionStart: 2, extensionEnd: 5 });
     * ```
     */
    createLineWireWithExtensions(inputs: Inputs.OCCT.LineWithExtensionsDto): TopoDS_Wire {
        return this.och.wiresService.createLineWireWithExtensions(inputs);
    }

    /**
     * Makes one straight single-edge wire per line definition.
     *
     * With `returnCompound` true the wires are packed into one compound shape instead of a list.
     * @param inputs - The lines and whether to pack them into a compound
     * @returns The wires in order, or one compound holding them
     * @group multiple
     * @shortname lines
     * @drawable true
     * @example
     * ```typescript
     * const lines = await bitbybit.occt.shapes.wire.createLines({
     *     lines: [{ start: [0, 0, 0], end: [10, 0, 0] }, { start: [0, 0, 5], end: [10, 0, 5] }],
     *     returnCompound: false,
     * });
     * ```
     */
    createLines(inputs: Inputs.OCCT.LinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.lines.map(p => this.createLineWire(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Cuts a wire into pieces at the given points.
     *
     * Each point is moved to the closest place on the wire before cutting, so it need not lie
     * exactly on it; repeated points are ignored. The pieces come back in order along the wire,
     * from its start to its end.
     * @param inputs - The wire and the points to cut at
     * @returns The pieces of the wire, in order
     * @group extract
     * @shortname split on points
     * @drawable true
     * @example
     * ```typescript
     * const pieces = await bitbybit.occt.shapes.wire.splitOnPoints({ shape: wire, points: [[3, 0, 0], [7, 0, 0]] });
     * ```
     */
    splitOnPoints(inputs: Inputs.OCCT.SplitWireOnPointsDto<TopoDS_Wire>): TopoDS_Wire[] {
        return this.och.wiresService.splitOnPoints(inputs);
    }

    /**
     * Turns every wire of a shape into a run of points that follows its curves closely enough to
     * draw it, one list per wire.
     *
     * The deflection settings say how tightly the points hug curved edges; where one edge ends and
     * the next begins the shared point appears once.
     * @param inputs - The shape and the deflection settings
     * @returns One list of points per wire
     * @group extract
     * @shortname wires to points
     * @drawable false
     * @example
     * ```typescript
     * const polylines = await bitbybit.occt.shapes.wire.wiresToPoints({
     *     shape: wire,
     *     angularDeflection: 0.1,
     *     curvatureDeflection: 0.1,
     *     minimumOfPoints: 2,
     *     uTolerance: 1e-9,
     *     minimumLength: 1e-7,
     * });
     * ```
     */
    wiresToPoints(inputs: Inputs.OCCT.WiresToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.wiresService.wiresToPoints(inputs);
    }

    /**
     * Makes an open wire of straight edges through a list of points, in order.
     *
     * The wire is not closed; `createPolygonWire` adds the edge back to the first point.
     * @param inputs - The points, in order
     * @returns The open wire
     * @group via points
     * @shortname polyline
     * @drawable true
     * @example
     * ```typescript
     * const path = await bitbybit.occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 0, 10]] });
     * ```
     */
    createPolylineWire(inputs: Inputs.OCCT.PolylineDto): TopoDS_Wire {
        return this.och.wiresService.createPolylineWire(inputs);
    }

    /**
     * Draws a zig-zag line that bounces between two wires: both are divided into the same number of
     * points and a polyline visits them alternately.
     *
     * `nrZigZags` sets the number of bounces; `inverse` starts on the second wire;
     * `divideByEqualDistance` spaces the points by length rather than by parameter; with
     * `zigZagsPerEdge` true each edge gets its own zig-zag, so edge counts must match.
     * @param inputs - The two wires, the number of zig-zags and the spacing options
     * @returns The zig-zag wire
     * @group via wires
     * @shortname zig zag between two wires
     * @drawable true
     * @example
     * ```typescript
     * const zigzag = await bitbybit.occt.shapes.wire.createZigZagBetweenTwoWires({ wire1: lower, wire2: upper, nrZigZags: 20, inverse: false, divideByEqualDistance: true, zigZagsPerEdge: false });
     * ```
     */
    createZigZagBetweenTwoWires(inputs: Inputs.OCCT.ZigZagBetweenTwoWiresDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.createZigZagBetweenTwoWires(inputs);
    }

    /**
     * Connects the start points of several wires or edges into one new wire and their end points
     * into another.
     *
     * `wireType` makes them polylines or smooth interpolated curves, `closed` joins the last point
     * back to the first, and `tolerance` is used for the interpolation. Fewer than two shapes throw
     * an error.
     * @param inputs - The wires or edges, the kind of wire to build, whether to close it and the tolerance
     * @returns Two wires: one through the start points, one through the end points
     * @group via wires
     * @shortname wires between start end points
     * @drawable true
     * @example
     * ```typescript
     * const [starts, ends] = await bitbybit.occt.shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges({
     *     shapes: [wireA, wireB, wireC],
     *     wireType: Bit.Inputs.OCCT.wireFromPointsTypeEnum.interpolated,
     *     closed: false,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    createWiresBetweenStartEndPointsOfWiresAndEdges(inputs: Inputs.OCCT.WiresBetweenStartEndPointsOfWiresAndEdgesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire[] {
        return this.och.wiresService.createWiresBetweenStartEndPointsOfWiresAndEdges(inputs);
    }

    /**
     * Divides several wires or edges into the same number of points and connects the points at each
     * position into a new wire, like the rungs of a ladder.
     *
     * `nrOfDivisions` steps give one rung more than that; `divideByEqualDistance` spaces the points
     * by length rather than by parameter; `wireType` makes the rungs polylines or smooth curves,
     * `closed` joins each into a loop.
     * @param inputs - The wires or edges, the number of divisions, the spacing, the kind of wire to build, whether to close it and the tolerance
     * @returns One wire per division point, in order along the shapes
     * @group via wires
     * @shortname wires between subdivided points
     * @drawable true
     * @example
     * ```typescript
     * const rungs = await bitbybit.occt.shapes.wire.createWiresBetweenSubdividedPointsOfWiresAndEdges({
     *     shapes: [rail1, rail2],
     *     nrOfDivisions: 10,
     *     divideByEqualDistance: true,
     *     wireType: Bit.Inputs.OCCT.wireFromPointsTypeEnum.polyline,
     *     closed: false,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    createWiresBetweenSubdividedPointsOfWiresAndEdges(inputs: Inputs.OCCT.WiresBetweenSubdividedPointsOfWiresAndEdgesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire[] {
        return this.och.wiresService.createWiresBetweenSubdividedPointsOfWiresAndEdges(inputs);
    }

    /**
     * Draws a closed outline around two circles that lie in one plane, joining them with tangent
     * lines: a belt or a capsule shape.
     *
     * `keepLines` picks the outer tangent lines (the belt) or the crossing inner ones;
     * `circleRemainders` picks which arc of each circle stays in the outline. Each circle wire must
     * consist of a single edge.
     * @param inputs - The two circle wires, which tangent lines and arcs to keep, and the tolerance
     * @returns The closed outline wire
     * @group via wires
     * @shortname tangent wire from two circles
     * @drawable true
     * @example
     * ```typescript
     * const belt = await bitbybit.occt.shapes.wire.createWireFromTwoCirclesTan({
     *     circle1,
     *     circle2,
     *     keepLines: Bit.Inputs.OCCT.twoSidesStrictEnum.outside,
     *     circleRemainders: Bit.Inputs.OCCT.fourSidesStrictEnum.outside,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    createWireFromTwoCirclesTan(inputs: Inputs.OCCT.WireFromTwoCirclesTanDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.createWireFromTwoCirclesTan(inputs);
    }

    /**
     * Makes one open polyline wire per point list, as `createPolylineWire` does.
     *
     * With `returnCompound` true the wires are packed into one compound shape instead of a list.
     * @param inputs - The polylines and whether to pack them into a compound
     * @returns The wires in order, or one compound holding them
     * @group multiple
     * @shortname polylines
     * @drawable true
     * @example
     * ```typescript
     * const paths = await bitbybit.occt.shapes.wire.createPolylines({
     *     polylines: [{ points: [[0, 0, 0], [5, 0, 0], [5, 0, 5]] }, { points: [[10, 0, 0], [15, 0, 0]] }],
     *     returnCompound: false,
     * });
     * ```
     */
    createPolylines(inputs: Inputs.OCCT.PolylinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.polylines.map(p => this.createPolylineWire(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Makes a smooth Bezier wire steered by control points: it starts at the first point, ends at
     * the last and is pulled toward the ones between without passing through them.
     *
     * `closed` appends the first point again so the ends meet; `periodic` instead builds a closed
     * curve that is smooth across the seam. `degree` caps how many neighbors shape each part.
     * @param inputs - The control points and the closing and degree options
     * @returns The Bezier wire
     * @group via points
     * @shortname bezier
     * @drawable true
     * @example
     * ```typescript
     * const curve = await bitbybit.occt.shapes.wire.createBezier({ points: [[0, 0, 0], [5, 0, 10], [10, 0, -10], [15, 0, 0]], closed: false, periodic: false });
     * ```
     */
    createBezier(inputs: Inputs.OCCT.BezierDto): TopoDS_Wire {
        return this.och.wiresService.createBezier(inputs);
    }

    /**
     * Makes a Bezier wire like `createBezier`, with a weight per control point that says how
     * strongly it pulls the curve.
     *
     * A weight above 1 draws the curve toward its point, below 1 lets it go. The weights must match
     * the points: the same count, or one more when `closed` is true and `periodic` false, as the
     * first point repeats.
     * @param inputs - The control points, their weights and the closing and degree options
     * @returns The weighted Bezier wire
     * @group via points
     * @shortname bezier weights
     * @drawable true
     * @example
     * ```typescript
     * const curve = await bitbybit.occt.shapes.wire.createBezierWeights({
     *     points: [[0, 0, 0], [5, 0, 10], [10, 0, 0]],
     *     weights: [1, 3, 1],
     *     closed: false,
     *     periodic: false,
     * });
     * ```
     */
    createBezierWeights(inputs: Inputs.OCCT.BezierWeightsDto): TopoDS_Wire {
        return this.och.wiresService.createBezierWeights(inputs);
    }

    /**
     * Makes one Bezier wire per definition, as `createBezier` does.
     *
     * With `returnCompound` true the wires are packed into one compound shape instead of a list.
     * @param inputs - The Bezier definitions and whether to pack them into a compound
     * @returns The wires in order, or one compound holding them
     * @group multiple
     * @shortname bezier wires
     * @drawable true
     * @example
     * ```typescript
     * const curves = await bitbybit.occt.shapes.wire.createBezierWires({
     *     bezierWires: [{ points: [[0, 0, 0], [5, 0, 10], [10, 0, 0]], closed: false }, { points: [[0, 0, 5], [5, 0, 15], [10, 0, 5]], closed: false }],
     *     returnCompound: false,
     * });
     * ```
     */
    createBezierWires(inputs: Inputs.OCCT.BezierWiresDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.bezierWires.map(p => this.createBezier(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Makes a smooth B-spline wire that passes through every point in order.
     *
     * `periodic` closes the curve so it is smooth across the seam, which gives nicely shaped loops.
     * `parametrization` controls the spacing between points: `centripetal` resists cusps and
     * overshoot when the points are uneven. `startTangent` and `endTangent`, or one `tangents`
     * entry per point, force the curve's direction there.
     * @param inputs - The points, whether to close the curve, the tolerance, the parametrization and optional tangents
     * @returns The B-spline wire through the points
     * @group via points
     * @shortname interpolate
     * @drawable true
     * @example
     * ```typescript
     * const loop = await bitbybit.occt.shapes.wire.interpolatePoints({
     *     points: [[0, 0, 0], [10, 0, 5], [10, 0, 15], [0, 0, 10]],
     *     periodic: true,
     *     tolerance: 1e-7,
     *     parametrization: Bit.Inputs.OCCT.bSplineParametrizationEnum.centripetal,
     * });
     * ```
     */
    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto): TopoDS_Wire {
        return this.och.wiresService.interpolatePoints(inputs);
    }

    /**
     * Makes a closed, smooth B-spline wire through the points whose shape is mirror-symmetric
     * whenever the points are, with no odd-looking start or end point.
     *
     * A plain periodic `interpolatePoints` can look skewed at its seam for symmetric inputs such as
     * a square or a triangle; this variant does not. It fails with an error if the points cannot be
     * interpolated.
     * @param inputs - The points and the tolerance
     * @returns The closed symmetric B-spline wire
     * @group via points
     * @shortname interpolate symmetric
     * @drawable true
     * @example
     * ```typescript
     * const rounded = await bitbybit.occt.shapes.wire.interpolatePointsSymmetric({ points: [[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]], tolerance: 1e-7 });
     * ```
     */
    interpolatePointsSymmetric(inputs: Inputs.OCCT.InterpolateSymmetricDto): TopoDS_Wire {
        return this.och.wiresService.interpolatePointsSymmetric(inputs);
    }

    /**
     * Makes one interpolated B-spline wire per definition, as `interpolatePoints` does.
     *
     * With `returnCompound` true the wires are packed into one compound shape instead of a list.
     * @param inputs - The interpolation definitions and whether to pack them into a compound
     * @returns The wires in order, or one compound holding them
     * @group multiple
     * @shortname interpolate wires
     * @drawable true
     * @example
     * ```typescript
     * const curves = await bitbybit.occt.shapes.wire.interpolateWires({
     *     interpolations: [{ points: [[0, 0, 0], [5, 0, 5], [10, 0, 0]], periodic: false, tolerance: 1e-7 }, { points: [[0, 0, 5], [5, 0, 10], [10, 0, 5]], periodic: false, tolerance: 1e-7 }],
     *     returnCompound: false,
     * });
     * ```
     */
    interpolateWires(inputs: Inputs.OCCT.InterpolateWiresDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.interpolations.map(p => this.interpolatePoints(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Makes a smooth B-spline wire that approximates a list of points: it follows them closely but
     * need not pass through each one exactly.
     *
     * `closed` appends the first point again so the ends meet. The fit uses a degree between 3 and
     * 8 and a tolerance of 0.001 model units; use `interpolatePoints` when the curve must go
     * through the points.
     * @param inputs - The points and whether to close the curve
     * @returns The B-spline wire
     * @group via points
     * @shortname bspline
     * @drawable true
     * @example
     * ```typescript
     * const curve = await bitbybit.occt.shapes.wire.createBSpline({ points: [[0, 0, 0], [5, 0, 5], [10, 0, 0], [15, 0, 5]], closed: false });
     * ```
     */
    createBSpline(inputs: Inputs.OCCT.BSplineDto): TopoDS_Wire {
        return this.och.wiresService.createBSpline(inputs);
    }

    /**
     * Makes one approximating B-spline wire per definition, as `createBSpline` does.
     *
     * With `returnCompound` true the wires are packed into one compound shape instead of a list.
     * @param inputs - The B-spline definitions and whether to pack them into a compound
     * @returns The wires in order, or one compound holding them
     * @group multiple
     * @shortname bsplines
     * @drawable true
     * @example
     * ```typescript
     * const curves = await bitbybit.occt.shapes.wire.createBSplines({
     *     bSplines: [{ points: [[0, 0, 0], [5, 0, 5], [10, 0, 0]], closed: false }, { points: [[0, 0, 5], [5, 0, 10], [10, 0, 5]], closed: false }],
     *     returnCompound: false,
     * });
     * ```
     */
    createBSplines(inputs: Inputs.OCCT.BSplinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.bSplines.map(p => this.createBSpline(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Joins edges and wires that touch end to end into one wire.
     *
     * The pieces must connect; a set with a gap or a stray piece throws an error. Shapes of other
     * kinds in the list are ignored.
     * @param inputs - The edges and wires to join
     * @returns The joined wire
     * @group build
     * @shortname combine
     * @drawable true
     * @example
     * ```typescript
     * const outline = await bitbybit.occt.shapes.wire.combineEdgesAndWiresIntoAWire({ shapes: [arc, line1, line2] });
     * ```
     */
    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        return this.och.converterService.combineEdgesAndWiresIntoAWire(inputs);
    }

    /**
     * Wraps a single edge into a wire, so it can go where a wire is expected.
     * @param inputs - The edge
     * @returns The wire holding that edge
     * @group build
     * @shortname wire from edge
     * @drawable true
     * @example
     * ```typescript
     * const wire = await bitbybit.occt.shapes.wire.createWireFromEdge({ shape: edge });
     * ```
     */
    createWireFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Wire {
        return this.och.wiresService.createWireFromEdge(inputs);
    }

    /**
     * Extends a wire with more edges and wires that touch it end to end.
     *
     * The pieces must connect to the wire or to each other; a gap throws an error. Shapes of other
     * kinds in the list are ignored.
     * @param inputs - The wire to extend and the edges and wires to add
     * @returns The extended wire
     * @group build
     * @shortname extend
     * @drawable true
     * @example
     * ```typescript
     * const longer = await bitbybit.occt.shapes.wire.addEdgesAndWiresToWire({ shape: wire, shapes: [nextEdge, nextWire] });
     * ```
     */
    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        return this.och.wiresService.addEdgesAndWiresToWire(inputs);
    }

    /**
     * Places points along a wire at equal steps of its parameter, from start to end.
     *
     * `nrOfDivisions` steps give one more point than that; `removeStartPoint` and `removeEndPoint`
     * drop the ends. The parameter follows each edge's own curve parameter, so equal steps are not
     * equal distances; use `divideWireByEqualDistanceToPoints` for those.
     * @param inputs - The wire, the number of divisions and whether to drop the end points
     * @returns The points along the wire, in order
     * @group extract
     * @shortname points by params
     * @drawable true
     * @example
     * ```typescript
     * const points = await bitbybit.occt.shapes.wire.divideWireByParamsToPoints({ shape: wire, nrOfDivisions: 10, removeStartPoint: false, removeEndPoint: false });
     * ```
     */
    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.divideWireByParamsToPoints(inputs);
    }

    /**
     * Runs `divideWireByParamsToPoints` on several wires with the same settings.
     * @param inputs - The wires, the number of divisions and whether to drop the end points
     * @returns One list of points per wire, in the same order
     * @group extract from wires
     * @shortname points by params
     * @drawable true
     * @example
     * ```typescript
     * const lists = await bitbybit.occt.shapes.wire.divideWiresByParamsToPoints({ shapes: wires, nrOfDivisions: 10, removeStartPoint: false, removeEndPoint: false });
     * ```
     */
    divideWiresByParamsToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Wire>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(s => this.divideWireByParamsToPoints({ ...inputs, shape: s }));
    }

    /**
     * Places points along a wire at equal distances measured along its curves, from start to end.
     *
     * `nrOfDivisions` steps give one more point than that; `removeStartPoint` and `removeEndPoint`
     * drop the ends.
     * @param inputs - The wire, the number of divisions and whether to drop the end points
     * @returns The points along the wire, in order
     * @group extract
     * @shortname points by distance
     * @drawable true
     * @example
     * ```typescript
     * const points = await bitbybit.occt.shapes.wire.divideWireByEqualDistanceToPoints({ shape: wire, nrOfDivisions: 10, removeStartPoint: false, removeEndPoint: false });
     * ```
     */
    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.divideWireByEqualDistanceToPoints(inputs);
    }

    /**
     * Runs `divideWireByEqualDistanceToPoints` on several wires with the same settings.
     * @param inputs - The wires, the number of divisions and whether to drop the end points
     * @returns One list of points per wire, in the same order
     * @group extract from wires
     * @shortname points by distance
     * @drawable true
     * @example
     * ```typescript
     * const lists = await bitbybit.occt.shapes.wire.divideWiresByEqualDistanceToPoints({ shapes: wires, nrOfDivisions: 10, removeStartPoint: false, removeEndPoint: false });
     * ```
     */
    divideWiresByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Wire>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(s => this.divideWireByEqualDistanceToPoints({ ...inputs, shape: s }));
    }

    /**
     * Finds the point a fraction of the way along a wire: 0 is the start, 1 the end.
     *
     * The fraction follows the parameters of the edges, not distance, so 0.5 is not always the
     * middle by length; use `pointOnWireAtLength` for a distance.
     * @param inputs - The wire and the fraction from 0 to 1
     * @returns The point on the wire
     * @group extract
     * @shortname point at param
     * @drawable true
     * @example
     * ```typescript
     * const point = await bitbybit.occt.shapes.wire.pointOnWireAtParam({ shape: wire, param: 0.25 });
     * ```
     */
    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.pointOnWireAtParam(inputs);
    }

    /**
     * Finds the point a given distance along a wire from its start, measured along its curves in
     * model units.
     * @param inputs - The wire and the distance from its start
     * @returns The point on the wire
     * @group extract
     * @shortname point at length
     * @drawable true
     * @example
     * ```typescript
     * const point = await bitbybit.occt.shapes.wire.pointOnWireAtLength({ shape: wire, length: 2.5 });
     * ```
     */
    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.pointOnWireAtLength(inputs);
    }

    /**
     * Finds the points at several distances along a wire from its start, measured along its curves
     * in model units.
     * @param inputs - The wire and the distances from its start
     * @returns One point per distance, in the same order
     * @group extract
     * @shortname points at lengths
     * @drawable true
     * @example
     * ```typescript
     * const points = await bitbybit.occt.shapes.wire.pointsOnWireAtLengths({ shape: wire, lengths: [1, 2.5, 4] });
     * ```
     */
    pointsOnWireAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.pointsOnWireAtLengths(inputs);
    }

    /**
     * Places points along a wire every `length` model units from its start, as many as fit.
     *
     * `includeFirst` keeps the point at the start, `includeLast` appends the end point whatever the
     * spacing, and `tryNext` asks for one more point a step beyond the last one that fit.
     * @param inputs - The wire, the spacing and which end points to include
     * @returns The points along the wire, in order
     * @group extract
     * @shortname points at equal length
     * @drawable true
     * @example
     * ```typescript
     * const points = await bitbybit.occt.shapes.wire.pointsOnWireAtEqualLength({ shape: wire, length: 2, tryNext: false, includeFirst: true, includeLast: false });
     * ```
     */
    pointsOnWireAtEqualLength(inputs: Inputs.OCCT.PointsOnWireAtEqualLengthDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.pointsOnWireAtEqualLength(inputs);
    }

    /**
     * Places points along a wire at a repeating pattern of gaps, such as 1, 3, 1, 3, until the wire
     * runs out.
     *
     * `lengths` is the pattern of gaps in model units, repeated from the start; `includeFirst`
     * keeps the start point, `includeLast` appends the end point, and `tryNext` asks for one more
     * point at the next gap past the last.
     * @param inputs - The wire, the pattern of gaps and which end points to include
     * @returns The points along the wire, in order
     * @group extract
     * @shortname points at pattern of lengths
     * @drawable true
     * @example
     * ```typescript
     * const points = await bitbybit.occt.shapes.wire.pointsOnWireAtPatternOfLengths({ shape: wire, lengths: [1, 3], tryNext: false, includeFirst: true, includeLast: false });
     * ```
     */
    pointsOnWireAtPatternOfLengths(inputs: Inputs.OCCT.PointsOnWireAtPatternOfLengthsDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.pointsOnWireAtPatternOfLengths(inputs);
    }

    /**
     * Finds the direction the wire is heading at a fraction of the way along it, from 0 at the
     * start to 1 at the end.
     *
     * The fraction follows the parameters of the edges, not distance.
     * @param inputs - The wire and the fraction from 0 to 1
     * @returns The tangent direction
     * @group extract
     * @shortname tangent at param
     * @drawable true
     * @example
     * ```typescript
     * const tangent = await bitbybit.occt.shapes.wire.tangentOnWireAtParam({ shape: wire, param: 0.5 });
     * ```
     */
    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Inputs.Base.Vector3 {
        return this.och.wiresService.tangentOnWireAtParam(inputs);
    }

    /**
     * Finds the direction the wire is heading at a given distance from its start, measured along
     * its curves in model units.
     * @param inputs - The wire and the distance from its start
     * @returns The tangent direction
     * @group extract
     * @shortname tangent at length
     * @drawable true
     * @example
     * ```typescript
     * const tangent = await bitbybit.occt.shapes.wire.tangentOnWireAtLength({ shape: wire, length: 2.5 });
     * ```
     */
    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Inputs.Base.Vector3 {
        return this.och.wiresService.tangentOnWireAtLength(inputs);
    }

    /**
     * Computes the first, second and third derivatives of a wire's curve at a given distance from
     * its start.
     *
     * The first derivative is the tangent with its speed, the second tells how the curve bends, the
     * third how that bending changes; all are with respect to the curve's parameter. The distance
     * is measured along the curves in model units.
     * @param inputs - The wire and the distance from its start
     * @returns The three derivative vectors, first to third
     * @group extract
     * @shortname derivatives at length
     * @drawable false
     * @example
     * ```typescript
     * const [first, second, third] = await bitbybit.occt.shapes.wire.derivativesOnWireAtLength({ shape: wire, length: 2.5 });
     * ```
     */
    derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve(wire, false);

        const absc = this.occ.GCPnts_AbscissaPoint_FromCompCurve(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();
        const gpPnt = this.och.entitiesService.gpPnt([0, 0, 0]);

        const der1 = this.och.entitiesService.gpVec([0, 0, 0]);
        const der2 = this.och.entitiesService.gpVec([0, 0, 0]);
        const der3 = this.och.entitiesService.gpVec([0, 0, 0]);

        curve.D3(param, gpPnt, der1, der2, der3);
        const der: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] = [[der1.X(), der1.Y(), der1.Z()], [der2.X(), der2.Y(), der2.Z()], [der3.X(), der3.Y(), der3.Z()]];
        der1.delete();
        der2.delete();
        der3.delete();
        curve.delete();
        absc.delete();
        gpPnt.delete();
        return der;
    }

    /**
     * Computes the first, second and third derivatives of a wire's curve at a fraction of the way
     * along it, from 0 at the start to 1 at the end.
     *
     * The first derivative is the tangent with its speed, the second tells how the curve bends, the
     * third how that bending changes; all are with respect to the curve's parameter.
     * @param inputs - The wire and the fraction from 0 to 1
     * @returns The three derivative vectors, first to third
     * @group extract
     * @shortname derivatives at param
     * @drawable false
     * @example
     * ```typescript
     * const [first, second, third] = await bitbybit.occt.shapes.wire.derivativesOnWireAtParam({ shape: wire, param: 0.5 });
     * ```
     */
    derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve(wire, false);

        const gpPnt = this.och.entitiesService.gpPnt([0, 0, 0]);

        const der1 = this.och.entitiesService.gpVec([0, 0, 0]);
        const der2 = this.och.entitiesService.gpVec([0, 0, 0]);
        const der3 = this.och.entitiesService.gpVec([0, 0, 0]);

        const param = this.och.vecHelper.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());

        curve.D3(param, gpPnt, der1, der2, der3);
        const der: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] = [[der1.X(), der1.Y(), der1.Z()], [der2.X(), der2.Y(), der2.Z()], [der3.X(), der3.Y(), der3.Z()]];
        der1.delete();
        der2.delete();
        der3.delete();
        curve.delete();
        gpPnt.delete();
        return der;
    }

    /**
     * Reads the point where a wire starts, in the wire's own direction.
     * @param inputs - The wire
     * @returns The start point
     * @group extract
     * @shortname start point
     * @drawable true
     * @example
     * ```typescript
     * const start = await bitbybit.occt.shapes.wire.startPointOnWire({ shape: wire });
     * ```
     */
    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.startPointOnWire(inputs);
    }

    /**
     * Finds the point halfway along a wire's parameter range.
     *
     * The parameter follows the edges' own curves, not distance, so on a wire of unequal edges this
     * is not always the middle by length; `pointOnWireAtLength` with half of `getWireLength` gives
     * that.
     * @param inputs - The wire
     * @returns The point at parameter 0.5
     * @group extract
     * @shortname mid point
     * @drawable true
     * @example
     * ```typescript
     * const middle = await bitbybit.occt.shapes.wire.midPointOnWire({ shape: wire });
     * ```
     */
    midPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.midPointOnWire(inputs);
    }

    /**
     * Reads the point where a wire ends, in the wire's own direction.
     * @param inputs - The wire
     * @returns The end point
     * @group extract
     * @shortname end point
     * @drawable true
     * @example
     * ```typescript
     * const end = await bitbybit.occt.shapes.wire.endPointOnWire({ shape: wire });
     * ```
     */
    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.endPointOnWire(inputs);
    }

    /**
     * Makes a full circle as a closed single-edge wire, lying in the plane whose normal is
     * `direction`; the default `[0, 1, 0]` lays it flat on the ground.
     * @param inputs - The radius, the center and the plane normal
     * @returns The circle wire
     * @group primitives
     * @shortname circle
     * @drawable true
     * @example
     * ```typescript
     * const circle = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createCircleWire(inputs: Inputs.OCCT.CircleDto): TopoDS_Wire {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire);
    }

    /**
     * Fills a rectangle on the ground plane with a grid of closed hexagon wires, centered on the
     * origin.
     *
     * The hexagons are scaled so `nrHexagonsInWidth` fit across `width` and `nrHexagonsInHeight`
     * across `height`. The scale, fillet and inclusion patterns are read hexagon by hexagon and
     * repeat; the extend flags stretch the outer rows past the edges to cover the rectangle.
     * @param inputs - The rectangle size, the hexagon counts, the extend flags and the optional patterns
     * @returns One wire per hexagon, row by row
     * @group primitives
     * @shortname hegagons in grid
     * @drawable true
     * @example
     * ```typescript
     * const cells = await bitbybit.occt.shapes.wire.hexagonsInGrid({
     *     width: 20,
     *     height: 10,
     *     nrHexagonsInWidth: 8,
     *     nrHexagonsInHeight: 4,
     *     flatTop: false,
     *     scalePatternWidth: [0.9],
     *     scalePatternHeight: [0.9],
     * });
     * ```
     */
    hexagonsInGrid(inputs: Inputs.OCCT.HexagonsInGridDto): TopoDS_Wire[] {
        return this.och.wiresService.hexagonsInGrid(inputs);
    }

    /**
     * Makes a closed square wire centered on `center`.
     *
     * `direction` is the normal of its plane: the default `[0, 1, 0]` lays it flat on the ground.
     * @param inputs - The side length, the center and the plane normal
     * @returns The square wire
     * @group primitives
     * @shortname square
     * @drawable true
     * @example
     * ```typescript
     * const square = await bitbybit.occt.shapes.wire.createSquareWire({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createSquareWire(inputs: Inputs.OCCT.SquareDto): TopoDS_Wire {
        return this.och.wiresService.createSquareWire(inputs);
    }

    /**
     * Makes a closed star-shaped wire with `numRays` points.
     *
     * The points reach `outerRadius` and the notches between them `innerRadius`; `offsetOuterEdges`
     * lifts the ray tips out of the plane by that distance, making a 3D star, and `half` keeps the
     * first half of the rays as an open wire. It lies flat on the ground unless `direction` says
     * otherwise.
     * @param inputs - The two radii, the number of rays, the center, the plane normal and the options
     * @returns The star wire
     * @group primitives
     * @shortname star
     * @drawable true
     * @example
     * ```typescript
     * const star = await bitbybit.occt.shapes.wire.createStarWire({ outerRadius: 5, innerRadius: 2, numRays: 5, center: [0, 0, 0], direction: [0, 1, 0], offsetOuterEdges: 0, half: false });
     * ```
     */
    createStarWire(inputs: Inputs.OCCT.StarDto): TopoDS_Wire {
        return this.och.wiresService.createStarWire(inputs);
    }

    /**
     * Makes a closed wire shaped like a stylized Christmas tree: `nrSkirts` layers of branches,
     * narrowing from `outerDist` to `innerDist` off the trunk line, on a trunk of `trunkHeight` and
     * `trunkWidth`.
     *
     * Unlike the other flat shapes here it stands upright in the XY plane, tip along Y; `direction`
     * is the trunk-to-tip direction, `rotation` spins it about that axis, in degrees.
     * @param inputs - The tree proportions, the trunk size, the options, the origin and the trunk-to-tip direction
     * @returns The tree wire
     * @group primitives
     * @shortname christmas tree
     * @drawable true
     * @example
     * ```typescript
     * const tree = await bitbybit.occt.shapes.wire.createChristmasTreeWire({
     *     height: 10,
     *     innerDist: 1.5,
     *     outerDist: 4,
     *     nrSkirts: 4,
     *     trunkHeight: 1.5,
     *     trunkWidth: 1,
     *     half: false,
     *     rotation: 0,
     *     origin: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createChristmasTreeWire(inputs: Inputs.OCCT.ChristmasTreeDto): TopoDS_Wire {
        return this.och.wiresService.createChristmasTreeWire(inputs);
    }

    /**
     * Makes a closed regular polygon wire with `nrCorners` corners, all on a circle of `radius`.
     *
     * `direction` is the normal of the plane; the default `[0, 1, 0]` lays it flat on the ground.
     * @param inputs - The number of corners, the radius, the center and the plane normal
     * @returns The polygon wire
     * @group primitives
     * @shortname n-gon
     * @drawable true
     * @example
     * ```typescript
     * const hexagon = await bitbybit.occt.shapes.wire.createNGonWire({ nrCorners: 6, radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createNGonWire(inputs: Inputs.OCCT.NGonWireDto): TopoDS_Wire {
        return this.och.wiresService.createNGonWire(inputs);
    }

    /**
     * Makes a closed parallelogram wire: a rectangle of `width` and `height` whose sides lean over
     * by `angle` degrees.
     *
     * With `aroundCenter` true the shape is centered on `center`; otherwise it starts there and
     * extends in the positive directions. `direction` is the plane normal; the default `[0, 1, 0]`
     * lays it flat on the ground.
     * @param inputs - The width, the height, the lean angle, whether to center it, the center and the plane normal
     * @returns The parallelogram wire
     * @group primitives
     * @shortname parallelogram
     * @drawable true
     * @example
     * ```typescript
     * const shape = await bitbybit.occt.shapes.wire.createParallelogramWire({ width: 10, height: 5, angle: 30, aroundCenter: true, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto): TopoDS_Wire {
        return this.och.wiresService.createParallelogramWire(inputs);
    }

    /**
     * Makes a closed heart-shaped wire of two smooth halves that fits roughly into a square of
     * `sizeApprox`.
     *
     * `rotation` turns it in its plane, in degrees. `direction` is the plane normal; the default
     * `[0, 1, 0]` lays it flat on the ground.
     * @param inputs - The approximate size, the rotation, the center and the plane normal
     * @returns The heart wire
     * @group primitives
     * @shortname heart
     * @drawable true
     * @example
     * ```typescript
     * const heart = await bitbybit.occt.shapes.wire.createHeartWire({ sizeApprox: 10, rotation: 0, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createHeartWire(inputs: Inputs.OCCT.Heart2DDto): TopoDS_Wire {
        return this.och.wiresService.createHeartWire(inputs);
    }

    /**
     * Makes a closed rectangle wire centered on `center`.
     *
     * On the ground plane `width` runs along X and `length` along Z; `direction` is the normal of
     * the plane, and the default `[0, 1, 0]` keeps the wire flat on the ground.
     * @param inputs - The width, the length, the center and the plane normal
     * @returns The rectangle wire
     * @group primitives
     * @shortname rectangle
     * @drawable true
     * @example
     * ```typescript
     * const rectangle = await bitbybit.occt.shapes.wire.createRectangleWire({ width: 20, length: 10, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): TopoDS_Wire {
        return this.och.wiresService.createRectangleWire(inputs);
    }

    /**
     * Makes a closed L-shaped wire: two rectangular legs joined at a corner.
     *
     * The first leg has `widthFirst` and `lengthFirst`, the second `widthSecond` and
     * `lengthSecond`; `align` puts the corner on the outside, inside or middle of the legs, and
     * `rotation` turns the shape in its plane, in degrees. It lies flat on the ground unless
     * `direction` says otherwise.
     * @param inputs - The two leg sizes, the alignment, the rotation, the center and the plane normal
     * @returns The L-shaped wire
     * @group primitives
     * @shortname L polygon
     * @drawable true
     * @example
     * ```typescript
     * const outline = await bitbybit.occt.shapes.wire.createLPolygonWire({
     *     widthFirst: 2,
     *     lengthFirst: 10,
     *     widthSecond: 2,
     *     lengthSecond: 6,
     *     align: Bit.Inputs.OCCT.directionEnum.outside,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createLPolygonWire(inputs: Inputs.OCCT.LPolygonDto): TopoDS_Wire {
        return this.och.wiresService.createLPolygonWire(inputs);
    }

    /**
     * Makes the closed outline of an I-beam cross-section: two horizontal flanges joined by a
     * vertical web.
     *
     * `width` is the flange width, `height` the total height, `webThickness` and `flangeThickness`
     * the wall thicknesses; `alignment` says which point of the profile's box sits on `center`,
     * `rotation` turns it in its plane, in degrees. It lies on the ground, ready to extrude.
     * @param inputs - The profile size, the two thicknesses, the alignment, the rotation, the center and the plane normal
     * @returns The I-beam outline wire
     * @group beam profiles
     * @shortname I-beam profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.shapes.wire.createIBeamProfileWire({
     *     width: 10,
     *     height: 20,
     *     webThickness: 2,
     *     flangeThickness: 3,
     *     alignment: Bit.Inputs.Base.basicAlignmentEnum.midMid,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createIBeamProfileWire(inputs: Inputs.OCCT.IBeamProfileDto): TopoDS_Wire {
        return this.och.wiresService.createIBeamProfileWire(inputs);
    }

    /**
     * Makes the closed outline of an H-beam cross-section: two vertical flanges joined by a
     * horizontal web, an I-beam on its side.
     *
     * `width` is the total width, `height` the flange height, `webThickness` and `flangeThickness`
     * the wall thicknesses; `alignment` says which point of the profile's box sits on `center`,
     * `rotation` turns it in its plane, in degrees.
     * @param inputs - The profile size, the two thicknesses, the alignment, the rotation, the center and the plane normal
     * @returns The H-beam outline wire
     * @group beam profiles
     * @shortname H-beam profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.shapes.wire.createHBeamProfileWire({
     *     width: 20,
     *     height: 10,
     *     webThickness: 2,
     *     flangeThickness: 3,
     *     alignment: Bit.Inputs.Base.basicAlignmentEnum.midMid,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createHBeamProfileWire(inputs: Inputs.OCCT.HBeamProfileDto): TopoDS_Wire {
        return this.och.wiresService.createHBeamProfileWire(inputs);
    }

    /**
     * Makes the closed outline of a T-beam cross-section: a horizontal flange with a vertical web
     * hanging from its middle.
     *
     * `width` is the flange width, `height` the total height, `webThickness` and `flangeThickness`
     * the wall thicknesses; `alignment` says which point of the profile's box sits on `center`,
     * `rotation` turns it in its plane, in degrees. It lies on the ground.
     * @param inputs - The profile size, the two thicknesses, the alignment, the rotation, the center and the plane normal
     * @returns The T-beam outline wire
     * @group beam profiles
     * @shortname T-beam profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.shapes.wire.createTBeamProfileWire({
     *     width: 10,
     *     height: 12,
     *     webThickness: 2,
     *     flangeThickness: 2,
     *     alignment: Bit.Inputs.Base.basicAlignmentEnum.midMid,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createTBeamProfileWire(inputs: Inputs.OCCT.TBeamProfileDto): TopoDS_Wire {
        return this.och.wiresService.createTBeamProfileWire(inputs);
    }

    /**
     * Makes the closed outline of a U-beam cross-section, a channel: a web with two flanges of
     * `flangeWidth` standing up from its ends.
     *
     * `width` and `height` are the total size, `webThickness` and `flangeThickness` the wall
     * thicknesses; `alignment` says which point of the profile's box sits on `center`, `rotation`
     * turns it in its plane, in degrees. It lies on the ground.
     * @param inputs - The profile size, the thicknesses, the flange width, the alignment, the rotation, the center and the plane normal
     * @returns The U-beam outline wire
     * @group beam profiles
     * @shortname U-beam profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.shapes.wire.createUBeamProfileWire({
     *     width: 10,
     *     height: 6,
     *     webThickness: 1,
     *     flangeThickness: 1,
     *     flangeWidth: 3,
     *     alignment: Bit.Inputs.Base.basicAlignmentEnum.midMid,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createUBeamProfileWire(inputs: Inputs.OCCT.UBeamProfileDto): TopoDS_Wire {
        return this.och.wiresService.createUBeamProfileWire(inputs);
    }

    /**
     * Makes a full ellipse as a closed single-edge wire, lying in the plane whose normal is
     * `direction`.
     *
     * `radiusMajor` must not be smaller than `radiusMinor`, or the kernel refuses the ellipse; the
     * default direction `[0, 1, 0]` lays it flat on the ground.
     * @param inputs - The center, the plane normal and the two radii
     * @returns The ellipse wire
     * @group primitives
     * @shortname ellipse
     * @drawable true
     * @example
     * ```typescript
     * const ellipse = await bitbybit.occt.shapes.wire.createEllipseWire({ center: [0, 0, 0], direction: [0, 1, 0], radiusMinor: 3, radiusMajor: 6 });
     * ```
     */
    createEllipseWire(inputs: Inputs.OCCT.EllipseDto): TopoDS_Wire {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire);
    }

    /**
     * Makes a helix wire, a coil of constant `radius` that climbs `pitch` model units per turn
     * until it reaches `height`.
     *
     * It starts beside `center` and climbs along `direction`; `clockwise` reverses the winding. The
     * helix is approximated by a smooth curve within `tolerance`. A radius, pitch or height of 0 or
     * less gives a null wire.
     * @param inputs - The radius, the pitch, the height, the base center, the axis direction, the winding and the tolerance
     * @returns The helix wire
     * @group primitives
     * @shortname helix
     * @drawable true
     * @example
     * ```typescript
     * const spring = await bitbybit.occt.shapes.wire.createHelixWire({ radius: 2, pitch: 1, height: 10, center: [0, 0, 0], direction: [0, 1, 0], clockwise: false, tolerance: 1e-4 });
     * ```
     */
    createHelixWire(inputs: Inputs.OCCT.HelixWireDto): TopoDS_Wire {
        return this.och.wiresService.createHelixWire(inputs);
    }

    /**
     * Makes a helix wire like `createHelixWire`, but sized by `numTurns` instead of a height: the
     * coil climbs `pitch` model units per turn, `numTurns` times.
     * @param inputs - The radius, the pitch, the number of turns, the base center, the axis direction, the winding and the tolerance
     * @returns The helix wire
     * @group primitives
     * @shortname helix by turns
     * @drawable true
     * @example
     * ```typescript
     * const spring = await bitbybit.occt.shapes.wire.createHelixWireByTurns({ radius: 2, pitch: 1, numTurns: 5, center: [0, 0, 0], direction: [0, 1, 0], clockwise: false, tolerance: 1e-4 });
     * ```
     */
    createHelixWireByTurns(inputs: Inputs.OCCT.HelixWireByTurnsDto): TopoDS_Wire {
        return this.och.wiresService.createHelixWireByTurns(inputs);
    }

    /**
     * Makes a conical helix wire whose radius changes evenly from `startRadius` at the base to
     * `endRadius` at the top, climbing `pitch` model units per turn until it reaches `height`.
     *
     * It starts beside `center` and climbs along `direction`; `clockwise` reverses the winding. The
     * curve is approximated within `tolerance`.
     * @param inputs - The start and end radii, the pitch, the height, the base center, the axis direction, the winding and the tolerance
     * @returns The tapered helix wire
     * @group primitives
     * @shortname tapered helix
     * @drawable true
     * @example
     * ```typescript
     * const cone = await bitbybit.occt.shapes.wire.createTaperedHelixWire({ startRadius: 3, endRadius: 0.5, pitch: 1, height: 8, center: [0, 0, 0], direction: [0, 1, 0], clockwise: false, tolerance: 1e-4 });
     * ```
     */
    createTaperedHelixWire(inputs: Inputs.OCCT.TaperedHelixWireDto): TopoDS_Wire {
        return this.och.wiresService.createTaperedHelixWire(inputs);
    }

    /**
     * Makes a flat spiral wire in the plane whose normal is `direction`: `numTurns` turns whose
     * radius grows evenly from `startRadius` to `endRadius`.
     *
     * The default direction `[0, 1, 0]` lays it flat on the ground; `clockwise` reverses the
     * winding, and the curve is approximated within `tolerance`.
     * @param inputs - The start and end radii, the number of turns, the center, the plane normal, the winding and the tolerance
     * @returns The spiral wire
     * @group primitives
     * @shortname flat spiral
     * @drawable true
     * @example
     * ```typescript
     * const spiral = await bitbybit.occt.shapes.wire.createFlatSpiralWire({ startRadius: 0.5, endRadius: 5, numTurns: 4, center: [0, 0, 0], direction: [0, 1, 0], clockwise: false, tolerance: 1e-4 });
     * ```
     */
    createFlatSpiralWire(inputs: Inputs.OCCT.FlatSpiralWireDto): TopoDS_Wire {
        return this.och.wiresService.createFlatSpiralWire(inputs);
    }

    /**
     * Writes text as stroke wires on the ground plane in the single-line Hershey simplex font, one
     * open polyline wire per pen stroke.
     *
     * `height` is the height of a capital letter in model units, `lineSpacing` and `letterSpacing`
     * are multiples of it, `align` lines up lines of different length, and `centerOnOrigin` moves
     * the block to the origin.
     * @param inputs - The text, its size and spacing, the alignment and the placement options
     * @returns One wire per stroke, in writing order
     * @group primitives
     * @shortname text wires
     * @drawable true
     * @example
     * ```typescript
     * const strokes = await bitbybit.occt.shapes.wire.textWires({
     *     text: "Hello",
     *     height: 5,
     *     lineSpacing: 1.5,
     *     letterSpacing: 0,
     *     align: Bit.Inputs.Base.horizontalAlignEnum.left,
     *     centerOnOrigin: true,
     * });
     * ```
     */
    textWires(inputs: Inputs.OCCT.TextWiresDto): TopoDS_Wire[] {
        return this.och.wiresService.textWires(inputs);
    }

    /**
     * Writes text as stroke wires like `textWires` and packs them into compounds, with the size of
     * the block alongside.
     *
     * The result carries `compound` with the whole text, `characters` with one compound per
     * character in writing order, and `width` and `height`, the extent of the block along X and
     * along Y.
     * @param inputs - The text, its size and spacing, the alignment and the placement options
     * @returns The text compound, the character compounds and the measured size
     * @group primitives
     * @shortname text wires deriv
     * @drawable true
     * @example
     * ```typescript
     * const text = await bitbybit.occt.shapes.wire.textWiresWithData({
     *     text: "Hi",
     *     height: 5,
     *     lineSpacing: 1.5,
     *     letterSpacing: 0,
     *     align: Bit.Inputs.Base.horizontalAlignEnum.left,
     *     centerOnOrigin: false,
     * });
     * console.log(text.width, text.height);
     * ```
     */
    textWiresWithData(inputs: Inputs.OCCT.TextWiresDto): Models.OCCT.ObjectDefinition<Models.OCCT.TextWiresDataDto<string>, TopoDS_Shape> {
        return this.och.wiresService.textWiresWithData(inputs);
    }

    /**
     * Picks one wire out of a shape by its position, counting from 0, in the order the kernel walks
     * the shape.
     *
     * The shape must be a wire or something built from wires; an index beyond the last wire throws
     * an error.
     * @param inputs - The shape and the 0-based index
     * @returns The wire at that index
     * @group get
     * @shortname wire
     * @drawable true
     * @example
     * ```typescript
     * const outer = await bitbybit.occt.shapes.wire.getWire({ shape: face, index: 0 });
     * ```
     */
    getWire(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Wire {
        return this.och.shapeGettersService.getWire(inputs);
    }

    /**
     * Lists every wire of a shape in the order the kernel walks it.
     * @param inputs - The shape
     * @returns The wires found in the shape
     * @group get
     * @shortname wires
     * @drawable true
     * @example
     * ```typescript
     * const wires = await bitbybit.occt.shapes.wire.getWires({ shape: face });
     * ```
     */
    getWires(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Wire[] {
        return this.och.shapeGettersService.getWires(inputs);
    }

    /**
     * Finds the center of mass of a wire, the balance point of its curves; for a circle that is its
     * center, off the wire itself.
     * @param inputs - The wire
     * @returns The center of mass point
     * @group get
     * @shortname center of mass
     * @drawable true
     * @example
     * ```typescript
     * const center = await bitbybit.occt.shapes.wire.getWireCenterOfMass({ shape: wire });
     * ```
     */
    getWireCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.getWireCenterOfMass(inputs);
    }

    /**
     * Finds the center of mass of each wire in a list.
     * @param inputs - The wires
     * @returns One point per wire, in the same order
     * @group get
     * @shortname centers of mass
     * @drawable true
     * @example
     * ```typescript
     * const centers = await bitbybit.occt.shapes.wire.getWiresCentersOfMass({ shapes: wires });
     * ```
     */
    getWiresCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return inputs.shapes.map(w => this.och.wiresService.getWireCenterOfMass({
            shape: w
        }));
    }

    /**
     * Flips the direction of a wire, so its start becomes its end.
     *
     * The edges keep their own order and direction flags; the wire as a whole is marked reversed,
     * which is what most operations read. `reversedWireFromReversedEdges` rebuilds the wire edge by
     * edge instead.
     * @param inputs - The wire
     * @returns A new wire running the other way
     * @group get
     * @shortname reversed
     * @drawable true
     * @example
     * ```typescript
     * const back = await bitbybit.occt.shapes.wire.reversedWire({ shape: wire });
     * ```
     */
    reversedWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.reversedWire(inputs);
    }

    /**
     * Flips the direction of a wire by reversing every edge and joining them again in the opposite
     * order.
     *
     * The result is a wire that runs the other way through and through, which some operations need
     * where the plain `reversedWire` flag is not enough.
     * @param inputs - The wire
     * @returns A new wire running the other way
     * @group get
     * @shortname reversed wire by rev edges
     * @drawable true
     * @example
     * ```typescript
     * const back = await bitbybit.occt.shapes.wire.reversedWireFromReversedEdges({ shape: wire });
     * ```
     */
    reversedWireFromReversedEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.reversedWireFromReversedEdges(inputs);
    }

    /**
     * Tells whether a wire is closed, which is when its start and end points coincide within a
     * small tolerance.
     * @param inputs - The wire
     * @returns True when the ends meet
     * @group get
     * @shortname is wire closed
     * @drawable false
     * @example
     * ```typescript
     * const wireIsClosed = await bitbybit.occt.shapes.wire.isWireClosed({ shape: wire });
     * ```
     */
    isWireClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): boolean {
        return this.och.wiresService.isWireClosed(inputs);
    }

    /**
     * Measures the length of a wire along its curves, in model units.
     * @param inputs - The wire
     * @returns The length
     * @group get
     * @shortname length
     * @drawable false
     * @example
     * ```typescript
     * const len = await bitbybit.occt.shapes.wire.getWireLength({ shape: wire });
     * ```
     */
    getWireLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): number {
        return this.och.wiresService.getWireLength(inputs);
    }

    /**
     * Measures the length of each wire in a list along its curves, in model units.
     * @param inputs - The wires
     * @returns One length per wire, in the same order
     * @group get
     * @shortname lengths
     * @drawable false
     * @example
     * ```typescript
     * const lengths = await bitbybit.occt.shapes.wire.getWiresLengths({ shapes: wires });
     * ```
     */
    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): number[] {
        return this.och.wiresService.getWiresLengths(inputs);
    }

    /**
     * Maps a flat wire drawn on the ground plane onto the surface of a face, as if the drawing were
     * wrapped around it.
     *
     * The wire's Z coordinate is read as U and its X coordinate as V, in the face's real UV values,
     * which `shapes.face.getUMinBound` and its siblings report; a drawing that fits inside those
     * bounds lands on the face.
     * @param inputs - The wire on the ground plane and the face
     * @returns The wire lying on the face's surface
     * @group place
     * @shortname wire on face
     * @drawable true
     * @example
     * ```typescript
     * const onSurface = await bitbybit.occt.shapes.wire.placeWireOnFace({ wire: flatWire, face: cylinderFace });
     * ```
     */
    placeWireOnFace(inputs: Inputs.OCCT.WireOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Wire {
        const wire = inputs.wire;
        const face = inputs.face;
        const srf = this.och.surfaceFromFace({ shape: face });
        const result = this.och.wiresService.placeWire(wire, srf);
        return result;
    }

    /**
     * Maps several flat wires drawn on the ground plane onto the surface of a face, as
     * `placeWireOnFace` does for one.
     * @param inputs - The wires on the ground plane and the face
     * @returns The wires lying on the face's surface, in the same order
     * @group place
     * @shortname wires on face
     * @drawable true
     * @example
     * ```typescript
     * const onSurface = await bitbybit.occt.shapes.wire.placeWiresOnFace({ wires: flatWires, face: cylinderFace });
     * ```
     */
    placeWiresOnFace(inputs: Inputs.OCCT.WiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Wire[] {
        const wires = inputs.wires;
        const face = inputs.face;
        const srf = this.och.surfaceFromFace({ shape: face });
        const result = wires.map(wire => this.och.wiresService.placeWire(wire, srf));
        return result;
    }

    /**
     * Closes an open wire with a straight edge from its end point back to its start point.
     *
     * A wire whose ends already meet is returned as it is.
     * @param inputs - The wire to close
     * @returns The closed wire
     * @group edit
     * @shortname close open wire
     * @drawable true
     * @example
     * ```typescript
     * const closedWire = await bitbybit.occt.shapes.wire.closeOpenWire({ shape: openWire });
     * ```
     */
    closeOpenWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const wire = inputs.shape;
        const firstPoint = this.och.wiresService.startPointOnWire({ shape: wire });
        const lastPoint = this.och.wiresService.endPointOnWire({ shape: wire });
        const tolerance = 1.0e-7;
        if (this.och.vecHelper.vectorsTheSame(firstPoint, lastPoint, tolerance)) {
            return wire;
        }
        const edgeWire = this.createLineWire({ start: lastPoint, end: firstPoint });
        const result = this.addEdgesAndWiresToWire({ shape: wire, shapes: [edgeWire] });
        edgeWire.delete();
        return result;
    }

    /**
     * Projects a wire onto a shape along a direction, like casting its shadow onto the surface.
     *
     * The result is a compound of the curves where the projection meets the shape's faces, which
     * can be on both its near and far side. Cut a face with it through
     * `shapes.face.createFaceFromWireOnFace` or use it as a path.
     * @param inputs - The wire, the shape to project onto and the direction
     * @returns A compound of the projected curves
     * @group place
     * @shortname project
     * @drawable true
     * @example
     * ```typescript
     * const shadow = await bitbybit.occt.shapes.wire.project({ wire: circle, shape: sphere, direction: [0, -1, 0] });
     * ```
     */
    project(inputs: Inputs.OCCT.ProjectWireDto<TopoDS_Wire, TopoDS_Shape>): TopoDS_Compound {
        const wire = inputs.wire;
        const gpDir = this.och.entitiesService.gpDir(inputs.direction);
        const proj = new this.occ.BRepProj_Projection(wire, inputs.shape, gpDir);
        const shape = proj.Shape();
        gpDir.delete();
        proj.delete();
        return shape;
    }

    /**
     * Projects several wires onto a shape along one direction, as `project` does for one.
     * @param inputs - The wires, the shape to project onto and the direction
     * @returns One compound of projected curves per wire, in the same order
     * @group place
     * @shortname project wires
     * @drawable true
     * @example
     * ```typescript
     * const shadows = await bitbybit.occt.shapes.wire.projectWires({ wires: [circle, square], shape: sphere, direction: [0, -1, 0] });
     * ```
     */
    projectWires(inputs: Inputs.OCCT.ProjectWiresDto<TopoDS_Wire, TopoDS_Shape>): TopoDS_Compound[] {
        const shapes: TopoDS_Compound[] = [];
        inputs.wires.forEach(wire => {
            const gpDir = this.och.entitiesService.gpDir(inputs.direction);
            const proj = new this.occ.BRepProj_Projection(wire, inputs.shape, gpDir);
            const shape = proj.Shape();
            shapes.push(shape);
            gpDir.delete();
            proj.delete();
        });

        return shapes;
    }
}
