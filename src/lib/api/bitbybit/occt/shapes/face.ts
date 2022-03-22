
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';


export class OCCTFace {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Creates a face from wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/face/createFaceFromWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createFaceFromWire
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     */
    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createFaceFromWire', inputs);
    }

    /**
     * Creates a face from the surface
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/face/faceFromSurface.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#faceFromSurface
     * @param inputs Face shape
     * @returns OpenCascade surface
     */
    faceFromSurface(inputs: Inputs.OCCT.ShapeDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.faceFromSurface', inputs);
    }

    /**
     * Creates a face from the surface and a wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/face/faceFromSurfaceAndWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#faceFromSurfaceAndWire
     * @param inputs OpenCascade surface, a wire and indication wether face should be created inside or not
     * @returns Face shape
     */
    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto): Promise<any> {
        inputs.shapes = [inputs.surface, inputs.wire];
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.faceFromSurfaceAndWire', inputs);
    }

    /**
     * Creates OpenCascade Polygon face
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/face/createPolygonFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createPolygonFace
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     */
    createPolygonFace(inputs: Inputs.OCCT.PolygonDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createPolygonFace', inputs);
    }

    /**
     * Creates OpenCascade circle face
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/face/createCircleFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createCircleFace
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     */
    createCircleFace(inputs: Inputs.OCCT.CircleDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createCircleFace', inputs);
    }

    /**
     * Creates OpenCascade ellipse face
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/face/createEllipseFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createEllipseFace
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse face
     */
     createEllipseFace(inputs: Inputs.OCCT.EllipseDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createEllipseFace', inputs);
    }

    /**
     * Gets the face by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/face/getFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFace
     * @param inputs Shape
     * @returns OpenCascade face
     */
    getFace(inputs: Inputs.OCCT.ShapeIndexDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getFace', inputs);
    }

    /**
     * Gets the faces of the shape in a list
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/face/getFaces.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFaces
     * @param inputs Shape
     * @returns OpenCascade faces array
     */
    getFaces(inputs: Inputs.OCCT.ShapeDto): Promise<any[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getFaces', inputs);
    }

    /**
     * Computes reversed face from input face
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/face/reversedFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#reversedFace
     * @param inputs Face
     * @returns OpenCascade face
     */
    reversedFace(inputs: Inputs.OCCT.ShapeIndexDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.reversedFace', inputs);
    }
}
