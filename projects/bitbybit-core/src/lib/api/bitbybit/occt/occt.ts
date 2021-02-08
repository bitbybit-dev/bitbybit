import { Injectable } from '@angular/core';
import { Mesh, MeshBuilder } from '@babylonjs/core';
import { BitByBitBlocklyHelperService } from '../../../bit-by-bit-blockly-helper.service';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { JSCADText } from '../jscad-text';
import { Vector } from '../vector';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';
import { OCCTShapes } from './shapes/shapes';
import { OCCTransforms } from './transforms';
import { OCCTOperations } from './operations';
import { OCCTBooleans } from './booleans';
import { OCCTIO } from './io';

/**
 * Contains various methods for OpenCascade implementation
 * Much of the work is done by Johnathon Selstad and Sebastian Alff to port OCC to JavaScript
 * I'm super grateful for their work!
 */
@Injectable()
export class OCCT {

    constructor(
        public readonly shapes: OCCTShapes,
        public readonly transforms: OCCTransforms,
        public readonly operations: OCCTOperations,
        public readonly booleans: OCCTBooleans,
        public readonly io: OCCTIO,
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper,
        private readonly solidText: JSCADText,
        private readonly vector: Vector,
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Draws OpenCascade shape by going through faces and edges
     * <div>
     *  <img src="../assets/images/blockly-images/occt/drawShape.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt.occt.html#drawshape
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     */
    drawShape(inputs: Inputs.OCC.DrawShapeDto): Promise<Mesh> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapeToMesh', inputs).then((fe: {
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
