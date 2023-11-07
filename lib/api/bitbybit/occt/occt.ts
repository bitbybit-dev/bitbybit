
import { Color3, Mesh, PBRMetallicRoughnessMaterial } from "@babylonjs/core";
import { Context } from "../../context";
import { GeometryHelper } from "../../geometry-helper";
import * as Inputs from "../../inputs/inputs";
import { JSCADText } from "../jscad/text";
import { Vector } from "../vector";
import { OCCTWIO } from "./io";
import { OCCTWorkerManager, OCCT } from "@bitbybit-dev/occt-worker";

/**
 * Contains various methods for OpenCascade implementation
 */
export class OCCTW extends OCCT {
    override readonly io: OCCTWIO;

    private usedMaterials: {
        hex: string,
        alpha: number,
        zOffset: number,
        material: PBRMetallicRoughnessMaterial
    }[] = [];

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
        const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        return this.handleDecomposedMesh(inputs, decomposedMesh, options);
    }

    /**
     * Draws OpenCascade shape by going through faces and edges
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     * @group drawing
     * @shortname draw shape
     * @drawable false
     * @ignore true
     */
    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Mesh> {
        const options = { ...inputs };
        if (inputs.faceMaterial) {
            delete inputs.faceMaterial;
        }
        const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);
        const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(inputs, decomposedMesh, options)));
        const shapesMeshContainer = new Mesh("shapesMeshContainer", this.context.scene);
        meshesSolved.forEach(mesh => {
            mesh.parent = shapesMeshContainer;
        });
        return shapesMeshContainer;
    }

    private async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: { shape?: Inputs.OCCT.TopoDSShapePointer; faceOpacity: number; edgeOpacity: number; edgeColour: string; faceMaterial?: any; faceColour: string; edgeWidth: number; drawEdges: boolean; drawFaces: boolean; precision: number; drawEdgeIndexes: boolean; edgeIndexHeight: number; edgeIndexColour: string; drawFaceIndexes: boolean; faceIndexHeight: number; faceIndexColour: string; }) {
        const shapeMesh = new Mesh("brepMesh" + Math.random(), this.context.scene);
        shapeMesh.isVisible = false;
        let dummy;

        if (inputs.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {

            let pbr;

            if (options.faceMaterial) {
                pbr = options.faceMaterial;
            } else {
                const hex = Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour;
                const alpha = inputs.faceOpacity;
                const zOffset = inputs.drawEdges ? 2 : 0;
                const materialCached = this.usedMaterials.find(s => s.hex === hex && s.alpha === alpha && s.zOffset === zOffset);
                if (materialCached) {
                    pbr = materialCached.material;
                } else {
                    const pbmat = new PBRMetallicRoughnessMaterial("pbr" + Math.random());
                    pbmat.baseColor = Color3.FromHexString(hex);
                    pbmat.metallic = 1.0;
                    pbmat.roughness = 0.6;
                    pbmat.alpha = alpha;
                    pbmat.alphaMode = 1;
                    pbmat.backFaceCulling = true;
                    pbmat.doubleSided = false;
                    pbmat.zOffset = zOffset;
                    this.usedMaterials.push({
                        hex,
                        alpha: alpha,
                        zOffset: zOffset,
                        material: pbmat
                    });
                    pbr = pbmat;
                }
            }

            const meshData = decomposedMesh.faceList.map(face => {
                return {
                    positions: face.vertex_coord,
                    normals: face.normal_coord,
                    indices: face.tri_indexes,
                    uvs: face.uvs,
                };
            });

            const mesh = this.geometryHelper.createOrUpdateSurfacesMesh(meshData, dummy, false, pbr, true, false);
            mesh.parent = shapeMesh;
        }
        if (inputs.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {
            const evs = [];
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertex_coord.filter(s => s !== undefined);
                evs.push(ev);
            });
            const mesh = this.geometryHelper.drawPolylines(dummy, evs, false, inputs.edgeWidth, inputs.edgeOpacity, inputs.edgeColour);
            mesh.parent = shapeMesh;
        }
        if (inputs.drawEdgeIndexes) {
            const promises = decomposedMesh.edgeList.map(async (edge) => {
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
                            0
                        ] as Inputs.Base.Vector3;
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
            const promises = decomposedMesh.faceList.map(async (face) => {
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
                            0
                        ] as Inputs.Base.Point3;
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
