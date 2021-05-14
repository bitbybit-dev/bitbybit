import { Injectable } from '@angular/core';
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';

@Injectable()
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
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createpolygonwire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     */
    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('createPolygonWire', inputs);
    }

    /**
     * Creates OpenCascade BSPline wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/createBSpline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createbspline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    createBSpline(inputs: Inputs.OCCT.BSplineDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('createBSpline', inputs);
    }

    /**
     * Creates OpenCascade BSPline wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/createBSpline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createbspline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    // createInterpolation(inputs: Inputs.OCCT.BSplineDto): Promise<any> {
    //     return this.occWorkerManager.genericCallToWorkerPromise('createInterpolation', inputs);
    // }

    /**
     * Creates OpenCascade Bezier wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/createBezier.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createbezier
     * @param inputs Points through which to make bezier curve
     * @returns OpenCascade Bezier wire
     */
    createBezier(inputs: Inputs.OCCT.BezierDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('createBezier', inputs);
    }

    /**
     * Creates OpenCascade circle wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/createCircleWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createcirclewire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     */
    createCircleWire(inputs: Inputs.OCCT.CircleDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('createCircleWire', inputs);
    }

    /**
     * Gets the wire by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/wire/getWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#getwire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    getWire(inputs: Inputs.OCCT.ShapeIndexDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('getWire', inputs);
    }
}
