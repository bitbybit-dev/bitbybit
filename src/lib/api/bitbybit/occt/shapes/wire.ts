
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';


export class OCCTWire {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Creates OpenCascade Polygon wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/createPolygonWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createPolygonWire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     */
    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createPolygonWire', inputs);
    }

    /**
     * Combines OpenCascade edges and wires into a single wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/combineEdgesAndWiresIntoAWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#combineEdgesAndWiresIntoAWire
     * @param inputs List of shapes of edges and wires
     * @returns OpenCascade wire
     */
    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto): any {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.combineEdgesAndWiresIntoAWire', inputs);
    }

    /**
     * Adds OpenCascade edges and wires into another wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/addEdgesAndWiresToWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#addEdgesAndWiresToWire
     * @param inputs List of shapes of edges and wires and a single shape wire to which edges need to be added
     * @returns OpenCascade wire
     */
    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto): any {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.addEdgesAndWiresToWire', inputs);
    }

    /**
     * Creates OpenCascade BSPline wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/createbspline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createBSpline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    createBSpline(inputs: Inputs.OCCT.BSplineDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createBSpline', inputs);
    }

    /**
    * Divides OpenCascade wire to points blindly following its parametric space
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/wire/dividewirebyparamstopoints.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#divideWireByParamsToPoints
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    */
    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideWireDto): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.divideWireByParamsToPoints', inputs);
    }

    /**
    * Divides OpenCascade wire to equal distance points
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/wire/dividewirebyequaldistancetopoints.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#divideWireByEqualDistanceToPoints
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    */
    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideWireDto): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.divideWireByEqualDistanceToPoints', inputs);
    }

    /**
    * Evaluates point on a wire at parameter value between 0 and 1, being start and end points
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/wire/pointonwireatparam.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#pointOnWireAtParam
    * @param inputs Wire shape and parameter
    * @returns Point as array of 3 numbers
    */
    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.pointOnWireAtParam', inputs);
    }

    /**
    * Evaluates point on a wire at certain length
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/wire/pointonwireatlength.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#pointOnWireAtLength
    * @param inputs Wire shape and length value
    * @returns Point as array of 3 numbers
    */
    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.pointOnWireAtLength', inputs);
    }

    /**
    * Computes 3 derivative vectors of a curve at a given length
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/wire/derivativesonwireatlength.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#derivativesOnWireAtLength
    * @param inputs Wire shape and length value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    */
    derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto): Promise<[Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.derivativesOnWireAtLength', inputs);
    }

    /**
    * Computes 3 derivative vectors of a curve on parameter between 0 and 1.
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/wire/derivativesonwireatparam.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#derivativesOnWireAtParam
    * @param inputs Wire shape and parameter value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    */
    derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto): Promise<[Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.derivativesOnWireAtParam', inputs);
    }

    /**
    * Computes length of a given wire
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/wire/wirelength.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#wireLength
    * @param inputs Wire shape
    * @returns The length of the wire
    */
    wireLength(inputs: Inputs.OCCT.ShapeDto): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.wireLength', inputs);
    }

    /**
    * Computes the star point on the wire at param 0
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/wire/startpointonwire.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#startPointOnWire
    * @param inputs Wire shape
    * @returns The length of the wire
    */
    startPointOnWire(inputs: Inputs.OCCT.ShapeDto): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.startPointOnWire', inputs);
    }

    /**
    * Computes the end point on the wire at param 1
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/wire/endpointonwire.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#endPointOnWire
    * @param inputs Wire shape
    * @returns The length of the wire
    */
    endPointOnWire(inputs: Inputs.OCCT.ShapeDto): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.endPointOnWire', inputs);
    }

    // /**
    //  * Creates OpenCascade BSPline wire
    //  * <div>
    //  *  <img src="../assets/images/blockly-images/occt/shapes/wire/createBSpline.svg" alt="Blockly Image"/>
    //  * </div>
    //  * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createbspline
    //  * @param inputs Points through which to make BSpline
    //  * @returns OpenCascade BSpline wire
    //  */
    // createInterpolation(inputs: Inputs.OCCT.BSplineDto): Promise<any> {
    //     return this.occWorkerManager.genericCallToWorkerPromise('createInterpolation', inputs);
    // }

    /**
     * Creates OpenCascade Bezier wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/createBezier.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createBezier
     * @param inputs Points through which to make bezier curve
     * @returns OpenCascade Bezier wire
     */
    createBezier(inputs: Inputs.OCCT.BezierDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createBezier', inputs);
    }

    /**
     * Creates OpenCascade circle wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/createCircleWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createCircleWire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     */
    createCircleWire(inputs: Inputs.OCCT.CircleDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createCircleWire', inputs);
    }

    /**
     * Creates OpenCascade ellipse wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/createEllipseWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createEllipseWire
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse wire
     */
    createEllipseWire(inputs: Inputs.OCCT.EllipseDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createEllipseWire', inputs);
    }

    /**
     * Gets the wire by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/getWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#getWire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    getWire(inputs: Inputs.OCCT.ShapeIndexDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.getWire', inputs);
    }

    /**
     * Computes reversed wire from input wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/reversedWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#reversedWire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    reversedWire(inputs: Inputs.OCCT.ShapeIndexDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.reversedWire', inputs);
    }

}
