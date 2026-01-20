
import * as Inputs from "../../inputs";
import { OCCTWorkerManager, OCCTIO } from "@bitbybit-dev/occt-worker";
import { ContextBase } from "../../context";

export class OCCTWIO extends OCCTIO {

    constructor(
        override readonly occWorkerManager: OCCTWorkerManager,
        private readonly context: ContextBase,
        // private readonly drawHelper: DrawHelper,
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
        return this.context.getFile(inputs.assetFile).then(s => {
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

}
