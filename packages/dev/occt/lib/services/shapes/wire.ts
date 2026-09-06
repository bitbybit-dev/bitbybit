import { TopoDS_Face, BitbybitOcctModule, TopoDS_Wire, TopoDS_Compound, TopoDS_Shape, TopoDS_Edge } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

export class OCCTWire {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Rebuilds a wire's curves to relax (lower) or raise their polynomial degree.
     * @param inputs wire, target degree and tolerance
     * @returns OpenCascade wire
     * @group rebuild
     * @shortname rebuild wire degree
     * @drawable true
     */
    rebuildWireDegree(inputs: Inputs.OCCT.RebuildCurveDegreeDto<TopoDS_Wire>): TopoDS_Wire {
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const rebuilt = edges.map((e) => this.occ.RebuildEdgeDegree(e, inputs.degree, inputs.tolerance));
        return this.och.converterService.combineEdgesAndWiresIntoAWire({ shapes: rebuilt });
    }

    /**
     * Moves the seam (origin) of a periodic wire to a parameter value.
     * @param inputs periodic wire and parameter
     * @returns OpenCascade wire
     * @group seam
     * @shortname move wire seam by param
     * @drawable true
     */
    moveWireSeamByParameter(inputs: Inputs.OCCT.CurveSeamByParameterDto<TopoDS_Wire>): TopoDS_Wire {
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const moved = edges.map((e) => this.occ.MoveSeamByParameter(e, inputs.parameter));
        return this.och.converterService.combineEdgesAndWiresIntoAWire({ shapes: moved });
    }

    /**
     * Moves the seam (origin) of a periodic wire by an arc length from the current start.
     * @param inputs periodic wire and length
     * @returns OpenCascade wire
     * @group seam
     * @shortname move wire seam by length
     * @drawable true
     */
    moveWireSeamByLength(inputs: Inputs.OCCT.CurveSeamByLengthDto<TopoDS_Wire>): TopoDS_Wire {
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const moved = edges.map((e) => this.occ.MoveSeamByLength(e, inputs.length));
        return this.och.converterService.combineEdgesAndWiresIntoAWire({ shapes: moved });
    }

    /**
     * Returns debug info about the wire: edge count, closed flag, total length and per-edge curve
     * debug info (type, degree, poles/knots, rational/periodic, range, length).
     * @param inputs wire
     * @returns Wire debug info
     * @group debug
     * @shortname wire debug info
     * @drawable false
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
     * Creates linear wire from base line format {start: Point3, end: Point3}
     * @param inputs base line
     * @returns OpenCascade wire
     * @group from base
     * @shortname wire from base line
     * @drawable true
     */
    fromBaseLine(inputs: Inputs.OCCT.LineBaseDto): TopoDS_Wire {
        return this.createLineWire(inputs.line);
    }

    /**
     * Creates linear wires from base lines format {start: Point3, end: Point3}[]
     * @param inputs base lines
     * @returns OpenCascade wires
     * @group from base
     * @shortname wires from base lines
     * @drawable true
     */
    fromBaseLines(inputs: Inputs.OCCT.LinesBaseDto): TopoDS_Wire[] {
        return inputs.lines.map(line => this.createLineWire(line));
    }

    /**
     * Creates linear wire from base segment format [Point3, Point3]
     * @param inputs base segment
     * @returns OpenCascade wire
     * @group from base
     * @shortname wire from base segment
     * @drawable true
     */
    fromBaseSegment(inputs: Inputs.OCCT.SegmentBaseDto): TopoDS_Wire {
        return this.createLineWire({ start: inputs.segment[0], end: inputs.segment[1] });
    }

    /**
     * Creates linear wires from base segments format [Point3, Point3][]
     * @param inputs base segments
     * @returns OpenCascade wires
     * @group from base
     * @shortname wires from base segments
     * @drawable true
     */
    fromBaseSegments(inputs: Inputs.OCCT.SegmentsBaseDto): TopoDS_Wire[] {
        return inputs.segments.map(segment => this.createLineWire({ start: segment[0], end: segment[1] }));
    }

    /**
     * Creates wire from collection of points
     * @param inputs Points
     * @returns OpenCascade wire
     * @group from base
     * @shortname wire from points
     * @drawable true
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
     * Creates wire from polyline definition
     * @param inputs Polyline
     * @returns OpenCascade wire
     * @group from base
     * @shortname wire from polyline
     * @drawable true
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
     * Creates wire from triangle definition
     * @param inputs Triangle
     * @returns OpenCascade wire
     * @group from base
     * @shortname wire from triangle
     * @drawable true
     */
    fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto): TopoDS_Wire {
        const points = inputs.triangle;
        return this.fromBasePolyline({ polyline: { points, isClosed: true } });
    }

    /**
     * Creates wires from mesh definition
     * @param inputs Mesh
     * @returns OpenCascade wires
     * @group from base
     * @shortname wires from mesh
     * @drawable true
     */
    fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto): TopoDS_Wire[] {
        const wires: TopoDS_Wire[] = [];
        inputs.mesh.forEach((triangle) => {
            try {
                wires.push(this.fromBaseTriangle({ triangle }));
            } catch (e) {
                console.warn("Failed to make wire for triangle", triangle);
            }
        });
        return wires.flat();
    }

    /**
     * Creates OpenCascade Polygon wire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     * @group via points
     * @shortname polygon
     * @drawable true
     */
    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): TopoDS_Wire {
        return this.och.wiresService.createPolygonWire(inputs);
    }

    /**
     * Creates OpenCascade Polygons
     * @param inputs Polygon points
     * @returns OpenCascade polygon wires shapes
     * @group multiple
     * @shortname polygons
     * @drawable true
     */
    createPolygons(inputs: Inputs.OCCT.PolygonsDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.polygons.map(p => this.createPolygonWire(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Creates OpenCascade line wire
     * @param inputs line start and end point
     * @returns OpenCascade line wire shape
     * @group via points
     * @shortname line
     * @drawable true
     */
    createLineWire(inputs: Inputs.OCCT.LineDto): TopoDS_Wire {
        return this.och.wiresService.createLineWire(inputs);
    }

    /**
     * Creates OpenCascade line wire with extensions
     * @param inputs line start and end point and extension lengths for both start and end
     * @returns OpenCascade line wire shape
     * @group via points
     * @shortname line with extensions
     * @drawable true
     */
    createLineWireWithExtensions(inputs: Inputs.OCCT.LineWithExtensionsDto): TopoDS_Wire {
        return this.och.wiresService.createLineWireWithExtensions(inputs);
    }

    /**
     * Creates OpenCascade lines
     * @param inputs lines with start and end points
     * @returns OpenCascade line wire shapes
     * @group multiple
     * @shortname lines
     * @drawable true
     */
    createLines(inputs: Inputs.OCCT.LinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.lines.map(p => this.createLineWire(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Splits a wire on a set of given points
     * @param inputs wire and a list of points
     * @returns OpenCascade line wire shapes
     * @group extract
     * @shortname split on points
     * @drawable true
     */
    splitOnPoints(inputs: Inputs.OCCT.SplitWireOnPointsDto<TopoDS_Wire>): TopoDS_Wire[] {
        return this.och.wiresService.splitOnPoints(inputs);
    }

    /**
     * Transform shape wires to points ordered in lists. 
     * This also removes duplicated points between start end end points of 
     * consecutive edges on the wire
     * @param inputs OCCT shape
     * @returns point lists for wires
     * @group extract
     * @shortname wires to points
     * @drawable false
     */
    wiresToPoints(inputs: Inputs.OCCT.WiresToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.wiresService.wiresToPoints(inputs);
    }

    /**
     * Creates OpenCascade polyline wire
     * @param inputs polyline points
     * @returns OpenCascade polyline wire shape
     * @group via points
     * @shortname polyline
     * @drawable true
     */
    createPolylineWire(inputs: Inputs.OCCT.PolylineDto): TopoDS_Wire {
        return this.och.wiresService.createPolylineWire(inputs);
    }

    /**
     * Creates zig zag between two wires
     * @param inputs two wires and zig zag parameters
     * @returns OpenCascade polyline wire shape
     * @group via wires
     * @shortname zig zag between two wires
     * @drawable true
     */
    createZigZagBetweenTwoWires(inputs: Inputs.OCCT.ZigZagBetweenTwoWiresDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.createZigZagBetweenTwoWires(inputs);
    }

    /**
     * Creates two wires by connecting the start points and the end points of two or more wires or edges
     * @param inputs two or more wires or edges and options for the resulting wires
     * @returns Two OpenCascade wire shapes - one through the start points and one through the end points
     * @group via wires
     * @shortname wires between start end points
     * @drawable true
     */
    createWiresBetweenStartEndPointsOfWiresAndEdges(inputs: Inputs.OCCT.WiresBetweenStartEndPointsOfWiresAndEdgesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire[] {
        return this.och.wiresService.createWiresBetweenStartEndPointsOfWiresAndEdges(inputs);
    }

    /**
     * Subdivides two or more wires or edges and creates wires connecting the points found at matching subdivision indexes
     * @param inputs two or more wires or edges and subdivision options
     * @returns OpenCascade wire shapes - one for each subdivision index, optionally closed as polygons or periodic interpolated wires
     * @group via wires
     * @shortname wires between subdivided points
     * @drawable true
     */
    createWiresBetweenSubdividedPointsOfWiresAndEdges(inputs: Inputs.OCCT.WiresBetweenSubdividedPointsOfWiresAndEdgesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire[] {
        return this.och.wiresService.createWiresBetweenSubdividedPointsOfWiresAndEdges(inputs);
    }

    /**
     * Creates a tangent wire enclosing two planar circles
     * @param inputs two circle wires and tolerance
     * @returns OpenCascade wire shape
     * @group via wires
     * @shortname tangent wire from two circles
     * @drawable true
     */
    createWireFromTwoCirclesTan(inputs: Inputs.OCCT.WireFromTwoCirclesTanDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.createWireFromTwoCirclesTan(inputs);
    }

    /**
     * Creates OpenCascade polyline wires
     * @param inputs polylines
     * @returns OpenCascade polyline wire shapes
     * @group multiple
     * @shortname polylines
     * @drawable true
     */
    createPolylines(inputs: Inputs.OCCT.PolylinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.polylines.map(p => this.createPolylineWire(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Creates OpenCascade Bezier wire
     * @param inputs Points through which to make bezier curve
     * @returns OpenCascade Bezier wire
     * @group via points
     * @shortname bezier
     * @drawable true
     */
    createBezier(inputs: Inputs.OCCT.BezierDto): TopoDS_Wire {
        return this.och.wiresService.createBezier(inputs);
    }

    /**
     * Creates OpenCascade Bezier wire with weights
     * @param inputs Points through which to make bezier curve and weights on those points which are used to control the curve
     * @returns OpenCascade Bezier wire
     * @group via points
     * @shortname bezier weights
     * @drawable true
     */
    createBezierWeights(inputs: Inputs.OCCT.BezierWeightsDto): TopoDS_Wire {
        return this.och.wiresService.createBezierWeights(inputs);
    }

    /**
     * Creates OpenCascade Bezier wires
     * @param inputs Multiple bezier wire definitions
     * @returns OpenCascade Bezier wires
     * @group multiple
     * @shortname bezier wires
     * @drawable true
     */
    createBezierWires(inputs: Inputs.OCCT.BezierWiresDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.bezierWires.map(p => this.createBezier(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Creates OpenCascade BSpline wire from points. This method can be used to create nicely shaped (periodic) loops.
     * @param inputs Points through which to make the curve, periodic bool and tolerance
     * @returns OpenCascade BSpline wire
     * @group via points
     * @shortname interpolate
     * @drawable true
     */
    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto): TopoDS_Wire {
        return this.och.wiresService.interpolatePoints(inputs);
    }

    /**
     * Creates a closed, achiral BSpline wire through the points whose shape is genuinely symmetric for
     * symmetric inputs (square, triangle, ...) - mirror-symmetric, not merely rotationally symmetric -
     * with no irregular start/end point. Use this when a plain interpolation looks skewed at the seam.
     * @param inputs Points through which to make the curve and tolerance
     * @returns OpenCascade BSpline wire
     * @group via points
     * @shortname interpolate symmetric
     * @drawable true
     */
    interpolatePointsSymmetric(inputs: Inputs.OCCT.InterpolateSymmetricDto): TopoDS_Wire {
        return this.och.wiresService.interpolatePointsSymmetric(inputs);
    }

    /**
     * Creates OpenCascade multiple interpolated wires
     * @param inputs Interpolated wire definitions
     * @returns OpenCascade BSpline wires
     * @group multiple
     * @shortname interpolate wires
     * @drawable true
     */
    interpolateWires(inputs: Inputs.OCCT.InterpolateWiresDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.interpolations.map(p => this.interpolatePoints(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Creates OpenCascade BSPline wire
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     * @group via points
     * @shortname bspline
     * @drawable true
     */
    createBSpline(inputs: Inputs.OCCT.BSplineDto): TopoDS_Wire {
        return this.och.wiresService.createBSpline(inputs);
    }

    /**
     * Creates OpenCascade BSPline wires
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wires
     * @group multiple
     * @shortname bsplines
     * @drawable true
     */
    createBSplines(inputs: Inputs.OCCT.BSplinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.bSplines.map(p => this.createBSpline(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    /**
     * Combines OpenCascade edges and wires into a single wire
     * @param inputs List of shapes of edges and wires
     * @returns OpenCascade wire
     * @group build
     * @shortname combine
     * @drawable true
     */
    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        return this.och.converterService.combineEdgesAndWiresIntoAWire(inputs);
    }

    /**
     * Creates wire from edge
     * @param inputs An edge to transform into a wire
     * @returns OpenCascade wire
     * @group build
     * @shortname wire from edge
     * @drawable true
     */
    createWireFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Wire {
        return this.och.wiresService.createWireFromEdge(inputs);
    }

    /**
     * Adds OpenCascade edges and wires into another wire
     * @param inputs List of shapes of edges and wires and a single shape wire to which edges need to be added
     * @returns OpenCascade wire
     * @group build
     * @shortname extend
     * @drawable true
     */
    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        return this.och.wiresService.addEdgesAndWiresToWire(inputs);
    }

    /**
     * Divides OpenCascade wire to points blindly following its parametric space
     * @param inputs Describes into how many points should the wire be divided
     * @returns Points on wire
     * @group extract
     * @shortname points by params
     * @drawable true
     */
    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.divideWireByParamsToPoints(inputs);
    }

    /**
     * Divides OpenCascade wires to points blindly following its parametric space
     * @param inputs Describes into how many points should the wires be divided
     * @returns Points on wire
     * @group extract from wires
     * @shortname points by params
     * @drawable true
     */
    divideWiresByParamsToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Wire>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(s => this.divideWireByParamsToPoints({ ...inputs, shape: s }));
    }

    /**
     * Divides OpenCascade wire to equal distance points
     * @param inputs Describes into how many points should the wire be divided
     * @returns Points on wire
     * @group extract
     * @shortname points by distance
     * @drawable true
     */
    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.divideWireByEqualDistanceToPoints(inputs);
    }

    /**
     * Divides OpenCascade wires to equal distance points
     * @param inputs Describes into how many points should the wires be divided
     * @returns Points on wire
     * @group extract from wires
     * @shortname points by distance
     * @drawable true
     */
    divideWiresByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Wire>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(s => this.divideWireByEqualDistanceToPoints({ ...inputs, shape: s }));
    }

    /**
     * Evaluates point on a wire at parameter value between 0 and 1, being start and end points
     * @param inputs Wire shape and parameter
     * @returns Point as array of 3 numbers
     * @group extract
     * @shortname point at param
     * @drawable true
     */
    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.pointOnWireAtParam(inputs);
    }

    /**
     * Evaluates point on a wire at certain length
     * @param inputs Wire shape and length value
     * @returns Point as array of 3 numbers
     * @group extract
     * @shortname point at length
     * @drawable true
     */
    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.pointOnWireAtLength(inputs);
    }

    /**
     * Evaluates points on a wire at certain lengths
     * @param inputs Wire shape and lengths array
     * @returns Points as arrays of 3 numbers
     * @group extract
     * @shortname points at lengths
     * @drawable true
     */
    pointsOnWireAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.pointsOnWireAtLengths(inputs);
    }

    /**
     * Evaluates points on a wire at equal length
     * @param inputs Wire shape and length
     * @returns Points as arrays of 3 numbers
     * @group extract
     * @shortname points at equal length
     * @drawable true
     */
    pointsOnWireAtEqualLength(inputs: Inputs.OCCT.PointsOnWireAtEqualLengthDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.pointsOnWireAtEqualLength(inputs);
    }

    /**
     * Evaluates points on a wire at pattern of lengths
     * @param inputs Wire shape and lengths pattern
     * @returns Points as arrays of 3 numbers
     * @group extract
     * @shortname points at pattern of lengths
     * @drawable true
     */
    pointsOnWireAtPatternOfLengths(inputs: Inputs.OCCT.PointsOnWireAtPatternOfLengthsDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.pointsOnWireAtPatternOfLengths(inputs);
    }

    /**
     * Evaluates tangent vector on a wire at parameter value between 0 and 1, being start and end points
     * @param inputs Wire shape and parameter
     * @returns Tangent vector as array of 3 numbers
     * @group extract
     * @shortname tangent at param
     * @drawable true
     */
    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Inputs.Base.Vector3 {
        return this.och.wiresService.tangentOnWireAtParam(inputs);
    }

    /**
     * Evaluates tangent vector on a wire at certain length
     * @param inputs Wire shape and length value
     * @returns Tangent vector as array of 3 numbers
     * @group extract
     * @shortname tangent at length
     * @drawable true
     */
    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Inputs.Base.Vector3 {
        return this.och.wiresService.tangentOnWireAtLength(inputs);
    }

    /**
     * Computes 3 derivative vectors of a curve at a given length
     * @param inputs Wire shape and length value
     * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
     * @group extract
     * @shortname derivatives at length
     * @drawable false
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
     * Computes 3 derivative vectors of a curve on parameter between 0 and 1.
     * @param inputs Wire shape and parameter value
     * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
     * @group extract
     * @shortname derivatives at param
     * @drawable false
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
     * Computes the start point on the wire at param 0
     * @param inputs Wire shape
     * @returns The start point on wire
     * @group extract
     * @shortname start point
     * @drawable true
     */
    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.startPointOnWire(inputs);
    }

    /**
     * Computes the middle point on the wire at param 0.5
     * @param inputs Wire shape
     * @returns The middle point on wire
     * @group extract
     * @shortname mid point
     * @drawable true
     */
    midPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.midPointOnWire(inputs);
    }

    /**
     * Computes the end point on the wire at param 1
     * @param inputs Wire shape
     * @returns The length of the wire
     * @group extract
     * @shortname end point
     * @drawable true
     */
    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.endPointOnWire(inputs);
    }

    /**
     * Creates OpenCascade circle wire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    createCircleWire(inputs: Inputs.OCCT.CircleDto): TopoDS_Wire {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    /**
     * Creates OpenCascade hexagon wires in grid
     * @param inputs grid parameters
     * @returns OpenCascade hexagon wires
     * @group primitives
     * @shortname hegagons in grid
     * @drawable true
     */
    hexagonsInGrid(inputs: Inputs.OCCT.HexagonsInGridDto): TopoDS_Wire[] {
        return this.och.wiresService.hexagonsInGrid(inputs);
    }

    /**
     * Creates OpenCascade square wire
     * @param inputs Square parameters
     * @returns OpenCascade square wire
     * @group primitives
     * @shortname square
     * @drawable true
     */
    createSquareWire(inputs: Inputs.OCCT.SquareDto): TopoDS_Wire {
        return this.och.wiresService.createSquareWire(inputs);
    }

    /**
     * Creates OpenCascade star wire
     * @param inputs star parameters
     * @returns OpenCascade star wire
     * @group primitives
     * @shortname star
     * @drawable true
     */
    createStarWire(inputs: Inputs.OCCT.StarDto): TopoDS_Wire {
        return this.och.wiresService.createStarWire(inputs);
    }

    /**
     * Creates Christmas tree wire
     * @param inputs christmas tree parameters
     * @returns OpenCascade christmas tree wire
     * @group primitives
     * @shortname christmas tree
     * @drawable true
     */
    createChristmasTreeWire(inputs: Inputs.OCCT.ChristmasTreeDto): TopoDS_Wire {
        return this.och.wiresService.createChristmasTreeWire(inputs);
    }

    /**
     * Creates OpenCascade n-gon wire
     * @param inputs ngon parameters
     * @returns OpenCascade ngon wire
     * @group primitives
     * @shortname n-gon
     * @drawable true
     */
    createNGonWire(inputs: Inputs.OCCT.NGonWireDto): TopoDS_Wire {
        return this.och.wiresService.createNGonWire(inputs);
    }

    /**
     * Creates n parallelogram wire
     * @param inputs parallelogram parameters
     * @returns OpenCascade parallelogram wire
     * @group primitives
     * @shortname parallelogram
     * @drawable true
     */
    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto): TopoDS_Wire {
        return this.och.wiresService.createParallelogramWire(inputs);
    }

    /**
     * Creates a heart wire
     * @param inputs heart parameters
     * @returns OpenCascade heart shaped wire
     * @group primitives
     * @shortname heart
     * @drawable true
     */
    createHeartWire(inputs: Inputs.OCCT.Heart2DDto): TopoDS_Wire {
        return this.och.wiresService.createHeartWire(inputs);
    }

    /**
     * Creates OpenCascade rectangle wire
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): TopoDS_Wire {
        return this.och.wiresService.createRectangleWire(inputs);
    }

    /**
     * Creates OpenCascade L polygon wire
     * @param inputs L polygon parameters
     * @returns OpenCascade polygon
     * @group primitives
     * @shortname L polygon
     * @drawable true
     */
    createLPolygonWire(inputs: Inputs.OCCT.LPolygonDto): TopoDS_Wire {
        return this.och.wiresService.createLPolygonWire(inputs);
    }

    /**
     * Creates OpenCascade I-beam profile wire
     * @param inputs I-beam profile parameters
     * @returns OpenCascade I-beam profile wire
     * @group beam profiles
     * @shortname I-beam profile
     * @drawable true
     */
    createIBeamProfileWire(inputs: Inputs.OCCT.IBeamProfileDto): TopoDS_Wire {
        return this.och.wiresService.createIBeamProfileWire(inputs);
    }

    /**
     * Creates OpenCascade H-beam profile wire
     * @param inputs H-beam profile parameters
     * @returns OpenCascade H-beam profile wire
     * @group beam profiles
     * @shortname H-beam profile
     * @drawable true
     */
    createHBeamProfileWire(inputs: Inputs.OCCT.HBeamProfileDto): TopoDS_Wire {
        return this.och.wiresService.createHBeamProfileWire(inputs);
    }

    /**
     * Creates OpenCascade T-beam profile wire
     * @param inputs T-beam profile parameters
     * @returns OpenCascade T-beam profile wire
     * @group beam profiles
     * @shortname T-beam profile
     * @drawable true
     */
    createTBeamProfileWire(inputs: Inputs.OCCT.TBeamProfileDto): TopoDS_Wire {
        return this.och.wiresService.createTBeamProfileWire(inputs);
    }

    /**
     * Creates OpenCascade U-beam profile wire
     * @param inputs U-beam profile parameters
     * @returns OpenCascade U-beam profile wire
     * @group beam profiles
     * @shortname U-beam profile
     * @drawable true
     */
    createUBeamProfileWire(inputs: Inputs.OCCT.UBeamProfileDto): TopoDS_Wire {
        return this.och.wiresService.createUBeamProfileWire(inputs);
    }

    /**
     * Creates OpenCascade ellipse wire
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse wire
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    createEllipseWire(inputs: Inputs.OCCT.EllipseDto): TopoDS_Wire {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    /**
     * Creates a 3D helix wire
     * @param inputs Helix parameters including radius, pitch, height, center and direction
     * @returns OpenCascade helix wire
     * @group primitives
     * @shortname helix
     * @drawable true
     */
    createHelixWire(inputs: Inputs.OCCT.HelixWireDto): TopoDS_Wire {
        return this.och.wiresService.createHelixWire(inputs);
    }

    /**
     * Creates a 3D helix wire by specifying the number of turns
     * @param inputs Helix parameters including radius, pitch, number of turns, center and direction
     * @returns OpenCascade helix wire
     * @group primitives
     * @shortname helix by turns
     * @drawable true
     */
    createHelixWireByTurns(inputs: Inputs.OCCT.HelixWireByTurnsDto): TopoDS_Wire {
        return this.och.wiresService.createHelixWireByTurns(inputs);
    }

    /**
     * Creates a conical (tapered) helix wire with varying radius
     * @param inputs Tapered helix parameters including start/end radii, pitch, height, center and direction
     * @returns OpenCascade tapered helix wire
     * @group primitives
     * @shortname tapered helix
     * @drawable true
     */
    createTaperedHelixWire(inputs: Inputs.OCCT.TaperedHelixWireDto): TopoDS_Wire {
        return this.och.wiresService.createTaperedHelixWire(inputs);
    }

    /**
     * Creates a flat (Archimedean) spiral wire lying in a plane
     * @param inputs Flat spiral parameters including start/end radii, number of turns, center and direction
     * @returns OpenCascade flat spiral wire
     * @group primitives
     * @shortname flat spiral
     * @drawable true
     */
    createFlatSpiralWire(inputs: Inputs.OCCT.FlatSpiralWireDto): TopoDS_Wire {
        return this.och.wiresService.createFlatSpiralWire(inputs);
    }

    /**
     * Creates OpenCascade text wires based on simplex font created by Dr. A. V. Hershey
     * @param inputs Text parameters
     * @returns OpenCascade text wires
     * @group primitives
     * @shortname text wires
     * @drawable true
     */
    textWires(inputs: Inputs.OCCT.TextWiresDto): TopoDS_Wire[] {
        return this.och.wiresService.textWires(inputs);
    }

    /**
     * Creates OpenCascade compound out of text wires and returns additional information based on simplex font created by Dr. A. V. Hershey
     * @param inputs Text parameters
     * @returns OpenCascade text compound derivative data
     * @group primitives
     * @shortname text wires deriv
     * @drawable true
     */
    textWiresWithData(inputs: Inputs.OCCT.TextWiresDto): Models.OCCT.ObjectDefinition<Models.OCCT.TextWiresDataDto<string>, TopoDS_Shape> {
        return this.och.wiresService.textWiresWithData(inputs);
    }

    /**
     * Gets the wire by providing an index from the shape
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group get
     * @shortname wire
     * @drawable true
     */
    getWire(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Wire {
        return this.och.shapeGettersService.getWire(inputs);
    }

    /**
     * Gets all the wires from the shape
     * @param inputs Shape
     * @returns OpenCascade wires
     * @group get
     * @shortname wires
     * @drawable true
     */
    getWires(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Wire[] {
        return this.och.shapeGettersService.getWires(inputs);
    }

    /**
     * Get the wire center of mass point
     * @param inputs OCCT Wire
     * @returns point
     * @group get
     * @shortname center of mass
     * @drawable true
     */
    getWireCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.getWireCenterOfMass(inputs);
    }

    /**
     * Get the wires centers of mass point
     * @param inputs OCCT Wires
     * @returns points
     * @group get
     * @shortname centers of mass
     * @drawable true
     */
    getWiresCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return inputs.shapes.map(w => this.och.wiresService.getWireCenterOfMass({
            shape: w
        }));
    }

    /**
     * Computes reversed wire from input wire
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group get
     * @shortname reversed
     * @drawable true
     */
    reversedWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.reversedWire(inputs);
    }

    /**
     * Computes reversed wire by reversing all edges and combining them into a new wire
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group get
     * @shortname reversed wire by rev edges
     * @drawable true
     */
    reversedWireFromReversedEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.reversedWireFromReversedEdges(inputs);
    }

    /**
     * Checks whether wire is closed
     * @param inputs wire
     * @returns boolean
     * @group get
     * @shortname is wire closed
     * @drawable false
     */
    isWireClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): boolean {
        return this.och.wiresService.isWireClosed(inputs);
    }

    /**
     * Gets the wire length
     * @param inputs wire
     * @returns Length
     * @group get
     * @shortname length
     * @drawable false
     */
    getWireLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): number {
        return this.och.wiresService.getWireLength(inputs);
    }

    /**
     * Gets the lengths of wires
     * @param inputs wires
     * @returns Lengths
     * @group get
     * @shortname lengths
     * @drawable false
     */
    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): number[] {
        return this.och.wiresService.getWiresLengths(inputs);
    }

    /**
     * Places a wire on the face by mapping it's 2d coordinates to UV space. Wire must be positioned on the ground XZ plane for this to work.
     * @param inputs two shapes - first a wire and second a face
     * @returns OpenCascade wire
     * @group place
     * @shortname wire on face
     * @drawable true
     */
    placeWireOnFace(inputs: Inputs.OCCT.WireOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Wire {
        const wire = inputs.wire as TopoDS_Wire;
        const face = inputs.face as TopoDS_Face;
        const srf = this.och.surfaceFromFace({ shape: face });
        const result = this.och.wiresService.placeWire(wire, srf);
        return result;
    }

    /**
     * Places multiple wires on the face by mapping it's 2d coordinates to UV space. Wires must be positioned on the ground XZ plane for this to work.
     * @param inputs a face and a list of wires
     * @returns OpenCascade wires
     * @group place
     * @shortname wires on face
     * @drawable true
     */
    placeWiresOnFace(inputs: Inputs.OCCT.WiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Wire[] {
        const wires = inputs.wires;
        const face = inputs.face;
        const srf = this.och.surfaceFromFace({ shape: face });
        const result = wires.map(wire => this.och.wiresService.placeWire(wire, srf));
        return result;
    }

    /**
     * Closes the open wire with additional straight edge joining start and end points
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group edit
     * @shortname close open wire
     * @drawable true
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
     * Project wire on the shape
     * @param inputs wire and shape
     * @returns OpenCascade compound
     * @group place
     * @shortname project
     * @drawable true
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
     * Project multiple wires on the shape
     * @param inputs wire and shape
     * @returns OpenCascade compound
     * @group place
     * @shortname project wires
     * @drawable true
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
