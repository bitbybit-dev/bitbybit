import { Injectable } from '@angular/core';
import { Mesh, MeshBuilder } from '@babylonjs/core';
import { Subject } from 'rxjs';
import { BitByBitBlocklyHelperService } from '../../../bit-by-bit-blockly-helper.service';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { JSCADText } from '../jscad-text';
import { Vector } from '../vector';
import { OccInfo } from './occ-info';
import { OccStateEnum } from './occ-state.enum';

/**
 * Contains various methods for OpenCascade implementation
 * Much of the work is done by Johnathon Selstad and Sebastian Alff to port OCC to JavaScript
 * I'm super grateful for their work!
 */
@Injectable()
export class OCC {

    occWorkerState: Subject<OccInfo> = new Subject();
    private occWorker: Worker;
    private promisesMade: { promise?: Promise<any>, uid: string, resolve?, reject?}[] = [];
    private promisesResolved: string[] = [];

    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper,
        private readonly solidText: JSCADText,
        private readonly vector: Vector
    ) {
    }

    setOccWorker(worker: Worker): void {
        this.occWorker = worker;
        this.occWorker.onmessage = ({ data }) => {
            if (data === 'occ initialised') {
                this.occWorkerState.next({
                    state: OccStateEnum.loaded,
                });
            } else if (data === 'busy') {
                this.occWorkerState.next({
                    state: OccStateEnum.computing,
                });
            }
            else {
                const promise = this.promisesMade.find(made => made.uid === data.uid);
                if (promise && data.result && !data.error) {
                    promise.resolve(data.result);
                } else if (data.error) {
                    promise.reject(data.error);
                    alert(data.error);
                }
                this.promisesResolved.push(data.uid);
                this.promisesMade = this.promisesMade.filter(i => i.uid !== data.uid);

                if (this.promisesMade.length === 0) {
                    this.occWorkerState.next({
                        state: OccStateEnum.loaded,
                    });
                } else {
                    this.occWorkerState.next({
                        state: OccStateEnum.computing,
                    });
                }
            }
        };
    }

    genericCallToWorkerPromise(functionName: string, inputs: any): Promise<any> {
        const uid = `call${Math.random()}`;
        const obj: { promise?: Promise<any>, uid: string, resolve?, reject?} = { uid };
        const prom = new Promise((resolve, reject) => {
            obj.resolve = resolve;
            obj.reject = reject;
        });
        obj.promise = prom;
        this.promisesMade.push(obj);

        this.occWorker.postMessage({
            action: {
                functionName, inputs
            },
            uid,
        });

        return prom;
    }
    /**
     * Draws OpenCascade shape by going through faces and edges
     * <div>
     *  <img src="../assets/images/blockly-images/occ/drawShape.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#drawshape
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     */
    drawShape(inputs: Inputs.OCC.DrawShapeDto): Promise<Mesh> {
        return this.genericCallToWorkerPromise('shapeToMesh', inputs).then((fe: {
            faceList: {
                face_index: number;
                normal_coord: number[];
                number_of_triangles: number;
                tri_indexes: number[];
                vertex_coord: number[];
                vertex_coord_vec: number[][];
            }[],
            edgeList: {
                edge_index: number;
                vertex_coord: number[][];
            }[]
        }) => {
            const shapeMesh = MeshBuilder.CreateBox('brepMesh' + Math.random(), { size: 0.01 }, this.context.scene);
            shapeMesh.isVisible = false;
            let dummy;
            if (inputs.drawFaces) {
                fe.faceList.forEach(face => {
                    const mesh = this.geometryHelper.createOrUpdateSurfaceMesh({
                        positions: face.vertex_coord,
                        normals: face.normal_coord,
                        indices: face.tri_indexes,
                    }, dummy, false, inputs.faceOpacity, inputs.faceColour);
                    mesh.parent = shapeMesh;
                });
            }
            if (inputs.drawEdges) {
                fe.edgeList.forEach(edge => {
                    const mesh = this.geometryHelper.drawPolyline(
                        dummy,
                        edge.vertex_coord,
                        false,
                        inputs.edgeWidth,
                        inputs.edgeOpacity,
                        inputs.edgeColour
                    );
                    mesh.parent = shapeMesh;
                });
            }
            if (inputs.drawEdgeIndexes) {
                const textPolylines: number[][][] = [];
                fe.edgeList.forEach(edge => {
                    const edgeMiddle = this.computeEdgeMiddlePos(edge);
                    const tdto = new Inputs.JSCAD.TextDto();
                    tdto.text = `${edge.edge_index}`;
                    tdto.height = inputs.edgeIndexHeight;
                    tdto.lineSpacing = 1.5;
                    const t = this.solidText.createVectorText(tdto);
                    const texts = t.map(s => {
                        const res = s.map(c => {
                            return [
                                c[0],
                                c[1] + 0.05,
                                0];
                        });
                        const movedOnPosition = res.map(r => this.vector.add({ first: r, second: edgeMiddle }));
                        return movedOnPosition;
                    });

                    texts.forEach(te => textPolylines.push(te));
                });

                const edgeMesh = this.geometryHelper.drawPolylines(null, textPolylines, false, 0.2, 1, inputs.edgeIndexColour);
                edgeMesh.parent = shapeMesh;
                edgeMesh.material.zOffset = -2;
            }
            if (inputs.drawFaceIndexes) {
                const textPolylines: number[][][] = [];
                fe.faceList.forEach(face => {
                    const faceMiddle = this.computeFaceMiddlePos(face.vertex_coord_vec);
                    const tdto = new Inputs.JSCAD.TextDto();
                    tdto.text = `${face.face_index}`;
                    tdto.height = inputs.faceIndexHeight;
                    tdto.lineSpacing = 1.5;
                    const t = this.solidText.createVectorText(tdto);
                    const texts = t.map(s => {
                        const res = s.map(c => {
                            return [
                                c[0],
                                c[1] + 0.05,
                                0];
                        });
                        const movedOnPosition = res.map(r => this.vector.add({ first: r, second: faceMiddle }));
                        return movedOnPosition;
                    });
                    texts.forEach(te => textPolylines.push(te));
                });

                const faceMesh = this.geometryHelper.drawPolylines(null, textPolylines, false, 0.2, 1, inputs.faceIndexColour);
                faceMesh.parent = shapeMesh;
                faceMesh.material.zOffset = -2;
            }
            return shapeMesh;
        });
    }

    /**
     * This needs to be done before every run and the promise needs to be awaited before run executes again
     * This makes sure that cache keeps the objects and hashes from the previous run and the rest is deleted
     * In this way it is possible to hace the cache of manageable size
     */
    cleanUpCache(): Promise<any> {
        return this.genericCallToWorkerPromise('startedTheRun', {});
    }

    /**
     * Creates OpenCascade Polygon wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createPolygonWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createpolygonwire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     */
    createPolygonWire(inputs: Inputs.OCC.PolygonDto): Promise<any> {
        return this.genericCallToWorkerPromise('createPolygonWire', inputs);
    }

    /**
     * Creates OpenCascade Polygon face
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createPolygonFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createpolygonface
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     */
    createPolygonFace(inputs: Inputs.OCC.PolygonDto): Promise<any> {
        return this.genericCallToWorkerPromise('createPolygonFace', inputs);
    }

    /**
     * Creates OpenCascade Box
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBox.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbox
     * @param inputs Box size and center
     * @returns OpenCascade Box
     */
    createBox(inputs: Inputs.OCC.BoxDto): Promise<any> {
        return this.genericCallToWorkerPromise('createBox', inputs);
    }

    /**
     * Creates OpenCascade Cylinder
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCylinder.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylinder(inputs: Inputs.OCC.CylinderDto): Promise<any> {
        return this.genericCallToWorkerPromise('createCylinder', inputs);
    }

    /**
     * Creates OpenCascade BSPline wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBSpline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbspline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    createBSpline(inputs: Inputs.OCC.BSplineDto): Promise<any> {
        return this.genericCallToWorkerPromise('createBSpline', inputs);
    }

    /**
     * Creates OpenCascade Bezier wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBezier.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbezier
     * @param inputs Points through which to make bezier curve
     * @returns OpenCascade Bezier wire
     */
    createBezier(inputs: Inputs.OCC.BezierDto): Promise<any> {
        return this.genericCallToWorkerPromise('createBezier', inputs);
    }

    /**
     * Creates OpenCascade circle wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCircleWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcirclewire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     */
    createCircleWire(inputs: Inputs.OCC.CircleDto): Promise<any> {
        return this.genericCallToWorkerPromise('createCircleWire', inputs);
    }

    /**
     * Creates OpenCascade circle face
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCircleFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcircleface
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     */
    // TODO
    createCircleFace(inputs: Inputs.OCC.CircleDto): Promise<any> {
        return this.genericCallToWorkerPromise('createCircleFace', inputs);
    }

    /**
     * Lofts wires into a shell
     * <div>
     *  <img src="../assets/images/blockly-images/occ/loft.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#loft
     * @param inputs Circle parameters
     * @returns Resulting loft shell
     */
    loft(inputs: Inputs.OCC.LoftDto): Promise<any> {
        return this.genericCallToWorkerPromise('loft', inputs);
    }

    /**
     * Offset for various shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/offset.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#offset
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     */
    offset(inputs: Inputs.OCC.OffsetDto): Promise<any> {
        return this.genericCallToWorkerPromise('offset', inputs);
    }

    /**
     * Extrudes the face along direction
     * <div>
     *  <img src="../assets/images/blockly-images/occ/extrude.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#extrude
     * @param inputs Shape to extrude and direction parameter with tolerance
     * @returns Resulting extruded shape
     */
    extrude(inputs: Inputs.OCC.ExtrudeDto): Promise<any> {
        return this.genericCallToWorkerPromise('extrude', inputs);
    }

    /**
     * Revolves the shape around the given direction
     * <div>
     *  <img src="../assets/images/blockly-images/occ/revolve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#revolve
     * @param inputs Revolve parameters
     * @returns Resulting revolved shape
     */
    revolve(inputs: Inputs.OCC.RevolveDto): Promise<any> {
        return this.genericCallToWorkerPromise('revolve', inputs);
    }

    /**
     * Creates OpenCascade Sphere
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createsphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     */
    createSphere(inputs: Inputs.OCC.SphereDto): Promise<any> {
        return this.genericCallToWorkerPromise('createSphere', inputs);
    }

    /**
     * Creates OpenCascade Cone
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCone.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     */
    createCone(inputs: Inputs.OCC.ConeDto): Promise<any> {
        return this.genericCallToWorkerPromise('createCone', inputs);
    }

    /**
     * Fillets OpenCascade Shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/filletEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#filletedges
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     */
    filletEdges(inputs: Inputs.OCC.FilletDto): Promise<any> {
        return this.genericCallToWorkerPromise('filletEdges', inputs);
    }

    /**
     * Chamfer OpenCascade Shape edges
     * <div>
     *  <img src="../assets/images/blockly-images/occ/chamferEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#chamferedges
     * @param inputs Shape, distance and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     */
    chamferEdges(inputs: Inputs.OCC.ChamferDto): Promise<any> {
        return this.genericCallToWorkerPromise('chamferEdges', inputs);
    }

    /**
     * Joins separate objects
     * <div>
     *  <img src="../assets/images/blockly-images/occ/union.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#union
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     */
    union(inputs: Inputs.OCC.UnionDto): Promise<any> {
        return this.genericCallToWorkerPromise('union', inputs);
    }

    /**
     * Does boolean difference operation between a main shape and given shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/difference.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    difference(inputs: Inputs.OCC.DifferenceDto): Promise<any> {
        return this.genericCallToWorkerPromise('difference', inputs);
    }

    /**
     * Does boolean intersection operation between a main shape and given shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/difference.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    intersection(inputs: Inputs.OCC.IntersectionDto): Promise<any> {
        return this.genericCallToWorkerPromise('intersection', inputs);
    }

    /**
     * Removes internal faces for the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#removeinternaledges
     * @param inputs Shape
     * @returns OpenCascade shape with no internal edges
     */
    removeInternalEdges(inputs: Inputs.OCC.ShapeDto): Promise<any> {
        return this.genericCallToWorkerPromise('removeInternalEdges', inputs);
    }

    /**
     * Gets the edge by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occ/getEdge.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#getedge
     * @param inputs Shape
     * @returns OpenCascade edge
     */
    getEdge(inputs: Inputs.OCC.ShapeIndexDto): Promise<any> {
        return this.genericCallToWorkerPromise('getEdge', inputs);
    }

    /**
     * Gets the wire by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occ/getWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#getwire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    getWire(inputs: Inputs.OCC.ShapeIndexDto): Promise<any> {
        return this.genericCallToWorkerPromise('getWire', inputs);
    }

    /**
     * Gets the face by providing an index from the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occ/getFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#getface
     * @param inputs Shape
     * @returns OpenCascade face
     */
    getFace(inputs: Inputs.OCC.ShapeIndexDto): Promise<any> {
        return this.genericCallToWorkerPromise('getFace', inputs);
    }

    /**
     * Rotated extrude that is perofrmed on the wire shape
     * <div>
     *  <img src="../assets/images/blockly-images/occ/rotatedExtrude.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#rotatedextrude
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     */
    rotatedExtrude(inputs: Inputs.OCC.RotationExtrudeDto): Promise<any> {
        return this.genericCallToWorkerPromise('rotatedExtrude', inputs);
    }
    /**
     * Pipe shapes along the wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/pipe.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#pipe
     * @param inputs Path wire and shapes along the path
     * @returns OpenCascade shape
     */
    pipe(inputs: Inputs.OCC.PipeDto): Promise<any> {
        return this.genericCallToWorkerPromise('pipe', inputs);
    }

    /**
     * Transforms the array of shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/transform.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#transform
     * @param inputs Transformation description
     * @returns OpenCascade shapes
     */
    transform(inputs: Inputs.OCC.TransformDto): Promise<any> {
        return this.genericCallToWorkerPromise('transform', inputs);
    }


    /**
     * Rotate the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/rotate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#rotate
     * @param inputs Rotation description
     * @returns OpenCascade shapes
     */
    rotate(inputs: Inputs.OCC.RotateDto): Promise<any> {
        return this.genericCallToWorkerPromise('rotate', inputs);
    }


    /**
     * Translates the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/translate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#translate
     * @param inputs Translation description
     * @returns OpenCascade shapes
     */
    translate(inputs: Inputs.OCC.TranslateDto): Promise<any> {
        return this.genericCallToWorkerPromise('translate', inputs);
    }

    /**
     * Scales the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/scale.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#scale
     * @param inputs Scale description
     * @returns OpenCascade shapes
     */
    scale(inputs: Inputs.OCC.ScaleDto): Promise<any> {
        return this.genericCallToWorkerPromise('scale', inputs);
    }

    /**
     * Makes the compound shape, which can include any kind of shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/makeCompound.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#makecompound
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     */
    makeCompound(inputs: Inputs.OCC.ScaleDto): Promise<any> {
        return this.genericCallToWorkerPromise('makeCompound', inputs);
    }

    /**
     * Saves the step file
     * <div>
     *  <img src="../assets/images/blockly-images/occ/saveShapeSTEP.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#saveshapestep
     * @param inputs STEP filename and shape to be saved
     * @returns String of a step file
     */
    saveShapeSTEP(inputs: Inputs.OCC.SaveStepDto): Promise<string> {
        return this.genericCallToWorkerPromise('saveShapeSTEP', inputs).then(s => {
            const blob = new Blob([s], { type: 'text/plain' });
            const blobUrl = URL.createObjectURL(blob);

            const fileLink = document.createElement('a');
            fileLink.href = blobUrl;
            fileLink.target = '_self';
            fileLink.download = 'bitbybit-dev.step';
            fileLink.click();
            fileLink.remove();
            return s;
        });
    }

    importSTEPorIGES(inputs: Inputs.OCC.ImportStepIgesDto): Promise<any> {
        // first we should check if we have assetName loaded already
        // if we dont have we do this, otherwise return from the cache...
        return BitByBitBlocklyHelperService.getFile().then(s => {
            return this.genericCallToWorkerPromise(
                'importSTEPorIGES',
                new Inputs.OCC.ImportStepOrIgesDto(s, inputs.assetName)
            );
        });
    }

    private computeFaceMiddlePos(vertexCoordVec: number[][]): number[] {
        let x = 0;
        let y = 0;
        let z = 0;

        let realLength = 0;
        vertexCoordVec.forEach(v => {
            x += v[0];
            y += v[1];
            z += v[2];
            realLength++;
        });

        return [x / realLength, y / realLength, z / realLength];
    }

    private computeEdgeMiddlePos(edge: { edge_index: number; vertex_coord: number[][]; }): number[] {
        let pos;
        if (edge.vertex_coord.length === 2) {
            const midFloor = edge.vertex_coord[0];
            const midCeil = edge.vertex_coord[1];
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        } else if (edge.vertex_coord.length === 3) {
            pos = edge.vertex_coord[1];
        } else {
            const midFloor = edge.vertex_coord[Math.floor(edge.vertex_coord.length / 2)];
            const midCeil = edge.vertex_coord[Math.floor(edge.vertex_coord.length / 2 + 1)];
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        }
        return pos;
    }
}
