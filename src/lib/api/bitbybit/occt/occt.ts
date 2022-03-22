
import { Color3, Mesh, MeshBuilder, PBRMetallicRoughnessMaterial } from '@babylonjs/core';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { JSCADText } from '../jscad/text';
import { Vector } from '../vector';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';
import { OCCTShapes } from './shapes/shapes';
import { OCCTTransforms } from './transforms';
import { OCCTOperations } from './operations';
import { OCCTBooleans } from './booleans';
import { OCCTIO } from './io';
import { OCCTGeom } from './geom/geom';

/**
 * Contains various methods for OpenCascade implementation
 * Much of the work is done by Johnathon Selstad and Sebastian Alff to port OCC to JavaScript
 * I'm super grateful for their work!
 */

export class OCCT {

    public readonly shapes: OCCTShapes;
    public readonly geom: OCCTGeom;
    public readonly transforms: OCCTTransforms;
    public readonly operations: OCCTOperations;
    public readonly booleans: OCCTBooleans;
    public readonly io: OCCTIO;

    constructor(
        private readonly context: Context,
        private readonly occWorkerManager: OCCTWorkerManager,
        private readonly geometryHelper: GeometryHelper,
        private readonly solidText: JSCADText,
        private readonly vector: Vector,
    ) {
        this.shapes = new OCCTShapes(occWorkerManager);
        this.geom = new OCCTGeom(occWorkerManager);
        this.transforms = new OCCTTransforms(occWorkerManager);
        this.operations = new OCCTOperations(occWorkerManager);
        this.booleans = new OCCTBooleans(occWorkerManager);
        this.io = new OCCTIO(occWorkerManager);
    }

    /**
     * Draws OpenCascade shape by going through faces and edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt.OCCT.html#drawShape
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     */
    async drawShape(inputs: Inputs.OCCT.DrawShapeDto): Promise<Mesh> {
        const fe: {
            faceList: {
                face_index: number;
                normal_coord: Inputs.Base.Vector3;
                number_of_triangles: number;
                tri_indexes: number[];
                vertex_coord: Inputs.Base.Point3;
                vertex_coord_vec: Inputs.Base.Vector3[];
            }[],
            edgeList: {
                edge_index: number;
                vertex_coord: Inputs.Base.Point3[];
            }[]
        } = await this.occWorkerManager.genericCallToWorkerPromise('shapeToMesh', inputs);

        const shapeMesh = MeshBuilder.CreateBox('brepMesh' + Math.random(), { size: 0.00001 }, this.context.scene);
        shapeMesh.isVisible = false;
        let dummy;

        if (inputs.drawFaces) {

            const pbr = new PBRMetallicRoughnessMaterial('pbr' + Math.random(), this.context.scene);

            pbr.baseColor = Color3.FromHexString(Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour);
            pbr.metallic = 1.0;
            pbr.roughness = 0.6;
            pbr.alpha = inputs.faceOpacity;
            pbr.alphaMode = 1;
            pbr.backFaceCulling = true;
            pbr.doubleSided = false;
            pbr.zOffset = inputs.drawEdges ? 2 : 0;

            fe.faceList.forEach(face => {
                const mesh = this.geometryHelper.createOrUpdateSurfaceMesh({
                    positions: face.vertex_coord,
                    normals: face.normal_coord,
                    indices: face.tri_indexes,
                }, dummy, false, pbr);
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
            const promises = fe.edgeList.map(async edge => {
                const edgeMiddle = this.computeEdgeMiddlePos(edge);
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${edge.edge_index}`;
                tdto.height = inputs.edgeIndexHeight;
                tdto.lineSpacing = 1.5;
                const t = await this.solidText.createVectorText(tdto);
                const texts = t.map(s => {
                    const res = s.map(c => {
                        return [
                            c[0],
                            c[1] + 0.05,
                            0] as Inputs.Base.Vector3;
                    });
                    const movedOnPosition = res.map(r => this.vector.add({ first: r, second: edgeMiddle }));
                    return movedOnPosition;
                });

                // texts.forEach(te => textPolylines.push(te));
                return texts;
            });
            const textPolylines = await Promise.all(promises);
            const edgeMesh = this.geometryHelper.drawPolylines(null, textPolylines.flat(), false, 0.2, 1, inputs.edgeIndexColour);
            edgeMesh.parent = shapeMesh;
            edgeMesh.material.zOffset = -2;
        }
        if (inputs.drawFaceIndexes) {
            // const textPolylines: number[][][] = [];
            const promises = fe.faceList.map(async face => {
                const faceMiddle = this.computeFaceMiddlePos(face.vertex_coord_vec) as Inputs.Base.Point3;
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${face.face_index}`;
                tdto.height = inputs.faceIndexHeight;
                tdto.lineSpacing = 1.5;
                const t = await this.solidText.createVectorText(tdto);
                const texts = t.map(s => {
                    const res = s.map(c => {
                        return [
                            c[0],
                            c[1] + 0.05,
                            0] as Inputs.Base.Point3;
                    });
                    const movedOnPosition = res.map(r => this.vector.add({ first: r, second: faceMiddle }));
                    return movedOnPosition;
                });
                // texts.forEach(te => textPolylines.push(te));
                return texts;
            });
            const textPolylines = await Promise.all(promises);

            const faceMesh = this.geometryHelper.drawPolylines(null, textPolylines.flat(), false, 0.2, 1, inputs.faceIndexColour);
            faceMesh.parent = shapeMesh;
            if (inputs.drawEdges) {
                faceMesh.material.zOffset = -2;
            }
        }
        return shapeMesh;
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

    private computeEdgeMiddlePos(edge: { edge_index: number; vertex_coord: Inputs.Base.Point3[]; }): Inputs.Base.Point3 {
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
