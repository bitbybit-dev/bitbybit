
import { Context } from "./context";
import * as Inputs from "./inputs";
import { Vector } from "@bitbybit-dev/core";
import { JSCADWorkerManager } from "@bitbybit-dev/core/lib/workers";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { BufferAttribute, BufferGeometry, Group, Mesh, MeshNormalMaterial } from "three";

export class DrawHelper {

    constructor(
        private readonly context: Context,
        private readonly vector: Vector,
        private readonly jscadWorkerManager: JSCADWorkerManager,
        private readonly occWorkerManager: OCCTWorkerManager) {
    }
    /**
     * Draws OpenCascade shape by going through faces and edges
     * @param inputs Contains a shape to be drawn and additional information
     * @returns ThreeJS Group
     * @group drawing
     * @shortname draw shape
     * @drawable false
     * @ignore true
     */
    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Group> {
        const options = { ...inputs };
        if (inputs.faceMaterial) {
            delete inputs.faceMaterial;
        }
        const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        return this.handleDecomposedMesh(inputs, decomposedMesh, options);
    }

    private async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: { shape?: Inputs.OCCT.TopoDSShapePointer; faceOpacity: number; edgeOpacity: number; edgeColour: string; faceMaterial?: any; faceColour: string; edgeWidth: number; drawEdges: boolean; drawFaces: boolean; precision: number; drawEdgeIndexes: boolean; edgeIndexHeight: number; edgeIndexColour: string; drawFaceIndexes: boolean; faceIndexHeight: number; faceIndexColour: string; }) {
        const material = new MeshNormalMaterial();
        const geometries = this.createGeometries(decomposedMesh);

        const group = new Group();
        geometries.forEach(geometry => {
            group.add(new Mesh(geometry, material));
        });
        group.name = "shape";
        this.context.scene.add(group);
        return group;
    }

    createGeometries(decomposedMesh: Inputs.OCCT.DecomposedMeshDto): BufferGeometry[] {
        const geometries: BufferGeometry[] = [];
        const res: Inputs.OCCT.DecomposedMeshDto = decomposedMesh;
        const meshData = res.faceList.map(face => {
            return {
                positions: face.vertex_coord,
                normals: face.normal_coord,
                indices: face.tri_indexes,
            };
        });

        meshData.forEach(mesh => {
            const geometry = new BufferGeometry();
            geometry.setAttribute("position", new BufferAttribute(Float32Array.from(mesh.positions), 3));
            geometry.setAttribute("normal", new BufferAttribute(Float32Array.from(mesh.normals), 3));
            geometry.setIndex(new BufferAttribute(Uint32Array.from(mesh.indices), 1));
            geometries.push(geometry);
        });

        return geometries;
    }

}
