import { Injectable } from '@angular/core';
import { Mesh, MeshBuilder } from '@babylonjs/core';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { SolidText } from '../solid-text';
import { Tag } from '../tag';
import { Vector } from '../vector';

/**
 * Contains various methods for OpenCascade implementation
 * Much of the work is done by Johnathon Selstad and Sebastian Alff to port OCC to JavaScript
 * I'm super grateful for their work!
 */
@Injectable()
export class OCC {

    private occWorker: Worker;
    private promisesMade: { promise?: Promise<any>, uid: string, resolve?, reject?}[] = [];

    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper,
        private readonly solidText: SolidText,
        private readonly vector: Vector
    ) {
    }

    setOccWorker(worker: Worker): void {
        this.occWorker = worker;
        this.occWorker.onmessage = ({ data }) => {
            const promise = this.promisesMade.find(made => made.uid === data.uid);
            if (promise && data.result && !data.error) {
                promise.resolve(data.result);
            } else if (data.error) {
                promise.reject(data.error);
                alert(data.error);
            }
            this.promisesMade = this.promisesMade.filter(i => i.uid !== data.uid);
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
     * Draws a Brep solid
     * <div>
     *  <img src="../assets/images/blockly-images/occ/drawBrep.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#drawbrep
     * @param inputs Contains a brep to be drawn and options
     * @returns BabylonJS Mesh
     */
    drawBrep(inputs: Inputs.OCC.DrawBrepDto): Mesh {
        const brepMesh = MeshBuilder.CreateBox('brepMesh' + Math.random(), { size: 0.01 }, this.context.scene);
        brepMesh.isVisible = false;

        const ExpFace = new this.context.occ.TopExp_Explorer_1();
        for (ExpFace.Init(inputs.shape,
            this.context.occ.TopAbs_ShapeEnum.TopAbs_FACE,
            this.context.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
            ExpFace.More();
            ExpFace.Next()) {
            const myShape = ExpFace.Current();
            const myFace = this.context.occ.TopoDS.Face_1(myShape);
            let inc;
            try {
                // in case some of the faces can not been visualized
                inc = new this.context.occ.BRepMesh_IncrementalMesh_2(myFace, 0.1, false, 0.5, false);
            } catch (e) {
                console.error('face visualizi<ng failed');
                continue;
            }

            const aLocation = new this.context.occ.TopLoc_Location_1();
            const myT = this.context.occ.BRep_Tool.Triangulation(myFace, aLocation);
            if (myT.IsNull()) {
                continue;
            }


            const pc = new this.context.occ.Poly_Connect_2(myT);
            const Nodes = myT.get().Nodes();

            const vertices = new Float32Array(Nodes.Length() * 3);

            // write vertex buffer
            for (let i = Nodes.Lower(); i <= Nodes.Upper(); i++) {
                const t1 = aLocation.Transformation();
                const p = Nodes.Value(i);
                const p1 = p.Transformed(t1);
                vertices[3 * (i - 1)] = p.X();
                vertices[3 * (i - 1) + 1] = p.Y();
                vertices[3 * (i - 1) + 2] = p.Z();
                p.delete();
                t1.delete();
                p1.delete();
            }
            // write normal buffer
            const myNormal = new this.context.occ.TColgp_Array1OfDir_2(Nodes.Lower(), Nodes.Upper());
            this.context.occ.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);

            const normals = new Float32Array(myNormal.Length() * 3);
            for (let i = myNormal.Lower(); i <= myNormal.Upper(); i++) {
                const t1 = aLocation.Transformation();
                const d1 = myNormal.Value(i);
                const d = d1.Transformed(t1);

                normals[3 * (i - 1)] = d.X();
                normals[3 * (i - 1) + 1] = d.Y();
                normals[3 * (i - 1) + 2] = d.Z();

                t1.delete();
                d1.delete();
                d.delete();
            }

            myNormal.delete();

            // write triangle buffer
            const orient = myFace.Orientation_1();
            const triangles = myT.get().Triangles();

            let indices;
            const triLength = triangles.Length() * 3;
            if (triLength > 65535) {
                indices = new Uint32Array(triLength);
            }
            else {
                indices = new Uint16Array(triLength);
            }

            for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
                const t = triangles.Value(nt);
                let n1 = t.Value(1);
                let n2 = t.Value(2);
                const n3 = t.Value(3);
                if (orient !== this.context.occ.TopAbs_Orientation.TopAbs_FORWARD) {
                    const tmp = n1;
                    n1 = n2;
                    n2 = tmp;
                }

                indices[3 * (nt - 1)] = n1 - 1;
                indices[3 * (nt - 1) + 1] = n2 - 1;
                indices[3 * (nt - 1) + 2] = n3 - 1;
                t.delete();
            }

            triangles.delete();

            const mesh = this.geometryHelper.createOrUpdateSurfaceMesh({
                positions: vertices as any,
                normals: normals as any,
                indices,
            }, inputs.brepMesh, inputs.updatable, inputs.opacity, inputs.colour);

            mesh.parent = brepMesh;

            Nodes.delete();
            pc.delete();
            aLocation.delete();
            myT.delete();
            inc.delete();
            myFace.delete();
            myShape.delete();
        }
        ExpFace.delete();
        return brepMesh;
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
            }[],
            edgeList: {
                edge_index: number;
                vertex_coord: number[][];
            }[]
        }) => {
            const shapeMesh = MeshBuilder.CreateBox('brepMesh' + Math.random(), { size: 0.01 }, this.context.scene);
            shapeMesh.isVisible = false;

            if (inputs.drawFaces) {
                fe.faceList.forEach(face => {
                    const mesh = this.geometryHelper.createOrUpdateSurfaceMesh({
                        positions: face.vertex_coord,
                        normals: face.normal_coord,
                        indices: face.tri_indexes,
                    }, inputs.shapeMesh, inputs.updatable, inputs.faceOpacity, inputs.faceColour);

                });
            }
            if (inputs.drawEdges) {
                fe.edgeList.forEach(edge => {
                    const mesh = this.geometryHelper.drawPolyline(
                        inputs.linesMesh,
                        edge.vertex_coord,
                        inputs.updatable,
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
                    const tdto = new Inputs.Solid.TextDto();
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
                        const movedOnPosition = res.map(r => this.vector.add({first: r, second: edgeMiddle}));
                        return movedOnPosition;
                    });

                    texts.forEach(te => textPolylines.push(te));
                });

                const edgeMesh = this.geometryHelper.drawPolylines(null, textPolylines, false, 0.2, 1, inputs.edgeIndexColour);
                edgeMesh.parent = shapeMesh;
                edgeMesh.material.zOffset = -2;
            }
            return shapeMesh;
        });
    }

    private computeEdgeMiddlePos(edge: { edge_index: number; vertex_coord: number[][]; }) {
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
    createPolygonWire(inputs: Inputs.OCC.PolygonDto): any {
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
    createPolygonFace(inputs: Inputs.OCC.PolygonDto): any {
        return new this.context.occ.BRepBuilderAPI_MakeFace(this.createPolygonWire(inputs)).Face();
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
    createCylinder(inputs: Inputs.OCC.CylinderDto): any {
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
    createBSpline(inputs: Inputs.OCC.BSplineDto): any {
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
    createBezier(inputs: Inputs.OCC.BezierDto): any {
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
    createCircleWire(inputs: Inputs.OCC.CircleDto): any {
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
    createCircleFace(inputs: Inputs.OCC.CircleDto): any {
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
    loft(inputs: Inputs.OCC.LoftDto): any {
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
    offset(inputs: Inputs.OCC.OffsetDto): any {
        return this.genericCallToWorkerPromise('offset', inputs);
    }

    /**
     * Extrudes the face along direction
     * <div>
     *  <img src="../assets/images/blockly-images/occ/extrude.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#extrude
     * @param inputs Face to extrude and direction parameter with tolerance
     * @returns Resulting extruded solid
     */
    extrude(inputs: Inputs.OCC.ExtrudeDto): any {
        return this.genericCallToWorkerPromise('extrude', inputs);
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
    createSphere(inputs: Inputs.OCC.SphereDto): any {
        return this.genericCallToWorkerPromise('createSphere', inputs);
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
    filletEdges(inputs: Inputs.OCC.FilletDto): any {
        return this.genericCallToWorkerPromise('filletEdges', inputs);
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
    union(inputs: Inputs.OCC.UnionDto): any {
        return this.genericCallToWorkerPromise('union', inputs);
    }

    // TODO Difference inputs
    difference(inputs: any): any {
        return this.genericCallToWorkerPromise('difference', inputs);
    }
}
