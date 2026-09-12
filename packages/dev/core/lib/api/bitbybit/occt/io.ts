
import * as Inputs from "../../inputs";
import { OCCTWorkerManager, OCCTIO } from "@bitbybit-dev/occt-worker";
import { ContextBase } from "../../context";

/**
 * Reading and writing CAD files with OCCT: everything `io` offers on the kernel, plus loaders that
 * take a STEP or IGES file as a File object or as its text and give back a shape. Files are Z-up by
 * convention, so `adjustZtoY` turns the loaded shape to this library's Y-up unless it is set false.
 */
export class OCCTWIO extends OCCTIO {

    constructor(
        override readonly occWorkerManager: OCCTWorkerManager,
        private readonly context: ContextBase,
    ) {
        super(occWorkerManager);
    }

    /**
     * Reads a STEP or IGES file, given as a File, into one shape.
     *
     * The file's extension decides the kind: `.step`, `.stp` are STEP, `.iges`, `.igs` are IGES.
     * `adjustZtoY` turns the file's Z-up into Y-up. A file that cannot be read gives undefined.
     * @param inputs - The file and the axis adjustment
     * @returns The loaded shape
     * @group io
     * @shortname load step | iges
     * @example
     * ```typescript
     * const file = await bitbybit.asset.getFile({ fileName: "part.step" });
     * const shape = await bitbybit.occt.io.loadSTEPorIGES({ assetFile: file, adjustZtoY: true });
     * await bitbybit.draw.drawAnyAsync({ entity: shape });
     * ```
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.ImportStepIgesDto): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.context.getFile(inputs.assetFile).then(s => {
            return this.occWorkerManager.genericCallToWorkerPromise(
                "io.loadSTEPorIGES",
                new Inputs.OCCT.LoadStepOrIgesDto(s, inputs.assetFile.name, inputs.adjustZtoY)
            );
        });
    }

    /**
     * Reads a STEP or IGES file, given as its text, into one shape; `fileType` says which of the
     * two formats the text is in.
     *
     * `adjustZtoY` turns the file's Z-up into Y-up. Text that cannot be read gives undefined.
     * @param inputs - The file text, its format and the axis adjustment
     * @returns The loaded shape
     * @group io
     * @shortname load text step | iges
     * @example
     * ```typescript
     * const text = await bitbybit.asset.fetchText({ url: "https://example.com/models/part.step" });
     * const shape = await bitbybit.occt.io.loadSTEPorIGESFromText({ text, fileType: Bit.Inputs.OCCT.fileTypeEnum.step, adjustZtoY: true });
     * ```
     */
    loadSTEPorIGESFromText(inputs: Inputs.OCCT.ImportStepIgesFromTextDto): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise(
            "io.loadSTEPorIGES",
            new Inputs.OCCT.LoadStepOrIgesDto(inputs.text, `fake.${inputs.fileType}`, inputs.adjustZtoY)
        );
    }

}
