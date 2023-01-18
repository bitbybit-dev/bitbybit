
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';
import { Base } from '../../../inputs/inputs';


export class OCCTEdge {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Creates linear edge between two points
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/line.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#line
     * @param inputs Two points between which edge should be created
     * @returns OpenCascade edge
     */
    line(inputs: Inputs.OCCT.LineDto): Promise<Inputs.OCCT.TopoDSEdgePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.line', inputs);
    }

    /**
     * Creates arc edge between three points
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/arcThroughThreePoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#arcThroughThreePoints
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade edge
     */
    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto): Promise<Inputs.OCCT.TopoDSEdgePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.arcThroughThreePoints', inputs);
    }

    /**
     * Creates OpenCascade circle edge
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/createCircleEdge.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#createCircleEdge
     * @param inputs Circle parameters
     * @returns OpenCascade circle edge
     */
    createCircleEdge(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSEdgePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.createCircleEdge', inputs);
    }

    /**
     * Creates OpenCascade ellipse edge
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/createEllipseEdge.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#createEllipseEdge
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse edge
     */
    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSEdgePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.createEllipseEdge', inputs);
    }


    /**
     * Removes internal faces for the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#removeInternalEdges
     * @param inputs Shape
     * @returns OpenCascade shape with no internal edges
     */
    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.removeInternalEdges', inputs);
    }

    /**
     * Gets the edge by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/getEdge.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdge
     * @param inputs Shape
     * @returns OpenCascade edge
     */
    getEdge(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdge', inputs);
    }

    /**
     * Gets the edges of a shape in a list
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/getEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdges
     * @param inputs Shape
     * @returns OpenCascade edge list
     */
    getEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdges', inputs);
    }

    /**
     * Creates an edge from geom curve and geom surface
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/makeEdgeFromGeom2dCurveAndSurface.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#makeEdgeFromGeom2dCurveAndSurface
     * @param inputs shapes are expected to contain 2 array elements - first is geom curve, second geom surface
     * @returns OpenCascade TopoDS_Edge
     */
    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.EdgeFromGeom2dCurveAndSurfaceDto<Inputs.OCCT.Geom2dCurvePointer, Inputs.OCCT.GeomSurfacePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer> {
        inputs.shapes = [inputs.curve, inputs.surface];
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.makeEdgeFromGeom2dCurveAndSurface', inputs);
    }

    /**
     * Gets corner points of edges for a shape. There's no order guarantee here. All duplicates are removed, so when three edges form one corner, that will be represented by a single point in the list. 
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/getCornerPointsOfEdgesForShape.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getCornerPointsOfEdgesForShape
     * @param inputs Shape that contains edges - wire, face, shell, solid
     * @returns List of points
     */
    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getCornerPointsOfEdgesForShape', inputs);
    }

    /**
     * Gets the edge length
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/getEdgeLength.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgeLength
     * @param inputs edge
     * @returns Length
     */
    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdgeLength', inputs);
    }

    /**
     * Gets the lengths of the edges
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/getEdgesLengths.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgesLengths
     * @param inputs edges
     * @returns Lengths
     */
    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<number[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdgesLengths', inputs);
    }

    /**
     * Gets the center of mass for the edge
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/getEdgeCenterOfMass.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgeCenterOfMass
     * @param inputs edge
     * @returns Point representing center of mass
     */
    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdgeCenterOfMass', inputs);
    }

    /**
     * Gets the centers of mass for the edges
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/getEdgesCentersOfMass.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgesCentersOfMass
     * @param inputs edges
     * @returns Points representing centers of mass
     */
    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdgesCentersOfMass', inputs);
    }

    /**
     * Gets the point on edge at param
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/pointOnEdgeAtParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#pointOnEdgeAtParam
     * @param input edge
     * @returns Point on param
     */
    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.pointOnEdgeAtParam', inputs);
    }

    /**
     * Gets the tangent vector on edge at param
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/tangentOnEdgeAtParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#tangentOnEdgeAtParam
     * @param input edge
     * @returns Tangent vector on param
     */
    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.tangentOnEdgeAtParam', inputs);
    }

    /**
     * Gets the point on edge at length
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/pointOnEdgeAtLength.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#pointOnEdgeAtLength
     * @param input edge and length
     * @returns Point on edge
     */
    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.pointOnEdgeAtLength', inputs);
    }

    /**
     * Gets the tangent vector on edge at length
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/tangentOnEdgeAtLength.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#tangentOnEdgeAtLength
     * @param input edge and length
     * @returns Tangent vector on edge
     */
    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.tangentOnEdgeAtLength', inputs);
    }

    /**
     * Gets the start point on edge
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/startPointOnEdge.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#startPointOnEdge
     * @param input edge
     * @returns Start point
     */
    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.startPointOnEdge', inputs);
    }

    /**
     * Gets the end point on edge
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/endPointOnEdge.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#endPointOnEdge
     * @param input edge
     * @returns End point
     */
    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.endPointOnEdge', inputs);
    }

    /**
     * Divides edge by params to points
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/divideEdgeByParamsToPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#divideEdgeByParamsToPoints
     * @param input edge and division params
     * @returns Points
     */
    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.divideEdgeByParamsToPoints', inputs);
    }

    /**
     * Divides edge by length to points
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/divideEdgeByEqualDistanceToPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#divideEdgeByEqualDistanceToPoints
     * @param input edge and division params
     * @returns Points
     */
    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.divideEdgeByEqualDistanceToPoints', inputs);
    }
}
