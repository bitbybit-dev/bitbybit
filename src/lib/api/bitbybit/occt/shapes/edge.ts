
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';


export class OCCTEdge {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }
    /**
     * Fillets OpenCascade Shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/filletEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#filletEdges
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     */
    filletEdges(inputs: Inputs.OCCT.FilletDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.filletEdges', inputs);
    }

    /**
     * Chamfer OpenCascade Shape edges
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/chamferEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#chamferEdges
     * @param inputs Shape, distance and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     */
    chamferEdges(inputs: Inputs.OCCT.ChamferDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.chamferEdges', inputs);
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
    line(inputs: Inputs.OCCT.LineDto): Promise<any> {
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
    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto): any {
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
    createCircleEdge(inputs: Inputs.OCCT.CircleDto): Promise<any> {
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
    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.createEllipseEdge', inputs);
    }


    /**
     * Removes internal faces for the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#removeInternalEdges
     * @param inputs Shape
     * @returns OpenCascade shape with no internal edges
     */
    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto): Promise<any> {
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
    getEdge(inputs: Inputs.OCCT.ShapeIndexDto): Promise<any> {
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
    getEdges(inputs: Inputs.OCCT.ShapeDto): Promise<any[]> {
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
    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.ShapesDto) {
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
    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getCornerPointsOfEdgesForShape', inputs);
    }

    /**
     * Fillets two planar edges into a wire by providing a radius, plane, edges and possible solution index if more than one result exists
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/filletTwoEdgesInPlaneIntoAWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#filletTwoEdgesInPlaneIntoAWire
     * @param inputs Definition for fillets
     * @returns OpenCascade wire shape if solution is found
     */
    filletTwoEdgesInPlaneIntoAWire(inputs: Inputs.OCCT.FilletTwoEdgesInPlaneDto): Promise<any> {
        inputs.shapes = [inputs.edge1, inputs.edge2];
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.filletTwoEdgesInPlaneIntoAWire', inputs);

    }
}
