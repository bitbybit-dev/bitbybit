import { IGESControl_Reader_1, OpenCascadeInstance, STEPControl_Reader_1, STEPControl_StepModelType, TopoDS_Shape } from 'opencascade.js';
import { OccHelper } from '../occ-helper';
import * as Inputs from '../../../api/inputs/inputs';

export class OCCTIO {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto<TopoDS_Shape>): { result: string } {
        let shapeToUse = inputs.shape;
        if (inputs.adjustYtoZ) {
            shapeToUse = this.och.rotate({ shape: inputs.shape, axis: [1, 0, 0], angle: -90 });
            shapeToUse = this.och.mirrorAlongNormal(
                { shape: shapeToUse, origin: [0, 0, 0], normal: [0, 0, 1] }
            );
        }
        inputs.filename = 'x';
        const writer = new this.occ.STEPControl_Writer_1();
        // Convert to a .STEP File
        const transferResult = writer.Transfer(
            shapeToUse,
            (this.occ.STEPControl_StepModelType.STEPControl_AsIs as STEPControl_StepModelType),
            true,
            new this.occ.Message_ProgressRange_1()
        );
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
    loadSTEPorIGES(inputs: Inputs.OCCT.LoadStepOrIgesDto<TopoDS_Shape>): TopoDS_Shape {
        const fileName = inputs.filename;
        const fileText = inputs.filetext;
        const fileType = (() => {
            switch (fileName.toLowerCase().split('.').pop()) {
                case 'step':
                case 'stp':
                    return 'step';
                case 'iges':
                case 'igs':
                    return 'iges';
                default:
                    return undefined;
            }
        })();
        // Writes the uploaded file to Emscripten's Virtual Filesystem
        this.occ.FS.createDataFile('/', `file.${fileType}`, fileText, true, true, true);
        // Choose the correct OpenCascade file parsers to read the CAD file
        let reader: STEPControl_Reader_1 | IGESControl_Reader_1 = null;
        if (fileType === 'step') {
            reader = new this.occ.STEPControl_Reader_1();
        } else if (fileType === 'iges') {
            reader = new this.occ.IGESControl_Reader_1();
        } else { console.error('opencascade can\'t parse this extension! (yet)'); }
        const readResult = reader.ReadFile(`file.${fileType}`);            // Read the file
        if (readResult === this.occ.IFSelect_ReturnStatus.IFSelect_RetDone) {
            // Translate all transferable roots to OpenCascade
            const numRootsTransferred = reader.TransferRoots(
                new this.occ.Message_ProgressRange_1()
            );
            let stepShape = reader.OneShape();
            if (inputs.adjustZtoY) {
                stepShape = this.och.mirrorAlongNormal(
                    { shape: stepShape, origin: [0, 0, 0], normal: [0, 0, 1] }
                );
                stepShape = this.och.rotate({ shape: stepShape, axis: [1, 0, 0], angle: 90 });
            }
            // Out with the old, in with the new!

            // Remove the file when we're done (otherwise we run into errors on reupload)
            this.occ.FS.unlink(`/file.${fileType}`);
            return stepShape;
        } else {
            console.error('Something in OCCT went wrong trying to read ' + fileName);
        }
        return undefined;
    }
}
