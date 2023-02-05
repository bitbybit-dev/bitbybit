
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from 'bitbybit-occt-worker/lib/occ-worker/occ-worker-manager';
import { OCCTIO } from 'bitbybit-occt-worker/lib/api/occt/io';
import { BitByBitBlocklyHelperService } from '../../../bit-by-bit-blockly-helper.service';
import { STLExport } from '@babylonjs/serializers';
import { GeometryHelper } from '../../geometry-helper';


export class OCCTWIO extends OCCTIO {

    constructor(
        override readonly occWorkerManager: OCCTWorkerManager,
        private readonly geometryHelper: GeometryHelper,
    ) {
        super(occWorkerManager);
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
    loadSTEPorIGES(inputs: Inputs.OCCT.ImportStepIgesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        // first we should check if we have assetName loaded already
        // if we dont have we do this, otherwise return from the cache...
        return BitByBitBlocklyHelperService.getFile(inputs.assetFile).then(s => {
            return this.occWorkerManager.genericCallToWorkerPromise(
                'io.loadSTEPorIGES',
                new Inputs.OCCT.LoadStepOrIgesDto(s, inputs.assetFile.name, inputs.adjustZtoY)
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
    async saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto> {
        const inp = new Inputs.OCCT.DrawShapeDto();
        inp.drawEdges = false;
        inp.shape = inputs.shape;
        inp.precision = inputs.precision;

        const fe: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise('shapeToMesh', inp);

        let dummy;

        const faceMeshes = fe.faceList.map(face => {
            const mesh = this.geometryHelper.createOrUpdateSurfaceMesh({
                positions: face.vertex_coord,
                normals: face.normal_coord,
                indices: face.tri_indexes,
            }, dummy, false, undefined, false, false);
            return mesh;
        });

        STLExport.CreateSTL(faceMeshes, true, inputs.filename, true, true, true);
        faceMeshes.forEach(fm => fm.dispose());
        return fe;
    }
}
