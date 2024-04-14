
import * as Inputs from "../../inputs/inputs";
import { OCCTWorkerManager, OCCTIO } from "@bitbybit-dev/occt-worker";
import { BitByBitContextHelperService } from "../../../bit-by-bit-context-helper.service";
import { STLExport } from "@babylonjs/serializers";
import { GeometryHelper } from "../../geometry-helper";


export class OCCTWIO extends OCCTIO {

    constructor(
        override readonly occWorkerManager: OCCTWorkerManager,
        private readonly geometryHelper: GeometryHelper,
    ) {
        super(occWorkerManager);
    }

    /**
     * Imports the step or iges asset file
     * @param inputs STEP or IGES import
     * @group io
     * @shortname load step | iges
     * @returns OCCT Shape
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.ImportStepIgesDto): Promise<Inputs.OCCT.TopoDSShapePointer> {
        // first we should check if we have assetName loaded already
        // if we dont have we do this, otherwise return from the cache...
        return BitByBitContextHelperService.getFile(inputs.assetFile).then(s => {
            return this.occWorkerManager.genericCallToWorkerPromise(
                "io.loadSTEPorIGES",
                new Inputs.OCCT.LoadStepOrIgesDto(s, inputs.assetFile.name, inputs.adjustZtoY)
            );
        });
    }

    /**
     * Imports the step or iges asset file from text
     * @param inputs STEP or IGES import
     * @group io
     * @shortname load text step | iges
     * @returns OCCT Shape
     */
    loadSTEPorIGESFromText(inputs: Inputs.OCCT.ImportStepIgesFromTextDto): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise(
            "io.loadSTEPorIGES",
            new Inputs.OCCT.LoadStepOrIgesDto(inputs.text, `fake.${inputs.fileType}`, inputs.adjustZtoY)
        );
    }

    /**
     * Saves the stl file
     * @param inputs STL filename and shape to be saved
     * @group io
     * @shortname save stl
     * @returns String of a stl file
     */
    async saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        this.saveStl(inputs);
    }

    /**
     * Saves the stl file
     * @param inputs STL filename and shape to be saved
     * @group io
     * @shortname save stl and return
     * @returns String of a stl file
     */
    async saveShapeStlAndReturn(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string | DataView> {
        return this.saveStl(inputs);
    }

    private async saveStl(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string | DataView> {
        const inp = new Inputs.OCCT.DrawShapeDto();
        inp.drawEdges = false;
        inp.shape = inputs.shape;
        inp.precision = inputs.precision;

        const fe: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inp);

        let dummy;

        const faceMeshes = fe.faceList.map(face => {
            const mesh = this.geometryHelper.createOrUpdateSurfaceMesh({
                positions: face.vertex_coord,
                normals: face.normal_coord,
                indices: face.tri_indexes,
            }, dummy, false, undefined, true, false);
            return mesh;
        });

        if (inputs.fileName.includes(".stl")) {
            inputs.fileName = inputs.fileName.replace(".stl", "");
        }
        let res;
        if (document && inputs.tryDownload) {
            res = STLExport.CreateSTL(faceMeshes, true, inputs.fileName, inputs.binary, true, true);
        } else {
            res = STLExport.CreateSTL(faceMeshes, false, inputs.fileName, inputs.binary, true, true);
        }
        faceMeshes.forEach(fm => fm.dispose());
        return res;
    }
}
