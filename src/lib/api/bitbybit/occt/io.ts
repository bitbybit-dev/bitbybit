
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';
import { BitByBitBlocklyHelperService } from '../../../bit-by-bit-blockly-helper.service';
import { STLExport } from '@babylonjs/serializers';
import { GeometryHelper } from '../../geometry-helper';


export class OCCTIO {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
        private readonly geometryHelper: GeometryHelper,
    ) {
    }

    /**
     * Saves the step file
     * <div>
     *  <img src="../assets/images/blockly-images/occt/io/saveShapeSTEP.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_io.OCCTIO.html#saveShapeSTEP
     * @param inputs STEP filename and shape to be saved
     * @returns String of a step file
     */
    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto): Promise<string> {
        return this.occWorkerManager.genericCallToWorkerPromise('io.saveShapeSTEP', inputs).then(s => {
            const blob = new Blob([s], { type: 'text/plain' });
            const blobUrl = URL.createObjectURL(blob);

            const fileName = inputs.filename ? inputs.filename : 'bitbybit-dev.step';

            const fileLink = document.createElement('a');
            fileLink.href = blobUrl;
            fileLink.target = '_self';
            fileLink.download = fileName;
            fileLink.click();
            fileLink.remove();
            return s;
        });
    }

    /**
     * Imports the step or iges asset file
     * <div>
     *  <img src="../assets/images/blockly-images/occt/io/loadSTEPorIGES.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_io.OCCTIO.html#loadSTEPorIGES
     * @param inputs STEP or IGES import
     * @returns OCCT Shape
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.ImportStepIgesDto): Promise<any> {
        // first we should check if we have assetName loaded already
        // if we dont have we do this, otherwise return from the cache...
        return BitByBitBlocklyHelperService.getFile(inputs.assetFile).then(s => {
            return this.occWorkerManager.genericCallToWorkerPromise(
                'io.loadSTEPorIGES',
                new Inputs.OCCT.LoadStepOrIgesDto(s, inputs.assetFile.name)
            );
        });
    }

    /**
     * Saves the stl file
     * <div>
     *  <img src="../assets/images/blockly-images/occt/io/saveShapeStl.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_io.OCCTIO.html#saveShapeStl
     * @param inputs STL filename and shape to be saved
     * @returns String of a stl file
     */
    async saveShapeStl(inputs: Inputs.OCCT.SaveStlDto): Promise<any> {
        const inp = new Inputs.OCCT.DrawShapeDto();
        inp.drawEdges = false;
        inp.shape = inputs.shape;
        inp.precision = inputs.precision;

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
        } = await this.occWorkerManager.genericCallToWorkerPromise('shapeToMesh', inp);

        let dummy;

        const faceMeshes = fe.faceList.map(face => {
            const mesh = this.geometryHelper.createOrUpdateSurfaceMesh({
                positions: face.vertex_coord,
                normals: face.normal_coord,
                indices: face.tri_indexes,
            }, dummy, false, undefined, false);
            return mesh;
        });

        STLExport.CreateSTL(faceMeshes, true, inputs.filename, true, true, true);
        faceMeshes.forEach(fm => fm.dispose());
        return fe;
    }
}
