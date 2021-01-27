import { simplifyDeclaration } from '../simplify-declaration';

export const occString = simplifyDeclaration(`
import { Mesh } from '@babylonjs/core';
import { Subject } from 'rxjs';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { JSCADText } from '../jscad-text';
import { Vector } from '../vector';
/**
 * Contains various methods for OpenCascade implementation
 * Much of the work is done by Johnathon Selstad and Sebastian Alff to port OCC to JavaScript
 * I'm super grateful for their work!
 */
export declare class OCC {
    private readonly context;
    private readonly geometryHelper;
    private readonly solidText;
    private readonly vector;
    occWorkerInitialised: Subject<void>;
    private occWorker;
    private promisesMade;
    constructor(context: Context, geometryHelper: GeometryHelper, solidText: JSCADText, vector: Vector);
    setOccWorker(worker: Worker): void;
    genericCallToWorkerPromise(functionName: string, inputs: any): Promise<any>;
    /**
     * Draws OpenCascade shape by going through faces and edges
     * <div>
     *  <img src="../assets/images/blockly-images/occ/drawShape.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#drawshape
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     */
    drawShape(inputs: Inputs.OCC.DrawShapeDto): Promise<Mesh>;
    private computeEdgeMiddlePos;
    /**
     * This needs to be done before every run and the promise needs to be awaited before run executes again
     * This makes sure that cache keeps the objects and hashes from the previous run and the rest is deleted
     * In this way it is possible to hace the cache of manageable size
     */
    cleanUpCache(): Promise<any>;
    /**
     * Creates OpenCascade Polygon wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createPolygonWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createpolygonwire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     */
    createPolygonWire(inputs: Inputs.OCC.PolygonDto): any;
    /**
     * Creates OpenCascade Polygon face
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createPolygonFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createpolygonface
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     */
    createPolygonFace(inputs: Inputs.OCC.PolygonDto): any;
    /**
     * Creates OpenCascade Box
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBox.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbox
     * @param inputs Box size and center
     * @returns OpenCascade Box
     */
    createBox(inputs: Inputs.OCC.BoxDto): Promise<any>;
    /**
     * Creates OpenCascade Cylinder
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCylinder.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylinder(inputs: Inputs.OCC.CylinderDto): any;
    /**
     * Creates OpenCascade BSPline wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBSpline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbspline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    createBSpline(inputs: Inputs.OCC.BSplineDto): any;
    /**
     * Creates OpenCascade Bezier wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBezier.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbezier
     * @param inputs Points through which to make bezier curve
     * @returns OpenCascade Bezier wire
     */
    createBezier(inputs: Inputs.OCC.BezierDto): any;
    /**
     * Creates OpenCascade circle wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCircleWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcirclewire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     */
    createCircleWire(inputs: Inputs.OCC.CircleDto): any;
    /**
     * Creates OpenCascade circle face
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCircleFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcircleface
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     */
    createCircleFace(inputs: Inputs.OCC.CircleDto): any;
    /**
     * Lofts wires into a shell
     * <div>
     *  <img src="../assets/images/blockly-images/occ/loft.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#loft
     * @param inputs Circle parameters
     * @returns Resulting loft shell
     */
    loft(inputs: Inputs.OCC.LoftDto): any;
    /**
     * Offset for various shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/offset.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#offset
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     */
    offset(inputs: Inputs.OCC.OffsetDto): any;
    /**
     * Extrudes the face along direction
     * <div>
     *  <img src="../assets/images/blockly-images/occ/extrude.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#extrude
     * @param inputs Face to extrude and direction parameter with tolerance
     * @returns Resulting extruded solid
     */
    extrude(inputs: Inputs.OCC.ExtrudeDto): any;
    /**
     * Revolves the shape around the given direction
     * <div>
     *  <img src="../assets/images/blockly-images/occ/revolve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#revolve
     * @param inputs Revolve parameters
     * @returns Resulting revolved shape
     */
    revolve(inputs: Inputs.OCC.RevolveDto): any ;
    /**
     * Creates OpenCascade Sphere
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createsphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     */
    createSphere(inputs: Inputs.OCC.SphereDto): any;
    /**
     * Creates OpenCascade Cone
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCone.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     */
    createCone(inputs: Inputs.OCC.ConeDto): any;
    /**
     * Fillets OpenCascade Shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/filletEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#filletedges
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     */
    /**
     * Pipe shapes along the wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/pipe.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#pipe
     * @param inputs Path wire and shapes along the path
     * @returns OpenCascade shape
     */
    pipe(inputs: Inputs.OCC.PipeDto): any;
    filletEdges(inputs: Inputs.OCC.FilletDto): any;
    /**
     * Chamfer OpenCascade Shape edges
     * <div>
     *  <img src="../assets/images/blockly-images/occ/chamferEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#chamferedges
     * @param inputs Shape, distance and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     */
    chamferEdges(inputs: Inputs.OCC.ChamferDto): any;
    /**
     * Joins separate objects
     * <div>
     *  <img src="../assets/images/blockly-images/occ/union.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#union
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     */
    union(inputs: Inputs.OCC.UnionDto): any;
    /**
     * Does boolean difference operation between a main shape and given shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/difference.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    difference(inputs: Inputs.OCC.DifferenceDto): any;
    /**
     * Does boolean intersection operation between a main shape and given shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/difference.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    intersection(inputs: Inputs.OCC.IntersectionDto): any;
    /**
     * Removes internal faces for the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occ/removeInternalEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#removeinternaledges
     * @param inputs Shape
     * @returns OpenCascade shape with no internal edges
     */
    removeInternalEdges(inputs: Inputs.OCC.ShapeDto): any;
    /**
     * Gets the edge by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occ/getEdge.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#getedge
     * @param inputs Shape
     * @returns OpenCascade edge
     */
    getEdge(inputs: Inputs.OCC.ShapeIndexDto): any;
    /**
     * Gets the wire by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occ/getWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#getwire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    getWire(inputs: Inputs.OCC.ShapeIndexDto): any;
    /**
     * Gets the face by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occ/getFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#getface
     * @param inputs Shape
     * @returns OpenCascade face
     */
    getFace(inputs: Inputs.OCC.ShapeIndexDto): any;
    /**
     * Rotated extrude that is perofrmed on the wire shape
     * <div>
     *  <img src="../assets/images/blockly-images/occ/rotatedExtrude.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#rotatedextrude
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     */
    rotatedExtrude(inputs: Inputs.OCC.RotationExtrudeDto): any;
    /**
     * Transforms the array of shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/transform.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#transform
     * @param inputs Transformation description
     * @returns OpenCascade shapes
     */
    transform(inputs: Inputs.OCC.TransformDto): any;
    /**
     * Rotate the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/rotate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#rotate
     * @param inputs Rotation description
     * @returns OpenCascade shapes
     */
    rotate(inputs: Inputs.OCC.RotateDto): any;
    /**
     * Translates the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/translate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#translate
     * @param inputs Translation description
     * @returns OpenCascade shapes
     */
    translate(inputs: Inputs.OCC.RotationExtrudeDto): any;
    /**
     * Scales the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/scale.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#scale
     * @param inputs Scale description
     * @returns OpenCascade shapes
     */
    scale(inputs: Inputs.OCC.RotationExtrudeDto): any;
    private computeFaceMiddlePos;
}
`);
