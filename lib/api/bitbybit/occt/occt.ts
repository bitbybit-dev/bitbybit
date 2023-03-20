
import { Color3, Mesh, MeshBuilder, PBRMetallicRoughnessMaterial } from '@babylonjs/core';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { JSCADText } from '../jscad/text';
import { Vector } from '../vector';
import { OCCTWIO } from './io';
import { OCCTWorkerManager } from 'bitbybit-occt-worker/lib/occ-worker/occ-worker-manager';
import { OCCT } from 'bitbybit-occt-worker/lib/api/occt/occt';

/**
 * Contains various methods for OpenCascade implementation
 */
export class OCCTW extends OCCT {
    override readonly io: OCCTWIO;

    constructor(
        private readonly context: Context,
        override readonly occWorkerManager: OCCTWorkerManager,
        private readonly geometryHelper: GeometryHelper,
        private readonly solidText: JSCADText,
        private readonly vector: Vector,
    ) {
        super(occWorkerManager);
        this.io = new OCCTWIO(occWorkerManager, geometryHelper);
    }

    /**
     * Draws OpenCascade shape by going through faces and edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt.OCCT.html#drawShape
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     * @group drawing
     * @shortname draw shape
     * @drawable false
     * @ignore true
     */
    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Mesh> {
        const options = { ...inputs };
        if (inputs.faceMaterial) {
            delete inputs.faceMaterial;
        }
        const fe: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise('shapeToMesh', inputs);

        const shapeMesh = MeshBuilder.CreateBox('brepMesh' + Math.random(), { size: 0.00001 }, this.context.scene);
        shapeMesh.isVisible = false;
        let dummy;

        if (inputs.drawFaces && fe.faceList && fe.faceList.length) {

            let pbr;

            if (options.faceMaterial) {
                pbr = options.faceMaterial;
                pbr.zOffset = inputs.drawEdges ? 2 : 0;
            } else {
                pbr = new PBRMetallicRoughnessMaterial('pbr' + Math.random(), this.context.scene);

                pbr.baseColor = Color3.FromHexString(Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour);
                pbr.metallic = 1.0;
                pbr.roughness = 0.6;
                pbr.alpha = inputs.faceOpacity;
                pbr.alphaMode = 1;
                pbr.backFaceCulling = true;
                pbr.doubleSided = false;
                pbr.zOffset = inputs.drawEdges ? 2 : 0;
            }

            let meshData = fe.faceList.map(face => {
                return {
                    positions: face.vertex_coord,
                    normals: face.normal_coord,
                    indices: face.tri_indexes,
                };
            });

            const mesh = this.geometryHelper.createOrUpdateSurfacesMesh(meshData, dummy, false, pbr, true, false);
            mesh.parent = shapeMesh;
        }
        if (inputs.drawEdges) {
            const evs = [];
            fe.edgeList.forEach(edge => {
                const ev = edge.vertex_coord.filter(s => s !== undefined);
                evs.push(ev);
                // const mesh = this.geometryHelper.drawPolyline(
                //     dummy,
                //     ev,
                //     false,
                //     inputs.edgeWidth,
                //     inputs.edgeOpacity,
                //     inputs.edgeColour
                // );
                // mesh.parent = shapeMesh;
            });
            const mesh = this.geometryHelper.drawPolylines(dummy, evs, false, inputs.edgeWidth, inputs.edgeOpacity, inputs.edgeColour);
            mesh.parent = shapeMesh;
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
