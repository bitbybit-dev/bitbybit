import { OpenCascadeInstance, STEPControl_StepModelType } from "opencascade.js";
import { OccHelper } from "../occ-helper";
import * as Inputs from '../../../api/inputs/inputs';

export class OCCTIO {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto): { result: string } {
        inputs.filename = 'x';
        const writer = new this.occ.STEPControl_Writer_1();
        // Convert to a .STEP File
        const transferResult = writer.Transfer(inputs.shape, (this.occ.STEPControl_StepModelType.STEPControl_AsIs as STEPControl_StepModelType), true, new this.occ.Message_ProgressRange_1());
        if (transferResult === this.occ.IFSelect_ReturnStatus.IFSelect_RetDone) {
            // Write the STEP File to the virtual Emscripten Filesystem Temporarily
            const writeResult = writer.Write(inputs.filename);
            if (writeResult === this.occ.IFSelect_ReturnStatus.IFSelect_RetDone) {
                // Read the STEP File from the filesystem and clean up
                const stepFileText = this.occ.FS.readFile('/' + inputs.filename, { encoding: 'utf8' });
                this.occ.FS.unlink('/' + inputs.filename);

                // Return the contents of the STEP File
                return { result: stepFileText };
            } else {
                throw (new Error('Failed when writing step file.'));
            }
        } else {
            throw (new Error('Failed when transfering to step writer.'));
        }
    }


    /** This function parses the ASCII contents of a `.STEP` or `.IGES`
     * File as a Shape into the `externalShapes` dictionary.
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.LoadStepOrIgesDto): any {
        const fileName = inputs.filename;
        const fileText = inputs.filetext;
        const fileType = (() => {
            switch (fileName.toLowerCase().split(".").pop()) {
                case "step":
                case "stp":
                    return "step";
                case "iges":
                case "igs":
                    return "iges";
                default:
                    return undefined;
            }
        })();
        // Writes the uploaded file to Emscripten's Virtual Filesystem
        this.occ.FS.createDataFile("/", `file.${fileType}`, fileText, true, true, true);

        // Choose the correct OpenCascade file parsers to read the CAD file
        var reader = null;
        if (fileType === "step") {
            reader = new this.occ.STEPControl_Reader_1();
        } else if (fileType === "iges") {
            reader = new this.occ.IGESControl_Reader_1();
        } else { console.error("opencascade.js can't parse this extension! (yet)"); }
        const readResult = reader.ReadFile(`file.${fileType}`);            // Read the file
        if (readResult === this.occ.IFSelect_ReturnStatus.IFSelect_RetDone) {
            console.log("file loaded successfully!     Converting to OCC now...");
            const numRootsTransferred = reader.TransferRoots(new this.occ.Message_ProgressRange_1());    // Translate all transferable roots to OpenCascade
            const stepShape = reader.OneShape();         // Obtain the results of translation in one OCCT shape
            console.log(fileName + " converted successfully!  Triangulating now...");

            // Out with the old, in with the new!

            // Remove the file when we're done (otherwise we run into errors on reupload)
            this.occ.FS.unlink(`/file.${fileType}`);
            return stepShape;
        } else {
            console.error("Something in OCCT went wrong trying to read " + fileName);
        }
    }
}
