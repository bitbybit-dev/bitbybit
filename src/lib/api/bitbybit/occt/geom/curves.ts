
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';


export class OCCTCurves {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Creates a 2d ellipse. Be sure to use this geometry only for constructive purposes of modeling, but not for representation. You need to transform these curves to edges in order to draw them.
     * <div>
     *  <img src="../assets/images/blockly-images/occt/geom/curves/geom2dEllipse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geom2dEllipse
     * @param inputs 2D Ellipse parameters
     * @returns OpenCascade Geom2d_ellipse
     */
    geom2dEllipse(inputs: Inputs.OCCT.Geom2dEllipseDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geom2dEllipse', inputs);
    }

    /**
     * Creates a trimmed curve from the basis curve limited between U1 and U2. This curve can't be drawn.
     * <div>
     *  <img src="../assets/images/blockly-images/occt/geom/curves/geom2dTrimmedCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geom2dTrimmedCurve
     * @param inputs Bounds and strategy for trimming the curve
     * @returns OpenCascade Geom2d_TrimmedCurve
     */
    geom2dTrimmedCurve(inputs: Inputs.OCCT.Geom2dTrimmedCurveDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geom2dTrimmedCurve', inputs);
    }

    /**
     * Creates a trimmed 2d curve segment between two 2d points. This curve can't be drawn.
     * <div>
     *  <img src="../assets/images/blockly-images/occt/geom/curves/geom2dSegment.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geom2dSegment
     * @param inputs Two 2d points for start and end
     * @returns OpenCascade Geom2d_Segment
     */
    geom2dSegment(inputs: Inputs.OCCT.Geom2dSegmentDto) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geom2dSegment', inputs);
    }

    /**
     * Gets 2d point represented by [number, number] on a curve at parameter.
     * <div>
     *  <img src="../assets/images/blockly-images/occt/geom/curves/get2dPointFrom2dCurveOnParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#get2dPointFrom2dCurveOnParam
     * @param inputs 2D Curve shape and parameter
     * @returns Point as array of 2 numbers
     */
    get2dPointFrom2dCurveOnParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto): Promise<Inputs.Base.Point2> {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.get2dPointFrom2dCurveOnParam', inputs);
    }

    /**
     * Creates a circle geom curve
     * <div>
     *  <img src="../assets/images/blockly-images/occt/geom/curves/geomCircleCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geomCircleCurve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Circle curve
     */
    geomCircleCurve(inputs: Inputs.OCCT.CircleDto): any {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geomCircleCurve', inputs);
    }

    /**
     * Creates an ellipse geom curve
     * <div>
     *  <img src="../assets/images/blockly-images/occt/geom/curves/geomEllipseCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geomEllipseCurve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Ellipse curve
     */
    geomEllipseCurve(inputs: Inputs.OCCT.EllipseDto) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geomEllipseCurve', inputs);
    }
}